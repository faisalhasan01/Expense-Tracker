import { useState, useMemo, useCallback } from 'react';
import { Plus, AlertOctagon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SummaryCards from './components/SummaryCards';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import ExpenseCharts from './components/ExpenseCharts';
import BudgetTracker from './components/BudgetTracker';
import Toast from './components/Toast';
import { useExpenses } from './hooks/useExpenses';
import type { Expense, ToastMessage, Category } from './types';
import { formatCurrency } from './utils/formatters';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'budgets'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
      {/* Toast notifications portal */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Persistent left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOffline={isOffline} />

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
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Recent Spending Log</h2>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => setActiveTab('expenses')}
                >
                  View All Logged Data
                </button>
              </div>
              <ExpenseTable
                expenses={filteredExpenses.slice(0, 5)} // Limit to 5 items on dashboard
                filters={filters}
                setFilters={setFilters}
                onEdit={handleEditClick}
                onDelete={deleteExpense}
              />
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
