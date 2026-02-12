import { useState, useEffect } from 'react';
import axios from 'axios';

const ADMIN_API_URL = 'http://localhost:5000/api/admin';
const PUBLIC_API_URL = 'http://localhost:5000/api';

export default function Stocks() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modals
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Form Data
    const [selectedStock, setSelectedStock] = useState(null);
    const [formData, setFormData] = useState({ symbol: '', name: '', price: '' });

    const token = sessionStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchStocks = async () => {
        setLoading(true);
        try {
            // Using public API for list as it's optimized
            const res = await axios.get(`${PUBLIC_API_URL}/stocks`);
            setStocks(res.data);
        } catch (err) {
            console.error('Failed to fetch stocks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    const filteredStocks = stocks.filter(s =>
        s.symbol.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${ADMIN_API_URL}/stock/add`, {
                symbol: formData.symbol.toUpperCase(),
                name: formData.name,
                price: Number(formData.price)
            }, { headers });

            setAddModalOpen(false);
            setFormData({ symbol: '', name: '', price: '' });
            fetchStocks();
            alert('Stock added successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add stock');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${ADMIN_API_URL}/stock/update`, {
                id: selectedStock._id,
                price: Number(formData.price)
            }, { headers });

            setEditModalOpen(false);
            fetchStocks();
            alert('Stock updated successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update stock');
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            await axios.post(`${ADMIN_API_URL}/stock/delete`, {
                id: selectedStock._id
            }, { headers });

            setDeleteModalOpen(false);
            fetchStocks();
            alert('Stock deleted successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete stock');
        }
    };

    const openEditModal = (stock) => {
        setSelectedStock(stock);
        setFormData({ symbol: stock.symbol, name: stock.name, price: stock.price });
        setEditModalOpen(true);
    };

    const openDeleteModal = (stock) => {
        setSelectedStock(stock);
        setDeleteModalOpen(true);
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Stock Management</h1>
                        <p>Manage market listings, update prices manually, or delist stocks</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
                        + Add New Stock
                    </button>
                </div>
            </div>

            <div className="data-table-container">
                <div className="data-table-header">
                    <h2>Market Inventory ({filteredStocks.length})</h2>
                    <div className="data-table-actions">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search symbol or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loader"><div className="spinner"></div></div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Name</th>
                                <th>Current Price</th>
                                <th>Sector</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStocks.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No stocks found</td></tr>
                            ) : (
                                filteredStocks.map(stock => (
                                    <tr key={stock._id}>
                                        <td>
                                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {stock.symbol}
                                            </span>
                                        </td>
                                        <td>{stock.name}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>
                                            {formatCurrency(stock.price)}
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.8rem',
                                                background: 'rgba(255,255,255,0.1)',
                                                padding: '2px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                {stock.sector || 'N/A'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {stock.last_updated ? new Date(stock.last_updated).toLocaleString() : 'N/A'}
                                        </td>
                                        <td>
                                            <div className="action-btn-group">
                                                <button className="action-btn view" onClick={() => openEditModal(stock)}>
                                                    Edit
                                                </button>
                                                <button className="action-btn delete" onClick={() => openDeleteModal(stock)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {addModalOpen && (
                <div className="modal-overlay" onClick={() => setAddModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Stock</h2>
                            <button className="modal-close" onClick={() => setAddModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddSubmit}>
                            <div className="modal-body">
                                <div className="detail-item">
                                    <label>Symbol (e.g. AAPL)</label>
                                    <input
                                        type="text"
                                        required
                                        className="search-input"
                                        style={{ width: '100%' }}
                                        value={formData.symbol}
                                        onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                                    />
                                </div>
                                <div className="detail-item">
                                    <label>Company Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="search-input"
                                        style={{ width: '100%' }}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="detail-item">
                                    <label>Initial Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="search-input"
                                        style={{ width: '100%' }}
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setAddModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Stock</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && (
                <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Stock: {selectedStock?.symbol}</h2>
                            <button className="modal-close" onClick={() => setEditModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                    Currently, you can only manually update the price. Metadata editing coming soon.
                                </p>
                                <div className="detail-item">
                                    <label>New Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="search-input"
                                        style={{ width: '100%' }}
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Update Price</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModalOpen && (
                <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>⚠️ Confirm Deletion</h2>
                            <button className="modal-close" onClick={() => setDeleteModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to permanently delete <strong>{selectedStock?.name} ({selectedStock?.symbol})</strong>?</p>
                            <p style={{ marginTop: '0.5rem', color: 'var(--accent-red)', fontSize: '0.9rem' }}>
                                This will remove it from all user portfolios and market listings.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                            <button className="action-btn delete" onClick={handleDeleteSubmit}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
