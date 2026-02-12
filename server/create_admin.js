const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        // Check if admin exists
        const check = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@overview.com']);

        if (check.rows.length > 0) {
            console.log('✓ Admin exists. Updating password to "admin123"...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, 'admin@overview.com']);
            console.log('✅ Admin password reset to: admin123');
            await pool.end();
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin user
        await pool.query(
            'INSERT INTO users (email, password, role, is_active, balance) VALUES ($1, $2, $3, $4, $5)',
            ['admin@overview.com', hashedPassword, 'admin', true, 100000]
        );

        console.log('\n✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    admin@overview.com');
        console.log('🔑 Password: admin123');
        console.log('💰 Balance:  $100,000.00');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🔗 Access at: http://localhost:5173/admin\n');

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();
