const mongoose = require('mongoose');
const Stock = require('./models/Stock');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Order = require('./models/Order');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/overview_invest_v5';

async function deleteAllMarketData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Delete all Stocks (Instruments)
        console.log('Deleting all stocks/instruments...');
        const result = await Stock.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} stocks.`);

        // 2. Clear user holdings just in case
        console.log('Clearing user holdings...');
        await User.updateMany({}, { $set: { holdings: [] } });

        console.log('✅ Market data cleared. The platform is now empty waiting for the feed.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

deleteAllMarketData();
