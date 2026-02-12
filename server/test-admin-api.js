const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const API_URL = 'http://localhost:5000/api/admin';

async function testAdminAPI() {
    try {
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: process.env.ADMIN_EMAIL || 'admin@overviewinvest.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@123'
        });

        const token = loginRes.data.token;
        console.log('Got token:', token ? 'YES' : 'NO');

        console.log('Fetching users...');
        const usersRes = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Users Response Status:', usersRes.status);
        console.log('Users Data Type:', typeof usersRes.data);
        console.log('Users Data Keys:', Object.keys(usersRes.data));

        if (usersRes.data.users) {
            console.log('User count in response:', usersRes.data.users.length);
        } else {
            console.log('No "users" key in response. Full data:', JSON.stringify(usersRes.data));
        }

    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testAdminAPI();
