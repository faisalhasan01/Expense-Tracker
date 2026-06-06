import { LayoutDashboard, Receipt, Wallet, Wifi, WifiOff } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'expenses' | 'budgets';
  setActiveTab: (tab: 'dashboard' | 'expenses' | 'budgets') => void;
  isOffline: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, isOffline }: SidebarProps) {
  return (
    <aside className="glass-card" style={{
      width: '260px',
      borderRadius: '0 16px 16px 0',
      borderLeft: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '2rem 1.5rem',
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Logo area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-shadow)'
          }}>
            <Wallet size={20} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              FinFlow
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              EXPENSE TRACKER
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              background: activeTab === 'dashboard' ? 'var(--primary)' : 'transparent',
              borderColor: 'transparent',
              color: activeTab === 'dashboard' ? 'white' : 'var(--text-secondary)'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              background: activeTab === 'expenses' ? 'var(--primary)' : 'transparent',
              borderColor: 'transparent',
              color: activeTab === 'expenses' ? 'white' : 'var(--text-secondary)'
            }}
          >
            <Receipt size={18} />
            <span>All Expenses</span>
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`btn ${activeTab === 'budgets' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              background: activeTab === 'budgets' ? 'var(--primary)' : 'transparent',
              borderColor: 'transparent',
              color: activeTab === 'budgets' ? 'white' : 'var(--text-secondary)'
            }}
          >
            <Wallet size={18} />
            <span>Category Budgets</span>
          </button>
        </nav>
      </div>

      {/* Network Status indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        borderRadius: '8px',
        background: isOffline ? 'var(--warning-light)' : 'var(--success-light)',
        color: isOffline ? '#fed7aa' : '#a7f3d0',
        fontSize: '0.8rem',
        fontWeight: 500
      }}>
        {isOffline ? (
          <>
            <WifiOff size={16} color="var(--warning)" />
            <span>Offline (Local Storage)</span>
          </>
        ) : (
          <>
            <Wifi size={16} color="var(--success)" />
            <span>Connected to Server</span>
          </>
        )}
      </div>
    </aside>
  );
}
