import { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import accountService from '../services/accountService';
import { formatCurrency, formatDate, getCurrentMonthYear } from '../utils/helpers';
import { Search, Filter, Trash2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const { month, year } = getCurrentMonthYear();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ month, year, type: '', accountId: '' });
  const [form, setForm] = useState({
    account_id: '', description: '', amount: '',
    type: 'debit', date: new Date().toISOString().split('T')[0], note: ''
  });

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchTransactions(); }, [filters, page]);

  const fetchAll = async () => {
    try {
      const accRes = await accountService.getAccounts();
      setAccounts(accRes.data.accounts || []);
      if (accRes.data.accounts?.length > 0) {
        setForm(f => ({ ...f, account_id: accRes.data.accounts[0].id }));
      }
    } catch { toast.error('Failed to load accounts'); }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await transactionService.getTransactions(params);
      setTransactions(res.data.transactions || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);

      // Collect unique categories from transactions
      const cats = [...new Map(
        (res.data.transactions || [])
          .filter(t => t.Category)
          .map(t => [t.Category.id, t.Category])
      ).values()];
      setCategories(cats);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await transactionService.deleteTransaction(id);
      toast.success('Deleted');
      fetchTransactions();
    } catch { toast.error('Failed to delete'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await transactionService.addTransaction(form);
      toast.success('Transaction added!');
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>Transactions</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>{total} total transactions</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#6366f1', color: 'white', border: 'none',
          borderRadius: '10px', padding: '10px 18px',
          fontSize: '14px', fontWeight: 600, cursor: 'pointer'
        }}>
          <Plus size={16} /> Add Manual
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white', borderRadius: '14px', padding: '16px',
        marginBottom: '16px', display: 'flex', gap: '12px',
        flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        <Filter size={18} color="#6366f1" style={{ alignSelf: 'center' }} />

        <select
          value={filters.type}
          onChange={e => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
          style={{ ...inputStyle, width: 'auto', minWidth: '120px' }}
        >
          <option value="">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>

        <select
          value={filters.accountId}
          onChange={e => { setFilters({ ...filters, accountId: e.target.value }); setPage(1); }}
          style={{ ...inputStyle, width: 'auto', minWidth: '160px' }}
        >
          <option value="">All Accounts</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <select
          value={filters.month}
          onChange={e => { setFilters({ ...filters, month: e.target.value }); setPage(1); }}
          style={{ ...inputStyle, width: 'auto', minWidth: '130px' }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2024, i).toLocaleString('en', { month: 'long' })}
            </option>
          ))}
        </select>

        <select
          value={filters.year}
          onChange={e => { setFilters({ ...filters, year: e.target.value }); setPage(1); }}
          style={{ ...inputStyle, width: 'auto', minWidth: '100px' }}
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <button
          onClick={() => { setFilters({ month, year, type: '', accountId: '' }); setPage(1); }}
          style={{
            padding: '9px 14px', background: '#f1f5f9', border: 'none',
            borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#64748b'
          }}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div style={{
  background: 'white',
  borderRadius: '14px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  overflowX: 'auto',
  overflowY: 'hidden',
  WebkitOverflowScrolling: 'touch'
}}>
       <table
  style={{
    width: '100%',
    minWidth: '900px',
    borderCollapse: 'collapse'
  }}
>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              {['Date', 'Description', 'Category', 'Account', 'Type', 'Amount', ''].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: '12px', fontWeight: 600,
                  color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                Loading...
              </td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                No transactions found. Upload a bank statement!
              </td></tr>
            ) : transactions.map(tx => (
              <tr key={tx.id} style={{
                borderBottom: '1px solid #f8fafc',
                transition: 'background 0.1s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                  {formatDate(tx.date)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>
                    {tx.description?.substring(0, 30)}{tx.description?.length > 30 ? '...' : ''}
                  </p>
                  {tx.ai_confidence && (
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                      AI: {Math.round(tx.ai_confidence * 100)}% confident
                    </p>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {tx.Category ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: `${tx.Category.color}15`, color: tx.Category.color,
                      padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500
                    }}>
                      {tx.Category.icon} {tx.Category.name}
                    </span>
                  ) : <span style={{ color: '#94a3b8', fontSize: '12px' }}>Uncategorized</span>}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                  {tx.Account?.name}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                    background: tx.type === 'credit' ? '#f0fdf4' : '#fef2f2',
                    color: tx.type === 'credit' ? '#16a34a' : '#dc2626'
                  }}>
                    {tx.type}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontWeight: 600, fontSize: '14px',
                    color: tx.type === 'credit' ? '#22c55e' : '#ef4444'
                  }}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => handleDelete(tx.id)} style={{
                    background: '#fef2f2', border: 'none', borderRadius: '6px',
                    padding: '5px', cursor: 'pointer', color: '#ef4444'
                  }}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '8px',
            padding: '16px', borderTop: '1px solid #f1f5f9'
          }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: '32px', height: '32px', borderRadius: '8px',
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                background: p === page ? '#6366f1' : '#f1f5f9',
                color: p === page ? 'white' : '#64748b'
              }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '16px',
            padding: '32px', width: '95%',
maxWidth: '440px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Add Transaction</h3>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
              }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAdd}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Account</label>
                  <select value={form.account_id} onChange={e => setForm({ ...form, account_id: e.target.value })} style={inputStyle}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Description</label>
                  <input
                    type="text" placeholder="e.g. Zomato Order" required
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Amount (₹)</label>
                  <input
                    type="number" placeholder="0.00" required min="0.01" step="0.01"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Date</label>
                  <input
                    type="date" required
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              <button type="submit" style={{
                width: '100%', padding: '12px', marginTop: '20px',
                background: '#6366f1', color: 'white', border: 'none',
                borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer'
              }}>
                Add Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}