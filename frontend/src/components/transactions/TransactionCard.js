/**
 * TransactionCard — Single transaction row component
 */
import React from 'react';

const TYPE_CONFIG = {
  credit:     { icon: 'bi-arrow-down-circle-fill', color: '#6bcb77', bg: 'rgba(107,203,119,0.12)', sign: '+' },
  deposit:    { icon: 'bi-bank',                   color: '#00d4aa', bg: 'rgba(0,212,170,0.12)',   sign: '+' },
  debit:      { icon: 'bi-arrow-up-circle-fill',   color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)', sign: '-' },
  withdrawal: { icon: 'bi-cash-stack',              color: '#ffd93d', bg: 'rgba(255,217,61,0.12)',  sign: '-' },
  transfer:   { icon: 'bi-arrow-left-right',       color: '#4d96ff', bg: 'rgba(77,150,255,0.12)',  sign: '-' },
  payment:    { icon: 'bi-credit-card-fill',       color: '#f093fb', bg: 'rgba(240,147,251,0.12)', sign: '-' },
};

const RISK_BADGE = {
  Low: { bg: 'rgba(110,231,183,0.15)', color: '#10b981' },
  Medium: { bg: 'rgba(251,191,36,0.12)', color: '#d97706' },
  High: { bg: 'rgba(248,113,113,0.15)', color: '#dc2626' },
  Unknown: { bg: 'rgba(148,163,184,0.12)', color: '#475569' }
};

const TransactionCard = ({ transaction }) => {
  const cfg = TYPE_CONFIG[transaction.type] || TYPE_CONFIG.debit;
  const isPositive = ['+'].includes(cfg.sign);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="transaction-row">
      {/* Icon */}
      <div className="transaction-icon" style={{ background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
        <i className={`bi ${cfg.icon}`}></i>
      </div>

      {/* Details */}
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#f0f4ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {transaction.description}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#8892b0', marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span className={`transaction-badge badge-${transaction.type === 'credit' || transaction.type === 'deposit' ? 'credit' : transaction.type === 'transfer' ? 'transfer' : 'debit'}`}>
            {transaction.type}
          </span>
          <span>{transaction.category}</span>
          {transaction.aiRiskLabel && (
            <span style={{ background: RISK_BADGE[transaction.aiRiskLabel]?.bg || RISK_BADGE.Unknown.bg, color: RISK_BADGE[transaction.aiRiskLabel]?.color || RISK_BADGE.Unknown.color, borderRadius: 999, padding: '0.18rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.3 }}>
              AI Risk: {transaction.aiRiskLabel}
            </span>
          )}
        </div>
      </div>

      {/* Amount + Date */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 700, color: cfg.color, fontSize: '1rem' }}>
          {cfg.sign}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#8892b0', marginTop: 2 }}>
          {formatDate(transaction.transactionDate || transaction.createdAt)}
        </div>
      </div>

      {/* Ref number */}
      <div className="d-none d-md-block" style={{ fontSize: '0.7rem', color: '#4a5568', flexShrink: 0, minWidth: 120, textAlign: 'right' }}>
        {transaction.referenceNumber}
      </div>
    </div>
  );
};

export default TransactionCard;
