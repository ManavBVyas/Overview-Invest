import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import BackgroundTicker from '../components/BackgroundTicker';
import MarketTable from '../components/MarketTable';
import TradeForm from '../components/TradeForm';
import PortfolioList from '../components/PortfolioList';
import RankPanel from '../components/RankPanel';
import MarketStatusHUD from '../components/MarketStatusHUD';

import { formatCurrency } from '../utils/formatters';
import MoneyIcon from '../Money Icon.png';

export default function Dashboard() {
    const [stocks, setStocks] = useState([]);
    const [user, setUser] = useState({ username: '', balance: 0, holdings: [] });
    const [transactions, setTransactions] = useState([]);

    const [socket, setSocket] = useState(null);
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

        // Initial Fetch
        fetchUserData();

        // Fetch Initial Stocks
        axios.get('http://localhost:5000/api/stocks').then(res => setStocks(res.data)).catch(err => console.error(err));



        const s = io('http://localhost:5000');
        setSocket(s);

        s.on('connect', () => {
            console.log('Connected to market feed!');
        });

        s.on('priceUpdate', (data) => {
            console.log('New Price:', data);

            setStocks(prevStocks => {
                const stockMap = new Map(prevStocks.map(s => [s.symbol, s]));
                data.forEach(update => {
                    if (stockMap.has(update.symbol)) {
                        // Merge update containing price/change/etc into existing stock object
                        stockMap.set(update.symbol, { ...stockMap.get(update.symbol), ...update });
                    } else {
                        // If it's a new stock we somehow didn't have, add it
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

    const handleTrade = async (tradeData) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.post('http://localhost:5000/api/trade', tradeData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Trade execution successful!');
            fetchUserData(); // Refresh balance and holdings
        } catch (err) {
            alert(err.response?.data?.message || 'Trade failed');
        }
    };

    return (
        <div>
            <BackgroundTicker />

            {/* Header matching screenshot */}
            <header className="top-bar" style={{
                position: 'fixed', top: 0, width: '100%', zIndex: 100,
                padding: '1rem 3rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black
                backdropFilter: 'blur(12px)', // High-quality blur effect
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // Subtle bottom border
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' // Soft shadow for depth
            }}>
                <h1
                    style={{
                        fontSize: '1.8rem',
                        margin: 0,
                        fontWeight: 500,
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                    }}
                    onClick={() => navigate('/')}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                >
                    Overview Invest
                </h1>

                <div className="flex items-center gap-4">
                    <div
                        onClick={() => navigate('/account')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            color: 'white',
                            marginRight: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.5rem 1.2rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.2s ease',
                            backdropFilter: 'blur(4px)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.6rem', color: '#94a3b8' }}>account_circle</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: '1' }}>Account</span>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: '1.2' }}>{user.username || userData.username || userData.email?.split('@')?.[0] || 'Trader'}</span>
                        </div>
                    </div>

                    <button
                        className="portfolio-button"
                        onClick={() => navigate('/portfolio')}
                    >
                        <div className="svg-wrapper">
                            <div className="icon-wrapper">
                                <img
                                    src={MoneyIcon}
                                    alt="Portfolio"
                                />
                            </div>
                        </div>
                        <span>Portfolio</span>
                    </button>

                    <MarketStatusHUD socket={socket} />

                    <div style={{
                        background: 'rgba(56, 189, 248, 0.1)', // Light blue background
                        color: '#38bdf8', // Blue text
                        padding: '0.6rem 1.5rem',
                        borderRadius: '30px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        backdropFilter: 'blur(4px)' // Slight blur for the badge itself
                    }}>
                        Balance: {formatCurrency(user.balance, user.currency)}
                    </div>



                    <button
                        onClick={() => navigate('/settings')}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.5rem' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>settings</span>
                    </button>

                    <button style={{
                        background: 'transparent',
                        border: '1px solid #22c55e',
                        color: '#22c55e',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginLeft: '1rem'
                    }} onClick={() => {
                        sessionStorage.clear();
                        navigate('/login');
                    }}>
                        Log out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="main-content" style={{ marginTop: '160px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '3rem', padding: '0 3rem 100px 3rem' }}>

                {/* Top Section: Trade, Portfolio, Ranking, Activity */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                    <div style={{ minHeight: '450px' }}>
                        <TradeForm stocks={stocks} onTradeSubmit={handleTrade} currency={user.currency} />
                    </div>

                    <div style={{ minHeight: '450px' }}>
                        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                <h2 style={{ margin: 0 }}>Portfolio Summary</h2>
                                <button
                                    onClick={() => navigate('/portfolio')}
                                    style={{
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        border: '1px solid rgba(168, 85, 247, 0.2)',
                                        color: '#a855f7',
                                        padding: '0.4rem 1rem',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    View All →
                                </button>
                            </div>

                            {user.holdings.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>inventory_2</span>
                                    <p>No holdings yet</p>
                                    <p style={{ fontSize: '0.85rem' }}>Start trading to build your portfolio</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Total Value</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#38bdf8' }}>
                                                {formatCurrency(
                                                    user.holdings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0),
                                                    user.currency
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Holdings</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#22c55e' }}>
                                                {user.holdings.length} Assets
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {user.holdings.slice(0, 5).map(h => {
                                                const current_price = parseFloat(h.current_price || 0);
                                                const average_price = parseFloat(h.average_price || 0);
                                                const quantity = parseFloat(h.quantity || 0);
                                                const value = quantity * current_price;
                                                const gainLoss = average_price > 0 ? ((current_price - average_price) / average_price * 100) : 0;

                                                return (
                                                    <li
                                                        key={h.symbol}
                                                        className="flex justify-between items-center"
                                                        style={{
                                                            padding: '0.8rem 0.5rem',
                                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.2s ease'
                                                        }}
                                                        onClick={() => navigate(`/stock/${h.symbol}`)}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <div>
                                                            <div style={{ fontWeight: 'bold' }}>{h.symbol}</div>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{quantity.toFixed(2)} Shares</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: 'bold' }}>{formatCurrency(value, user.currency)}</div>
                                                            <div style={{ fontSize: '0.85rem', color: current_price >= average_price ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                                {gainLoss >= 0 ? '+' : ''}{gainLoss.toFixed(2)}%
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                        {user.holdings.length > 5 && (
                                            <div style={{ textAlign: 'center', marginTop: '1rem', padding: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                +{user.holdings.length - 5} more holdings
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </section>
                    </div>

                    <div style={{ minHeight: '450px' }}>
                        <RankPanel currency={user.currency} />
                    </div>


                </div>




                {/* Crypto Market Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '1px', fontWeight: 600 }}>DIGITAL ASSETS</span>
                            <h2 style={{ fontSize: '1.8rem', margin: '0.2rem 0', fontWeight: 600 }}>Crypto Market Pulse</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ padding: '4px 12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                LIVE 24/7
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {stocks.filter(s => s.sector === 'Crypto').map(crypto => (
                            <div key={crypto.symbol} className="card" style={{
                                padding: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                                border: '1px solid rgba(56, 189, 248, 0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }} onClick={() => navigate(`/stock/${crypto.symbol}`)}>
                                {/* Glassmorphism shine */}
                                <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: crypto.symbol === 'BTC' ? '#f7931a' : (crypto.symbol === 'ETH' ? '#627eea' : '#38bdf8'),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                        }}>
                                            {crypto.symbol[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{crypto.symbol}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{crypto.name}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(crypto.price, user.currency)}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#4ade80' }}>⚡ Real-time</div>
                                    </div>
                                </div>
                                <button className="btn outline" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>Trade {crypto.symbol}</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section: Market Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <MarketTable stocks={stocks} currency={user.currency} onTrade={(s) => console.log('Selected', s)} />
                </div>

            </div>
        </div>
    );
}
