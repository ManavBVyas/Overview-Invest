#!/usr/bin/env node

/**
 * Database Index Initialization Script
 * 
 * This script initializes optimized indexes for the trading application database.
 * It can be run safely on existing databases and will create indexes in background mode.
 * 
 * Usage:
 *   node init-indexes.js
 * 
 * Requirements: 1.1, 1.2
 */

const { optimizeStockPriceHistoryIndexes, verifyIndexPerformance } = require('./optimize-indexes');

const main = async () => {
  console.log('🚀 Starting database index initialization...');
  console.log('📝 This script will optimize indexes for StockPriceHistory collection');
  console.log('⏱️  Indexes will be created in background mode to avoid blocking operations');
  console.log('');
  
  try {
    // Connect and optimize indexes
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    
    dotenv.config();
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/overview_invest');
    console.log('✅ Connected to MongoDB');
    
    // Run optimization
    await optimizeStockPriceHistoryIndexes();
    
    // Verify performance
    await verifyIndexPerformance();
    
    console.log('');
    console.log('🎉 Index initialization completed successfully!');
    console.log('');
    console.log('📊 Expected performance improvements:');
    console.log('  • Symbol-based queries: < 50ms');
    console.log('  • Time-based queries: < 50ms');
    console.log('  • Combined symbol + time queries: < 50ms');
    console.log('  • Dashboard load times: 5-10x faster');
    console.log('');
    console.log('💡 Next steps:');
    console.log('  • Monitor query performance in production');
    console.log('  • Consider adding more indexes based on query patterns');
    console.log('  • Run periodic index maintenance');
    
  } catch (error) {
    console.error('❌ Index initialization failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('  • Ensure MongoDB is running');
    console.error('  • Check database connection string');
    console.error('  • Verify sufficient disk space for index creation');
    console.error('  • Check MongoDB logs for detailed error information');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n⚠️  Received SIGINT, closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Received SIGTERM, closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
main();