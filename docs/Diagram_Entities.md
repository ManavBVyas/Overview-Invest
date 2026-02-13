# Overview Invest — Diagram Entities Reference
> Auto-extracted from the codebase on 2026-02-13

---

## 1. ER Diagram (Entity-Relationship)

### 1.1 Entities & Attributes

| Entity | Attributes (PK = Primary Key, FK = Foreign Key) |
|---|---|
| **User** | `_id` (PK), `username`, `email` (Unique), `password`, `role` (user/admin), `status` (active/suspended), `is_active`, `balance`, `notifications`, `language`, `currency`, `two_factor`, `holdings[]` (embedded), `createdAt`, `updatedAt` |
| **User.Holdings** *(Embedded Sub-document)* | `symbol`, `quantity`, `average_price` |
| **Stock** | `_id` (PK), `symbol` (Unique), `name`, `price`, `last_updated`, `liquidity` (High/Medium/Low), `market_state`, `sector`, `country`, `risk_profile` |
| **Transaction** | `_id` (PK), `user_id` (FK → User), `symbol`, `type` (BUY/SELL), `quantity`, `price`, `total_amount`, `created_at` |
| **Order** | `_id` (PK), `symbol`, `user_id` (FK → User, nullable for AI), `user_type` (human/ai_retail/ai_institution), `side` (BUY/SELL), `quantity`, `price`, `timestamp` |
| **StockPriceHistory** | `_id` (PK), `stock_id` (FK → Stock), `symbol` (denormalized), `price`, `recorded_at` |
| **OTP** | `_id` (PK), `email`, `otp`, `created_at` (TTL: 300s / 5 min) |

### 1.2 Relationships

| Relationship | Type | Description |
|---|---|---|
| User → Transaction | 1 : M | One user has many transactions (`user_id`) |
| User → Order | 1 : M | One user places many orders (`user_id`) |
| User → Holdings | 1 : M (Embedded) | One user owns many holdings (embedded array) |
| Stock → StockPriceHistory | 1 : M | One stock has many historical price records (`stock_id`) |
| Stock ← Transaction | M : 1 | Many transactions reference one stock (`symbol`) |
| Stock ← Order | M : 1 | Many orders reference one stock (`symbol`) |
| User ← OTP | 1 : M | One user email can have multiple OTPs (latest valid) |

### 1.3 ER Diagram Notation (for drawing)

```
┌─────────────┐       1:M        ┌──────────────┐
│    User      │─────────────────▸│ Transaction  │
│  (PK: _id)  │                  │ (FK: user_id)│
└──────┬───────┘                  └──────────────┘
       │ 1:M (embedded)                  │ M:1
       ▼                                 ▼
┌──────────────┐                  ┌─────────────┐
│  Holdings[]  │                  │    Stock     │
│  (symbol,    │                  │ (PK: _id)   │
│   qty, avg)  │                  └──────┬───────┘
└──────────────┘                         │ 1:M
                                         ▼
┌──────────────┐                  ┌──────────────────┐
│    Order     │                  │ StockPriceHistory │
│ (FK: user_id)│                  │  (FK: stock_id)   │
└──────────────┘                  └──────────────────┘

┌──────────────┐
│     OTP      │  (linked by email, no FK)
│  (email, otp)│
└──────────────┘
```

---

## 2. DFD — Data Flow Diagrams

### 2.1 DFD Level 0 (Context Diagram)

**External Entities (Actors):**
| Actor | Description |
|---|---|
| **User (Trader)** | Registered user who trades stocks |
| **Admin** | Platform administrator who manages users/stocks |
| **Finnhub API** | External real-time stock market data provider |
| **SMTP Email Server** | External email service (OTP delivery, invoices) |

**Central Process:**
`Overview Invest Platform`

**Data Flows:**

| From | To | Data |
|---|---|---|
| User | System | Registration data, Login credentials, OTP code, Trade orders (Buy/Sell), Settings, Deposit/Withdraw requests |
| System | User | Auth tokens, Portfolio data, Stock prices, Transaction history, Leaderboard, Invoices (PDF via email), OTP emails |
| Admin | System | Admin login credentials, User management actions, Stock CRUD operations, Market refresh requests |
| System | Admin | Dashboard stats, Analytics data, User lists, Stock lists, Chart data |
| Finnhub API | System | Real-time stock quotes (price, high, low, open, change%) |
| System | Finnhub API | API requests with symbol queries |
| System | SMTP Server | OTP emails, Invoice PDF attachments |
| SMTP Server | User | Email delivery (OTP codes, Purchase invoices) |

---

### 2.2 DFD Level 1 (Major Processes)

**Processes:**

| # | Process | Description |
|---|---|---|
| P1 | **Authentication & Verification** | Handles user registration, login, OTP verification, admin login |
| P2 | **Trading Engine** | Processes buy/sell orders, updates holdings & balance |
| P3 | **Portfolio Management** | Retrieves user portfolio, holdings, transaction history |
| P4 | **Market Data Service** | Fetches real-time stock prices from Finnhub, broadcasts via Socket.IO |
| P5 | **User Settings & Account** | Manages user preferences, deposit, withdraw |
| P6 | **Admin Management** | User CRUD, Stock CRUD, analytics, dashboard stats |
| P7 | **Invoice & Email Service** | Generates PDF invoices, sends OTP and invoice emails |
| P8 | **Leaderboard & Rankings** | Computes user rankings by total wealth |

**Data Stores:**

| ID | Store | Description |
|---|---|---|
| D1 | **Users** | User accounts, balances, holdings, preferences |
| D2 | **Stocks** | Listed stock information (symbol, name, price, sector) |
| D3 | **Transactions** | Record of all buy/sell trades |
| D4 | **Orders** | Order book entries (human + AI) |
| D5 | **StockPriceHistory** | Historical price snapshots |
| D6 | **OTPs** | Temporary OTP codes for email verification |
| D7 | **Finnhub Cache** | In-memory cache of latest quotes (not persisted) |

**Level 1 Data Flows:**

| From | Process | To | Data |
|---|---|---|---|
| User | → P1 | D1, D6 | Register: save user + generate OTP |
| User | → P1 | D1 | Login: validate credentials, return JWT token |
| User | → P1 | D6 | Verify OTP: compare code, activate account |
| P1 | → P7 | SMTP | Send OTP email |
| User | → P2 | D1, D2, D3, D4 | Place trade: validate funds/shares, update holdings, record transaction + order |
| P2 | → P7 | SMTP | Generate & email purchase invoice (BUY only) |
| User | → P3 | D1, D2 | View portfolio: fetch user holdings + current stock prices |
| User | → P3 | D3 | View transactions: fetch user's trade history |
| Finnhub API | → P4 | D2, D7 | Poll quotes, update Stock.price, cache in memory |
| P4 | → User | Socket.IO | Broadcast `priceUpdate` events to all connected clients |
| User | → P5 | D1 | Update settings (currency, language, notifications, 2FA) |
| User | → P5 | D1 | Deposit/Withdraw: update balance |
| Admin | → P6 | D1 | View/Activate/Deactivate/Delete users |
| Admin | → P6 | D2 | Add/Update/Delete stocks |
| Admin | → P6 | D1, D2, D3 | View dashboard stats, charts, analytics |
| User | → P8 | D1, D2 | View leaderboard: compute total wealth for all users |

---

### 2.3 DFD Level 2 (Process Decomposition)

#### P1: Authentication & Verification (Decomposed)

| Sub-Process | Input | Output | Data Stores |
|---|---|---|---|
| P1.1 Register | username, email, password | User record (is_active=false), OTP email | D1 (write), D6 (write) |
| P1.2 Send OTP | email | 6-digit OTP code via email | D6 (write), SMTP |
| P1.3 Verify OTP | email, code | Activate user (is_active=true), return JWT | D6 (read/delete), D1 (update) |
| P1.4 User Login | email, password | JWT token, user info | D1 (read) |
| P1.5 Admin Login | email, password | Admin JWT token | Environment vars (read) |

#### P2: Trading Engine (Decomposed)

| Sub-Process | Input | Output | Data Stores |
|---|---|---|---|
| P2.1 Validate Trade | symbol, quantity, type, user_id | Validation result | D2 (read), D1 (read) |
| P2.2 Execute BUY | symbol, quantity | Update balance (-), update/add holding, record transaction | D1 (update), D3 (write), D4 (write) |
| P2.3 Execute SELL | symbol, quantity | Update balance (+), reduce/remove holding, record transaction | D1 (update), D3 (write), D4 (write) |
| P2.4 Generate Invoice | trade details | PDF invoice → email | P7 (invoke), SMTP |

#### P3: Portfolio Management (Decomposed)

| Sub-Process | Input | Output | Data Stores |
|---|---|---|---|
| P3.1 Get Portfolio | user_id | Holdings with live prices, balance, settings | D1 (read), D2 (read) |
| P3.2 Get Transactions | user_id | List of user's transactions (latest 20) | D3 (read) |
| P3.3 Compute Performance | holdings, prices | Best/worst performer, P&L, returns % | D1 (read), D2 (read) |

#### P4: Market Data Service (Decomposed)

| Sub-Process | Input | Output | Data Stores |
|---|---|---|---|
| P4.1 Load Symbols | — | List of tracked symbols from DB | D2 (read) |
| P4.2 Fetch Quotes | Finnhub API key, symbols | Raw quote data (price, high, low, open, change) | Finnhub API (external) |
| P4.3 Update Prices | Quotes | Updated Stock.price in DB | D2 (write) |
| P4.4 Broadcast Updates | Price changes | `priceUpdate` Socket.IO event to all clients | D7 (in-memory cache) |
| P4.5 Rate Limiter | API calls per minute | Throttle/delay if > 60 calls/min | Internal counter |

#### P5: User Settings & Account (Decomposed)

| Sub-Process | Input | Output | Data Stores |
|---|---|---|---|
| P5.1 Update Settings | notifications, language, currency, two_factor | Confirmation | D1 (update) |
| P5.2 Deposit | amount | Updated balance | D1 (update) |
| P5.3 Withdraw | amount | Updated balance (if sufficient funds) | D1 (read/update) |

#### P6: Admin Management (Decomposed)

| Sub-Process | Input | Output | Data Stores |
|---|---|---|---|
| P6.1 Dashboard Stats | — | totalUsers, activeUsers, totalTransactions, totalVolume, totalBalance, totalStocks | D1 (read), D2 (read), D3 (read) |
| P6.2 Chart Data | — | User registrations (30d), transactions by day, buy vs sell, top stocks, balance distribution | D1 (read), D3 (read) |
| P6.3 User Management | search, status filter, pagination | User list, activate, deactivate, delete operations | D1 (read/update/delete), D3 (delete) |
| P6.4 Stock Management | symbol, name, price | Add stock, update price, delete stock | D2 (write/update/delete) |
| P6.5 Analytics | — | Platform stats, user growth, trading activity, top stocks, portfolio distribution, most active users | D1 (read), D2 (read), D3 (read) |
| P6.6 Refresh Market Data | — | Trigger manual Finnhub fetch | P4 (invoke) |

---

## 3. Use Case Diagram

### 3.1 Actors

| Actor | Type | Description |
|---|---|---|
| **Guest** | Primary | Unregistered visitor browsing the landing page |
| **User (Trader)** | Primary | Authenticated user who trades stocks |
| **Admin** | Primary | Platform administrator |
| **Finnhub API** | Secondary | External market data provider |
| **SMTP Server** | Secondary | Email service |
| **System (Timer)** | Secondary | Periodic market data polling |

### 3.2 Use Cases

#### Guest Use Cases
| ID | Use Case | Description |
|---|---|---|
| UC-01 | View Landing Page | Browse platform info, stats, features |
| UC-02 | Register Account | Create new account with username, email, password |
| UC-03 | Login | Authenticate with email and password |
| UC-04 | Verify OTP | Enter OTP code received via email to activate account |
| UC-05 | View Public Stats | See user count, trade count, trade volume (public API) |

#### User (Trader) Use Cases
| ID | Use Case | Description | Includes / Extends |
|---|---|---|---|
| UC-06 | View Dashboard | See market data, portfolio summary, top movers, trade form | Includes: UC-12 |
| UC-07 | Buy Stock | Purchase shares of a stock | Extends: UC-14 (Invoice) |
| UC-08 | Sell Stock | Sell shares from portfolio | — |
| UC-09 | View Portfolio | See current holdings, P&L, transaction history, performance | — |
| UC-10 | View Stock Detail | See detailed stock info with TradingView chart, buy/sell panel | — |
| UC-11 | Search Stocks | Search stocks by symbol or name | — |
| UC-12 | View Real-Time Prices | Receive live price updates via WebSocket | — |
| UC-13 | View Leaderboard | See ranking of top traders by total wealth | — |
| UC-14 | Receive Invoice | Get PDF invoice via email for BUY trades | — |
| UC-15 | View Account | See account info, balance | — |
| UC-16 | Update Settings | Change language, currency, notifications, 2FA | — |
| UC-17 | Deposit Funds | Add money to balance | — |
| UC-18 | Withdraw Funds | Remove money from balance | — |
| UC-19 | View Rank Showcase | See gamified rank/tier based on portfolio performance | — |
| UC-20 | Logout | End session | — |

#### Admin Use Cases
| ID | Use Case | Description |
|---|---|---|
| UC-21 | Admin Login | Authenticate as admin (separate credentials) |
| UC-22 | View Admin Dashboard | See platform stats, charts, analytics |
| UC-23 | Manage Users | List, search, filter, activate, deactivate, delete users |
| UC-24 | View User Details | See individual user info + transactions |
| UC-25 | Manage Stocks | Add, update price, delete stocks |
| UC-26 | View Analytics | Platform stats, user growth, trading activity, top stocks, active users |
| UC-27 | Refresh Market Data | Manually trigger Finnhub fetch |
| UC-28 | Admin Logout | End admin session |

---

## 4. Class Diagram

### 4.1 Model Classes (Backend — Mongoose Schemas)

```
┌──────────────────────────────────┐
│            <<Model>>             │
│              User                │
├──────────────────────────────────┤
│ - _id: ObjectId                  │
│ - username: String               │
│ - email: String {unique}         │
│ - password: String               │
│ - role: String                   │
│ - status: String [active|suspended] │
│ - is_active: Boolean             │
│ - balance: Number                │
│ - notifications: Boolean         │
│ - language: String               │
│ - currency: String               │
│ - two_factor: Boolean            │
│ - holdings: Holding[]            │
│ - createdAt: Date                │
│ - updatedAt: Date                │
├──────────────────────────────────┤
│ + findOne(query)                 │
│ + findById(id)                   │
│ + findByIdAndUpdate(id, data)    │
│ + countDocuments(query)          │
│ + aggregate(pipeline)            │
│ + save()                         │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│         <<Embedded>>             │
│           Holding                │
├──────────────────────────────────┤
│ - symbol: String                 │
│ - quantity: Number               │
│ - average_price: Number          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│            <<Model>>             │
│             Stock                │
├──────────────────────────────────┤
│ - _id: ObjectId                  │
│ - symbol: String {unique, index} │
│ - name: String                   │
│ - price: Number                  │
│ - last_updated: Date             │
│ - liquidity: String              │
│ - market_state: String           │
│ - sector: String                 │
│ - country: String                │
│ - risk_profile: String           │
├──────────────────────────────────┤
│ + find(query)                    │
│ + findOne(query)                 │
│ + findByIdAndUpdate(id, data)    │
│ + findByIdAndDelete(id)          │
│ + create(data)                   │
│ + countDocuments()               │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│            <<Model>>             │
│          Transaction             │
├──────────────────────────────────┤
│ - _id: ObjectId                  │
│ - user_id: ObjectId (→ User)     │
│ - symbol: String                 │
│ - type: String [BUY|SELL]        │
│ - quantity: Number               │
│ - price: Number                  │
│ - total_amount: Number           │
│ - created_at: Date               │
├──────────────────────────────────┤
│ + create(data)                   │
│ + find(query)                    │
│ + countDocuments(query)          │
│ + aggregate(pipeline)            │
│ + deleteMany(query)              │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│            <<Model>>             │
│             Order                │
├──────────────────────────────────┤
│ - _id: ObjectId                  │
│ - symbol: String                 │
│ - user_id: ObjectId (→ User)     │
│ - user_type: String              │
│   [human|ai_retail|ai_institution]│
│ - side: String [BUY|SELL]        │
│ - quantity: Number               │
│ - price: Number                  │
│ - timestamp: Date                │
├──────────────────────────────────┤
│ + create(data)                   │
│ + deleteMany(query)              │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│            <<Model>>             │
│       StockPriceHistory          │
├──────────────────────────────────┤
│ - _id: ObjectId                  │
│ - stock_id: ObjectId (→ Stock)   │
│ - symbol: String (denormalized)  │
│ - price: Number                  │
│ - recorded_at: Date              │
├──────────────────────────────────┤
│ + find(query)                    │
│ + create(data)                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│            <<Model>>             │
│              OTP                 │
├──────────────────────────────────┤
│ - _id: ObjectId                  │
│ - email: String                  │
│ - otp: String                    │
│ - created_at: Date (TTL: 300s)   │
├──────────────────────────────────┤
│ + create(data)                   │
│ + findOne(query)                 │
│ + deleteMany(query)              │
└──────────────────────────────────┘
```

### 4.2 Service Classes (Backend)

```
┌──────────────────────────────────┐
│          <<Service>>             │
│     FinnhubMarketService         │
├──────────────────────────────────┤
│ - io: Socket.IO Server           │
│ - Stock: Mongoose Model          │
│ - apiKey: String                 │
│ - baseUrl: String                │
│ - symbols: String[]              │
│ - priceCache: Map<String,Object> │
│ - updateInterval: Interval       │
│ - apiCallCount: Number           │
│ - apiCallTimestamp: Number        │
├──────────────────────────────────┤
│ + initialize()                   │
│ + checkRateLimit(): Boolean      │
│ + fetchQuote(symbol): Object     │
│ + fetchAllQuotes(): void         │
│ + getQuote(symbol): Object       │
│ + getAllPrices(): Map             │
│ + reloadSymbols(): void          │
│ + stop(): void                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│          <<Service>>             │
│      VerificationService         │
├──────────────────────────────────┤
│ - transporter: Nodemailer        │
├──────────────────────────────────┤
│ + sendOtp(email): Promise        │
│ + verifyOtp(email, code): Promise│
│ + createInvoice(data): Promise   │
└──────────────────────────────────┘
```

### 4.3 Frontend Component Classes (React)

```
┌──────────────────────────────────┐
│          <<Page>>                │
│          Landing                 │
├──────────────────────────────────┤
│ Displays: hero, features,       │
│   public stats, live ticker      │
│ Links: Login, Register           │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│          <<Page>>                │
│         Dashboard                │
├──────────────────────────────────┤
│ State: stocks[], user, socket    │
│ Components: BackgroundTicker,    │
│   MarketTable, TradeForm,        │
│   PortfolioList, RankPanel,      │
│   MarketStatusHUD                │
│ WebSocket: priceUpdate listener  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│          <<Page>>                │
│        StockDetail               │
├──────────────────────────────────┤
│ State: stock, user               │
│ Components: TradingViewChart,    │
│   TradeForm, HistoryPanel        │
│ API: GET /api/stock/:symbol      │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│          <<Page>>                │
│         Portfolio                 │
├──────────────────────────────────┤
│ State: user, transactions, stocks│
│ Tabs: holdings, transactions,    │
│       performance                │
│ API: /api/user/portfolio,        │
│      /api/user/transactions      │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│          <<Page>>                │
│          Account                 │
├──────────────────────────────────┤
│ State: user data, balance        │
│ Features: account info,          │
│   deposit, withdraw              │
│ API: /api/user/portfolio,        │
│      /api/user/deposit,          │
│      /api/user/withdraw          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│          <<Page>>                │
│         Settings                 │
├──────────────────────────────────┤
│ State: language, currency,       │
│   notifications, two_factor      │
│ API: POST /api/user/settings     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│          <<Page>>                │
│       RankShowcase               │
├──────────────────────────────────┤
│ State: leaderboard data          │
│ API: GET /api/leaderboard        │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│        <<Component>>             │
│         TradeForm                │
├──────────────────────────────────┤
│ Props: stocks, onTrade           │
│ State: symbol, qty, type         │
│ API: POST /api/trade             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│        <<Component>>             │
│        MarketTable               │
├──────────────────────────────────┤
│ Props: stocks                    │
│ Features: category tabs,         │
│   search, sorting                │
└──────────────────────────────────┘
```

### 4.4 Class Relationships

| From | To | Type | Description |
|---|---|---|---|
| User | Holding | Composition (1:M) | User contains embedded holdings array |
| User → Transaction | Association (1:M) | user_id FK |
| User → Order | Association (1:M) | user_id FK |
| Stock → StockPriceHistory | Association (1:M) | stock_id FK |
| Transaction → Stock | Dependency | References stock by symbol |
| Order → Stock | Dependency | References stock by symbol |
| FinnhubMarketService → Stock | Dependency | Updates Stock model prices |
| FinnhubMarketService → Socket.IO | Dependency | Broadcasts price updates |
| VerificationService → OTP | Dependency | Creates and verifies OTPs |
| VerificationService → Nodemailer | Dependency | Sends emails |
| Dashboard → TradeForm | Composition | Contains as child component |
| Dashboard → MarketTable | Composition | Contains as child component |
| Dashboard → PortfolioList | Composition | Contains as child component |
| Dashboard → RankPanel | Composition | Contains as child component |
| StockDetail → TradingViewChart | Composition | Contains chart component |

---

## 5. Sequence Diagrams

### 5.1 User Registration & OTP Verification

```
Actor           Client App      Server(API)     VerificationService   OTP DB     User DB     SMTP
  │                 │                │                   │               │          │           │
  │──Register───────▶                │                   │               │          │           │
  │                 │──POST /api/register──▶             │               │          │           │
  │                 │                │──hash password────▶│               │          │           │
  │                 │                │──create User(is_active=false)─────────────────▶          │
  │                 │                │──sendOtp(email)───▶│               │          │           │
  │                 │                │                   │──generate OTP─▶│(save)    │           │
  │                 │                │                   │──send email───────────────────────────▶
  │                 │◀──{require_verification}──│        │               │          │           │
  │◀────Redirect to OTP page────────│                   │               │          │           │
  │                 │                │                   │               │          │           │
  │──Enter OTP──────▶                │                   │               │          │           │
  │                 │──POST /api/verify-otp──▶           │               │          │           │
  │                 │                │──verifyOtp(email,code)──▶         │          │           │
  │                 │                │                   │──find OTP─────▶│(read)    │           │
  │                 │                │                   │◀──OTP match───│(delete)  │           │
  │                 │                │──update User(is_active=true)─────────────────▶           │
  │                 │                │──sign JWT token───│               │          │           │
  │                 │◀──{token, user}│                   │               │          │           │
  │◀────Login Success────────────────│                   │               │          │           │
```

### 5.2 User Login

```
Actor          Client App       Server(API)       User DB
  │                │                 │                │
  │──Login─────────▶                 │                │
  │                │──POST /api/login──▶              │
  │                │                 │──findOne(email)─▶
  │                │                 │◀──user record──│
  │                │                 │──compare password│
  │                │                 │──check is_active & status│
  │                │                 │──sign JWT──────│
  │                │◀──{id,username,email,token}──│   │
  │◀────Dashboard──│                 │                │
```

### 5.3 Buy Stock

```
Actor       Client(Dashboard)   Server(API)     User DB    Stock DB   Transaction DB   Order DB   VerificationService   SMTP
  │              │                  │               │          │            │              │              │                │
  │──BUY order───▶                  │               │          │            │              │              │                │
  │              │──POST /api/trade──▶              │          │            │              │              │                │
  │              │                  │──findOne(symbol)─────────▶            │              │              │                │
  │              │                  │◀──stock(price)───────────│            │              │              │                │
  │              │                  │──findById(user_id)──▶    │            │              │              │                │
  │              │                  │◀──user(balance,holdings)─│            │              │              │                │
  │              │                  │──validate: balance >= totalCost       │              │              │                │
  │              │                  │──update balance(-), add/update holding│              │              │                │
  │              │                  │──user.save()─────────────▶            │              │              │                │
  │              │                  │──Transaction.create()──────────────────▶             │              │                │
  │              │                  │──Order.create()──────────────────────────────────────▶              │                │
  │              │                  │──createInvoice(data)─────────────────────────────────────────────────▶               │
  │              │                  │                                                                     │──send email───▶
  │              │◀──{message:"Success"}──│         │          │            │              │              │                │
  │◀────Updated UI────│             │               │          │            │              │              │                │
```

### 5.4 Sell Stock

```
Actor       Client(Dashboard)   Server(API)     User DB    Stock DB   Transaction DB   Order DB
  │              │                  │               │          │            │              │
  │──SELL order──▶                  │               │          │            │              │
  │              │──POST /api/trade──▶              │          │            │              │
  │              │                  │──findOne(symbol)─────────▶            │              │
  │              │                  │◀──stock(price)───────────│            │              │
  │              │                  │──findById(user_id)──▶    │            │              │
  │              │                  │◀──user(holdings)─────────│            │              │
  │              │                  │──validate: holding.qty >= quantity    │              │
  │              │                  │──update balance(+), reduce holding   │              │
  │              │                  │──user.save()─────────────▶            │              │
  │              │                  │──Transaction.create()──────────────────▶             │
  │              │                  │──Order.create()──────────────────────────────────────▶
  │              │◀──{message:"Success"}──│         │          │            │              │
  │◀────Updated UI────│             │               │          │            │              │
```

### 5.5 Real-Time Price Updates (Socket.IO)

```
System Timer    FinnhubMarketService    Finnhub API     Stock DB     Socket.IO     All Clients
     │                  │                    │              │            │              │
     │──interval tick──▶│                    │              │            │              │
     │                  │──checkRateLimit()──│              │            │              │
     │                  │──GET /quote?symbol=AAPL──────────▶│            │              │
     │                  │◀──{c:175.50, h:176, l:174,...}───│             │              │
     │                  │──GET /quote?symbol=GOOGL─────────▶│            │              │
     │                  │◀──{c:143.20, ...}────────────────│             │              │
     │                  │  ... (for all symbols) ...       │             │              │
     │                  │──Stock.findOneAndUpdate(price)────────────────▶│              │
     │                  │──update priceCache (in-memory)───│             │              │
     │                  │──io.emit('priceUpdate', data)────────────────▶│              │
     │                  │                    │              │            │──broadcast──▶│
     │                  │                    │              │            │              │──update UI
```

### 5.6 Admin: View Dashboard Stats

```
Admin         Admin Panel (React)    Server(Admin Routes)    User DB    Transaction DB    Stock DB
  │                │                       │                    │            │               │
  │──View Dashboard▶                       │                    │            │               │
  │                │──GET /api/admin/stats──▶                   │            │               │
  │                │                       │──countDocuments()──▶            │               │
  │                │                       │◀──totalUsers────────│           │               │
  │                │                       │──countDocuments()──────────────▶│               │
  │                │                       │◀──totalTransactions─────────────│               │
  │                │                       │──aggregate(volume)─────────────▶│               │
  │                │                       │◀──totalVolume───────────────────│               │
  │                │                       │──aggregate(balance)─▶           │               │
  │                │                       │◀──totalBalance──────│           │               │
  │                │                       │──countDocuments()──────────────────────────────▶│
  │                │                       │◀──totalStocks────────────────────────────────────│
  │                │◀──{users,transactions,balance,stocks}──│   │            │               │
  │◀────Render Dashboard Cards────│        │                    │            │               │
```

### 5.7 Admin: Manage User (Activate/Deactivate/Delete)

```
Admin       Admin Panel       Server(Admin Routes)      User DB     Transaction DB
  │             │                     │                     │             │
  │──Deactivate User──▶               │                     │             │
  │             │──POST /admin/users/:id/deactivate──▶      │             │
  │             │                     │──findByIdAndUpdate(status:suspended)──▶
  │             │                     │◀──updated user──────│             │
  │             │◀──{message, user}───│                     │             │
  │◀──UI Update─│                     │                     │             │
  │             │                     │                     │             │
  │──Delete User──▶                   │                     │             │
  │             │──DELETE /admin/users/:id──▶                │             │
  │             │                     │──deleteMany(userId)─────────────▶│
  │             │                     │──findByIdAndDelete(id)──────────▶│
  │             │◀──{message}─────────│                     │             │
  │◀──UI Update─│                     │                     │             │
```

---

## 6. Summary: Complete API Endpoint Map

| Method | Endpoint | Auth | Actor | Description |
|---|---|---|---|---|
| POST | `/api/register` | None | Guest | Register new user |
| POST | `/api/verify-otp` | None | Guest | Verify email OTP |
| POST | `/api/login` | None | Guest | User login |
| GET | `/api/user/portfolio` | JWT | User | Get portfolio with live prices |
| POST | `/api/user/settings` | JWT | User | Update user preferences |
| POST | `/api/user/deposit` | JWT | User | Add funds |
| POST | `/api/user/withdraw` | JWT | User | Withdraw funds |
| GET | `/api/user/transactions` | JWT | User | Get transaction history |
| POST | `/api/trade` | JWT | User | Execute buy/sell trade |
| GET | `/api/stock/:symbol` | JWT | User | Get stock detail + live data |
| GET | `/api/stocks` | None | Any | List all stocks with prices |
| GET | `/api/stocks/search` | None | Any | Search stocks by query |
| GET | `/api/stocks/prices` | None | Any | Get all stock prices |
| GET | `/api/stats` | None | Any | Public platform statistics |
| GET | `/api/leaderboard` | None | Any | Top 10 traders by wealth |
| POST | `/api/admin/login` | None | Admin | Admin login |
| GET | `/api/admin/verify` | Admin JWT | Admin | Verify admin token |
| GET | `/api/admin/stats` | Admin JWT | Admin | Dashboard statistics |
| GET | `/api/admin/charts` | Admin JWT | Admin | Chart data (30d) |
| GET | `/api/admin/users` | Admin JWT | Admin | List all users (paginated) |
| GET | `/api/admin/users/:id` | Admin JWT | Admin | Single user details |
| POST | `/api/admin/users/:id/activate` | Admin JWT | Admin | Activate user |
| POST | `/api/admin/users/:id/deactivate` | Admin JWT | Admin | Suspend user |
| DELETE | `/api/admin/users/:id` | Admin JWT | Admin | Delete user & transactions |
| POST | `/api/admin/stock/update` | JWT (admin) | Admin | Update stock price |
| POST | `/api/admin/stock/delete` | JWT (admin) | Admin | Delete stock |
| POST | `/api/admin/stock/add` | JWT (admin) | Admin | Add new stock |
| POST | `/api/admin/refresh` | JWT (admin) | Admin | Refresh market data |
| GET | `/api/admin/analytics/*` | JWT (admin) | Admin | Analytics endpoints (6 total) |

---

## 7. Technology Stack Summary

| Layer | Technology |
|---|---|
| Frontend (User) | React + Vite, Socket.IO Client, Axios, Lightweight Charts, TradingView Widgets |
| Frontend (Admin) | React + Vite, Axios |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose ODM |
| Real-Time | Socket.IO (WebSocket) |
| Market Data | Finnhub REST API |
| Auth | JWT (JSON Web Tokens), bcrypt.js |
| Email | Nodemailer + SMTP |
| PDF | PDFKit (Invoice generation) |
