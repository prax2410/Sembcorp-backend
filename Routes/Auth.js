const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout
} = require("../controllers/Auth");
const validateDto = require("../controllers/ValidateDto");
const userSchema = require("../Schema/User");

router.post("/register", validateDto(userSchema), register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;