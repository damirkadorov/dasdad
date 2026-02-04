export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  balance: number;
  createdAt: string;
}

export interface Card {
  id: string;
  userId: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardType: 'visa' | 'mastercard';
  status: 'active' | 'frozen';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'top_up' | 'send' | 'receive' | 'nfc_payment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  recipientId?: string;
  senderId?: string;
  cardId?: string;
  description: string;
  status: 'completed' | 'failed';
  createdAt: string;
}

export interface Database {
  users: User[];
  cards: Card[];
  transactions: Transaction[];
}
