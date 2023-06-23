const express = require("express");
const cors = require('cors');
// const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();

// import routes
const scheduler = require("./controllers/Scheduler/scheduler");
const database = require("./Routes/Database");
const authRoutes = require("./Routes/Auth");
const usersRoutes = require("./Routes/usersRoutes");
const reportRoutes = require("./Routes/reportRoutes")
const machineRoutes = require("./Routes/machineRoutes");

// app
const app = express();
const port = process.env.PORT || 8000;

// middlewares
app.use(express.json());
app.use(cors());
// app.use(morgan("dev"));
app.use(bodyParser.json());

// Routes middlewares
app.use("/database", database);
app.use("/api", authRoutes);
app.use("/api", usersRoutes);
app.use("/api", reportRoutes);
app.use("/api", machineRoutes);

// scheduler();

// module.exports = app;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});