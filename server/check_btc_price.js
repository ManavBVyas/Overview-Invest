const { pool } = require('./db');

const checkPrice = async () => {
    try {
        const res = await pool.query("SELECT symbol, price, last_updated FROM stocks WHERE symbol = 'BTC'");
        console.log("BTC Data:", res.rows[0]);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
};

checkPrice();
