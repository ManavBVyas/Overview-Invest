const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stock = require('./models/Stock');

dotenv.config();

const reset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/overview_invest');
        console.log('✅ MongoDB Connected');

        console.log("🧨 Starting Database Wipe...");

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Explicitly clear News and OTPs first to be safe
        await mongoose.connection.collection('news').deleteMany({});
        await mongoose.connection.collection('otps').deleteMany({});

        for (let collection of collections) {
            console.log(`🧹 Clearing ${collection.collectionName}...`);
            await collection.deleteMany({});
        }

        console.log("✅ All data removed successfully.");

        // Re-seed stocks immediately so app isn't broken
        console.log('🌱 Re-seeding initial stocks...');
        const initialStocks = [
            // Technology
            { symbol: 'AAPL', name: 'Apple Inc.', price: 175.23, sector: 'Technology', liquidity: 'High', country: 'USA' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, sector: 'Technology', liquidity: 'High', country: 'USA' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, sector: 'Technology', liquidity: 'High', country: 'USA' },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 485.12, sector: 'Technology', liquidity: 'Medium', country: 'USA' },

            // Automobile
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.67, sector: 'Automobile', liquidity: 'Medium', country: 'USA' },
            { symbol: 'F', name: 'Ford Motor Co.', price: 12.15, sector: 'Automobile', liquidity: 'Medium', country: 'USA' },
            { symbol: 'TM', name: 'Toyota Motor', price: 195.40, sector: 'Automobile', liquidity: 'High', country: 'Japan' },
            { symbol: 'RACE', name: 'Ferrari N.V.', price: 345.20, sector: 'Automobile', liquidity: 'Low', country: 'Italy' },

            // Food & Beverage
            { symbol: 'KO', name: 'Coca-Cola Co.', price: 58.90, sector: 'Food', liquidity: 'High', country: 'USA' },
            { symbol: 'PEP', name: 'PepsiCo Inc.', price: 168.45, sector: 'Food', liquidity: 'High', country: 'USA' },
            { symbol: 'SBUX', name: 'Starbucks Corp.', price: 92.30, sector: 'Food', liquidity: 'Medium', country: 'USA' },
            { symbol: 'MCD', name: "McDonald's Corp.", price: 285.15, sector: 'Food', liquidity: 'High', country: 'USA' },

            // Music & Entertainment
            { symbol: 'SPOT', name: 'Spotify Tech', price: 188.20, sector: 'Music', liquidity: 'Medium', country: 'Sweden' },
            { symbol: 'WMG', name: 'Warner Music Group', price: 34.50, sector: 'Music', liquidity: 'Low', country: 'USA' },
            { symbol: 'NFLX', name: 'Netflix Inc.', price: 485.60, sector: 'Entertainment', liquidity: 'Medium', country: 'USA' },

            // Gaming
            { symbol: 'NTDOY', name: 'Nintendo Co.', price: 12.45, sector: 'Game', liquidity: 'Low', country: 'Japan' },
            { symbol: 'EA', name: 'Electronic Arts', price: 135.80, sector: 'Game', liquidity: 'Medium', country: 'USA' },
            { symbol: 'TTWO', name: 'Take-Two Interactive', price: 158.40, sector: 'Game', liquidity: 'Medium', country: 'USA' },

            // Farming & Agriculture
            { symbol: 'DE', name: 'John Deere', price: 388.50, sector: 'Farming', liquidity: 'Medium', country: 'USA' },
            { symbol: 'ADM', name: 'Archer-Daniels', price: 72.30, sector: 'Farming', liquidity: 'Medium', country: 'USA' },
            { symbol: 'CTVA', name: 'Corteva Inc.', price: 45.90, sector: 'Farming', liquidity: 'Low', country: 'USA' },

            // Home Appliances
            { symbol: 'WHR', name: 'Whirlpool Corp.', price: 115.40, sector: 'Home Appliances', liquidity: 'Low', country: 'USA' },
            { symbol: 'PHG', name: 'Philips N.V.', price: 22.15, sector: 'Home Appliances', liquidity: 'Low', country: 'Netherlands' },
            { symbol: 'SONY', name: 'Sony Group', price: 88.60, sector: 'Electronics', liquidity: 'Medium', country: 'Japan' },

            // Government / State-Owned
            { symbol: 'Aramco', name: 'Saudi Aramco', price: 8.50, sector: 'Government Company', liquidity: 'High', country: 'Saudi Arabia' },
            { symbol: 'AIR.PA', name: 'Airbus Group', price: 140.20, sector: 'Government Company', liquidity: 'Medium', country: 'France' },

            // Crypto
            { symbol: 'BTC', name: 'Bitcoin', price: 43250.00, sector: 'Crypto', liquidity: 'High', country: 'Global' },
            { symbol: 'ETH', name: 'Ethereum', price: 2350.45, sector: 'Crypto', liquidity: 'High', country: 'Global' },
            { symbol: 'SOL', name: 'Solana', price: 95.20, sector: 'Crypto', liquidity: 'Medium', country: 'Global' },
            { symbol: 'DOGE', name: 'Dogecoin', price: 0.082, sector: 'Crypto', liquidity: 'High', country: 'Global' }
        ];

        await Stock.insertMany(initialStocks);
        console.log('✅ Initial stocks re-seeded');

    } catch (err) {
        console.error("❌ Error during database wipe:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

reset();
