const mongoose = require('mongoose');

const QuickTradeSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    entry_price: { type: Number, required: true },
    exit_price: { type: Number },
    amount: { type: Number, required: true },
    prediction: { type: String, enum: ['UP', 'DOWN'], required: true },
    duration_minutes: { type: Number, required: true },
    status: { type: String, enum: ['ACTIVE', 'WON', 'LOST'], default: 'ACTIVE' },
    profit_loss: { type: Number, default: 0.00 },
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true },
    settled_at: { type: Date }
});

module.exports = mongoose.model('QuickTrade', QuickTradeSchema);
