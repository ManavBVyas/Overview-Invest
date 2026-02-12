import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackgroundTicker from '../components/BackgroundTicker';
import Analytics from '../components/Analytics';

export default function AdminDashboard() {
    const [stocks, setStocks] = useState([]);
    const [users, setUsers] = useState([]);
    const [manipulations, setManipulations] = useState([]);
    const [activeTab, setActiveTab] = useState('analytics'); // analytics, management, users

    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchAllData = async () => {
        try {
            const stocksRes = await axios.get('http://localhost:5000/api/stocks');
            setStocks(stocksRes.data);

            // Fetch Users
            const usersRes = await axios.get('http://localhost:5000/api/admin/users', config);
            setUsers(usersRes.data);

            // Fetch Manipulations
            const manRes = await axios.get('http://localhost:5000/api/admin/manipulations', config);
            setManipulations(manRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAllData();
        const interval = setInterval(fetchAllData, 2000);
        return () => clearInterval(interval);
    }, [navigate]);


    const handleRefresh = async () => {
        try {
            await axios.post('http://localhost:5000/api/admin/refresh', {}, config);
            fetchAllData();
            alert('Prices refreshed!');
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdate = async (id, newPrice) => {
        if (!newPrice) return;
        try {
            await axios.post('http://localhost:5000/api/admin/stock/update', { id, price: newPrice }, config);
            fetchAllData();
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete Stock?')) return;
        try {
            await axios.post('http://localhost:5000/api/admin/stock/delete', { id }, config);
            fetchAllData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleToggleUser = async (userId, currentStatus) => {
        try {
            await axios.post('http://localhost:5000/api/admin/users/toggle', { userId, status: !currentStatus }, config);
            fetchAllData();
        } catch (e) {
            alert('Failed to toggle user');
        }
    };

    const handleManipulate = async (e) => {
        e.preventDefault();
        const symbol = e.target.symbol.value;
        const direction = e.target.direction.value;
        const minutes = e.target.minutes.value;

        try {
            await axios.post('http://localhost:5000/api/admin/manipulate', { symbol, direction, minutes }, config);
            alert('Market Rule Applied');
            fetchAllData();
            e.target.reset();
        } catch (e) {
            alert('Failed to apply rule');
        }
    };

    const handleCancelManipulation = async (id) => {
        try {
            await axios.post('http://localhost:5000/api/admin/manipulation/cancel', { id }, config);
            fetchAllData();
        } catch (e) {
            alert('Failed to cancel');
        }
    };


    const handleAddStock = async (e) => {
        e.preventDefault();
        const symbol = e.target.symbol.value.toUpperCase();
        const name = e.target.name.value;
        const price = e.target.price.value;

        try {
            await axios.post('http://localhost:5000/api/admin/stock/add', { symbol, name, price }, config);
            fetchAllData();
            e.target.reset();
            alert('Stock Added Successfully');
        } catch (err) {
            alert('Failed to add stock');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <BackgroundTicker />

            <div style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1, marginTop: '100px' }}>
                <header className="flex justify-between items-center mb-8">
                    <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <button className="btn" onClick={() => navigate('/dashboard')}>Back to User Site</button>
                        <button className="btn outline" onClick={() => { sessionStorage.clear(); navigate('/login'); }}>Log Out</button>
                    </div>
                </header>

                {/* Tab Navigation */}
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        style={{
                            padding: '1rem 2rem',
                            background: activeTab === 'analytics' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'analytics' ? '2px solid #22C55E' : '2px solid transparent',
                            color: activeTab === 'analytics' ? '#22C55E' : '#888',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'analytics' ? 'bold' : 'normal',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span className="material-symbols-outlined">insights</span>
                        Analytics & Insights
                    </button>
                    <button
                        onClick={() => setActiveTab('management')}
                        style={{
                            padding: '1rem 2rem',
                            background: activeTab === 'management' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'management' ? '2px solid #22C55E' : '2px solid transparent',
                            color: activeTab === 'management' ? '#22C55E' : '#888',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'management' ? 'bold' : 'normal',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span className="material-symbols-outlined">inventory_2</span>
                        Stock Management
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        style={{
                            padding: '1rem 2rem',
                            background: activeTab === 'users' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'users' ? '2px solid #22C55E' : '2px solid transparent',
                            color: activeTab === 'users' ? '#22C55E' : '#888',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'users' ? 'bold' : 'normal',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span className="material-symbols-outlined">groups</span>
                        User Management
                    </button>
                </div>

                {/* Analytics Tab */}
                {activeTab === 'analytics' && <Analytics />}

                {/* Management Tab */}
                {activeTab === 'management' && (

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                        {/* Market Management */}
                        <section className="card" style={{ padding: '2rem', height: 'fit-content' }}>
                            <div className="flex justify-between items-center mb-4">
                                <h3>Market Inventory</h3>
                                <button className="btn" style={{ background: 'var(--accent-green)', color: '#000' }} onClick={handleRefresh}>
                                    Run Automatic Update
                                </button>
                            </div>

                            {/* Add Stock Form */}
                            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <h4 style={{ marginBottom: '1rem', color: '#94a3b8' }}>Add New Stock</h4>
                                <form onSubmit={handleAddStock} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>Symbol</label>
                                        <input name="symbol" placeholder="e.g. TSLA" required style={{ marginTop: 0 }} />
                                    </div>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>Company Name</label>
                                        <input name="name" placeholder="e.g. Tesla Inc." required style={{ marginTop: 0 }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>Price</label>
                                        <input name="price" type="number" step="0.01" placeholder="100.00" required style={{ marginTop: 0 }} />
                                    </div>
                                    <button className="btn" style={{ height: '42px' }}>Add</button>
                                </form>
                            </div>

                            <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ padding: '1rem' }}>Symbol</th>
                                            <th style={{ padding: '1rem' }}>Price</th>
                                            <th style={{ padding: '1rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stocks.map(stock => (
                                            <tr key={stock.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{stock.symbol}</td>
                                                <td style={{ padding: '1rem' }}>${parseFloat(stock.price).toFixed(2)}</td>
                                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            handleUpdate(stock.id, e.target.price.value);
                                                        }}
                                                        style={{ display: 'flex', gap: '0.5rem' }}
                                                    >
                                                        <input
                                                            name="price"
                                                            placeholder="Price"
                                                            step="0.01"
                                                            style={{ width: '80px', padding: '0.4rem', fontSize: '0.9rem' }}
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="btn"
                                                            style={{
                                                                padding: '0.4rem 1rem',
                                                                fontSize: '0.8rem',
                                                                background: '#2962FF',
                                                                border: '1px solid #2962FF',
                                                                color: 'white'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.boxShadow = '0 0 15px rgba(41, 98, 255, 0.6)'}
                                                            onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                                                        >
                                                            Update
                                                        </button>
                                                    </form>
                                                    <button
                                                        className="btn secondary"
                                                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: '#FF4D4D', borderColor: '#FF4D4D' }}
                                                        onClick={() => handleDelete(stock.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Right Column: Manipulation & Users */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* Market Manipulation */}
                            <section className="card" style={{ padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Market Manipulation</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                                    {/* Form */}
                                    <form onSubmit={handleManipulate}>
                                        <label>Target Stock</label>
                                        <select name="symbol" style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', color: 'white' }} required>
                                            {stocks.map(s => <option key={s.id} value={s.symbol}>{s.symbol}</option>)}
                                        </select>

                                        <label>Direction</label>
                                        <select name="direction" style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', color: 'white' }}>
                                            <option value="profit">Force Profit (Pump)</option>
                                            <option value="loss">Force Loss (Dump)</option>
                                        </select>

                                        <label>Duration (Minutes)</label>
                                        <select name="minutes" style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', color: 'white' }}>
                                            <option value="1">1 Minute</option>
                                            <option value="5">5 Minutes</option>
                                            <option value="30">30 Minutes</option>
                                            <option value="60">1 Hour</option>
                                        </select>

                                        <button className="btn" style={{ width: '100%', background: '#f59e0b', color: 'black' }}>Apply Rule</button>
                                    </form>

                                    {/* Active Rules List */}
                                    <div>
                                        <h4>Active Rules</h4>
                                        {manipulations.length === 0 ? <p style={{ color: '#94a3b8' }}>No active rules.</p> : (
                                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                                {manipulations.map(m => (
                                                    <li key={m.id} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <strong>{m.stock_symbol}</strong>
                                                            <span style={{ marginLeft: '10px', color: m.direction === 'profit' ? '#4ade80' : '#ef4444' }}>
                                                                {m.direction.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                            <small>{Math.floor(m.remaining_seconds / 60)}m {Math.floor(m.remaining_seconds % 60)}s</small>
                                                            <button
                                                                onClick={() => handleCancelManipulation(m.id)}
                                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                                                            >✕</button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* User Management */}
                            <section className="card" style={{ padding: '2rem', flex: 1 }}>
                                <h3 style={{ marginBottom: '1rem' }}>User Management</h3>
                                <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <th style={{ padding: '0.5rem' }}>Email</th>
                                                <th style={{ padding: '0.5rem' }}>Role</th>
                                                <th style={{ padding: '0.5rem' }}>Status</th>
                                                <th style={{ padding: '0.5rem' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '0.5rem' }}>{u.email}</td>
                                                    <td style={{ padding: '0.5rem' }}>{u.role}</td>
                                                    <td style={{ padding: '0.5rem', color: u.is_active ? '#4ade80' : '#ef4444' }}>
                                                        {u.is_active ? 'Active' : 'Banned'}
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        {u.role !== 'admin' && (
                                                            <button
                                                                className="btn secondary"
                                                                style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                                                                onClick={() => handleToggleUser(u.id, u.is_active)}
                                                            >
                                                                {u.is_active ? 'Ban' : 'Unban'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>

                    </div>
                )}

                {/* Users Tab - just the user management section */}
                {activeTab === 'users' && (
                    <section className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>User Management</h3>
                        <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '0.5rem' }}>Email</th>
                                        <th style={{ padding: '0.5rem' }}>Role</th>
                                        <th style={{ padding: '0.5rem' }}>Status</th>
                                        <th style={{ padding: '0.5rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '0.5rem' }}>{u.email}</td>
                                            <td style={{ padding: '0.5rem' }}>{u.role}</td>
                                            <td style={{ padding: '0.5rem', color: u.is_active ? '#4ade80' : '#ef4444' }}>
                                                {u.is_active ? 'Active' : 'Banned'}
                                            </td>
                                            <td style={{ padding: '0.5rem' }}>
                                                {u.role !== 'admin' && (
                                                    <button
                                                        className="btn secondary"
                                                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                                                        onClick={() => handleToggleUser(u.id, u.is_active)}
                                                    >
                                                        {u.is_active ? 'Ban' : 'Unban'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
