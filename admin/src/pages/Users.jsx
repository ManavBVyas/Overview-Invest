import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ open: false, action: null, user: null });

    const token = sessionStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 15,
                ...(search && { search }),
                ...(statusFilter !== 'all' && { status: statusFilter })
            });

            const res = await axios.get(`${API_URL}/users?${params}`, { headers });
            setUsers(res.data.users);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchUsers(1);
        }, 300);
        return () => clearTimeout(debounce);
    }, [search, statusFilter]);

    const handleViewUser = async (userId) => {
        try {
            const res = await axios.get(`${API_URL}/users/${userId}`, { headers });
            setSelectedUser(res.data);
            setModalOpen(true);
        } catch (err) {
            console.error('Failed to fetch user details:', err);
        }
    };

    const handleActivate = async (userId) => {
        try {
            await axios.post(`${API_URL}/users/${userId}/activate`, {}, { headers });
            fetchUsers(pagination.page);
            if (modalOpen) setModalOpen(false);
            alert('User activated successfully!');
        } catch (err) {
            alert('Failed to activate user');
        }
    };

    const handleDeactivate = async (userId) => {
        try {
            await axios.post(`${API_URL}/users/${userId}/deactivate`, {}, { headers });
            fetchUsers(pagination.page);
            if (modalOpen) setModalOpen(false);
            alert('User deactivated successfully!');
        } catch (err) {
            alert('Failed to deactivate user');
        }
    };

    const handleDelete = async (userId) => {
        try {
            await axios.delete(`${API_URL}/users/${userId}`, { headers });
            fetchUsers(pagination.page);
            setConfirmModal({ open: false, action: null, user: null });
            if (modalOpen) setModalOpen(false);
            alert('User permanently deleted!');
        } catch (err) {
            alert('Failed to delete user');
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    return (
        <div>
            <div className="page-header">
                <h1>User Management</h1>
                <p>View, activate, deactivate, and delete user accounts</p>
            </div>

            <div className="data-table-container">
                <div className="data-table-header">
                    <h2>All Users ({pagination.total})</h2>
                    <div className="data-table-actions">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by username or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loader">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #2962FF, #8b5cf6)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {user.username?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <span style={{ fontWeight: 500 }}>{user.username}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                                            <td style={{ fontWeight: 500 }}>{formatCurrency(user.balance)}</td>
                                            <td>
                                                <span className={`status-badge ${user.status === 'suspended' ? 'suspended' : 'active'}`}>
                                                    <span className="dot"></span>
                                                    {user.status === 'suspended' ? 'Suspended' : 'Active'}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td>
                                                <div className="action-btn-group">
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => handleViewUser(user._id)}
                                                    >
                                                        View
                                                    </button>
                                                    {user.status === 'suspended' ? (
                                                        <button
                                                            className="action-btn activate"
                                                            onClick={() => handleActivate(user._id)}
                                                        >
                                                            Activate
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="action-btn deactivate"
                                                            onClick={() => handleDeactivate(user._id)}
                                                        >
                                                            Deactivate
                                                        </button>
                                                    )}
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => setConfirmModal({ open: true, action: 'delete', user })}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="pagination">
                            <div className="pagination-info">
                                Showing {((pagination.page - 1) * 15) + 1} to {Math.min(pagination.page * 15, pagination.total)} of {pagination.total} users
                            </div>
                            <div className="pagination-buttons">
                                <button
                                    className="pagination-btn"
                                    disabled={pagination.page === 1}
                                    onClick={() => fetchUsers(pagination.page - 1)}
                                >
                                    Previous
                                </button>
                                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
                                            onClick={() => fetchUsers(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    className="pagination-btn"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => fetchUsers(pagination.page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* User Detail Modal */}
            {modalOpen && selectedUser && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>User Details</h2>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Username</label>
                                    <span>{selectedUser.user.username}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Email</label>
                                    <span>{selectedUser.user.email}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Balance</label>
                                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                                        {formatCurrency(selectedUser.user.balance)}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Status</label>
                                    <span className={`status-badge ${selectedUser.user.status === 'suspended' ? 'suspended' : 'active'}`}>
                                        <span className="dot"></span>
                                        {selectedUser.user.status === 'suspended' ? 'Suspended' : 'Active'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Currency</label>
                                    <span>{selectedUser.user.currency || 'USD'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Joined</label>
                                    <span>{formatDate(selectedUser.user.createdAt)}</span>
                                </div>
                            </div>

                            <h3 style={{ margin: '1.5rem 0 1rem', fontSize: '1rem' }}>Holdings ({selectedUser.user.holdings?.length || 0})</h3>
                            {selectedUser.user.holdings?.length > 0 ? (
                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {selectedUser.user.holdings.map((h, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '0.5rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '6px',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <span style={{ fontWeight: 500 }}>{h.symbol}</span>
                                            <span>{h.quantity} shares @ {formatCurrency(h.avgPrice)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>No holdings</p>
                            )}

                            <h3 style={{ margin: '1.5rem 0 1rem', fontSize: '1rem' }}>Recent Transactions ({selectedUser.transactions?.length || 0})</h3>
                            {selectedUser.transactions?.length > 0 ? (
                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {selectedUser.transactions.slice(0, 5).map((t, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '0.5rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '6px',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <span>
                                                <span style={{ color: t.type === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 500 }}>
                                                    {t.type}
                                                </span>
                                                {' '}{t.quantity}x {t.symbol}
                                            </span>
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {formatCurrency(t.price * t.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>No transactions</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            {selectedUser.user.status === 'suspended' ? (
                                <button className="btn btn-primary" onClick={() => handleActivate(selectedUser.user._id)}>
                                    ✓ Activate User
                                </button>
                            ) : (
                                <button className="action-btn deactivate" style={{ padding: '0.75rem 1.5rem' }} onClick={() => handleDeactivate(selectedUser.user._id)}>
                                    ⏸ Deactivate User
                                </button>
                            )}
                            <button
                                className="action-btn delete"
                                style={{ padding: '0.75rem 1.5rem' }}
                                onClick={() => setConfirmModal({ open: true, action: 'delete', user: selectedUser.user })}
                            >
                                🗑 Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {confirmModal.open && (
                <div className="modal-overlay" onClick={() => setConfirmModal({ open: false, action: null, user: null })}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>⚠️ Confirm Deletion</h2>
                            <button className="modal-close" onClick={() => setConfirmModal({ open: false, action: null, user: null })}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem' }}>
                                Are you sure you want to <strong style={{ color: 'var(--accent-red)' }}>permanently delete</strong> the user:
                            </p>
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                                <p style={{ fontWeight: 600 }}>{confirmModal.user?.username}</p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{confirmModal.user?.email}</p>
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--accent-red)' }}>
                                ⚠️ This action cannot be undone. All user data, transactions, and holdings will be permanently deleted.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setConfirmModal({ open: false, action: null, user: null })}>
                                Cancel
                            </button>
                            <button
                                className="action-btn delete"
                                style={{ padding: '0.75rem 1.5rem' }}
                                onClick={() => handleDelete(confirmModal.user._id)}
                            >
                                Yes, Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

