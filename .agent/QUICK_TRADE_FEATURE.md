# ⚡ Quick Trade Feature - Complete Setup Guide

## 🎯 What is Quick Trade?

**Quick Trade** is a binary options trading feature (like Binomo/IQ Option) where users:
- Predict if a stock price will go **UP** or **DOWN**
- Choose a time duration (1min to 1 day)
- Place an investment amount
- Get **80% profit** if correct, or **lose investment** if wrong
- Trades **auto-settle** when time expires

---

## 📋 Setup Steps

### **Step 1: Create Database Table**

Run this SQL migration:

```sql
cd server
psql -h [your-supabase-host] -U [user] -d postgres -f migrations/create_quick_trades.sql
```

Or manually connect to your Supabase database and run the SQL in `server/migrations/create_quick_trades.sql`

---

### **Step 2: Restart Backend**

The backend now includes:
- ✅ Quick trade API routes
- ✅ Auto-settlement system (checks every 5 seconds)
- ✅ Win/loss calculation logic

```cmd
cd server
node index.js
```

---

### **Step 3: Restart Frontend**

```cmd
cd client
npm run dev
```

---

## 🎮 How to Use

### **For Users:**

1. **Login** to the platform
2. Click **"⚡ Quick Trade"** button in the header
3. **Select a stock** from the dropdown
4. **Enter investment** amount (minimum $1)
5. **Choose prediction**: UP 📈 or DOWN 📉
6. **Select duration**: 1min, 2min, 5min, 10min, 30min, 1hr, or 1 day
7. **Place trade!**

### **What Happens:**

- ✅ Amount is deducted from balance immediately
- ✅ Entry price is recorded
- ✅ Trade appears in "Active Trades" section
- ✅ You can see if you're currently winning/losing
- ✅ Auto-settlement happens when time expires
- ✅ If prediction correct: Get back investment + 80% profit
- ✅ If prediction wrong: Lose the investment

---

## 💡 Feature Highlights

### **Dashboard:**
- **Stats Cards**: Total trades, win rate, net profit
- **Active Trades Monitor**: See all running trades with countdown timers
- **Real-time Status**: Shows if currently winning or losing
- **Trade History**: All settled trades with P/L

### **Settlement System:**
- **Auto-settle**: Background job runs every 5 seconds
- **Accurate**: Compares entry vs exit price
- **Instant Credit**: Winners get paid immediately
- **Fair Calculation**: 80% profit on wins, 100% loss on losses

---

## 🔧 API Endpoints

### **User Endpoints:**
```
POST   /api/quick-trade/create        - Create new quick trade
GET    /api/quick-trade/active        - Get active trades
GET    /api/quick-trade/history       - Get trade history
GET    /api/quick-trade/stats         - Get user statistics
```

### **Admin Endpoint:**
```
POST   /api/admin/quick-trade/settle  - Force settle a trade (testing)
```

---

## 📊 Database Schema

```sql
quick_trades:
  - id: Serial
  - user_id: FK to users
  - symbol: Stock symbol
  - entry_price: Price when trade started
  - amount: Investment amount
  - prediction: 'UP' or 'DOWN'
  - duration_minutes: Trade duration
  - created_at: Start time
  - expires_at: End time
  - settled_at: Settlement time
  - exit_price: Price at settlement
  - profit_loss: Calculated P/L
  - status: 'ACTIVE', 'WON', 'LOST'
```

---

## 🎯 Example Trade Flow

### **Scenario:**
- User Alice has $100 balance
- AAPL is currently at $150.00

### **Action:**
1. Alice clicks "Quick Trade"
2. Selects AAPL
3. Invests $10
4. Predicts **UP**
5. Chooses **2 Minutes**

### **What Happens:**
- ✅ Balance: $100 → $90 (immediate deduction)
- ✅ Entry Price: $150.00
- ✅ Timer starts: 2:00, 1:59, 1:58...

### **Outcome 1: WIN** 🎉
- After 2 minutes, AAPL = $152.50 (went UP!)
- ✅ Profit: $10 × 80% = $8
- ✅ Total return: $10 + $8 = $18
- ✅ Final balance: $90 + $18 = $108

### **Outcome 2: LOSS** 😞
- After 2 minutes, AAPL = $148.00 (went DOWN!)
- ❌ Loss: -$10 (entire investment)
- ❌ Total return: $0
- ❌ Final balance: $90

---

## ⚙️ Configuration

### **Payout Percentage:**
Edit `server/quickTrades.js`:
```javascript
const DEFAULT_PAYOUT = 80; // 80% profit on win
```

### **Duration Options:**
```javascript
const ALLOWED_DURATIONS = [1, 2, 5, 10, 30, 60, 1440];
```

### **Settlement Frequency:**
Edit `server/index.js`:
```javascript
setInterval(() => {
    quickTrades.settleExpiredTrades();
}, 5000); // Check every 5 seconds
```

---

## 🎨 UI Features

### **Professional Design:**
- ✅ Gradient header with animated text
- ✅ Real-time countdown timers
- ✅ Color-coded win/loss indicators
- ✅ Responsive layout
- ✅ Live price updates
- ✅ Interactive prediction buttons

### **User Experience:**
- ✅ One-click access from dashboard
- ✅ Clear profit/loss calculations
- ✅ Real-time winning/losing status
- ✅ Comprehensive trade history
- ✅ Stats dashboard with win rate

---

## 🚀 Testing

### **Manual Test:**
1. Login as a user
2. Go to Quick Trade page
3. Place a 1-minute UP trade on AAPL for $5
4. Watch the active trades section
5. Wait 1 minute
6. Check if it auto-settled correctly
7. Verify balance updated

### **Admin Test:**
```bash
curl -X POST http://localhost:5000/api/admin/quick-trade/settle \
  -H "Authorization: Bearer [admin-token]" \
  -H "Content-Type: application/json" \
  -d '{"tradeId": 1}'
```

---

## 📁 Files Created

### **Backend:**
```
server/
├── quickTrades.js                    - Quick trade logic & API
├── migrations/
│   └── create_quick_trades.sql       - Database schema
└── index.js                          - Updated with routes
```

### **Frontend:**
```
client/src/
├── pages/
│   ├── QuickTrade.jsx                - Main component
│   └── Dashboard.jsx                 - Added button
├── styles/
│   └── QuickTrade.css                - Styling
└── App.jsx                           - Added route
```

---

## 🎉 Success Checklist

- [ ] Database table created
- [ ] Backend restarted
- [ ] Frontend restarted
- [ ] Quick Trade button visible in dashboard
- [ ] Can access /quick-trade page
- [ ] Can place a trade
- [ ] Active trades show countdown
- [ ] Trades auto-settle after expiry
- [ ] Balance updates correctly
- [ ] History shows past trades
- [ ] Stats show win rate

---

## 🆘 Troubleshooting

### **"Table doesn't exist"**
Run the SQL migration file in Supabase

### **"Auto-settlement not working"**
Check backend console for errors. Settlement job runs every 5 seconds.

### **"Balance not updating"**
Check if trade actually settled (status should be WON or LOST, not ACTIVE)

### **"Can't access Quick Trade page"**
Make sure frontend restarted after adding the route

---

## 🎯 Next Steps (Optional Enhancements)

1. **Variable Payouts**: Different stocks have different payout %
2. **Multiple Simultaneous Trades**: Allow more than one active trade
3. **Notifications**: Alert users when trades settle
4. **Charts**: Show price movement during trade duration
5. **Social Features**: Leaderboard of top traders
6. **Copy Trading**: Follow other successful traders

---

**🎉 You now have a fully functional binary options trading platform!**

Access it at: **http://localhost:5173/quick-trade**
