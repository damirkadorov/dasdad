// MongoDB database operations (replacing JSON file storage)
import { User, Card, Transaction, BankAccount, Trade } from './types';
import { getUsersCollection, getCardsCollection, getTransactionsCollection, getBankAccountsCollection, getTradesCollection } from './mongodb';

// User operations - now using MongoDB
export async function getAllUsers(): Promise<User[]> {
  const users = await getUsersCollection();
  return await users.find({}).toArray();
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsersCollection();
  return await users.findOne({ id });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsersCollection();
  return await users.findOne({ email });
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const users = await getUsersCollection();
  return await users.findOne({ username });
}

export async function createUser(user: User): Promise<User> {
  const users = await getUsersCollection();
  await users.insertOne(user);
  return user;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = await getUsersCollection();
  const result = await users.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  // findOneAndUpdate returns null if document not found
  return result ?? null;
}

// Card operations - now using MongoDB
export async function getCardsByUserId(userId: string): Promise<Card[]> {
  const cards = await getCardsCollection();
  return await cards.find({ userId }).toArray();
}

export async function getCardById(id: string): Promise<Card | null> {
  const cards = await getCardsCollection();
  return await cards.findOne({ id });
}

export async function createCard(card: Card): Promise<Card> {
  const cards = await getCardsCollection();
  await cards.insertOne(card);
  return card;
}

export async function updateCard(id: string, updates: Partial<Card>): Promise<Card | null> {
  const cards = await getCardsCollection();
  const result = await cards.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  // findOneAndUpdate returns null if document not found
  return result ?? null;
}

export async function deleteCard(id: string): Promise<boolean> {
  const cards = await getCardsCollection();
  const result = await cards.deleteOne({ id });
  return result.deletedCount > 0;
}

// Transaction operations - now using MongoDB
export async function getTransactionsByUserId(userId: string): Promise<Transaction[]> {
  const transactions = await getTransactionsCollection();
  return await transactions
    .find({
      $or: [
        { userId },
        { recipientId: userId },
        { senderId: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function createTransaction(transaction: Transaction): Promise<Transaction> {
  const transactions = await getTransactionsCollection();
  await transactions.insertOne(transaction);
  return transaction;
}

// Bank account operations
export async function getBankAccountsByUserId(userId: string): Promise<BankAccount[]> {
  const bankAccounts = await getBankAccountsCollection();
  return await bankAccounts.find({ userId }).toArray();
}

export async function getBankAccountById(id: string): Promise<BankAccount | null> {
  const bankAccounts = await getBankAccountsCollection();
  return await bankAccounts.findOne({ id });
}

export async function getBankAccountByIban(iban: string): Promise<BankAccount | null> {
  const bankAccounts = await getBankAccountsCollection();
  return await bankAccounts.findOne({ iban });
}

export async function createBankAccount(bankAccount: BankAccount): Promise<BankAccount> {
  const bankAccounts = await getBankAccountsCollection();
  await bankAccounts.insertOne(bankAccount);
  return bankAccount;
}

export async function updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount | null> {
  const bankAccounts = await getBankAccountsCollection();
  const result = await bankAccounts.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result ?? null;
}

// Trade operations
export async function getTradesByUserId(userId: string): Promise<Trade[]> {
  const trades = await getTradesCollection();
  return await trades.find({ userId }).sort({ createdAt: -1 }).toArray();
}

export async function createTrade(trade: Trade): Promise<Trade> {
  const trades = await getTradesCollection();
  await trades.insertOne(trade);
  return trade;
}
