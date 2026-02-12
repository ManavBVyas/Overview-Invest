import React, { useEffect, useRef, memo } from 'react';

/**
 * TradingView Mini Chart Widget
 * A smaller chart widget suitable for cards and overview sections
 */
function TradingViewMiniChart({
    symbol = "AAPL",
    width = "100%",
    height = 220,
    theme = "dark",
    dateRange = "12M", // 1D, 1M, 3M, 12M, 60M, ALL
    isTransparent = true,
    autosize = false,
    largeChartUrl = ""
}) {
    const containerRef = useRef(null);

    // Map common symbols to TradingView format
    const getTradingViewSymbol = (sym) => {
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
            'AAPL': 'NASDAQ:AAPL',
            'GOOGL': 'NASDAQ:GOOGL',
            'MSFT': 'NASDAQ:MSFT',
            'TSLA': 'NASDAQ:TSLA',
            'AMZN': 'NASDAQ:AMZN',
            'META': 'NASDAQ:META',
            'NVDA': 'NASDAQ:NVDA',
            'AMD': 'NASDAQ:AMD',
            'TCS': 'NSE:TCS',
            'RELIANCE': 'NSE:RELIANCE',
            'INFY': 'NSE:INFY',
        };

        if (cryptoSymbols[sym]) return cryptoSymbols[sym];
        if (stockSymbols[sym]) return stockSymbols[sym];
        return sym;
    };

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        const tradingViewSymbol = getTradingViewSymbol(symbol);

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbol": tradingViewSymbol,
            "width": autosize ? "100%" : width,
            "height": height,
            "locale": "en",
            "dateRange": dateRange,
            "colorTheme": theme,
            "isTransparent": isTransparent,
            "autosize": autosize,
            "largeChartUrl": largeChartUrl
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'tradingview-widget-container__widget';

        if (containerRef.current) {
            containerRef.current.appendChild(wrapper);
            containerRef.current.appendChild(script);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [symbol, width, height, theme, dateRange, isTransparent, autosize, largeChartUrl]);

    return (
        <div
            className="tradingview-widget-container"
            ref={containerRef}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: `${height}px`,
                overflow: 'hidden',
                borderRadius: '8px'
            }}
        />
    );
}

export default memo(TradingViewMiniChart);
