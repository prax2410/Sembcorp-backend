const pgp = require("pg-promise")();
const fs = require('fs');
const path = require('path');

const configFile = path.join(__dirname, '../configHandlers/dbConfig.json');
const dbConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

const { HOST, PASSWORD, DB_PORT, DATABASE, USER } = dbConfig;

const connectionString = {
    host: HOST,
    password: PASSWORD,
    port: DB_PORT,
    database: DATABASE,
    user: USER,
    allowExitOnIdle: true
};

const db = pgp(connectionString);

module.exports = db;
