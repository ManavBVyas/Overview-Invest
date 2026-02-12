import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

export default function TradeForm({ stocks, onTradeSubmit, currency = 'USD' }) {
    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [type, setType] = useState('BUY');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedSymbol) return;
        onTradeSubmit({ symbol: selectedSymbol, quantity: parseInt(quantity), type });
    };

    return (
        <section className="card" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid var(--glass-border)', height: '100%' }}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.4rem' }}>Trade Stocks</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: '#e2e8f0', fontWeight: 500 }}>
                        Stock
                    </label>
                    <select
                        value={selectedSymbol}
                        onChange={(e) => setSelectedSymbol(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            background: 'rgba(0,0,0,0.4)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            fontSize: '1rem'
                        }}
                    >
                        <option value="">Select stock</option>
                        {stocks.map(s => (
                            <option key={s.symbol} value={s.symbol}>
                                {s.symbol} - {s.name} ({formatCurrency(s.price, currency)})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: '#e2e8f0', fontWeight: 500 }}>
                        Quantity
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div className="flex gap-4" style={{ marginBottom: '1rem' }}>
                    <button
                        type="button"
                        className={`btn`}
                        style={{
                            flex: 1,
                            background: type === 'BUY' ? 'var(--accent-green)' : 'rgba(0,0,0,0.4)',
                            color: type === 'BUY' ? 'black' : 'white',
                            border: type === 'BUY' ? 'none' : '1px solid transparent',
                        }}
                        onClick={() => setType('BUY')}
                    >
                        Buy
                    </button>
                    <button
                        type="button"
                        className={`btn`}
                        style={{
                            flex: 1,
                            background: type === 'SELL' ? '#ef5350' : 'rgba(0,0,0,0.4)', // Using Red for Sell for better UX
                            color: 'white',
                            border: type === 'SELL' ? 'none' : '1px solid transparent',
                        }}
                        onClick={() => setType('SELL')}
                    >
                        Sell
                    </button>
                </div>

                <button type="submit" className="btn" style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'var(--accent-green)',
                    color: 'black',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRadius: '8px'
                }}>
                    Confirm {type}
                </button>
            </form>
        </section>
    );
}
