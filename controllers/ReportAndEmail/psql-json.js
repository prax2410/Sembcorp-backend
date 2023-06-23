const db = require("../../Database/db");
require("dotenv").config();

async function psqlToJson(query, valueArray) {
  try {
    const data = await db.manyOrNone(query, valueArray);
    return data;
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = psqlToJson;
