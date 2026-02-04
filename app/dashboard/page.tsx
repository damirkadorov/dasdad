'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import TransactionItem from '@/components/transactions/TransactionItem';
import { formatCurrencyAmount } from '@/lib/utils/currency';
import { formatCryptoAmount, calculatePortfolioValue, cryptoToFiat } from '@/lib/utils/crypto';
import { Transaction, CurrencyBalance, CryptoWallet, Currency } from '@/lib/db/types';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  balance: number;
  balances: CurrencyBalance[];
  cryptoWallets: CryptoWallet[];
  preferredCurrency: Currency;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, transactionsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/transactions')
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

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions.slice(0, 5));
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
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

  const totalFiatBalance = profile?.balances.reduce((sum, b) => sum + b.amount, 0) || 0;
  const cryptoPortfolioValue = profile?.cryptoWallets 
    ? calculatePortfolioValue(profile.cryptoWallets, profile.preferredCurrency)
    : 0;
  const totalBalance = totalFiatBalance + cryptoPortfolioValue;

  const portfolioData = [
    { name: 'Fiat', value: totalFiatBalance, color: '#8b5cf6' },
    { name: 'Crypto', value: cryptoPortfolioValue, color: '#3b82f6' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {profile?.username}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Total Balance */}
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-white/80 text-sm mb-2">Total Portfolio Value</p>
                <h2 className="text-5xl font-bold">{formatCurrencyAmount(totalBalance, profile?.preferredCurrency || 'USD')}</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-full p-3">
                <span className="text-2xl">💰</span>
              </div>
            </div>

            {/* Portfolio Distribution */}
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-white/70">Fiat</p>
                <p className="font-semibold">{formatCurrencyAmount(totalFiatBalance, profile?.preferredCurrency || 'USD')}</p>
              </div>
              <div>
                <p className="text-white/70">Crypto</p>
                <p className="font-semibold">{formatCurrencyAmount(cryptoPortfolioValue, profile?.preferredCurrency || 'USD')}</p>
              </div>
            </div>
          </div>

          {/* Multi-Currency Balances */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Currency Balances</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {profile?.balances && profile.balances.length > 0 ? (
                profile.balances.map((balance) => (
                  <div key={balance.currency} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {balance.currency.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{balance.currency}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrencyAmount(balance.amount, balance.currency)}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No balances yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/payments?action=topup">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-600 text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Top Up</h3>
            </div>
          </Link>

          <Link href="/payments">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-600 text-center">
              <div className="text-4xl mb-3">💸</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Send Money</h3>
            </div>
          </Link>

          <Link href="/trading">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-orange-600 text-center">
              <div className="text-4xl mb-3">₿</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Buy Crypto</h3>
            </div>
          </Link>

          <Link href="/cards">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-pink-600 text-center">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Create Card</h3>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Crypto Holdings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crypto Portfolio</h2>
              <Link href="/portfolio">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            
            {profile?.cryptoWallets && profile.cryptoWallets.length > 0 ? (
              <div className="space-y-3">
                {profile.cryptoWallets.slice(0, 3).map((wallet) => (
                  <div key={wallet.cryptoType} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{wallet.cryptoType}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatCryptoAmount(wallet.balance, wallet.cryptoType)}</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {formatCurrencyAmount(
                        cryptoToFiat(wallet.balance, wallet.cryptoType, profile.preferredCurrency),
                        profile.preferredCurrency
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">₿</div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">No crypto yet</p>
                <Link href="/trading">
                  <Button size="sm" className="mt-4">Buy Crypto</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Portfolio Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Portfolio Distribution</h2>
            {totalBalance > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrencyAmount(value as number, profile?.preferredCurrency || 'USD')} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No portfolio data</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
            <Link href="/transactions">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Start by topping up your balance or creating a card
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
