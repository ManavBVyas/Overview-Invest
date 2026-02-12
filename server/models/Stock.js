const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    last_updated: { type: Date, default: Date.now },
    liquidity: { type: String, default: 'Medium' },
    market_state: { type: String, default: 'REGULAR' },
    sector: { type: String, default: 'Technology' },
    country: { type: String, default: 'USA' },
    risk_profile: { type: String, default: 'Low' }
});

module.exports = mongoose.model('Stock', StockSchema);
