import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackgroundTicker from '../components/BackgroundTicker';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/admin/login', { password });

            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data));

            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid admin password');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        }}>
            <BackgroundTicker />

            <div className="auth-card" style={{ zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, marginBottom: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#fbbf24' }}>lock</span>
                    </h1>
                    <h2 style={{ fontSize: '1.8rem', margin: 0, marginBottom: '0.5rem' }}>Admin Access</h2>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Enter admin password</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="password">Admin Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                            style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '2px' }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#ef4444',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                        Access Admin Panel
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/login');
                            }}
                            style={{ color: '#94a3b8', fontSize: '0.9rem' }}
                        >
                            ← Back to User Login
                        </a>
                    </div>
                </form>

                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(56, 189, 248, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.2)'
                }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
                        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#fbbf24' }}>lightbulb</span>
                            For testing:
                        </div>
                        <div style={{ fontFamily: 'monospace', color: '#38bdf8' }}>Password: admin123</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
