const { pool } = require('./db');

const addHistoryIndex = async () => {
    try {
        await pool.query('CREATE INDEX IF NOT EXISTS idx_stock_history_lookup ON stock_price_history(stock_id, recorded_at)');
        console.log("Added index to stock_price_history table.");
    } catch (e) {
        console.error("Error modifying table:", e);
    } finally {
        pool.end();
    }
};

addHistoryIndex();
