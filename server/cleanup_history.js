// Database cleanup script - removes old price history to improve performance
const { pool } = require('./db');

async function cleanupOldHistory() {
    try {
        console.log('🧹 Cleaning up old price history...');

        // Keep only last 7 days of price history
        const result = await pool.query(`
            DELETE FROM stock_price_history 
            WHERE recorded_at < NOW() - INTERVAL '7 days'
        `);

        console.log(`✅ Deleted ${result.rowCount} old price records`);
        console.log('📊 Keeping last 7 days of data for performance');

        // Get statistics
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_records,
                MIN(recorded_at) as oldest_record,
                MAX(recorded_at) as newest_record
            FROM stock_price_history
        `);

        if (stats.rows.length > 0) {
            console.log(`\n📈 Current database stats:`);
            console.log(`   Total records: ${stats.rows[0].total_records}`);
            console.log(`   Oldest record: ${stats.rows[0].oldest_record}`);
            console.log(`   Newest record: ${stats.rows[0].newest_record}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup error:', error);
        process.exit(1);
    }
}

cleanupOldHistory();
