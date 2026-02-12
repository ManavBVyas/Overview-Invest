/**
 * Redis Subscriber for Node.js Backend
 * Receives market data from Python service and broadcasts to WebSocket clients
 */
const redis = require('redis');
// const { pool } = require('./db'); // Removed for MongoDB migration

// Create Redis subscriber client
const subscriber = redis.createClient({
    url: 'redis://localhost:6379'
});

const publisher = redis.createClient({
    url: 'redis://localhost:6379'
});

// Error handling
subscriber.on('error', (err) => {
    console.error('❌ Redis subscriber error:', err);
});

// Connection events
subscriber.on('connect', () => {
    console.log('🔌 Connecting to Redis...');
});

subscriber.on('ready', () => {
    console.log('✅ Redis subscriber ready');
});

/**
 * Initialize Redis subscriber and set up message handlers
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {Model} Stock - Mongoose Stock model for persistence
 */
async function initRedisSubscriber(io, Stock) {
    try {
        // Connect to Redis
        await subscriber.connect();
        await publisher.connect();

        // Subscribe to price ticks channel
        await subscriber.subscribe('price_ticks', async (message) => {
            try {
                const ticks = JSON.parse(message);

                // Broadcast to all WebSocket clients
                io.emit('priceUpdate', ticks);

                // Optional: Log every 10th update
                if (Math.random() < 0.1) {
                    console.log(`📡 Received ${ticks.length} ticks from Python, broadcasted to WebSocket`);
                }

            } catch (err) {
                console.error('Error processing price ticks:', err);
            }
        });

        // Subscribe to candles channel
        await subscriber.subscribe('candles', async (message) => {
            try {
                const candle = JSON.parse(message);

                console.log(`🕯️  Completed ${candle.interval} candle for ${candle.symbol}: ` +
                    `O=${candle.open} H=${candle.high} L=${candle.low} C=${candle.close}`);

                // Broadcast candle to clients
                io.emit('candleUpdate', candle);

                // Optional: Store completed candles in database
                // await storeCandle(candle);

            } catch (err) {
                console.error('Error processing candle:', err);
            }
        });

        // Subscribe to technical indicators channel
        await subscriber.subscribe('indicators', async (message) => {
            try {
                const data = JSON.parse(message);

                console.log(`📊 Indicators for ${data.symbol}:`, data.indicators);

                // Broadcast to clients interested in this symbol
                io.emit('indicatorUpdate', data);

            } catch (err) {
                console.error('Error processing indicators:', err);
            }
        });

        // Subscribe to manipulation updates
        await subscriber.subscribe('manipulation_updates', async (message) => {
            try {
                const update = JSON.parse(message);

                console.log(`🎮 Manipulation ${update.status} for ${update.symbol}`);

                // Broadcast to admin clients
                io.emit('manipulationUpdate', update);

            } catch (err) {
                console.error('Error processing manipulation update:', err);
            }
        });

        // Subscribe to market news channel
        await subscriber.subscribe('market_news', async (message) => {
            try {
                const news = JSON.parse(message);
                console.log(`📰 News broadcast: ${news.title} (${news.sentiment})`);
                io.emit('marketNews', news);
            } catch (err) {
                console.error('Error processing market news:', err);
            }
        });

        // Subscribe to market status channel
        await subscriber.subscribe('market_status', async (message) => {
            try {
                const status = JSON.parse(message);
                // Broadcast to all clients
                io.emit('marketStatus', status);
            } catch (err) {
                console.error('Error processing market status:', err);
            }
        });

        // Subscribe to real-time stock updates from Python Market Feed
        await subscriber.subscribe('stock_updates', async (message) => {
            try {
                const data = JSON.parse(message);

                // Format for frontend
                const update = {
                    symbol: data.ticker,
                    price: data.price,
                    change: 0, // Calculate change if needed or leave 0
                    changePercent: 0,
                    volume: 0,
                    last_updated: data.timestamp
                };

                // Broadcast to all WebSocket clients (wrapped in array as expected by frontend)
                io.emit('priceUpdate', [update]);

                // Update database for persistence
                if (Stock) {
                    await Stock.findOneAndUpdate(
                        { symbol: data.ticker },
                        {
                            price: data.price,
                            last_updated: data.timestamp,
                            name: data.name,
                            sector: data.type, // Map 'type' from Python to 'sector' in DB
                            // market_state: 'REGULAR'
                        },
                        { upsert: true }
                    );
                }

            } catch (err) {
                console.error('Error processing stock update:', err);
            }
        });

        console.log('\n📡 Subscribed to Redis channels:');
        console.log('   - stock_updates (real-time python feed)');
        console.log('   - price_ticks (legacy simulation)');
        console.log('   - candles (OHLC candles)');
        console.log('   - indicators (technical indicators)');
        console.log('   - manipulation_updates (admin actions)\n');

    } catch (err) {
        console.error('❌ Failed to initialize Redis subscriber:', err);
        console.error('Make sure Redis is running: redis-server');
        throw err;
    }
}

/**
 * Optional: Store completed candles in database for historical analysis
 */
async function storeCandle(candle) {
    try {
        /*
        await pool.query(`
            INSERT INTO candle_history (
                stock_symbol, interval, time, open, high, low, close, ticks
            ) VALUES ($1, $2, to_timestamp($3), $4, $5, $6, $7, $8)
            ON CONFLICT (stock_symbol, interval, time) 
            DO UPDATE SET 
                open = EXCLUDED.open,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                close = EXCLUDED.close,
                ticks = EXCLUDED.ticks
        `, [
            candle.symbol,
            candle.interval,
            candle.time,
            candle.open,
            candle.high,
            candle.low,
            candle.close,
            candle.ticks
        ]);
        */
    } catch (err) {
        // Silently fail if table doesn't exist (it's optional)
        // console.error('Error storing candle:', err);
    }
}

/**
 * Close Redis connection
 */
async function closeRedisSubscriber() {
    try {
        await subscriber.quit();
        console.log('✅ Redis subscriber closed');
    } catch (err) {
        console.error('Error closing Redis subscriber:', err);
    }
}

module.exports = {
    initRedisSubscriber,
    closeRedisSubscriber,
    subscriber,
    publisher
};
