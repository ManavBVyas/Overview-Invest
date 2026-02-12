import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API_URL = 'http://localhost:5000/api/admin';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [charts, setCharts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('adminToken');
                const headers = { Authorization: `Bearer ${token}` };

                const [statsRes, chartsRes] = await Promise.all([
                    axios.get(`${API_URL}/stats`, {}),
                    axios.get(`${API_URL}/charts`, {})
                ]);

                setStats(statsRes.data);
                setCharts(chartsRes.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loader">
                <div className="spinner"></div>
            </div>
        );
    }

    const COLORS = ['#2962FF', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    // Format chart data
    const userRegistrationData = charts?.userRegistrations?.map(item => ({
        date: item._id.substring(5), // MM-DD format
        users: item.count
    })) || [];

    const transactionData = charts?.transactionsByDay?.map(item => ({
        date: item._id.substring(5),
        trades: item.count,
        volume: Math.round(item.volume)
    })) || [];

    const tradeTypeData = charts?.tradeTypes?.map(item => ({
        name: item._id?.toUpperCase() || 'Unknown',
        value: item.count
    })) || [];

    const topStocksData = charts?.topStocks?.slice(0, 6).map(item => ({
        name: item._id,
        trades: item.trades,
        volume: Math.round(item.volume)
    })) || [];

    return (
        <div>
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Welcome to the Overview Invest Admin Panel</p>
            </div>

            {/* Stats Cards */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Users</span>
                        <div className="stat-card-icon">👥</div>
                    </div>
                    <div className="stat-card-value">{stats?.users?.total || 0}</div>
                    <div className="stat-card-change positive">
                        +{stats?.users?.newThisWeek || 0} this week
                    </div>
                </div>

                <div className="stat-card green">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Active Users</span>
                        <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>✓</div>
                    </div>
                    <div className="stat-card-value">{stats?.users?.active || 0}</div>
                    <div className="stat-card-change">
                        {stats?.users?.suspended || 0} suspended
                    </div>
                </div>

                <div className="stat-card yellow">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Transactions</span>
                        <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>📈</div>
                    </div>
                    <div className="stat-card-value">{stats?.transactions?.total?.toLocaleString() || 0}</div>
                    <div className="stat-card-change positive">
                        +{stats?.transactions?.today || 0} today
                    </div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Trading Volume</span>
                        <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>💰</div>
                    </div>
                    <div className="stat-card-value">
                        ${(stats?.transactions?.totalVolume / 1000000)?.toFixed(2) || 0}M
                    </div>
                    <div className="stat-card-change positive">
                        ${(stats?.transactions?.todayVolume / 1000)?.toFixed(1) || 0}K today
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Platform Balance</span>
                        <div className="stat-card-icon">🏦</div>
                    </div>
                    <div className="stat-card-value">
                        ${(stats?.balance?.total / 1000000)?.toFixed(2) || 0}M
                    </div>
                    <div className="stat-card-change">
                        Avg: ${stats?.balance?.average?.toFixed(0) || 0}/user
                    </div>
                </div>

                <div className="stat-card red">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Pending Complaints</span>
                        <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>⚠️</div>
                    </div>
                    <div className="stat-card-value">{stats?.complaints?.pending || 0}</div>
                    <div className="stat-card-change">
                        {stats?.complaints?.total || 0} total | {stats?.complaints?.suggestions || 0} suggestions
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="chart-grid">
                {/* User Registrations Chart */}
                <div className="chart-card">
                    <h3>📈 User Registrations (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={userRegistrationData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2962FF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2962FF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                labelStyle={{ color: '#f1f5f9' }}
                            />
                            <Area type="monotone" dataKey="users" stroke="#2962FF" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Trading Volume Chart */}
                <div className="chart-card">
                    <h3>💹 Trading Activity (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={transactionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                labelStyle={{ color: '#f1f5f9' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="trades" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Buy vs Sell Pie Chart */}
                <div className="chart-card">
                    <h3>📊 Trade Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={tradeTypeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {tradeTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Traded Stocks */}
                <div className="chart-card">
                    <h3>🏆 Top Traded Stocks</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topStocksData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis type="number" stroke="#64748b" fontSize={12} />
                            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={60} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                labelStyle={{ color: '#f1f5f9' }}
                            />
                            <Bar dataKey="trades" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

