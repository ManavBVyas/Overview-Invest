const { pool } = require('./db');

const addBalanceColumn = async () => {
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 10000');
        console.log("Added balance column to users table.");
    } catch (e) {
        console.error("Error modifying table:", e);
    } finally {
        pool.end();
    }
};

addBalanceColumn();
