import React from 'react';
// Using Material Symbols instead of lucide-react

const StockTicker = ({ stocks }) => {
    // Duplicate stocks to create seamless loop
    const displayStocks = stocks ? [...stocks, ...stocks] : [];

    return (
        <div className="ticker-wrap">
            <div className="ticker">
                {displayStocks.map((stock, index) => (
                    <div key={`${stock.symbol}-${index}`} className="ticker-item">
                        <span style={{ color: 'white', marginRight: '0.5rem' }}>{stock.symbol}</span>
                        <span className="text-green">${stock.price.toFixed(2)}</span>
                        {/* Adding random indicator for visual flair */}
                        {index % 2 === 0 ?
                            <span className="material-symbols-outlined" style={{ color: '#4ade80', fontSize: '14px', marginLeft: '4px' }}>trending_up</span> :
                            <span className="material-symbols-outlined" style={{ color: '#f87171', fontSize: '14px', marginLeft: '4px' }}>trending_down</span>
                        }
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockTicker;
