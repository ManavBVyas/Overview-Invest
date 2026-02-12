# 📋 Feature Queue - Overview Invest V5

## 🎯 Queued Features (Not Yet Implemented)

### Priority 1: Multi-Currency Support 💱
**Status:** Queued  
**Estimated Complexity:** Medium-High  
**Description:**
- Add cryptocurrency assets (BTC, ETH, SOL, DOGE, ADA, etc.)
- Add forex pairs (USD/EUR, GBP/USD, JPY/USD, etc.)
- Implement currency selector for user accounts (USD, EUR, GBP, INR, JPY, etc.)
- Real-time currency conversion for all prices and balances
- Separate sections for Stocks, Crypto, and Forex in market view

**Implementation Steps:**
1. Backend:
   - Add `asset_type` column to stocks table (STOCK, CRYPTO, FOREX)
   - Add `user_currency` to users table (default: USD)
   - Create currency conversion API endpoint
   - Seed crypto and forex data
   
2. Frontend:
   - Currency selector in user settings/profile
   - Convert all price displays based on user currency
   - Add tabs/filters for Stocks, Crypto, Forex
   - Show currency symbol (₹, €, £, ¥, $) dynamically

---

### Priority 2: Mobile Responsive Design 📱
**Status:** Queued  
**Estimated Complexity:** Medium  
**Description:**
- Full mobile optimization for phones and tablets
- Touch-friendly interface with larger tap targets
- Swipe gestures for chart navigation
- Responsive layouts that adapt to screen size
- Bottom navigation bar for mobile

**Implementation Steps:**
1. Responsive Layout:
   - Add CSS media queries (@media breakpoints)
   - Stack grid layouts to single column on mobile
   - Hamburger menu for navigation
   - Collapsible sections
   
2. Touch Optimizations:
   - Increase button sizes (min 48px tap targets)
   - Add swipe gestures to charts (using hammer.js or react-swipeable)
   - Bottom sticky navigation bar
   - Pull-to-refresh on portfolio
   
3. Chart Improvements:
   - Pan and zoom with touch
   - Pinch to zoom
   - Better chart controls for mobile

---

## ✅ Completed Features

- [x] TradingView-style multi-chart support (Area, Line, Candlestick, Bar)
- [x] Real-time price updates via WebSocket
- [x] Backend-calculated Day Range, 52W Range, and Volume
- [x] Floating glassmorphic header with navigation
- [x] Blurred ticker background for better readability
- [x] Stock name glare/glow effect
- [x] Admin market manipulation
- [x] Real-time portfolio tracking
- [x] Trade execution (Buy/Sell)
- [x] Transaction history
- [x] Multiple stock support

---

## 💡 Other Suggested Features (Not Prioritized)

- Watchlist / Favorites ⭐
- Price Alerts & Notifications 🔔
- Portfolio Analytics Charts 📊
- Advanced Order Types (Limit, Stop-Loss) 📈
- Stock Search & Filters 🔍
- News Feed Integration 📰
- Leaderboard & Competitions 🏆
- Technical Indicators (RSI, MACD, etc.)
- Dark/Light Theme Toggle 🌙
- Export Reports (CSV, PDF) 📄
- Transaction History Filters
- Paper Trading Mode

---

**Notes:**
- Features will be implemented in order of priority
- Each feature will be fully tested before moving to the next
- User can request to change priority or add new features anytime
