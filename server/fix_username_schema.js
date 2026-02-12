const { pool } = require('./db');

const addUsernameColumn = async () => {
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE');
        console.log("Added username column to users table.");
    } catch (e) {
        console.error("Error modifying table:", e);
    } finally {
        pool.end();
    }
};

addUsernameColumn();
