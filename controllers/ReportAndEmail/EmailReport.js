const { filepath, getreport } = require("./GenerateReport");
const mail = require("./email");
const moment = require("moment");
const psqlToJson = require("./psql-json");
const fs = require('fs');
const util = require('util');

const access = util.promisify(fs.access);
const stat = util.promisify(fs.stat);

async function emailReport(req, res) {
    let startFrom = req.body.filteredDateFrom;
    let endTo = req.body.filteredDateTo;
    let machicheNames = req.body.selectedMachine;

    // console.log(req.body);

    try {
        // Store admin's first name and email from admin id
        const recepientNames = "SELECT first_name, email FROM users_table WHERE enable_emails='true'";
        const  data = await psqlToJson(recepientNames, []);

        await getreport(startFrom, endTo, machicheNames);
        
        const from = moment(startFrom).format("DD-MM-YYYY HH:MM:SS A");
        const to = moment(new Date()).format("DD-MM-YYYY HH:MM:SS A");

        // Check if the file size is greater than 25MB
        // setTimeout(async () => {
        //     await access(filepath[filepath.length - 1], fs.constants.F_OK);
        //     const stats = await stat(filepath[filepath.length - 1]);
        //     const fileSizeInBytes = stats.size;
        //     const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
        //     if (fileSizeInMB > 24) {
        //         return res.status(400).json({ status: false, message: "File size is greater than 25MB" });
        //     }
        // }, 100);
        
        setTimeout(() => {
            data.forEach(async (data) => {
                // Parameters to send with mail component
                const subject = `Sembcorp Demo Report from ${from} to ${to}.`;
                const HTML =
                    `<div>
                    <h1>Sembcorp Demo Report from ${from} to ${to}.</h1>
                    <span>
                        <h3>Dear ${data.first_name},</h3>
                        <p></p>
                        <p>Please find attached here with the Sembcorp Demo report for from ${from} to ${to}.
                        <br /><br />
                        This is the auto generated mail. Do not reply to the mail.</p>
                        <div></div>
                        <p>Regards, <br />
                        EnergySYS, Coimbatore <br />
                        +919940247490</p>
                    </span>
                </div>`;

                await mail(data.email, subject, null, filepath[filepath.length - 1], HTML);
            });
        }, 10 * 1000);
        
        return res.status(200).json({ status: true, message: "Mail sent succuessfully." });
        
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = { emailReport };