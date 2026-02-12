import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

// Simplified helper for demo range
const getRangePercent = (current, min, max) => {
    if (min === max) return 50;
    let p = ((current - min) / (max - min)) * 100;
    if (p < 0) p = 0;
    if (p > 100) p = 100;
    return p;
};

// Updated time formatter
const getUpdatedTime = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return `Updated ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

export default function MarketTable({ stocks, onTrade, currency = 'USD' }) {
    const [filter, setFilter] = useState('All');
    const [gliderStyle, setGliderStyle] = useState({});
    const tabsRef = React.useRef(null);

    React.useEffect(() => {
        const updateGlider = () => {
            if (tabsRef.current) {
                const activeInput = tabsRef.current.querySelector(`input[id="filter-${filter}"]`);
                if (activeInput) {
                    const label = activeInput.nextElementSibling;
                    if (label) {
                        setGliderStyle({
                            width: `${label.offsetWidth}px`,
                            left: `${label.offsetLeft}px`
                        });
                    }
                }
            }
        };

        updateGlider();
        window.addEventListener('resize', updateGlider);
        return () => window.removeEventListener('resize', updateGlider);
    }, [filter]);

    return (
        <section className="card" style={{ gridColumn: '1 / -1', minHeight: '600px' }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '1px', fontWeight: 600 }}>MARKETS</span>
                    <h2 style={{ fontSize: '1.8rem', margin: '0.2rem 0', fontWeight: 600 }}>All Instruments</h2>
                </div>
                <div className="glass-radio-group" ref={tabsRef}>
                    {['All', 'Crypto', 'Automobile', 'Food', 'Game', 'Government Company'].map((f) => (
                        <React.Fragment key={f}>
                            <input
                                type="radio"
                                name="sector_filter"
                                id={`filter-${f}`}
                                checked={filter === f}
                                onChange={() => setFilter(f)}
                            />
                            <label htmlFor={`filter-${f}`}>{f}</label>
                        </React.Fragment>
                    ))}
                    <div
                        className="glass-glider"
                        style={gliderStyle}
                    ></div>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1rem', minWidth: '900px' }}>
                    <thead>
                        <tr style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            <th style={{ padding: '0 1rem', textAlign: 'left' }}>INSTRUMENT</th>
                            <th style={{ padding: '0 1rem', textAlign: 'left' }}>MARKET PRICE</th>
                            <th style={{ padding: '0 1rem', textAlign: 'left' }}>CHANGE</th>
                            <th style={{ padding: '0 1rem', textAlign: 'left', width: '20%' }}>DAY RANGE</th>
                            <th style={{ padding: '0 1rem', textAlign: 'left', width: '20%' }}>52W RANGE</th>
                            <th style={{ padding: '0 1rem', textAlign: 'right' }}>VOLUME</th>
                            <th style={{ padding: '0 1rem', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.filter(s => filter === 'All' || s.sector === filter).map(stock => {
                            const price = parseFloat(stock.price || 0);

                            // Calculate change based on current price vs 24h ago min (as approximate)
                            const dayLow = parseFloat(stock.day_low || price * 0.98);
                            const dayHigh = parseFloat(stock.day_high || price * 1.02);

                            const change = ((price - dayLow) / dayLow) * 100;
                            const isPositive = change >= 0;

                            const dayProgress = getRangePercent(price, dayLow, dayHigh);

                            const yearLow = dayLow * 0.8; // Still approximate
                            const yearHigh = dayHigh * 1.4; // Still approximate
                            const yearProgress = getRangePercent(price, yearLow, yearHigh);

                            const volume = stock.history_points * 1000 + Math.floor(Math.random() * 1000);

                            return (
                                <tr key={stock.symbol} style={{}}>
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex" style={{ flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'white' }}>{stock.symbol}</span>
                                            <span style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>{stock.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex" style={{ flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'white' }}>{formatCurrency(price, currency)}</span>
                                            <span style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>{getUpdatedTime(stock.last_updated)}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            color: isPositive ? '#4ade80' : '#f87171',
                                            fontWeight: 'bold',
                                            fontSize: '0.95rem'
                                        }}>
                                            {isPositive ? '+' : ''}{change.toFixed(2)}%
                                        </span>
                                    </td>
                                    {/* Day Range */}
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex justify-between" style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '6px' }}>
                                            <span>{formatCurrency(dayLow, currency)}</span>
                                            <span>{formatCurrency(dayHigh, currency)}</span>
                                        </div>
                                        <div style={{ height: '4px', background: '#334155', borderRadius: '2px', position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute',
                                                left: `${dayProgress}%`,
                                                top: '-4px',
                                                width: '12px',
                                                height: '12px',
                                                background: '#3b82f6',
                                                borderRadius: '50%',
                                                boxShadow: '0 0 0 2px rgba(15,23,42,1)'
                                            }} />
                                        </div>
                                    </td>
                                    {/* 52W Range */}
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex justify-between" style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '6px' }}>
                                            <span>{formatCurrency(yearLow, currency)}</span>
                                            <span>{formatCurrency(yearHigh, currency)}</span>
                                        </div>
                                        <div style={{ height: '4px', background: '#334155', borderRadius: '2px', position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute',
                                                left: `${yearProgress}%`,
                                                top: '-4px',
                                                width: '12px',
                                                height: '12px',
                                                background: '#3b82f6',
                                                borderRadius: '50%',
                                                boxShadow: '0 0 0 2px rgba(15,23,42,1)'
                                            }} />
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', color: '#e2e8f0' }}>
                                        {volume.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            className="btn outline"
                                            style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', width: '100%' }}
                                            onClick={() => window.location.href = `/stock/${stock.symbol}`}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section >
    );
}
