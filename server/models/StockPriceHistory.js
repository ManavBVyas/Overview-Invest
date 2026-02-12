const mongoose = require('mongoose');

const StockPriceHistorySchema = new mongoose.Schema({
    stock_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
    symbol: { type: String, required: true }, // Denormalized for easier querying
    price: { type: Number, required: true },
    recorded_at: { type: Date, default: Date.now }
});

// Optimized indexes for performance (Requirements 1.1, 1.2)
// All indexes created with background: true to avoid blocking operations

// Primary compound index: symbol + recorded_at (descending for latest-first queries)
StockPriceHistorySchema.index(
    { symbol: 1, recorded_at: -1 }, 
    { background: true, name: 'idx_symbol_recorded_at_desc' }
);

// Individual index for symbol-only queries
StockPriceHistorySchema.index(
    { symbol: 1 }, 
    { background: true, name: 'idx_symbol' }
);

// Individual index for time-based queries (descending for latest-first)
StockPriceHistorySchema.index(
    { recorded_at: -1 }, 
    { background: true, name: 'idx_recorded_at_desc' }
);

// Legacy compound index for stock_id + recorded_at (for backward compatibility)
StockPriceHistorySchema.index(
    { stock_id: 1, recorded_at: -1 }, 
    { background: true, name: 'idx_stock_id_recorded_at_desc' }
);

module.exports = mongoose.model('StockPriceHistory', StockPriceHistorySchema);
