/**
 * DashboardLayout — Wraps all authenticated pages with sidebar + topbar
 */
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { path: '/dashboard',    icon: 'bi-grid-1x2-fill',    label: 'Dashboard'    },
    { path: '/transactions', icon: 'bi-arrow-left-right', label: 'Transactions' },
    { path: '/tools',        icon: 'bi-tools',            label: 'Tools'        },
    { path: '/profile',      icon: 'bi-person-circle',    label: 'Profile'      },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {mobileNavOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200 }}
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', width: 260,
        zIndex: 201, transform: mobileNavOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease', background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)', padding: '1.5rem 1rem',
        overflowY: 'auto'
      }} className="d-lg-none">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.1rem', background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SmartBank</span>
          <button onClick={() => setMobileNavOpen(false)} style={{ background: 'none', border: 'none', color: '#f0f4ff', fontSize: '1.2rem', cursor: 'pointer' }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        {navItems.map(item => (
          <Link key={item.path} to={item.path} className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`} onClick={() => setMobileNavOpen(false)}>
            <i className={`bi ${item.icon}`}></i><span>{item.label}</span>
          </Link>
        ))}
        <button onClick={logout} className="sidebar-link mt-4" style={{ background: 'none', border: 'none', width: '100%', color: '#ff6b6b' }}>
          <i className="bi bi-box-arrow-right"></i><span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content flex-grow-1" style={{ marginLeft: 0 }}>
        {/* Top Bar */}
        <div style={{
          background: 'rgba(15,22,41,0.9)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 1.5rem', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '2rem',
          position: 'sticky', top: 0, zIndex: 90
        }}>
          <div className="d-flex align-items-center gap-3">
            <button className="d-lg-none" onClick={() => setMobileNavOpen(true)}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 10px', color: '#f0f4ff', cursor: 'pointer' }}>
              <i className="bi bi-list" style={{ fontSize: '1.2rem' }}></i>
            </button>
            <div>
              <h5 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700 }}>{title}</h5>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#8892b0' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Welcome back,</div>
              <div style={{ fontSize: '0.75rem', color: '#8892b0' }}>{user?.firstName} {user?.lastName}</div>
            </div>
            <Link to="/profile">
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6c63ff,#00d4aa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#fff', cursor: 'pointer', fontSize: '0.9rem'
              }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '0 1.5rem 2rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
