const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const psqlToJson = require("./psql-json");
const moment = require("moment");

const ROW_LIMIT = 100000;

async function getData(machine, from, to, offset, limit) {
    const batchQuery = `
        SELECT *
        FROM ${machine}
        WHERE created_on BETWEEN $1 AND $2
        ORDER BY created_on
        OFFSET $3
        LIMIT $4
    `;
    const queryValueArray = [from, to, offset, limit];

    try {
        const reportData = await psqlToJson(batchQuery, queryValueArray);
        
        console.log(`Sending fetched data for ${machine}...`);
        return reportData || [];
    } catch (error) {
        console.log(`Error fetching data for machine ${machine}: ${error.message}`);
        return [];
    }
}

async function generateWorkbook(machine) {
    const machineName = machine.toUpperCase();
    const folderName = "DailyReports";
    const folderPath = path.join(__dirname, folderName);

    // Calculate the 'from' and 'to' dates for yesterday
    const yesterday = moment().subtract(1, "days");
    const fromDate = yesterday.format("YYYY-MM-DD 00:00:00");
    const toDate = yesterday.format("YYYY-MM-DD 23:59:59");

    // Create the "DailyReports" folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    const batchSize = ROW_LIMIT;
    let offset = 0;
    let sheetIndex = 1;
    let hasData = false;

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
        filename: path.join(folderPath, `Reports-${machineName}-${yesterday.format("YYYY-MM-DD")}.xlsx`),
    });

    while (true) {
        console.log(`Sheet${sheetIndex} for machine ${machine}...`);
        const data = await getData(machine, fromDate, toDate, offset, batchSize);
        if (data.length === 0) {
            break;
        }

        const worksheet = workbook.addWorksheet(`Page${sheetIndex}`);

        if (offset === 0) {
            // Write headers for the first sheet
            const headers = ["S.NO", "id", "wegid", "frequency", "magnitude", "decible", "created_on"];
            worksheet.addRow(headers);
        }

        offset += data.length;
        hasData = true;

        // Format the 'created_on' field with date and time
        data.forEach((datum, index) => {
            const formattedDatum = [
                offset - data.length + index + 1,
                datum.id,
                datum.wegid,
                datum.frequency,
                datum.magnitude,
                datum.decible,
                moment(datum.created_on).format("YYYY-MM-DD HH:mm:ss"),
            ];
            worksheet.addRow(formattedDatum);
        });

        if (data.length < batchSize) {
            break;
        }

        sheetIndex++;
    }

    if (!hasData) {
        // If no data for the machine, create an empty sheet with the machine's name
        const worksheet = workbook.addWorksheet(`NoData-${machineName}`);
        worksheet.addRow([{ "S.NO": "No data available for this machine" }]);
    }

    await workbook.commit();
    console.log(`Report for machine ${machine} generated`);

    return workbook.filename;
}

async function generateDailyReports(machines) {
    try {
        for (const machine of machines) {
            console.log(`Generating report for machine: ${machine}`);
            await generateWorkbook(machine);
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    generateDailyReports,
};