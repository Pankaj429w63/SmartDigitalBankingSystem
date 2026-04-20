/**
 * LoginPage — Controlled form with validation, ES6+, async/await
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Controlled form state
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Arrow function — ES6+
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Client-side validation with regex
  const validate = () => {
    const errs = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!form.email) errs.email = 'Email is required';
    else if (!emailRegex.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    return errs;
  };

  // Async/await form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const data = await login(form);
      if (data.success) {
        toast.success(`Welcome back, ${data.user.firstName}! 🎉`);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Gradient orbs */}
      <div style={{ position: 'absolute', top: '20%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,99,255,0.15),transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,170,0.1),transparent)', pointerEvents: 'none' }} />

      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', padding: '2rem' }}>
        <div className="auth-card" style={{ maxWidth: 460 }}>
          {/* Logo */}
          <div className="text-center mb-4">
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.8rem' }}>
              <i className="bi bi-bank2" style={{ color: '#fff' }}></i>
            </div>
            <h2 className="auth-title">Welcome Back</h2>
            <p style={{ color: '#8892b0', fontSize: '0.9rem' }}>Sign in to your SmartBank account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-3">
              <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4a5568' }}></i>
                <input
                  type="email" name="email" id="login-email"
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className="form-control-custom"
                  style={{ paddingLeft: '2.5rem', borderColor: errors.email ? '#ff6b6b' : undefined }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: 4 }}><i className="bi bi-exclamation-circle me-1"></i>{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <label style={{ fontSize: '0.85rem', color: '#8892b0' }}>Password</label>
                <span style={{ fontSize: '0.8rem', color: '#6c63ff', cursor: 'pointer' }}>Forgot password?</span>
              </div>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4a5568' }}></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" id="login-password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="form-control-custom"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', borderColor: errors.password ? '#ff6b6b' : undefined }}
                  autoComplete="current-password"
                />
                {/* Toggle password visibility */}
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer' }}>
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {errors.password && <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: 4 }}><i className="bi bi-exclamation-circle me-1"></i>{errors.password}</div>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary-custom w-100" style={{ fontSize: '1rem', padding: '0.85rem', opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Signing in...</>
                : <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
              }
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 10, padding: '0.75rem 1rem', marginTop: '1.5rem', fontSize: '0.8rem' }}>
            <div style={{ color: '#6c63ff', fontWeight: 600, marginBottom: 4 }}><i className="bi bi-info-circle me-1"></i>Demo Account</div>
            <div style={{ color: '#8892b0' }}>Register a new account to explore all features.</div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#8892b0', fontSize: '0.9rem', marginBottom: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#6c63ff', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
