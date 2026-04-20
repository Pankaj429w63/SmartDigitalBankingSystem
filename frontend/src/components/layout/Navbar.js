/**
 * Navbar Component — Top navigation for the landing/public pages
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Detect scroll to add shadow — DOM manipulation
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle nav menu — event handling + DOM manipulation
  const toggleMenu = () => setMenuOpen(prev => !prev);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav
      className="navbar-custom"
      style={{
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand-custom d-flex align-items-center gap-2">
            <i className="bi bi-bank2" style={{ fontSize: '1.6rem' }}></i>
            SmartBank
          </Link>

          {/* Desktop Nav Links */}
          <div className="d-none d-md-flex align-items-center gap-2">
            <Link to="/" className="nav-link-custom">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link-custom">Dashboard</Link>
                <Link to="/transactions" className="nav-link-custom">Transactions</Link>
                <Link to="/tools" className="nav-link-custom">Tools</Link>
                <div className="d-flex align-items-center gap-2 ms-2">
                  <div
                    style={{
                      width: 36, height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.9rem', color: '#fff'
                    }}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <button onClick={handleLogout} className="btn-outline-custom" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}>
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link-custom">Login</Link>
                <Link to="/register" className="btn-primary-custom ms-2" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger — JavaScript toggle */}
          <button
            className="d-md-none"
            onClick={toggleMenu}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '0.4rem 0.6rem', color: '#f0f4ff', cursor: 'pointer' }}
            aria-label="Toggle navigation menu"
            id="navbar-toggle-btn"
          >
            <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: '1.2rem' }}></i>
          </button>
        </div>

        {/* Mobile Menu — toggled via JS state */}
        <div
          id="mobile-menu"
          style={{
            maxHeight: menuOpen ? '400px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.35s ease',
          }}
        >
          <div className="d-flex flex-column gap-1 py-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <Link to="/" className="nav-link-custom" onClick={() => setMenuOpen(false)}>Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link-custom" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/transactions" className="nav-link-custom" onClick={() => setMenuOpen(false)}>Transactions</Link>
                <Link to="/tools" className="nav-link-custom" onClick={() => setMenuOpen(false)}>Tools</Link>
                <Link to="/profile" className="nav-link-custom" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="btn-outline-custom mt-2" style={{ width: '100%' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link-custom" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary-custom mt-2" style={{ textAlign: 'center', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
