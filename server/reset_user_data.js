const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Order = require('./models/Order');
const QuickTrade = require('./models/QuickTrade');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/overview_invest_v5';

async function resetUserData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Clear all user holdings (Shares)
        console.log('Clearing all user holdings (deleting shares)...');
        await User.updateMany({}, {
            $set: {
                holdings: [],
                balance: 1000000 // Reset balance to 10 Lakh INR (approx) or 1M
            }
        });
        console.log('All user portfolios have been reset.');

        // 2. Clear transactions history
        console.log('Deleting transaction history...');
        await Transaction.deleteMany({});

        // 3. Clear orders
        console.log('Deleting orders...');
        await Order.deleteMany({});

        // 4. Clear quick trades
        console.log('Deleting quick trades...');
        try {
            await QuickTrade.deleteMany({});
        } catch (e) {
            // QuickTrade model might not be registered or collection empty
        }

        console.log('✅ Successfully deleted all shares and reset user accounts.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

resetUserData();
