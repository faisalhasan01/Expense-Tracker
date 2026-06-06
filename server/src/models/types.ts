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

export interface DatabaseSchema {
  expenses: Expense[];
  budgets: Budgets;
}
