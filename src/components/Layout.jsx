import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
  LayoutDashboard, ArrowUpDown, Upload,
  Target, CreditCard, TrendingUp, LogOut, Menu, X, ChevronLeft
} from 'lucide-react';

const NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/transactions', icon: ArrowUpDown,      label: 'Transactions' },
  { to: '/upload',       icon: Upload,           label: 'Upload'       },
  { to: '/budgets',      icon: Target,           label: 'Budgets'      },
  { to: '/accounts',     icon: CreditCard,       label: 'Accounts'     },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="app-layout">

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={closeMobile}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <TrendingUp size={18} color="white" />
          </div>
          <span className="sidebar-logo-text">FinTrack</span>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {/* Mobile close */}
          <button
            onClick={closeMobile}
           style={{
  display: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'rgba(255,255,255,0.5)',
  marginLeft: 'auto',
  padding: '4px'
}}
            className="mobile-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <Icon size={17} className="nav-item-icon" />
              <span className="nav-item-label">{label}</span>
              <span className="sidebar-tooltip">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name truncate">{user?.name}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
            <button className="sidebar-logout" onClick={handleLogout} title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">

        {/* Mobile topbar */}
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="topbar-logo">
            <div style={{ background: 'var(--brand)', borderRadius: 8, padding: 5, display: 'flex' }}>
              <TrendingUp size={14} color="white" />
            </div>
            FinTrack
          </div>
        </header>

        <div className="page-content fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
