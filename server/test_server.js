const axios = require('axios');

async function testServer() {
    try {
        // Test if server is running
        const response = await axios.get('http://localhost:5000/api/stocks');
        console.log('✅ Server is running');
        console.log(`📊 Found ${response.data.length} stocks`);
        if (response.data.length > 0) {
            console.log('First stock:', response.data[0]);
        }
    } catch (error) {
        console.log('❌ Server is NOT running or endpoint failed');
        console.log('Error:', error.message);
        console.log('\n💡 Please start the server with: cd server && npm start');
    }
}

testServer();
