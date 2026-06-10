import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: '📊', title: 'Smart Analytics', desc: 'AI-powered spending insights' },
  { icon: '🤖', title: 'Auto Categorize', desc: 'Machine learning categorization' },
  { icon: '🎯', title: 'Budget Goals', desc: 'Track limits per category' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg)', fontFamily: 'Inter, sans-serif'
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, background: 'linear-gradient(135deg, #1e1b4b 0%, #2d2a6e 60%, #4338ca 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 60px', color: 'white',
        position: 'relative', overflow: 'hidden'
      }} className="auth-left">
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(99,102,241,0.12)',
          top: -100, right: -100, pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', width: 250, height: 250,
          borderRadius: '50%', background: 'rgba(99,102,241,0.08)',
          bottom: 50, left: -50, pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ background: 'var(--brand)', borderRadius: 12, padding: 10 }}>
              <TrendingUp size={22} color="white" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 700 }}>FinTrack</span>
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
            Take control of<br />your finances
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 360, lineHeight: 1.6 }}>
            Upload bank statements, get AI insights, and track every rupee effortlessly.
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20, flexShrink: 0
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: 480, background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.06)'
      }} className="auth-right">
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text1)', marginBottom: 6 }}>
              Sign in
            </h2>
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>
              Welcome back! Enter your credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email address</label>
              <div className="input-with-icon">
                <Mail size={15} className="input-icon" />
                <input
                  className="input" type="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon" />
                <input
                  className="input" type={showPass ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text3)',
                    display: 'flex', padding: 2
                  }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn btn-primary btn-lg w-full"
              style={{ marginTop: 8, justifyContent: 'center', gap: 8 }}
            >
              {loading ? (
                <div style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite'
                }} />
              ) : <ArrowRight size={16} />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={{
            textAlign: 'center', marginTop: 24,
            fontSize: 13, color: 'var(--text3)'
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: 'var(--brand)', fontWeight: 600, textDecoration: 'none'
            }}>
              Create one
            </Link>
          </div>

          {/* Demo hint */}
          <div style={{
            marginTop: 24, padding: '12px 14px',
            background: 'var(--brand-light)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(99,102,241,0.2)'
          }}>
            <p style={{ fontSize: 12, color: 'var(--brand-dark)', fontWeight: 500 }}>
              🔑 Demo: prabh@test.com / 123456
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left { display: none !important; }
          .auth-right { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
