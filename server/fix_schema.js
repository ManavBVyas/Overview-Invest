const { pool } = require('./db');

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log("Starting DB Migration...");

        // 1. Add 'role' column if it doesn't exist
        await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
    `);
        console.log("Added 'role' column.");

        // 2. Add 'is_active' column if it doesn't exist
        await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `);
        console.log("Added 'is_active' column.");

        // 3. Ensure stocks table exists (it should, but just in case)
        // The main initDb handles creation, but this fixes the 'users' mismatch.

        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        client.release();
        pool.end();
    }
};

migrate();
