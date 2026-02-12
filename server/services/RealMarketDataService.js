/**
 * Real Market Data Service
 * Fetches live stock prices from Yahoo Finance
 * and broadcasts updates via Socket.IO
 */

const yahooFinance = require('yahoo-finance2').default;

class RealMarketDataService {
    constructor(io, Stock) {
        this.io = io;
        this.Stock = Stock;
        this.updateInterval = null;
        this.symbols = [];
    }

    async initialize() {
        try {
            // Get all stock symbols from database
            const stocks = await this.Stock.find({}, 'symbol');
            this.symbols = stocks.map(s => s.symbol);
            console.log(`📈 Real Market Data Service initialized with ${this.symbols.length} symbols`);

            // Initial fetch
            await this.fetchAndBroadcast();

            // Update every 30 seconds (to avoid rate limiting)
            this.updateInterval = setInterval(() => {
                this.fetchAndBroadcast();
            }, 30000);

        } catch (error) {
            console.error('❌ Failed to initialize Real Market Data Service:', error);
        }
    }

    async fetchAndBroadcast() {
        try {
            const priceUpdates = [];

            // Fetch quotes for all symbols
            for (const symbol of this.symbols) {
                try {
                    const quote = await yahooFinance.quote(symbol);

                    if (quote && quote.regularMarketPrice) {
                        const update = {
                            symbol: symbol,
                            price: quote.regularMarketPrice,
                            change: quote.regularMarketChange || 0,
                            changePercent: quote.regularMarketChangePercent || 0,
                            high: quote.regularMarketDayHigh || quote.regularMarketPrice,
                            low: quote.regularMarketDayLow || quote.regularMarketPrice,
                            volume: quote.regularMarketVolume || 0,
                            marketState: quote.marketState || 'REGULAR',
                            lastUpdated: new Date()
                        };

                        priceUpdates.push(update);

                        // Update database
                        await this.Stock.findOneAndUpdate(
                            { symbol: symbol },
                            {
                                price: update.price,
                                last_updated: update.lastUpdated,
                                market_state: update.marketState
                            }
                        );
                    }
                } catch (err) {
                    // Skip symbols that fail (might be delisted or invalid)
                    console.log(`   ⚠️ Could not fetch ${symbol}`);
                }
            }

            // Broadcast to all connected clients
            if (priceUpdates.length > 0) {
                this.io.emit('priceUpdate', priceUpdates);
                console.log(`📊 Broadcasted ${priceUpdates.length} price updates`);
            }

        } catch (error) {
            console.error('❌ Error fetching market data:', error.message);
        }
    }

    async getQuote(symbol) {
        try {
            const quote = await yahooFinance.quote(symbol);
            return {
                symbol: symbol,
                price: quote.regularMarketPrice,
                change: quote.regularMarketChange,
                changePercent: quote.regularMarketChangePercent,
                high: quote.regularMarketDayHigh,
                low: quote.regularMarketDayLow,
                open: quote.regularMarketOpen,
                previousClose: quote.regularMarketPreviousClose,
                volume: quote.regularMarketVolume,
                marketCap: quote.marketCap,
                name: quote.shortName || quote.longName
            };
        } catch (error) {
            console.error(`Error fetching quote for ${symbol}:`, error);
            return null;
        }
    }

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            console.log('📈 Real Market Data Service stopped');
        }
    }
}

module.exports = RealMarketDataService;
