import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

export default function Landing() {
    const navigate = useNavigate();
    const [liveStocks, setLiveStocks] = useState([]);
    const [stats, setStats] = useState({ users: 0, trades: 0, volume: 0 });

    useEffect(() => {
        // Connect to socket for live ticker
        const socket = io('http://localhost:5000');

        socket.on('priceUpdate', (data) => {
            if (data && data.length > 0) {
                // Show top 5 movers
                const movers = data
                    .filter(s => Math.abs(s.changePercent || 0) > 0)
                    .sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0))
                    .slice(0, 5);
                setLiveStocks(movers);
            }
        });

        // Fetch real platform statistics from public endpoint
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
                // Show 0 if API fails
                setStats({ users: 0, trades: 0, volume: 0 });
            }
        };

        fetchStats();

        return () => socket.disconnect();
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000000',
            color: '#f8fafc',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Navigation */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 5%',
                position: 'relative',
                zIndex: 10,
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px'
                }}>
                    Overview Invest
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '0.75rem 2rem',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#f8fafc',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.borderColor = '#4DA6FF';
                            e.target.style.color = '#4DA6FF';
                            e.target.style.boxShadow = '0 0 15px rgba(77, 166, 255, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                            e.target.style.color = '#f8fafc';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            padding: '0.75rem 2rem',
                            background: '#00FF85',
                            border: 'none',
                            color: '#001925',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.border = '1px solid #00FF85';
                            e.target.style.color = '#00FF85';
                            e.target.style.boxShadow = '0 0 15px rgba(0, 255, 133, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#00FF85';
                            e.target.style.border = 'none';
                            e.target.style.color = '#001925';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '6rem 5% 4rem',
                position: 'relative',
                zIndex: 5
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '4rem'
                }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        background: 'rgba(192, 192, 192, 0.1)',
                        border: '1px solid rgba(192, 192, 192, 0.3)',
                        borderRadius: '50px',
                        marginBottom: '2rem',
                        animation: 'fadeInDown 1s ease-out'
                    }}>
                        <span style={{
                            color: '#C0C0C0',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            letterSpacing: '1px'
                        }}>
                            POWERED BY FINNHUB REAL-TIME DATA
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        color: '#f8fafc',
                        animation: 'fadeInUp 1s ease-out 0.2s both'
                    }}>
                        Trade Smarter,
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Grow Faster
                        </span>
                    </h1>

                    <p style={{
                        fontSize: '1.3rem',
                        color: 'rgba(226, 232, 240, 0.7)',
                        maxWidth: '700px',
                        margin: '0 auto 3rem',
                        lineHeight: 1.6,
                        animation: 'fadeInUp 1s ease-out 0.4s both'
                    }}>
                        Experience real-time stock trading with live market data from Finnhub.
                        Build your portfolio, compete on leaderboards, and master the markets.
                    </p>

                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        animation: 'fadeInUp 1s ease-out 0.6s both'
                    }}>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                padding: '1.2rem 3rem',
                                background: '#00FF85',
                                border: 'none',
                                color: '#001925',
                                borderRadius: '8px',
                                fontSize: '1.2rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontFamily: 'inherit'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.border = '1px solid #00FF85';
                                e.target.style.color = '#00FF85';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 0 20px rgba(0, 255, 133, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#00FF85';
                                e.target.style.border = 'none';
                                e.target.style.color = '#001925';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            Start Trading Free
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '1.2rem 3rem',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#f8fafc',
                                borderRadius: '8px',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontFamily: 'inherit'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = '#4DA6FF';
                                e.target.style.color = '#4DA6FF';
                                e.target.style.boxShadow = '0 0 15px rgba(77, 166, 255, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                e.target.style.color = '#f8fafc';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            View Demo
                        </button>
                    </div>
                </div>

                {/* Live Ticker */}
                {liveStocks.length > 0 && (
                    <div className="card" style={{
                        padding: '2rem',
                        marginTop: '4rem',
                        animation: 'fadeIn 1s ease-out 0.8s both'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#00FF85',
                                boxShadow: '0 0 10px #00FF85',
                                animation: 'pulse 2s infinite'
                            }} />
                            <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '1px' }}>
                                LIVE MARKET MOVERS
                            </span>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {liveStocks.map((stock, idx) => (
                                <div key={idx} style={{
                                    padding: '1.2rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.borderColor = 'rgba(77, 166, 255, 0.4)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(77, 166, 255, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        {stock.symbol}
                                    </div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem', color: '#f8fafc' }}>
                                        ${stock.price?.toFixed(2)}
                                    </div>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        color: (stock.changePercent || 0) >= 0 ? '#00FF85' : '#FF4D4D'
                                    }}>
                                        {(stock.changePercent || 0) >= 0 ? '↗' : '↘'} {((stock.changePercent || 0) >= 0 ? '+' : '')}{(stock.changePercent || 0).toFixed(2)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Stats Section */}
            <section style={{
                maxWidth: '1400px',
                margin: '4rem auto',
                padding: '0 5%',
                position: 'relative',
                zIndex: 5
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {[
                        { label: 'Active Traders', value: stats.users.toLocaleString(), icon: '/User Icon.png' },
                        { label: 'Total Transactions', value: stats.trades.toLocaleString(), icon: '/Analytics Icon.png' },
                        { label: 'Trading Volume', value: `₹${(stats.volume / 1000000).toFixed(1)}M`, icon: '/Safe Icone.png' }
                    ].map((stat, idx) => (
                        <div key={idx} className="premium-card-outer" style={{
                            animation: `fadeInUp 1s ease-out ${1 + idx * 0.1}s both`
                        }}>
                            <div className="premium-card-dot"></div>
                            <div className="premium-card-inner">
                                <div className="premium-card-ray"></div>
                                <img src={stat.icon} alt={stat.label} className="premium-card-icon" />
                                <div className="premium-card-text">{stat.value}</div>
                                <div className="premium-card-label">{stat.label}</div>
                                <div className="premium-card-line topl"></div>
                                <div className="premium-card-line leftl"></div>
                                <div className="premium-card-line bottoml"></div>
                                <div className="premium-card-line rightl"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section style={{
                maxWidth: '1400px',
                margin: '6rem auto',
                padding: '0 5%',
                position: 'relative',
                zIndex: 5
            }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                        fontWeight: 900,
                        marginBottom: '1rem',
                        color: '#f8fafc'
                    }}>
                        Why Choose Overview Invest?
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                        Everything you need to succeed in the stock market
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2rem'
                }}>
                    {[
                        {
                            icon: '/Market icon.png',
                            title: 'Real-Time Data',
                            description: 'Live market data powered by Finnhub API. Get accurate prices updated every 15 seconds.'
                        },
                        {
                            icon: '/Smart Icon.png',
                            title: 'Smart Trading',
                            description: 'Advanced trading interface with instant execution and portfolio tracking.'
                        },
                        {
                            icon: '/Leadbord Icon.png',
                            title: 'Leaderboards',
                            description: 'Compete with other traders and climb the ranks to become the top investor.'
                        },
                        {
                            icon: '/Safe Icone.png',
                            title: 'Portfolio Management',
                            description: 'Track your holdings, view performance metrics, and manage your investments.'
                        },
                        {
                            icon: '/Analytics Icon.png',
                            title: 'Market Analytics',
                            description: 'Access detailed charts, technical indicators, and market insights.'
                        },
                        {
                            icon: '/Secure Icon.png',
                            title: 'Secure & Reliable',
                            description: 'Bank-level security with encrypted data and secure authentication.'
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="premium-card-outer" style={{
                            height: '320px',
                            animation: `fadeInUp 1s ease-out ${1.2 + idx * 0.1}s both`
                        }}>
                            <div className="premium-card-dot"></div>
                            <div className="premium-card-inner" style={{ padding: '2rem' }}>
                                <div className="premium-card-ray"></div>
                                <img src={feature.icon} alt={feature.title} style={{
                                    width: '60px',
                                    height: '60px',
                                    marginBottom: '1.5rem',
                                    filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))'
                                }} />
                                <h3 style={{
                                    fontSize: '1.4rem',
                                    fontWeight: 700,
                                    marginBottom: '1rem',
                                    color: '#f8fafc',
                                    textAlign: 'center'
                                }}>
                                    {feature.title}
                                </h3>
                                <p style={{
                                    fontSize: '0.95rem',
                                    color: '#94a3b8',
                                    lineHeight: 1.6,
                                    textAlign: 'center'
                                }}>
                                    {feature.description}
                                </p>
                                <div className="premium-card-line topl"></div>
                                <div className="premium-card-line leftl"></div>
                                <div className="premium-card-line bottoml"></div>
                                <div className="premium-card-line rightl"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                maxWidth: '1000px',
                margin: '6rem auto 4rem',
                padding: '0 5%',
                position: 'relative',
                zIndex: 5
            }}>
                <div className="card" style={{
                    padding: '4rem 3rem',
                    textAlign: 'center',
                    background: 'rgba(0, 255, 133, 0.05)',
                    borderColor: 'rgba(0, 255, 133, 0.3)'
                }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: 900,
                        marginBottom: '1.5rem',
                        color: '#f8fafc'
                    }}>
                        Ready to Start Trading?
                    </h2>
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#94a3b8',
                        marginBottom: '2.5rem',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem'
                    }}>
                        Join thousands of traders already using Overview Invest to build their wealth.
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            padding: '1.2rem 3.5rem',
                            background: '#00FF85',
                            border: 'none',
                            color: '#001925',
                            borderRadius: '8px',
                            fontSize: '1.3rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.border = '1px solid #00FF85';
                            e.target.style.color = '#00FF85';
                            e.target.style.transform = 'translateY(-4px) scale(1.05)';
                            e.target.style.boxShadow = '0 0 30px rgba(0, 255, 133, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#00FF85';
                            e.target.style.border = 'none';
                            e.target.style.color = '#001925';
                            e.target.style.transform = 'translateY(0) scale(1)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Create Free Account →
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                padding: '3rem 5%',
                textAlign: 'center',
                color: '#64748b',
                position: 'relative',
                zIndex: 5
            }}>
                <div style={{
                    marginBottom: '1rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Overview Invest
                </div>
                <p style={{ fontSize: '0.9rem' }}>
                    © 2026 Overview Invest. Real-time market data powered by Finnhub.
                </p>
            </footer>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}
