import React, { useEffect, useRef, memo } from 'react';

/**
 * TradingView Advanced Real-Time Chart Widget
 * Displays live market data from TradingView
 * 
 * @param {string} symbol - The stock/crypto symbol (e.g., "AAPL", "BTCUSD")
 * @param {string} exchange - The exchange prefix (e.g., "NASDAQ", "BINANCE")
 * @param {string} theme - "dark" or "light"
 * @param {number} height - Chart height in pixels
 * @param {boolean} allowSymbolChange - Allow user to change symbol
 */
function TradingViewChart({
    symbol = "AAPL",
    exchange = "NASDAQ",
    theme = "dark",
    height = 500,
    allowSymbolChange = true,
    interval = "D",
    style = "1", // 1 = Candles, 2 = Line, 3 = Area, etc.
}) {
    const containerRef = useRef(null);
    const widgetRef = useRef(null);

    // Map common symbols to TradingView format
    const getTradingViewSymbol = (sym, exch) => {
        // Handle Indian stocks with .NS suffix (NSE - National Stock Exchange)
        if (sym.endsWith('.NS')) {
            const baseSymbol = sym.replace('.NS', '');
            return `NSE:${baseSymbol}`;
        }

        // Handle Indian stocks with .BO suffix (BSE - Bombay Stock Exchange)
        if (sym.endsWith('.BO')) {
            const baseSymbol = sym.replace('.BO', '');
            return `BSE:${baseSymbol}`;
        }

        const cryptoSymbols = {
            'BTC': 'BINANCE:BTCUSDT',
            'ETH': 'BINANCE:ETHUSDT',
            'XRP': 'BINANCE:XRPUSDT',
            'SOL': 'BINANCE:SOLUSDT',
            'ADA': 'BINANCE:ADAUSDT',
            'BNB': 'BINANCE:BNBUSDT',
            'DOGE': 'BINANCE:DOGEUSDT',
        };

        const stockSymbols = {
            // US Stocks
            'AAPL': 'NASDAQ:AAPL',
            'GOOGL': 'NASDAQ:GOOGL',
            'MSFT': 'NASDAQ:MSFT',
            'TSLA': 'NASDAQ:TSLA',
            'AMZN': 'NASDAQ:AMZN',
            'META': 'NASDAQ:META',
            'NVDA': 'NASDAQ:NVDA',
            'NFLX': 'NASDAQ:NFLX',
            'AMD': 'NASDAQ:AMD',
            'INTC': 'NASDAQ:INTC',
            'JPM': 'NYSE:JPM',
            'BAC': 'NYSE:BAC',
            'WMT': 'NYSE:WMT',
            'DIS': 'NYSE:DIS',
            'NKE': 'NYSE:NKE',
            'BA': 'NYSE:BA',
            'GS': 'NYSE:GS',
            // Indian stocks (without .NS suffix)
            'TCS': 'NSE:TCS',
            'RELIANCE': 'NSE:RELIANCE',
            'INFY': 'NSE:INFY',
            'HDFCBANK': 'NSE:HDFCBANK',
            'TATAMOTORS': 'NSE:TATAMOTORS',
            'ICICIBANK': 'NSE:ICICIBANK',
            'SBIN': 'NSE:SBIN',
            'WIPRO': 'NSE:WIPRO',
            'HCLTECH': 'NSE:HCLTECH',
            'TECHM': 'NSE:TECHM',
        };

        // Check if it's a known crypto symbol
        if (cryptoSymbols[sym]) return cryptoSymbols[sym];

        // Check if it's a known stock symbol
        if (stockSymbols[sym]) return stockSymbols[sym];

        // Default: try to construct from exchange and symbol
        if (exch) return `${exch}:${sym}`;

        // Fallback to just the symbol
        return sym;
    };

    useEffect(() => {
        // Clean up previous widget
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        const tradingViewSymbol = getTradingViewSymbol(symbol, exchange);

        // Create the script element
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": tradingViewSymbol,
            "interval": interval,
            "timezone": "Etc/UTC",
            "theme": theme,
            "style": style,
            "locale": "en",
            "allow_symbol_change": allowSymbolChange,
            "calendar": false,
            "support_host": "https://www.tradingview.com",
            "hide_top_toolbar": false,
            "hide_legend": false,
            "save_image": true,
            "hide_volume": false,
            "backgroundColor": theme === "dark" ? "rgba(19, 23, 34, 1)" : "rgba(255, 255, 255, 1)",
            "gridColor": theme === "dark" ? "rgba(42, 46, 57, 0.6)" : "rgba(240, 243, 250, 1)",
            "studies": [
                "Volume@tv-basicstudies"
            ],
            "show_popup_button": true,
            "popup_width": "1000",
            "popup_height": "650"
        });

        // Create wrapper div that TradingView expects
        const wrapper = document.createElement('div');
        wrapper.className = 'tradingview-widget-container__widget';
        wrapper.style.height = 'calc(100% - 10px)';
        wrapper.style.minHeight = `${height}px`;
        wrapper.style.width = '100%';

        if (containerRef.current) {
            containerRef.current.appendChild(wrapper);
            containerRef.current.appendChild(script);
        }

        widgetRef.current = { wrapper, script };

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [symbol, exchange, theme, height, allowSymbolChange, interval, style]);

    return (
        <div
            className="tradingview-widget-container"
            ref={containerRef}
            style={{
                height: '100%',
                minHeight: `${height}px`,
                width: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}></div>
        </div>
    );
}

export default memo(TradingViewChart);
