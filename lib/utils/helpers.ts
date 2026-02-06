import { NovapayCardType } from '@/lib/db/types';

// Generate NovaPay card number using Luhn algorithm
// All NovaPay cards start with "7" as per the proprietary network standard
export function generateCardNumber(type: NovapayCardType): string {
  // All NovaPay cards start with 7
  // Nova cards use prefix 70, Nova Plus cards use prefix 71
  const prefix = type === 'nova' ? '70' : '71';
  let cardNumber = prefix;

  // Generate 13 more random digits (total 16 digits, minus prefix, minus check digit)
  for (let i = 0; i < 13; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }

  // Calculate check digit using Luhn algorithm
  const checkDigit = calculateLuhnCheckDigit(cardNumber);
  cardNumber += checkDigit;

  // Format as XXXX XXXX XXXX XXXX
  return formatCardNumber(cardNumber);
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
