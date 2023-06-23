const db = require("../Database/db");

// fetch wegid from machines_table
const fetchWegid = async (req, res) => {
    try {
        const dataList = {};
        const listOfWegid = await db.manyOrNone(
            "SELECT wegid FROM machines_table ORDER BY wegid"
        );

        columns1 = Object.keys(listOfWegid[0]);
        columns1.forEach((column) => {
            dataList[column] = listOfWegid.map((datum) => datum[column]);
        });

        // console.log(dataList.wegid);

        return res.status(200).json({ status: true, listOfWegid: dataList.wegid });
    } catch (error) {
        return res
            .status(500)
            .json({ status: false, message: error.message });
    }
};

module.exports = { fetchWegid };