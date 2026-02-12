const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Stock = require('./models/Stock');

/**
 * Analytics data for admin dashboard
 */

// Platform overview stats
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

// User growth over time (last 30 days)
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

// Trading activity over time (last 7 days)
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

// Top stocks by trading volume
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

        const symbols = topStocks.map(s => s._id);
        const stocks = await Stock.find({ symbol: { $in: symbols } }).lean();
        const stockMap = {};
        stocks.forEach(s => stockMap[s.symbol] = s);

        const result = topStocks.map(s => ({
            symbol: s._id,
            name: stockMap[s._id] ? stockMap[s._id].name : s._id,
            total_volume: s.total_volume,
            trade_count: s.trade_count,
            total_value: s.total_value,
            current_price: stockMap[s._id] ? stockMap[s._id].price : 0
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// User portfolio distribution
async function getPortfolioDistribution(req, res) {
    try {
        const users = await User.find({ role: 'user' }).lean();
        const stocks = await Stock.find().lean();
        const stockMap = stocks.reduce((acc, s) => { acc[s.symbol] = s.price; return acc; }, {});

        const distribution = users.map(u => {
            const holdingsValue = (u.holdings || []).reduce((sum, h) => {
                return sum + (h.quantity * (stockMap[h.symbol] || 0));
            }, 0);
            return {
                id: u._id,
                username: u.username,
                balance: u.balance,
                holdings_value: holdingsValue,
                total_value: u.balance + holdingsValue
            };
        });

        distribution.sort((a, b) => b.total_value - a.total_value);
        res.json(distribution.slice(0, 20));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Most active users (by trade count)
async function getMostActiveUsers(req, res) {
    try {
        const active = await Transaction.aggregate([
            { $match: { created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
            {
                $group: {
                    _id: "$user_id",
                    trade_count: { $sum: 1 },
                    total_volume: { $sum: "$total_amount" }
                }
            },
            { $sort: { trade_count: -1 } },
            { $limit: 10 }
        ]);

        const userIds = active.map(a => a._id);
        const users = await User.find({ _id: { $in: userIds } }).lean();
        const userMap = {};
        users.forEach(u => userMap[u._id] = u);

        const result = active.map(a => {
            const u = userMap[a._id];
            if (!u) return null;
            return {
                id: u._id,
                username: u.username,
                email: u.email,
                trade_count: a.trade_count,
                total_volume: a.total_volume,
                balance: u.balance,
                created_at: u.created_at
            };
        }).filter(Boolean);

        res.json(result);
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
    getMostActiveUsers
};
