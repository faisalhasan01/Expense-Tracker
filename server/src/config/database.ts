import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { Expense, Budgets, Category } from '../models/types';

const DB_PATH = path.join(__dirname, '../../data/database.sqlite');

let dbConn: sqlite3.Database;

function getDbConnection(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    if (dbConn) return resolve(dbConn);
    
    const dbDir = path.dirname(DB_PATH);
    if (!existsSync(dbDir)) {
      try {
        mkdirSync(dbDir, { recursive: true });
      } catch (mkdirErr) {
        return reject(mkdirErr);
      }
    }
    
    dbConn = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err);
      
      // Initialize database schema and handle legacy migration
      dbConn.serialize(() => {
        dbConn.run(`
          CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL,
            note TEXT,
            createdAt TEXT NOT NULL
          )
        `);
        
        dbConn.run(`
          CREATE TABLE IF NOT EXISTS budgets (
            category TEXT PRIMARY KEY,
            amount REAL NOT NULL
          )
        `, () => {
          // Initialize budgets table if empty
          dbConn.get('SELECT COUNT(*) as count FROM budgets', (err, row: any) => {
            if (!err && row && row.count === 0) {
              const stmt = dbConn.prepare('INSERT INTO budgets (category, amount) VALUES (?, ?)');
              stmt.run('Food', 0);
              stmt.run('Transport', 0);
              stmt.run('Bills', 0);
              stmt.run('Entertainment', 0);
              stmt.run('Other', 0);
              stmt.finalize();
            }
            
            // Check if expenses are empty to trigger auto-migration from db.json
            dbConn.get('SELECT COUNT(*) as count FROM expenses', async (err, row: any) => {
              if (!err && row && row.count === 0) {
                const jsonPath = path.join(__dirname, '../../data/db.json');
                try {
                  const fileData = await fs.readFile(jsonPath, 'utf-8');
                  const data = JSON.parse(fileData);
                  
                  if (data && data.expenses && data.expenses.length > 0) {
                    dbConn.serialize(() => {
                      const stmt = dbConn.prepare('INSERT INTO expenses (id, amount, category, date, note, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
                      for (const exp of data.expenses) {
                        stmt.run(exp.id, exp.amount, exp.category, exp.date, exp.note || null, exp.createdAt);
                      }
                      stmt.finalize();
                    });
                    console.log(`[SQLite Database] Migrated ${data.expenses.length} expenses from db.json.`);
                  }
                  
                  if (data && data.budgets) {
                    dbConn.serialize(() => {
                      const stmt = dbConn.prepare('INSERT OR REPLACE INTO budgets (category, amount) VALUES (?, ?)');
                      for (const [cat, amt] of Object.entries(data.budgets)) {
                        stmt.run(cat, amt);
                      }
                      stmt.finalize();
                    });
                    console.log('[SQLite Database] Migrated budget allowances from db.json.');
                  }
                } catch (jsonErr) {
                  // Legacy file does not exist or empty, skip migration
                  console.log('[SQLite Database] No legacy database file to migrate.');
                }
              }
            });

            resolve(dbConn);
          });
        });
      });
    });
  });
}

// Pre-initialize connection
getDbConnection().catch(err => {
  console.error('[SQLite Database] Failed to initialize SQLite database connection:', err);
});

export const db = {
  getExpenses: async (): Promise<Expense[]> => {
    const conn = await getDbConnection();
    return new Promise((resolve, reject) => {
      conn.all('SELECT * FROM expenses', (err, rows) => {
        if (err) return reject(err);
        
        const mapped = (rows || []).map((row: any) => ({
          id: row.id,
          amount: row.amount,
          category: row.category as Category,
          date: row.date,
          note: row.note === null ? undefined : row.note,
          createdAt: row.createdAt
        }));
        resolve(mapped);
      });
    });
  },

  saveExpenses: async (expenses: Expense[]): Promise<void> => {
    const conn = await getDbConnection();
    return new Promise((resolve, reject) => {
      conn.serialize(() => {
        conn.run('BEGIN TRANSACTION');
        conn.run('DELETE FROM expenses', (err) => {
          if (err) {
            conn.run('ROLLBACK');
            return reject(err);
          }
          
          const stmt = conn.prepare('INSERT INTO expenses (id, amount, category, date, note, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
          let hasError = false;
          
          for (const exp of expenses) {
            stmt.run(exp.id, exp.amount, exp.category, exp.date, exp.note || null, exp.createdAt, (stmtErr: Error | null) => {
              if (stmtErr) {
                console.error('[SQLite Database] Error preparing expense row insert:', stmtErr);
                hasError = true;
              }
            });
          }
          
          stmt.finalize((finalizeErr) => {
            if (finalizeErr || hasError) {
              conn.run('ROLLBACK');
              return reject(finalizeErr || new Error('[SQLite Database] Failed to serialize one or more expense insertions.'));
            }
            conn.run('COMMIT', (commitErr) => {
              if (commitErr) return reject(commitErr);
              resolve();
            });
          });
        });
      });
    });
  },

  getBudgets: async (): Promise<Budgets> => {
    const conn = await getDbConnection();
    return new Promise((resolve, reject) => {
      conn.all('SELECT * FROM budgets', (err, rows) => {
        if (err) return reject(err);
        
        const budgets: Budgets = {
          Food: 0,
          Transport: 0,
          Bills: 0,
          Entertainment: 0,
          Other: 0
        };
        
        if (rows) {
          for (const row of rows as any[]) {
            if (row.category in budgets) {
              budgets[row.category as Category] = row.amount;
            }
          }
        }
        resolve(budgets);
      });
    });
  },

  saveBudgets: async (budgets: Budgets): Promise<void> => {
    const conn = await getDbConnection();
    return new Promise((resolve, reject) => {
      conn.serialize(() => {
        conn.run('BEGIN TRANSACTION');
        const stmt = conn.prepare('INSERT OR REPLACE INTO budgets (category, amount) VALUES (?, ?)');
        let hasError = false;
        
        for (const [category, amount] of Object.entries(budgets)) {
          stmt.run(category, amount, (stmtErr: Error | null) => {
            if (stmtErr) {
              console.error('[SQLite Database] Error preparing budget row update:', stmtErr);
              hasError = true;
            }
          });
        }
        
        stmt.finalize((finalizeErr) => {
          if (finalizeErr || hasError) {
            conn.run('ROLLBACK');
            return reject(finalizeErr || new Error('[SQLite Database] Failed to serialize budget updates.'));
          }
          conn.run('COMMIT', (commitErr) => {
            if (commitErr) return reject(commitErr);
            resolve();
          });
        });
      });
    });
  }
};
