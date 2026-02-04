/**
 * IBAN Generation and Validation Utilities
 * Generates realistic IBANs for demo purposes
 */

import { Currency } from '../db/types';

// IBAN country codes and lengths
const IBAN_FORMATS: Record<string, { code: string; length: number; bankCodeLength: number }> = {
  USD: { code: 'US', length: 22, bankCodeLength: 9 }, // US uses routing number format
  EUR: { code: 'DE', length: 22, bankCodeLength: 8 }, // Germany
  GBP: { code: 'GB', length: 22, bankCodeLength: 4 }, // UK
  CHF: { code: 'CH', length: 21, bankCodeLength: 5 }, // Switzerland
  JPY: { code: 'JP', length: 22, bankCodeLength: 7 }, // Japan (not standard IBAN)
  CAD: { code: 'CA', length: 22, bankCodeLength: 9 }, // Canada (not standard IBAN)
  AUD: { code: 'AU', length: 22, bankCodeLength: 6 }, // Australia (not standard IBAN)
};

/**
 * Calculate IBAN check digits using mod-97 algorithm
 */
function calculateCheckDigits(countryCode: string, bban: string): string {
  // Move country code and check digits to end
  const rearranged = bban + countryCode + '00';
  
  // Replace letters with numbers (A=10, B=11, ..., Z=35)
  const numeric = rearranged.replace(/[A-Z]/g, (char) => 
    (char.charCodeAt(0) - 55).toString()
  );
  
  // Calculate mod 97
  let remainder = numeric.split('').reduce((acc, digit) => {
    return (acc * 10 + parseInt(digit)) % 97;
  }, 0);
  
  const checkDigits = 98 - remainder;
  return checkDigits.toString().padStart(2, '0');
}

/**
 * Generate a random bank code
 */
function generateBankCode(length: number): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

/**
 * Generate a random account number
 */
function generateAccountNumber(length: number): string {
  let number = '';
  for (let i = 0; i < length; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
}

/**
 * Generate IBAN for a given currency
 */
export function generateIBAN(currency: Currency, userId?: string): string {
  const format = IBAN_FORMATS[currency];
  if (!format) {
    // Default to EUR format for unsupported currencies
    return generateIBAN('EUR', userId);
  }

  const countryCode = format.code;
  const bankCode = generateBankCode(format.bankCodeLength);
  
  // Calculate remaining length for account number
  const accountNumberLength = format.length - 4 - format.bankCodeLength; // 4 for country code + check digits
  
  // Use userId as seed for account number if provided (for consistency)
  let accountNumber: string;
  if (userId) {
    // Use hash of userId to generate consistent account number
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    accountNumber = hash.toString().padStart(accountNumberLength, '0').substring(0, accountNumberLength);
  } else {
    accountNumber = generateAccountNumber(accountNumberLength);
  }
  
  const bban = bankCode + accountNumber;
  const checkDigits = calculateCheckDigits(countryCode, bban);
  
  return `${countryCode}${checkDigits}${bban}`;
}

/**
 * Generate BIC/SWIFT code
 */
export function generateBIC(currency: Currency): string {
  const bankCodes: Record<Currency, string> = {
    USD: 'CHASUS33', // Chase Bank
    EUR: 'DEUTDEFF', // Deutsche Bank
    GBP: 'BARCGB22', // Barclays
    CHF: 'UBSWCHZH', // UBS Switzerland
    JPY: 'BOTKJPJT', // Bank of Tokyo
    CAD: 'ROYCCAT2', // Royal Bank of Canada
    AUD: 'CTBAAU2S', // Commonwealth Bank
  };
  
  return bankCodes[currency] || 'BANKXX22';
}

/**
 * Format IBAN with spaces for display
 */
export function formatIBAN(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Validate IBAN check digits
 */
export function validateIBAN(iban: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  if (cleanIban.length < 15) return false;
  
  const countryCode = cleanIban.substring(0, 2);
  const checkDigits = cleanIban.substring(2, 4);
  const bban = cleanIban.substring(4);
  
  const calculatedCheckDigits = calculateCheckDigits(countryCode, bban);
  return checkDigits === calculatedCheckDigits;
}
