import React, { useEffect, useRef, memo } from 'react';

/**
 * TradingView Market Overview Widget
 * Shows a comprehensive market overview with multiple tabs
 */
function TradingViewMarketOverview({
    theme = "dark",
    height = 450,
    width = "100%",
    showFloatingTooltip = true,
    isTransparent = true,
    tabs = null // Custom tabs or null for default
}) {
    const containerRef = useRef(null);

    // Default tabs if none provided
    const defaultTabs = [
        {
            "title": "Indices",
            "symbols": [
                { "s": "FOREXCOM:SPXUSD", "d": "S&P 500" },
                { "s": "FOREXCOM:NSXUSD", "d": "Nasdaq 100" },
                { "s": "FOREXCOM:DJI", "d": "Dow 30" },
                { "s": "INDEX:NKY", "d": "Nikkei 225" },
                { "s": "INDEX:DEU40", "d": "DAX Index" },
                { "s": "FOREXCOM:UKXGBP", "d": "FTSE 100" }
            ],
            "originalTitle": "Indices"
        },
        {
            "title": "Crypto",
            "symbols": [
                { "s": "BINANCE:BTCUSDT", "d": "Bitcoin" },
                { "s": "BINANCE:ETHUSDT", "d": "Ethereum" },
                { "s": "BINANCE:SOLUSDT", "d": "Solana" },
                { "s": "BINANCE:BNBUSDT", "d": "BNB" },
                { "s": "BINANCE:XRPUSDT", "d": "XRP" },
                { "s": "BINANCE:ADAUSDT", "d": "Cardano" }
            ],
            "originalTitle": "Crypto"
        },
        {
            "title": "Stocks",
            "symbols": [
                { "s": "NASDAQ:AAPL", "d": "Apple" },
                { "s": "NASDAQ:GOOGL", "d": "Google" },
                { "s": "NASDAQ:MSFT", "d": "Microsoft" },
                { "s": "NASDAQ:TSLA", "d": "Tesla" },
                { "s": "NASDAQ:NVDA", "d": "Nvidia" },
                { "s": "NASDAQ:AMZN", "d": "Amazon" }
            ],
            "originalTitle": "Stocks"
        },
        {
            "title": "Forex",
            "symbols": [
                { "s": "FX:EURUSD", "d": "EUR/USD" },
                { "s": "FX:GBPUSD", "d": "GBP/USD" },
                { "s": "FX:USDJPY", "d": "USD/JPY" },
                { "s": "FX:USDCHF", "d": "USD/CHF" },
                { "s": "FX:AUDUSD", "d": "AUD/USD" },
                { "s": "FX:USDCAD", "d": "USD/CAD" }
            ],
            "originalTitle": "Forex"
        }
    ];

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "colorTheme": theme,
            "dateRange": "12M",
            "showChart": true,
            "locale": "en",
            "width": width,
            "height": height,
            "largeChartUrl": "",
            "isTransparent": isTransparent,
            "showSymbolLogo": true,
            "showFloatingTooltip": showFloatingTooltip,
            "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
            "plotLineColorFalling": "rgba(255, 64, 64, 1)",
            "gridLineColor": "rgba(42, 46, 57, 0)",
            "scaleFontColor": "rgba(209, 212, 220, 1)",
            "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
            "belowLineFillColorFalling": "rgba(255, 64, 64, 0.12)",
            "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
            "belowLineFillColorFallingBottom": "rgba(255, 64, 64, 0)",
            "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
            "tabs": tabs || defaultTabs
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
    }, [theme, height, width, showFloatingTooltip, isTransparent, tabs]);

    return (
        <div
            className="tradingview-widget-container"
            ref={containerRef}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: `${height}px`,
                borderRadius: '12px',
                overflow: 'hidden'
            }}
        />
    );
}

export default memo(TradingViewMarketOverview);
