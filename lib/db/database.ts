import fs from 'fs';
import path from 'path';
import { Database, User, Card, Transaction } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

// Ensure data directory and database file exist
function ensureDatabase(): Database {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData: Database = {
      users: [],
      cards: [],
      transactions: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }

  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

function saveDatabase(db: Database): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// User operations
export function getAllUsers(): User[] {
  const db = ensureDatabase();
  return db.users;
}

export function getUserById(id: string): User | undefined {
  const db = ensureDatabase();
  return db.users.find(user => user.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  const db = ensureDatabase();
  return db.users.find(user => user.email === email);
}

export function getUserByUsername(username: string): User | undefined {
  const db = ensureDatabase();
  return db.users.find(user => user.username === username);
}

export function createUser(user: User): User {
  const db = ensureDatabase();
  db.users.push(user);
  saveDatabase(db);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = ensureDatabase();
  const userIndex = db.users.findIndex(user => user.id === id);
  
  if (userIndex === -1) return null;
  
  db.users[userIndex] = { ...db.users[userIndex], ...updates };
  saveDatabase(db);
  return db.users[userIndex];
}

// Card operations
export function getCardsByUserId(userId: string): Card[] {
  const db = ensureDatabase();
  return db.cards.filter(card => card.userId === userId);
}

export function getCardById(id: string): Card | undefined {
  const db = ensureDatabase();
  return db.cards.find(card => card.id === id);
}

export function createCard(card: Card): Card {
  const db = ensureDatabase();
  db.cards.push(card);
  saveDatabase(db);
  return card;
}

export function updateCard(id: string, updates: Partial<Card>): Card | null {
  const db = ensureDatabase();
  const cardIndex = db.cards.findIndex(card => card.id === id);
  
  if (cardIndex === -1) return null;
  
  db.cards[cardIndex] = { ...db.cards[cardIndex], ...updates };
  saveDatabase(db);
  return db.cards[cardIndex];
}

export function deleteCard(id: string): boolean {
  const db = ensureDatabase();
  const cardIndex = db.cards.findIndex(card => card.id === id);
  
  if (cardIndex === -1) return false;
  
  db.cards.splice(cardIndex, 1);
  saveDatabase(db);
  return true;
}

// Transaction operations
export function getTransactionsByUserId(userId: string): Transaction[] {
  const db = ensureDatabase();
  return db.transactions
    .filter(tx => tx.userId === userId || tx.recipientId === userId || tx.senderId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createTransaction(transaction: Transaction): Transaction {
  const db = ensureDatabase();
  db.transactions.push(transaction);
  saveDatabase(db);
  return transaction;
}
