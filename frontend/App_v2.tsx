import React, { useState } from 'react';
import { CustomerOrders } from './components/CustomerOrders';
import { Dashboard } from './components/Dashboard';

type Page = 'dashboard' | 'orders';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('orders');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={logoWrap}>
          <div style={logoDot} />
          <span style={logoText}>Halleyx</span>
        </div>
        <nav style={{ padding: '0.5rem 0' }}>
          {[
            { id: 'dashboard', icon: '◈', label: 'Dashboard' },
            { id: 'orders',    icon: '📋', label: 'Customer Orders' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id as Page)}
              style={{
                ...navItem,
                background: page === item.id ? 'rgba(16,185,129,0.1)' : 'transparent',
                color: page === item.id ? '#10B981' : '#9CA3AF',
                fontWeight: page === item.id ? 600 : 400,
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {page === 'orders' ? <CustomerOrders /> : <Dashboard />}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        input:focus, select:focus { border-color: #10B981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        tr:hover td { background: #F0FDF4 !important; }
        .react-grid-item.react-grid-placeholder { background: #10B981 !important; opacity: 0.15 !important; border-radius: 12px !important; }
        .react-resizable-handle { opacity: 0.4; }
        .react-resizable-handle:hover { opacity: 1; }
      `}</style>
    </div>
  );
};

const sidebarStyle: React.CSSProperties = {
  width: '220px', background: '#111827', flexShrink: 0,
  padding: '1.5rem 0', display: 'flex', flexDirection: 'column',
};
const logoWrap: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
  marginBottom: '0.5rem',
};
const logoDot: React.CSSProperties = {
  width: '28px', height: '28px', borderRadius: '8px',
  background: 'linear-gradient(135deg, #10B981, #059669)',
};
const logoText: React.CSSProperties = {
  fontSize: '17px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
};
const navItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '0.65rem 1.25rem', width: '100%', border: 'none',
  cursor: 'pointer', fontSize: '14px', borderRadius: '0',
  transition: 'all 0.15s', textAlign: 'left',
};

export default App;
