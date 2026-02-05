'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ExchangeIcon } from '@/components/icons/Icons';
import { formatCurrencyAmount, getSupportedCurrencies, convertCurrency, getExchangeRate } from '@/lib/utils/currency';
import { formatCryptoAmount, getSupportedCryptos, getCryptoPrice, cryptoToFiat, fiatToCrypto } from '@/lib/utils/crypto';
import { Currency, CryptoType } from '@/lib/db/types';

type ConvertibleAsset = Currency | CryptoType;

export default function CurrencyConverter() {
  const [fromAsset, setFromAsset] = useState<ConvertibleAsset>('USD');
  const [toAsset, setToAsset] = useState<ConvertibleAsset>('EUR');
  const [amount, setAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loading, setLoading] = useState(false);

  const currencies = getSupportedCurrencies();
  const cryptos = getSupportedCryptos();
  const allAssets = [...currencies, ...cryptos];

  const isCrypto = (asset: ConvertibleAsset): asset is CryptoType => {
    return cryptos.includes(asset as CryptoType);
  };

  useEffect(() => {
    convertAmount();
  }, [fromAsset, toAsset, amount]);

  const convertAmount = async () => {
    const amountNum = parseFloat(amount) || 0;
    if (amountNum <= 0) {
      setConvertedAmount(0);
      setExchangeRate(0);
      return;
    }

    setLoading(true);
    
    try {
      let converted = 0;
      let rate = 0;

      const fromIsCrypto = isCrypto(fromAsset);
      const toIsCrypto = isCrypto(toAsset);

      if (!fromIsCrypto && !toIsCrypto) {
        converted = convertCurrency(amountNum, fromAsset as Currency, toAsset as Currency);
        rate = getExchangeRate(fromAsset as Currency, toAsset as Currency);
      } else if (fromIsCrypto && !toIsCrypto) {
        converted = cryptoToFiat(amountNum, fromAsset as CryptoType, toAsset as Currency);
        rate = getCryptoPrice(fromAsset as CryptoType, toAsset as Currency);
      } else if (!fromIsCrypto && toIsCrypto) {
        converted = fiatToCrypto(amountNum, fromAsset as Currency, toAsset as CryptoType);
        rate = 1 / getCryptoPrice(toAsset as CryptoType, fromAsset as Currency);
      } else {
        const usdValue = cryptoToFiat(amountNum, fromAsset as CryptoType, 'USD');
        converted = fiatToCrypto(usdValue, 'USD', toAsset as CryptoType);
        rate = getCryptoPrice(fromAsset as CryptoType, 'USD') / getCryptoPrice(toAsset as CryptoType, 'USD');
      }

      setConvertedAmount(converted);
      setExchangeRate(rate);
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center space-x-2 mb-6">
        <ExchangeIcon className="text-purple-600 dark:text-purple-400" size={24} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Currency Converter
        </h2>
      </div>

      <div className="space-y-4">
        {/* From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="any"
              />
            </div>
            <select
              value={fromAsset}
              onChange={(e) => setFromAsset(e.target.value as ConvertibleAsset)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            >
              <optgroup label="Currencies">
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </optgroup>
              <optgroup label="Crypto">
                {cryptos.map((crypto) => (
                  <option key={crypto} value={crypto}>{crypto}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center justify-center transition-all hover:scale-110"
            aria-label="Swap currencies"
          >
            <ExchangeIcon className="text-purple-600 dark:text-purple-400" size={20} />
          </button>
        </div>

        {/* To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <div className="px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : convertedAmount.toFixed(isCrypto(toAsset) ? 8 : 2)}
                </p>
              </div>
            </div>
            <select
              value={toAsset}
              onChange={(e) => setToAsset(e.target.value as ConvertibleAsset)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            >
              <optgroup label="Currencies">
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </optgroup>
              <optgroup label="Crypto">
                {cryptos.map((crypto) => (
                  <option key={crypto} value={crypto}>{crypto}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Exchange Rate */}
        {exchangeRate > 0 && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Exchange Rate:</span>{' '}
              1 {fromAsset} = {exchangeRate.toFixed(isCrypto(toAsset) ? 8 : 4)} {toAsset}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
