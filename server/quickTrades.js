const QuickTrade = require('./models/QuickTrade');
const User = require('./models/User');
const Stock = require('./models/Stock');

/**
 * Quick Trades / Binary Options Trading System
 * Users predict if price will go UP or DOWN within a time period
 */

// Duration options in minutes
const ALLOWED_DURATIONS = [1, 2, 5, 10, 30, 60, 1440]; // 1min to 1 day
const DEFAULT_PAYOUT = 80; // 80% profit on win

/**
 * Create a new quick trade
 */
async function createQuickTrade(req, res) {
    const { symbol, amount, prediction, duration } = req.body;
    const userId = req.user.id;

    try {
        // Validation
        if (!['UP', 'DOWN'].includes(prediction)) {
            return res.status(400).json({ message: 'Prediction must be UP or DOWN' });
        }

        if (!ALLOWED_DURATIONS.includes(parseInt(duration))) {
            return res.status(400).json({ message: 'Invalid duration' });
        }

        const tradeAmount = parseFloat(amount);
        if (tradeAmount <= 0) {
            return res.status(400).json({ message: 'Amount must be positive' });
        }

        // Check user balance
        const user = await User.findById(userId);
        if (user.balance < tradeAmount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Get current stock price
        const stock = await Stock.findOne({ symbol });
        if (!stock) {
            return res.status(404).json({ message: 'Stock not found' });
        }

        const entryPrice = parseFloat(stock.price);
        const expiresAt = new Date(Date.now() + duration * 60 * 1000);

        // Deduct amount from user balance
        user.balance -= tradeAmount;
        await user.save();

        // Create quick trade
        const trade = await QuickTrade.create({
            user_id: userId,
            symbol,
            entry_price: entryPrice,
            amount: tradeAmount,
            prediction,
            duration_minutes: duration,
            expires_at: expiresAt
        });

        res.json({
            message: 'Quick trade created',
            trade
        });

    } catch (error) {
        console.error('Error creating quick trade:', error);
        res.status(500).json({ message: error.message });
    }
}

/**
 * Get user's active quick trades
 */
async function getActiveQuickTrades(req, res) {
    const userId = req.user.id;

    try {
        const trades = await QuickTrade.find({ user_id: userId, status: 'ACTIVE' }).sort({ created_at: -1 }).lean();

        // Populate current price
        const symbols = trades.map(t => t.symbol);
        const stocks = await Stock.find({ symbol: { $in: symbols } }).lean();
        const stockMap = {};
        stocks.forEach(s => stockMap[s.symbol] = s);

        const result = trades.map(t => ({
            ...t,
            stock_name: stockMap[t.symbol] ? stockMap[t.symbol].name : t.symbol,
            current_price: stockMap[t.symbol] ? stockMap[t.symbol].price : 0
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Get user's quick trade history
 */
async function getQuickTradeHistory(req, res) {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    try {
        const trades = await QuickTrade.find({ user_id: userId, status: { $ne: 'ACTIVE' } })
            .sort({ settled_at: -1 })
            .limit(limit)
            .lean();

        // Populate stock name if needed (optional optimization)
        const symbols = [...new Set(trades.map(t => t.symbol))];
        const stocks = await Stock.find({ symbol: { $in: symbols } }).lean();
        const stockMap = {};
        stocks.forEach(s => stockMap[s.symbol] = s);

        const result = trades.map(t => ({
            ...t,
            stock_name: stockMap[t.symbol] ? stockMap[t.symbol].name : t.symbol
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Settle expired quick trades (called by cron job)
 */
async function settleExpiredTrades() {
    try {
        // Find all expired active trades
        const expiredTrades = await QuickTrade.find({
            status: 'ACTIVE',
            expires_at: { $lte: new Date() }
        });

        if (expiredTrades.length > 0) {
            console.log(`⏰ Settling ${expiredTrades.length} expired quick trades...`);
        }

        for (const trade of expiredTrades) {
            await settleTrade(trade);
        }

        if (expiredTrades.length > 0) {
            console.log(`✅ Settled ${expiredTrades.length} quick trades`);
        }

    } catch (error) {
        console.error('Error settling trades:', error);
    }
}

/**
 * Settle individual trade
 */
async function settleTrade(trade) {
    try {
        const stock = await Stock.findOne({ symbol: trade.symbol });
        const exitPrice = stock ? stock.price : trade.entry_price; // Fallback? Or fail?

        const entryPrice = trade.entry_price;
        const amount = trade.amount;

        // Determine if prediction was correct
        let isWin = false;
        if (trade.prediction === 'UP' && exitPrice > entryPrice) {
            isWin = true;
        } else if (trade.prediction === 'DOWN' && exitPrice < entryPrice) {
            isWin = true;
        }

        // Calculate profit/loss
        let profitLoss = 0;
        let status = 'LOST';

        if (isWin) {
            profitLoss = amount * (DEFAULT_PAYOUT / 100);
            status = 'WON';
        } else {
            profitLoss = -amount;
        }

        const totalReturn = isWin ? amount + profitLoss : 0;

        // Update trade
        trade.status = status;
        trade.exit_price = exitPrice;
        trade.profit_loss = profitLoss;
        trade.settled_at = new Date();
        await trade.save();

        // Credit user if won
        if (totalReturn > 0) {
            await User.findByIdAndUpdate(trade.user_id, { $inc: { balance: totalReturn } });
        }

        console.log(`💰 Quick trade #${trade._id}: ${status} | ${trade.symbol} ${trade.prediction} | Entry: $${entryPrice} → Exit: $${exitPrice} | P/L: $${profitLoss.toFixed(2)}`);

    } catch (error) {
        console.error(`Error settling trade #${trade._id}:`, error);
    }
}

/**
 * Manual settlement endpoint (for testing/admin)
 */
async function forceSettleTrade(req, res) {
    const { tradeId } = req.body;

    try {
        const trade = await QuickTrade.findById(tradeId);
        if (!trade || trade.status !== 'ACTIVE') {
            return res.status(404).json({ message: 'Trade not found or already settled' });
        }

        await settleTrade(trade);
        res.json({ message: 'Trade settled successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Get quick trade statistics
 */
async function getQuickTradeStats(req, res) {
    const userId = req.user.id;

    try {
        const stats = await QuickTrade.aggregate([
            { $match: { user_id: new mongoose.Types.ObjectId(userId), status: { $in: ['WON', 'LOST'] } } },
            {
                $group: {
                    _id: null,
                    total_trades: { $sum: 1 },
                    wins: { $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] } },
                    losses: { $sum: { $cond: [{ $eq: ["$status", "LOST"] }, 1, 0] } },
                    total_profit: { $sum: { $cond: [{ $eq: ["$status", "WON"] }, "$profit_loss", 0] } },
                    total_loss: { $sum: { $cond: [{ $eq: ["$status", "LOST"] }, "$profit_loss", 0] } },
                    net_profit: { $sum: "$profit_loss" }
                }
            }
        ]);

        const result = stats[0] || {
            total_trades: 0, wins: 0, losses: 0, total_profit: 0, total_loss: 0, net_profit: 0
        };

        result.win_rate = result.total_trades > 0
            ? ((result.wins / result.total_trades) * 100).toFixed(2)
            : 0;

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createQuickTrade,
    getActiveQuickTrades,
    getQuickTradeHistory,
    settleExpiredTrades,
    forceSettleTrade,
    getQuickTradeStats,
    ALLOWED_DURATIONS
};
