const xlsx = require("xlsx");
const path = require("path");

async function jsonToExcel(sheetTitle, workSheetData, workbook, filepath) {
  try {
    const addData = xlsx.utils.json_to_sheet(workSheetData);
    xlsx.utils.book_append_sheet(workbook, addData, sheetTitle);
    xlsx.writeFile(workbook, filepath);
    return;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { jsonToExcel };
