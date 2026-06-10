import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import { formatCurrency, getCurrentMonthYear, getMonthName } from '../utils/helpers';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Upload, Plus } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#f97316','#3b82f6','#ec4899','#22c55e','#eab308','#ef4444','#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '10px 14px',
      boxShadow: 'var(--shadow-md)', fontSize: 12
    }}>
      <p style={{ color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { month, year } = getCurrentMonthYear();
  const [accounts, setAccounts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);
const fetchAll = async () => {
  setLoading(true);
  try {
    const [accRes, analyticsRes, txRes] = await Promise.all([
      accountService.getAccounts(),
      transactionService.getAnalytics(month, year),
      transactionService.getTransactions({ limit: 6 })
    ]);
    setAccounts(accRes.data.accounts || []);

    // Fix — data is nested inside .data
    const analyticsData = analyticsRes.data?.data || analyticsRes.data;
    setAnalytics(analyticsData);
    setRecentTx(txRes.data?.data?.transactions || txRes.data?.transactions || []);
  } catch (err) {
    console.log('Dashboard error:', err);
    toast.error('Failed to load dashboard');
  } finally { setLoading(false); }
};


  const summary = analytics?.summary || {};
const catSpending = (analytics?.categorySpending || []).map(item => ({
  ...item,
  total: Number(item.total)
}));


  const trend = analytics?.monthlyTrend || [];
  const totalBalance = accounts.reduce((s, a) => s + parseFloat(a.balance || 0), 0);

  const stats = [
    {
      label: 'Total Balance', value: formatCurrency(totalBalance),
      icon: Wallet, color: '#6366f1', bg: '#eef2ff',
      meta: `${accounts.length} account${accounts.length !== 1 ? 's' : ''}`
    },
    {
      label: 'Monthly Income', value: formatCurrency(summary.total_income),
      icon: TrendingUp, color: '#22c55e', bg: '#f0fdf4',
      meta: 'This month', trend: 'up'
    },
    {
      label: 'Monthly Expenses', value: formatCurrency(summary.total_expenses),
      icon: TrendingDown, color: '#ef4444', bg: '#fef2f2',
      meta: 'This month', trend: 'down'
    },
    {
      label: 'Net Savings', value: formatCurrency(summary.net_savings),
      icon: PiggyBank, color: '#f97316', bg: '#fff7ed',
      meta: getMonthName(month)
    },
  ];

  if (loading) return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="skeleton" style={{ height: 28, width: 220, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 160 }} />
      </div>
      <div className="stats-grid">
        {[1,2,3,4].map(i => (
          <div key={i} className="stat-card">
            <div className="skeleton" style={{ height: 36, width: 36, borderRadius: 10, marginBottom: 14 }} />
            <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 28, width: 120 }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="page-subtitle">{getMonthName(month)} {year} — Financial Overview</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => navigate('/accounts')}>
            <Plus size={14} /> Account
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            <Upload size={14} /> Upload
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-6">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-meta">
              {s.trend === 'up' && <ArrowUpRight size={12} color="var(--success)" />}
              {s.trend === 'down' && <ArrowDownRight size={12} color="var(--danger)" />}
              <span>{s.meta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid mb-6">
        <div className="chart-card">
          <div className="chart-title">Income vs Expenses</div>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" fill="#22c55e" radius={[4,4,0,0]} name="Income" maxBarSize={32} />
                <Bar dataKey="expenses" fill="#6366f1" radius={[4,4,0,0]} name="Expenses" maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: 220 }}>
              <TrendingUp size={32} color="var(--border2)" />
              <p>Upload transactions to see trends</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-title">Spending by Category</div>
          {catSpending.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={catSpending} dataKey="total" nameKey="category"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                  paddingAngle={3}
                >
                  {catSpending.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 12
                }} />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11, color: 'var(--text2)' }}>{value}</span>}
                  iconSize={8} iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: 220 }}>
              <Wallet size={32} color="var(--border2)" />
              <p>No spending data this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
<div className="bottom-row">

        {/* Recent transactions */}
        <div className="table-card">
          <div className="table-header">
            <span className="table-title">Recent Transactions</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transactions')}>
              View all
            </button>
          </div>
          {recentTx.length > 0 ? (
            <div>
              {recentTx.map(tx => (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 20px', borderBottom: '1px solid var(--bg)',
                  transition: 'background 0.1s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'var(--surface2)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
                    }}>
                      {tx.Category?.icon || '💰'}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text1)' }}>
                        {tx.description?.substring(0, 22)}{tx.description?.length > 22 ? '…' : ''}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                        {tx.Category?.name || 'Uncategorized'} · {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: 13,
                    color: tx.type === 'credit' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Upload size={28} color="var(--border2)" />
              <p>No transactions yet</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>
                Upload Statement
              </button>
            </div>
          )}
        </div>

        {/* Accounts */}
        <div className="table-card">
          <div className="table-header">
            <span className="table-title">My Accounts</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/accounts')}>
              Manage
            </button>
          </div>
          {accounts.length > 0 ? (
            <div style={{ padding: '8px 12px' }}>
              {accounts.map(acc => {
                const colors = { savings: '#22c55e', current: '#3b82f6', credit: '#ef4444', wallet: '#f97316' };
                const c = colors[acc.type] || '#6366f1';
                return (
                  <div key={acc.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    marginBottom: 6, background: 'var(--bg)',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: c, flexShrink: 0
                      }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{acc.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>{acc.type}</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text1)' }}>
                      {formatCurrency(acc.balance)}
                    </span>
                  </div>
                );
              })}
              <div style={{
                padding: '10px 12px', borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between',
                marginTop: 4
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>Total</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)' }}>
                  {formatCurrency(totalBalance)}
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Wallet size={28} color="var(--border2)" />
              <p>No accounts yet</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/accounts')}>
                Add Account
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .charts-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .bottom-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
