import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { TrendingUp, User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password min 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: 24
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          top: -200, right: -200
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
          bottom: -100, left: -100
        }} />
      </div>

      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
        padding: '40px 36px', width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
        position: 'relative'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)', borderRadius: 10, padding: '8px 9px', display: 'flex' }}>
            <TrendingUp size={18} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text1)' }}>FinTrack</span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text1)' }}>
          Create account
        </h2>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 28 }}>
          Start tracking your finances for free
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <div className="input-with-icon">
              <User size={15} className="input-icon" />
              <input
                className="input" type="text"
                placeholder="Prabhankar Singh" required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <div className="input-with-icon">
              <Mail size={15} className="input-icon" />
              <input
                className="input" type="email"
                placeholder="you@example.com" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <div className="input-with-icon">
              <Lock size={15} className="input-icon" />
              <input
                className="input" type="password"
                placeholder="Min. 6 characters" required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          {/* Password strength */}
          {form.password && (
            <div style={{ marginTop: -8, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 99,
                    background: form.password.length >= i * 2
                      ? (form.password.length >= 8 ? 'var(--success)' : 'var(--warning)')
                      : 'var(--border)',
                    transition: 'background 0.2s'
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                {form.password.length < 4 ? 'Weak' : form.password.length < 8 ? 'Fair' : 'Strong'} password
              </span>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="btn btn-primary btn-lg w-full"
            style={{ justifyContent: 'center', gap: 8 }}
          >
            {loading
              ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <ArrowRight size={16} />
            }
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
