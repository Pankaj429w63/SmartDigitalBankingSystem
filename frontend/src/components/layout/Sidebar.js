/**
 * Sidebar Component — Fixed left sidebar for authenticated dashboard pages
 */
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard',     icon: 'bi-grid-1x2-fill',    label: 'Dashboard'     },
  { path: '/transactions',  icon: 'bi-arrow-left-right', label: 'Transactions'  },
  { path: '/tools',         icon: 'bi-tools',            label: 'Tools'         },
  { path: '/profile',       icon: 'bi-person-circle',    label: 'Profile'       },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div
      className="sidebar d-none d-lg-flex flex-column"
      style={{ width: collapsed ? 72 : 260, transition: 'width 0.3s ease' }}
    >
      {/* Logo */}
      <div className="d-flex align-items-center gap-2 mb-4 px-2">
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
        }}>
          <i className="bi bi-bank2" style={{ color: '#fff' }}></i>
        </div>
        {!collapsed && (
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SmartBank
          </span>
        )}
        <button
          onClick={() => setCollapsed(p => !p)}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#8892b0', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="glass-card mb-4 p-3" style={{ borderRadius: 12 }}>
          <div className="d-flex align-items-center gap-2">
            <div style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#6c63ff,#00d4aa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: '#fff', fontSize: '0.9rem'
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f0f4ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8892b0' }}>
                {user?.accountType} Account
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.7rem', color: '#8892b0' }}>Account No.</div>
            <div style={{ fontSize: '0.8rem', color: '#6c63ff', fontWeight: 600, letterSpacing: 1 }}>
              {user?.accountNumber?.replace(/(\d{4})/g, '$1 ').trim()}
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-grow-1">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <i className={`bi ${item.icon}`}></i>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Balance chip */}
      {!collapsed && (
        <div className="mb-3 p-3" style={{
          background: 'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(0,212,170,0.1))',
          borderRadius: 12, border: '1px solid rgba(108,99,255,0.3)'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#8892b0', marginBottom: 4 }}>Available Balance</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f0f4ff', fontFamily: 'Space Grotesk' }}>
            ₹{user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="sidebar-link"
        style={{ background: 'none', border: 'none', width: '100%', color: '#ff6b6b', justifyContent: collapsed ? 'center' : 'flex-start' }}
        title="Logout"
      >
        <i className="bi bi-box-arrow-right"></i>
        {!collapsed && <span>Logout</span>}
      </button>
    </div>
  );
};

export default Sidebar;
