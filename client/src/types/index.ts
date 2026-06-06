export type Category = 'Food' | 'Transport' | 'Bills' | 'Entertainment' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
}

export type Budgets = Record<Category, number>;

export type DateFilterType = 'all' | 'this-month' | 'last-month' | 'custom';

export interface FilterState {
  category: string;
  dateRange: DateFilterType;
  startDate?: string;
  endDate?: string;
  searchQuery: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
