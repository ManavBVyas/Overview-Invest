const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stock = require('./models/Stock');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/overview_invest', {});
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const initDb = async () => {
  await connectDB();

  try {
    // Seed Stocks (Finnhub-compatible US symbols)
    const count = await Stock.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial stocks (Finnhub-compatible symbols)...');
      const initialStocks = [
        // Technology
        { symbol: 'AAPL', name: 'Apple Inc.', price: 175.23, sector: 'Technology', liquidity: 'High', country: 'USA' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, sector: 'Technology', liquidity: 'High', country: 'USA' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, sector: 'Technology', liquidity: 'High', country: 'USA' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 485.12, sector: 'Technology', liquidity: 'Medium', country: 'USA' },
        { symbol: 'META', name: 'Meta Platforms', price: 390.45, sector: 'Technology', liquidity: 'High', country: 'USA' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 155.80, sector: 'Technology', liquidity: 'High', country: 'USA' },

        // Automobile
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.67, sector: 'Automobile', liquidity: 'Medium', country: 'USA' },
        { symbol: 'F', name: 'Ford Motor Co.', price: 12.15, sector: 'Automobile', liquidity: 'Medium', country: 'USA' },
        { symbol: 'TM', name: 'Toyota Motor', price: 195.40, sector: 'Automobile', liquidity: 'High', country: 'USA' },
        { symbol: 'GM', name: 'General Motors', price: 38.50, sector: 'Automobile', liquidity: 'Medium', country: 'USA' },

        // Food & Beverage
        { symbol: 'KO', name: 'Coca-Cola Co.', price: 58.90, sector: 'Food', liquidity: 'High', country: 'USA' },
        { symbol: 'PEP', name: 'PepsiCo Inc.', price: 168.45, sector: 'Food', liquidity: 'High', country: 'USA' },
        { symbol: 'SBUX', name: 'Starbucks Corp.', price: 92.30, sector: 'Food', liquidity: 'Medium', country: 'USA' },
        { symbol: 'MCD', name: "McDonald's Corp.", price: 285.15, sector: 'Food', liquidity: 'High', country: 'USA' },

        // Entertainment & Media
        { symbol: 'NFLX', name: 'Netflix Inc.', price: 485.60, sector: 'Entertainment', liquidity: 'Medium', country: 'USA' },
        { symbol: 'DIS', name: 'Walt Disney Co.', price: 95.40, sector: 'Entertainment', liquidity: 'High', country: 'USA' },
        { symbol: 'SPOT', name: 'Spotify Tech', price: 188.20, sector: 'Entertainment', liquidity: 'Medium', country: 'USA' },

        // Gaming
        { symbol: 'EA', name: 'Electronic Arts', price: 135.80, sector: 'Game', liquidity: 'Medium', country: 'USA' },
        { symbol: 'TTWO', name: 'Take-Two Interactive', price: 158.40, sector: 'Game', liquidity: 'Medium', country: 'USA' },
        { symbol: 'RBLX', name: 'Roblox Corp.', price: 42.30, sector: 'Game', liquidity: 'Medium', country: 'USA' },

        // Farming & Agriculture
        { symbol: 'DE', name: 'John Deere', price: 388.50, sector: 'Farming', liquidity: 'Medium', country: 'USA' },
        { symbol: 'ADM', name: 'Archer-Daniels', price: 72.30, sector: 'Farming', liquidity: 'Medium', country: 'USA' },
        { symbol: 'CTVA', name: 'Corteva Inc.', price: 45.90, sector: 'Farming', liquidity: 'Low', country: 'USA' },

        // Home & Electronics
        { symbol: 'SONY', name: 'Sony Group', price: 88.60, sector: 'Electronics', liquidity: 'Medium', country: 'USA' },
        { symbol: 'HPQ', name: 'HP Inc.', price: 29.75, sector: 'Electronics', liquidity: 'Medium', country: 'USA' },

        // Energy & Defence
        { symbol: 'XOM', name: 'Exxon Mobil', price: 105.20, sector: 'Energy', liquidity: 'High', country: 'USA' },
        { symbol: 'LMT', name: 'Lockheed Martin', price: 450.60, sector: 'Defence', liquidity: 'Medium', country: 'USA' },

        // Finance
        { symbol: 'JPM', name: 'JPMorgan Chase', price: 172.90, sector: 'Finance', liquidity: 'High', country: 'USA' },
        { symbol: 'V', name: 'Visa Inc.', price: 262.35, sector: 'Finance', liquidity: 'High', country: 'USA' },
      ];

      await Stock.insertMany(initialStocks);
      console.log('✅ Initial stocks seeded (29 Finnhub-compatible US stocks)');
    }

    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  }
};

module.exports = { connectDB, initDb };
