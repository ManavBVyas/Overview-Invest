/**
 * Database Setup Script - INDIAN MARKET
 * Creates a fresh database with NSE/BSE stocks
 * for Overview Invest - Main Website & Admin Panel
 * 
 * Run: node setup-database.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Stock = require('./models/Stock');
const Transaction = require('./models/Transaction');
const Complaint = require('./models/Complaint');

// Database connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/overview_invest_v5';

// ============== INDIAN STOCKS (NSE) ==============

const stocksData = [
    // IT Sector
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: 3850, sector: 'Technology', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'INFY.NS', name: 'Infosys Limited', price: 1520, sector: 'Technology', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'WIPRO.NS', name: 'Wipro Limited', price: 485, sector: 'Technology', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'HCLTECH.NS', name: 'HCL Technologies', price: 1380, sector: 'Technology', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'TECHM.NS', name: 'Tech Mahindra', price: 1250, sector: 'Technology', liquidity: 'High', country: 'India', risk_profile: 'Medium' },

    // Banking & Finance
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1620, sector: 'Banking', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', price: 1050, sector: 'Banking', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'SBIN.NS', name: 'State Bank of India', price: 625, sector: 'Banking', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', price: 1780, sector: 'Banking', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'AXISBANK.NS', name: 'Axis Bank', price: 1085, sector: 'Banking', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', price: 6850, sector: 'Finance', liquidity: 'High', country: 'India', risk_profile: 'Medium' },

    // Reliance & Conglomerates
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2450, sector: 'Conglomerate', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro', price: 3280, sector: 'Infrastructure', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'ADANIENT.NS', name: 'Adani Enterprises', price: 2850, sector: 'Conglomerate', liquidity: 'High', country: 'India', risk_profile: 'High' },
    { symbol: 'ADANIPORTS.NS', name: 'Adani Ports', price: 1180, sector: 'Infrastructure', liquidity: 'High', country: 'India', risk_profile: 'Medium' },

    // Automobile
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', price: 780, sector: 'Automobile', liquidity: 'High', country: 'India', risk_profile: 'Medium' },
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', price: 10850, sector: 'Automobile', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'M&M.NS', name: 'Mahindra & Mahindra', price: 1680, sector: 'Automobile', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto', price: 7250, sector: 'Automobile', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp', price: 4320, sector: 'Automobile', liquidity: 'High', country: 'India', risk_profile: 'Low' },

    // Pharma & Healthcare
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', price: 1180, sector: 'Pharma', liquidity: 'High', country: 'India', risk_profile: 'Medium' },
    { symbol: 'DRREDDY.NS', name: "Dr. Reddy's Labs", price: 5680, sector: 'Pharma', liquidity: 'High', country: 'India', risk_profile: 'Medium' },
    { symbol: 'CIPLA.NS', name: 'Cipla', price: 1420, sector: 'Pharma', liquidity: 'High', country: 'India', risk_profile: 'Medium' },
    { symbol: 'DIVISLAB.NS', name: "Divi's Laboratories", price: 3850, sector: 'Pharma', liquidity: 'Medium', country: 'India', risk_profile: 'Medium' },

    // FMCG
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', price: 2480, sector: 'FMCG', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'ITC.NS', name: 'ITC Limited', price: 465, sector: 'FMCG', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'NESTLEIND.NS', name: 'Nestle India', price: 24500, sector: 'FMCG', liquidity: 'Medium', country: 'India', risk_profile: 'Low' },
    { symbol: 'BRITANNIA.NS', name: 'Britannia Industries', price: 4850, sector: 'FMCG', liquidity: 'Medium', country: 'India', risk_profile: 'Low' },

    // Metals & Mining
    { symbol: 'TATASTEEL.NS', name: 'Tata Steel', price: 128, sector: 'Metals', liquidity: 'High', country: 'India', risk_profile: 'High' },
    { symbol: 'HINDALCO.NS', name: 'Hindalco Industries', price: 525, sector: 'Metals', liquidity: 'High', country: 'India', risk_profile: 'High' },
    { symbol: 'JSWSTEEL.NS', name: 'JSW Steel', price: 785, sector: 'Metals', liquidity: 'High', country: 'India', risk_profile: 'High' },

    // Energy & Oil
    { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corp', price: 265, sector: 'Energy', liquidity: 'High', country: 'India', risk_profile: 'Medium' },
    { symbol: 'BPCL.NS', name: 'Bharat Petroleum', price: 385, sector: 'Energy', liquidity: 'High', country: 'India', risk_profile: 'Medium' },
    { symbol: 'IOC.NS', name: 'Indian Oil Corporation', price: 142, sector: 'Energy', liquidity: 'High', country: 'India', risk_profile: 'Medium' },
    { symbol: 'POWERGRID.NS', name: 'Power Grid Corp', price: 275, sector: 'Energy', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'NTPC.NS', name: 'NTPC Limited', price: 345, sector: 'Energy', liquidity: 'High', country: 'India', risk_profile: 'Low' },

    // Telecom
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', price: 1180, sector: 'Telecom', liquidity: 'High', country: 'India', risk_profile: 'Low' },

    // Insurance
    { symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance', price: 625, sector: 'Insurance', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'SBILIFE.NS', name: 'SBI Life Insurance', price: 1420, sector: 'Insurance', liquidity: 'High', country: 'India', risk_profile: 'Low' },

    // Others
    { symbol: 'ASIANPAINT.NS', name: 'Asian Paints', price: 2950, sector: 'Consumer', liquidity: 'High', country: 'India', risk_profile: 'Low' },
    { symbol: 'TITAN.NS', name: 'Titan Company', price: 3280, sector: 'Consumer', liquidity: 'High', country: 'India', risk_profile: 'Medium' },
    { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement', price: 9850, sector: 'Cement', liquidity: 'High', country: 'India', risk_profile: 'Medium' },
];

// Demo Users
async function createDemoUsers() {
    const hashedPassword = await bcrypt.hash('Demo@123', 10);

    return [
        {
            username: 'rahul_trader',
            email: 'rahul@demo.com',
            password: hashedPassword,
            balance: 500000,
            currency: 'INR',
            status: 'active',
            holdings: [
                { symbol: 'RELIANCE.NS', quantity: 50, average_price: 2400 },
                { symbol: 'TCS.NS', quantity: 25, average_price: 3800 },
                { symbol: 'HDFCBANK.NS', quantity: 40, average_price: 1600 }
            ]
        },
        {
            username: 'priya_investor',
            email: 'priya@demo.com',
            password: hashedPassword,
            balance: 750000,
            currency: 'INR',
            status: 'active',
            holdings: [
                { symbol: 'INFY.NS', quantity: 100, average_price: 1500 },
                { symbol: 'TATAMOTORS.NS', quantity: 200, average_price: 750 }
            ]
        },
        {
            username: 'amit_daytrader',
            email: 'amit@demo.com',
            password: hashedPassword,
            balance: 250000,
            currency: 'INR',
            status: 'active',
            holdings: [
                { symbol: 'ICICIBANK.NS', quantity: 80, average_price: 1020 },
                { symbol: 'ITC.NS', quantity: 500, average_price: 450 }
            ]
        },
        {
            username: 'neha_newbie',
            email: 'neha@demo.com',
            password: hashedPassword,
            balance: 100000,
            currency: 'INR',
            status: 'active',
            holdings: []
        },
        {
            username: 'test_suspended',
            email: 'suspended@demo.com',
            password: hashedPassword,
            balance: 50000,
            currency: 'INR',
            status: 'suspended',
            holdings: []
        }
    ];
}

// Sample Transactions
function createSampleTransactions(users) {
    const transactions = [];
    const symbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'TATAMOTORS.NS', 'ITC.NS'];
    const types = ['BUY', 'SELL'];

    users.forEach(user => {
        const numTransactions = Math.floor(Math.random() * 10) + 5;

        for (let i = 0; i < numTransactions; i++) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const quantity = Math.floor(Math.random() * 50) + 10;
            const price = 500 + Math.random() * 3000;

            transactions.push({
                user_id: user._id,
                symbol,
                type,
                quantity,
                price: parseFloat(price.toFixed(2)),
                total_amount: parseFloat((quantity * price).toFixed(2)),
                created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            });
        }
    });

    return transactions;
}

// Sample Complaints
function createSampleComplaints(users) {
    const activeUsers = users.filter(u => u.status === 'active');

    return [
        {
            userId: activeUsers[0]._id,
            type: 'complaint',
            subject: 'Order execution delay',
            message: 'My buy orders are taking too long to execute during market hours.',
            status: 'pending',
            priority: 'high'
        },
        {
            userId: activeUsers[1]._id,
            type: 'suggestion',
            subject: 'Add more stocks',
            message: 'Please add more mid-cap and small-cap stocks to the platform.',
            status: 'reviewed',
            priority: 'low'
        },
        {
            userId: activeUsers[2]._id,
            type: 'complaint',
            subject: 'Chart loading issues',
            message: 'TradingView charts sometimes fail to load properly.',
            status: 'pending',
            priority: 'medium'
        },
        {
            userId: activeUsers[0]._id,
            type: 'suggestion',
            subject: 'F&O Trading',
            message: 'Please add Futures and Options trading feature.',
            status: 'resolved',
            priority: 'medium',
            adminResponse: 'Thank you! F&O trading is planned for our next major update.'
        }
    ];
}

// ============== MAIN SETUP FUNCTION ==============

async function setupDatabase() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   OVERVIEW INVEST - INDIAN MARKET DATABASE SETUP         ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    try {
        console.log('📡 Connecting to MongoDB...');
        console.log(`   URI: ${MONGO_URI}\n`);

        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB successfully!\n');

        // Drop existing collections
        console.log('🗑️  Clearing existing data...');
        const collections = ['users', 'stocks', 'transactions', 'complaints', 'news', 'otps', 'stockpricehistories', 'orders', 'quicktrades', 'marketmanipulations'];

        for (const collection of collections) {
            try {
                await mongoose.connection.db.dropCollection(collection);
                console.log(`   ✓ Dropped: ${collection}`);
            } catch (e) {
                // Collection might not exist
            }
        }
        console.log('');

        // Create Stocks
        console.log('📈 Creating NSE stocks...');
        await Stock.insertMany(stocksData);
        console.log(`   ✓ Created ${stocksData.length} Indian stocks\n`);

        // Create Demo Users
        console.log('👥 Creating demo users...');
        const usersData = await createDemoUsers();
        const users = await User.insertMany(usersData);
        console.log(`   ✓ Created ${users.length} users\n`);

        // Create Transactions
        console.log('💰 Creating sample transactions...');
        const transactionsData = createSampleTransactions(users);
        await Transaction.insertMany(transactionsData);
        console.log(`   ✓ Created ${transactionsData.length} transactions\n`);

        // Create Complaints
        console.log('💬 Creating sample complaints...');
        const complaintsData = createSampleComplaints(users);
        await Complaint.insertMany(complaintsData);
        console.log(`   ✓ Created ${complaintsData.length} complaints\n`);

        // Summary
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║     DATABASE SETUP COMPLETE! (INDIAN MARKET)             ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log('║                                                          ║');
        console.log(`║  � NSE Stocks:   ${stocksData.length.toString().padEnd(38)}║`);
        console.log(`║  👥 Users:        ${users.length.toString().padEnd(38)}║`);
        console.log(`║  💰 Transactions: ${transactionsData.length.toString().padEnd(38)}║`);
        console.log(`║  💬 Complaints:   ${complaintsData.length.toString().padEnd(38)}║`);
        console.log('║                                                          ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log('║  Demo User Credentials (Currency: INR):                  ║');
        console.log('║  Email: rahul@demo.com | Password: Demo@123              ║');
        console.log('║  Email: priya@demo.com | Password: Demo@123              ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('\n❌ Error setting up database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('📡 Disconnected from MongoDB\n');
    }
}

// Run setup
setupDatabase();
