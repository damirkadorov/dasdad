// Supported currencies
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'JPY' | 'CAD' | 'AUD';

// Supported cryptocurrencies
export type CryptoType = 'BTC' | 'ETH' | 'USDT' | 'BNB' | 'XRP' | 'ADA' | 'SOL' | 'DOGE';

// Multi-currency balance
export interface CurrencyBalance {
  currency: Currency;
  amount: number;
}

// Crypto wallet
export interface CryptoWallet {
  cryptoType: CryptoType;
  address: string;
  balance: number;
  createdAt: string;
}

// Bank account with IBAN
export interface BankAccount {
  id: string;
  userId: string;
  iban: string;
  bic: string;
  currency: Currency;
  accountHolder: string;
  status: 'active' | 'closed';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  balance: number; // Legacy USD balance
  balances: CurrencyBalance[]; // Multi-currency support
  cryptoWallets: CryptoWallet[]; // Crypto wallets
  bankAccountIds: string[]; // References to BankAccount IDs
  preferredCurrency: Currency; // Default display currency
  accountType?: 'personal' | 'business'; // Account type (default: personal)
  createdAt: string;
}

export interface Card {
  id: string;
  userId: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardType: 'visa' | 'mastercard';
  cardFormat: 'virtual' | 'physical'; // Virtual or physical card
  currency: Currency; // Card currency
  accountType?: 'personal' | 'business'; // Account type the card belongs to (default: personal)
  status: 'active' | 'frozen' | 'blocked';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'top_up' | 'send' | 'receive' | 'nfc_payment' | 'crypto_buy' | 'crypto_sell' | 'crypto_transfer' | 'currency_exchange' | 'iban_transfer' | 'IBAN_TRANSFER' | 'IBAN_RECEIVE' | 'LOAN_DISBURSED' | 'LOAN_PAYMENT' | 'SAVINGS_DEPOSIT' | 'SAVINGS_WITHDRAWAL' | 'BILL_PAYMENT' | 'INVESTMENT_BUY' | 'INVESTMENT_SELL';
  amount: number;
  currency: Currency; // Transaction currency
  cryptoAmount?: number; // For crypto transactions
  cryptoType?: CryptoType; // For crypto transactions
  balanceBefore?: number;
  balanceAfter?: number;
  recipientId?: string;
  senderId?: string;
  cardId?: string;
  bankAccountId?: string; // For IBAN transfers
  loanId?: string;
  savingsAccountId?: string;
  billId?: string;
  billType?: string;
  investmentId?: string;
  investmentType?: string;
  symbol?: string;
  from?: string;
  to?: string;
  iban?: string;
  reference?: string;
  fee?: number; // Transaction fee
  exchangeRate?: number; // For currency/crypto exchange
  description?: string;
  status?: 'completed' | 'failed' | 'pending';
  createdAt?: string;
  timestamp?: string;
}

// Crypto trade
export interface Trade {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  cryptoType: CryptoType;
  cryptoAmount: number;
  fiatCurrency: Currency;
  fiatAmount: number;
  price: number; // Price per unit in fiat
  fee: number;
  status: 'completed' | 'failed' | 'pending';
  createdAt: string;
}

// Loan
export interface Loan {
  id: string;
  userId: string;
  amount: number;
  currency: Currency;
  termMonths: number;
  interestRate: number;
  monthlyPayment: number;
  remainingAmount: number;
  purpose: string;
  status: 'active' | 'paid' | 'defaulted';
  disbursedAt: string;
  nextPaymentDue: string;
  paidAt?: string;
  createdAt: string;
}

// Savings Account
export interface SavingsAccount {
  id: string;
  userId: string;
  name: string;
  currency: Currency;
  balance: number;
  interestRate: number;
  termMonths?: number;
  status: 'active' | 'closed';
  createdAt: string;
  maturityDate: string | null;
}

// Credit Card
export interface CreditCard {
  id: string;
  userId: string;
  cardNumber: string;
  cardType: string;
  currency: Currency;
  creditLimit: number;
  availableCredit: number;
  usedCredit: number;
  apr: number;
  minimumPayment: number;
  statementBalance: number;
  nextStatementDate: string;
  paymentDueDate: string;
  status: 'active' | 'frozen' | 'closed';
  rewards: number;
  cvv: string;
  expiryDate: string;
  createdAt: string;
}

// Bill
export interface Bill {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: Currency;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  provider: string;
  paidAt?: string;
  createdAt: string;
}

// Investment
export interface Investment {
  id: string;
  userId: string;
  type: string; // 'stock', 'bond', 'etf'
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseAmount: number;
  currentValue: number;
  currency: Currency;
  status: 'active' | 'sold';
  purchasedAt: string;
  soldAt?: string;
}

export interface Database {
  users: User[];
  cards: Card[];
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  trades: Trade[];
  loans?: Loan[];
  savingsAccounts?: SavingsAccount[];
  creditCards?: CreditCard[];
  bills?: Bill[];
  investments?: Investment[];
}
