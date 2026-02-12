import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import BackgroundTicker from '../components/BackgroundTicker';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/login', { email, password });

            sessionStorage.setItem('token', res.data.token);
            sessionStorage.setItem('user', JSON.stringify(res.data));

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <BackgroundTicker />

            <div className="auth-card" style={{ position: 'relative' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        marginBottom: '1.5rem',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#38bdf8',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease',
                        width: 'fit-content'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>arrow_back</span>
                    Home
                </button>
                <h1 style={{ marginBottom: '0.5rem' }}>Welcome Back</h1>
                <p className="meta" style={{ marginBottom: '2rem' }}>Sign in to your trading portfolio</p>

                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label>
                        Email Address
                        <input
                            type="text"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                        <div className="meta">
                            Don't have an account? <Link to="/register" style={{ color: 'var(--accent-green)' }}>Create one</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
