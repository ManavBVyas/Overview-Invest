import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackgroundTicker from '../components/BackgroundTicker';

export default function Support() {
    const navigate = useNavigate();
    const [type, setType] = useState('complaint');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [myComplaints, setMyComplaints] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (!sessionStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        fetchMyComplaints();
    }, [navigate]);

    const fetchMyComplaints = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/my-complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyComplaints(res.data);
        } catch (err) {
            console.error('Failed to fetch complaints:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            await axios.post('http://localhost:5000/api/complaint', {
                type,
                subject,
                message
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`${type === 'complaint' ? 'Complaint' : 'Suggestion'} submitted successfully!`);
            setSubject('');
            setMessage('');
            fetchMyComplaints();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'reviewed': return '#2962FF';
            case 'resolved': return '#10b981';
            case 'dismissed': return '#64748b';
            default: return '#94a3b8';
        }
    };

    return (
        <div>
            <BackgroundTicker />

            {/* Header */}
            <header className="top-bar" style={{
                position: 'fixed', top: 0, width: '100%', zIndex: 100,
                padding: '1rem 3rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    Overview Invest
                </h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    ← Back to Dashboard
                </button>
            </header>

            {/* Main Content */}
            <div style={{ marginTop: '100px', padding: '2rem 3rem', maxWidth: '1200px', margin: '100px auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    {/* Submit Form */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>Contact Support</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                            Submit a complaint or suggestion about our platform
                        </p>

                        <form onSubmit={handleSubmit}>
                            {/* Type Toggle */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Type</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setType('complaint')}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: type === 'complaint' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                                            border: `2px solid ${type === 'complaint' ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: '10px',
                                            color: type === 'complaint' ? '#ef4444' : '#94a3b8',
                                            cursor: 'pointer',
                                            fontWeight: type === 'complaint' ? 'bold' : 'normal',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        🚨 Complaint
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('suggestion')}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: type === 'suggestion' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                            border: `2px solid ${type === 'suggestion' ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: '10px',
                                            color: type === 'suggestion' ? '#8b5cf6' : '#94a3b8',
                                            cursor: 'pointer',
                                            fontWeight: type === 'suggestion' ? 'bold' : 'normal',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        💡 Suggestion
                                    </button>
                                </div>
                            </div>

                            {/* Subject */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Brief description of your issue"
                                    maxLength={200}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            {/* Message */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Please describe your issue or suggestion in detail..."
                                    maxLength={2000}
                                    rows={6}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '1rem',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
                                    {message.length}/2000
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'linear-gradient(135deg, #2962FF, #8b5cf6)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </form>
                    </div>

                    {/* My Submissions */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>My Submissions</h2>
                            <span style={{
                                background: 'rgba(41, 98, 255, 0.1)',
                                color: '#2962FF',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {myComplaints.length} Total
                            </span>
                        </div>

                        {myComplaints.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
                                <p>No submissions yet</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {myComplaints.map((item) => (
                                    <div key={item._id} style={{
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '10px',
                                        marginBottom: '1rem',
                                        borderLeft: `3px solid ${item.type === 'complaint' ? '#ef4444' : '#8b5cf6'}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 'bold' }}>{item.subject}</span>
                                            <span style={{
                                                background: `${getStatusColor(item.status)}20`,
                                                color: getStatusColor(item.status),
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                textTransform: 'capitalize'
                                            }}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                            {item.message.substring(0, 100)}...
                                        </p>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {formatDate(item.createdAt)}
                                        </div>
                                        {item.adminResponse && (
                                            <div style={{
                                                marginTop: '0.8rem',
                                                padding: '0.8rem',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                borderRadius: '8px',
                                                borderLeft: '3px solid #10b981'
                                            }}>
                                                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                                                    Admin Response:
                                                </div>
                                                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.adminResponse}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
