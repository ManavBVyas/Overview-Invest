# 📊 Overview Invest V5 - Project Audit Report

**Generated:** January 31, 2026
**Auditor:** Claude AI

---

## 📁 Project Structure Overview

```
Overview_Invest_V5/
├── client/          # React frontend
├── server/          # Node.js backend
├── admin/           # Admin panel
├── market_engine/   # Python market data scripts
├── Verification/    # Laravel verification service
├── ServerManagerApp/# Server management utility
└── overview-theme-pkg/ # Theme package
```

---

## ✅ REAL DATA SOURCES (Currently Active)

### 1. **TradingView MarketService** (PRIMARY - ENABLED ✅)
- **File:** `server/services/TradingViewMarketService.js`
- **Status:** Enabled in `server/index.js`
- **Function:** Fetches REAL-TIME stock prices from TradingView WebSocket
- **Data Flow:** TradingView → Node.js → Socket.IO → Frontend
- **Updates:** Real-time push updates

### 2. **Python Yahoo Finance Feed** (SECONDARY)
- **File:** `market_engine/run_market_feed.py`
- **Status:** Optional, uses Yahoo Finance API
- **Function:** Fetches real prices via yfinance library
- **Assets:** 100+ Indian stocks, 2 crypto
- **Data Flow:** Yahoo Finance → Redis → Node.js → Socket.IO → Frontend
- **Updates:** Every 5 seconds

### 3. **Database (MongoDB)**
- **Function:** Stores stock metadata, user data, transactions
- **Real Data:** Stock symbols, user portfolios, transaction history

---

## ⚠️ SIMULATED/RANDOM DATA (Identified)

### 1. **`seed-history.js`** - GENERATES FAKE PRICE HISTORY ⚠️
- **File:** `server/seed-history.js`
- **Issue:** Creates simulated 24-hour price history with `Math.random() * 0.04 - 0.02` variation
- **Impact:** Dashboard Day Low/High may show fake data
- **Recommendation:** DELETE or replace with real historical data from TradingView

### 2. **`market_engine/market_sim.py`** - MARKET SIMULATION ⚠️
- **File:** `market_engine/market_sim.py`
- **Issue:** Contains order book simulation, not real trading
- **Impact:** Not used for prices, only for order matching (educational/demo)
- **Recommendation:** DELETE if not needed, keep for demo purposes only

### 3. **`run_market_feed.py` - Minor Price Jitter** ⚠️
- **File:** `market_engine/run_market_feed.py` (Lines 179-182, 186)
- **Issue:** Adds ±0.05% random jitter to real prices
- **Code:** `jitter = 1.0 + (random.uniform(-0.0005, 0.0005))`
- **Impact:** Slightly alters real prices to simulate market movement
- **Recommendation:** REMOVE jitter for 100% real prices

### 4. **`redis-subscriber.js` - Logging Randomization** ✅ Minor
- **File:** `server/redis-subscriber.js` (Line 51)
- **Issue:** Uses `Math.random() < 0.1` for logging frequency only
- **Impact:** None on data - just controls log output
- **Recommendation:** Keep as-is (harmless)

### 5. **`setup-database.js` - Sample Transaction Data** ⚠️
- **File:** `server/setup-database.js` (Lines 160-175)
- **Issue:** Creates random sample transactions for testing
- **Impact:** Demo users have fake transaction history
- **Recommendation:** Keep for demo, clear for production

### 6. **`VerificationService.js` - OTP Generation** ✅ Required
- **File:** `server/services/VerificationService.js` (Line 30)
- **Code:** `Math.floor(100000 + Math.random() * 900000)`
- **Impact:** None - this is standard OTP generation (required)
- **Recommendation:** Keep as-is

---

## 🗑️ FILES RECOMMENDED FOR DELETION

### Must Delete (Unused/Redundant)
| File | Reason |
|------|--------|
| `market_engine/market_sim.py` | Simulation code not integrated with main app |
| `server/seed-history.js` | Generates fake price history |
| `start_market_data.bat` | Starts simulation services (obsolete) |
| `server/models/News.js` | News feature not implemented |
| `server/models/MarketManipulation.js` | Admin feature not used in production |

### Optional Delete (Keep for Development)
| File | Reason |
|------|--------|
| `CLI_COMPLETE.md` | Documentation |
| `CLI_GUIDE.md` | Documentation |
| `HEALTH_CHECK_GUIDE.md` | Documentation |
| `QUICK_START.md` | Documentation |
| `START_SCRIPTS.md` | Documentation |
| `found_paths.txt` | Debug artifact |
| `cleanup_price_history.js` | Utility script |

---

## 🔧 FIXES APPLIED

1. ✅ **Enabled TradingView Market Service** in `server/index.js`
2. ✅ **Fixed graceful shutdown** to handle null marketDataService
3. ✅ **TradingView is now the PRIMARY price source** (real-time)

---

## 📈 CURRENT DATA FLOW

```
┌─────────────────────────────────────────────────────────┐
│               REAL-TIME PRICE FLOW                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  TradingView WebSocket ─→ TradingViewMarketService.js    │
│            │                       │                     │
│            │                       ↓                     │
│            │              Updates MongoDB Stock          │
│            │                       │                     │
│            │                       ↓                     │
│            └──────→ Socket.IO broadcasts 'priceUpdate'   │
│                               │                          │
│                               ↓                          │
│                     Frontend receives real prices        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 WEBSITE FEATURE SUMMARY

### Active Features
| Feature | Status | Data Source |
|---------|--------|-------------|
| Real-time stock prices | ✅ Working | TradingView |
| Stock detail page | ✅ Working | TradingView charts + DB data |
| User authentication | ✅ Working | MongoDB |
| Portfolio management | ✅ Working | MongoDB |
| Buy/Sell trading | ✅ Working | MongoDB |
| Transaction history | ✅ Working | MongoDB |
| Admin panel | ✅ Working | MongoDB |
| OTP verification | ✅ Working | VerificationService |

### Unused/Partial Features
| Feature | Status | Notes |
|---------|--------|-------|
| News feed | ❌ Not Used | Model exists, no API endpoints |
| Market manipulation | ❌ Not Used | Admin feature, not integrated |
| Technical indicators | ❌ Not Used | Redis channel exists but no frontend |
| Candle history | ❌ Not Used | Redis channel, no frontend charts |

---

## 🚀 COMPLETED ACTIONS ✅

### Simulation Data Removed
1. [x] **Deleted** `market_engine/market_sim.py` - Market simulation core
2. [x] **Deleted** `server/seed-history.js` - Fake price history generator
3. [x] **Deleted** `start_market_data.bat` - Simulation services starter
4. [x] **Deleted** `server/models/News.js` - Unused news model
5. [x] **Deleted** `server/models/MarketManipulation.js` - Unused manipulation model
6. [x] **Deleted** `found_paths.txt` - Debug artifact
7. [x] **Removed jitter** from `run_market_feed.py` - Now uses 100% real prices

### Active Real-Time Data Sources
- ✅ **TradingView MarketService** - Primary real-time prices (ENABLED)
- ✅ **Yahoo Finance Feed** (optional) - Backup feed, now without jitter

### Keep For Production
- `TradingViewMarketService.js` - Real-time prices ✅
- All React components in `client/`
- All user/auth models
- Admin panel

---

## 📊 TECHNOLOGY STACK

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| Real Prices | TradingView WebSocket |
| Cache | Redis (optional) |
| Charts | TradingView Widget |
| Styling | Custom CSS (Cyberpunk theme) |
| Admin | React Admin Panel |

---

**Report End**
