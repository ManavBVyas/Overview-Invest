const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Complaint = require('../models/Complaint');
const Stock = require('../models/Stock');

// Admin credentials from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@overviewinvest.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_12345';

// Admin Auth Middleware
const adminAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Admin authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: 'Admin access denied' });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid admin token' });
    }
};

// ==================== AUTH ====================

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Read at runtime
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@overviewinvest.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
        console.log('Admin login attempt:', email);
        if (email !== adminEmail) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        if (password !== adminPassword) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const token = jwt.sign(
            { isAdmin: true, email: adminEmail },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: { email: adminEmail }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Verify Admin Token
router.get('/verify', (req, res) => {
    res.json({ valid: true, admin: req.admin });
});

// ==================== DASHBOARD STATS ====================

// Get Dashboard Statistics
router.get('/stats', async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // User stats
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: { $ne: 'suspended' } });
        const suspendedUsers = await User.countDocuments({ status: 'suspended' });
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
        const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: thisWeek } });

        // Transaction stats
        const totalTransactions = await Transaction.countDocuments();
        const todayTransactions = await Transaction.countDocuments({ createdAt: { $gte: today } });

        // Calculate total trading volume
        const volumeAgg = await Transaction.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
        ]);
        const totalVolume = volumeAgg[0]?.total || 0;

        // Today's volume
        const todayVolumeAgg = await Transaction.aggregate([
            { $match: { createdAt: { $gte: today } } },
            { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
        ]);
        const todayVolume = todayVolumeAgg[0]?.total || 0;

        // Total balance across all users
        const balanceAgg = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$balance' } } }
        ]);
        const totalBalance = balanceAgg[0]?.total || 0;

        // Complaint stats
        const totalComplaints = await Complaint.countDocuments({ type: 'complaint' });
        const totalSuggestions = await Complaint.countDocuments({ type: 'suggestion' });
        const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });

        // Stock stats
        const totalStocks = await Stock.countDocuments();

        res.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                suspended: suspendedUsers,
                newToday: newUsersToday,
                newThisWeek: newUsersThisWeek
            },
            transactions: {
                total: totalTransactions,
                today: todayTransactions,
                totalVolume,
                todayVolume
            },
            balance: {
                total: totalBalance,
                average: totalUsers > 0 ? totalBalance / totalUsers : 0
            },
            complaints: {
                total: totalComplaints,
                suggestions: totalSuggestions,
                pending: pendingComplaints
            },
            stocks: {
                total: totalStocks
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
});

// Get Chart Data
router.get('/charts', async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // User registrations over last 30 days
        const userRegistrations = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Transactions over last 30 days
        const transactionsByDay = await Transaction.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    volume: { $sum: { $multiply: ['$price', '$quantity'] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Buy vs Sell distribution
        const tradeTypes = await Transaction.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        // Top traded stocks
        const topStocks = await Transaction.aggregate([
            { $group: { _id: '$symbol', trades: { $sum: 1 }, volume: { $sum: { $multiply: ['$price', '$quantity'] } } } },
            { $sort: { trades: -1 } },
            { $limit: 10 }
        ]);

        // User balance distribution
        const balanceDistribution = await User.aggregate([
            {
                $bucket: {
                    groupBy: '$balance',
                    boundaries: [0, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
                    default: '1000000+',
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        res.json({
            userRegistrations,
            transactionsByDay,
            tradeTypes,
            topStocks,
            balanceDistribution
        });
    } catch (error) {
        console.error('Charts error:', error);
        res.status(500).json({ message: 'Failed to fetch chart data' });
    }
});

// ==================== USER MANAGEMENT ====================

// Get All Users
router.get('/users', async (req, res) => {
    try {
        const { search, status, page = 1, limit = 20 } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Get Single User Details
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's recent transactions
        const transactions = await Transaction.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        // Get user's complaints
        const complaints = await Complaint.find({ userId: user._id })
            .sort({ createdAt: -1 });

        res.json({ user, transactions, complaints });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});

// Activate User
router.post('/users/:id/activate', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'active' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User activated successfully', user });
    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({ message: 'Failed to activate user' });
    }
});

// Deactivate/Suspend User
router.post('/users/:id/deactivate', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'suspended' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deactivated successfully', user });
    } catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({ message: 'Failed to deactivate user' });
    }
});

// Permanently Delete User
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user's transactions
        await Transaction.deleteMany({ userId: user._id });

        // Delete user's complaints
        await Complaint.deleteMany({ userId: user._id });

        // Delete user
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User permanently deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// ==================== COMPLAINTS & SUGGESTIONS ====================

// Get All Complaints/Suggestions
router.get('/complaints', async (req, res) => {
    try {
        const { type, status, page = 1, limit = 20 } = req.query;

        let query = {};

        if (type && type !== 'all') {
            query.type = type;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        const total = await Complaint.countDocuments(query);
        const complaints = await Complaint.find(query)
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            complaints,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ message: 'Failed to fetch complaints' });
    }
});

// Get Single Complaint
router.get('/complaints/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('userId', 'username email createdAt status');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (error) {
        console.error('Get complaint error:', error);
        res.status(500).json({ message: 'Failed to fetch complaint' });
    }
});

// Update Complaint Status
router.patch('/complaints/:id', async (req, res) => {
    try {
        const { status, adminResponse, priority } = req.body;

        const updateData = { updatedAt: new Date() };
        if (status) updateData.status = status;
        if (adminResponse !== undefined) updateData.adminResponse = adminResponse;
        if (priority) updateData.priority = priority;

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('userId', 'username email');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.json({ message: 'Complaint updated successfully', complaint });
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({ message: 'Failed to update complaint' });
    }
});

// Delete Complaint
router.delete('/complaints/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndDelete(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Delete complaint error:', error);
        res.status(500).json({ message: 'Failed to delete complaint' });
    }
});

module.exports = router;



