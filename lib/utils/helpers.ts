import { CardNetwork, NovapayCardType } from '@/lib/db/types';
import { formatNetworkCardNumber, getCardNetwork } from '@/lib/utils/cardNetworks';

// Generate a scheme-aware test card number using the Luhn algorithm.
export function generateCardNumber(type: NovapayCardType, network: CardNetwork = 'visa'): string {
  const prefixes: Record<CardNetwork, string> = {
    visa: type === 'nova' ? '4539' : '4485',
    mastercard: type === 'nova' ? '5399' : '5521',
    amex: type === 'nova' ? '34' : '37',
    discover: type === 'nova' ? '6011' : '6500',
    unionpay: type === 'nova' ? '6214' : '6242',
  };
  const prefix = prefixes[network];
  const targetDigits = getCardNetwork(network).digits;
  let cardNumber = prefix;

  while (cardNumber.length < targetDigits - 1) {
    cardNumber += Math.floor(Math.random() * 10);
  }

  // Calculate check digit using Luhn algorithm
  const checkDigit = calculateLuhnCheckDigit(cardNumber);
  cardNumber += checkDigit;

  // Format as XXXX XXXX XXXX XXXX
  return formatNetworkCardNumber(cardNumber);
}

function calculateLuhnCheckDigit(cardNumber: string): number {
  let sum = 0;
  let isEven = true;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return (10 - (sum % 10)) % 10;
}

export function formatCardNumber(cardNumber: string): string {
  // Remove spaces and format as XXXX XXXX XXXX XXXX
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
}

export function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

export function generateExpiryDate(): string {
  const now = new Date();
  const futureYear = now.getFullYear() + Math.floor(Math.random() * 4) + 2; // 2-5 years in future
  const month = Math.floor(Math.random() * 12) + 1;
  return `${month.toString().padStart(2, '0')}/${futureYear.toString().slice(-2)}`;
}

export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  return `•••• •••• •••• ${cleaned.slice(-4)}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: 'Password is valid' };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
