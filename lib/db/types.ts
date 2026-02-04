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
  status: 'active' | 'frozen' | 'blocked';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'top_up' | 'send' | 'receive' | 'nfc_payment' | 'crypto_buy' | 'crypto_sell' | 'crypto_transfer' | 'currency_exchange' | 'iban_transfer';
  amount: number;
  currency: Currency; // Transaction currency
  cryptoAmount?: number; // For crypto transactions
  cryptoType?: CryptoType; // For crypto transactions
  balanceBefore: number;
  balanceAfter: number;
  recipientId?: string;
  senderId?: string;
  cardId?: string;
  bankAccountId?: string; // For IBAN transfers
  fee: number; // Transaction fee
  exchangeRate?: number; // For currency/crypto exchange
  description: string;
  status: 'completed' | 'failed' | 'pending';
  createdAt: string;
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

export interface Database {
  users: User[];
  cards: Card[];
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  trades: Trade[];
}
