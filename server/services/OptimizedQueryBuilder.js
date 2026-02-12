const User = require('../models/User');
const Stock = require('../models/Stock');
const StockPriceHistory = require('../models/StockPriceHistory');
const Transaction = require('../models/Transaction');

/**
 * OptimizedQueryBuilder - Eliminates N+1 query patterns through batch loading
 * 
 * This class implements query batching and N+1 elimination as specified in:
 * Requirements 1.3, 1.5 - Database Layer SHALL eliminate N+1 query patterns through batch loading
 * Requirements 1.5 - Database Layer SHALL batch price lookups into single queries
 */
class OptimizedQueryBuilder {
    
    /**
     * Batch load user portfolios with current stock prices
     * Eliminates N+1 queries by:
     * 1. Single query to get all users
     * 2. Single query to get all unique stock prices
     * 3. In-memory joining of data
     * 
     * @param {string[]} userIds - Array of user IDs to load portfolios for
     * @returns {Promise<Object[]>} Array of user portfolios with current prices
     */
    async batchUserPortfolios(userIds) {
        if (!userIds || userIds.length === 0) {
            return [];
        }

        // Single query to get all users
        const users = await User.find({ 
            _id: { $in: userIds },
            role: 'user' 
        }).lean();

        if (users.length === 0) {
            return [];
        }

        // Extract all unique symbols from all user holdings
        const allSymbols = new Set();
        users.forEach(user => {
            if (user.holdings && user.holdings.length > 0) {
                user.holdings.forEach(holding => {
                    allSymbols.add(holding.symbol);
                });
            }
        });

        const symbols = Array.from(allSymbols);
        
        // Single query to get all current stock prices
        const stocks = await Stock.find({ 
            symbol: { $in: symbols } 
        }).lean();

        // Build price lookup map for O(1) access
        const stockMap = new Map();
        stocks.forEach(stock => {
            stockMap.set(stock.symbol, {
                price: stock.price,
                name: stock.name,
                last_updated: stock.last_updated
            });
        });

        // Augment user portfolios with current prices
        return users.map(user => {
            const holdings = (user.holdings || []).map(holding => {
                const stockInfo = stockMap.get(holding.symbol);
                return {
                    ...holding,
                    current_price: stockInfo ? stockInfo.price : holding.average_price,
                    name: stockInfo ? stockInfo.name : holding.symbol,
                    last_updated: stockInfo ? stockInfo.last_updated : null
                };
            });

            // Calculate total holdings value
            const holdingsValue = holdings.reduce((sum, holding) => {
                return sum + (holding.quantity * holding.current_price);
            }, 0);

            return {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
                holdings: holdings,
                holdings_value: holdingsValue,
                total_value: user.balance + holdingsValue,
                created_at: user.created_at
            };
        });
    }

    /**
     * Batch load stock prices for multiple symbols
     * Eliminates N+1 queries when augmenting portfolios with current prices
     * 
     * @param {string[]} symbols - Array of stock symbols
     * @returns {Promise<Map<string, Object>>} Map of symbol to stock data
     */
    async batchStockPrices(symbols) {
        if (!symbols || symbols.length === 0) {
            return new Map();
        }

        const stocks = await Stock.find({ 
            symbol: { $in: symbols } 
        }).lean();

        const stockMap = new Map();
        stocks.forEach(stock => {
            stockMap.set(stock.symbol, {
                price: stock.price,
                name: stock.name,
                last_updated: stock.last_updated,
                sector: stock.sector,
                market_state: stock.market_state
            });
        });

        return stockMap;
    }

    /**
     * Batch load user details for multiple user IDs
     * Eliminates N+1 queries when augmenting transaction/activity data with user info
     * 
     * @param {string[]} userIds - Array of user IDs
     * @returns {Promise<Map<string, Object>>} Map of user ID to user data
     */
    async batchUserDetails(userIds) {
        if (!userIds || userIds.length === 0) {
            return new Map();
        }

        const users = await User.find({ 
            _id: { $in: userIds } 
        }).lean();

        const userMap = new Map();
        users.forEach(user => {
            userMap.set(user._id.toString(), {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
                created_at: user.created_at,
                is_active: user.is_active
            });
        });

        return userMap;
    }

    /**
     * Optimized portfolio distribution query
     * Replaces the N+1 pattern in analytics.getPortfolioDistribution()
     * 
     * @param {number} limit - Maximum number of results to return (default: 20)
     * @returns {Promise<Object[]>} Array of user portfolio distributions
     */
    async getOptimizedPortfolioDistribution(limit = 20) {
        // Single aggregation query to get all users with role 'user'
        const users = await User.find({ role: 'user' }).lean();
        
        if (users.length === 0) {
            return [];
        }

        const userIds = users.map(user => user._id.toString());
        
        // Use batch loading to get portfolios with current prices
        const portfolios = await this.batchUserPortfolios(userIds);
        
        // Sort by total value and limit results
        portfolios.sort((a, b) => b.total_value - a.total_value);
        
        return portfolios.slice(0, limit);
    }

    /**
     * Optimized most active users query
     * Replaces the N+1 pattern in analytics.getMostActiveUsers()
     * 
     * @param {number} days - Number of days to look back (default: 7)
     * @param {number} limit - Maximum number of results to return (default: 10)
     * @returns {Promise<Object[]>} Array of most active users with details
     */
    async getOptimizedMostActiveUsers(days = 7, limit = 10) {
        const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        // Single aggregation query to get user activity
        const activeUsers = await Transaction.aggregate([
            { $match: { created_at: { $gte: dateThreshold } } },
            {
                $group: {
                    _id: "$user_id",
                    trade_count: { $sum: 1 },
                    total_volume: { $sum: "$total_amount" }
                }
            },
            { $sort: { trade_count: -1 } },
            { $limit: limit }
        ]);

        if (activeUsers.length === 0) {
            return [];
        }

        // Extract user IDs and batch load user details
        const userIds = activeUsers.map(activity => activity._id.toString());
        const userMap = await this.batchUserDetails(userIds);

        // Combine activity data with user details
        return activeUsers.map(activity => {
            const userId = activity._id.toString();
            const userDetails = userMap.get(userId);
            
            if (!userDetails) {
                return null; // Skip if user not found
            }

            return {
                ...userDetails,
                trade_count: activity.trade_count,
                total_volume: activity.total_volume
            };
        }).filter(Boolean); // Remove null entries
    }

    /**
     * Optimized user portfolio query for single user
     * Replaces the pattern in /api/user/portfolio endpoint
     * 
     * @param {string} userId - User ID to get portfolio for
     * @returns {Promise<Object|null>} User portfolio with current prices or null if not found
     */
    async getOptimizedUserPortfolio(userId) {
        const portfolios = await this.batchUserPortfolios([userId]);
        return portfolios.length > 0 ? portfolios[0] : null;
    }

    /**
     * Generic N+1 elimination helper
     * Loads related entities in batch to eliminate N+1 queries
     * 
     * @param {Array} entities - Array of entities that need related data
     * @param {Function} keyExtractor - Function to extract foreign key from entity
     * @param {Function} relationLoader - Function that takes array of keys and returns related entities
     * @param {Function} relationKeyExtractor - Function to extract key from related entity
     * @param {Function} combiner - Function to combine entity with its related data
     * @returns {Promise<Array>} Array of entities with related data attached
     */
    async eliminateNPlusOne(entities, keyExtractor, relationLoader, relationKeyExtractor, combiner) {
        if (!entities || entities.length === 0) {
            return [];
        }

        // Extract all unique foreign keys
        const foreignKeys = [...new Set(entities.map(keyExtractor).filter(Boolean))];
        
        if (foreignKeys.length === 0) {
            return entities.map(entity => combiner(entity, null));
        }

        // Single query to load all related entities
        const relatedEntities = await relationLoader(foreignKeys);
        
        // Build lookup map
        const relationMap = new Map();
        relatedEntities.forEach(related => {
            const key = relationKeyExtractor(related);
            relationMap.set(key, related);
        });

        // Combine entities with their related data
        return entities.map(entity => {
            const foreignKey = keyExtractor(entity);
            const relatedData = relationMap.get(foreignKey);
            return combiner(entity, relatedData);
        });
    }

    /**
     * Batch load recent stock price history for multiple symbols
     * Optimizes price history queries with proper indexing
     * 
     * @param {string[]} symbols - Array of stock symbols
     * @param {number} hours - Hours of history to fetch (default: 24)
     * @returns {Promise<Map<string, Object[]>>} Map of symbol to price history array
     */
    async batchStockPriceHistory(symbols, hours = 24) {
        if (!symbols || symbols.length === 0) {
            return new Map();
        }

        const dateThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);
        
        // Single query using optimized compound index (symbol + recorded_at)
        const priceHistory = await StockPriceHistory.find({
            symbol: { $in: symbols },
            recorded_at: { $gte: dateThreshold }
        })
        .select('symbol price recorded_at')
        .sort({ symbol: 1, recorded_at: 1 })
        .lean();

        // Group by symbol
        const historyMap = new Map();
        priceHistory.forEach(entry => {
            if (!historyMap.has(entry.symbol)) {
                historyMap.set(entry.symbol, []);
            }
            historyMap.get(entry.symbol).push({
                price: entry.price,
                time: entry.recorded_at
            });
        });

        return historyMap;
    }
}

module.exports = OptimizedQueryBuilder;