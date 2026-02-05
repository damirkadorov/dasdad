import { Database } from './types';

// In-memory database for backward compatibility
// This provides a simple JSON-like database interface for the API routes
// WARNING: This is a shared mutable state and not suitable for production.
// Data is not persistent and will be lost on server restart.
// In production, consider migrating to the MongoDB-based functions in database.ts
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
