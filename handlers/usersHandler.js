const db = require("../Database/db");
const bcrypt = require("bcrypt");

exports.getUsers = async (req, res) => {
    try {
        await db.manyOrNone(
            "SELECT id, user_name, email, role, enable_emails, disable_login FROM users_table ORDER BY id"
        ).then(result => {
            return res.status(200).json({ status: true, users: result });
        })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

exports.updateUser = async (req, res) => {
    const { id, user_name, email, role, enable_emails, disable_login } = req.body;
    
    try {
        await db.manyOrNone(
            `UPDATE users_table 
            SET user_name=$1,
            email=$2,
            role=$3,
            enable_emails=$4,
            disable_login=$5
            WHERE id=$6`,
            [user_name, email, role, enable_emails, disable_login, id]
        );

        return res.status(200).json({ status: true, message: "User updated successfully" });

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        await db.none(
            "UPDATE users_table SET password=$1 WHERE id=$2",
            [
                hashedPassword,
                req.body.id
            ]
        );
        return res.status(200).json({
            status: true,
            message: `User password updated successfully`
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

exports.removeUser = async (req, res) => {
    const { id } = req.body;

    try {
        await db.manyOrNone(
            "DELETE FROM users_table WHERE id=$1",
            [id]
        );
        return res.status(200).json({ status: true, message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}
