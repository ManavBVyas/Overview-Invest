const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const StockPriceHistory = require('../models/StockPriceHistory');
const { optimizeStockPriceHistoryIndexes, verifyIndexPerformance } = require('../optimize-indexes');

/**
 * Unit Tests for MongoDB Index Optimization
 * 
 * These tests validate the index configuration and optimization logic
 * for the StockPriceHistory collection according to requirements 1.1 and 1.2.
 */

describe('MongoDB Index Optimization', () => {
  let mongoServer;
  let mongoUri;

  beforeAll(async () => {
    // Start in-memory MongoDB instance for testing
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    
    // Connect to test database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collection before each test
    await StockPriceHistory.deleteMany({});
  });

  describe('Index Configuration', () => {
    test('should have correct indexes defined in schema', () => {
      const indexes = StockPriceHistory.schema.indexes();
      
      // Verify we have the expected number of indexes
      expect(indexes.length).toBe(4);
      
      // Check compound index: symbol + recorded_at (descending)
      const compoundIndex = indexes.find(idx => 
        idx[0].symbol === 1 && idx[0].recorded_at === -1
      );
      expect(compoundIndex).toBeDefined();
      expect(compoundIndex[1].background).toBe(true);
      expect(compoundIndex[1].name).toBe('idx_symbol_recorded_at_desc');
      
      // Check individual symbol index
      const symbolIndex = indexes.find(idx => 
        idx[0].symbol === 1 && !idx[0].recorded_at
      );
      expect(symbolIndex).toBeDefined();
      expect(symbolIndex[1].background).toBe(true);
      expect(symbolIndex[1].name).toBe('idx_symbol');
      
      // Check individual recorded_at index
      const timeIndex = indexes.find(idx => 
        idx[0].recorded_at === -1 && !idx[0].symbol
      );
      expect(timeIndex).toBeDefined();
      expect(timeIndex[1].background).toBe(true);
      expect(timeIndex[1].name).toBe('idx_recorded_at_desc');
      
      // Check legacy stock_id + recorded_at index
      const legacyIndex = indexes.find(idx => 
        idx[0].stock_id === 1 && idx[0].recorded_at === -1
      );
      expect(legacyIndex).toBeDefined();
      expect(legacyIndex[1].background).toBe(true);
      expect(legacyIndex[1].name).toBe('idx_stock_id_recorded_at_desc');
    });

    test('should create indexes with background option', () => {
      const indexes = StockPriceHistory.schema.indexes();
      
      // All custom indexes should have background: true
      indexes.forEach(index => {
        expect(index[1].background).toBe(true);
      });
    });

    test('should have descriptive index names', () => {
      const indexes = StockPriceHistory.schema.indexes();
      const indexNames = indexes.map(idx => idx[1].name);
      
      expect(indexNames).toContain('idx_symbol_recorded_at_desc');
      expect(indexNames).toContain('idx_symbol');
      expect(indexNames).toContain('idx_recorded_at_desc');
      expect(indexNames).toContain('idx_stock_id_recorded_at_desc');
    });
  });

  describe('Index Creation and Optimization', () => {
    test('should create sample data for testing', async () => {
      const sampleData = [
        {
          stock_id: new mongoose.Types.ObjectId(),
          symbol: 'AAPL',
          price: 175.23,
          recorded_at: new Date('2024-01-01T10:00:00Z')
        },
        {
          stock_id: new mongoose.Types.ObjectId(),
          symbol: 'AAPL',
          price: 176.45,
          recorded_at: new Date('2024-01-01T11:00:00Z')
        },
        {
          stock_id: new mongoose.Types.ObjectId(),
          symbol: 'GOOGL',
          price: 142.56,
          recorded_at: new Date('2024-01-01T10:00:00Z')
        }
      ];

      await StockPriceHistory.insertMany(sampleData);
      const count = await StockPriceHistory.countDocuments();
      expect(count).toBe(3);
    });

    test('should verify indexes are created in database', async () => {
      // Insert some data to trigger index creation
      await StockPriceHistory.create({
        stock_id: new mongoose.Types.ObjectId(),
        symbol: 'TEST',
        price: 100.00,
        recorded_at: new Date()
      });

      const collection = mongoose.connection.db.collection('stockpricehistories');
      const indexes = await collection.indexes();
      
      // Should have _id_ index plus our custom indexes
      expect(indexes.length).toBeGreaterThan(1);
      
      // Check for our custom indexes
      const indexNames = indexes.map(idx => idx.name);
      expect(indexNames).toContain('idx_symbol_recorded_at_desc');
      expect(indexNames).toContain('idx_symbol');
      expect(indexNames).toContain('idx_recorded_at_desc');
    });
  });

  describe('Query Performance Validation', () => {
    beforeEach(async () => {
      // Create test data with various symbols and timestamps
      const testData = [];
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
      const baseDate = new Date('2024-01-01T00:00:00Z');
      
      for (let i = 0; i < 100; i++) {
        for (const symbol of symbols) {
          testData.push({
            stock_id: new mongoose.Types.ObjectId(),
            symbol: symbol,
            price: 100 + Math.random() * 50,
            recorded_at: new Date(baseDate.getTime() + i * 60 * 60 * 1000) // Hourly intervals
          });
        }
      }
      
      await StockPriceHistory.insertMany(testData);
    });

    test('should perform symbol-based queries efficiently', async () => {
      const startTime = Date.now();
      
      const result = await StockPriceHistory.find({ symbol: 'AAPL' })
        .sort({ recorded_at: -1 })
        .limit(10);
      
      const executionTime = Date.now() - startTime;
      
      expect(result.length).toBe(10);
      expect(result[0].symbol).toBe('AAPL');
      expect(executionTime).toBeLessThan(100); // Should be much faster than 50ms requirement
    });

    test('should perform time-based queries efficiently', async () => {
      const startTime = Date.now();
      const recentDate = new Date('2024-01-02T00:00:00Z');
      
      const result = await StockPriceHistory.find({
        recorded_at: { $gte: recentDate }
      })
      .sort({ recorded_at: -1 })
      .limit(10);
      
      const executionTime = Date.now() - startTime;
      
      expect(result.length).toBe(10);
      expect(result[0].recorded_at.getTime()).toBeGreaterThanOrEqual(recentDate.getTime());
      expect(executionTime).toBeLessThan(100);
    });

    test('should perform compound queries efficiently', async () => {
      const startTime = Date.now();
      const recentDate = new Date('2024-01-02T00:00:00Z');
      
      const result = await StockPriceHistory.find({
        symbol: 'AAPL',
        recorded_at: { $gte: recentDate }
      })
      .sort({ recorded_at: -1 })
      .limit(10);
      
      const executionTime = Date.now() - startTime;
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].symbol).toBe('AAPL');
      expect(result[0].recorded_at.getTime()).toBeGreaterThanOrEqual(recentDate.getTime());
      expect(executionTime).toBeLessThan(100);
    });

    test('should use indexes for query execution', async () => {
      // Test symbol query uses index
      const symbolQuery = StockPriceHistory.find({ symbol: 'AAPL' }).limit(10);
      const symbolExplain = await symbolQuery.explain('executionStats');
      
      expect(symbolExplain.executionStats.totalKeysExamined).toBeGreaterThan(0);
      expect(symbolExplain.executionStats.executionTimeMillis).toBeLessThan(50);
      
      // Test compound query uses index
      const compoundQuery = StockPriceHistory.find({
        symbol: 'AAPL',
        recorded_at: { $gte: new Date('2024-01-01T00:00:00Z') }
      }).limit(10);
      const compoundExplain = await compoundQuery.explain('executionStats');
      
      expect(compoundExplain.executionStats.totalKeysExamined).toBeGreaterThan(0);
      expect(compoundExplain.executionStats.executionTimeMillis).toBeLessThan(50);
    });
  });

  describe('Data Consistency', () => {
    test('should maintain data integrity with indexes', async () => {
      const testRecord = {
        stock_id: new mongoose.Types.ObjectId(),
        symbol: 'TEST',
        price: 123.45,
        recorded_at: new Date()
      };

      // Create record
      const created = await StockPriceHistory.create(testRecord);
      expect(created.symbol).toBe('TEST');
      expect(created.price).toBe(123.45);

      // Query by symbol (using index)
      const foundBySymbol = await StockPriceHistory.findOne({ symbol: 'TEST' });
      expect(foundBySymbol._id.toString()).toBe(created._id.toString());

      // Query by time (using index)
      const foundByTime = await StockPriceHistory.findOne({
        recorded_at: { $gte: new Date(Date.now() - 1000) }
      });
      expect(foundByTime._id.toString()).toBe(created._id.toString());

      // Update record
      await StockPriceHistory.updateOne(
        { _id: created._id },
        { price: 124.56 }
      );

      // Verify update through indexed query
      const updated = await StockPriceHistory.findOne({ symbol: 'TEST' });
      expect(updated.price).toBe(124.56);
    });

    test('should handle concurrent operations correctly', async () => {
      const promises = [];
      
      // Create multiple concurrent operations
      for (let i = 0; i < 10; i++) {
        promises.push(
          StockPriceHistory.create({
            stock_id: new mongoose.Types.ObjectId(),
            symbol: `TEST${i}`,
            price: 100 + i,
            recorded_at: new Date(Date.now() + i * 1000)
          })
        );
      }

      const results = await Promise.all(promises);
      expect(results.length).toBe(10);

      // Verify all records can be found using indexes
      const allRecords = await StockPriceHistory.find({
        symbol: { $regex: /^TEST/ }
      }).sort({ recorded_at: 1 });

      expect(allRecords.length).toBe(10);
      expect(allRecords[0].symbol).toBe('TEST0');
      expect(allRecords[9].symbol).toBe('TEST9');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid queries gracefully', async () => {
      // Test with invalid ObjectId
      const result = await StockPriceHistory.find({
        stock_id: 'invalid-id'
      });
      expect(result.length).toBe(0);
    });

    test('should handle empty result sets', async () => {
      const result = await StockPriceHistory.find({
        symbol: 'NONEXISTENT'
      });
      expect(result.length).toBe(0);
    });

    test('should handle large date ranges', async () => {
      const startTime = Date.now();
      
      const result = await StockPriceHistory.find({
        recorded_at: {
          $gte: new Date('2020-01-01'),
          $lte: new Date('2030-01-01')
        }
      }).limit(100);
      
      const executionTime = Date.now() - startTime;
      
      // Should complete quickly even with large date range
      expect(executionTime).toBeLessThan(100);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe('Index Management Utilities', () => {
  test('should validate optimization script exports', () => {
    expect(typeof optimizeStockPriceHistoryIndexes).toBe('function');
    expect(typeof verifyIndexPerformance).toBe('function');
  });

  test('should have proper error handling in optimization functions', async () => {
    // Test with invalid connection (should handle gracefully)
    const originalConnect = mongoose.connect;
    mongoose.connect = jest.fn().mockRejectedValue(new Error('Connection failed'));

    try {
      await expect(optimizeStockPriceHistoryIndexes()).rejects.toThrow();
    } finally {
      mongoose.connect = originalConnect;
    }
  });
});

// Performance benchmarking tests
describe('Performance Benchmarks', () => {
  beforeAll(async () => {
    // Create larger dataset for performance testing
    const largeDataset = [];
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NFLX', 'NVDA'];
    const baseDate = new Date('2024-01-01T00:00:00Z');
    
    for (let i = 0; i < 1000; i++) {
      for (const symbol of symbols) {
        largeDataset.push({
          stock_id: new mongoose.Types.ObjectId(),
          symbol: symbol,
          price: 100 + Math.random() * 200,
          recorded_at: new Date(baseDate.getTime() + i * 60 * 1000) // Minute intervals
        });
      }
    }
    
    await StockPriceHistory.insertMany(largeDataset);
  });

  test('should meet performance requirements for symbol queries', async () => {
    const iterations = 10;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      await StockPriceHistory.find({ symbol: 'AAPL' })
        .sort({ recorded_at: -1 })
        .limit(100);
      
      times.push(Date.now() - startTime);
    }
    
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    
    console.log(`Symbol query performance: avg ${averageTime}ms, max ${maxTime}ms`);
    
    // Requirements: < 50ms for symbol queries
    expect(averageTime).toBeLessThan(50);
    expect(maxTime).toBeLessThan(100); // Allow some variance
  });

  test('should meet performance requirements for time-based queries', async () => {
    const iterations = 10;
    const times = [];
    const recentDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      await StockPriceHistory.find({
        recorded_at: { $gte: recentDate }
      })
      .sort({ recorded_at: -1 })
      .limit(100);
      
      times.push(Date.now() - startTime);
    }
    
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    
    console.log(`Time query performance: avg ${averageTime}ms, max ${maxTime}ms`);
    
    // Requirements: < 50ms for time-based queries
    expect(averageTime).toBeLessThan(50);
    expect(maxTime).toBeLessThan(100);
  });

  test('should meet performance requirements for compound queries', async () => {
    const iterations = 10;
    const times = [];
    const recentDate = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      await StockPriceHistory.find({
        symbol: 'AAPL',
        recorded_at: { $gte: recentDate }
      })
      .sort({ recorded_at: -1 })
      .limit(100);
      
      times.push(Date.now() - startTime);
    }
    
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    
    console.log(`Compound query performance: avg ${averageTime}ms, max ${maxTime}ms`);
    
    // Requirements: < 50ms for compound queries
    expect(averageTime).toBeLessThan(50);
    expect(maxTime).toBeLessThan(100);
  });
});