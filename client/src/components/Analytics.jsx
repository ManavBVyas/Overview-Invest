import React, { useState, useEffect } from 'react';
import { createChart } from 'lightweight-charts';
import axios from 'axios';
import '../styles/Analytics.css';

export default function Analytics() {
    const [platformStats, setPlatformStats] = useState(null);
    const [userGrowth, setUserGrowth] = useState([]);
    const [tradingActivity, setTradingActivity] = useState([]);
    const [topStocks, setTopStocks] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const [stats, growth, activity, stocks, users] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/analytics/platform-stats', config),
                axios.get('http://localhost:5000/api/admin/analytics/user-growth', config),
                axios.get('http://localhost:5000/api/admin/analytics/trading-activity', config),
                axios.get('http://localhost:5000/api/admin/analytics/top-stocks', config),
                axios.get('http://localhost:5000/api/admin/analytics/active-users', config),
            ]);

            setPlatformStats(stats.data);
            setUserGrowth(growth.data);
            setTradingActivity(activity.data);
            setTopStocks(stocks.data);
            setActiveUsers(users.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setLoading(false);
        }
    };

    // Create user growth chart
    useEffect(() => {
        if (userGrowth.length > 0) {
            const chartContainer = document.getElementById('userGrowthChart');
            if (!chartContainer) return;

            chartContainer.innerHTML = '';
            const chart = createChart(chartContainer, {
                width: chartContainer.clientWidth,
                height: 300,
                layout: { background: { color: '#1a1d29' }, textColor: '#ddd' },
                grid: { vertLines: { color: '#2B2F43' }, horzLines: { color: '#2B2F43' } },
            });

            const lineSeries = chart.addLineSeries({ color: '#22C55E', lineWidth: 2 });

            const data = userGrowth.map(item => ({
                time: new Date(item.date).getTime() / 1000,
                value: parseFloat(item.cumulative_users)
            }));

            lineSeries.setData(data);
            chart.timeScale().fitContent();

            return () => chart.remove();
        }
    }, [userGrowth]);

    // Create trading activity chart
    useEffect(() => {
        if (tradingActivity.length > 0) {
            const chartContainer = document.getElementById('tradingActivityChart');
            if (!chartContainer) return;

            chartContainer.innerHTML = '';
            const chart = createChart(chartContainer, {
                width: chartContainer.clientWidth,
                height: 300,
                layout: { background: { color: '#1a1d29' }, textColor: '#ddd' },
                grid: { vertLines: { color: '#2B2F43' }, horzLines: { color: '#2B2F43' } },
            });

            const buySeries = chart.addHistogramSeries({ color: '#22C55E' });
            const sellSeries = chart.addHistogramSeries({ color: '#EF4444' });

            const buyData = tradingActivity.map(item => ({
                time: new Date(item.date).getTime() / 1000,
                value: parseInt(item.buy_trades)
            }));

            const sellData = tradingActivity.map(item => ({
                time: new Date(item.date).getTime() / 1000,
                value: parseInt(item.sell_trades)
            }));

            buySeries.setData(buyData);
            sellSeries.setData(sellData);
            chart.timeScale().fitContent();

            return () => chart.remove();
        }
    }, [tradingActivity]);

    if (loading) {
        return (
            <div className="analytics-container">
                <div className="loading">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            <h2 className="analytics-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>query_stats</span>
                Platform Analytics
            </h2>

            {/* Platform Stats */}
            {platformStats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><span className="material-symbols-outlined">groups</span></div>
                        <div className="stat-info">
                            <div className="stat-label">Total Users</div>
                            <div className="stat-value">{platformStats.total_users}</div>
                            <div className="stat-subtext">{platformStats.active_users} active</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon"><span className="material-symbols-outlined">payments</span></div>
                        <div className="stat-info">
                            <div className="stat-label">Total Cash</div>
                            <div className="stat-value">${parseFloat(platformStats.total_cash || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div className="stat-subtext">In user accounts</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon"><span className="material-symbols-outlined">show_chart</span></div>
                        <div className="stat-info">
                            <div className="stat-label">Total Trades</div>
                            <div className="stat-value">{platformStats.total_trades}</div>
                            <div className="stat-subtext">All time</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon"><span className="material-symbols-outlined">list_alt</span></div>
                        <div className="stat-info">
                            <div className="stat-label">Listed Stocks</div>
                            <div className="stat-value">{platformStats.total_stocks}</div>
                            <div className="stat-subtext">Available</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>User Growth (Last 30 Days)</h3>
                    <div id="userGrowthChart" className="chart-container"></div>
                </div>

                <div className="chart-card">
                    <h3>Trading Activity (Last 7 Days)</h3>
                    <div id="tradingActivityChart" className="chart-container"></div>
                    <div className="chart-legend">
                        <span className="legend-item"><span className="dot green"></span> Buy Orders</span>
                        <span className="legend-item"><span className="dot red"></span> Sell Orders</span>
                    </div>
                </div>
            </div>

            {/* Top Stocks Table */}
            <div className="table-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#f87171' }}>local_fire_department</span>
                    Top Stocks by Volume (Last 7 Days)
                </h3>
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Name</th>
                            <th>Trades</th>
                            <th>Volume</th>
                            <th>Total Value</th>
                            <th>Current Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topStocks.map((stock, index) => (
                            <tr key={index}>
                                <td><strong>{stock.symbol}</strong></td>
                                <td>{stock.name}</td>
                                <td>{stock.trade_count}</td>
                                <td>{parseInt(stock.total_volume).toLocaleString()}</td>
                                <td>${parseFloat(stock.total_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td>${parseFloat(stock.current_price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Most Active Users */}
            <div className="table-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#fbbf24' }}>star</span>
                    Most Active Traders (Last 7 Days)
                </h3>
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Trades</th>
                            <th>Volume Traded</th>
                            <th>Current Balance</th>
                            <th>Member Since</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeUsers.map((user, index) => (
                            <tr key={index}>
                                <td><strong>{user.username}</strong></td>
                                <td>{user.email}</td>
                                <td>{user.trade_count}</td>
                                <td>${parseFloat(user.total_volume).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td>${parseFloat(user.balance).toFixed(2)}</td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
