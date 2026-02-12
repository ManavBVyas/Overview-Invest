import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import TradingViewChart from '../components/TradingViewChart';
import BackgroundTicker from '../components/BackgroundTicker';
import Loader from '../components/Loader';
import { formatCurrency } from '../utils/formatters';

const PressureBar = ({ buyPercent = 50 }) => {
    const sellPercent = 100 - buyPercent;

    return (
        <div style={{ width: '100%', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px', fontWeight: 'bold' }}>
                <span style={{ color: '#4ade80' }}>BUY {buyPercent.toFixed(0)}%</span>
                <span style={{ color: '#f87171' }}>SELL {sellPercent.toFixed(0)}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{
                    width: `${buyPercent}%`,
                    background: 'linear-gradient(90deg, #059669, #10b981)',
                    transition: 'width 0.5s ease-out',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                }} />
                <div style={{
                    width: `${sellPercent}%`,
                    background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                    transition: 'width 0.5s ease-out',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                }} />
            </div>
        </div>
    );
};

export default function StockDetail() {
    const { symbol } = useParams();
    const navigate = useNavigate();

    const [stock, setStock] = useState(null);
    const [user, setUser] = useState({ username: '', balance: 0, holdings: [] });
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const [quantity, setQuantity] = useState(1);
    const [action, setAction] = useState('BUY');
    const [chartInterval, setChartInterval] = useState('D');

    useEffect(() => {
        const fetchData = async () => {
            const token = sessionStorage.getItem('token');

            if (!token) {
                return navigate('/login');
            }

            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [userRes, stockRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/user/portfolio', config),
                    axios.get(`http://localhost:5000/api/stock/${symbol}`, config)
                ]);

                setUser(userRes.data);
                setStock(stockRes.data);

            } catch (err) {
                console.error('Fetch error:', err);

                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    alert(`Error loading stock data: ${err.response?.data?.message || err.message}`);
                    navigate('/dashboard');
                }
            }
        };
        fetchData();

        // Setup socket for real-time price updates
        const socket = io('http://localhost:5000');
        socket.on('priceUpdate', (data) => {
            const s = data.find(item => item.symbol === symbol);
            if (s) {
                setStock(prev => prev ? { ...prev, ...s } : s);
            }
        });

        return () => socket.disconnect();
    }, [symbol, navigate]);


    const handleTrade = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            await axios.post('http://localhost:5000/api/trade', {
                symbol, quantity: parseInt(quantity), type: action
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Trade successful!');
            const userRes = await axios.get('http://localhost:5000/api/user/portfolio', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(userRes.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Trade failed');
        }
    };

    if (!stock) return <Loader />;

    const currentHolding = user.holdings.find(h => h.symbol === symbol);
    const holdingQty = currentHolding ? currentHolding.quantity : 0;
    const stockPrice = parseFloat(stock.price);
    const holdingVal = holdingQty * stockPrice;
    const changeColor = (stock.change || 0) >= 0 ? '#4ade80' : '#f87171';
    const changeSign = (stock.change || 0) >= 0 ? '+' : '';

    return (
        <div>
            <BackgroundTicker />

            <header className="top-bar" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 100,
                padding: '1rem 3rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(13, 13, 13, 0.8)',
                backdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                    <h1 style={{
                        fontSize: '1.8rem',
                        margin: 0,
                        fontWeight: 500,
                        cursor: 'pointer',
                        letterSpacing: '0.5px'
                    }} onClick={() => navigate('/dashboard')}>
                        Overview Invest
                    </h1>

                    {/* Navigation Menu */}
                    <nav style={{ display: 'flex', gap: '2rem' }}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
                            style={{
                                color: '#94a3b8',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                fontWeight: '500',
                                transition: 'color 0.2s',
                                padding: '0.5rem 0'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'white'}
                            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                        >
                            Dashboard
                        </a>
                        <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                borderBottom: '2px solid #2962FF',
                                padding: '0.5rem 0'
                            }}
                        >
                            Market
                        </a>
                    </nav>
                </div>

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
                            padding: '0.4rem 1rem',
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
                        <span className="material-symbols-outlined" style={{ fontSize: '1.4rem', color: '#94a3b8' }}>account_circle</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: '1' }}>Account</span>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: '1.2' }}>{user.username || userData.username || userData.email?.split('@')?.[0] || 'Trader'}</span>
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '30px',
                        fontWeight: '600',
                        border: '1px solid rgba(56, 189, 248, 0.2)'
                    }}>
                        Balance: {formatCurrency(user.balance, user.currency)}
                    </div>

                    <button style={{
                        background: 'transparent',
                        border: '1px solid #22c55e',
                        color: '#22c55e',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }} onClick={() => {
                        sessionStorage.clear();
                        navigate('/login');
                    }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#22c55e';
                            e.target.style.color = 'black';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = '#22c55e';
                        }}>
                        Log out
                    </button>
                </div>
            </header>

            <main className="main-content" style={{ marginTop: '140px', maxWidth: '1600px', display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>

                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Stock Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ position: 'relative' }}>
                            <h2 style={{
                                fontSize: '3rem',
                                margin: 0,
                                lineHeight: 1,
                                textShadow: '0 0 20px rgba(56, 189, 248, 0.4), 0 0 40px rgba(56, 189, 248, 0.2)',
                                background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0.05) 50%, transparent 100%)',
                                padding: '0.5rem 1rem',
                                borderRadius: '12px',
                                position: 'relative',
                                display: 'inline-block'
                            }}>{stock.name}</h2>
                            <span style={{ fontSize: '1.5rem', color: '#94a3b8', marginLeft: '1rem' }}>{stock.symbol}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{formatCurrency(stock.price, user.currency)}</div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                {stock.change !== undefined && (
                                    <span style={{
                                        padding: '4px 10px',
                                        background: `${changeColor}15`,
                                        color: changeColor,
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        border: `1px solid ${changeColor}30`
                                    }}>
                                        {changeSign}{stock.change?.toFixed(2)} ({changeSign}{stock.changePercent?.toFixed(2)}%)
                                    </span>
                                )}
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: '#4ade80',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <div style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: '#4ade80', boxShadow: '0 0 8px #4ade80',
                                        animation: 'pulse 2s infinite'
                                    }} />
                                    Finnhub Live
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TradingView Chart - Real Market Data */}
                    <section className="card" style={{
                        padding: '1rem',
                        height: '560px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem',
                            flexShrink: 0
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Live Market Chart</h3>
                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Powered by TradingView</span>
                            </div>

                            {/* Interval Selector */}
                            <div style={{
                                display: 'flex',
                                gap: '0.25rem',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '3px',
                                borderRadius: '6px'
                            }}>
                                {[
                                    { label: '1m', value: '1' },
                                    { label: '5m', value: '5' },
                                    { label: '15m', value: '15' },
                                    { label: '1H', value: '60' },
                                    { label: '4H', value: '240' },
                                    { label: '1D', value: 'D' },
                                    { label: '1W', value: 'W' },
                                ].map(interval => (
                                    <button
                                        key={interval.value}
                                        onClick={() => setChartInterval(interval.value)}
                                        style={{
                                            background: chartInterval === interval.value ? '#2962FF' : 'transparent',
                                            color: chartInterval === interval.value ? 'white' : '#94a3b8',
                                            border: 'none',
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: chartInterval === interval.value ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {interval.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                            <TradingViewChart
                                symbol={symbol}
                                interval={chartInterval}
                                height={490}
                                theme="dark"
                                allowSymbolChange={true}
                            />
                        </div>
                    </section>

                    {/* Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Day Range</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                {formatCurrency(stock.day_low || stock.price, user.currency)} - {formatCurrency(stock.day_high || stock.price, user.currency)}
                            </div>
                        </div>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Open</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatCurrency(stock.open || stock.price, user.currency)}</div>
                        </div>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Previous Close</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatCurrency(stock.previousClose || stock.price, user.currency)}</div>
                        </div>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Current Price</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>{formatCurrency(stock.price, user.currency)}</div>
                        </div>
                        <div className="card" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Market Sentiment</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                                {(stock.changePercent || 0) > 1 ? 'BULLISH' : (stock.changePercent || 0) < -1 ? 'BEARISH' : 'NEUTRAL'}
                            </div>
                            <PressureBar buyPercent={50 + (stock.changePercent || 0) * 5} />
                        </div>
                    </div>

                    {/* Data Source Info */}
                    <section className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Market Data Source</h3>
                            <span style={{
                                padding: '4px 12px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                color: '#22c55e',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                border: '1px solid rgba(34, 197, 94, 0.2)'
                            }}>LIVE</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Price Data</div>
                                <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>Finnhub API</div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Real-time quotes, updated every 15s</div>
                            </div>
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Charts</div>
                                <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>TradingView Widget</div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Interactive charts with full history</div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Trade Panel */}
                <aside className="card" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '140px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Trade {stock.symbol}</h3>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Your Position</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{holdingQty} Shares</div>
                        <div style={{ color: '#4ade80' }}>Value: {formatCurrency(holdingVal, user.currency)}</div>
                    </div>

                    <form onSubmit={handleTrade}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: 'rgba(0,0,0,0.3)' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button
                                type="button"
                                className="btn"
                                style={{ flex: 1, background: action === 'BUY' ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)', color: action === 'BUY' ? 'black' : 'white' }}
                                onClick={() => setAction('BUY')}
                            >
                                Buy
                            </button>
                            <button
                                type="button"
                                className="btn"
                                style={{ flex: 1, background: action === 'SELL' ? '#ff4d4d' : 'rgba(255,255,255,0.1)', color: 'white' }}
                                onClick={() => setAction('SELL')}
                            >
                                Sell
                            </button>
                        </div>

                        <button type="submit" className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                            Confirm {action}
                        </button>
                    </form>
                </aside>

            </main>
        </div>
    );
}
