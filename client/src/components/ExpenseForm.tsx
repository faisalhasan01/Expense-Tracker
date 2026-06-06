import { useState, useEffect } from 'react';
import { X, Edit, Plus, AlertCircle } from 'lucide-react';
import type { Category, Expense } from '../types';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<boolean>;
  editingExpense: Expense | null;
}

const CATEGORIES: Category[] = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

export default function ExpenseForm({ isOpen, onClose, onSubmit, editingExpense }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  
  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string; note?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Set today's date formatted as YYYY-MM-DD for native date picker constraint
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setNote(editingExpense.note || '');
    } else {
      setAmount('');
      setCategory('');
      setDate(todayStr); // Default to today
      setNote('');
    }
    setErrors({});
  }, [editingExpense, isOpen, todayStr]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    const numericAmount = parseFloat(amount);
    if (!amount) {
      newErrors.amount = 'Amount is required.';
    } else if (isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.amount = 'Amount must be a positive number greater than 0.';
    }

    if (!category) {
      newErrors.category = 'Category is required.';
    }

    if (!date) {
      newErrors.date = 'Date is required.';
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        newErrors.date = 'Future dates are not allowed.';
      }
    }

    if (note && note.length > 200) {
      newErrors.note = 'Note cannot exceed 200 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const success = await onSubmit({
      amount: parseFloat(amount),
      category: category as Category,
      date,
      note: note.trim() || undefined
    });
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            {editingExpense ? <Edit size={20} color="var(--primary)" /> : <Plus size={20} color="var(--primary)" />}
            {editingExpense ? 'Edit Expense' : 'Log New Expense'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {editingExpense ? 'Modify details of this logged transaction.' : 'Fill in transaction details to log spending.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Amount field */}
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 350.00"
              className={`form-input ${errors.amount ? 'invalid' : ''}`}
              disabled={submitting}
            />
            {errors.amount && (
              <span className="form-error">
                <AlertCircle size={14} />
                <span>{errors.amount}</span>
              </span>
            )}
          </div>

          {/* Category field */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={`form-input ${errors.category ? 'invalid' : ''}`}
              disabled={submitting}
            >
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && (
              <span className="form-error">
                <AlertCircle size={14} />
                <span>{errors.category}</span>
              </span>
            )}
          </div>

          {/* Date field */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              max={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`form-input ${errors.date ? 'invalid' : ''}`}
              disabled={submitting}
            />
            {errors.date && (
              <span className="form-error">
                <AlertCircle size={14} />
                <span>{errors.date}</span>
              </span>
            )}
          </div>

          {/* Note field */}
          <div className="form-group">
            <label className="form-label">Optional Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was this expense for?"
              className={`form-input ${errors.note ? 'invalid' : ''}`}
              style={{
                resize: 'vertical',
                minHeight: '80px'
              }}
              disabled={submitting}
            />
            {errors.note && (
              <span className="form-error">
                <AlertCircle size={14} />
                <span>{errors.note}</span>
              </span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingExpense ? 'Save Changes' : 'Log Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
