'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatCurrencyAmount, getSupportedCurrencies } from '@/lib/utils/currency';
import { formatCryptoAmount, getCryptoPrice, fiatToCrypto, cryptoToFiat, getSupportedCryptos, getCryptoName, CRYPTO_PRICES } from '@/lib/utils/crypto';
import { CryptoType, Currency, CurrencyBalance } from '@/lib/db/types';

interface UserProfile {
  balances: CurrencyBalance[];
  preferredCurrency: Currency;
}

export default function TradingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>('BTC');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [amount, setAmount] = useState('');
  const [isAmountInCrypto, setIsAmountInCrypto] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data.user);
      setSelectedCurrency(data.user.preferredCurrency || 'USD');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    }
  };

  const currentPrice = getCryptoPrice(selectedCrypto, selectedCurrency);
  const amountNum = parseFloat(amount) || 0;
  
  const cryptoAmount = isAmountInCrypto 
    ? amountNum 
    : fiatToCrypto(amountNum, selectedCurrency, selectedCrypto);
  
  const fiatAmount = isAmountInCrypto 
    ? cryptoToFiat(amountNum, selectedCrypto, selectedCurrency)
    : amountNum;

  const fee = fiatAmount * 0.01;
  const totalFiat = activeTab === 'buy' ? fiatAmount + fee : fiatAmount - fee;

  const handleTrade = async () => {
    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/crypto/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          cryptoType: selectedCrypto,
          currency: selectedCurrency,
          amount: isAmountInCrypto ? cryptoAmount : fiatAmount,
          isAmountInCrypto
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${activeTab} crypto`);
      }

      setSuccess(`Successfully ${activeTab === 'buy' ? 'bought' : 'sold'} ${formatCryptoAmount(cryptoAmount, selectedCrypto)}!`);
      setAmount('');
      await fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${activeTab} crypto`);
    } finally {
      setLoading(false);
    }
  };

  const supportedCryptos = getSupportedCryptos();
  const supportedCurrencies = getSupportedCurrencies();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Crypto Trading ₿
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Buy and sell cryptocurrencies instantly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex space-x-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button
                  onClick={() => setActiveTab('buy')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    activeTab === 'buy'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setActiveTab('sell')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    activeTab === 'sell'
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Sell
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Cryptocurrency
                </label>
                <select
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value as CryptoType)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  {supportedCryptos.map((crypto) => (
                    <option key={crypto} value={crypto}>
                      {crypto} - {getCryptoName(crypto)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  {supportedCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pr-20"
                    min="0"
                    step="any"
                  />
                  <button
                    onClick={() => setIsAmountInCrypto(!isAmountInCrypto)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700"
                  >
                    {isAmountInCrypto ? selectedCrypto : selectedCurrency}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Click currency to switch between crypto and fiat
                </p>
              </div>

              {amount && amountNum > 0 && (
                <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">You {activeTab}:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCryptoAmount(cryptoAmount, selectedCrypto)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">For:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrencyAmount(fiatAmount, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Fee (1%):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrencyAmount(fee, selectedCurrency)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-purple-200 dark:border-purple-700 flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrencyAmount(totalFiat, selectedCurrency)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleTrade}
                isLoading={loading}
                disabled={!amount || amountNum <= 0}
                className="w-full"
                variant={activeTab === 'buy' ? 'primary' : 'danger'}
              >
                {activeTab === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto}
              </Button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
                  {success}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-white/80 text-sm mb-2">Current Price</p>
              <h3 className="text-3xl font-bold mb-1">
                {formatCurrencyAmount(currentPrice, selectedCurrency)}
              </h3>
              <p className="text-white/70 text-sm">per {selectedCrypto}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Market Prices</h3>
              <div className="space-y-3">
                {supportedCryptos.slice(0, 5).map((crypto) => (
                  <div key={crypto} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {crypto.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{crypto}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{getCryptoName(crypto)}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {formatCurrencyAmount(CRYPTO_PRICES[crypto], 'USD')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {profile?.balances && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Balances</h3>
                <div className="space-y-2">
                  {profile.balances.slice(0, 3).map((balance) => (
                    <div key={balance.currency} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{balance.currency}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrencyAmount(balance.amount, balance.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
