const fs = require('fs');
const { filepath, getreport } = require("../ReportAndEmail/GenerateReport");
const mail = require("../ReportAndEmail/email");
const psqlToJson = require("../ReportAndEmail/psql-json");

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

async function sendReport(timeLine, from, to) {
    try {
        const wegidList = ['giwel01', 'giwel02', 'giwel03', 'giwel04', 'giwel05'];

        const startFrom = formatDate(from);
        const endTo = formatDate(to);

        const machineFilepaths = await getreport(startFrom, endTo, wegidList);

        // console.log("Generated Machine Filepaths:", machineFilepaths);

        const subject =
            timeLine === "Hourly"
                ? `Sembcorp Hourly Report ${new Date().toLocaleString()}`
                : "Sembcorp Report";

        const emails = await psqlToJson("SELECT first_name, email FROM users_table WHERE enable_emails='true'");

        if (emails.length === 0) {
            return;
        }

        for (const machine of wegidList) {
            // const machineName = machine.toUpperCase(); // Assuming machine names are in uppercase

            const HTML = `<div>
                <h1>${subject}</h1>
                <span>
                    <h3>Dear Customer,</h3>
                    <p>      </p>
                    <p>Please find attached here with the Sembcorp System report dated from ${from} to ${to}.
                    <br />
                    <br />
                    This is the auto-generated mail. Do not reply to the mail.</p>
                    <div></div>
                    <p>Regards, <br />
                    EnergySYS, Coimbatore <br />
                    +919940247490</p>
                </span>
            </div>`;

            const machineName = machine.toUpperCase();
            const machineIndex = wegidList.indexOf(machine);
            const filepath = machineFilepaths[machineIndex].filepath;

            for (const email of emails) {
                await mail(email.email, subject, null, filepath, HTML, machineName);
            }

            // Delete the file after sending the email
            fs.unlink(filepath, (err) => {
                if (err) {
                    console.log(`Error deleting file ${filepath}: ${err}`);
                } else {
                    console.log(`File ${filepath} deleted successfully.`);
                }
            });
        }
    } catch (error) {
        console.log(error.message);
    }
}

//-----------------------------------------------

module.exports = sendReport;