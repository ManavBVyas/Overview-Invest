import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackgroundTicker from '../components/BackgroundTicker';

export default function Settings() {
    const navigate = useNavigate();
    const [userData] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');

    const [settings, setSettings] = useState({
        notifications: true,
        two_factor: false,
        language: 'English',
        currency: 'USD'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5000/api/user/portfolio', config);
                setSettings({
                    notifications: !!res.data.notifications,
                    two_factor: !!res.data.two_factor,
                    language: res.data.language || 'English',
                    currency: res.data.currency || 'USD'
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching settings", err);
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings) => {
        setSettings(newSettings);
        try {
            const token = sessionStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/user/settings', newSettings, config);
            setSaveStatus('Saved!');
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSetting = (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        updateSettings(newSettings);
    };

    return (
        <div style={{ color: 'white', minHeight: '100vh', paddingBottom: '50px' }}>
            <BackgroundTicker />

            {/* Header with Blur */}
            <header style={{
                position: 'fixed', top: 0, width: '100%', zIndex: 100,
                padding: '1rem 3rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Settings</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {saveStatus && <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 'bold' }}>{saveStatus}</span>}
                    <span style={{ color: '#94a3b8' }}>{userData.email}</span>
                </div>
            </header>

            <div style={{ marginTop: '120px', padding: '0 3rem', maxWidth: '800px', margin: '120px auto 0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Preferences Section */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="material-symbols-outlined" style={{ color: '#38bdf8' }}>style</span>
                            App Preferences
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>Push Notifications</h4>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Receive alerts about trade completions and market shifts.</p>
                                </div>
                                <button
                                    onClick={() => toggleSetting('notifications')}
                                    style={{
                                        width: '50px', height: '26px', borderRadius: '13px', position: 'relative', cursor: 'pointer',
                                        background: settings.notifications ? '#38bdf8' : '#334155', border: 'none', transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                        position: 'absolute', top: '3px', left: settings.notifications ? '27px' : '3px',
                                        transition: 'all 0.3s'
                                    }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>Language</h4>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Select your preferred interface language.</p>
                                </div>
                                <select
                                    value={settings.language}
                                    onChange={(e) => updateSettings({ ...settings, language: e.target.value })}
                                    style={{ background: '#1e293b', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 15px', borderRadius: '6px' }}
                                >
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                    <option>German</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>Base Currency</h4>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Prices will be converted to this currency.</p>
                                </div>
                                <select
                                    value={settings.currency}
                                    onChange={(e) => updateSettings({ ...settings, currency: e.target.value })}
                                    style={{ background: '#1e293b', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 15px', borderRadius: '6px' }}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="INR">INR (₹)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="material-symbols-outlined" style={{ color: '#f87171' }}>security</span>
                            Security & Privacy
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>Two-Factor Authentication</h4>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Add an extra layer of security to your account.</p>
                                </div>
                                <button
                                    onClick={() => toggleSetting('two_factor')}
                                    style={{
                                        width: '50px', height: '26px', borderRadius: '13px', position: 'relative', cursor: 'pointer',
                                        background: settings.two_factor ? '#38bdf8' : '#334155', border: 'none', transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                        position: 'absolute', top: '3px', left: settings.two_factor ? '27px' : '3px',
                                        transition: 'all 0.3s'
                                    }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>Password</h4>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Last changed 3 months ago.</p>
                                </div>
                                <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer' }}>
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Support & Legal */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Support</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <a href="#" style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>help</span>
                                Help Center
                            </a>
                            <a href="#" style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>description</span>
                                Terms & Conditions
                            </a>
                            <a href="#" style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>privacy_tip</span>
                                Privacy Policy
                            </a>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            sessionStorage.clear();
                            navigate('/login');
                        }}
                        style={{
                            padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(248, 113, 113, 0.2)',
                            background: 'rgba(248, 113, 113, 0.05)', color: '#f87171', fontWeight: 'bold', cursor: 'pointer',
                            fontSize: '1rem', marginTop: '1rem'
                        }}
                    >
                        Sign Out of Session
                    </button>

                </div>
            </div>
        </div>
    );
}
