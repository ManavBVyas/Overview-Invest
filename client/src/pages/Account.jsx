import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackgroundTicker from '../components/BackgroundTicker';
import RankCard from '../components/RankCard';
import { formatCurrency } from '../utils/formatters';

const RANKS = [
    { name: 'Bronze', color: '#cd7f32', min: 0 },
    { name: 'Silver', color: '#c0c0c0', min: 10000 },
    { name: 'Gold', color: '#ffd700', min: 50000 },
    { name: 'Platinum', color: '#e5e4e2', min: 150000 },
    { name: 'Diamond', color: '#b9f2ff', min: 400000 },
    { name: 'Master', color: '#ff4d4d', min: 1000000 },
    { name: 'Grandmaster', color: '#a855f7', min: 5000000 },
    { name: 'Legendary', color: '#facc15', min: 20000000 }
];

export default function Account() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalWealth, setTotalWealth] = useState(0);
    const [currentRank, setCurrentRank] = useState(RANKS[0]);
    const navigate = useNavigate();
    const userData = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [portfolioRes, txnRes, statsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/user/portfolio', config),
                    axios.get('http://localhost:5000/api/user/transactions', config),
                    axios.get('http://localhost:5000/api/quick-trade/stats', config)
                ]);

                setUser(portfolioRes.data);
                setTransactions(txnRes.data);
                setStats(statsRes.data);

                // Calculate Total Wealth: Balance + Sum(holdings * current_price)
                const portfolioValue = portfolioRes.data.holdings?.reduce((sum, h) => {
                    const price = parseFloat(h.current_price || 0);
                    return sum + (parseInt(h.quantity) * price);
                }, 0) || 0;

                const currentWealth = parseFloat(portfolioRes.data.balance) + portfolioValue;
                setTotalWealth(currentWealth);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching account data", err);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Update every 10s
        return () => clearInterval(interval);
    }, [navigate]);

    // Update Rank based on Total Wealth
    useEffect(() => {
        const newRank = [...RANKS].reverse().find(r => totalWealth >= r.min) || RANKS[0];
        setCurrentRank(newRank);
    }, [totalWealth]);

    if (loading) return <div className="loader">Loading Account...</div>;

    return (
        <div style={{ color: 'white', minHeight: '100vh', paddingBottom: '50px' }}>
            <BackgroundTicker />

            {/* Header with Blur */}
            <header style={{
                position: 'fixed', top: 0, width: '100%', zIndex: 100,
                padding: '1rem 3rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>My Account</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>{userData.email}</span>
                    <button onClick={() => navigate('/settings')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </header>

            <div style={{ marginTop: '120px', padding: '0 3rem', maxWidth: '1200px', margin: '120px auto 0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                    {/* Sidebar / Profile Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Overview Invest Premium Card */}
                        <div className="ov-card-container">
                            <div className="ov-card-border" style={{
                                background: `linear-gradient(115deg, ${currentRank.color}44 12%, ${currentRank.color}44 27%, rgba(255, 255, 255, 0.33) 31%, ${currentRank.color}44 52%)`
                            }}>
                                <div className="ov-card-body" style={{
                                    backgroundImage: `linear-gradient(to right, #111, #111 2px, ${currentRank.color}22 2px, ${currentRank.color}22)`,
                                    border: `1px solid ${currentRank.color}44`,
                                    boxShadow: `0 0 20px ${currentRank.color}22`
                                }}>
                                    <div className="ov-card-shadow">
                                        <div className="ov-card-content" style={{
                                            backgroundImage: `linear-gradient(to right, #1a1a1a, #000 2px, ${currentRank.color}11 2px, ${currentRank.color}11)`
                                        }}>
                                            <p className="ov-card-title" style={{ color: currentRank.color }}>Overview Invest</p>
                                            <p className="ov-card-rank">
                                                {currentRank?.name ? `${currentRank.name.toUpperCase()} MEMBER` : 'MEMBER'}
                                            </p>
                                            <div className="ov-card-text-group">
                                                <p className="ov-card-label">CARD HOLDER</p>
                                                <p className="ov-card-name">
                                                    {userData.username || userData.email?.split('@')[0] || 'Trader'}
                                                </p>
                                                <p className="ov-card-amount">
                                                    {formatCurrency(user?.balance || 0, user?.currency)}
                                                </p>
                                            </div>
                                            <div className="ov-master-circle one"></div>
                                            <div className="ov-master-circle two"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info below card */}
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                            <p style={{ marginBottom: '0.5rem' }}>Status: <span className="text-green">Active</span></p>
                            <p>Account ID: #{userData.id || '0000'}</p>
                        </div>

                    </div>

                    {/* Main Content Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Rank Progression */}
                        <RankCard totalWealth={totalWealth} />

                        {/* Financial Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #38bdf8' }}>
                                <p style={{ color: '#94a3b8', margin: '0 0 0.5rem 0' }}>Total Balance</p>
                                <h2 style={{ margin: 0 }}>${user?.balance.toFixed(2)}</h2>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #4ade80' }}>
                                <p style={{ color: '#94a3b8', margin: '0 0 0.5rem 0' }}>Net Profit</p>
                                <h2 style={{ margin: 0, color: '#4ade80' }}>+${stats?.net_profit || '0.00'}</h2>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #fbbf24' }}>
                                <p style={{ color: '#94a3b8', margin: '0 0 0.5rem 0' }}>Win Rate</p>
                                <h2 style={{ margin: 0, color: '#fbbf24' }}>{stats?.win_rate || '0'}%</h2>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Recent Activity</h3>
                                <button style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}>View All</button>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '10px 0' }}>Type</th>
                                        <th>Asset</th>
                                        <th>Amount</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice(0, 5).map(t => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '15px 0' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                                    background: t.type === 'BUY' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                                    color: t.type === 'BUY' ? '#4ade80' : '#f87171'
                                                }}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 'bold' }}>{t.symbol}</td>
                                            <td>{t.quantity}</td>
                                            <td>${parseFloat(t.price).toFixed(2)}</td>
                                            <td><span style={{ color: '#4ade80' }}>Completed</span></td>
                                            <td style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                {new Date(t.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No recent activity found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
