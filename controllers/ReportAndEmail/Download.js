const path = require('path');
const { filepath, getreport } = require("./GenerateReport");

const generateFileAndGetFilename = async (req, res) => {
    try {
        const startFrom = req.body.filteredDateFrom;
        const endTo = req.body.filteredDateTo;
        const machicheName = req.body.selectedMachine;

        // console.log(req.body)

        await getreport(startFrom, endTo, machicheName);

        const file = filepath[filepath.length - 1];
        const filename = path.basename(file);

        return res.status(200).json({
            status: true,
            filename: filename,
            message: "File name sent."
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

const downloadReport = (req, res) => {
    try {
        const filename = req.query.filename;
        const filepath1 = path.join(__dirname, `/Reports/${filename}`);

        setTimeout(() => {
            res.download(filepath1, (err) => {
                if (err) console.log("Download Error: ", err);
            });
        }, 3 * 1000);

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = { generateFileAndGetFilename, downloadReport };