import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Play, Shuffle, TrendingUp, TrendingDown, Activity, Smartphone, AlertTriangle } from 'lucide-react';

const EVENTS = [
    { id: 'covid_start', label: 'Covid Crash', date: '2020-02-19', icon: <TrendingDown className="w-4 h-4 text-red-400" />, desc: 'The Pandemic Plunge' },
    { id: 'covid_bottom', label: 'Market Bottom', date: '2020-03-23', icon: <Activity className="w-4 h-4 text-blue-400" />, desc: 'Maximum Fear' },
    { id: 'tech_peak', label: 'Tech Peak', date: '2021-11-19', icon: <Smartphone className="w-4 h-4 text-purple-400" />, desc: 'Nasdaq All-Time High' },
    { id: 'bear_2022', label: '2022 Crisis', date: '2022-06-13', icon: <AlertTriangle className="w-4 h-4 text-orange-400" />, desc: 'Inflation Panic' },
    { id: 'ai_boom', label: 'AI Rally', date: '2023-01-03', icon: <TrendingUp className="w-4 h-4 text-green-400" />, desc: 'Generative AI Boom' },
];

const HistoryPanel = ({ token }) => {
    const [mode, setMode] = useState('GBM');
    const [loading, setLoading] = useState(false);

    const switchMode = async (newMode) => {
        try {
            setLoading(true);
            setMode(newMode);
            await fetch('http://localhost:5000/api/simulation/mode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mode: newMode })
            });
            setTimeout(() => setLoading(false), 500);
        } catch (err) {
            console.error("Failed to switch mode:", err);
            setLoading(false);
        }
    };

    const jumpToDate = async (date) => {
        try {
            setLoading(true);
            // Automatic switch to HISTORICAL if not already
            if (mode !== 'HISTORICAL') {
                await switchMode('HISTORICAL');
            }

            const isoDate = new Date(date).toISOString();
            await fetch('http://localhost:5000/api/simulation/jump', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date: isoDate })
            });
            setTimeout(() => setLoading(false), 800);
        } catch (err) {
            console.error("Failed to jump:", err);
            setLoading(false);
        }
    };

    const cardStyle = {
        background: 'rgba(5, 12, 20, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    };

    const buttonBaseStyle = {
        padding: '0.6rem 1.2rem',
        borderRadius: '8px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        border: 'none',
        outline: 'none'
    };

    const activeLiveStyle = {
        ...buttonBaseStyle,
        background: 'rgba(6, 182, 212, 0.2)', // cyan-500/20
        color: '#22d3ee', // cyan-400
        border: '1px solid rgba(6, 182, 212, 0.5)',
        boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)'
    };

    const activeHistoryStyle = {
        ...buttonBaseStyle,
        background: 'rgba(147, 51, 234, 0.2)', // purple-600/20
        color: '#c084fc', // purple-400
        border: '1px solid rgba(147, 51, 234, 0.5)',
        boxShadow: '0 0 15px rgba(147, 51, 234, 0.2)'
    };

    const inactiveStyle = {
        ...buttonBaseStyle,
        background: 'transparent',
        color: '#64748b',
        border: '1px solid transparent'
    };

    const scenarioButtonStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0.8rem 1rem',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        cursor: 'pointer',
        minWidth: 'fit-content',
        transition: 'all 0.2s ease'
    };

    return (
        <div style={cardStyle}>

            {/* Header / Top Glow */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: mode === 'HISTORICAL'
                    ? 'linear-gradient(90deg, transparent, #a855f7, transparent)'
                    : 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
                opacity: 0.8
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>

                {/* Left: Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                            {mode === 'HISTORICAL' ? <Calendar size={20} color="#c084fc" /> : <Shuffle size={20} color="#22d3ee" />}
                            <span style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>TIME MACHINE</span>
                        </h2>
                        <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', marginLeft: '34px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {mode === 'HISTORICAL' ? 'Replaying Historical Data (2020-2024)' : 'Simulating Random Market Walks'}
                        </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
                        <button
                            onClick={() => switchMode('GBM')}
                            disabled={loading}
                            style={mode === 'GBM' ? activeLiveStyle : inactiveStyle}
                        >
                            LIVE SIMULATION
                        </button>
                        <button
                            onClick={() => switchMode('HISTORICAL')}
                            disabled={loading}
                            style={mode === 'HISTORICAL' ? activeHistoryStyle : inactiveStyle}
                        >
                            HISTORICAL DATA
                        </button>
                    </div>
                </div>

                {/* Right: Scenarios */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="custom-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', whiteSpace: 'nowrap', marginRight: '8px', letterSpacing: '1px' }}>JUMP TO EVENT:</span>
                        {EVENTS.map(evt => (
                            <button
                                key={evt.id}
                                onClick={() => jumpToDate(evt.date)}
                                disabled={loading}
                                style={scenarioButtonStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                            >
                                <span style={{ opacity: 0.8 }}>{evt.icon}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#e2e8f0' }}>{evt.label}</span>
                                    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#64748b', background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: '4px', marginTop: '2px' }}>{evt.date}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default React.memo(HistoryPanel);
