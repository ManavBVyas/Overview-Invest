import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import BackgroundTicker from '../components/BackgroundTicker';
import { formatCurrency } from '../utils/formatters';

export default function Portfolio() {
    const [user, setUser] = useState({ username: '', balance: 0, holdings: [], currency: 'INR' });
    const [stocks, setStocks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [socket, setSocket] = useState(null);
    const [activeTab, setActiveTab] = useState('holdings'); // holdings, transactions, performance
    const navigate = useNavigate();
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');

    const fetchUserData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;

            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [portfolioRes, txnRes] = await Promise.all([
                axios.get('http://localhost:5000/api/user/portfolio', config),
                axios.get('http://localhost:5000/api/user/transactions', config)
            ]);

            setUser(portfolioRes.data);
            setTransactions(txnRes.data);
        } catch (err) {
            console.error("Error fetching user data", err);
        }
    };

    useEffect(() => {
        if (!sessionStorage.getItem('token')) {
            navigate('/login');
            return;
        }

        fetchUserData();
        axios.get('http://localhost:5000/api/stocks').then(res => setStocks(res.data)).catch(err => console.error(err));

        const s = io('http://localhost:5000');
        setSocket(s);

        s.on('priceUpdate', (data) => {
            setStocks(prevStocks => {
                const stockMap = new Map(prevStocks.map(s => [s.symbol, s]));
                data.forEach(update => {
                    if (stockMap.has(update.symbol)) {
                        stockMap.set(update.symbol, { ...stockMap.get(update.symbol), ...update });
                    } else {
                        stockMap.set(update.symbol, update);
                    }
                });
                return Array.from(stockMap.values());
            });
        });

        return () => {
            s.disconnect();
            setSocket(null);
        };
    }, [navigate]);

    // Calculate portfolio metrics
    const calculatePortfolioMetrics = () => {
        let totalValue = 0;
        let totalInvested = 0;
        let totalGainLoss = 0;

        user.holdings.forEach(h => {
            const currentPrice = parseFloat(h.current_price || 0);
            const avgPrice = parseFloat(h.average_price || 0);
            const qty = parseFloat(h.quantity || 0);

            const currentValue = qty * currentPrice;
            const investedValue = qty * avgPrice;

            totalValue += currentValue;
            totalInvested += investedValue;
            totalGainLoss += (currentValue - investedValue);
        });

        const gainLossPercent = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested * 100) : 0;

        return { totalValue, totalInvested, totalGainLoss, gainLossPercent };
    };

    const metrics = calculatePortfolioMetrics();

    return (
        <div>
            <BackgroundTicker />

            {/* Header */}
            <header className="top-bar" style={{
                position: 'fixed', top: 0, width: '100%', zIndex: 100,
                padding: '1rem 3rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 500, letterSpacing: '0.5px' }}>Overview Invest</h1>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            padding: '0.6rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        ← Back to Dashboard
                    </button>

                    <div
                        onClick={() => navigate('/account')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            color: 'white',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.5rem 1.2rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.6rem', color: '#94a3b8' }}>account_circle</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: '1' }}>Account</span>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: '1.2' }}>{user.username || userData.username || userData.email?.split('@')?.[0] || 'Trader'}</span>
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        color: '#38bdf8',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '30px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                    }}>
                        Balance: {formatCurrency(user.balance, user.currency)}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="main-content" style={{ marginTop: '120px', paddingBottom: '100px', padding: '0 3rem 100px 3rem' }}>

                {/* Portfolio Overview Cards */}
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>My Portfolio</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem' }}>Track your investments and performance</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        {/* Total Portfolio Value */}
                        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(30, 41, 59, 0.8) 100%)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Value</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#38bdf8' }}>{formatCurrency(metrics.totalValue, user.currency)}</div>
                        </div>

                        {/* Total Invested */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Invested</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formatCurrency(metrics.totalInvested, user.currency)}</div>
                        </div>

                        {/* Total Gain/Loss */}
                        <div className="card" style={{ padding: '1.5rem', background: metrics.totalGainLoss >= 0 ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(30, 41, 59, 0.8) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(30, 41, 59, 0.8) 100%)', border: `1px solid ${metrics.totalGainLoss >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total P&L</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: metrics.totalGainLoss >= 0 ? '#22c55e' : '#ef4444' }}>
                                {metrics.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(metrics.totalGainLoss, user.currency)}
                            </div>
                        </div>

                        {/* Gain/Loss Percentage */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Returns</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: metrics.gainLossPercent >= 0 ? '#22c55e' : '#ef4444' }}>
                                {metrics.gainLossPercent >= 0 ? '+' : ''}{metrics.gainLossPercent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        {['holdings', 'transactions', 'performance'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: activeTab === tab ? '#38bdf8' : '#94a3b8',
                                    padding: '1rem 0',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === tab ? '2px solid #38bdf8' : '2px solid transparent',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'holdings' && (
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Current Holdings</h2>

                        {user.holdings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>inventory_2</span>
                                <p style={{ fontSize: '1.2rem' }}>No holdings yet</p>
                                <p style={{ fontSize: '0.9rem' }}>Start trading to build your portfolio</p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="btn primary"
                                    style={{ marginTop: '1rem' }}
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Symbol</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Quantity</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Price</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Price</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Invested</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Value</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>P&L</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Returns</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {user.holdings.map(h => {
                                            const currentPrice = parseFloat(h.current_price || 0);
                                            const avgPrice = parseFloat(h.average_price || 0);
                                            const qty = parseFloat(h.quantity || 0);
                                            const invested = qty * avgPrice;
                                            const currentValue = qty * currentPrice;
                                            const gainLoss = currentValue - invested;
                                            const gainLossPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice * 100) : 0;

                                            return (
                                                <tr
                                                    key={h.symbol}
                                                    style={{
                                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s ease'
                                                    }}
                                                    onClick={() => navigate(`/stock/${h.symbol}`)}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <td style={{ padding: '1.2rem 1rem' }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{h.symbol}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{h.name || 'Stock'}</div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontWeight: '500' }}>{qty.toFixed(2)}</td>
                                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>{formatCurrency(avgPrice, user.currency)}</td>
                                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(currentPrice, user.currency)}</td>
                                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>{formatCurrency(invested, user.currency)}</td>
                                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(currentValue, user.currency)}</td>
                                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontWeight: '600', color: gainLoss >= 0 ? '#22c55e' : '#ef4444' }}>
                                                        {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss, user.currency)}
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontWeight: '600', color: gainLossPercent >= 0 ? '#22c55e' : '#ef4444' }}>
                                                        {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Transaction History</h2>

                        {transactions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>receipt_long</span>
                                <p style={{ fontSize: '1.2rem' }}>No transactions yet</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Type</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Symbol</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Quantity</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Price</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.slice().reverse().map((txn, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <td style={{ padding: '1.2rem 1rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                                                    {new Date(txn.timestamp).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem' }}>
                                                    <span style={{
                                                        padding: '0.3rem 0.8rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        background: txn.type === 'buy' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: txn.type === 'buy' ? '#22c55e' : '#ef4444',
                                                        border: `1px solid ${txn.type === 'buy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                                    }}>
                                                        {txn.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem', fontWeight: '600' }}>{txn.symbol}</td>
                                                <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>{txn.quantity}</td>
                                                <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>{formatCurrency(txn.price, user.currency)}</td>
                                                <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(txn.total, user.currency)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Performance Summary</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                            {/* Best Performer */}
                            <div style={{ padding: '1.5rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>🏆 Best Performer</div>
                                {user.holdings.length > 0 ? (() => {
                                    const best = user.holdings.reduce((max, h) => {
                                        const gainPercent = h.average_price > 0 ? ((h.current_price - h.average_price) / h.average_price * 100) : 0;
                                        const maxGainPercent = max.average_price > 0 ? ((max.current_price - max.average_price) / max.average_price * 100) : 0;
                                        return gainPercent > maxGainPercent ? h : max;
                                    });
                                    const gainPercent = best.average_price > 0 ? ((best.current_price - best.average_price) / best.average_price * 100) : 0;
                                    return (
                                        <>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{best.symbol}</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>+{gainPercent.toFixed(2)}%</div>
                                        </>
                                    );
                                })() : <p style={{ color: '#94a3b8' }}>No data</p>}
                            </div>

                            {/* Worst Performer */}
                            <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>📉 Worst Performer</div>
                                {user.holdings.length > 0 ? (() => {
                                    const worst = user.holdings.reduce((min, h) => {
                                        const gainPercent = h.average_price > 0 ? ((h.current_price - h.average_price) / h.average_price * 100) : 0;
                                        const minGainPercent = min.average_price > 0 ? ((min.current_price - min.average_price) / min.average_price * 100) : 0;
                                        return gainPercent < minGainPercent ? h : min;
                                    });
                                    const gainPercent = worst.average_price > 0 ? ((worst.current_price - worst.average_price) / worst.average_price * 100) : 0;
                                    return (
                                        <>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{worst.symbol}</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{gainPercent.toFixed(2)}%</div>
                                        </>
                                    );
                                })() : <p style={{ color: '#94a3b8' }}>No data</p>}
                            </div>

                            {/* Total Trades */}
                            <div style={{ padding: '1.5rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>📊 Total Trades</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#38bdf8' }}>{transactions.length}</div>
                            </div>

                            {/* Holdings Count */}
                            <div style={{ padding: '1.5rem', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>💼 Active Holdings</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#a855f7' }}>{user.holdings.length}</div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
