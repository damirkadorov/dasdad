'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import TransactionItem from '@/components/transactions/TransactionItem';
import { formatCurrency } from '@/lib/utils/helpers';
import { Transaction } from '@/lib/db/types';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toppingUp, setToppingUp] = useState(false);

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

  const handleTopUp = async () => {
    if (!profile) return;
    
    setToppingUp(true);
    try {
      const response = await fetch('/api/balance/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100 })
      });

      if (!response.ok) throw new Error('Failed to top up');

      const data = await response.json();
      setProfile({ ...profile, balance: data.newBalance });
      await fetchData(); // Refresh transactions
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to top up');
    } finally {
      setToppingUp(false);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {profile?.username}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/80 text-sm mb-2">Total Balance</p>
              <h2 className="text-5xl font-bold">{formatCurrency(profile?.balance || 0)}</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-full p-3">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          
          <Button 
            onClick={handleTopUp}
            isLoading={toppingUp}
            className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg"
          >
            Top Up $100
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/cards">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-600">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">My Cards</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your virtual cards</p>
            </div>
          </Link>

          <Link href="/payments">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-600">
              <div className="text-4xl mb-3">💸</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Send Money</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transfer to anyone instantly</p>
            </div>
          </Link>

          <Link href="/payments?tab=nfc">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-orange-600">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">NFC Pay</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tap to pay contactless</p>
            </div>
          </Link>
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
