import { MongoClient, Db, Collection } from 'mongodb';
import { User, Card, Transaction, BankAccount, Trade, Loan, SavingsAccount, CreditCard, Bill, Investment, Product, Order } from './types';

// MongoDB connection URI from environment variable
// Will be validated when connecting, not at module load time (for build compatibility)
const MONGODB_URI = process.env.MONGODB_URI;

// Global variable to cache the MongoDB client for reuse in serverless functions
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connect to MongoDB and return the database instance
 * Reuses existing connection in serverless environment (Vercel)
 */
export async function connectToDatabase(): Promise<Db> {
  // Validate URI only when connecting
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  // Create new MongoDB client
  const client = new MongoClient(MONGODB_URI);

  // Connect to MongoDB
  await client.connect();

  // Get database instance (database name should be in MONGODB_URI or specified here)
  const db = client.db('dasdad');

  // Cache the connection for reuse
  cachedClient = client;
  cachedDb = db;

  return db;
}

/**
 * Get the users collection
 */
export async function getUsersCollection(): Promise<Collection<User>> {
  const db = await connectToDatabase();
  return db.collection<User>('users');
}

/**
 * Get the cards collection
 */
export async function getCardsCollection(): Promise<Collection<Card>> {
  const db = await connectToDatabase();
  return db.collection<Card>('cards');
}

/**
 * Get the transactions collection
 */
export async function getTransactionsCollection(): Promise<Collection<Transaction>> {
  const db = await connectToDatabase();
  return db.collection<Transaction>('transactions');
}

/**
 * Get the bank accounts collection
 */
export async function getBankAccountsCollection(): Promise<Collection<BankAccount>> {
  const db = await connectToDatabase();
  return db.collection<BankAccount>('bankAccounts');
}

/**
 * Get the trades collection
 */
export async function getTradesCollection(): Promise<Collection<Trade>> {
  const db = await connectToDatabase();
  return db.collection<Trade>('trades');
}

/**
 * Get the loans collection
 */
export async function getLoansCollection(): Promise<Collection<Loan>> {
  const db = await connectToDatabase();
  return db.collection<Loan>('loans');
}

/**
 * Get the savings accounts collection
 */
export async function getSavingsAccountsCollection(): Promise<Collection<SavingsAccount>> {
  const db = await connectToDatabase();
  return db.collection<SavingsAccount>('savingsAccounts');
}

/**
 * Get the credit cards collection
 */
export async function getCreditCardsCollection(): Promise<Collection<CreditCard>> {
  const db = await connectToDatabase();
  return db.collection<CreditCard>('creditCards');
}

/**
 * Get the bills collection
 */
export async function getBillsCollection(): Promise<Collection<Bill>> {
  const db = await connectToDatabase();
  return db.collection<Bill>('bills');
}

/**
 * Get the investments collection
 */
export async function getInvestmentsCollection(): Promise<Collection<Investment>> {
  const db = await connectToDatabase();
  return db.collection<Investment>('investments');
}

/**
 * Get the products collection
 */
export async function getProductsCollection(): Promise<Collection<Product>> {
  const db = await connectToDatabase();
  return db.collection<Product>('products');
}

/**
 * Get the orders collection
 */
export async function getOrdersCollection(): Promise<Collection<Order>> {
  const db = await connectToDatabase();
  return db.collection<Order>('orders');
}
