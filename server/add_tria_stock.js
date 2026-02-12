const { pool } = require('./db');

async function addStock() {
    const client = await pool.connect();
    try {
        // First check if stock exists
        const check = await client.query('SELECT symbol FROM stocks WHERE symbol = $1', ['TRI.A']);

        if (check.rows.length > 0) {
            console.log('Stock TRI.A already exists in database');
        } else {
            await client.query(
                'INSERT INTO stocks (symbol, name, price) VALUES ($1, $2, $3)',
                ['TRI.A', 'Thomson Reuters Corp', 158.75]
            );
            console.log('✓ Successfully added TRI.A stock to database!');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

addStock();
