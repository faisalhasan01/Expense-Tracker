import { useState, useMemo, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Edit2, Trash2, Download, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import type { Expense, FilterState, Category, DateFilterType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ExpenseTableProps {
  expenses: Expense[];
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES: Category[] = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

export default function ExpenseTable({ expenses, filters, setFilters, onEdit, onDelete }: ExpenseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Handle Export to CSV
  const handleCSVExport = () => {
    if (expenses.length === 0) return;
    
    const headers = ['Date', 'Category', 'Amount (INR)', 'Note', 'Logged At'];
    const rows = expenses.map(e => [
      e.date,
      e.category,
      e.amount.toFixed(2),
      e.note || '',
      new Date(e.createdAt).toLocaleString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finflow_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination calculations
  const totalPages = Math.ceil(expenses.length / itemsPerPage) || 1;
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return expenses.slice(startIndex, startIndex + itemsPerPage);
  }, [expenses, currentPage]);

  const getBadgeClass = (category: Category) => {
    switch (category) {
      case 'Food': return 'badge-food';
      case 'Transport': return 'badge-transport';
      case 'Bills': return 'badge-bills';
      case 'Entertainment': return 'badge-entertainment';
      default: return 'badge-other';
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Filtering & Export Controls */}
      <div className="filter-bar">
        <div className="filters-left">
          {/* Search by note */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search notes..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-input"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date Preset Filter */}
          <div>
            <select
              className="form-input"
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as DateFilterType }))}
            >
              <option value="all">All Dates</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range Selectors */}
          {filters.dateRange === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="form-input"
                style={{ width: '140px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                value={filters.startDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                placeholder="Start Date"
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
              <input
                type="date"
                className="form-input"
                style={{ width: '140px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                value={filters.endDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                placeholder="End Date"
              />
            </div>
          )}
        </div>

        <div className="filters-right">
          {/* CSV Export Button */}
          <button
            className="btn btn-secondary"
            onClick={handleCSVExport}
            disabled={expenses.length === 0}
            title="Export filtered records to CSV file"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="table-container">
        {expenses.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {formatDate(expense.date)}
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: expense.note ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {expense.note || '—'}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(expense.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem', borderRadius: '6px' }}
                        onClick={() => onEdit(expense)}
                        title="Edit entry"
                      >
                        <Edit2 size={14} color="var(--primary)" />
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem', borderRadius: '6px' }}
                        onClick={() => onDelete(expense.id)}
                        title="Delete entry"
                      >
                        <Trash2 size={14} color="var(--danger)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '50%', color: 'var(--text-muted)' }}>
              <Filter size={32} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No expenses found</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Try adjusting your filters, searching differently, or log a new expense.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {expenses.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, expenses.length)} of {expenses.length} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.5rem', borderRadius: '6px' }}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.5rem', borderRadius: '6px' }}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
