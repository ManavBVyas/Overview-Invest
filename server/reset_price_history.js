const { pool } = require('./db');

const resetHistory = async () => {
    const client = await pool.connect();
    try {
        console.log("🧹 Truncating stock_price_history table...");

        // Use DELETE to be safer with connection poolers
        const res = await client.query('DELETE FROM stock_price_history');
        console.log(`✅ History cleared. Deleted ${res.rowCount} records.`);
    } catch (e) {
        console.error("❌ Failed to clear history:", e);
    } finally {
        client.release();
        pool.end();
    }
};

resetHistory();
