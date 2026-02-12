const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

/**
 * MongoDB Index Management Utility
 * 
 * This utility provides comprehensive index management capabilities:
 * - List all indexes
 * - Analyze index usage
 * - Drop unused indexes
 * - Rebuild indexes
 * - Performance monitoring
 * 
 * Requirements: 1.1, 1.2
 */

class IndexManager {
  constructor() {
    this.db = null;
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/overview_invest');
      this.db = mongoose.connection.db;
      console.log('✅ Connected to MongoDB for index management');
    } catch (err) {
      console.error('❌ MongoDB Connection Error:', err.message);
      throw err;
    }
  }

  async disconnect() {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }

  async listAllIndexes() {
    console.log('📋 Listing all indexes in the database...\n');
    
    const collections = await this.db.listCollections().toArray();
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = this.db.collection(collectionName);
      
      try {
        const indexes = await collection.indexes();
        
        console.log(`📁 Collection: ${collectionName}`);
        if (indexes.length === 1 && indexes[0].name === '_id_') {
          console.log('  └── Only default _id_ index');
        } else {
          indexes.forEach(index => {
            if (index.name !== '_id_') {
              const keyStr = JSON.stringify(index.key);
              const options = [];
              if (index.background) options.push('background');
              if (index.unique) options.push('unique');
              if (index.sparse) options.push('sparse');
              const optionsStr = options.length > 0 ? ` (${options.join(', ')})` : '';
              console.log(`  ├── ${index.name}: ${keyStr}${optionsStr}`);
            }
          });
        }
        console.log('');
      } catch (error) {
        console.log(`  └── Error accessing indexes: ${error.message}\n`);
      }
    }
  }

  async analyzeStockPriceHistoryIndexes() {
    console.log('🔍 Analyzing StockPriceHistory index usage...\n');
    
    const collection = this.db.collection('stockpricehistories');
    
    try {
      // Get index stats
      const indexStats = await collection.aggregate([
        { $indexStats: {} }
      ]).toArray();
      
      console.log('📊 Index Usage Statistics:');
      indexStats.forEach(stat => {
        const usage = stat.accesses.ops || 0;
        const lastUsed = stat.accesses.since ? new Date(stat.accesses.since).toISOString() : 'Never';
        console.log(`  • ${stat.name}: ${usage} operations, last used: ${lastUsed}`);
      });
      console.log('');
      
      // Test query performance
      await this.testQueryPerformance();
      
    } catch (error) {
      console.error('❌ Error analyzing indexes:', error.message);
    }
  }

  async testQueryPerformance() {
    console.log('⚡ Testing query performance...\n');
    
    const StockPriceHistory = mongoose.model('StockPriceHistory', new mongoose.Schema({
      stock_id: { type: mongoose.Schema.Types.ObjectId },
      symbol: { type: String },
      price: { type: Number },
      recorded_at: { type: Date }
    }));
    
    const testQueries = [
      {
        name: 'Symbol lookup (AAPL)',
        query: { symbol: 'AAPL' },
        sort: { recorded_at: -1 },
        limit: 100
      },
      {
        name: 'Recent prices (last 24h)',
        query: { recorded_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        sort: { recorded_at: -1 },
        limit: 100
      },
      {
        name: 'Symbol + time range',
        query: { 
          symbol: 'AAPL', 
          recorded_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
        },
        sort: { recorded_at: -1 },
        limit: 100
      }
    ];

    for (const test of testQueries) {
      try {
        const query = StockPriceHistory.find(test.query);
        if (test.sort) query.sort(test.sort);
        if (test.limit) query.limit(test.limit);
        
        const explain = await query.explain('executionStats');
        const stats = explain.executionStats;
        
        const executionTime = stats.executionTimeMillis;
        const indexUsed = stats.totalKeysExamined > 0;
        const docsExamined = stats.totalDocsExamined;
        const docsReturned = stats.executionStats ? stats.executionStats.totalDocsReturned : 0;
        
        const efficiency = docsReturned > 0 ? (docsReturned / Math.max(docsExamined, 1) * 100).toFixed(1) : '0';
        const status = executionTime <= 50 ? '✅' : '⚠️';
        
        console.log(`${status} ${test.name}:`);
        console.log(`    Execution time: ${executionTime}ms`);
        console.log(`    Index used: ${indexUsed ? 'Yes' : 'No'}`);
        console.log(`    Documents examined: ${docsExamined}`);
        console.log(`    Documents returned: ${docsReturned}`);
        console.log(`    Query efficiency: ${efficiency}%`);
        console.log('');
        
      } catch (error) {
        console.log(`❌ ${test.name}: Error - ${error.message}\n`);
      }
    }
  }

  async rebuildIndexes() {
    console.log('🔨 Rebuilding StockPriceHistory indexes...\n');
    
    const collection = this.db.collection('stockpricehistories');
    
    try {
      // Get current indexes (except _id_)
      const currentIndexes = await collection.indexes();
      const customIndexes = currentIndexes.filter(idx => idx.name !== '_id_');
      
      if (customIndexes.length === 0) {
        console.log('ℹ️  No custom indexes found to rebuild');
        return;
      }
      
      console.log('📋 Current custom indexes:');
      customIndexes.forEach(idx => {
        console.log(`  • ${idx.name}: ${JSON.stringify(idx.key)}`);
      });
      console.log('');
      
      // Drop and recreate each index
      for (const index of customIndexes) {
        try {
          console.log(`🗑️  Dropping index: ${index.name}`);
          await collection.dropIndex(index.name);
          
          console.log(`🔨 Recreating index: ${index.name}`);
          const options = { 
            background: true, 
            name: index.name 
          };
          
          // Preserve original options
          if (index.unique) options.unique = true;
          if (index.sparse) options.sparse = true;
          
          await collection.createIndex(index.key, options);
          console.log(`✅ Successfully rebuilt: ${index.name}\n`);
          
        } catch (error) {
          console.error(`❌ Error rebuilding ${index.name}: ${error.message}\n`);
        }
      }
      
      console.log('🎉 Index rebuild completed!');
      
    } catch (error) {
      console.error('❌ Error during index rebuild:', error.message);
    }
  }

  async getCollectionStats() {
    console.log('📊 StockPriceHistory collection statistics...\n');
    
    const collection = this.db.collection('stockpricehistories');
    
    try {
      const stats = await collection.stats();
      
      console.log('📈 Collection Statistics:');
      console.log(`  • Document count: ${stats.count.toLocaleString()}`);
      console.log(`  • Average document size: ${Math.round(stats.avgObjSize)} bytes`);
      console.log(`  • Data size: ${Math.round(stats.size / 1024 / 1024 * 100) / 100} MB`);
      console.log(`  • Storage size: ${Math.round(stats.storageSize / 1024 / 1024 * 100) / 100} MB`);
      console.log(`  • Index count: ${stats.nindexes}`);
      console.log(`  • Total index size: ${Math.round(stats.totalIndexSize / 1024 / 1024 * 100) / 100} MB`);
      console.log('');
      
      // Calculate index overhead
      const indexOverhead = stats.totalIndexSize / stats.size * 100;
      console.log(`💾 Index overhead: ${indexOverhead.toFixed(1)}% of data size`);
      
      if (indexOverhead > 50) {
        console.log('⚠️  High index overhead detected - consider reviewing index strategy');
      } else if (indexOverhead < 10) {
        console.log('ℹ️  Low index overhead - good index efficiency');
      } else {
        console.log('✅ Normal index overhead');
      }
      console.log('');
      
    } catch (error) {
      console.error('❌ Error getting collection stats:', error.message);
    }
  }
}

// CLI interface
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const manager = new IndexManager();
  
  try {
    await manager.connect();
    
    switch (command) {
      case 'list':
        await manager.listAllIndexes();
        break;
        
      case 'analyze':
        await manager.analyzeStockPriceHistoryIndexes();
        break;
        
      case 'rebuild':
        await manager.rebuildIndexes();
        break;
        
      case 'stats':
        await manager.getCollectionStats();
        break;
        
      case 'test':
        await manager.testQueryPerformance();
        break;
        
      case 'help':
      default:
        console.log('🛠️  MongoDB Index Manager');
        console.log('');
        console.log('Usage: node index-manager.js <command>');
        console.log('');
        console.log('Commands:');
        console.log('  list     - List all indexes in the database');
        console.log('  analyze  - Analyze StockPriceHistory index usage');
        console.log('  rebuild  - Rebuild all StockPriceHistory indexes');
        console.log('  stats    - Show collection statistics');
        console.log('  test     - Test query performance');
        console.log('  help     - Show this help message');
        console.log('');
        break;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await manager.disconnect();
  }
};

// Run CLI if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = IndexManager;