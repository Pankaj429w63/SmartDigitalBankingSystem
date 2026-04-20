/**
 * TransactionsPage — Paginated transaction list with filters and search
 */
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import TransactionCard from '../components/transactions/TransactionCard';
import TransactionModal from '../components/transactions/TransactionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { transactionService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TYPES = ['', 'credit', 'debit', 'transfer', 'deposit', 'withdrawal', 'payment'];
const CATEGORIES = ['', 'salary', 'food', 'shopping', 'utilities', 'entertainment', 'healthcare', 'education', 'travel', 'investment', 'other'];

const TransactionsPage = () => {
  const { updateUserData, user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: '', search: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filters };
      // Remove empty params — ES6 object spread
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await transactionService.getAll(params);
      if (data.success) {
        setTransactions(data.data.transactions);
        setPagination(data.data.pagination);
      }
    } catch {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(p => ({ ...p, [name]: value }));
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction record?')) return;
    try {
      await transactionService.delete(id);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleTransactionSuccess = (txnData) => {
    setShowModal(false);
    updateUserData({ ...user, balance: txnData.newBalance });
    fetchTransactions();
  };

  const clearFilters = () => {
    setFilters({ type: '', category: '', search: '', startDate: '', endDate: '' });
    setPage(1);
  };

  return (
    <DashboardLayout title="Transactions">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h5 style={{ fontWeight: 700, margin: 0 }}>Transaction History</h5>
          <p style={{ color: '#8892b0', fontSize: '0.85rem', margin: 0 }}>
            {pagination.total || 0} total transactions
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary-custom" id="new-transaction-btn">
          <i className="bi bi-plus-lg me-2"></i>New Transaction
        </button>
      </div>

      {/* FILTERS */}
      <div className="glass-card mb-4">
        <div className="row g-3">
          {/* Search */}
          <div className="col-12 col-md-4">
            <div style={{ position: 'relative' }}>
              <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5568' }}></i>
              <input
                type="text" name="search" value={filters.search} onChange={handleFilterChange}
                placeholder="Search description, reference..."
                className="form-control-custom" style={{ paddingLeft: '2.5rem' }}
                id="transaction-search"
              />
            </div>
          </div>
          {/* Type */}
          <div className="col-6 col-md-2">
            <select name="type" value={filters.type} onChange={handleFilterChange} className="form-control-custom" id="filter-type">
              {TYPES.map(t => <option key={t} value={t} style={{ background: '#141929' }}>{t || 'All Types'}</option>)}
            </select>
          </div>
          {/* Category */}
          <div className="col-6 col-md-2">
            <select name="category" value={filters.category} onChange={handleFilterChange} className="form-control-custom" id="filter-category">
              {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#141929' }}>{c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All Categories'}</option>)}
            </select>
          </div>
          {/* Date Range */}
          <div className="col-6 col-md-2">
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control-custom" id="filter-start-date" />
          </div>
          <div className="col-6 col-md-2">
            <div className="d-flex gap-2">
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control-custom" id="filter-end-date" style={{ flex: 1 }} />
              <button onClick={clearFilters} title="Clear filters" style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#ff6b6b', cursor: 'pointer', flexShrink: 0 }}>
                <i className="bi bi-x-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTION LIST */}
      <div className="glass-card">
        {loading ? (
          <LoadingSpinner text="Loading transactions..." />
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#4a5568', display: 'block', marginBottom: '1rem' }}></i>
            <h6 style={{ color: '#8892b0' }}>No transactions found</h6>
            <p style={{ color: '#4a5568', fontSize: '0.9rem' }}>
              {Object.values(filters).some(Boolean) ? 'Try adjusting your filters' : 'Make your first transaction to get started'}
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary-custom mt-2">
              <i className="bi bi-plus me-2"></i>Add Transaction
            </button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="d-none d-md-flex px-3 mb-2" style={{ fontSize: '0.75rem', color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              <div style={{ width: 44, flexShrink: 0 }}></div>
              <div style={{ flex: 1, marginLeft: '1rem' }}>Description</div>
              <div style={{ width: 120, textAlign: 'right' }}>Amount</div>
              <div style={{ width: 120, textAlign: 'right', marginRight: 60 }}>Reference</div>
            </div>

            {transactions.map(tx => (
              <div key={tx._id} style={{ position: 'relative' }}>
                <TransactionCard transaction={tx} />
                <button
                  onClick={() => handleDelete(tx._id)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, opacity: 0.6 }}
                  onMouseOver={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.opacity = '1'; }}
                  onMouseOut={e => { e.currentTarget.style.color = '#4a5568'; e.currentTarget.style.opacity = '0.6'; }}
                  title="Delete transaction"
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </div>
            ))}

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.85rem', color: '#8892b0' }}>
                  Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
                </span>
                <div className="d-flex gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrevPage}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.4rem 0.8rem', color: pagination.hasPrevPage ? '#f0f4ff' : '#4a5568', cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed' }}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ background: page === p ? 'linear-gradient(135deg,#6c63ff,#00d4aa)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.4rem 0.8rem', color: '#f0f4ff', cursor: 'pointer', minWidth: 36 }}>
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.4rem 0.8rem', color: pagination.hasNextPage ? '#f0f4ff' : '#4a5568', cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed' }}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && <TransactionModal onSuccess={handleTransactionSuccess} onClose={() => setShowModal(false)} />}
    </DashboardLayout>
  );
};

export default TransactionsPage;
