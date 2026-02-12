import React from 'react';

/**
 * Simple Rupee Loader Component
 * Displays a spinning rupee symbol with yellow theme
 */
export default function SimpleLoader({ size = '32px', message }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
        }}>
            <div style={{
                width: size,
                height: size,
                aspectRatio: '1',
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: '#eab308',
                background: '#fde68a',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#92400e',
                fontSize: `calc(${size} * 0.6)`,
                fontWeight: 'bold',
                animation: 'spin 1s linear infinite'
            }}>
                ₹
            </div>
            {message && (
                <div style={{
                    fontSize: '0.9rem',
                    color: '#94a3b8',
                    fontWeight: 600
                }}>
                    {message}
                </div>
            )}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
