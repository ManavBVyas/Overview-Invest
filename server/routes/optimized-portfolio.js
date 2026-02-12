const express = require('express');
const OptimizedQueryBuilder = require('../services/OptimizedQueryBuilder');

const router = express.Router();
const queryBuilder = new OptimizedQueryBuilder();

/**
 * Optimized user portfolio endpoint
 * Eliminates N+1 queries by using batch loading for stock prices
 */
router.get('/portfolio', async (req, res) => {
    try {
        // Use optimized query builder to get portfolio with current prices
        const portfolio = await queryBuilder.getOptimizedUserPortfolio(req.user.id);
        
        if (!portfolio) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            username: portfolio.username,
            email: portfolio.email,
            balance: portfolio.balance,
            holdings: portfolio.holdings,
            holdings_value: portfolio.holdings_value,
            total_value: portfolio.total_value
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;