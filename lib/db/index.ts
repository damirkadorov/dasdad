import { Database } from './types';

// In-memory database for backward compatibility
// This provides a simple JSON-like database interface for the API routes
let db: Database = {
  users: [],
  cards: [],
  transactions: [],
  bankAccounts: [],
  trades: [],
  loans: [],
  savingsAccounts: [],
  creditCards: [],
  bills: [],
  investments: [],
};

export function getDb(): Database {
  return db;
}

export function setDb(newDb: Database): void {
  db = newDb;
}
