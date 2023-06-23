const express = require("express");
const router = express.Router();

const { fetchWegid } = require("../handlers/machineHandler");

router.get("/fetchWegid", fetchWegid);

module.exports = router;
