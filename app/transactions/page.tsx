'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import TransactionItem from '@/components/transactions/TransactionItem';
import { Transaction } from '@/lib/db/types';

type FilterType = 'all' | 'top_up' | 'send' | 'receive' | 'nfc_payment';

interface StatementSummary {
  totalTransactions: number;
  totalIncoming: number;
  totalOutgoing: number;
  netChange: number;
  byCurrency: Record<string, { incoming: number; outgoing: number; count: number }>;
  byType: Record<string, number>;
}

interface Statement {
  generatedAt: string;
  accountHolder: string;
  email: string;
  period: { from: string; to: string };
  currency: string;
  summary: StatementSummary;
  transactions: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    amount: number;
    currency: string;
    formattedAmount: string;
    status: string;
    reference: string;
  }>;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementLoading, setStatementLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statement, setStatement] = useState<Statement | null>(null);

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

  const generateStatement = async () => {
    setStatementLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`/api/transactions/statement?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate statement');
      }

      const data = await response.json();
      setStatement(data.statement);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate statement');
    } finally {
      setStatementLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const params = new URLSearchParams({ format: 'csv' });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`/api/transactions/statement?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download CSV');
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Transactions 📊
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
              {filter !== 'all' && ` (filtered by ${filterOptions.find(f => f.value === filter)?.label})`}
            </p>
          </div>
          <button
            onClick={() => setShowStatementModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
          >
            <span>📄</span>
            Generate Statement
          </button>
        </div>

        {/* Statement Modal */}
        {showStatementModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    📄 Transaction Statement
                  </h2>
                  <button
                    onClick={() => {
                      setShowStatementModal(false);
                      setStatement(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {!statement ? (
                  <>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Generate a statement of your transactions. You can filter by date range.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          From Date (optional)
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          To Date (optional)
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={generateStatement}
                        disabled={statementLoading}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
                      >
                        {statementLoading ? 'Generating...' : '📊 View Statement'}
                      </button>
                      <button
                        onClick={downloadCSV}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
                      >
                        📥 Download CSV
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Statement Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Account Holder</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{statement.accountHolder}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Generated</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(statement.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Period</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {statement.period.from} - {statement.period.to}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Total Transactions</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{statement.summary.totalTransactions}</p>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-green-600 dark:text-green-400">Total Incoming</p>
                        <p className="text-xl font-bold text-green-700 dark:text-green-300">
                          +${statement.summary.totalIncoming.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-red-600 dark:text-red-400">Total Outgoing</p>
                        <p className="text-xl font-bold text-red-700 dark:text-red-300">
                          -${statement.summary.totalOutgoing.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-purple-600 dark:text-purple-400">Net Change</p>
                        <p className={`text-xl font-bold ${statement.summary.netChange >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                          {statement.summary.netChange >= 0 ? '+' : ''}{statement.summary.netChange.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Transaction List */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
                      <div className="max-h-60 overflow-y-auto">
                        {statement.transactions.length > 0 ? (
                          statement.transactions.map((tx, index) => (
                            <div
                              key={tx.id}
                              className={`flex items-center justify-between p-4 ${
                                index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-750'
                              }`}
                            >
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{tx.description}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{tx.date}</p>
                              </div>
                              <p className={`font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.formattedAmount}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No transactions found for the selected period
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStatement(null)}
                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={downloadCSV}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
                      >
                        📥 Download CSV
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

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
