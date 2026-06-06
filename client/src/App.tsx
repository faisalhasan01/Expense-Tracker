import { useState, useMemo, useCallback } from 'react';
import { Plus, AlertOctagon, Menu, Wallet, Utensils, Car, FileText, Film, Tag, Calendar, ArrowRight } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SummaryCards from './components/SummaryCards';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import ExpenseCharts from './components/ExpenseCharts';
import BudgetTracker from './components/BudgetTracker';
import Toast from './components/Toast';
import { useExpenses } from './hooks/useExpenses';
import type { Expense, ToastMessage, Category } from './types';
import { formatCurrency, formatDate } from './utils/formatters';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'budgets'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to show toast alert
  const showToast = useCallback((message: string, type: ToastMessage['type']) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Hook for API state & management
  const {
    filteredExpenses,
    budgets,
    stats,
    loading,
    isOffline,
    filters,
    setFilters,
    addExpense,
    updateExpense,
    deleteExpense,
    updateBudget
  } = useExpenses(showToast);

  // Form submission handler (handles both insert and update)
  const handleFormSubmit = async (expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<boolean> => {
    if (editingExpense) {
      return await updateExpense(editingExpense.id, expenseData);
    } else {
      return await addExpense(expenseData);
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  // Find exceeded budgets to show warnings on dashboard
  const exceededCategories = useMemo(() => {
    return (Object.keys(budgets) as Category[]).filter(cat => {
      const budget = budgets[cat] || 0;
      const spent = stats.categoryTotals[cat] || 0;
      return budget > 0 && spent > budget;
    });
  }, [budgets, stats.categoryTotals]);

  // Loading indicator skeleton
  if (loading && toasts.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(99, 102, 241, 0.1)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'pulse 1s linear infinite'
        }} />
        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Loading FinFlow Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Background Ambient Glow Accents */}
      <div className="glow-bg-container">
        <div className="glow-accent-1"></div>
        <div className="glow-accent-2"></div>
        <div className="glow-accent-3"></div>
      </div>

      {/* Toast notifications portal */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Mobile top navbar header */}
      <header className="mobile-nav-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--primary-gradient)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.4), 0 0 3px rgba(249, 115, 22, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Wallet size={16} color="white" />
          </div>
          <span style={{ 
            fontSize: '1.05rem', 
            fontWeight: 800, 
            letterSpacing: '-0.02em',
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0px 0px 6px rgba(59, 130, 246, 0.2))'
          }}>
            FinFlow
          </span>
        </div>
        <button 
          className="btn" 
          onClick={() => setIsSidebarOpen(true)}
          style={{ padding: '0.4rem', border: 'none', background: 'transparent' }}
        >
          <Menu size={22} color="var(--text-primary)" />
        </button>
      </header>

      {/* Responsive Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOffline={isOffline} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main viewport */}
      <main className="main-content">
        {/* Header toolbar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '1.5rem'
        }}>
          <div>
            <h1>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'expenses' && 'Expense Ledger'}
              {activeTab === 'budgets' && 'Budgets & Limits'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {activeTab === 'dashboard' && 'Track spending, view breakdowns, and monitor allowances.'}
              {activeTab === 'expenses' && 'Detailed log of your spending. Apply category and date filters.'}
              {activeTab === 'budgets' && 'Define monthly category thresholds and track status.'}
            </p>
          </div>

          <button className="btn btn-primary" onClick={handleAddNewClick}>
            <Plus size={16} />
            <span>Log Expense</span>
          </button>
        </header>

        {/* Global Exceeded Budget Banner notifications */}
        {activeTab === 'dashboard' && exceededCategories.length > 0 && (
          <div className="glass-card" style={{
            background: 'var(--danger-light)',
            borderColor: 'rgba(244, 63, 94, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1.25rem'
          }}>
            <div style={{ color: 'var(--danger)', marginTop: '2px' }}>
              <AlertOctagon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#fda4af', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                Budget Limit Breaches Detected
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#fca5a5', lineHeight: '1.4' }}>
                You have exceeded set spending limits for: {' '}
                <strong>
                  {exceededCategories.map((cat, idx) => (
                    <span key={cat}>
                      {cat} (exceeded by {formatCurrency((stats.categoryTotals[cat] || 0) - (budgets[cat] || 0))})
                      {idx < exceededCategories.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </strong>
                . Consider reducing expenses in these areas.
              </p>
            </div>
          </div>
        )}

        {/* Tab content rendering logic */}
        {activeTab === 'dashboard' && (
          <>
            <SummaryCards
              totalSpentThisMonth={stats.totalSpentThisMonth}
              highestExpense={stats.highestExpense}
              budgets={budgets}
            />
            
            <ExpenseCharts
              categoryTotals={stats.categoryTotals}
              expenses={filteredExpenses}
            />

            {/* Quick overview of latest activity */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Recent Spending Feed</h2>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => setActiveTab('expenses')}
                >
                  View All Logs
                </button>
              </div>

              {filteredExpenses.length > 0 ? (
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                  {/* Left vertical timeline line */}
                  <div style={{
                    position: 'absolute',
                    left: '21px',
                    top: '12px',
                    bottom: '12px',
                    width: '2px',
                    background: 'linear-gradient(to bottom, var(--primary) 0%, var(--warning) 50%, var(--accent) 100%)',
                    opacity: 0.2
                  }} />

                  {filteredExpenses.slice(0, 5).map((expense) => {
                    // Pick icon and color for the node based on category
                    let icon = <Tag size={14} />;
                    let nodeColor = 'var(--text-muted)';

                    if (expense.category === 'Food') {
                      icon = <Utensils size={14} />;
                      nodeColor = 'var(--warning)'; // Orange
                    } else if (expense.category === 'Transport') {
                      icon = <Car size={14} />;
                      nodeColor = 'var(--primary)'; // Blue
                    } else if (expense.category === 'Bills') {
                      icon = <FileText size={14} />;
                      nodeColor = 'var(--danger)'; // Red
                    } else if (expense.category === 'Entertainment') {
                      icon = <Film size={14} />;
                      nodeColor = 'var(--accent)'; // Yellow
                    }

                    return (
                      <div key={expense.id} style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        {/* Timeline circular node containing icon */}
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: 'var(--bg-secondary)',
                          border: `2px solid ${nodeColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: nodeColor,
                          boxShadow: `0 0 10px ${nodeColor}33`,
                          flexShrink: 0
                        }}>
                          {icon}
                        </div>

                        {/* Timeline content card */}
                        <div 
                          className="glass-card glass-card-interactive" 
                          style={{ 
                            flex: 1, 
                            padding: '1rem 1.25rem', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            background: 'rgba(15, 21, 36, 0.45)',
                            borderLeft: `3px solid ${nodeColor}`,
                            margin: 0
                          }}
                          onClick={() => handleEditClick(expense)}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {expense.note || `${expense.category} Spend`}
                              </span>
                              <span className={`badge badge-${expense.category.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                                {expense.category}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              <Calendar size={12} />
                              <span>{formatDate(expense.date)}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                              {formatCurrency(expense.amount)}
                            </span>
                            <button 
                              className="btn"
                              style={{ padding: '0.35rem', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                              onClick={(e) => { e.stopPropagation(); deleteExpense(expense.id); }}
                              title="Delete entry"
                            >
                              <ArrowRight size={16} color="var(--text-muted)" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                  <Calendar size={36} />
                  <p>No recent activity. Log a new expense to get started!</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'expenses' && (
          <ExpenseTable
            expenses={filteredExpenses}
            filters={filters}
            setFilters={setFilters}
            onEdit={handleEditClick}
            onDelete={deleteExpense}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetTracker
            budgets={budgets}
            categoryTotals={stats.categoryTotals}
            onUpdateBudget={updateBudget}
          />
        )}

        {/* Form Modal overlay (used for Add and Edit actions) */}
        <ExpenseForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          editingExpense={editingExpense}
        />
      </main>
    </div>
  );
}
