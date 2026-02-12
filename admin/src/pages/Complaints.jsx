import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

export default function Complaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [adminResponse, setAdminResponse] = useState('');
    const [newStatus, setNewStatus] = useState('');

    const token = sessionStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchComplaints = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 15,
                ...(typeFilter !== 'all' && { type: typeFilter }),
                ...(statusFilter !== 'all' && { status: statusFilter })
            });

            const res = await axios.get(`${API_URL}/complaints?${params}`, {});
            setComplaints(res.data.complaints);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('Failed to fetch complaints:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints(1);
    }, [typeFilter, statusFilter]);

    const handleViewComplaint = async (complaintId) => {
        try {
            const res = await axios.get(`${API_URL}/complaints/${complaintId}`, {});
            setSelectedComplaint(res.data);
            setAdminResponse(res.data.adminResponse || '');
            setNewStatus(res.data.status);
            setModalOpen(true);
        } catch (err) {
            console.error('Failed to fetch complaint details:', err);
        }
    };

    const handleUpdateComplaint = async () => {
        try {
            await axios.patch(
                `${API_URL}/complaints/${selectedComplaint._id}`,
                { status: newStatus, adminResponse },
                {}
            );
            fetchComplaints(pagination.page);
            setModalOpen(false);
            alert('Complaint updated successfully!');
        } catch (err) {
            alert('Failed to update complaint');
        }
    };

    const handleDeleteComplaint = async (complaintId) => {
        if (!confirm('Are you sure you want to delete this complaint?')) return;

        try {
            await axios.delete(`${API_URL}/complaints/${complaintId}`, {});
            fetchComplaints(pagination.page);
            if (modalOpen) setModalOpen(false);
            alert('Complaint deleted!');
        } catch (err) {
            alert('Failed to delete complaint');
        }
    };

    const handleQuickStatus = async (complaintId, status) => {
        try {
            await axios.patch(
                `${API_URL}/complaints/${complaintId}`,
                { status },
                {}
            );
            fetchComplaints(pagination.page);
        } catch (err) {
            alert('Failed to update status');
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
            case 'pending': return 'pending';
            case 'reviewed': return 'reviewed';
            case 'resolved': return 'resolved';
            case 'dismissed': return 'dismissed';
            default: return '';
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Complaints & Suggestions</h1>
                <p>View and respond to user feedback</p>
            </div>

            {/* Stats Row */}
            <div className="stat-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card red" onClick={() => { setTypeFilter('complaint'); setStatusFilter('pending'); }} style={{ cursor: 'pointer' }}>
                    <div className="stat-card-header">
                        <span className="stat-card-title">Pending Complaints</span>
                        <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>⚠️</div>
                    </div>
                    <div className="stat-card-value">
                        {complaints.filter(c => c.type === 'complaint' && c.status === 'pending').length}
                    </div>
                </div>
                <div className="stat-card purple" onClick={() => { setTypeFilter('suggestion'); setStatusFilter('all'); }} style={{ cursor: 'pointer' }}>
                    <div className="stat-card-header">
                        <span className="stat-card-title">Suggestions</span>
                        <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>💡</div>
                    </div>
                    <div className="stat-card-value">
                        {complaints.filter(c => c.type === 'suggestion').length}
                    </div>
                </div>
                <div className="stat-card green" onClick={() => { setTypeFilter('all'); setStatusFilter('resolved'); }} style={{ cursor: 'pointer' }}>
                    <div className="stat-card-header">
                        <span className="stat-card-title">Resolved</span>
                        <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>✓</div>
                    </div>
                    <div className="stat-card-value">
                        {complaints.filter(c => c.status === 'resolved').length}
                    </div>
                </div>
            </div>

            <div className="data-table-container">
                <div className="data-table-header">
                    <h2>All Feedback ({pagination.total})</h2>
                    <div className="data-table-actions">
                        <select
                            className="filter-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="complaint">Complaints</option>
                            <option value="suggestion">Suggestions</option>
                        </select>
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
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
                                    <th>Type</th>
                                    <th>User</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                            No complaints or suggestions found
                                        </td>
                                    </tr>
                                ) : (
                                    complaints.map(complaint => (
                                        <tr key={complaint._id}>
                                            <td>
                                                <span className={`type-badge ${complaint.type}`}>
                                                    {complaint.type === 'complaint' ? '🚨 Complaint' : '💡 Suggestion'}
                                                </span>
                                            </td>
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{complaint.userId?.username || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {complaint.userId?.email || ''}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ maxWidth: '250px' }}>
                                                    <div style={{ fontWeight: 500 }}>{complaint.subject}</div>
                                                    <div style={{
                                                        fontSize: '0.8rem',
                                                        color: 'var(--text-muted)',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {complaint.message.substring(0, 60)}...
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusColor(complaint.status)}`}>
                                                    <span className="dot"></span>
                                                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>
                                                {formatDate(complaint.createdAt)}
                                            </td>
                                            <td>
                                                <div className="action-btn-group">
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => handleViewComplaint(complaint._id)}
                                                    >
                                                        View
                                                    </button>
                                                    {complaint.status === 'pending' && (
                                                        <button
                                                            className="action-btn activate"
                                                            onClick={() => handleQuickStatus(complaint._id, 'reviewed')}
                                                        >
                                                            Mark Reviewed
                                                        </button>
                                                    )}
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeleteComplaint(complaint._id)}
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
                                Showing {((pagination.page - 1) * 15) + 1} to {Math.min(pagination.page * 15, pagination.total)} of {pagination.total}
                            </div>
                            <div className="pagination-buttons">
                                <button
                                    className="pagination-btn"
                                    disabled={pagination.page === 1}
                                    onClick={() => fetchComplaints(pagination.page - 1)}
                                >
                                    Previous
                                </button>
                                <button
                                    className="pagination-btn"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => fetchComplaints(pagination.page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Complaint Detail Modal */}
            {modalOpen && selectedComplaint && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>
                                {selectedComplaint.type === 'complaint' ? '🚨 Complaint' : '💡 Suggestion'} Details
                            </h2>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>From User</label>
                                    <span>{selectedComplaint.userId?.username || 'Unknown'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Email</label>
                                    <span>{selectedComplaint.userId?.email || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Current Status</label>
                                    <span className={`status-badge ${getStatusColor(selectedComplaint.status)}`}>
                                        <span className="dot"></span>
                                        {selectedComplaint.status.charAt(0).toUpperCase() + selectedComplaint.status.slice(1)}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Submitted</label>
                                    <span>{formatDate(selectedComplaint.createdAt)}</span>
                                </div>
                                <div className="detail-item full">
                                    <label>Subject</label>
                                    <span style={{ fontWeight: 600 }}>{selectedComplaint.subject}</span>
                                </div>
                                <div className="detail-item full">
                                    <label>Message</label>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        marginTop: '0.5rem',
                                        lineHeight: '1.6',
                                        maxHeight: '150px',
                                        overflowY: 'auto'
                                    }}>
                                        {selectedComplaint.message}
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ margin: '1.5rem 0 1rem', fontSize: '1rem' }}>Admin Response</h3>
                            <div className="form-group">
                                <label>Update Status</label>
                                <select
                                    className="filter-select"
                                    style={{ width: '100%', marginTop: '0.5rem' }}
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="dismissed">Dismissed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Response / Notes</label>
                                <textarea
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        padding: '0.8rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        marginTop: '0.5rem',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                    placeholder="Add your response or internal notes..."
                                    value={adminResponse}
                                    onChange={(e) => setAdminResponse(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleUpdateComplaint}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

