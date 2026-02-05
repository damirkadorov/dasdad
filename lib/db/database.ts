// MongoDB database operations (replacing JSON file storage)
import { User, Card, Transaction, BankAccount, Trade, Loan, SavingsAccount, CreditCard, Bill, Investment, Product, Order, ApiKey, Payment } from './types';
import { getUsersCollection, getCardsCollection, getTransactionsCollection, getBankAccountsCollection, getTradesCollection, getLoansCollection, getSavingsAccountsCollection, getCreditCardsCollection, getBillsCollection, getInvestmentsCollection, getProductsCollection, getOrdersCollection, getApiKeysCollection, getPaymentsCollection } from './mongodb';

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
export async function getAllCards(): Promise<Card[]> {
  const cards = await getCardsCollection();
  return await cards.find({}).toArray();
}

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

// Loan operations
export async function getLoansByUserId(userId: string): Promise<Loan[]> {
  const loans = await getLoansCollection();
  return await loans.find({ userId }).sort({ createdAt: -1 }).toArray();
}

export async function getLoanById(id: string): Promise<Loan | null> {
  const loans = await getLoansCollection();
  return await loans.findOne({ id });
}

export async function createLoan(loan: Loan): Promise<Loan> {
  const loans = await getLoansCollection();
  await loans.insertOne(loan);
  return loan;
}

export async function updateLoan(id: string, updates: Partial<Loan>): Promise<Loan | null> {
  const loans = await getLoansCollection();
  const result = await loans.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result ?? null;
}

// Savings account operations
export async function getSavingsAccountsByUserId(userId: string): Promise<SavingsAccount[]> {
  const savingsAccounts = await getSavingsAccountsCollection();
  return await savingsAccounts.find({ userId }).toArray();
}

export async function createSavingsAccount(savingsAccount: SavingsAccount): Promise<SavingsAccount> {
  const savingsAccounts = await getSavingsAccountsCollection();
  await savingsAccounts.insertOne(savingsAccount);
  return savingsAccount;
}

// Credit card operations
export async function getCreditCardsByUserId(userId: string): Promise<CreditCard[]> {
  const creditCards = await getCreditCardsCollection();
  return await creditCards.find({ userId }).toArray();
}

export async function createCreditCard(creditCard: CreditCard): Promise<CreditCard> {
  const creditCards = await getCreditCardsCollection();
  await creditCards.insertOne(creditCard);
  return creditCard;
}

// Bill operations
export async function getBillsByUserId(userId: string): Promise<Bill[]> {
  const bills = await getBillsCollection();
  return await bills.find({ userId }).toArray();
}

export async function getBillById(id: string): Promise<Bill | null> {
  const bills = await getBillsCollection();
  return await bills.findOne({ id });
}

export async function updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
  const bills = await getBillsCollection();
  const result = await bills.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result ?? null;
}

// Investment operations
export async function getInvestmentsByUserId(userId: string): Promise<Investment[]> {
  const investments = await getInvestmentsCollection();
  return await investments.find({ userId }).toArray();
}

export async function createInvestment(investment: Investment): Promise<Investment> {
  const investments = await getInvestmentsCollection();
  await investments.insertOne(investment);
  return investment;
}

// Product operations - Marketplace
export async function getAllProducts(): Promise<Product[]> {
  const products = await getProductsCollection();
  return await products.find({ status: 'active' }).toArray();
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProductsCollection();
  return await products.findOne({ id });
}

export async function getProductsBySellerId(sellerId: string): Promise<Product[]> {
  const products = await getProductsCollection();
  return await products.find({ sellerId }).toArray();
}

export async function createProduct(product: Product): Promise<Product> {
  const products = await getProductsCollection();
  await products.insertOne(product);
  return product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const products = await getProductsCollection();
  const result = await products.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result ?? null;
}

// Order operations - Marketplace
export async function getOrdersByBuyerId(buyerId: string): Promise<Order[]> {
  const orders = await getOrdersCollection();
  return await orders.find({ buyerId }).sort({ createdAt: -1 }).toArray();
}

export async function getOrdersBySellerId(sellerId: string): Promise<Order[]> {
  const orders = await getOrdersCollection();
  return await orders.find({ sellerId }).sort({ createdAt: -1 }).toArray();
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getOrdersCollection();
  return await orders.findOne({ id });
}

export async function createOrder(order: Order): Promise<Order> {
  const orders = await getOrdersCollection();
  await orders.insertOne(order);
  return order;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const orders = await getOrdersCollection();
  const result = await orders.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result ?? null;
}

// API Key operations - Payment Gateway
export async function getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
  const apiKeys = await getApiKeysCollection();
  return await apiKeys.find({ userId }).toArray();
}

export async function getApiKeyByKey(key: string): Promise<ApiKey | null> {
  const apiKeys = await getApiKeysCollection();
  return await apiKeys.findOne({ key, status: 'active' });
}

export async function createApiKey(apiKey: ApiKey): Promise<ApiKey> {
  const apiKeys = await getApiKeysCollection();
  await apiKeys.insertOne(apiKey);
  return apiKey;
}

export async function updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
  const apiKeys = await getApiKeysCollection();
  const result = await apiKeys.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result ?? null;
}

// Payment operations - Payment Gateway
export async function getPaymentById(id: string): Promise<Payment | null> {
  const payments = await getPaymentsCollection();
  return await payments.findOne({ id });
}

export async function getPaymentsByMerchantId(merchantId: string): Promise<Payment[]> {
  const payments = await getPaymentsCollection();
  return await payments.find({ merchantId }).sort({ createdAt: -1 }).toArray();
}

export async function createPayment(payment: Payment): Promise<Payment> {
  const payments = await getPaymentsCollection();
  await payments.insertOne(payment);
  return payment;
}

export async function updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
  const payments = await getPaymentsCollection();
  const result = await payments.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result ?? null;
}
