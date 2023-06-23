const db = require("../Database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
require("dotenv").config();

exports.register = async (req, res) => {
    try {
        const foundUserName = await db.manyOrNone(
            `SELECT user_name FROM users_table WHERE user_name = $1`,
            [req.body.user_name]
        );
        const foundEmail = await db.manyOrNone(
            `SELECT email FROM users_table WHERE email = $1`,
            [req.body.email]
        );
        if (foundUserName[0]) {
            return res.json({ status: false, message: "User name already exist" });
        } else if(foundEmail[0]) {
            return res.json({ status: false, message: "Email already exist" });
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(
                    req.body.password,
                    salt,
                    async (_err, hashedPassword) => {
                        await db.none(
                            "INSERT INTO users_table (first_name, last_name, user_name, password, email, role) VALUES($1, $2, $3, $4, $5, $6)",
                            [
                                req.body.first_name,
                                req.body.last_name,
                                req.body.user_name,
                                hashedPassword,
                                req.body.email,
                                1
                            ]
                        );
                        return res
                            .status(200)
                            .json({ status: true, message: `User ${req.body.first_name} registered successfully` });
                    })
            });
        }
    } catch (error) {
        return res
            .status(500)
            .json({ status: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    const { user_name, password } = req.body;

    try {
        const getUser = await db.manyOrNone(
            `SELECT id, user_name, password, email, role, disable_login FROM users_table WHERE user_name = $1`,
            [user_name]
        );

        if (getUser[0]) {
            if (!getUser[0].disable_login) {
                bcrypt.compare(
                    password,
                    getUser[0].password,
                    (err, result) => {
                        if (result) {
                            const user = getUser[0];
                            // generate a signed token with user id and secret
                            const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET);

                            // persist the token as 't' in cookie without expiry date
                            res.cookie('t', token);

                            // return response with user and token to frontend client
                            const { id, user_name, email, role } = user;
                            return res.status(200).json({
                                status: true,
                                token,
                                user: { id, email, user_name, role },
                                message: "Successfully Logged in"
                            });
                        } else {
                            return res
                                .status(500)
                                .json({ status: false, message: "Check password!" });
                        }
                    }
                );
            } else {
                return res
                    .status(500)
                    .json({ status: false, message: "User is not Authorized to login. Please contact Your Admin." });
            }
            
        } else {
            return res
                .status(404)
                .json({ status: false, message: "Username doesn't exists" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('t');
    return res.status(200).json({ message: 'User successfully logged out' });
};

// require login method
exports.requireLogin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    userProperty: "auth"
});

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile.id == req.auth._id;
    if (!user) {
        return res.status(403).json({
            error: 'Access denied'
        });
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: 'Admin resourse! Access denied'
        });
    }
    next();
};