const axios = require('axios');

const BASE_URL = 'http://localhost/api'; // Assuming Sail exposes port 80

async function testOtp() {
    try {
        console.log('Testing OTP Send...');
        const res = await axios.post(`${BASE_URL}/otp/send`, {
            identifier: 'test@example.com'
        });
        console.log('OTP Send Response:', res.status, res.data);
    } catch (error) {
        console.error('OTP Send Failed:', error.code || error.response?.status, error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
}

async function testInvoice() {
    try {
        console.log('\nTesting Invoice Create...');
        const res = await axios.post(`${BASE_URL}/invoice/create`, {
            user_id: 'user_123',
            order_id: 'order_456',
            amount: 100.50,
            currency: 'USD',
            items: [
                { name: 'Stock A', price: 50.25 },
                { name: 'Stock A', price: 50.25 }
            ],
            email: 'test@example.com'
        });
        console.log('Invoice Create Response:', res.status, res.data);
    } catch (error) {
        console.error('Invoice Create Failed:', error.code || error.response?.status, error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
}

async function run() {
    await testOtp();
    await testInvoice();
}

run();
