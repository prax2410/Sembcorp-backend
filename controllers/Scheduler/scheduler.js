// const sendReport = require("./send-report");
const { generateDailyReports } = require("../ReportAndEmail/GenerateDailyReport")
const cron = require("cron");

const createDailyWorkbook = () => {
    const job = new cron.CronJob("1 0 * * *", () => { // 00:01 AM daily
        const machineList = ["giwel01", "giwel02", "giwel03", "giwel04", "giwel05"];
        generateDailyReports(machineList);
    });
    job.start();
};

const createTestWorkbook = () => {
    const job1 = new cron.CronJob("12 19 * * *", () => {
        // const machineList = ["giwel01", "giwel02", "giwel03", "giwel04", "giwel05"];
        const machineList = ["giwel05"];

        generateDailyReports(machineList);
    });
    job1.start();
};

const scheduler = () => {
    console.log("Scheduler Started");
    createDailyWorkbook()
    // createTestWorkbook()
}

module.exports = scheduler;
// -----------------------------------------------------------------------------------------------------