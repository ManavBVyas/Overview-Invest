import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import BackgroundTicker from '../components/BackgroundTicker';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/register', { username, email, password });

            // No token returned - redirect to OTP verify
            if (res.data.require_verification) {
                navigate('/verify-otp', { state: { email: res.data.email } });
            } else {
                // Fallback if backend wasn't updated correctly or somehow returned token
                if (res.data.token) {
                    sessionStorage.setItem('token', res.data.token);
                    sessionStorage.setItem('user', JSON.stringify(res.data));
                    navigate('/dashboard');
                }
            }

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed. Email may already be taken.');
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
                <h1 style={{ marginBottom: '0.5rem' }}>Create Account</h1>
                <p className="meta" style={{ marginBottom: '2rem' }}>Start your trading journey today</p>

                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label>
                        Username
                        <input
                            type="text"
                            placeholder="johndoe123"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Email Address
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Confirm Password
                        <input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                        <div className="meta">
                            Already have an account? <Link to="/login" style={{ color: 'var(--accent-green)' }}>Sign In</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
