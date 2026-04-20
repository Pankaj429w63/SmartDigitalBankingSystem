/**
 * LandingPage — Public hero page with video background, features, stats
 */
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const features = [
  { icon: 'bi-shield-lock-fill',  color: '#6c63ff', title: 'Bank-Grade Security',    desc: 'Military-level encryption & 2FA protect every transaction you make.'        },
  { icon: 'bi-lightning-charge-fill', color: '#00d4aa', title: 'Instant Transfers',  desc: 'Send money anywhere in seconds with zero processing delays.'                 },
  { icon: 'bi-bar-chart-line-fill',   color: '#f093fb', title: 'Smart Analytics',    desc: 'AI-powered insights help you understand and optimize your spending.'          },
  { icon: 'bi-phone-fill',           color: '#ffd93d', title: 'Mobile First',        desc: 'Full banking experience on any device, anywhere, anytime.'                   },
  { icon: 'bi-clock-history',        color: '#ff6b6b', title: '24/7 Availability',   desc: 'Round-the-clock access to all your accounts and services.'                   },
  { icon: 'bi-graph-up-arrow',       color: '#4d96ff', title: 'Investment Tracking', desc: 'Track your portfolio growth and savings goals in real time.'                  },
];

const stats = [
  { value: '2M+',   label: 'Active Users'    },
  { value: '₹50B+', label: 'Transactions'    },
  { value: '99.9%', label: 'Uptime'          },
  { value: '150+',  label: 'Countries'       },
];

const LandingPage = () => {
  const heroRef = useRef(null);

  // Parallax effect on scroll — DOM manipulation
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrolled * 0.4}px)`;
        heroRef.current.style.opacity = Math.max(0, 1 - scrolled / 600);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section" style={{ minHeight: '100vh' }}>
        {/* Video Background */}
        <video
          className="hero-video-bg"
          autoPlay muted loop playsInline
          poster=""
          style={{ opacity: 0.12 }}
        >
          {/* Fallback gradient shown when video not available */}
        </video>

        {/* Animated gradient orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '15%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', top: '50%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,147,251,0.08) 0%, transparent 70%)', animation: 'float 6s ease-in-out infinite 1s' }} />
        </div>

        <div className="hero-overlay"></div>

        <div className="container hero-content" ref={heroRef}>
          <div className="row align-items-center" style={{ minHeight: '90vh' }}>
            <div className="col-lg-6 animate-fade-left">
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.4)', borderRadius: 50, padding: '6px 16px', marginBottom: '1.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4aa', display: 'inline-block', animation: 'pulse-glow 2s infinite' }}></span>
                <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>Next-Generation Banking Platform</span>
              </div>

              <h1 className="hero-title mb-4">
                Banking That<br />
                <span style={{ WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                  Thinks Ahead
                </span>
              </h1>

              <p className="hero-subtitle mb-5">
                Experience intelligent digital banking with real-time analytics, instant transfers, 
                and AI-powered insights — all in one secure platform.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary-custom" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem', textDecoration: 'none' }}>
                  <i className="bi bi-rocket-takeoff me-2"></i>Start Banking Free
                </Link>
                <Link to="/login" className="btn-outline-custom" style={{ fontSize: '1rem', textDecoration: 'none' }}>
                  <i className="bi bi-play-circle me-2"></i>See Demo
                </Link>
              </div>

              {/* Trust badges */}
              <div className="d-flex align-items-center gap-4 mt-5">
                {['RBI Regulated', 'ISO 27001', '256-bit SSL'].map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="bi bi-patch-check-fill" style={{ color: '#00d4aa', fontSize: '0.9rem' }}></i>
                    <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Card Visual */}
            <div className="col-lg-6 d-none d-lg-flex justify-content-center animate-fade-right">
              <div style={{ position: 'relative', width: 380 }}>
                {/* Main bank card */}
                <div className="animate-float" style={{ background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', borderRadius: 24, padding: '2rem', color: '#fff', boxShadow: '0 30px 80px rgba(108,99,255,0.4)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                  <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(0,0,0,0.15)' }}></div>
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>SMART BANK</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Platinum Card</div>
                    </div>
                    <i className="bi bi-credit-card-2-front" style={{ fontSize: '2rem', opacity: 0.7 }}></i>
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', letterSpacing: 3, marginBottom: '1.5rem' }}>
                    •••• •••• •••• 4521
                  </div>
                  <div className="d-flex justify-content-between">
                    <div><div style={{ fontSize: '0.65rem', opacity: 0.7 }}>CARD HOLDER</div><div style={{ fontWeight: 600 }}>John Doe</div></div>
                    <div><div style={{ fontSize: '0.65rem', opacity: 0.7 }}>EXPIRES</div><div style={{ fontWeight: 600 }}>12/28</div></div>
                    <div style={{ fontSize: '2rem', fontStyle: 'italic', fontWeight: 900, opacity: 0.8 }}>VISA</div>
                  </div>
                </div>

                {/* Floating stats */}
                {[
                  { label: 'Balance', value: '₹1,24,500', icon: 'bi-wallet2', top: -20, right: -30, bg: '#141929' },
                  { label: 'Savings', value: '+12.4%', icon: 'bi-graph-up', bottom: -20, left: -30, bg: '#141929' },
                ].map((s, i) => (
                  <div key={i} style={{ position: 'absolute', top: s.top, right: s.right, bottom: s.bottom, left: s.left, background: s.bg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '0.75rem 1rem', minWidth: 140, animation: `float ${6 + i * 2}s ease-in-out infinite ${i}s` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`bi ${s.icon}`} style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: '#8892b0' }}>{s.label}</div>
                        <div style={{ fontWeight: 700, color: '#f0f4ff', fontSize: '0.9rem' }}>{s.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '3rem 0' }}>
        <div className="container">
          <div className="row text-center">
            {stats.map((s, i) => (
              <div key={i} className="col-6 col-md-3 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
                <div style={{ color: '#8892b0', fontSize: '0.9rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">A complete banking ecosystem built for the modern world</p>
          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-card">
                  <div className="feature-icon" style={{ background: `${f.color}20`, color: f.color }}>
                    <i className={`bi ${f.icon}`}></i>
                  </div>
                  <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h5>
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(0,212,170,0.1))', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 32, padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,99,255,0.2),transparent)' }}></div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to Get Started?</h2>
            <p style={{ color: '#8892b0', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
              Join millions of customers who trust SmartBank for their financial needs.
            </p>
            <Link to="/register" className="btn-primary-custom" style={{ fontSize: '1.1rem', padding: '1rem 3rem', textDecoration: 'none' }}>
              <i className="bi bi-bank me-2"></i>Open Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '2rem 0', textAlign: 'center' }}>
        <div className="container">
          <div className="navbar-brand-custom mb-2" style={{ fontSize: '1.2rem' }}>SmartBank</div>
          <p style={{ color: '#4a5568', fontSize: '0.85rem', margin: 0 }}>
            © {new Date().getFullYear()} Smart Digital Banking System. Built with MERN Stack.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
