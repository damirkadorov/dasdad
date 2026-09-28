'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CryptoIcon, WalletIcon, TrendingUpIcon } from '@/components/icons/Icons';
import { formatCurrencyAmount, getSupportedCurrencies } from '@/lib/utils/currency';
import { formatCryptoAmount, getCryptoPrice, fiatToCrypto, cryptoToFiat, getSupportedCryptos, getCryptoName } from '@/lib/utils/crypto';
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
      if (data.user.preferredCurrency) {
        setSelectedCurrency(data.user.preferredCurrency);
      }
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#06090e]">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl animate-fadeIn">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs font-semibold text-purple-700 dark:text-purple-300 mb-3">
            <CryptoIcon size={14} />
            <span>Digital Asset Exchange</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Crypto Trading
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">
            Buy, sell, and swap cryptocurrencies with instant settlement directly from your Lingoung Bank fiat balance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Main Trade Form */}
          <div className="lg:col-span-7">
            <div className="bezel-card">
              <div className="bezel-card-inner p-6 sm:p-8">
                {/* Buy / Sell Tabs */}
                <div className="flex space-x-2 mb-6 p-1.5 bg-gray-100 dark:bg-gray-800/80 rounded-xl">
                  <button
                    onClick={() => setActiveTab('buy')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                      activeTab === 'buy'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Buy {selectedCrypto}
                  </button>
                  <button
                    onClick={() => setActiveTab('sell')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                      activeTab === 'sell'
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Sell {selectedCrypto}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Cryptocurrency
                    </label>
                    <select
                      value={selectedCrypto}
                      onChange={(e) => setSelectedCrypto(e.target.value as CryptoType)}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 text-sm font-medium"
                    >
                      {supportedCryptos.map((crypto) => (
                        <option key={crypto} value={crypto}>
                          {crypto} — {getCryptoName(crypto)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Fiat Settlement Currency
                    </label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 text-sm font-medium"
                    >
                      {supportedCurrencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Amount to {activeTab === 'buy' ? 'Spend' : 'Sell'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAmountInCrypto(!isAmountInCrypto)}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                      >
                        Switch unit to {isAmountInCrypto ? selectedCurrency : selectedCrypto}
                      </button>
                    </div>
                    
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="pr-20 font-mono text-base"
                        min="0"
                        step="any"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                        {isAmountInCrypto ? selectedCrypto : selectedCurrency}
                      </span>
                    </div>
                  </div>

                  {amount && amountNum > 0 && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2 text-sm animate-fadeIn">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">You {activeTab}:</span>
                        <span className="font-semibold text-gray-900 dark:text-white font-mono">
                          {formatCryptoAmount(cryptoAmount, selectedCrypto)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Estimated value:</span>
                        <span className="font-semibold text-gray-900 dark:text-white font-mono">
                          {formatCurrencyAmount(fiatAmount, selectedCurrency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Trading Fee (1.0%):</span>
                        <span className="font-mono">{formatCurrencyAmount(fee, selectedCurrency)}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between font-bold text-base">
                        <span className="text-gray-900 dark:text-white">Net Total:</span>
                        <span className="text-purple-600 dark:text-purple-400 font-mono">
                          {formatCurrencyAmount(totalFiat, selectedCurrency)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleTrade}
                    isLoading={loading}
                    disabled={!amount || amountNum <= 0}
                    className="w-full py-3"
                    variant={activeTab === 'buy' ? 'primary' : 'danger'}
                  >
                    Execute {activeTab === 'buy' ? 'Buy Order' : 'Sell Order'}
                  </Button>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm">
                      {success}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Market Ticker & Balances */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real-time Rate Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <TrendingUpIcon size={20} className="text-white/80" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-white/80">Live Spot Rate</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-mono font-semibold">1 {selectedCrypto}</span>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight font-mono mb-1">
                {formatCurrencyAmount(currentPrice, selectedCurrency)}
              </h3>
              <p className="text-xs text-white/70">
                Calculated against {selectedCurrency} with 0% slippage guarantee
              </p>
            </div>

            {/* Market Prices Ticker (Fixed: dynamically converts to selectedCurrency) */}
            <div className="bezel-card">
              <div className="bezel-card-inner p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Market Watch</h3>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{selectedCurrency}</span>
                </div>
                
                <div className="space-y-3">
                  {supportedCryptos.slice(0, 6).map((crypto) => {
                    const priceInSelectedCurrency = getCryptoPrice(crypto, selectedCurrency);
                    return (
                      <div 
                        key={crypto} 
                        onClick={() => setSelectedCrypto(crypto)}
                        className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedCrypto === crypto ? 'bg-purple-50 dark:bg-purple-950/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {crypto.slice(0, 1)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-xs leading-none">{crypto}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{getCryptoName(crypto)}</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs font-mono">
                          {formatCurrencyAmount(priceInSelectedCurrency, selectedCurrency)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* User Balances */}
            {profile?.balances && (
              <div className="bezel-card">
                <div className="bezel-card-inner p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <WalletIcon size={18} className="text-purple-600 dark:text-purple-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Available Cash Balance</h3>
                  </div>
                  <div className="space-y-2">
                    {profile.balances.slice(0, 4).map((balance) => (
                      <div key={balance.currency} className="flex justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{balance.currency}</span>
                        <span className="font-bold text-gray-900 dark:text-white font-mono">
                          {formatCurrencyAmount(balance.amount, balance.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
