const { pool } = require('./db');

const checkHistory = async () => {
    try {
        const client = await pool.connect();
        const count = await client.query('SELECT COUNT(*) FROM stock_price_history');
        console.log("Total history rows:", count.rows[0].count);

        const sample = await client.query('SELECT * FROM stock_price_history LIMIT 5');
        console.log("Sample rows:", sample.rows);

        client.release();
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
};

checkHistory();
