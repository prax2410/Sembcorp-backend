const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require('path');

const configFile = path.join(__dirname, '../../configHandlers/emailConfig.json');
const emailConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

const { HOST, PORT, EMAIL, PASSWORD } = emailConfig

async function mail(recievers, subject, text, attachments, html, machineName, cc, bcc) {
    let transporter = nodemailer.createTransport({
        pool: true,
        host: HOST,
        port: PORT,
        secure: false,
        auth: {
            user: EMAIL,
            pass: PASSWORD,
        }
    });

    if (!recievers || recievers.length === 0) {
        throw new Error('Receivers Mail IDs are not specified');
    }
    
    if (!subject) {
        throw new Error('Subject should not be blank');
    }

    let message = {
        from: EMAIL,
        to: recievers,
        subject: subject,
        text: text,
        html: html,
        cc: cc,
        bcc: bcc,
    };
    if (attachments) {
        message.attachments = [
            {
                filename: `${machineName}-${new Date().toLocaleString()}.xlsx`,
                path: attachments
            }
        ];
    }

    try {
        let info = await transporter.sendMail(message);
        console.log(`Email sent successfully.`);
    } catch (error) {
        throw new Error(`Error sending email.`);
    }


    return;
};

module.exports = mail;
