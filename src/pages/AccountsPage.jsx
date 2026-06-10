import { useState, useEffect } from 'react';
import accountService from '../services/accountService';
import { formatCurrency } from '../utils/helpers';
import { Plus, CreditCard, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ACCOUNT_TYPES = ['savings', 'current', 'credit', 'wallet'];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'savings', balance: '', currency: 'INR' });

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const res = await accountService.getAccounts();
      setAccounts(res.data.accounts || []);
      setSummary(res.data.summary || {});
    } catch { toast.error('Failed to load accounts'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await accountService.createAccount(form);
      toast.success('Account created!');
      setShowModal(false);
      setForm({ name: '', type: 'savings', balance: '', currency: 'INR' });
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this account?')) return;
    try {
      await accountService.deleteAccount(id);
      toast.success('Account deleted');
      fetchAccounts();
    } catch { toast.error('Failed to delete'); }
  };

  const typeColors = {
    savings: '#22c55e', current: '#3b82f6',
    credit: '#ef4444', wallet: '#f97316'
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>Accounts</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Manage your bank accounts</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#6366f1', color: 'white', border: 'none',
          borderRadius: '10px', padding: '10px 18px',
          fontSize: '14px', fontWeight: 600, cursor: 'pointer'
        }}>
          <Plus size={16} /> Add Account
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Balance', value: formatCurrency(summary.total_balance), color: '#6366f1' },
          { label: 'Savings', value: formatCurrency(summary.savings_balance), color: '#22c55e' },
          { label: 'Current', value: formatCurrency(summary.current_balance), color: '#3b82f6' },
          { label: 'Credit', value: formatCurrency(summary.credit_balance), color: '#ef4444' }
        ].map(card => (
          <div key={card.label} style={{
            background: 'white', borderRadius: '14px', padding: '20px',
            flex: 1, minWidth: '140px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            borderTop: `3px solid ${card.color}`
          }}>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{card.label}</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Accounts List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {accounts.map(acc => (
          <div key={acc.id} style={{
            background: 'white', borderRadius: '16px', padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f1f5f9', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                background: `${typeColors[acc.type]}15`,
                borderRadius: '10px', padding: '10px'
              }}>
                <CreditCard size={22} color={typeColors[acc.type]} />
              </div>
              <button onClick={() => handleDelete(acc.id)} style={{
                background: '#fef2f2', border: 'none', borderRadius: '8px',
                padding: '6px', cursor: 'pointer', color: '#ef4444'
              }}>
                <Trash2 size={14} />
              </button>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, marginTop: '16px', color: '#1e293b' }}>
              {acc.name}
            </p>
            <p style={{
              fontSize: '12px', textTransform: 'capitalize',
              color: typeColors[acc.type], fontWeight: 500, marginTop: '4px'
            }}>
              {acc.type} Account
            </p>
            <p style={{ fontSize: '26px', fontWeight: 700, marginTop: '16px', color: '#1e293b' }}>
              {formatCurrency(acc.balance)}
            </p>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{acc.currency}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '16px',
            padding: '32px', width: '400px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Add Account</h3>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
              }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              {[
                { label: 'Account Name', name: 'name', type: 'text', placeholder: 'e.g. SBI Savings' },
                { label: 'Opening Balance (₹)', name: 'balance', type: 'number', placeholder: '0' }
              ].map(f => (
                <div key={f.name} style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type} name={f.name}
                    value={form[f.name]} placeholder={f.placeholder}
                    onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                    required={f.name === 'name'}
                    style={{
                      width: '100%', padding: '10px 12px',
                      border: '1.5px solid #e2e8f0', borderRadius: '8px',
                      fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              ))}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                  Account Type
                </label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1.5px solid #e2e8f0', borderRadius: '8px',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                >
                  {ACCOUNT_TYPES.map(t => (
                    <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px',
                background: '#6366f1', color: 'white',
                border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer'
              }}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}