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
        query = "SELECT first_name, email FROM users_table WHERE enable_emails='true'";
        const emails = await psqlToJson(query);
        
        // const machines = await psqlToJson(
        //     "SELECT wegid from machines_table ORDER BY wegid"
        // );
        // const wegidList = machines.map(({ wegid }) => wegid);
        const wegidList = ['giwel01', 'giwel02', 'giwel03', 'giwel04', 'giwel05']

        const startFrom = formatDate(from);
        const endTo = formatDate(to);

        await getreport(startFrom, endTo, wegidList);

        const subject =
            timeLine == "Daily"
                ? `Sembcorp Daily Report ${new Date().toLocaleString()}`
                : timeLine == "Week"
                    ? "Sembcorp Weekly Report"
                    : "Sembcorp Monthly Report";

        if (emails.length === 0)
            return;
        
        setTimeout(async () => {
            emails.forEach(async (data) => {
                const HTML = `<div>
                    <h1>${timeLine == "Daily"
                                ? `Daily Report ${new Date().toLocaleString()}`
                                : timeLine == "Weekly"
                                    ? "Weekly Report"
                                    : "Monthly Report"
                            }</h1>
                    <span>
                        <h3>Dear ${data.first_name},</h3>
                        <p>      </p>
                        <p>Please find attached here with the Sembcorp System report dated from ${from} to ${to}.
                        <br />
                        <br />
                        This is the auto generated mail. Do not reply to the mail.</p>
                            <div></div>
                            <p>Regards, <br />
                            EnergySYS, Coimbatore <br />
                            +919940247490</p>
                        </span>
                    </div>`;
                await mail(data.email, subject, null, filepath[filepath.length - 1], HTML);
            });
        }, 300);

    } catch (error) {
        console.log(error.message);
    }
};
//-----------------------------------------------

module.exports = sendReport;