import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { Category } from '../models/types';

const VALID_CATEGORIES: Category[] = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

export const getBudgets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budgets = await db.getBudgets();
    res.json(budgets);
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, amount } = req.body;
    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    if (typeof parsedAmount !== 'number' || parsedAmount < 0) {
      return res.status(400).json({ error: 'Budget amount must be a non-negative number.' });
    }

    const budgets = await db.getBudgets();
    budgets[category as Category] = parsedAmount;
    await db.saveBudgets(budgets);

    res.json(budgets);
  } catch (error) {
    next(error);
  }
};
