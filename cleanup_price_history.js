const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
const { pool } = require('./server/db');

async function cleanupPriceHistory() {
    console.log('🧹 Cleaning up all price history...\n');

    try {
        // 1. Delete all price history
        const historyResult = await pool.query('DELETE FROM stock_price_history');
        console.log(`✅ Deleted ${historyResult.rowCount} price history records`);

        // 2. Delete all market manipulations
        const manipResult = await pool.query('DELETE FROM market_manipulations');
        console.log(`✅ Deleted ${manipResult.rowCount} market manipulations`);

        // 3. Show current stock prices
        const stocksResult = await pool.query('SELECT symbol, name, price FROM stocks ORDER BY symbol');
        console.log('\n📊 Current stock prices:');
        stocksResult.rows.forEach(stock => {
            console.log(`   ${stock.symbol.padEnd(8)} - $${parseFloat(stock.price).toFixed(2)}`);
        });

        console.log('\n✅ Price history cleanup complete!');
        console.log('💡 You can now restart the Python service for fresh data.\n');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

cleanupPriceHistory();
