const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDb } = require('./db');

const VerificationService = require('./services/VerificationService');

// Mongoose Models
const User = require('./models/User');
const Stock = require('./models/Stock');
const Transaction = require('./models/Transaction');
const Order = require('./models/Order');
const FinnhubMarketService = require('./services/FinnhubMarketService');

// Admin Routes
const adminRoutes = require('./routes/admin');

dotenv.config();

const logError = (err) => {
    const msg = `${new Date().toISOString()} - ${err.stack || err}\n`;
    fs.appendFile(path.join(__dirname, 'error.log'), msg, () => { });
    console.error(err);
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// Initialize Database
let marketDataService = null;

// Initialize Database FIRST, then start market data service
(async () => {
    try {
        await initDb();
    } catch (err) {
        logError(err);
    }

    // Initialize Finnhub Real-Time Market Service
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 REAL-TIME MARKET DATA - FINNHUB API');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        marketDataService = new FinnhubMarketService(io, Stock);
        await marketDataService.initialize();
    } catch (err) {
        console.error('⚠️  Finnhub market data service failed:', err.message);
        console.log('💡 Tip: Check your FINNHUB_API_KEY in .env file');
    }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\n⏹️  Shutting down gracefully...');
    if (marketDataService) {
        marketDataService.stop();
    }
    process.exit(0);
});

// --- Auth Middleware ---
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid Token' });
    }
};

// --- Routes ---

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) return res.status(400).json({ message: 'All fields are required' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user',
            is_active: false, // Wait for OTP
            balance: 10000
        });

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // Send OTP
        await VerificationService.sendOtp(email);

        res.json({
            message: 'Registration successful. Please check your email for OTP.',
            email: email,
            require_verification: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    const { email, code } = req.body;
    try {
        const result = await VerificationService.verifyOtp(email, code);
        if (result.message === 'OTP verified successfully' || result.verified) {
            const user = await User.findOneAndUpdate({ email }, { is_active: true }, { new: true });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({ message: 'Account activated successfully', token, user });
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(400).json({ message: error.response?.data?.error || 'Verification failed' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Check if user is suspended (either by is_active or status field)
        if (user.is_active === false || user.status === 'suspended') {
            return res.status(403).json({ message: 'Account suspended. Please contact support.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Login failed for ${email}: Password mismatch`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/user/portfolio', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Augment holdings with current price
        const holdings = user.holdings || [];
        const symbols = holdings.map(h => h.symbol);
        const stocks = await Stock.find({ symbol: { $in: symbols } }).lean();
        const stockMap = {};
        stocks.forEach(s => stockMap[s.symbol] = s);

        const augmentedHoldings = holdings.map(h => ({
            ...h,
            current_price: stockMap[h.symbol] ? stockMap[h.symbol].price : 0,
            name: stockMap[h.symbol] ? stockMap[h.symbol].name : h.symbol
        }));

        res.json({
            username: user.username,
            email: user.email,
            balance: user.balance,
            notifications: user.notifications,
            language: user.language,
            currency: user.currency,
            two_factor: user.two_factor,
            holdings: augmentedHoldings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/user/settings', auth, async (req, res) => {
    const { notifications, language, currency, two_factor } = req.body;
    try {
        await User.findByIdAndUpdate(req.user.id, {
            notifications, language, currency, two_factor
        });
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/user/deposit', auth, async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    try {
        await User.findByIdAndUpdate(req.user.id, { $inc: { balance: amount } });
        res.json({ message: `Successfully deposited $${amount}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/user/withdraw', auth, async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    try {
        const user = await User.findById(req.user.id);
        if (user.balance < amount) return res.status(400).json({ message: 'Insufficient funds' });

        user.balance -= amount;
        await user.save();
        res.json({ message: `Successfully withdrew $${amount}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/user/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user_id: req.user.id })
            .sort({ created_at: -1 })
            .limit(20);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/trade', auth, async (req, res) => {
    const { symbol, quantity, type } = req.body;
    if (!symbol || !quantity) return res.status(400).json({ message: 'Invalid params' });

    try {
        const stock = await Stock.findOne({ symbol });
        if (!stock) throw new Error('Stock not found');

        const totalCost = stock.price * quantity;
        const user = await User.findById(req.user.id);

        if (type === 'BUY') {
            if (user.balance < totalCost) throw new Error('Insufficient funds');
            user.balance -= totalCost;

            // Update holdings
            const holdingIndex = user.holdings.findIndex(h => h.symbol === symbol);
            if (holdingIndex > -1) {
                const h = user.holdings[holdingIndex];
                // Updates average price
                h.average_price = ((h.average_price * h.quantity) + (stock.price * quantity)) / (h.quantity + quantity);
                h.quantity += quantity;
            } else {
                user.holdings.push({ symbol, quantity, average_price: stock.price });
            }
        } else {
            // SELL
            const holdingIndex = user.holdings.findIndex(h => h.symbol === symbol);
            if (holdingIndex === -1 || user.holdings[holdingIndex].quantity < quantity) {
                throw new Error('Not enough shares');
            }

            user.balance += totalCost;
            user.holdings[holdingIndex].quantity -= quantity;

            // Remove if 0
            if (user.holdings[holdingIndex].quantity <= 0) {
                user.holdings.splice(holdingIndex, 1);
            }
        }

        await user.save();

        // Record Transaction
        const transaction = await Transaction.create({
            user_id: user._id,
            symbol,
            type,
            quantity,
            price: stock.price,
            total_amount: totalCost
        });

        // Record Order
        await Order.create({
            symbol,
            user_id: user._id,
            user_type: 'human',
            side: type,
            quantity,
            price: stock.price
        });

        if (type === 'BUY') {
            // Generate Invoice
            VerificationService.createInvoice({
                user_id: user._id,
                order_id: transaction._id,
                amount: totalCost,
                currency: user.currency || 'USD',
                items: [{ name: `${quantity} x ${symbol}`, price: stock.price, quantity: quantity }],
                email: user.email,
                username: user.username
            }).catch(console.error); // Run in background
        }

        res.json({ message: 'Success' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/stock/:symbol', auth, async (req, res) => {
    try {
        const stock = await Stock.findOne({ symbol: req.params.symbol }).lean();
        if (!stock) return res.status(404).json({ message: 'Stock not found' });

        // Get live data from Finnhub cache if available
        let liveData = {};
        if (marketDataService) {
            const quote = marketDataService.getQuote(req.params.symbol);
            if (quote) {
                liveData = {
                    day_low: quote.low,
                    day_high: quote.high,
                    open: quote.open,
                    previousClose: quote.previousClose,
                    change: quote.change,
                    changePercent: quote.changePercent
                };
            }
        }

        res.json({
            ...stock,
            day_low: liveData.day_low || stock.price,
            day_high: liveData.day_high || stock.price,
            open: liveData.open || stock.price,
            previousClose: liveData.previousClose || stock.price,
            change: liveData.change || 0,
            changePercent: liveData.changePercent || 0,
            volume: 0,
            week_52_low: (liveData.day_low || stock.price) * 0.8,
            week_52_high: (liveData.day_high || stock.price) * 1.2
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// --- Admin Routes ---

app.post('/api/admin/refresh', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    // Trigger a manual refresh from Finnhub
    if (marketDataService) {
        await marketDataService.fetchAllQuotes();
        res.json({ message: 'Market data refreshed from Finnhub' });
    } else {
        res.status(503).json({ message: 'Market data service not available' });
    }
});

app.post('/api/admin/stock/update', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { id, price } = req.body;
    try {
        await Stock.findByIdAndUpdate(id, { price, last_updated: Date.now() });
        res.json({ message: 'Stock updated' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.post('/api/admin/stock/delete', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { id } = req.body;
    try {
        await Stock.findByIdAndDelete(id);
        res.json({ message: 'Stock deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.post('/api/admin/stock/add', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { symbol, name, price } = req.body;
    try {
        await Stock.create({ symbol, name, price });
        res.json({ message: 'Stock added' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Public Stats Endpoint (No Auth Required)
app.get('/api/stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments({ role: 'user' });
        const transactionCount = await Transaction.countDocuments();
        const transactions = await Transaction.find().select('total_amount').lean();

        const totalVolume = transactions.reduce((sum, tx) => {
            return sum + (tx.total_amount || 0);
        }, 0);

        res.json({
            users: userCount,
            trades: transactionCount,
            volume: totalVolume
        });
    } catch (e) {
        console.error('Stats error:', e);
        res.status(500).json({ message: e.message });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).lean();
        const stocks = await Stock.find().lean();
        const stockMap = stocks.reduce((acc, s) => { acc[s.symbol] = s.price; return acc; }, {});

        const leaderboard = users.map(u => {
            const holdingsValue = (u.holdings || []).reduce((sum, h) => {
                return sum + (h.quantity * (stockMap[h.symbol] || 0));
            }, 0);
            return {
                display_name: u.username || u.email.split('@')[0],
                email: u.email,
                total_wealth: u.balance + holdingsValue
            };
        });

        leaderboard.sort((a, b) => b.total_wealth - a.total_wealth);
        res.json(leaderboard.slice(0, 10));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.get('/api/stocks', async (req, res) => {
    try {
        // Simple query - no more StockPriceHistory lookup
        const stocks = await Stock.find()
            .sort({ symbol: 1 })
            .lean();

        // Enrich with live Finnhub data from cache
        const enrichedStocks = stocks.map(stock => {
            let liveData = {};
            if (marketDataService) {
                const quote = marketDataService.getQuote(stock.symbol);
                if (quote) {
                    liveData = {
                        day_low: quote.low,
                        day_high: quote.high,
                        change: quote.change,
                        changePercent: quote.changePercent
                    };
                }
            }

            return {
                _id: stock._id,
                symbol: stock.symbol,
                name: stock.name,
                price: stock.price,
                last_updated: stock.last_updated,
                sector: stock.sector,
                market_state: stock.market_state,
                country: stock.country,
                risk_profile: stock.risk_profile,
                day_low: liveData.day_low || stock.price,
                day_high: liveData.day_high || stock.price,
                change: liveData.change || 0,
                changePercent: liveData.changePercent || 0
            };
        });

        res.json(enrichedStocks);
    } catch (e) {
        console.error('Error in /api/stocks:', e);
        res.status(500).json({ message: e.message });
    }
});

// Search stocks using Database
app.get('/api/stocks/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Query parameter required' });

        const results = await Stock.find({
            $or: [
                { symbol: { $regex: q, $options: 'i' } },
                { name: { $regex: q, $options: 'i' } }
            ]
        }).limit(10).select('symbol name sector');

        res.json(results.map(r => ({
            symbol: r.symbol,
            description: r.name,
            type: r.sector
        })));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Get current prices from database
app.get('/api/stocks/prices', async (req, res) => {
    try {
        const stocks = await Stock.find().select('symbol price last_updated');
        res.json(stocks);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ==================== ADMIN ROUTES ====================
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
