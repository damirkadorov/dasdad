'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BusinessNavigation from '@/components/business/BusinessNavigation';
import Button from '@/components/ui/Button';
import TransactionItem from '@/components/transactions/TransactionItem';
import { formatCurrencyAmount } from '@/lib/utils/currency';
import { Transaction, CurrencyBalance, Currency } from '@/lib/db/types';
import { WalletIcon, TopUpIcon, SendIcon, CardIcon } from '@/components/icons/Icons';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  balance: number;
  balances: CurrencyBalance[];
  preferredCurrency: Currency;
  createdAt: string;
}

export default function BusinessDashboard() {
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
      <div className="min-h-screen bg-slate-900">
        <BusinessNavigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-slate-900">
        <BusinessNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-900/20 text-red-400 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const totalBalance = profile?.balances?.reduce((sum, b) => sum + b.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-slate-900">
      <BusinessNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {profile?.username} 🏢
          </h1>
          <p className="text-slate-400">
            Business Banking Dashboard - Premium Services
          </p>
        </div>

        {/* Balance Card - More Professional */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-2xl border border-slate-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-slate-400 text-sm mb-2 font-medium">TOTAL BUSINESS BALANCE</p>
                <h2 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {formatCurrencyAmount(totalBalance, profile?.preferredCurrency || 'USD')}
                </h2>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 shadow-lg">
                <WalletIcon className="text-white" size={32} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-600">
              <div>
                <p className="text-slate-400 text-xs mb-1">Available</p>
                <p className="font-semibold text-lg">{formatCurrencyAmount(totalBalance, profile?.preferredCurrency || 'USD')}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Account Type</p>
                <p className="font-semibold text-lg">Business</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Status</p>
                <p className="font-semibold text-lg text-green-400">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Professional Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Business Operations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/business/payments?action=topup">
              <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-all cursor-pointer border border-slate-700 hover:border-amber-500 text-center group">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-slate-700 group-hover:bg-amber-500/20 rounded-xl transition-all">
                    <TopUpIcon className="text-amber-500" size={24} />
                  </div>
                </div>
                <h3 className="font-semibold text-white text-sm">Top Up</h3>
                <p className="text-xs text-slate-400 mt-1">Add Funds</p>
              </div>
            </Link>

            <Link href="/business/payments">
              <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-all cursor-pointer border border-slate-700 hover:border-blue-500 text-center group">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-slate-700 group-hover:bg-blue-500/20 rounded-xl transition-all">
                    <SendIcon className="text-blue-500" size={24} />
                  </div>
                </div>
                <h3 className="font-semibold text-white text-sm">Send Money</h3>
                <p className="text-xs text-slate-400 mt-1">Transfer Funds</p>
              </div>
            </Link>

            <Link href="/business/pos-terminal">
              <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-all cursor-pointer border border-slate-700 hover:border-orange-500 text-center group">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-slate-700 group-hover:bg-orange-500/20 rounded-xl transition-all">
                    <CardIcon className="text-orange-500" size={24} />
                  </div>
                </div>
                <h3 className="font-semibold text-white text-sm">POS Terminal</h3>
                <p className="text-xs text-slate-400 mt-1">Accept Payments</p>
              </div>
            </Link>

            <Link href="/business/cards">
              <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-all cursor-pointer border border-slate-700 hover:border-purple-500 text-center group">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-slate-700 group-hover:bg-purple-500/20 rounded-xl transition-all">
                    <CardIcon className="text-purple-500" size={24} />
                  </div>
                </div>
                <h3 className="font-semibold text-white text-sm">Business Cards</h3>
                <p className="text-xs text-slate-400 mt-1">Manage Cards</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Currency Balances */}
        <div className="mb-8">
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Currency Accounts</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {profile?.balances && profile.balances.length > 0 ? (
                profile.balances.map((balance) => (
                  <div key={balance.currency} className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {balance.currency.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{balance.currency}</p>
                        <p className="text-xs text-slate-400">Business Account</p>
                      </div>
                    </div>
                    <p className="font-bold text-white text-lg">{formatCurrencyAmount(balance.amount, balance.currency)}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-4">No currency accounts yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">View All</Button>
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
              <div className="text-6xl mb-4">📊</div>
              <p className="text-slate-400">No transactions yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Start accepting payments with POS Terminal
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-900/20 text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
