/**
 * Finnhub Real-Time Market Data Service
 * Uses Finnhub REST API for live stock quotes
 * Broadcasts price updates via Socket.IO
 * 
 * Free tier: 60 calls/minute
 */

const axios = require('axios');

class FinnhubMarketService {
    constructor(io, Stock) {
        this.io = io;
        this.Stock = Stock;
        this.apiKey = process.env.FINNHUB_API_KEY;
        this.baseUrl = 'https://finnhub.io/api/v1';
        this.symbols = [];
        this.priceCache = new Map();
        this.updateInterval = null;
        this.isRunning = false;
        this.requestCount = 0;
        this.lastResetTime = Date.now();
    }

    async initialize() {
        if (!this.apiKey) {
            throw new Error('FINNHUB_API_KEY not set in environment variables');
        }

        try {
            // Get all stock symbols from database
            const stocks = await this.Stock.find({}, 'symbol name sector');
            this.symbols = stocks.map(s => ({
                symbol: s.symbol,
                name: s.name,
                sector: s.sector
            }));

            console.log(`\n╔══════════════════════════════════════════════════════════╗`);
            console.log(`║   📈 Finnhub Real-Time Market Service                    ║`);
            console.log(`╠══════════════════════════════════════════════════════════╣`);
            console.log(`║   API Key: ${(this.apiKey.substring(0, 8) + '...').padEnd(45)}║`);
            console.log(`║   Symbols: ${this.symbols.length.toString().padEnd(45)}║`);
            console.log(`║   Update Interval: 15 seconds                            ║`);
            console.log(`╚══════════════════════════════════════════════════════════╝\n`);

            // Initial fetch
            await this.fetchAllQuotes();

            // Set up periodic updates (every 15 seconds)
            this.isRunning = true;
            this.updateInterval = setInterval(() => {
                this.fetchAllQuotes();
            }, 15000);

            console.log('✅ Finnhub market data service started\n');

        } catch (error) {
            console.error('❌ Failed to initialize Finnhub Market Service:', error.message);
            throw error;
        }
    }

    /**
     * Rate limit check - Finnhub allows 60 calls/minute on free tier
     */
    checkRateLimit() {
        const now = Date.now();
        // Reset counter every minute
        if (now - this.lastResetTime > 60000) {
            this.requestCount = 0;
            this.lastResetTime = now;
        }
        return this.requestCount < 55; // Leave some buffer
    }

    /**
     * Fetch quote for a single symbol from Finnhub
     */
    async fetchQuote(symbol) {
        if (!this.checkRateLimit()) {
            return null; // Skip if rate limited
        }

        try {
            this.requestCount++;
            const response = await axios.get(`${this.baseUrl}/quote`, {
                params: {
                    symbol: symbol,
                    token: this.apiKey
                },
                timeout: 5000
            });

            const data = response.data;

            // Finnhub returns: c=current, d=change, dp=percent change, h=high, l=low, o=open, pc=previous close, t=timestamp
            if (data && data.c && data.c > 0) {
                return {
                    symbol: symbol,
                    price: data.c,
                    change: data.d || 0,
                    changePercent: data.dp || 0,
                    high: data.h || data.c,
                    low: data.l || data.c,
                    open: data.o || data.c,
                    previousClose: data.pc || data.c,
                    lastUpdated: new Date(),
                    source: 'Finnhub'
                };
            }

            return null;
        } catch (error) {
            if (error.response?.status === 429) {
                console.log('   ⚠️ Finnhub rate limit reached, waiting...');
                this.requestCount = 60; // Force wait
            }
            return null;
        }
    }

    /**
     * Fetch quotes for all symbols and broadcast updates
     */
    async fetchAllQuotes() {
        const priceUpdates = [];
        let successCount = 0;
        let failCount = 0;

        // Process symbols with small delays to stay under rate limit
        for (const symbolInfo of this.symbols) {
            try {
                const quote = await this.fetchQuote(symbolInfo.symbol);

                if (quote) {
                    // Check if price actually changed
                    const cached = this.priceCache.get(symbolInfo.symbol);
                    if (!cached || cached.price !== quote.price) {
                        priceUpdates.push(quote);
                    }

                    this.priceCache.set(symbolInfo.symbol, quote);

                    // Update database
                    await this.Stock.findOneAndUpdate(
                        { symbol: symbolInfo.symbol },
                        {
                            price: quote.price,
                            last_updated: quote.lastUpdated,
                            market_state: 'REGULAR'
                        }
                    );

                    successCount++;
                } else {
                    failCount++;
                }

                // Small delay between requests (100ms)
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (err) {
                failCount++;
            }
        }

        // Broadcast all updated prices to connected clients
        if (priceUpdates.length > 0) {
            this.io.emit('priceUpdate', priceUpdates);
        }

        // Log update summary
        const timestamp = new Date().toLocaleTimeString();
        if (priceUpdates.length > 0) {
            console.log(`📊 [${timestamp}] Updated ${successCount}/${this.symbols.length} stocks, ${priceUpdates.length} price changes broadcasted`);
        }

        // Log significant movers
        priceUpdates.forEach(update => {
            if (Math.abs(update.changePercent) > 2) {
                const arrow = update.change >= 0 ? '📈' : '📉';
                console.log(`   ${arrow} ${update.symbol}: $${update.price.toFixed(2)} (${update.changePercent > 0 ? '+' : ''}${update.changePercent.toFixed(2)}%)`);
            }
        });
    }

    /**
     * Get current quote for a symbol (from cache)
     */
    getQuote(symbol) {
        return this.priceCache.get(symbol) || null;
    }

    /**
     * Get all cached prices
     */
    getAllPrices() {
        return Array.from(this.priceCache.values());
    }

    /**
     * Stop the service
     */
    /**
     * Reload symbols from database (call after seeding)
     */
    async reloadSymbols() {
        const stocks = await this.Stock.find({}, 'symbol name sector');
        this.symbols = stocks.map(s => ({
            symbol: s.symbol,
            name: s.name,
            sector: s.sector
        }));
        console.log(`🔄 Reloaded ${this.symbols.length} symbols from database`);

        // Trigger an immediate fetch with the new symbols
        if (this.symbols.length > 0) {
            await this.fetchAllQuotes();
        }
    }

    stop() {
        console.log('\n⏹️  Stopping Finnhub Market Service...');
        this.isRunning = false;

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        console.log('✅ Finnhub Market Service stopped');
    }
}

module.exports = FinnhubMarketService;
