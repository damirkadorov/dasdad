import { NextRequest, NextResponse } from 'next/server';
import { convertCurrency, getExchangeRate, formatCurrencyAmount } from '@/lib/utils/currency';
import { getCryptoPrice, cryptoToFiat, fiatToCrypto, formatCryptoAmount } from '@/lib/utils/crypto';
import { Currency, CryptoType } from '@/lib/db/types';

/**
 * GET /api/convert
 * Convert between currencies and cryptocurrencies
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amountStr = searchParams.get('amount');

    if (!from || !to || !amountStr) {
      return NextResponse.json(
        { error: 'From, to, and amount parameters are required' },
        { status: 400 }
      );
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];
    const cryptos: CryptoType[] = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE'];

    const isFromCurrency = currencies.includes(from as Currency);
    const isToCurrency = currencies.includes(to as Currency);
    const isFromCrypto = cryptos.includes(from as CryptoType);
    const isToCrypto = cryptos.includes(to as CryptoType);

    let convertedAmount: number;
    let rate: number;
    let formatted: string;

    if (isFromCurrency && isToCurrency) {
      // Currency to currency
      convertedAmount = convertCurrency(amount, from as Currency, to as Currency);
      rate = getExchangeRate(from as Currency, to as Currency);
      formatted = formatCurrencyAmount(convertedAmount, to as Currency);
    } else if (isFromCurrency && isToCrypto) {
      // Fiat to crypto
      convertedAmount = fiatToCrypto(amount, from as Currency, to as CryptoType);
      rate = 1 / getCryptoPrice(to as CryptoType, from as Currency);
      formatted = formatCryptoAmount(convertedAmount, to as CryptoType);
    } else if (isFromCrypto && isToCurrency) {
      // Crypto to fiat
      convertedAmount = cryptoToFiat(amount, from as CryptoType, to as Currency);
      rate = getCryptoPrice(from as CryptoType, to as Currency);
      formatted = formatCurrencyAmount(convertedAmount, to as Currency);
    } else if (isFromCrypto && isToCrypto) {
      // Crypto to crypto (via USD)
      const usdValue = cryptoToFiat(amount, from as CryptoType, 'USD');
      convertedAmount = fiatToCrypto(usdValue, 'USD', to as CryptoType);
      rate = getCryptoPrice(from as CryptoType, 'USD') / getCryptoPrice(to as CryptoType, 'USD');
      formatted = formatCryptoAmount(convertedAmount, to as CryptoType);
    } else {
      return NextResponse.json(
        { error: 'Invalid currency or crypto type' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        from,
        to,
        amount,
        convertedAmount,
        rate,
        formatted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
