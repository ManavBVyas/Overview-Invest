const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
    // ssl: { rejectUnauthorized: false }
});

const initialStocks = [
    // Technology
    { symbol: 'AAPL', price: 175.23 },
    { symbol: 'GOOGL', price: 142.56 },
    { symbol: 'MSFT', price: 378.91 },
    { symbol: 'NVDA', price: 485.12 },

    // Automobile
    { symbol: 'TSLA', price: 248.67 },
    { symbol: 'F', price: 12.15 },
    { symbol: 'TM', price: 195.40 },
    { symbol: 'RACE', price: 345.20 },

    // Food & Beverage
    { symbol: 'KO', price: 58.90 },
    { symbol: 'PEP', price: 168.45 },
    { symbol: 'SBUX', price: 92.30 },
    { symbol: 'MCD', price: 285.15 },

    // Music & Entertainment
    { symbol: 'SPOT', price: 188.20 },
    { symbol: 'WMG', price: 34.50 },
    { symbol: 'NFLX', price: 485.60 },

    // Gaming
    { symbol: 'NTDOY', price: 12.45 },
    { symbol: 'EA', price: 135.80 },
    { symbol: 'TTWO', price: 158.40 },

    // Farming & Agriculture
    { symbol: 'DE', price: 388.50 },
    { symbol: 'ADM', price: 72.30 },
    { symbol: 'CTVA', price: 45.90 },

    // Home Appliances
    { symbol: 'WHR', price: 115.40 },
    { symbol: 'PHG', price: 22.15 },
    { symbol: 'SONY', price: 88.60 },

    // Government / State-Owned
    { symbol: 'Aramco', price: 8.50 },
    { symbol: 'AIR.PA', price: 140.20 },

    // Crypto
    { symbol: 'BTC', price: 43250.00 },
    { symbol: 'ETH', price: 2350.45 },
    { symbol: 'SOL', price: 95.20 },
    { symbol: 'DOGE', price: 0.082 }
];

const resetPrices = async () => {
    const client = await pool.connect();
    try {
        console.log("📉 Resetting Market Prices to Norms...");

        // 1. Reset Current Prices
        for (const s of initialStocks) {
            await client.query('UPDATE stocks SET price = $1 WHERE symbol = $2', [s.price, s.symbol]);
            console.log(`✅ Set ${s.symbol} to $${s.price}`);
        }

        // 2. Clear Price History (to remove the "mountain" of high prices from charts)
        console.log("🧹 Clearing Price History...");
        await client.query('TRUNCATE TABLE stock_price_history RESTART IDENTITY CASCADE');

        // 3. Clear Orders (Optional, but good for cleanup)
        // await client.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE');

        console.log("✅ Market Reset Complete.");

    } catch (err) {
        console.error("❌ Error resetting prices:", err);
    } finally {
        client.release();
        await pool.end();
    }
};

resetPrices();
