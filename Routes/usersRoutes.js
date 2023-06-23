const express = require("express");
const router = express.Router();

const { getUsers, updateUser, updatePassword, removeUser } = require("../handlers/usersHandler");

router.get("/getUsers", getUsers);
router.put("/updateUser", updateUser);
router.put("/updatePassword", updatePassword);
router.delete("/removeUser", removeUser);

module.exports = router;