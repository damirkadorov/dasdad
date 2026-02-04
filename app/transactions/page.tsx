'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import TransactionItem from '@/components/transactions/TransactionItem';
import { Transaction } from '@/lib/db/types';

type FilterType = 'all' | 'top_up' | 'send' | 'receive' | 'nfc_payment';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(t => t.type === filter));
    }
  }, [filter, transactions]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setFilteredTransactions(data.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterOptions: { value: FilterType; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '📊' },
    { value: 'top_up', label: 'Top Up', icon: '💰' },
    { value: 'send', label: 'Sent', icon: '↗️' },
    { value: 'receive', label: 'Received', icon: '↙️' },
    { value: 'nfc_payment', label: 'NFC', icon: '📱' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Transactions 📊
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            {filter !== 'all' && ` (filtered by ${filterOptions.find(f => f.value === filter)?.label})`}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg mb-8">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === option.value
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">
              {filter === 'all' ? '📭' : '🔍'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No transactions yet' : 'No matching transactions'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Start by topping up your balance, creating cards, or making payments'
                : `You don't have any ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()} transactions yet`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                View all transactions
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        {transactions.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {filterOptions.slice(1).map((option) => {
              const count = transactions.filter(t => t.type === option.value).length;
              const total = transactions
                .filter(t => t.type === option.value)
                .reduce((sum, t) => sum + t.amount, 0);
              
              return (
                <div 
                  key={option.value}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {option.label}
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    ${Math.abs(total).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
