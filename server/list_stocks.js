const { pool } = require('./db');

async function listStocks() {
    try {
        const result = await pool.query('SELECT symbol, name, price FROM stocks ORDER BY symbol');

        if (result.rows.length === 0) {
            console.log('No stocks found in database!');
        } else {
            console.table(result.rows.map(s => ({
                Symbol: s.symbol,
                Name: s.name,
                Price: `$${parseFloat(s.price).toFixed(2)}`
            })));
        }

        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

listStocks();
