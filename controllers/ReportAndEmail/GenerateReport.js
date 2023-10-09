const path = require("path");
const fs = require("fs");
const db = require("../../Database/db");
const psqlToJson = require("./psql-json");
const { jsonToExcel } = require("./json-excel");
const xlsx = require("xlsx");

//Get machine data and returns the required data.
async function getData(machine, from, to, workbook, filepath) {
    try {
        const ROW_LIMIT = 65536; // Maximum number of rows per Excel sheet
        const query = `SELECT *
            FROM $1:name
            WHERE created_on BETWEEN $2 AND $3
            ORDER BY created_on`;
        const queryValueArray = [machine, from, to];
        let rowCount = 0;
        let offset = 0;
        let sheetIndex = 1;
        let currentSheetData = [];
        let reportData = []; // Initialize reportData as an empty array

        while (true) {
            const batchQuery = `${query} OFFSET ${offset} LIMIT ${ROW_LIMIT}`;
            reportData = await psqlToJson(batchQuery, queryValueArray);

            for (const datum of reportData) {
                const sheetData = {
                    "S.NO": (rowCount += 1),
                    ...datum,
                    ...JSON.stringify(datum.data),
                };
                sheetData["created_on"] = formatDate(sheetData["created_on"]);
                let sheetDataWithUpperTitle = {};
                Object.keys(sheetData).forEach((data) => {
                    let newPair = { [data.toUpperCase()]: sheetData[data] };
                    sheetDataWithUpperTitle = { ...sheetDataWithUpperTitle, ...newPair };
                });
                currentSheetData.push(sheetDataWithUpperTitle);
            }

            if (currentSheetData.length >= ROW_LIMIT) {
                const sheetName = `Page${sheetIndex}`;
                await jsonToExcel(sheetName, currentSheetData, workbook, filepath);
                currentSheetData = [];
                sheetIndex++;
            }

            offset += ROW_LIMIT;

            if (reportData.length < ROW_LIMIT) {
                // No more data, exit the loop
                break;
            }
        }

        if (currentSheetData.length > 0 || reportData.length === 0) {
            const sheetName = `Page${sheetIndex}`;
            await jsonToExcel(sheetName, currentSheetData, workbook, filepath);
        }
    } catch (error) {
        console.log(error.message);
    }
}

const filepath = [];

async function getreport(from, to, machines) {
    try {
        const workbookPromises = machines.map(async (machine) => {
            const workbook = xlsx.utils.book_new();
            const machineName = machine.toUpperCase(); // Assuming machine names are in uppercase
            const filepath = path.join(
                __dirname,
                `/Reports/Reports-${machineName}-${new Date()
                    .toISOString()
                    .replace(/:/g, "-")
                    .replace("T", "-")
                    .replace("Z", "")}.xlsx`
            );

            await getData(machine, from, to, workbook, filepath);
            return { machineName, filepath }; // Return an object with machineName and filepath
        });

        const machineFilepaths = await Promise.all(workbookPromises);
        return machineFilepaths;
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = { getreport };





// async function getData(machine, from, to, workbook, filepath) {
//     try {
//         const ROW_LIMIT = 900000; // Maximum number of rows per Excel sheet
//         const query = `SELECT *
//                     FROM $1:name
//                     WHERE created_on BETWEEN $2 AND $3
//                     ORDER BY created_on`;
//         const queryValueArray = [machine, from, to];
//         let rowCount = 0;
//         const reportData = await psqlToJson(query, queryValueArray);
//         const sheetDataArray = [];
//         let currentSheetData = [];
//         for (const datum of reportData) {
//             const sheetData = {
//                 "S.NO": (rowCount += 1),
//                 ...datum,
//                 ...JSON.stringify(datum.data),
//             };
//             sheetData["created_on"] = formatDate(sheetData["created_on"]);
//             let sheetDataWithUpperTitle = {};
//             Object.keys(sheetData).forEach((data) => {
//                 let newPair = { [data.toUpperCase()]: sheetData[data] };
//                 sheetDataWithUpperTitle = { ...sheetDataWithUpperTitle, ...newPair };
//             });
//             currentSheetData.push(sheetDataWithUpperTitle);
//             if (currentSheetData.length >= ROW_LIMIT) {
//                 sheetDataArray.push(currentSheetData);
//                 currentSheetData = [];
//             }
//         }
//         if (currentSheetData.length > 0) {
//             sheetDataArray.push(currentSheetData);
//         }
//         for (let i = 0; i < sheetDataArray.length; i++) {
//             const sheetName = `Sheet ${i + 1}`;
//             await jsonToExcel(machine, sheetDataArray[i], workbook, filepath, sheetName);
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// const filepath = [];

// async function getreport(from, to, machine) {
//     try {
//         const workbook = xlsx.utils.book_new(); // Create new workbook;

//         filepath.push(
//             __dirname +
//             "/Reports/Reports-" +
//             new Date()
//                 .toString()
//                 .split(" ")
//                 .slice(0, 5)
//                 .join(":")
//                 .split(":")
//                 .join("-") +
//             ".xlsx"
//         );

//         const getDataPromises = machine.map((name) => getData(name, from, to, workbook, filepath[filepath.length - 1]));

//         await Promise.all(getDataPromises);

//         return;
//     } catch (error) {
//         console.log(error.message);
//     }
// }


// async function getreport(from, to, machine) {
//     try {
//         const workbook = xlsx.utils.book_new(); // Create new workbook;

//         filepath.push(
//             __dirname +
//             "/Reports/Reports-" +
//             new Date()
//                 .toString()
//                 .split(" ")
//                 .slice(0, 5)
//                 .join(":")
//                 .split(":")
//                 .join("-") +
//             ".xlsx"
//         );

//         //Create sheet and stores the report data in the respective sheets
//         // getData(machine, from, to, workbook, filepath[filepath.length - 1]);
//         machine.forEach((name) => { 
//             getData(name, from, to, workbook, filepath[filepath.length - 1]);
//         })
        
//         return;
//     } catch (error) {
//         console.log(error.message);
//     }
// };

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = { filepath, getreport };



















// const db = require("../../Database/db");
// const psqlToJson = require("./psql-json");
// const { jsonToExcel } = require("./json-excel");
// const xlsx = require("xlsx");

// let filepath = [];

// // Get machine data and returns the required data.
// async function getreport(from, to, machicheNames) {
//     try {
//         const workbook = xlsx.utils.book_new();
//         const reportFilePath =
//             __dirname +
//             "/Reports/Reports-" +
//             new Date()
//                 .toString()
//                 .split(" ")
//                 .slice(0, 5)
//                 .join(":")
//                 .split(":")
//                 .join("-") +
//             ".xlsx";

//         filepath.push(reportFilePath);

//         await Promise.all(
//             machicheNames.map((name) => getData(name, from, to, workbook, reportFilePath))
//         );

//         return;
//     } catch (error) {
//         console.log(error.message);
//     }
// };

// async function getData(machineName, from, to, workbook, filepath) {
//     const tableName = machineName.toLowerCase();

//     try {
//     const query =
//       "SELECT * FROM $1:name WHERE log_time BETWEEN $2 AND $3";
//     const queryValueArray = [tableName, from, to];
//     let rowCount = 0;
//     const reportData = await psqlToJson(query, queryValueArray);

//         const excelSheetData = reportData.map((datum) => {
//             const sheetData = {
//                 "S.NO": (rowCount += 1),
//                 ...datum,
//                 ...JSON.stringify(datum.data),
//             };

//             sheetData["log_time"] = new Date(sheetData["log_time"]).toLocaleString();

//             let sheetDataWithUpperTitle = {};

//             Object.keys(sheetData).forEach((data) => {
//                 let newPair = { [data.toUpperCase()]: sheetData[data] };
//                 sheetDataWithUpperTitle = {
//                     ...sheetDataWithUpperTitle,
//                     ...newPair,
//                 };
//             });

//             return sheetDataWithUpperTitle;
//         });

//         await jsonToExcel(machineName, excelSheetData, workbook, filepath);
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// module.exports = { filepath, getreport };




