const { pool } = require('./db');

async function listUsers() {
    try {
        const result = await pool.query('SELECT id, email, role, is_active FROM users ORDER BY id');

        console.log('\n📋 All Users in Database:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (result.rows.length === 0) {
            console.log('❌ No users found in database!');
        } else {
            result.rows.forEach(user => {
                console.log(`ID: ${user.id} | Email: ${user.email} | Role: ${user.role} | Active: ${user.is_active}`);
            });
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

listUsers();
