import React, { useState, useEffect } from 'react';

export default function Loading({ message = 'Loading' }) {
    const words = ['Portfolio', 'Account', 'Leaderboard', 'Balance', 'Market'];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, 800); // Faster rotation (800ms instead of 1500ms)
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: '#000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            fontFamily: "'Outfit', sans-serif"
        }}>
            {/* Rotating Text Container */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '1.5rem',
                height: '2rem',
                overflow: 'hidden'
            }}>
                <span style={{ color: '#00FF85' }}>Loading</span>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: `translateY(-${index * 2}rem)`
                }}>
                    {words.map((word, i) => (
                        <span key={i} style={{
                            height: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            background: 'linear-gradient(to right, #ffffff, #9ca3af)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {word}...
                        </span>
                    ))}
                </div>
            </div>

            {/* Brand Name - Shining Silver */}
            <div style={{
                position: 'absolute',
                bottom: '3rem',
                fontSize: '1.4rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #e5e7eb 0%, #ffffff 25%, #f3f4f6 50%, #ffffff 75%, #e5e7eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '2px',
                textShadow: '0 0 40px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.4)',
                animation: 'silverShine 3s ease-in-out infinite',
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))'
            }}>
                OVERVIEW INVEST
            </div>

            <style>{`
                @keyframes silverShine {
                    0%, 100% {
                        filter: brightness(1) drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
                    }
                    50% {
                        filter: brightness(1.4) drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
                    }
                }
            `}</style>
        </div>
    );
}

