import { IndianRupee, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { Budgets } from '../types';

interface SummaryCardsProps {
  totalSpentThisMonth: number;
  highestExpense: number;
  budgets: Budgets;
}

export default function SummaryCards({ totalSpentThisMonth, highestExpense, budgets }: SummaryCardsProps) {
  // Calculate total monthly budget
  const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
  
  // Calculate percentage of budget used
  const budgetPercentage = totalBudget > 0 ? (totalSpentThisMonth / totalBudget) * 100 : 0;
  const isOverBudget = totalBudget > 0 && totalSpentThisMonth > totalBudget;

  // Progress bar styling
  let progressBarColor = 'var(--success)';
  let glowClass = 'card-glow-success';
  if (budgetPercentage >= 100) {
    progressBarColor = 'var(--danger)';
    glowClass = 'card-glow-danger';
  } else if (budgetPercentage >= 80) {
    progressBarColor = 'var(--warning)';
    glowClass = 'card-glow-orange';
  }

  return (
    <div className="dashboard-grid">
      {/* Total Spent Card */}
      <div className="glass-card glass-card-interactive card-glow-blue" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(59, 130, 246, 0.05) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IndianRupee size={24} color="var(--primary)" />
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Total Spent (This Month)
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>
            {formatCurrency(totalSpentThisMonth)}
          </h2>
        </div>
      </div>

      {/* Highest Expense Card */}
      <div className="glass-card glass-card-interactive card-glow-orange" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--warning-light) 0%, rgba(249, 115, 22, 0.05) 100%)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          borderRadius: '12px',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <TrendingUp size={24} color="var(--warning)" />
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Highest Single Expense
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>
            {formatCurrency(highestExpense)}
          </h2>
        </div>
      </div>

      {/* Budget Limit Card */}
      <div className={`glass-card glass-card-interactive ${glowClass}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Overall Budget Usage
          </span>
          {totalBudget > 0 ? (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: isOverBudget ? 'var(--danger)' : budgetPercentage >= 80 ? 'var(--warning)' : 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              {isOverBudget ? (
                <>
                  <AlertTriangle size={14} />
                  <span>Exceeded</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>On Track</span>
                </>
              )}
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not Configured</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            {totalBudget > 0 ? `${budgetPercentage.toFixed(1)}%` : '0%'}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {formatCurrency(totalSpentThisMonth)} / {totalBudget > 0 ? formatCurrency(totalBudget) : '₹0.00'}
          </span>
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{
              width: `${Math.min(budgetPercentage, 100)}%`,
              backgroundColor: progressBarColor
            }}
          />
        </div>
      </div>
    </div>
  );
}
