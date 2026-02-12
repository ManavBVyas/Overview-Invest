const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Stock = require('./models/Stock');
const StockPriceHistory = require('./models/StockPriceHistory');
const OptimizedQueryBuilder = require('./services/OptimizedQueryBuilder');

/**
 * Optimized analytics module with N+1 query elimination
 * Uses OptimizedQueryBuilder to batch database queries and improve performance
 */

// Initialize the query builder
const queryBuilder = new OptimizedQueryBuilder();

// Platform overview stats (no changes needed - already optimized)
async function getPlatformStats(req, res) {
    try {
        const total_users = await User.countDocuments();
        const active_users = await User.countDocuments({ is_active: true });

        const cashAgg = await User.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]);
        const total_cash = cashAgg.length > 0 ? cashAgg[0].total : 0;

        const total_trades = await Transaction.countDocuments();
        const total_stocks = await Stock.countDocuments();

        res.json({
            total_users,
            active_users,
            total_cash,
            total_trades,
            total_stocks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// User growth over time (no changes needed - already optimized)
async function getUserGrowth(req, res) {
    try {
        const growth = await User.aggregate([
            { $match: { created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        let cum = 0;
        const result = growth.map(g => {
            cum += g.count;
            return { date: g._id, new_users: g.count, cumulative_users: cum };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Trading activity over time (no changes needed - already optimized)
async function getTradingActivity(req, res) {
    try {
        const activity = await Transaction.aggregate([
            { $match: { created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    total_trades: { $sum: 1 },
                    buy_trades: { $sum: { $cond: [{ $eq: ["$type", "BUY"] }, 1, 0] } },
                    sell_trades: { $sum: { $cond: [{ $eq: ["$type", "SELL"] }, 1, 0] } },
                    volume: { $sum: "$total_amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const result = activity.map(a => ({
            date: a._id,
            ...a
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Top stocks by trading volume (optimized - uses batch loading)
async function getTopStocks(req, res) {
    try {
        const topStocks = await Transaction.aggregate([
            { $match: { created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
            {
                $group: {
                    _id: "$symbol",
                    trade_count: { $sum: 1 },
                    total_volume: { $sum: "$quantity" },
                    total_value: { $sum: "$total_amount" }
                }
            },
            { $sort: { total_value: -1 } },
            { $limit: 10 }
        ]);

        if (topStocks.length === 0) {
            return res.json([]);
        }

        // Use batch loading to get stock details
        const symbols = topStocks.map(s => s._id);
        const stockMap = await queryBuilder.batchStockPrices(symbols);

        const result = topStocks.map(s => {
            const stockInfo = stockMap.get(s._id);
            return {
                symbol: s._id,
                name: stockInfo ? stockInfo.name : s._id,
                total_volume: s.total_volume,
                trade_count: s.trade_count,
                total_value: s.total_value,
                current_price: stockInfo ? stockInfo.price : 0
            };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// OPTIMIZED: User portfolio distribution - eliminates N+1 queries
async function getPortfolioDistribution(req, res) {
    try {
        // Use optimized query builder to eliminate N+1 queries
        const distribution = await queryBuilder.getOptimizedPortfolioDistribution(20);
        res.json(distribution);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Stock price history for charts (optimized with proper indexing)
async function getStockPriceHistory(req, res) {
    const { symbol } = req.params;
    const hours = parseInt(req.query.hours) || 24;

    try {
        // Use batch loading even for single symbol to leverage optimized indexing
        const historyMap = await queryBuilder.batchStockPriceHistory([symbol], hours);
        const history = historyMap.get(symbol) || [];
        
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// OPTIMIZED: Most active users - eliminates N+1 queries
async function getMostActiveUsers(req, res) {
    try {
        // Use optimized query builder to eliminate N+1 queries
        const activeUsers = await queryBuilder.getOptimizedMostActiveUsers(7, 10);
        res.json(activeUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getPlatformStats,
    getUserGrowth,
    getTradingActivity,
    getTopStocks,
    getPortfolioDistribution,
    getStockPriceHistory,
    getMostActiveUsers
};