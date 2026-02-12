import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/formatters';

export default function RankPanel({ currency = 'USD' }) {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/leaderboard');
                setRankings(response.data);
                setLoading(false);
                setError(null);
            } catch (err) {
                console.error("Error fetching rankings", err);
                setError(err.message || "Failed to load rankings");
                setLoading(false);
            }
        };

        fetchRankings();
        const interval = setInterval(fetchRankings, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return { icon: 'trophy', color: '#fbbf24', label: 'Gold' };
            case 1: return { icon: 'workspace_premium', color: '#94a3b8', label: 'Silver' };
            case 2: return { icon: 'military_tech', color: '#b45309', label: 'Bronze' };
            default: return null;
        }
    };

    if (loading) return <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Loading Rankings...</div>;
    if (error) return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>Ranking Error: {error}</div>;

    return (
        <section className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#fbbf24' }}>leaderboard</span>
                    Market Rankings
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>LIVE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {rankings.map((user, index) => {
                    const rank = getRankIcon(index);
                    return (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 15px',
                                borderRadius: '12px',
                                background: index < 3 ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                border: index < 3 ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                                transition: 'transform 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    color: rank ? rank.color : '#94a3b8'
                                }}>
                                    {rank ? (
                                        <span className="material-symbols-outlined">{rank.icon}</span>
                                    ) : (
                                        `#${index + 1}`
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.display_name}</span>
                                    {rank && <span style={{ fontSize: '0.7rem', color: rank.color, fontWeight: 'bold', textTransform: 'uppercase' }}>{rank.label} Tier</span>}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', color: '#4ade80' }}>
                                    {formatCurrency(user.total_wealth, currency)}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Wealth</div>
                            </div>
                        </div>
                    );
                })}
                {rankings.length === 0 && <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No traders ranked yet.</div>}
            </div>

            <div style={{
                marginTop: '10px',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.1)',
                fontSize: '0.85rem',
                color: '#38bdf8',
                textAlign: 'center'
            }}>
                Rankings include liquid balance, legacy wallets, and portfolio value.
            </div>
        </section>
    );
}
