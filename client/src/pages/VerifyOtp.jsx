import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import BackgroundTicker from '../components/BackgroundTicker';

export default function VerifyOtp() {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get email from previous nav state or query param
    const email = location.state?.email || new URLSearchParams(location.search).get('email');

    useEffect(() => {
        if (!email) {
            setError("No email found. Please register or login first.");
        }
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/verify-otp', { email, code: otp });

            // On success, backend now returns the JWT token
            sessionStorage.setItem('token', res.data.token);
            sessionStorage.setItem('user', JSON.stringify(res.data.user));

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Verification failed. Invalid OTP.');
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

            <div className="auth-card">
                <h1 style={{ marginBottom: '0.5rem' }}>Verify OTP</h1>
                <p className="meta" style={{ marginBottom: '2rem' }}>
                    Enter the code sent to {email}
                </p>

                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label>
                        One-Time Password
                        <input
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength={6}
                            style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2rem' }}
                        />
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn" disabled={loading || !email}>
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
