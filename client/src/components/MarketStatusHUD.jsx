import React, { useState, useEffect } from 'react';

/**
 * Market Status HUD - Shows live market time and connection status
 */
export default function MarketStatusHUD({ socket }) {
    const [displayTime, setDisplayTime] = useState('--:--:--');
    const [isConnected, setIsConnected] = useState(false);

    // Helper to format 24h to 12h
    const format12h = (time24) => {
        if (!time24 || time24 === '--:--:--') return time24;
        const [h, m, s] = time24.split(':').map(Number);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${suffix}`;
    };

    // Use local clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            setDisplayTime(`${h}:${m}:${s}`);
        };

        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // Track socket connection
    useEffect(() => {
        if (!socket) return;

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // Check initial state
        setIsConnected(socket.connected);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, [socket]);

    const accentColor = isConnected ? '#22c55e' : '#f59e0b';
    const badgeText = isConnected ? 'LIVE' : 'CONNECTING';

    return (
        <div
            style={{
                background: 'rgba(5, 12, 20, 0.8)',
                padding: '0.7rem 1.4rem',
                borderRadius: '16px',
                border: `1px solid rgba(34, 197, 94, 0.2)`,
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(8px)',
                userSelect: 'none',
                minWidth: '260px',
                transition: 'all 0.5s ease'
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{
                    fontSize: '0.65rem',
                    color: accentColor,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    fontWeight: 'bold',
                    transition: 'color 0.5s ease'
                }}>
                    Market Time
                </span>
                <span style={{
                    fontWeight: '900',
                    fontSize: '1.2rem',
                    color: 'white',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '1px',
                    display: 'inline-block',
                    width: '140px'
                }}>
                    {format12h(displayTime)}
                </span>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: accentColor,
                    boxShadow: `0 0 15px ${accentColor}`,
                    filter: 'brightness(1.2)',
                    animation: 'pulse 2s infinite',
                    transition: 'background 0.5s ease, box-shadow 0.5s ease'
                }} />
                <span style={{
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    color: accentColor,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    transition: 'color 0.5s ease'
                }}>
                    {badgeText}
                </span>
            </div>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
