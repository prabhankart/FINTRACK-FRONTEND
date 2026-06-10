import { useState, useEffect } from 'react';
import budgetService from '../services/budgetService';
import { formatCurrency, getCurrentMonthYear, getMonthName } from '../utils/helpers';
import { Plus, Target, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function BudgetPage() {
  const { month, year } = getCurrentMonthYear();
  const [overview, setOverview] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    category_id: '', limit_amount: '',
    month, year, alert_at_percent: 80
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [overviewRes, budgetRes, catRes] = await Promise.all([
        budgetService.getBudgetOverview(month, year),
        budgetService.getBudgets(month, year),
        api.get('/transactions/analytics', { params: { month, year } })
      ]);
      setOverview(overviewRes.data.overview || []);
      setBudgets(budgetRes.data.budgets || []);

      // Get categories from analytics
      const cats = overviewRes.data.overview || [];
      setCategories(cats);
      if (cats.length > 0) setForm(f => ({ ...f, category_id: cats[0].category_id }));
    } catch { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await budgetService.createBudget(form);
      toast.success('Budget created!');
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create budget');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await budgetService.deleteBudget(id);
      toast.success('Budget deleted');
      fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  const getStatusColor = (pct) => {
    if (pct >= 100) return '#ef4444';
    if (pct >= 80) return '#f97316';
    return '#22c55e';
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>Budgets</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>{getMonthName(month)} {year}</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#6366f1', color: 'white', border: 'none',
          borderRadius: '10px', padding: '10px 18px',
          fontSize: '14px', fontWeight: 600, cursor: 'pointer'
        }}>
          <Plus size={16} /> Set Budget
        </button>
      </div>

      {/* Budget Cards */}
      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : overview.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: '16px', padding: '48px',
          textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}>
          <Target size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>No data yet</p>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Upload transactions first, then set budgets per category
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {overview.map(item => {
            const hasBudget = item.budget_limit > 0;
            const pct = parseFloat(item.percentage_used || 0);
            const statusColor = getStatusColor(pct);
            const budget = budgets.find(b => b.category_id === item.category_id);

            return (
              <div key={item.category_id} style={{
                background: 'white', borderRadius: '16px', padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: hasBudget && pct >= 100 ? '1px solid #fca5a5' : '1px solid #f1f5f9'
              }}>
                {/* Category Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                        {item.category_name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Spent: {formatCurrency(item.total_spent)}
                      </p>
                    </div>
                  </div>
                  {budget && (
                    <button onClick={() => handleDelete(budget.id)} style={{
                      background: '#fef2f2', border: 'none', borderRadius: '6px',
                      padding: '5px', cursor: 'pointer', color: '#ef4444'
                    }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {hasBudget ? (
                  <>
                    {/* Progress Bar */}
                    <div style={{
                      background: '#f1f5f9', borderRadius: '99px',
                      height: '8px', marginBottom: '8px', overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%', borderRadius: '99px',
                        width: `${Math.min(pct, 100)}%`,
                        background: statusColor,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: statusColor, fontWeight: 600 }}>
                        {pct.toFixed(1)}% used
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {formatCurrency(item.total_spent)} / {formatCurrency(item.budget_limit)}
                      </span>
                    </div>

                    {pct >= 100 && (
                      <div style={{
                        marginTop: '10px', padding: '8px 12px',
                        background: '#fef2f2', borderRadius: '8px',
                        fontSize: '12px', color: '#dc2626', fontWeight: 500
                      }}>
                        ⚠️ Budget exceeded by {formatCurrency(item.total_spent - item.budget_limit)}
                      </div>
                    )}
                    {pct >= 80 && pct < 100 && (
                      <div style={{
                        marginTop: '10px', padding: '8px 12px',
                        background: '#fffbeb', borderRadius: '8px',
                        fontSize: '12px', color: '#d97706', fontWeight: 500
                      }}>
                        ⚡ {(100 - pct).toFixed(1)}% of budget remaining
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setForm(f => ({ ...f, category_id: item.category_id }));
                      setShowModal(true);
                    }}
                    style={{
                      width: '100%', padding: '8px',
                      border: '1.5px dashed #cbd5e1', borderRadius: '8px',
                      background: 'transparent', cursor: 'pointer',
                      fontSize: '13px', color: '#94a3b8'
                    }}
                  >
                    + Set budget for this category
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

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
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Set Budget</h3>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
              }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                  style={inputStyle}
                >
                  {overview.map(c => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.icon} {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                  Monthly Limit (₹)
                </label>
                <input
                  type="number" required min="1" step="100"
                  placeholder="e.g. 5000"
                  value={form.limit_amount}
                  onChange={e => setForm({ ...form, limit_amount: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                  Alert at (%)
                </label>
                <input
                  type="number" min="50" max="100"
                  value={form.alert_at_percent}
                  onChange={e => setForm({ ...form, alert_at_percent: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <button type="submit" style={{
                width: '100%', padding: '12px',
                background: '#6366f1', color: 'white',
                border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer'
              }}>
                Save Budget
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}