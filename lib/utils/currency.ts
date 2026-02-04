/**
 * Currency Conversion Utilities
 * Provides exchange rates and conversion functions
 */

import { Currency } from '../db/types';

// Mock exchange rates (base: USD = 1.00)
// In production, these would come from a real API like exchangerate-api.com
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.00,
  EUR: 0.92,
  GBP: 0.79,
  CHF: 0.88,
  JPY: 149.50,
  CAD: 1.36,
  AUD: 1.52,
};

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / EXCHANGE_RATES[fromCurrency];
  const convertedAmount = usdAmount * EXCHANGE_RATES[toCurrency];
  
  return Math.round(convertedAmount * 100) / 100;
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) {
    return 1.0;
  }
  
  return EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency];
}

/**
 * Format currency amount with symbol
 */
export function formatCurrencyAmount(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CHF: 'CHF ',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };
  
  const symbol = symbols[currency] || currency;
  
  // Format with appropriate decimal places
  const decimals = currency === 'JPY' ? 0 : 2;
  const formatted = amount.toFixed(decimals);
  
  // Add symbol before or after based on currency
  if (currency === 'CHF') {
    return `${symbol}${formatted}`;
  }
  
  return `${symbol}${formatted}`;
}

/**
 * Calculate transaction fee (percentage-based)
 */
export function calculateTransactionFee(amount: number, feePercentage: number = 0.5): number {
  return Math.round(amount * feePercentage) / 100;
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): Currency[] {
  return Object.keys(EXCHANGE_RATES) as Currency[];
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: Currency): string {
  const names: Record<Currency, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    CHF: 'Swiss Franc',
    JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
  };
  
  return names[currency] || currency;
}
