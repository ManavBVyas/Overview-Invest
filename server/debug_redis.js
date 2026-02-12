const redis = require('redis');

const client = redis.createClient({
    url: 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));

async function run() {
    await client.connect();
    console.log('Connected to Redis');

    // Subscribe to stock_updates
    await client.subscribe('stock_updates', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`[DATA RECEIVED] ${data.ticker}: ${data.price} (${data.timestamp})`);
        } catch (e) {
            console.log('Received raw message:', message);
        }
    });

    console.log('Listening to stock_updates channel...');
}

run();
