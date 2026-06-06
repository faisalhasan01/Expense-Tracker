import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { Category, Expense } from '../models/types';

const VALID_CATEGORIES: Category[] = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

function validateExpenseData(amount: any, category: any, date: any, note: any): string | null {
  if (typeof amount !== 'number' || amount <= 0) {
    return 'Amount must be a positive number greater than 0.';
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return `Category must be one of: ${VALID_CATEGORIES.join(', ')}`;
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return 'Date is required and must be in YYYY-MM-DD format.';
  }

  const expenseDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Allow expenses up to the end of today local time

  if (expenseDate > today) {
    return 'Future dates are not allowed.';
  }

  if (note && typeof note !== 'string') {
    return 'Note must be a string.';
  }

  return null;
}

export const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenses = await db.getExpenses();
    // Sort by date newest first
    const sorted = [...expenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) {
        return dateB - dateA; // Sort by date descending
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Fallback to creation time
    });
    res.json(sorted);
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, category, date, note } = req.body;
    
    // Parse numeric value if string
    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    const validationError = validateExpenseData(parsedAmount, category, date, note);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const expenses = await db.getExpenses();
    const newExpense: Expense = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      amount: parsedAmount,
      category,
      date,
      note: note ? note.trim() : undefined,
      createdAt: new Date().toISOString()
    };

    expenses.push(newExpense);
    await db.saveExpenses(expenses);

    res.status(201).json(newExpense);
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount, category, date, note } = req.body;

    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    const validationError = validateExpenseData(parsedAmount, category, date, note);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const expenses = await db.getExpenses();
    const index = expenses.findIndex(e => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    const updatedExpense: Expense = {
      ...expenses[index],
      amount: parsedAmount,
      category,
      date,
      note: note ? note.trim() : undefined
    };

    expenses[index] = updatedExpense;
    await db.saveExpenses(expenses);

    res.json(updatedExpense);
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const expenses = await db.getExpenses();
    const index = expenses.findIndex(e => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    expenses.splice(index, 1);
    await db.saveExpenses(expenses);

    res.json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
