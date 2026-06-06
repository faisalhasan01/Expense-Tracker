import { useState } from 'react';
import { ShieldAlert, Save, Edit2, AlertCircle, Utensils, Car, FileText, Film, Tag } from 'lucide-react';
import type { Category, Budgets } from '../types';
import { formatCurrency } from '../utils/formatters';

interface BudgetTrackerProps {
  budgets: Budgets;
  categoryTotals: Record<Category, number>;
  onUpdateBudget: (category: Category, amount: number) => Promise<boolean>;
}

const CATEGORIES: Category[] = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

export default function BudgetTracker({ budgets, categoryTotals, onUpdateBudget }: BudgetTrackerProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleEditClick = (category: Category, currentAmount: number) => {
    setEditingCategory(category);
    setInputValue(currentAmount > 0 ? currentAmount.toString() : '');
  };

  const handleSaveClick = async (category: Category) => {
    const parsedAmount = parseFloat(inputValue);
    const amount = isNaN(parsedAmount) || parsedAmount < 0 ? 0 : parsedAmount;
    
    const success = await onUpdateBudget(category, amount);
    if (success) {
      setEditingCategory(null);
    }
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'Food': return <Utensils size={16} style={{ marginRight: '6px' }} />;
      case 'Transport': return <Car size={16} style={{ marginRight: '6px' }} />;
      case 'Bills': return <FileText size={16} style={{ marginRight: '6px' }} />;
      case 'Entertainment': return <Film size={16} style={{ marginRight: '6px' }} />;
      default: return <Tag size={16} style={{ marginRight: '6px' }} />;
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Category Budget Limits</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Set monthly budget allowances per category to monitor and prevent overspending.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {CATEGORIES.map(category => {
          const budget = budgets[category] || 0;
          const spent = categoryTotals[category] || 0;
          const isEditing = editingCategory === category;
          
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;
          const isExceeded = budget > 0 && spent > budget;
          const isWarning = budget > 0 && spent >= budget * 0.8 && spent <= budget;

          // Colors
          let progressColor = 'var(--primary)';
          if (isExceeded) progressColor = 'var(--danger)';
          else if (isWarning) progressColor = 'var(--warning)';
          else if (budget > 0) progressColor = 'var(--success)';

          return (
            <div
              key={category}
              className="glass-card"
              style={{
                background: 'rgba(255,255,255,0.01)',
                padding: '1.25rem',
                borderLeft: `4px solid ${isExceeded ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--border-glass)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                {/* Category label & status badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center' }}>
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </h3>
                  {isExceeded && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: 'var(--danger-light)',
                      color: '#fca5a5'
                    }}>
                      <ShieldAlert size={12} />
                      Exceeded by {formatCurrency(spent - budget)}
                    </span>
                  )}
                  {isWarning && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: 'var(--warning-light)',
                      color: '#fed7aa'
                    }}>
                      <AlertCircle size={12} />
                      Warning (80%+)
                    </span>
                  )}
                </div>

                {/* Budget setting values */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '120px', padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Limit amount"
                        min="0"
                        step="1"
                      />
                      <button
                        className="btn btn-success"
                        style={{ padding: '0.4rem 0.75rem', borderRadius: '6px' }}
                        onClick={() => handleSaveClick(category)}
                      >
                        <Save size={14} />
                        <span>Save</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Budget Limit: <strong>{budget > 0 ? formatCurrency(budget) : 'Not set'}</strong>
                      </span>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.5rem', borderRadius: '6px' }}
                        onClick={() => handleEditClick(category, budget)}
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress metrics */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Spent: {formatCurrency(spent)}</span>
                {budget > 0 && (
                  <span>
                    {percentage.toFixed(0)}% used of {formatCurrency(budget)}
                  </span>
                )}
              </div>

              {/* Progress Bar visual indicator */}
              {budget > 0 ? (
                <div className="progress-bar-container" style={{ height: '6px', background: 'rgba(255,255,255,0.03)' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: progressColor
                    }}
                  />
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No budget limit set. Add a budget limit to track progress.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
