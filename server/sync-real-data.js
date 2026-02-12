/**
 * Fetch Real Indian Market Data (History & Current)
 * Uses yahoo-finance2 to get actual historical and current prices
 * replacing any simulated data.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const yahooFinance = require('yahoo-finance2').default;
const Stock = require('./models/Stock');
const StockPriceHistory = require('./models/StockPriceHistory');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/overview_invest_v5';

async function syncRealData() {
    try {
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected\n');

        const stocks = await Stock.find();
        console.log(`📊 Found ${stocks.length} stocks. Fetching real market data from Yahoo Finance...`);

        // Clear existing history to make room for real data
        await StockPriceHistory.deleteMany({});
        console.log('🗑️  Old history cleared');

        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        for (const stock of stocks) {
            try {
                process.stdout.write(`Fetching ${stock.symbol}... `);

                // 1. Fetch current quote
                const quote = await yahooFinance.quote(stock.symbol);
                if (quote) {
                    stock.price = quote.regularMarketPrice || stock.price;
                    stock.last_updated = new Date();
                    await stock.save();
                }

                // 2. Fetch historical data (last 7 days to be safe)
                const queryOptions = { period1: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), interval: '15m' };
                const history = await yahooFinance.historical(stock.symbol, queryOptions);

                if (history && history.length > 0) {
                    const records = history.map(h => ({
                        stock_id: stock._id,
                        symbol: stock.symbol,
                        price: h.close || h.adjClose,
                        recorded_at: h.date
                    }));

                    await StockPriceHistory.insertMany(records);
                    console.log(`✅ [${records.length} points]`);
                } else {
                    console.log(`⚠️ No history found.`);
                }

                // Small delay to avoid Yahoo rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (err) {
                console.log(`❌ Error for ${stock.symbol}: ${err.message}`);
            }
        }

        console.log('\n✨ Database sync with real market data complete!');

    } catch (error) {
        console.error('\n❌ Sync failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

syncRealData();
