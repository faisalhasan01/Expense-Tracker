import { LayoutDashboard, Receipt, Wallet, Wifi, WifiOff, X } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'expenses' | 'budgets';
  setActiveTab: (tab: 'dashboard' | 'expenses' | 'budgets') => void;
  isOffline: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOffline, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} />
      )}
      
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Logo area & Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'var(--primary-gradient)',
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
            
            {/* Close button for mobile */}
            <button 
              className="mobile-close-btn"
              onClick={onClose}
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'none' /* Will be toggled by media queries in CSS */
              }}
            >
              <X size={20} color="var(--text-secondary)" />
            </button>
          </div>

          {/* Navigation list */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => { setActiveTab('dashboard'); onClose(); }}
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                width: '100%',
                background: activeTab === 'dashboard' ? undefined : 'transparent',
                borderColor: 'transparent',
                color: activeTab === 'dashboard' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('expenses'); onClose(); }}
              className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                width: '100%',
                background: activeTab === 'expenses' ? undefined : 'transparent',
                borderColor: 'transparent',
                color: activeTab === 'expenses' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <Receipt size={18} />
              <span>All Expenses</span>
            </button>

            <button
              onClick={() => { setActiveTab('budgets'); onClose(); }}
              className={`btn ${activeTab === 'budgets' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                width: '100%',
                background: activeTab === 'budgets' ? undefined : 'transparent',
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
    </>
  );
}
