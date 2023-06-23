const db = require("./db");
require("dotenv").config();

// User related tables
const usersTable = `CREATE TABLE IF NOT EXISTS "users_table"(
    id SERIAL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role INT NOT NULL DEFAULT 0,
    enable_emails BOOLEAN NOT NULL DEFAULT false,
    disable_login BOOLEAN NOT NULL DEFAULT false,
    created_on TIMESTAMP NOT NULL DEFAULT NOW()
);`;

// Remaining tables
// const demoTable = `CREATE TABLE IF NOT EXISTS "demo_table"(
//     id SERIAL,
//     wegid VARCHAR NOT NULL,
//     frequency NUMERIC(9, 2) NOT NULL,
//     magnitude NUMERIC(9,2) NOT NULL,
//     decible NUMERIC(9,2) NOT NULL,
//     created_on TIMESTAMP NOT NULL DEFAULT NOW()
// )`;

const machinesTable = `CREATE TABLE IF NOT EXISTS "machines_table"(
    id SERIAL,
    wegid VARCHAR NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT NOW()
);`;

async function createTables() {
    try {
        const tables = await db.many(
            "SELECT table_name FROM information_schema.tables"
        );

        // get all table name
        const data = await Promise.all([
            createUsersTable(),
            // createDemoTable(),
            createMachinesTable(),

        ]);

        //Check whether user table already exists or not
        async function createUsersTable() {
            const checkUsersTable = tables.filter(
                (name) => name.table_name === "users_table"
            );

            if (!checkUsersTable[0]) {
                await db.none(usersTable);
                return "Users Table created Successfully";
            } else {
                return "Users table already exist";
            }
        };

        // check for remaining tables
        // async function createDemoTable() {
        //     const checkDemoTable = tables.filter(
        //         (name) => name.table_name === "demo_table"
        //     );

        //     if (!checkDemoTable[0]) {
        //         await db.none(demoTable);
        //         return "Demo table created Successfully";
        //     } else {
        //         return "Demo table already exist";
        //     }
        // }

        async function createMachinesTable() {
			const checkMachinesTable = tables.filter(
				(name) => name.table_name === "machines_table"
			);

			if (!checkMachinesTable[0]) {
				await db.none(machinesTable);
				return "Machines Table created Successfully";
			} else {
				return "Machines Table already exist";
			}
		};
    
        return data;
    } catch (error) {
        return error.message;
    }
};

module.exports = createTables;
