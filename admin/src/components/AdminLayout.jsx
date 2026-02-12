import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

export default function AdminLayout({ children }) {
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const res = await axios.get(`${API_URL}/stats`);
                setPendingCount(res.data.complaints?.pending || 0);
            } catch (err) {
                console.error('Failed to fetch stats');
            }
        };
        fetchPendingCount();
    }, []);

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h1>Overview Invest</h1>
                    <span className="admin-badge">ADMIN</span>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Main</div>
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="icon">📊</span>
                            Dashboard
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">Management</div>
                        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="icon">👥</span>
                            User Management
                        </NavLink>
                        <NavLink to="/stocks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="icon">📈</span>
                            Stock Management
                        </NavLink>
                        <NavLink to="/complaints" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="icon">💬</span>
                            Complaints & Suggestions
                            {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
                        </NavLink>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
