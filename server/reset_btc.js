const { pool } = require('./db');

const resetBTC = async () => {
    try {
        console.log("Resetting BTC price...");

        // CORRECTION: Update stock price
        await pool.query("UPDATE stocks SET price = 43250.00, last_updated = NOW() WHERE symbol = 'BTC'");
        console.log("BTC price reset to $43,250.00");

        // CORRECTION: Get ID first
        const res = await pool.query("SELECT id FROM stocks WHERE symbol = 'BTC'");
        if (res.rows.length > 0) {
            const btcId = res.rows[0].id;

            // Delete crazy history using stock_id
            const delRes = await pool.query("DELETE FROM stock_price_history WHERE stock_id = $1 AND price > 1000000", [btcId]);
            console.log(`Cleaned up ${delRes.rowCount} crazy price history records for BTC`);
        }

    } catch (err) {
        console.error("Error resetting BTC:", err);
    } finally {
        await pool.end();
    }
};

resetBTC();
