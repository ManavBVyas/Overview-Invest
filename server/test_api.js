const axios = require('axios');

async function testAPI() {
    try {
        // First, let's try to get a token by logging in
        // You'll need to replace with actual credentials
        console.log('Testing stock API...\n');

        // Test without auth (should fail)
        try {
            const response = await axios.get('http://localhost:5000/api/stock/TRI.A');
            console.log('Response:', response.data);
        } catch (error) {
            console.log('Without token:', error.response?.data?.message || error.message);
        }

        // Show what stocks are available
        const { pool } = require('./db');
        const result = await pool.query('SELECT symbol, name, price FROM stocks ORDER BY symbol');

        console.log('\n✓ Stocks in database:');
        result.rows.forEach(s => {
            console.log(`  - ${s.symbol}: ${s.name} ($${parseFloat(s.price).toFixed(2)})`);
        });

        await pool.end();

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAPI();
