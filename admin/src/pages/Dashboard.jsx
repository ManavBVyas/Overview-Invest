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
                    axios.get(`${API_URL}/stats`, { headers }),
                    axios.get(`${API_URL}/charts`, { headers })
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

    // Neon Theme Colors - Matches user site
    const THEME = {
        green: '#00FF85',
        red: '#FF4D4D',
        blue: '#4DA6FF',
        purple: '#a78bfa',
        yellow: '#f59e0b',
        text: '#94a3b8',
        grid: 'rgba(255, 255, 255, 0.08)',
        tooltipBg: 'rgba(10, 10, 10, 0.9)',
        tooltipBorder: 'rgba(255, 255, 255, 0.1)'
    };

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
                        <div className="stat-card-icon" style={{ background: 'rgba(77, 166, 255, 0.1)', color: THEME.blue }}>👥</div>
                    </div>
                    <div className="stat-card-value">{stats?.users?.total || 0}</div>
                    <div className="stat-card-change positive" style={{ color: THEME.green }}>
                        +{stats?.users?.newThisWeek || 0} this week
                    </div>
                </div>

                <div className="stat-card green">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Active Users</span>
                        <div className="stat-card-icon" style={{ background: 'rgba(0, 255, 133, 0.1)', color: THEME.green }}>✓</div>
                    </div>
                    <div className="stat-card-value">{stats?.users?.active || 0}</div>
                    <div className="stat-card-change" style={{ color: THEME.text }}>
                        {stats?.users?.suspended || 0} suspended
                    </div>
                </div>

                <div className="stat-card yellow">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Transactions</span>
                        <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: THEME.yellow }}>📈</div>
                    </div>
                    <div className="stat-card-value">{stats?.transactions?.total?.toLocaleString() || 0}</div>
                    <div className="stat-card-change positive" style={{ color: THEME.green }}>
                        +{stats?.transactions?.today || 0} today
                    </div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Trading Volume</span>
                        <div className="stat-card-icon" style={{ background: 'rgba(167, 139, 250, 0.1)', color: THEME.purple }}>💰</div>
                    </div>
                    <div className="stat-card-value">
                        ${(stats?.transactions?.totalVolume / 1000000)?.toFixed(2) || 0}M
                    </div>
                    <div className="stat-card-change positive" style={{ color: THEME.green }}>
                        ${(stats?.transactions?.todayVolume / 1000)?.toFixed(1) || 0}K today
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Platform Balance</span>
                        <div className="stat-card-icon" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>🏦</div>
                    </div>
                    <div className="stat-card-value">
                        ${(stats?.balance?.total / 1000000)?.toFixed(2) || 0}M
                    </div>
                    <div className="stat-card-change" style={{ color: THEME.text }}>
                        Avg: ${stats?.balance?.average?.toFixed(0) || 0}/user
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
                                    <stop offset="5%" stopColor={THEME.blue} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={THEME.blue} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                            <XAxis dataKey="date" stroke={THEME.text} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke={THEME.text} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ background: THEME.tooltipBg, border: `1px solid ${THEME.tooltipBorder}`, borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: THEME.text }}
                            />
                            <Area type="monotone" dataKey="users" stroke={THEME.blue} fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Trading Volume Chart */}
                <div className="chart-card">
                    <h3>💹 Trading Activity (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={transactionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                            <XAxis dataKey="date" stroke={THEME.text} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke={THEME.text} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ background: THEME.tooltipBg, border: `1px solid ${THEME.tooltipBorder}`, borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: THEME.text }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Line type="monotone" dataKey="trades" stroke={THEME.green} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
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
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {tradeTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'BUY' ? THEME.green : THEME.red} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: THEME.tooltipBg, border: `1px solid ${THEME.tooltipBorder}`, borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Traded Stocks */}
                <div className="chart-card">
                    <h3>🏆 Top Traded Stocks</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topStocksData} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} horizontal={false} />
                            <XAxis type="number" stroke={THEME.text} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" stroke={THEME.text} fontSize={12} width={50} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ background: THEME.tooltipBg, border: `1px solid ${THEME.tooltipBorder}`, borderRadius: '8px' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: THEME.text }}
                            />
                            <Bar dataKey="trades" fill={THEME.purple} radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

