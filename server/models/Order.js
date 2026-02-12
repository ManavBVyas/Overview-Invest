const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Nullable for AI
    user_type: { type: String, required: true }, // 'human', 'ai_retail', 'ai_institution'
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

OrderSchema.index({ symbol: 1, timestamp: 1 });

module.exports = mongoose.model('Order', OrderSchema);
