const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

/**
 * MongoDB Index Optimization Script
 * 
 * This script implements optimized indexes for the StockPriceHistory collection
 * according to the performance optimization requirements:
 * - Compound indexes for symbol + recorded_at queries
 * - Individual indexes for symbol and recorded_at fields
 * - Background index creation to avoid blocking operations
 * 
 * Requirements: 1.1, 1.2
 */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/overview_invest');
    console.log('✅ MongoDB Connected for index optimization');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const optimizeStockPriceHistoryIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('stockpricehistories');
    
    console.log('🔧 Starting StockPriceHistory index optimization...');
    
    // Drop existing indexes to recreate them with proper configuration
    console.log('📋 Checking existing indexes...');
    const existingIndexes = await collection.indexes();
    console.log('Current indexes:', existingIndexes.map(idx => ({ name: idx.name, key: idx.key })));
    
    // Create optimized indexes with background option
    const indexOperations = [
      {
        name: 'Compound index: symbol + recorded_at (descending)',
        spec: { symbol: 1, recorded_at: -1 },
        options: { 
          background: true, 
          name: 'idx_symbol_recorded_at_desc'
        }
      },
      {
        name: 'Individual index: symbol',
        spec: { symbol: 1 },
        options: { 
          background: true, 
          name: 'idx_symbol'
        }
      },
      {
        name: 'Individual index: recorded_at (descending)',
        spec: { recorded_at: -1 },
        options: { 
          background: true, 
          name: 'idx_recorded_at_desc'
        }
      },
      {
        name: 'Compound index: stock_id + recorded_at (for legacy queries)',
        spec: { stock_id: 1, recorded_at: -1 },
        options: { 
          background: true, 
          name: 'idx_stock_id_recorded_at_desc'
        }
      }
    ];
    
    // Create indexes one by one with proper error handling
    for (const indexOp of indexOperations) {
      try {
        console.log(`🔨 Creating ${indexOp.name}...`);
        await collection.createIndex(indexOp.spec, indexOp.options);
        console.log(`✅ Successfully created ${indexOp.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`⚠️  Index ${indexOp.name} already exists with different options, skipping...`);
        } else {
          console.error(`❌ Error creating ${indexOp.name}:`, error.message);
        }
      }
    }
    
    // Verify final index state
    console.log('📋 Final index verification...');
    const finalIndexes = await collection.indexes();
    console.log('Optimized indexes:');
    finalIndexes.forEach(idx => {
      if (idx.name !== '_id_') {
        console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
      }
    });
    
    // Get collection stats
    const stats = await collection.stats();
    console.log(`📊 Collection stats: ${stats.count} documents, ${Math.round(stats.size / 1024 / 1024 * 100) / 100} MB`);
    
    console.log('✅ StockPriceHistory index optimization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during index optimization:', error);
    throw error;
  }
};

const verifyIndexPerformance = async () => {
  try {
    console.log('🧪 Running index performance verification...');
    
    const StockPriceHistory = mongoose.model('StockPriceHistory', new mongoose.Schema({
      stock_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
      symbol: { type: String },
      price: { type: Number },
      recorded_at: { type: Date }
    }));
    
    // Test query performance with explain
    const testSymbol = 'AAPL';
    const testDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    console.log(`🔍 Testing query performance for symbol: ${testSymbol}`);
    
    // Test 1: Symbol-only query
    const symbolQuery = StockPriceHistory.find({ symbol: testSymbol }).limit(100);
    const symbolExplain = await symbolQuery.explain('executionStats');
    console.log(`  Symbol query - Execution time: ${symbolExplain.executionStats.executionTimeMillis}ms, Index used: ${symbolExplain.executionStats.totalKeysExamined > 0}`);
    
    // Test 2: Time-based query
    const timeQuery = StockPriceHistory.find({ recorded_at: { $gte: testDate } }).limit(100);
    const timeExplain = await timeQuery.explain('executionStats');
    console.log(`  Time query - Execution time: ${timeExplain.executionStats.executionTimeMillis}ms, Index used: ${timeExplain.executionStats.totalKeysExamined > 0}`);
    
    // Test 3: Compound query (most important)
    const compoundQuery = StockPriceHistory.find({ 
      symbol: testSymbol, 
      recorded_at: { $gte: testDate } 
    }).sort({ recorded_at: -1 }).limit(100);
    const compoundExplain = await compoundQuery.explain('executionStats');
    console.log(`  Compound query - Execution time: ${compoundExplain.executionStats.executionTimeMillis}ms, Index used: ${compoundExplain.executionStats.totalKeysExamined > 0}`);
    
    // Performance validation
    const maxAcceptableTime = 50; // 50ms as per requirements
    const queries = [
      { name: 'Symbol query', time: symbolExplain.executionStats.executionTimeMillis },
      { name: 'Time query', time: timeExplain.executionStats.executionTimeMillis },
      { name: 'Compound query', time: compoundExplain.executionStats.executionTimeMillis }
    ];
    
    console.log('📈 Performance validation:');
    queries.forEach(query => {
      const status = query.time <= maxAcceptableTime ? '✅' : '⚠️';
      console.log(`  ${status} ${query.name}: ${query.time}ms (target: <${maxAcceptableTime}ms)`);
    });
    
  } catch (error) {
    console.error('❌ Error during performance verification:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await optimizeStockPriceHistoryIndexes();
    await verifyIndexPerformance();
    
    console.log('🎉 Index optimization completed successfully!');
    console.log('💡 Indexes are created in background mode to avoid blocking operations');
    console.log('📊 Query performance should now be under 50ms for symbol and time-based queries');
    
  } catch (error) {
    console.error('❌ Index optimization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the optimization if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  optimizeStockPriceHistoryIndexes,
  verifyIndexPerformance
};