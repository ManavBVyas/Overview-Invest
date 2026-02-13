import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

export default function AdminLayout({ children }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        navigate('/login');
    };

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
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <span className="icon">🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
