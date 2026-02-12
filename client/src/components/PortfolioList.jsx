import React from 'react';
import { formatCurrency } from '../utils/formatters';

export default function PortfolioList({ holdings, currency = 'USD' }) {
    return (
        <section className="card" style={{ height: '100%' }}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Your Portfolio</h2>

            {holdings.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>You have no holdings yet.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li className="flex justify-between" style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <span>Asset</span>
                        <span>Value</span>
                    </li>
                    {holdings.map(h => {
                        const current_price = parseFloat(h.current_price || 0);
                        const average_price = parseFloat(h.average_price || 0);
                        const quantity = parseFloat(h.quantity || 0);
                        const value = quantity * current_price;
                        const gainLoss = average_price > 0 ? ((current_price - average_price) / average_price * 100) : 0;

                        return (
                            <li key={h.symbol} className="flex justify-between items-center" style={{ padding: '0.8rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{h.symbol}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{quantity} Shares</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold' }}>{formatCurrency(value, currency)}</div>
                                    <div style={{ fontSize: '0.85rem', color: current_price >= average_price ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                        {gainLoss.toFixed(2)}%
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
