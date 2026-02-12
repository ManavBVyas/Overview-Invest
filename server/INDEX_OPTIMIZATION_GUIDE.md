# MongoDB Index Optimization Guide

## Overview

This guide explains how to implement and manage optimized MongoDB indexes for the StockPriceHistory collection to achieve 5-10x performance improvements in query response times.

## Performance Requirements

- **Symbol-based queries**: < 50ms response time
- **Time-based queries**: < 50ms response time  
- **Combined symbol + time queries**: < 50ms response time
- **Dashboard load times**: Reduced from 5-10 seconds to under 1 second

## Index Strategy

### Implemented Indexes

1. **Compound Index: symbol + recorded_at (descending)**
   - Purpose: Optimizes queries filtering by symbol and time range
   - Usage: Dashboard stock price history, analytics queries
   - Index: `{ symbol: 1, recorded_at: -1 }`

2. **Individual Index: symbol**
   - Purpose: Fast symbol-only lookups
   - Usage: Stock price retrieval, portfolio calculations
   - Index: `{ symbol: 1 }`

3. **Individual Index: recorded_at (descending)**
   - Purpose: Time-based queries, recent price lookups
   - Usage: Latest prices, time-range analytics
   - Index: `{ recorded_at: -1 }`

4. **Legacy Index: stock_id + recorded_at**
   - Purpose: Backward compatibility with existing queries
   - Usage: Legacy API endpoints
   - Index: `{ stock_id: 1, recorded_at: -1 }`

### Background Index Creation

All indexes are created with `background: true` option to:
- Avoid blocking database operations during creation
- Allow the application to continue serving requests
- Minimize downtime during index deployment

## Installation and Setup

### 1. Automatic Setup (Recommended)

The indexes are automatically created when the application starts through the Mongoose schema definitions in `models/StockPriceHistory.js`.

### 2. Manual Setup

For existing databases or manual deployment:

```bash
# Initialize indexes on existing database
node init-indexes.js

# Verify index creation and performance
node index-manager.js analyze
```

### 3. Production Deployment

For production environments:

```bash
# 1. Create indexes in background (safe for production)
node init-indexes.js

# 2. Verify performance meets requirements
node index-manager.js test

# 3. Monitor index usage
node index-manager.js stats
```

## Index Management Commands

### List All Indexes
```bash
node index-manager.js list
```

### Analyze Index Performance
```bash
node index-manager.js analyze
```

### Test Query Performance
```bash
node index-manager.js test
```

### Rebuild Indexes
```bash
node index-manager.js rebuild
```

### Collection Statistics
```bash
node index-manager.js stats
```

## Expected Performance Improvements

### Before Optimization
- Symbol queries: 2-5 seconds (full collection scan)
- Time-based queries: 3-8 seconds (full collection scan)
- Dashboard load: 5-10 seconds
- Database CPU usage: High during queries

### After Optimization
- Symbol queries: < 50ms (index scan)
- Time-based queries: < 50ms (index scan)
- Dashboard load: < 1 second
- Database CPU usage: Minimal during queries

## Query Patterns Optimized

### 1. Symbol-based Queries
```javascript
// Fast symbol lookup
StockPriceHistory.find({ symbol: 'AAPL' })
  .sort({ recorded_at: -1 })
  .limit(100);
```

### 2. Time-based Queries
```javascript
// Recent prices
StockPriceHistory.find({ 
  recorded_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
})
.sort({ recorded_at: -1 })
.limit(100);
```

### 3. Combined Queries (Most Important)
```javascript
// Symbol + time range (dashboard queries)
StockPriceHistory.find({
  symbol: 'AAPL',
  recorded_at: { $gte: startDate, $lte: endDate }
})
.sort({ recorded_at: -1 })
.limit(100);
```

### 4. Portfolio Calculations
```javascript
// Batch price lookups for multiple symbols
StockPriceHistory.find({
  symbol: { $in: ['AAPL', 'GOOGL', 'MSFT'] },
  recorded_at: { $gte: recentDate }
})
.sort({ recorded_at: -1 });
```

## Monitoring and Maintenance

### Performance Monitoring
```javascript
// Monitor query execution times
const explain = await query.explain('executionStats');
console.log('Execution time:', explain.executionStats.executionTimeMillis);
console.log('Index used:', explain.executionStats.totalKeysExamined > 0);
```

### Index Usage Analysis
```bash
# Check which indexes are being used
db.stockpricehistories.aggregate([{ $indexStats: {} }])
```

### Maintenance Schedule
- **Daily**: Monitor query performance metrics
- **Weekly**: Review index usage statistics
- **Monthly**: Analyze and optimize based on query patterns
- **Quarterly**: Consider new indexes based on application growth

## Troubleshooting

### Common Issues

1. **Indexes not being used**
   - Check query structure matches index key order
   - Verify sort order matches index direction
   - Use `.explain()` to analyze query execution

2. **Slow index creation**
   - Indexes are created in background mode
   - Large collections may take time to index
   - Monitor MongoDB logs for progress

3. **High memory usage**
   - Indexes consume memory proportional to data size
   - Monitor index size vs. data size ratio
   - Consider dropping unused indexes

### Performance Validation

```bash
# Test all query patterns
node index-manager.js test

# Expected output:
# ✅ Symbol lookup (AAPL): 15ms
# ✅ Recent prices (last 24h): 23ms  
# ✅ Symbol + time range: 12ms
```

## Integration with Application

### Database Connection
The indexes are automatically applied when using the `StockPriceHistory` model:

```javascript
const StockPriceHistory = require('./models/StockPriceHistory');

// This query will automatically use the optimized indexes
const prices = await StockPriceHistory.find({ symbol: 'AAPL' })
  .sort({ recorded_at: -1 })
  .limit(100);
```

### Error Handling
```javascript
try {
  const result = await StockPriceHistory.find(query);
  // Handle successful query
} catch (error) {
  if (error.name === 'MongoTimeoutError') {
    // Query took too long - may indicate index issues
    console.error('Query timeout - check indexes');
  }
  // Handle other errors
}
```

## Security Considerations

- Indexes are created with minimal required permissions
- Background creation prevents service disruption
- No sensitive data is exposed in index definitions
- Index names follow consistent naming conventions

## Rollback Plan

If issues occur after index deployment:

1. **Immediate**: Drop problematic indexes
   ```bash
   node index-manager.js rebuild
   ```

2. **Fallback**: Use original schema without optimizations
   ```bash
   git checkout HEAD~1 -- server/models/StockPriceHistory.js
   ```

3. **Recovery**: Restore from backup if necessary

## Success Metrics

Track these metrics to validate optimization success:

- [ ] Symbol queries complete in < 50ms
- [ ] Time-based queries complete in < 50ms  
- [ ] Dashboard load time < 1 second
- [ ] Database CPU usage reduced by 60%+
- [ ] Query throughput increased by 5-10x
- [ ] No application errors during index creation
- [ ] All existing functionality preserved

## Next Steps

After successful index deployment:

1. Monitor performance metrics for 1 week
2. Identify additional optimization opportunities
3. Consider implementing query result caching
4. Plan for data archival strategies
5. Document lessons learned for future optimizations