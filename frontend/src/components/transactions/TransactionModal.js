/**
 * TransactionModal — Form to add a new transaction
 */
import React, { useState } from 'react';
import { transactionService } from '../../services/api';
import { toast } from 'react-toastify';

const CATEGORIES = ['salary','food','shopping','utilities','entertainment','healthcare','education','travel','transfer','investment','other'];
const TYPES = [
  { value: 'credit',     label: 'Credit',     icon: 'bi-plus-circle',    color: '#6bcb77' },
  { value: 'debit',      label: 'Debit',      icon: 'bi-dash-circle',    color: '#ff6b6b' },
  { value: 'transfer',   label: 'Transfer',   icon: 'bi-arrow-left-right', color: '#4d96ff' },
  { value: 'deposit',    label: 'Deposit',    icon: 'bi-bank',           color: '#00d4aa' },
  { value: 'withdrawal', label: 'Withdrawal', icon: 'bi-cash-stack',     color: '#ffd93d' },
  { value: 'payment',    label: 'Payment',    icon: 'bi-credit-card',    color: '#f093fb' },
];

const TransactionModal = ({ onSuccess, onClose }) => {
  const [form, setForm] = useState({ type: 'debit', amount: '', description: '', category: 'other', recipientAccount: '', recipientName: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form validation
  const validate = () => {
    const errs = {};
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.description.trim()) errs.description = 'Description is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await transactionService.create(form);
      if (data.success) {
        toast.success('Transaction completed! 🎉');
        onSuccess(data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Transaction failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#141929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', animation: 'fadeInUp 0.3s ease' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, margin: 0 }}>New Transaction</h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8892b0', fontSize: '1.2rem', cursor: 'pointer' }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Transaction Type */}
          <div className="mb-4">
            <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 8, display: 'block' }}>Transaction Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setForm(p => ({ ...p, type: t.value }))}
                  style={{
                    background: form.type === t.value ? `${t.color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${form.type === t.value ? t.color : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 10, padding: '0.6rem 0.4rem', color: form.type === t.value ? t.color : '#8892b0',
                    cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                  }}>
                  <i className={`bi ${t.icon}`} style={{ fontSize: '1.1rem' }}></i>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="mb-3">
            <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Amount (₹)</label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange}
              placeholder="0.00" min="0.01" step="0.01"
              className="form-control-custom" style={{ fontSize: '1.4rem', fontWeight: 700 }} />
            {errors.amount && <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: 4 }}>{errors.amount}</div>}
          </div>

          {/* Description */}
          <div className="mb-3">
            <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Description</label>
            <input type="text" name="description" value={form.description} onChange={handleChange}
              placeholder="e.g. Monthly rent payment" className="form-control-custom" />
            {errors.description && <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: 4 }}>{errors.description}</div>}
          </div>

          {/* Category */}
          <div className="mb-3">
            <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="form-control-custom">
              {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#141929' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          {/* Transfer fields */}
          {['transfer', 'payment'].includes(form.type) && (
            <>
              <div className="mb-3">
                <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Recipient Account No.</label>
                <input type="text" name="recipientAccount" value={form.recipientAccount} onChange={handleChange}
                  placeholder="12-digit account number" className="form-control-custom" />
              </div>
              <div className="mb-3">
                <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Recipient Name</label>
                <input type="text" name="recipientName" value={form.recipientName} onChange={handleChange}
                  placeholder="Full name" className="form-control-custom" />
              </div>
            </>
          )}

          {/* Notes */}
          <div className="mb-4">
            <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              placeholder="Any additional notes..." className="form-control-custom" style={{ resize: 'none' }} />
          </div>

          <div className="d-flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline-custom flex-grow-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary-custom flex-grow-1" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? <><i className="bi bi-arrow-repeat me-2" style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}></i>Processing...</> : 'Confirm Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
