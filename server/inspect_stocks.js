const { pool } = require('./db');

const inspect = async () => {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'stocks' ORDER BY ordinal_position");
        console.log("Stocks Columns:", res.rows);
    } catch (err) {
        console.error("Error inspecting table:", err);
    } finally {
        await pool.end();
    }
};

inspect();
