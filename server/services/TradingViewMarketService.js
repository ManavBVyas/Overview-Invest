/**
 * TradingView Real-Time Market Data Service
 * Uses @mathieuc/tradingview for live WebSocket market data
 * Provides instant price updates from TradingView
 */

const TradingView = require('@mathieuc/tradingview');

class TradingViewMarketService {
    constructor(io, Stock) {
        this.io = io;
        this.Stock = Stock;
        this.client = null;
        this.charts = new Map(); // symbol -> chart session
        this.symbols = [];
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.priceCache = new Map(); // Cache latest prices
    }

    /**
     * Convert database symbols (NSE) to TradingView format
     * NSE:RELIANCE for Indian stocks
     */
    convertToTradingViewSymbol(symbol) {
        // Remove .NS suffix and add NSE: prefix
        if (symbol.endsWith('.NS')) {
            const baseSymbol = symbol.replace('.NS', '');
            return `NSE:${baseSymbol}`;
        }
        // Remove .BO suffix and add BSE: prefix
        if (symbol.endsWith('.BO')) {
            const baseSymbol = symbol.replace('.BO', '');
            return `BSE:${baseSymbol}`;
        }
        // Already in TradingView format
        if (symbol.includes(':')) {
            return symbol;
        }
        // Default to NSE
        return `NSE:${symbol}`;
    }

    /**
     * Convert TradingView symbol back to database format
     */
    convertFromTradingViewSymbol(tvSymbol) {
        if (tvSymbol.startsWith('NSE:')) {
            return tvSymbol.replace('NSE:', '') + '.NS';
        }
        if (tvSymbol.startsWith('BSE:')) {
            return tvSymbol.replace('BSE:', '') + '.BO';
        }
        return tvSymbol;
    }

    async initialize() {
        try {
            // Get all stock symbols from database
            const stocks = await this.Stock.find({}, 'symbol name');
            this.symbols = stocks.map(s => ({
                dbSymbol: s.symbol,
                tvSymbol: this.convertToTradingViewSymbol(s.symbol),
                name: s.name
            }));

            console.log(`\n╔══════════════════════════════════════════════════════════╗`);
            console.log(`║   📈 TradingView Real-Time Market Service                 ║`);
            console.log(`╠══════════════════════════════════════════════════════════╣`);
            console.log(`║   Symbols: ${this.symbols.length.toString().padEnd(45)}║`);
            console.log(`╚══════════════════════════════════════════════════════════╝\n`);

            await this.connect();

        } catch (error) {
            console.error('❌ Failed to initialize TradingView Market Service:', error);
            throw error;
        }
    }

    async connect() {
        try {
            console.log('🔌 Connecting to TradingView WebSocket...');

            // Create TradingView client
            this.client = new TradingView.Client();
            this.isConnected = true;
            this.reconnectAttempts = 0;

            console.log('✅ Connected to TradingView WebSocket');

            // Subscribe to all symbols
            await this.subscribeToSymbols();

        } catch (error) {
            console.error('❌ TradingView connection error:', error);
            this.handleReconnect();
        }
    }

    async subscribeToSymbols() {
        console.log('📊 Subscribing to real-time price feeds...\n');

        // Process symbols in batches to avoid overwhelming the connection
        const batchSize = 10;
        for (let i = 0; i < this.symbols.length; i += batchSize) {
            const batch = this.symbols.slice(i, i + batchSize);

            for (const symbolInfo of batch) {
                try {
                    await this.subscribeToSymbol(symbolInfo);
                } catch (err) {
                    console.log(`   ⚠️ Could not subscribe to ${symbolInfo.tvSymbol}: ${err.message}`);
                }
            }

            // Small delay between batches
            if (i + batchSize < this.symbols.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        console.log(`\n📡 Subscribed to ${this.charts.size} symbols for real-time updates`);
    }

    async subscribeToSymbol(symbolInfo) {
        const { dbSymbol, tvSymbol, name } = symbolInfo;

        try {
            const chart = new this.client.Session.Chart();

            // Set the market with daily timeframe for price data
            chart.setMarket(tvSymbol, {
                timeframe: '1', // 1 minute for most real-time updates
            });

            // Handle errors
            chart.onError((...err) => {
                console.log(`   ⚠️ Chart error for ${tvSymbol}:`, err[0]);
            });

            // When symbol is loaded
            chart.onSymbolLoaded(() => {
                console.log(`   ✓ ${tvSymbol} (${name || 'Unknown'})`);
            });

            // Real-time price updates
            chart.onUpdate(() => {
                this.handlePriceUpdate(chart, dbSymbol, tvSymbol);
            });

            this.charts.set(dbSymbol, chart);

        } catch (error) {
            throw error;
        }
    }

    async handlePriceUpdate(chart, dbSymbol, tvSymbol) {
        try {
            if (!chart.periods || !chart.periods[0]) return;

            const period = chart.periods[0];
            const info = chart.infos || {};

            const update = {
                symbol: dbSymbol,
                price: period.close,
                open: period.open,
                high: period.max || period.high,
                low: period.min || period.low,
                volume: period.volume || 0,
                change: period.close - (info.prev_close_price || period.open),
                changePercent: info.prev_close_price
                    ? ((period.close - info.prev_close_price) / info.prev_close_price * 100)
                    : 0,
                marketState: info.current_session === 'market' ? 'REGULAR' : 'CLOSED',
                currency: info.currency_id || 'INR',
                lastUpdated: new Date(),
                source: 'TradingView'
            };

            // Check if price actually changed
            const cachedPrice = this.priceCache.get(dbSymbol);
            if (cachedPrice && cachedPrice.price === update.price) {
                return; // Skip if no change
            }

            this.priceCache.set(dbSymbol, update);

            // Update database
            await this.Stock.findOneAndUpdate(
                { symbol: dbSymbol },
                {
                    price: update.price,
                    last_updated: update.lastUpdated,
                    market_state: update.marketState
                }
            );

            // Broadcast to connected clients
            this.io.emit('priceUpdate', [update]);

            // Log significant changes
            if (Math.abs(update.changePercent) > 0.5) {
                const arrow = update.change >= 0 ? '📈' : '📉';
                console.log(`${arrow} ${dbSymbol}: ₹${update.price.toFixed(2)} (${update.changePercent.toFixed(2)}%)`);
            }

        } catch (error) {
            console.error(`Error handling update for ${dbSymbol}:`, error.message);
        }
    }

    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached. Giving up.');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        console.log(`🔄 Reconnecting in ${delay / 1000}s... (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            this.cleanup();
            this.connect();
        }, delay);
    }

    /**
     * Get current quote for a symbol
     */
    async getQuote(symbol) {
        const cached = this.priceCache.get(symbol);
        if (cached) {
            return cached;
        }

        // Try to fetch from database if not in cache
        const stock = await this.Stock.findOne({ symbol });
        if (stock) {
            return {
                symbol: stock.symbol,
                price: stock.price,
                name: stock.name,
                sector: stock.sector,
                lastUpdated: stock.last_updated
            };
        }

        return null;
    }

    /**
     * Get all current prices
     */
    getAllPrices() {
        return Array.from(this.priceCache.values());
    }

    /**
     * Search for a symbol
     */
    async searchSymbol(query) {
        try {
            const results = await TradingView.searchMarketV3(query);
            return results.slice(0, 10).map(r => ({
                symbol: r.symbol,
                description: r.description,
                exchange: r.exchange,
                type: r.type
            }));
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    cleanup() {
        // Close all chart sessions
        for (const [symbol, chart] of this.charts) {
            try {
                chart.delete();
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        this.charts.clear();
    }

    stop() {
        console.log('\n⏹️  Stopping TradingView Market Service...');

        this.isConnected = false;
        this.cleanup();

        if (this.client) {
            try {
                this.client.end();
            } catch (e) {
                // Ignore errors on shutdown
            }
            this.client = null;
        }

        console.log('✅ TradingView Market Service stopped');
    }
}

module.exports = TradingViewMarketService;
