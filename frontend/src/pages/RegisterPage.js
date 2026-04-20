/**
 * RegisterPage — Multi-step registration with full validation
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', accountType: 'savings', agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Password strength checker
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthConfig = {
    0: { label: '', color: 'transparent' },
    1: { label: 'Very Weak', color: '#ff6b6b' },
    2: { label: 'Weak', color: '#ff8c42' },
    3: { label: 'Fair', color: '#ffd93d' },
    4: { label: 'Strong', color: '#6bcb77' },
    5: { label: 'Very Strong', color: '#00d4aa' },
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.firstName.trim() || form.firstName.length < 2) errs.firstName = 'First name must be at least 2 characters';
    if (!form.lastName.trim() || form.lastName.length < 2) errs.lastName = 'Last name must be at least 2 characters';
    const emailRx = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!form.email || !emailRx.test(form.email)) errs.email = 'Enter a valid email address';
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) errs.phone = 'Phone must be 10 digits';
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    const pwdRx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!form.password || form.password.length < 8) errs.password = 'Minimum 8 characters required';
    else if (!pwdRx.test(form.password)) errs.password = 'Must include uppercase, lowercase & number';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.agreeTerms) errs.agreeTerms = 'You must agree to the Terms & Conditions';
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { confirmPassword, agreeTerms, ...submitData } = form;
      const data = await register(submitData);
      if (data.success) {
        toast.success(`Account created! Welcome, ${data.user.firstName} 🎉`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = getPasswordStrength(form.password);
  const strengthInfo = strengthConfig[pwdStrength];

  return (
    <div className="auth-container">
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,99,255,0.12),transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,170,0.1),transparent)', pointerEvents: 'none' }} />

      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', padding: '2rem' }}>
        <div className="auth-card" style={{ maxWidth: 500 }}>
          {/* Header */}
          <div className="text-center mb-4">
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.8rem' }}>
              <i className="bi bi-person-plus" style={{ color: '#fff' }}></i>
            </div>
            <h2 className="auth-title">Create Account</h2>
            <p style={{ color: '#8892b0', fontSize: '0.9rem' }}>Join SmartBank — it's free forever</p>
          </div>

          {/* Step Indicator */}
          <div className="d-flex align-items-center gap-2 mb-4">
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s ? 'linear-gradient(135deg,#6c63ff,#00d4aa)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: step >= s ? '#fff' : '#8892b0', transition: 'all 0.3s ease' }}>{s}</div>
                {s < 2 && <div style={{ flex: 1, height: 2, background: step > s ? 'linear-gradient(135deg,#6c63ff,#00d4aa)' : 'rgba(255,255,255,0.08)', transition: 'all 0.3s ease', borderRadius: 2 }}></div>}
              </React.Fragment>
            ))}
            <span style={{ marginLeft: 8, fontSize: '0.8rem', color: '#8892b0' }}>Step {step} of 2</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* STEP 1 */}
            {step === 1 && (
              <div className="animate-fade-up">
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>First Name</label>
                    <input type="text" name="firstName" id="reg-firstname" value={form.firstName} onChange={handleChange}
                      placeholder="John" className="form-control-custom" style={{ borderColor: errors.firstName ? '#ff6b6b' : undefined }} />
                    {errors.firstName && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: 3 }}>{errors.firstName}</div>}
                  </div>
                  <div className="col-6">
                    <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Last Name</label>
                    <input type="text" name="lastName" id="reg-lastname" value={form.lastName} onChange={handleChange}
                      placeholder="Doe" className="form-control-custom" style={{ borderColor: errors.lastName ? '#ff6b6b' : undefined }} />
                    {errors.lastName && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: 3 }}>{errors.lastName}</div>}
                  </div>
                </div>
                <div className="mb-3">
                  <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Email Address</label>
                  <input type="email" name="email" id="reg-email" value={form.email} onChange={handleChange}
                    placeholder="you@example.com" className="form-control-custom" style={{ borderColor: errors.email ? '#ff6b6b' : undefined }} />
                  {errors.email && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: 3 }}>{errors.email}</div>}
                </div>
                <div className="mb-3">
                  <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Phone (Optional)</label>
                  <input type="tel" name="phone" id="reg-phone" value={form.phone} onChange={handleChange}
                    placeholder="10-digit number" className="form-control-custom" style={{ borderColor: errors.phone ? '#ff6b6b' : undefined }} />
                  {errors.phone && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: 3 }}>{errors.phone}</div>}
                </div>
                <div className="mb-4">
                  <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Account Type</label>
                  <div className="d-flex gap-2">
                    {['savings', 'checking', 'business'].map(t => (
                      <button key={t} type="button" onClick={() => setForm(p => ({ ...p, accountType: t }))}
                        style={{ flex: 1, padding: '0.6rem', background: form.accountType === t ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.accountType === t ? '#6c63ff' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, color: form.accountType === t ? '#6c63ff' : '#8892b0', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize', transition: 'all 0.2s' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={handleNext} className="btn-primary-custom w-100" style={{ fontSize: '1rem', padding: '0.85rem' }}>
                  Continue <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="animate-fade-up">
                <div className="mb-3">
                  <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} name="password" id="reg-password" value={form.password} onChange={handleChange}
                      placeholder="Min. 8 characters" className="form-control-custom" style={{ paddingRight: '2.5rem', borderColor: errors.password ? '#ff6b6b' : undefined }} />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer' }}>
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {form.password && (
                    <div className="mt-2">
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= pwdStrength ? strengthInfo.color : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }}></div>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: strengthInfo.color }}>{strengthInfo.label}</div>
                    </div>
                  )}
                  {errors.password && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: 3 }}>{errors.password}</div>}
                </div>
                <div className="mb-3">
                  <label style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: 6, display: 'block' }}>Confirm Password</label>
                  <input type="password" name="confirmPassword" id="reg-confirm-password" value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter password" className="form-control-custom" style={{ borderColor: errors.confirmPassword ? '#ff6b6b' : undefined }} />
                  {errors.confirmPassword && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: 3 }}>{errors.confirmPassword}</div>}
                </div>
                <div className="mb-4">
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={handleChange}
                      style={{ marginTop: 3, accentColor: '#6c63ff' }} />
                    <span style={{ fontSize: '0.85rem', color: '#8892b0' }}>
                      I agree to the <span style={{ color: '#6c63ff' }}>Terms of Service</span> and <span style={{ color: '#6c63ff' }}>Privacy Policy</span>
                    </span>
                  </label>
                  {errors.agreeTerms && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: 3 }}>{errors.agreeTerms}</div>}
                </div>
                <div className="d-flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline-custom" style={{ flex: 1 }}>
                    <i className="bi bi-arrow-left me-1"></i> Back
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary-custom" style={{ flex: 2, opacity: loading ? 0.7 : 1 }}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</> : <><i className="bi bi-bank me-2"></i>Create Account</>}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#8892b0', fontSize: '0.9rem', marginBottom: 0 }}>
            Already have an account? <Link to="/login" style={{ color: '#6c63ff', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
