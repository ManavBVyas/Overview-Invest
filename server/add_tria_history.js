const { pool } = require('./db');

async function addHistoryForTRIA() {
    const client = await pool.connect();
    try {
        // Get stock ID
        const stockRes = await client.query('SELECT id, price FROM stocks WHERE symbol = $1', ['TRI.A']);

        if (stockRes.rows.length === 0) {
            console.log('Error: TRI.A stock not found!');
            return;
        }

        const stockId = stockRes.rows[0].id;
        const currentPrice = parseFloat(stockRes.rows[0].price);

        // Check if history already exists
        const histCheck = await client.query(
            'SELECT COUNT(*) FROM stock_price_history WHERE stock_id = $1',
            [stockId]
        );

        if (parseInt(histCheck.rows[0].count) > 0) {
            console.log(`TRI.A already has ${histCheck.rows[0].count} history records`);
            process.exit(0);
        }

        // Generate 100 historical data points (last ~3 hours if updating every 2 seconds)
        // Going backwards in time
        console.log('Generating historical price data for TRI.A...');
        const dataPoints = [];
        const now = new Date();

        for (let i = 100; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - (i * 2000)); // 2 seconds apart
            const priceVariation = (Math.random() - 0.5) * 5; // Random variation of +/- $2.50
            const price = currentPrice + priceVariation;

            dataPoints.push({
                time: timestamp,
                price: Math.max(price, 100) // Ensure price doesn't go below $100
            });
        }

        // Insert all history records
        for (const point of dataPoints) {
            await client.query(
                'INSERT INTO stock_price_history (stock_id, price, recorded_at) VALUES ($1, $2, $3)',
                [stockId, point.price, point.time]
            );
        }

        console.log(`✓ Added ${dataPoints.length} historical price points for TRI.A`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

addHistoryForTRIA();
