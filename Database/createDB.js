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
    user: USER,
    allowExitOnIdle: true
};

const db = pgp(connectionString);

const createDatabase = async function () {
  try {
    const allDatabases = await db.manyOrNone("SELECT datname from pg_database");
    
    const filteredDatabase = allDatabases.filter(
      (database) => database.datname === DATABASE
      );
      
    if (!filteredDatabase[0]) {
      await db.none("CREATE DATABASE $1:name", [DATABASE]);
      return "Database created successfully";
    } else {
      return "Database already exists";
    }
  } catch (error) {
    return error.message;
  }
};

module.exports = createDatabase;
