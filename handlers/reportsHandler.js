const db = require("../Database/db");

// Unfiltered data
exports.getFilteredData = async (req, res) => {
    // console.log(req.body);
    const { periodFrom, periodTo, selectedMachine } = req.body
    try {
        const data = await db.manyOrNone(
            `SELECT * FROM $1:name WHERE created_on BETWEEN $2 AND $3 ORDER BY created_on DESC LIMIT 50`,
            [selectedMachine, periodFrom, periodTo]
        )
        // console.log(data)
        return res.status(data && data.length > 0 ? 200 : 404).json({
            status: data && data.length > 0,
            data: data,
            message: data && data.length > 0 ? undefined : "Data not found",
        });        
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};