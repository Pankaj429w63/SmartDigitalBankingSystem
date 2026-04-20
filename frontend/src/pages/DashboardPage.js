/**
 * DashboardPage — Main dashboard with stats, charts, and recent transactions
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import DashboardLayout from '../components/layout/DashboardLayout';
import TransactionCard from '../components/transactions/TransactionCard';
import TransactionModal from '../components/transactions/TransactionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { transactionService } from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#8892b0', font: { size: 12 } } } },
  scales: {
    x: { ticks: { color: '#8892b0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#8892b0' }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const StatCard = ({ icon, label, value, color, bg, change }) => (
  <div className="stat-card animate-fade-up">
    <div className="stat-icon" style={{ background: bg, color }}>
      <i className={`bi ${icon}`}></i>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {change !== undefined && (
      <div style={{ marginTop: 8, fontSize: '0.8rem', color: change >= 0 ? '#6bcb77' : '#ff6b6b' }}>
        <i className={`bi ${change >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i> {Math.abs(change)}% this month
      </div>
    )}
  </div>
);

const DashboardPage = () => {
  const { user, updateUserData } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await transactionService.getDashboardStats();
      if (data.success) setStats(data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleTransactionSuccess = (txnData) => {
    setShowModal(false);
    updateUserData({ ...user, balance: txnData.newBalance });
    fetchStats();
  };

  // Build chart data from API
  const monthlyChartData = {
    labels: stats?.monthlySpending?.map(m => MONTH_NAMES[(m._id.month - 1)]) || [],
    datasets: [{
      label: 'Monthly Spending (₹)',
      data: stats?.monthlySpending?.map(m => m.totalSpent) || [],
      backgroundColor: 'rgba(108,99,255,0.6)',
      borderColor: '#6c63ff',
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const categoryColors = ['#6c63ff','#00d4aa','#f093fb','#ffd93d','#ff6b6b','#4d96ff','#6bcb77'];
  const categoryChartData = {
    labels: stats?.categoryBreakdown?.map(c => c._id.charAt(0).toUpperCase() + c._id.slice(1)) || [],
    datasets: [{
      data: stats?.categoryBreakdown?.map(c => c.totalAmount) || [],
      backgroundColor: categoryColors.slice(0, stats?.categoryBreakdown?.length || 0).map(c => `${c}cc`),
      borderColor: categoryColors.slice(0, stats?.categoryBreakdown?.length || 0),
      borderWidth: 1,
    }]
  };

  // Line chart — balance trend
  const lineData = {
    labels: stats?.monthlySpending?.map(m => MONTH_NAMES[(m._id.month - 1)]) || ['Jan'],
    datasets: [{
      label: 'Spending Trend',
      data: stats?.monthlySpending?.map(m => m.totalSpent) || [0],
      borderColor: '#00d4aa',
      backgroundColor: 'rgba(0,212,170,0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00d4aa',
    }]
  };

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <LoadingSpinner text="Loading your dashboard..." />
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Dashboard">
      {/* STAT CARDS */}
      <div className="dashboard-grid mb-4">
        <StatCard
          icon="bi-wallet2" label="Total Balance" color="#6c63ff" bg="rgba(108,99,255,0.15)"
          value={`₹${(stats?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
        />
        <StatCard
          icon="bi-arrow-down-circle" label="Total Income" color="#6bcb77" bg="rgba(107,203,119,0.15)"
          value={`₹${(stats?.totalIncome || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          change={8.2}
        />
        <StatCard
          icon="bi-arrow-up-circle" label="Total Expenses" color="#ff6b6b" bg="rgba(255,107,107,0.15)"
          value={`₹${(stats?.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          change={-3.1}
        />
        <StatCard
          icon="bi-piggy-bank" label="Savings Rate" color="#00d4aa" bg="rgba(0,212,170,0.15)"
          value={`${stats?.savingsRate || 0}%`}
          change={2.4}
        />
      </div>

      {/* BALANCE CARD + QUICK ACTIONS */}
      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="balance-card h-100">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 4 }}>Available Balance</div>
              <div className="balance-amount">
                ₹{(stats?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                {user?.currency || 'INR'} • {user?.accountType} Account
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: 4 }}>Account Number</div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.1rem', letterSpacing: 2, fontWeight: 600 }}>
                {user?.accountNumber?.replace(/(\d{4})/g, '$1 ').trim()}
              </div>
              <div className="d-flex gap-3 mt-4">
                <button onClick={() => setShowModal(true)} className="btn-primary-custom" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', fontSize: '0.9rem', padding: '0.6rem 1.2rem' }}>
                  <i className="bi bi-plus-circle me-2"></i>New Transaction
                </button>
                <Link to="/transactions" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 50, padding: '0.6rem 1.2rem', color: '#fff', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  <i className="bi bi-list-ul me-2"></i>History
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="col-lg-7">
          <div className="glass-card h-100">
            <h6 style={{ fontWeight: 700, marginBottom: '1.5rem', color: '#f0f4ff' }}>Quick Actions</h6>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { icon: 'bi-send', label: 'Send Money',   color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
                { icon: 'bi-download', label: 'Deposit',  color: '#00d4aa', bg: 'rgba(0,212,170,0.15)'  },
                { icon: 'bi-cash',     label: 'Withdraw', color: '#ffd93d', bg: 'rgba(255,217,61,0.15)' },
                { icon: 'bi-credit-card', label: 'Pay Bills', color: '#f093fb', bg: 'rgba(240,147,251,0.15)' },
                { icon: 'bi-graph-up', label: 'Invest',   color: '#6bcb77', bg: 'rgba(107,203,119,0.15)' },
                { icon: 'bi-qr-code',  label: 'Scan QR',  color: '#4d96ff', bg: 'rgba(77,150,255,0.15)'  },
              ].map((a, i) => (
                <button key={i} onClick={() => setShowModal(true)} style={{ background: a.bg, border: `1px solid ${a.color}30`, borderRadius: 14, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s', color: a.color }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${a.color}30`; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <i className={`bi ${a.icon}`} style={{ fontSize: '1.4rem' }}></i>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="glass-card" style={{ height: 300 }}>
            <h6 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Monthly Spending</h6>
            {stats?.monthlySpending?.length > 0
              ? <Bar data={monthlyChartData} options={{ ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins, legend: { display: false } } }} height={220} />
              : <div className="d-flex align-items-center justify-content-center h-75" style={{ color: '#8892b0' }}><i className="bi bi-bar-chart me-2"></i>No spending data yet</div>
            }
          </div>
        </div>
        <div className="col-lg-4">
          <div className="glass-card" style={{ height: 300 }}>
            <h6 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>By Category</h6>
            {stats?.categoryBreakdown?.length > 0
              ? <Doughnut data={categoryChartData} options={{ ...CHART_OPTS, scales: undefined, cutout: '65%' }} />
              : <div className="d-flex align-items-center justify-content-center h-75" style={{ color: '#8892b0' }}><i className="bi bi-pie-chart me-2"></i>No data yet</div>
            }
          </div>
        </div>
      </div>

      {/* Trend Line Chart */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="glass-card" style={{ height: 220 }}>
            <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Spending Trend (6 months)</h6>
            <Line data={lineData} options={{ ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins, legend: { display: false } } }} height={150} />
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="glass-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 style={{ fontWeight: 700, margin: 0 }}>Recent Transactions</h6>
          <Link to="/transactions" style={{ fontSize: '0.85rem', color: '#6c63ff' }}>View all <i className="bi bi-arrow-right"></i></Link>
        </div>
        {stats?.recentTransactions?.length > 0
          ? stats.recentTransactions.map(tx => <TransactionCard key={tx._id} transaction={tx} />)
          : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>
              <i className="bi bi-inbox" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.4 }}></i>
              <p>No transactions yet. Make your first transaction!</p>
              <button onClick={() => setShowModal(true)} className="btn-primary-custom">
                <i className="bi bi-plus me-2"></i>New Transaction
              </button>
            </div>
          )
        }
      </div>

      {/* Transaction Modal */}
      {showModal && <TransactionModal onSuccess={handleTransactionSuccess} onClose={() => setShowModal(false)} />}
    </DashboardLayout>
  );
};

export default DashboardPage;
