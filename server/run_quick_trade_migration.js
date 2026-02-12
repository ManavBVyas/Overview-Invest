const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    console.log('🔧 Running Quick Trade migration...\n');

    try {
        const sqlPath = path.join(__dirname, 'migrations', 'create_quick_trades.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute migration
        await pool.query(sql);

        console.log('✅ Quick Trade table created successfully!');
        console.log('✅ Migration complete!\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('- Check if you have proper database permissions');
        console.error('- Verify the database connection in .env');
        console.error('- Table might already exist (check Supabase dashboard)\n');
    } finally {
        await pool.end();
        process.exit(0);
    }
}

runMigration();
