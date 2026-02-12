const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const OptimizedQueryBuilder = require('../services/OptimizedQueryBuilder');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const StockPriceHistory = require('../models/StockPriceHistory');

describe('OptimizedQueryBuilder', () => {
    let mongoServer;
    let queryBuilder;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        queryBuilder = new OptimizedQueryBuilder();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Clear all collections
        await User.deleteMany({});
        await Stock.deleteMany({});
        await Transaction.deleteMany({});
        await StockPriceHistory.deleteMany({});
    });

    describe('batchUserPortfolios', () => {
        test('should return empty array for empty user IDs', async () => {
            const result = await queryBuilder.batchUserPortfolios([]);
            expect(result).toEqual([]);
        });

        test('should return empty array for null user IDs', async () => {
            const result = await queryBuilder.batchUserPortfolios(null);
            expect(result).toEqual([]);
        });

        test('should batch load user portfolios with current stock prices', async () => {
            // Create test stocks
            const stocks = await Stock.create([
                { symbol: 'AAPL', name: 'Apple Inc.', price: 150.00 },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2500.00 },
                { symbol: 'MSFT', name: 'Microsoft Corp.', price: 300.00 }
            ]);

            // Create test users with holdings
            const users = await User.create([
                {
                    username: 'user1',
                    email: 'user1@test.com',
                    password: 'password',
                    role: 'user',
                    balance: 5000,
                    holdings: [
                        { symbol: 'AAPL', quantity: 10, average_price: 140.00 },
                        { symbol: 'GOOGL', quantity: 2, average_price: 2400.00 }
                    ]
                },
                {
                    username: 'user2',
                    email: 'user2@test.com',
                    password: 'password',
                    role: 'user',
                    balance: 3000,
                    holdings: [
                        { symbol: 'MSFT', quantity: 5, average_price: 280.00 }
                    ]
                }
            ]);

            const userIds = users.map(u => u._id.toString());
            const result = await queryBuilder.batchUserPortfolios(userIds);

            expect(result).toHaveLength(2);
            
            // Check first user
            const user1 = result.find(u => u.username === 'user1');
            expect(user1).toBeDefined();
            expect(user1.balance).toBe(5000);
            expect(user1.holdings).toHaveLength(2);
            expect(user1.holdings[0].current_price).toBe(150.00); // AAPL current price
            expect(user1.holdings[1].current_price).toBe(2500.00); // GOOGL current price
            expect(user1.holdings_value).toBe(10 * 150 + 2 * 2500); // 1500 + 5000 = 6500
            expect(user1.total_value).toBe(5000 + 6500); // 11500

            // Check second user
            const user2 = result.find(u => u.username === 'user2');
            expect(user2).toBeDefined();
            expect(user2.balance).toBe(3000);
            expect(user2.holdings).toHaveLength(1);
            expect(user2.holdings[0].current_price).toBe(300.00); // MSFT current price
            expect(user2.holdings_value).toBe(5 * 300); // 1500
            expect(user2.total_value).toBe(3000 + 1500); // 4500
        });

        test('should handle users with no holdings', async () => {
            const user = await User.create({
                username: 'user_no_holdings',
                email: 'user@test.com',
                password: 'password',
                role: 'user',
                balance: 1000,
                holdings: []
            });

            const result = await queryBuilder.batchUserPortfolios([user._id.toString()]);

            expect(result).toHaveLength(1);
            expect(result[0].holdings).toHaveLength(0);
            expect(result[0].holdings_value).toBe(0);
            expect(result[0].total_value).toBe(1000);
        });

        test('should handle missing stock prices gracefully', async () => {
            const user = await User.create({
                username: 'user_missing_stock',
                email: 'user@test.com',
                password: 'password',
                role: 'user',
                balance: 1000,
                holdings: [
                    { symbol: 'UNKNOWN', quantity: 10, average_price: 50.00 }
                ]
            });

            const result = await queryBuilder.batchUserPortfolios([user._id.toString()]);

            expect(result).toHaveLength(1);
            expect(result[0].holdings).toHaveLength(1);
            expect(result[0].holdings[0].current_price).toBe(50.00); // Falls back to average_price
            expect(result[0].holdings[0].name).toBe('UNKNOWN'); // Falls back to symbol
        });
    });

    describe('batchStockPrices', () => {
        test('should return empty map for empty symbols', async () => {
            const result = await queryBuilder.batchStockPrices([]);
            expect(result.size).toBe(0);
        });

        test('should batch load stock prices', async () => {
            await Stock.create([
                { symbol: 'AAPL', name: 'Apple Inc.', price: 150.00, sector: 'Technology' },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2500.00, sector: 'Technology' }
            ]);

            const result = await queryBuilder.batchStockPrices(['AAPL', 'GOOGL']);

            expect(result.size).toBe(2);
            expect(result.get('AAPL').price).toBe(150.00);
            expect(result.get('AAPL').name).toBe('Apple Inc.');
            expect(result.get('GOOGL').price).toBe(2500.00);
            expect(result.get('GOOGL').name).toBe('Alphabet Inc.');
        });
    });

    describe('batchUserDetails', () => {
        test('should return empty map for empty user IDs', async () => {
            const result = await queryBuilder.batchUserDetails([]);
            expect(result.size).toBe(0);
        });

        test('should batch load user details', async () => {
            const users = await User.create([
                { username: 'user1', email: 'user1@test.com', password: 'password', balance: 1000 },
                { username: 'user2', email: 'user2@test.com', password: 'password', balance: 2000 }
            ]);

            const userIds = users.map(u => u._id.toString());
            const result = await queryBuilder.batchUserDetails(userIds);

            expect(result.size).toBe(2);
            expect(result.get(userIds[0]).username).toBe('user1');
            expect(result.get(userIds[0]).balance).toBe(1000);
            expect(result.get(userIds[1]).username).toBe('user2');
            expect(result.get(userIds[1]).balance).toBe(2000);
        });
    });

    describe('getOptimizedPortfolioDistribution', () => {
        test('should return empty array when no users exist', async () => {
            const result = await queryBuilder.getOptimizedPortfolioDistribution();
            expect(result).toEqual([]);
        });

        test('should return portfolio distribution sorted by total value', async () => {
            // Create stocks
            await Stock.create([
                { symbol: 'AAPL', name: 'Apple Inc.', price: 150.00 },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2500.00 }
            ]);

            // Create users with different portfolio values
            await User.create([
                {
                    username: 'rich_user',
                    email: 'rich@test.com',
                    password: 'password',
                    role: 'user',
                    balance: 10000,
                    holdings: [{ symbol: 'GOOGL', quantity: 4, average_price: 2400.00 }] // 4 * 2500 = 10000
                },
                {
                    username: 'poor_user',
                    email: 'poor@test.com',
                    password: 'password',
                    role: 'user',
                    balance: 1000,
                    holdings: [{ symbol: 'AAPL', quantity: 2, average_price: 140.00 }] // 2 * 150 = 300
                }
            ]);

            const result = await queryBuilder.getOptimizedPortfolioDistribution();

            expect(result).toHaveLength(2);
            // Should be sorted by total_value descending
            expect(result[0].username).toBe('rich_user');
            expect(result[0].total_value).toBe(20000); // 10000 balance + 10000 holdings
            expect(result[1].username).toBe('poor_user');
            expect(result[1].total_value).toBe(1300); // 1000 balance + 300 holdings
        });

        test('should respect limit parameter', async () => {
            // Create multiple users
            const users = [];
            for (let i = 0; i < 5; i++) {
                users.push({
                    username: `user${i}`,
                    email: `user${i}@test.com`,
                    password: 'password',
                    role: 'user',
                    balance: 1000 * (i + 1)
                });
            }
            await User.create(users);

            const result = await queryBuilder.getOptimizedPortfolioDistribution(3);
            expect(result).toHaveLength(3);
        });
    });

    describe('getOptimizedMostActiveUsers', () => {
        test('should return empty array when no transactions exist', async () => {
            const result = await queryBuilder.getOptimizedMostActiveUsers();
            expect(result).toEqual([]);
        });

        test('should return most active users sorted by trade count', async () => {
            // Create users
            const users = await User.create([
                { username: 'active_user', email: 'active@test.com', password: 'password' },
                { username: 'inactive_user', email: 'inactive@test.com', password: 'password' }
            ]);

            // Create transactions
            const now = new Date();
            await Transaction.create([
                { user_id: users[0]._id, symbol: 'AAPL', type: 'BUY', quantity: 10, total_amount: 1500, created_at: now },
                { user_id: users[0]._id, symbol: 'GOOGL', type: 'BUY', quantity: 1, total_amount: 2500, created_at: now },
                { user_id: users[0]._id, symbol: 'AAPL', type: 'SELL', quantity: 5, total_amount: 750, created_at: now },
                { user_id: users[1]._id, symbol: 'MSFT', type: 'BUY', quantity: 2, total_amount: 600, created_at: now }
            ]);

            const result = await queryBuilder.getOptimizedMostActiveUsers();

            expect(result).toHaveLength(2);
            // Should be sorted by trade_count descending
            expect(result[0].username).toBe('active_user');
            expect(result[0].trade_count).toBe(3);
            expect(result[0].total_volume).toBe(4750); // 1500 + 2500 + 750
            expect(result[1].username).toBe('inactive_user');
            expect(result[1].trade_count).toBe(1);
            expect(result[1].total_volume).toBe(600);
        });

        test('should filter by date range', async () => {
            const user = await User.create({
                username: 'test_user',
                email: 'test@test.com',
                password: 'password'
            });

            const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
            const recentDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 day ago

            await Transaction.create([
                { user_id: user._id, symbol: 'AAPL', type: 'BUY', quantity: 10, total_amount: 1500, created_at: oldDate },
                { user_id: user._id, symbol: 'GOOGL', type: 'BUY', quantity: 1, total_amount: 2500, created_at: recentDate }
            ]);

            const result = await queryBuilder.getOptimizedMostActiveUsers(7); // Last 7 days

            expect(result).toHaveLength(1);
            expect(result[0].trade_count).toBe(1); // Only the recent transaction
            expect(result[0].total_volume).toBe(2500);
        });
    });

    describe('eliminateNPlusOne', () => {
        test('should eliminate N+1 queries using generic helper', async () => {
            // Create test data
            const stocks = await Stock.create([
                { symbol: 'AAPL', name: 'Apple Inc.', price: 150.00 },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2500.00 }
            ]);

            const transactions = [
                { symbol: 'AAPL', quantity: 10 },
                { symbol: 'GOOGL', quantity: 2 },
                { symbol: 'AAPL', quantity: 5 }
            ];

            const result = await queryBuilder.eliminateNPlusOne(
                transactions,
                (tx) => tx.symbol, // Key extractor
                (symbols) => Stock.find({ symbol: { $in: symbols } }).lean(), // Relation loader
                (stock) => stock.symbol, // Relation key extractor
                (tx, stock) => ({ ...tx, stockName: stock ? stock.name : 'Unknown' }) // Combiner
            );

            expect(result).toHaveLength(3);
            expect(result[0].stockName).toBe('Apple Inc.');
            expect(result[1].stockName).toBe('Alphabet Inc.');
            expect(result[2].stockName).toBe('Apple Inc.');
        });

        test('should handle missing relations gracefully', async () => {
            const transactions = [
                { symbol: 'UNKNOWN', quantity: 10 }
            ];

            const result = await queryBuilder.eliminateNPlusOne(
                transactions,
                (tx) => tx.symbol,
                (symbols) => Stock.find({ symbol: { $in: symbols } }).lean(),
                (stock) => stock.symbol,
                (tx, stock) => ({ ...tx, stockName: stock ? stock.name : 'Unknown' })
            );

            expect(result).toHaveLength(1);
            expect(result[0].stockName).toBe('Unknown');
        });
    });

    describe('batchStockPriceHistory', () => {
        test('should return empty map for empty symbols', async () => {
            const result = await queryBuilder.batchStockPriceHistory([]);
            expect(result.size).toBe(0);
        });

        test('should batch load price history for multiple symbols', async () => {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

            await StockPriceHistory.create([
                { symbol: 'AAPL', price: 148.00, recorded_at: twoHoursAgo },
                { symbol: 'AAPL', price: 149.00, recorded_at: oneHourAgo },
                { symbol: 'AAPL', price: 150.00, recorded_at: now },
                { symbol: 'GOOGL', price: 2480.00, recorded_at: oneHourAgo },
                { symbol: 'GOOGL', price: 2500.00, recorded_at: now }
            ]);

            const result = await queryBuilder.batchStockPriceHistory(['AAPL', 'GOOGL'], 3);

            expect(result.size).toBe(2);
            expect(result.get('AAPL')).toHaveLength(3);
            expect(result.get('GOOGL')).toHaveLength(2);
            
            // Check AAPL history is sorted by time
            const aaplHistory = result.get('AAPL');
            expect(aaplHistory[0].price).toBe(148.00);
            expect(aaplHistory[1].price).toBe(149.00);
            expect(aaplHistory[2].price).toBe(150.00);
        });

        test('should filter by time range', async () => {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

            await StockPriceHistory.create([
                { symbol: 'AAPL', price: 140.00, recorded_at: threeDaysAgo },
                { symbol: 'AAPL', price: 149.00, recorded_at: oneHourAgo },
                { symbol: 'AAPL', price: 150.00, recorded_at: now }
            ]);

            const result = await queryBuilder.batchStockPriceHistory(['AAPL'], 2); // Last 2 hours

            expect(result.get('AAPL')).toHaveLength(2); // Should exclude the 3-day-old entry
            expect(result.get('AAPL')[0].price).toBe(149.00);
            expect(result.get('AAPL')[1].price).toBe(150.00);
        });
    });
});