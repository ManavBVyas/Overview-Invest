const { pool } = require('./db');

const migrateHistory = async () => {
    const client = await pool.connect();
    try {
        console.log("Adding stock_price_history table...");

        // Ensure stock_price_history table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS stock_price_history (
                id SERIAL PRIMARY KEY,
                stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
                price DECIMAL(10, 2) NOT NULL,
                recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Migration complete.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        client.release();
        pool.end();
    }
};

migrateHistory();
