import fs from 'fs/promises';
import path from 'path';
import { DatabaseSchema, Expense, Budgets } from '../models/types';

const DB_PATH = path.join(__dirname, '../../data/db.json');

async function readDB(): Promise<DatabaseSchema> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    // If database file doesn't exist, create it with default structure
    const defaultDB: DatabaseSchema = {
      expenses: [],
      budgets: {
        Food: 0,
        Transport: 0,
        Bills: 0,
        Entertainment: 0,
        Other: 0
      }
    };
    await writeDB(defaultDB);
    return defaultDB;
  }
}

async function writeDB(data: DatabaseSchema): Promise<void> {
  const dir = path.dirname(DB_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  getExpenses: async (): Promise<Expense[]> => {
    const data = await readDB();
    return data.expenses;
  },

  saveExpenses: async (expenses: Expense[]): Promise<void> => {
    const data = await readDB();
    data.expenses = expenses;
    await writeDB(data);
  },

  getBudgets: async (): Promise<Budgets> => {
    const data = await readDB();
    return data.budgets;
  },

  saveBudgets: async (budgets: Budgets): Promise<void> => {
    const data = await readDB();
    data.budgets = budgets;
    await writeDB(data);
  }
};
