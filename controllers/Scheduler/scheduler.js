const sendReport = require("./send-report");
const cron = require("cron");

const daily = () => {
    
    const job1 = new cron.CronJob("00 7 * * *", () => {
        const timezone = 'Asia/Kolkata';
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
        yesterday.setHours(0, 1, 0);
        const from = yesterday.toLocaleString('en-US', { timeZone: timezone });

        yesterday.setHours(23, 59, 0);
        const to = yesterday.toLocaleString('en-US', { timeZone: timezone });

        // let from = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        // let to = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        sendReport("Daily", from, to).then(
            console.log("Daily Report sent successfully")
        )
    });

    job1.start();
};

const weekly = () => {
    const job2 = new cron.CronJob("00 7 * * 6", () => {
        let from = new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        let to = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        
        sendReport("Weekly", from, to).then(
            console.log("weekly Report sent successfully")
        )
    });

    job2.start();
};

const monthly = () => {
    const job3 = new cron.CronJob("01 0 1 * *", () => {
        let date = new Date();
        let from = new Date(date.getFullYear(), date.getMonth(), 2).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        let to = new Date(date.getFullYear(), date.getMonth() + 1, 1).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        
        sendReport("Monthly", from, to).then(
            console.log("Monthly Report sent successfully")
        )
    });

    job3.start();
};

const check = () => {
    
    const job1 = new cron.CronJob("27 17 * * *", () => {
        const timezone = 'Asia/Kolkata';
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
        yesterday.setHours(0, 1, 0);
        const from = yesterday.toLocaleString('en-US', { timeZone: timezone });

        yesterday.setHours(23, 59, 0);
        const to = yesterday.toLocaleString('en-US', { timeZone: timezone });
        
        // let from = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        // let to = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        sendReport("Daily", from, to).then(
            console.log("Daily Report sent successfully")
        )
    });
    job1.start();
};

const scheduler = () => {
    console.log("Scheduler Started");
    daily();
    weekly();
    monthly();
    // check();
}

module.exports = scheduler;
// -----------------------------------------------------------------------------------------------------