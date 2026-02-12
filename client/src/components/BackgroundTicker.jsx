import React from 'react';
import { formatCurrency } from '../utils/formatters';

const tickerRows = [
    // Each array is a row. Data repeated for scrolling effect.
    [
        { s: 'AAPL', p: '175.23', c: '+2.45%', up: true },
        { s: 'GOOGL', p: '142.56', c: '+1.23%', up: true },
        { s: 'MSFT', p: '378.91', c: '-0.87%', up: false },
        { s: 'TSLA', p: '248.67', c: '+3.12%', up: true },
        { s: 'AMZN', p: '145.32', c: '-1.45%', up: false },
        { s: 'META', p: '312.45', c: '+0.98%', up: true },
        { s: 'NVDA', p: '485.12', c: '+4.56%', up: true },
        { s: 'NFLX', p: '425.78', c: '-2.34%', up: false },
    ],
    [
        { s: 'BTC', p: '42567', c: '+5.23%', up: true },
        { s: 'ETH', p: '2456', c: '-1.87%', up: false },
        { s: 'JPM', p: '156.78', c: '+0.45%', up: true },
        { s: 'VISA', p: '245.89', c: '+1.12%', up: true },
        { s: 'JNJ', p: '162.34', c: '-0.23%', up: false },
        { s: 'WMT', p: '165.67', c: '+2.34%', up: true },
        { s: 'PG', p: '148.92', c: '-0.67%', up: false },
    ],
    [
        { s: 'DIS', p: '95.23', c: '+1.45%', up: true },
        { s: 'NKE', p: '108.67', c: '-2.12%', up: false },
        { s: 'BA', p: '215.34', c: '+3.45%', up: true },
        { s: 'XOM', p: '112.89', c: '-0.98%', up: false },
        { s: 'CVX', p: '152.45', c: '+1.67%', up: true },
    ],
    [
        { s: 'IBM', p: '145.67', c: '+0.78%', up: true },
        { s: 'ORCL', p: '125.34', c: '-1.12%', up: false },
        { s: 'CSCO', p: '52.89', c: '+2.34%', up: true },
        { s: 'INTC', p: '42.56', c: '-0.45%', up: false },
        { s: 'AMD', p: '128.91', c: '+3.67%', up: true },
    ],
    [
        { s: 'GS', p: '385.23', c: '+1.23%', up: true },
        { s: 'MS', p: '95.67', c: '-0.89%', up: false },
        { s: 'BAC', p: '34.12', c: '+0.56%', up: true },
        { s: 'C', p: '52.89', c: '-1.34%', up: false },
    ],
    [
        { s: 'PFE', p: '42.34', c: '-0.67%', up: false },
        { s: 'UNH', p: '525.67', c: '+1.89%', up: true },
        { s: 'ABBV', p: '152.23', c: '+0.45%', up: true },
        { s: 'TMO', p: '485.12', c: '-1.12%', up: false },
    ],
    [
        { s: 'XRP', p: '0.62', c: '+4.23%', up: true },
        { s: 'BNB', p: '315.89', c: '-2.12%', up: false },
        { s: 'SOL', p: '98.45', c: '+6.78%', up: true },
        { s: 'ADA', p: '0.48', c: '+1.45%', up: true },
    ]
];

export default function BackgroundTicker() {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const currency = userData.currency || 'USD';

    return (
        <div className="ticker-container">
            {tickerRows.map((row, i) => (
                <div key={i} className="ticker-row">
                    {/* Repeat content 3 times to ensure smooth looping for CSS animation */}
                    {[...row, ...row, ...row].map((item, j) => (
                        <div key={j} className="ticker-item">
                            {item.s} {formatCurrency(item.p, currency)}
                            <span className={item.up ? 'ticker-up' : 'ticker-down'} style={{ marginLeft: '5px' }}>
                                {item.c}
                            </span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
