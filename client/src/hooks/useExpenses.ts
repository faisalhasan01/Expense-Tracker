import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Expense, Budgets, FilterState, Category } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const DEFAULT_BUDGETS: Budgets = {
  Food: 0,
  Transport: 0,
  Bills: 0,
  Entertainment: 0,
  Other: 0
};

export function useExpenses(
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void
) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budgets>(DEFAULT_BUDGETS);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    dateRange: 'all',
    searchQuery: ''
  });
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Load from local storage fallback
  const getLocalData = useCallback(() => {
    const localExp = localStorage.getItem('expenses');
    const localBud = localStorage.getItem('budgets');
    return {
      expenses: localExp ? JSON.parse(localExp) : [],
      budgets: localBud ? JSON.parse(localBud) : DEFAULT_BUDGETS
    };
  }, []);

  const saveLocalData = useCallback((exp: Expense[], bud: Budgets) => {
    localStorage.setItem('expenses', JSON.stringify(exp));
    localStorage.setItem('budgets', JSON.stringify(bud));
  }, []);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Check server health first with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const healthRes = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!healthRes.ok) throw new Error('Server unhealthy');

      // Server is online, load from server
      const [expRes, budRes] = await Promise.all([
        fetch(`${API_BASE_URL}/expenses`),
        fetch(`${API_BASE_URL}/budgets`)
      ]);

      if (!expRes.ok || !budRes.ok) throw new Error('Failed to load data from server');

      const expData = await expRes.json();
      const budData = await budRes.json();

      setExpenses(expData);
      setBudgets(budData);
      setIsOffline(false);
      // Sync local storage as backup
      saveLocalData(expData, budData);
    } catch (error) {
      console.warn('Backend server unreachable. Running in offline/localStorage mode.', error);
      setIsOffline(true);
      const local = getLocalData();
      setExpenses(local.expenses);
      setBudgets(local.budgets);
      showToast('Running in offline mode (local storage)', 'info');
    } finally {
      setLoading(false);
    }
  }, [getLocalData, saveLocalData, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add Expense
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (isOffline) {
      const newExpense: Expense = {
        ...expenseData,
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date().toISOString()
      };
      const updated = [newExpense, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExpenses(updated);
      saveLocalData(updated, budgets);
      showToast('Expense added successfully', 'success');
      return true;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add expense');
      }
      const data = await res.json();
      setExpenses(prev => [data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      showToast('Expense added successfully', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Error adding expense', 'error');
      return false;
    }
  };

  // Update Expense
  const updateExpense = async (id: string, expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (isOffline) {
      const updated = expenses.map(e => e.id === id ? { ...e, ...expenseData } : e)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExpenses(updated);
      saveLocalData(updated, budgets);
      showToast('Expense updated successfully', 'success');
      return true;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update expense');
      }
      const data = await res.json();
      setExpenses(prev => prev.map(e => e.id === id ? data : e).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      showToast('Expense updated successfully', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Error updating expense', 'error');
      return false;
    }
  };

  // Delete Expense
  const deleteExpense = async (id: string) => {
    if (isOffline) {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      saveLocalData(updated, budgets);
      showToast('Expense deleted successfully', 'success');
      return true;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete expense');
      setExpenses(prev => prev.filter(e => e.id !== id));
      showToast('Expense deleted successfully', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Error deleting expense', 'error');
      return false;
    }
  };

  // Update Budget for a category
  const updateBudget = async (category: Category, amount: number) => {
    const updatedBudgets = { ...budgets, [category]: amount };
    if (isOffline) {
      setBudgets(updatedBudgets);
      saveLocalData(expenses, updatedBudgets);
      showToast(`Budget for ${category} updated`, 'success');
      return true;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount })
      });
      if (!res.ok) throw new Error('Failed to update budget');
      setBudgets(updatedBudgets);
      showToast(`Budget for ${category} updated`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Error updating budget', 'error');
      return false;
    }
  };

  // Local filtering logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // 1. Category filter
      if (filters.category && expense.category !== filters.category) {
        return false;
      }

      // 2. Search Query filter (matches notes)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!expense.note || !expense.note.toLowerCase().includes(query)) {
          return false;
        }
      }

      // 3. Date range filter
      if (filters.dateRange === 'all') {
        return true;
      }

      const expDate = new Date(expense.date);
      const now = new Date();
      
      if (filters.dateRange === 'this-month') {
        return expDate.getFullYear() === now.getFullYear() && expDate.getMonth() === now.getMonth();
      }

      if (filters.dateRange === 'last-month') {
        let lastMonth = now.getMonth() - 1;
        let year = now.getFullYear();
        if (lastMonth < 0) {
          lastMonth = 11;
          year -= 1;
        }
        return expDate.getFullYear() === year && expDate.getMonth() === lastMonth;
      }

      if (filters.dateRange === 'custom') {
        if (filters.startDate) {
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);
          if (expDate < start) return false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          if (expDate > end) return false;
        }
      }

      return true;
    });
  }, [expenses, filters]);

  // Aggregate stats
  const stats = useMemo(() => {
    const now = new Date();
    
    // Total spent this month
    const thisMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    
    const totalSpentThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Total spent per category (all time or filtered? Let's do all time or filtered as appropriate. Let's do all-time for dashboard clarity, or this month. The brief asks for "Total spent per category" and "Total spent this month". Let's show category spending matching current month expenses or all-time. Let's do current month category spending to align with "Total spent this month" budget tracking!)
    const categoryTotals: Record<Category, number> = {
      Food: 0,
      Transport: 0,
      Bills: 0,
      Entertainment: 0,
      Other: 0
    };
    
    thisMonthExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    // Highest single expense (all time)
    const highestExpense = expenses.reduce((max, e) => e.amount > max ? e.amount : max, 0);

    return {
      totalSpentThisMonth,
      categoryTotals,
      highestExpense
    };
  }, [expenses]);

  return {
    expenses,
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
    updateBudget,
    refresh: fetchData
  };
}
