import React, { useState, useEffect } from 'react';
import Counter from './Counter';

const RANKS = [
    { name: 'Bronze', intensity: 'LOW', color: '#cd7f32', icon: 'military_tech', min: 0 },
    { name: 'Silver', intensity: 'MID', color: '#c0c0c0', icon: 'workspace_premium', min: 10000 },
    { name: 'Gold', intensity: 'MID', color: '#ffd700', icon: 'emoji_events', min: 50000 },
    { name: 'Platinum', intensity: 'HIGH', color: '#e5e4e2', icon: 'stars', min: 150000 },
    { name: 'Diamond', intensity: 'HIGH', color: '#b9f2ff', icon: 'diamond', min: 400000 },
    { name: 'Master', intensity: 'ELITE', color: '#ff4d4d', icon: 'local_fire_department', min: 1000000 },
    { name: 'Grandmaster', intensity: 'ELITE', color: '#a855f7', icon: 'auto_awesome', min: 5000000 },
    { name: 'Legendary', intensity: 'ELITE', color: '#facc15', icon: 'military_tech', min: 20000000 }
];

export default function RankCard({ totalWealth }) {
    const [currentRank, setCurrentRank] = useState(RANKS[0]);
    const [nextRank, setNextRank] = useState(RANKS[1]);
    const [showRankUp, setShowRankUp] = useState(false);

    useEffect(() => {
        let rankIdx = 0;
        for (let i = RANKS.length - 1; i >= 0; i--) {
            if (totalWealth >= RANKS[i].min) {
                rankIdx = i;
                break;
            }
        }
        const rank = RANKS[rankIdx];
        const next = RANKS[rankIdx + 1] || null;

        // Use sessionStorage for current session user state
        const savedRankName = sessionStorage.getItem('user_rank_name') || localStorage.getItem('user_rank_name');

        if (savedRankName && savedRankName !== rank.name && totalWealth > 0) {
            const oldIdx = RANKS.findIndex(r => r.name === savedRankName);
            if (rankIdx > oldIdx) {
                setShowRankUp(true);
            }
        }

        sessionStorage.setItem('user_rank_name', rank.name);
        localStorage.setItem('user_rank_name', rank.name);
        setCurrentRank(rank);
        setNextRank(next);
    }, [totalWealth]);

    const progressPercent = nextRank
        ? ((totalWealth - currentRank.min) / (nextRank.min - currentRank.min)) * 100
        : 100;

    return (
        <>
            {/* Rank Card UI */}
            <div className="card" style={{
                padding: '1.5rem',
                background: 'rgba(20, 20, 20, 0.8)',
                border: `1px solid ${currentRank.color}33`,
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px'
            }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '12px',
                        background: `linear-gradient(135deg, ${currentRank.color}22, ${currentRank.color}44)`,
                        border: `1px solid ${currentRank.color}66`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: currentRank.color }}>
                            {currentRank.icon}
                        </span>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                            <div>
                                <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Personal Rank</span>
                                <h2 style={{ margin: 0, color: currentRank.color, fontSize: '1.6rem', fontWeight: '900' }}>{currentRank.name}</h2>
                            </div>
                            <button
                                onClick={() => setShowRankUp(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#38bdf8',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontWeight: 'bold'
                                }}
                            >
                                PREVIEW
                            </button>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                            <div style={{ width: `${Math.min(progressPercent, 100)}%`, height: '100%', background: currentRank.color, transition: 'width 1s ease-out' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Rank Up Overlay */}
            {showRankUp && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(0,0,0,0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: "'Outfit', sans-serif"
                }}>
                    <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h1 style={{ fontSize: '5rem', fontStyle: 'italic', letterSpacing: '15px', marginBottom: '0', fontWeight: '900', color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>RANK UP</h1>
                        <h2 style={{ fontSize: '3rem', color: currentRank.color, textTransform: 'uppercase', letterSpacing: '8px', marginTop: '10px', fontWeight: '900' }}>{currentRank.name}</h2>

                        <button
                            onClick={() => setShowRankUp(false)}
                            style={{
                                marginTop: '60px',
                                padding: '20px 60px',
                                cursor: 'pointer',
                                background: '#fff',
                                color: '#000',
                                border: 'none',
                                fontWeight: '900',
                                letterSpacing: '4px',
                                transform: 'skewX(-15deg)',
                                transition: 'all 0.2s ease',
                                boxShadow: `0 0 40px ${currentRank.color}66`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'skewX(-15deg) scale(1.05)';
                                e.currentTarget.style.boxShadow = `0 0 60px ${currentRank.color}88`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'skewX(-15deg) scale(1.0)';
                                e.currentTarget.style.boxShadow = `0 0 40px ${currentRank.color}66`;
                            }}
                        >
                            CONTINUE
                        </button>
                    </div>

                    {/* Money Counter at Bottom Center */}
                    <div style={{
                        position: 'absolute',
                        bottom: '10vh',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '5px', marginBottom: '20px', fontWeight: '900' }}>TOTAL PORTFOLIO VALUE</span>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '56px', fontWeight: '900', color: currentRank.color, marginRight: '10px', textShadow: `0 0 20px ${currentRank.color}44` }}>$</span>
                            <Counter
                                value={totalWealth}
                                fontSize={56}
                                textColor="#fff"
                                fontWeight="900"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
