/**
 * Cryptocurrency Utilities
 * Handles crypto wallets, prices, and conversions
 */

import { CryptoType, Currency } from '../db/types';

// Mock crypto prices in USD
// In production, these would come from a real API like CoinGecko or Binance
export const CRYPTO_PRICES: Record<CryptoType, number> = {
  BTC: 43250.00,
  ETH: 2280.50,
  USDT: 1.00,
  BNB: 310.25,
  XRP: 0.52,
  ADA: 0.48,
  SOL: 98.75,
  DOGE: 0.08,
};

/**
 * Generate a realistic-looking crypto wallet address
 */
export function generateCryptoAddress(cryptoType: CryptoType): string {
  const prefixes: Record<CryptoType, string> = {
    BTC: '1',
    ETH: '0x',
    USDT: '0x',
    BNB: 'bnb',
    XRP: 'r',
    ADA: 'addr1',
    SOL: '',
    DOGE: 'D',
  };
  
  const prefix = prefixes[cryptoType];
  const length = cryptoType === 'BTC' ? 34 : cryptoType === 'ETH' || cryptoType === 'USDT' ? 42 : 40;
  
  // Generate random hex string
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let address = prefix;
  
  for (let i = prefix.length; i < length; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return address;
}

/**
 * Get crypto price in specified currency
 */
export function getCryptoPrice(cryptoType: CryptoType, currency: Currency = 'USD'): number {
  const usdPrice = CRYPTO_PRICES[cryptoType];
  
  // Simple conversion - in production, use real exchange rates
  const exchangeRates: Record<Currency, number> = {
    USD: 1.00,
    EUR: 0.92,
    GBP: 0.79,
    CHF: 0.88,
    JPY: 149.50,
    CAD: 1.36,
    AUD: 1.52,
  };
  
  return usdPrice * exchangeRates[currency];
}

/**
 * Convert crypto to fiat
 */
export function cryptoToFiat(
  cryptoAmount: number,
  cryptoType: CryptoType,
  currency: Currency
): number {
  const price = getCryptoPrice(cryptoType, currency);
  return Math.round(cryptoAmount * price * 100) / 100;
}

/**
 * Convert fiat to crypto
 */
export function fiatToCrypto(
  fiatAmount: number,
  currency: Currency,
  cryptoType: CryptoType
): number {
  const price = getCryptoPrice(cryptoType, currency);
  return Math.round((fiatAmount / price) * 100000000) / 100000000; // 8 decimal places
}

/**
 * Calculate crypto transaction fee
 */
export function calculateCryptoFee(
  cryptoAmount: number,
  cryptoType: CryptoType,
  feePercentage: number = 1.0
): number {
  return Math.round(cryptoAmount * feePercentage * 100000000) / 10000000000; // Keep precision
}

/**
 * Format crypto amount with symbol
 */
export function formatCryptoAmount(amount: number, cryptoType: CryptoType): string {
  // Different precision for different cryptos
  const decimals = cryptoType === 'BTC' || cryptoType === 'ETH' ? 8 : 
                   cryptoType === 'USDT' ? 2 : 6;
  
  const formatted = amount.toFixed(decimals);
  return `${formatted} ${cryptoType}`;
}

/**
 * Get all supported cryptocurrencies
 */
export function getSupportedCryptos(): CryptoType[] {
  return Object.keys(CRYPTO_PRICES) as CryptoType[];
}

/**
 * Get crypto full name
 */
export function getCryptoName(cryptoType: CryptoType): string {
  const names: Record<CryptoType, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Tether',
    BNB: 'Binance Coin',
    XRP: 'Ripple',
    ADA: 'Cardano',
    SOL: 'Solana',
    DOGE: 'Dogecoin',
  };
  
  return names[cryptoType] || cryptoType;
}

/**
 * Validate crypto address format (basic validation)
 */
export function validateCryptoAddress(address: string, cryptoType: CryptoType): boolean {
  const patterns: Record<CryptoType, RegExp> = {
    BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    ETH: /^0x[a-fA-F0-9]{40}$/,
    USDT: /^0x[a-fA-F0-9]{40}$/,
    BNB: /^bnb[a-z0-9]{39}$/,
    XRP: /^r[a-zA-Z0-9]{24,34}$/,
    ADA: /^addr1[a-z0-9]{50,}$/,
    SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    DOGE: /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/,
  };
  
  const pattern = patterns[cryptoType];
  return pattern ? pattern.test(address) : false;
}

/**
 * Calculate portfolio value in fiat
 */
export function calculatePortfolioValue(
  wallets: Array<{ cryptoType: CryptoType; balance: number }>,
  currency: Currency = 'USD'
): number {
  return wallets.reduce((total, wallet) => {
    return total + cryptoToFiat(wallet.balance, wallet.cryptoType, currency);
  }, 0);
}
