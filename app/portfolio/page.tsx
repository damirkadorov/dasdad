'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import CurrencyConverter from '@/components/converter/CurrencyConverter';
import { formatCurrencyAmount } from '@/lib/utils/currency';
import { formatCryptoAmount, calculatePortfolioValue, getCryptoName, cryptoToFiat, CRYPTO_PRICES } from '@/lib/utils/crypto';
import { CryptoWallet, Currency, Trade } from '@/lib/db/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface UserProfile {
  cryptoWallets: CryptoWallet[];
  preferredCurrency: Currency;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, tradesRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/crypto/trades')
      ]);

      if (!profileRes.ok) {
        if (profileRes.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileRes.json();
      setProfile(profileData.user);

      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        setTrades(tradesData.trades || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const totalPortfolioValue = profile?.cryptoWallets
    ? calculatePortfolioValue(profile.cryptoWallets, profile.preferredCurrency)
    : 0;

  const portfolioData = profile?.cryptoWallets.map(wallet => ({
    name: wallet.cryptoType,
    value: cryptoToFiat(wallet.balance, wallet.cryptoType, profile.preferredCurrency),
    color: `hsl(${Math.random() * 360}, 70%, 60%)`
  })) || [];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Crypto Portfolio ₿
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track your cryptocurrency investments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-white/80 text-sm mb-2">Total Portfolio Value</p>
                <h2 className="text-5xl font-bold">
                  {formatCurrencyAmount(totalPortfolioValue, profile?.preferredCurrency || 'USD')}
                </h2>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-full p-3">
                <span className="text-2xl">₿</span>
              </div>
            </div>
            <Link href="/trading">
              <Button className="bg-white text-purple-600 hover:bg-gray-100 w-full">
                Trade Crypto
              </Button>
            </Link>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg h-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Portfolio Distribution</h3>
              {portfolioData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrencyAmount(value as number, profile?.preferredCurrency || 'USD')} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No crypto holdings yet</p>
                  <Link href="/trading">
                    <Button className="mt-4">Start Trading</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Crypto Wallets</h2>
            {profile?.cryptoWallets && profile.cryptoWallets.length > 0 ? (
              <div className="space-y-4">
                {profile.cryptoWallets.map((wallet) => {
                  const value = cryptoToFiat(wallet.balance, wallet.cryptoType, profile.preferredCurrency);
                  return (
                    <div key={wallet.cryptoType} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {wallet.cryptoType}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getCryptoName(wallet.cryptoType)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrencyAmount(value, profile.preferredCurrency)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCryptoAmount(wallet.balance, wallet.cryptoType)}
                          </p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wallet Address</p>
                        <p className="text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 truncate">
                          {wallet.address}
                        </p>
                      </div>
                      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        Current Price: {formatCurrencyAmount(CRYPTO_PRICES[wallet.cryptoType], 'USD')}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">₿</div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">No crypto wallets yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                  Start by buying your first cryptocurrency
                </p>
                <Link href="/trading">
                  <Button>Buy Crypto</Button>
                </Link>
              </div>
            )}
          </div>

          <CurrencyConverter />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Trades</h2>
            <Link href="/transactions">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          {trades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Crypto</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                          trade.type === 'buy'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{trade.cryptoType}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {formatCryptoAmount(trade.cryptoAmount, trade.cryptoType)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {formatCurrencyAmount(trade.price, trade.fiatCurrency)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        {formatCurrencyAmount(trade.fiatAmount, trade.fiatCurrency)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                          trade.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : trade.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 dark:text-gray-400">No trades yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Your trading history will appear here
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
