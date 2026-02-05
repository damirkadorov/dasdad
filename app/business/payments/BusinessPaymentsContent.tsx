'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BusinessNavigation from '@/components/business/BusinessNavigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Currency } from '@/lib/db/types';
import { getSupportedCurrencies, formatCurrencyAmount } from '@/lib/utils/currency';

export default function BusinessPaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'send' | 'topup'>('send');
  
  // Send Money State
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState<Currency>('USD');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [sendError, setSendError] = useState('');

  // Top Up State
  const [topupAmount, setTopupAmount] = useState('');
  const [topupCurrency, setTopupCurrency] = useState<Currency>('USD');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState('');
  const [topupError, setTopupError] = useState('');

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'topup') {
      setActiveTab('topup');
    }
  }, [searchParams]);

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendLoading(true);
    setSendError('');
    setSendSuccess('');

    try {
      const response = await fetch('/api/payments/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          amount: parseFloat(sendAmount),
          currency: sendCurrency
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setSendError(data.error || 'Failed to send money');
        return;
      }

      setSendSuccess(`Successfully sent ${formatCurrencyAmount(parseFloat(sendAmount), sendCurrency)} to ${recipient}`);
      setRecipient('');
      setSendAmount('');
    } catch (error) {
      setSendError('An error occurred. Please try again.');
    } finally {
      setSendLoading(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopupLoading(true);
    setTopupError('');
    setTopupSuccess('');

    try {
      const response = await fetch('/api/balance/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(topupAmount),
          currency: topupCurrency
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setTopupError(data.error || 'Failed to top up');
        return;
      }

      setTopupSuccess(`Successfully added ${formatCurrencyAmount(parseFloat(topupAmount), topupCurrency)} to your balance`);
      setTopupAmount('');
      
      setTimeout(() => {
        router.push('/business/dashboard');
      }, 2000);
    } catch (error) {
      setTopupError('An error occurred. Please try again.');
    } finally {
      setTopupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <BusinessNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Business Payments 💼
          </h1>
          <p className="text-slate-400">
            Manage your business transactions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-slate-800 p-2 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'send'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Send Money
          </button>
          <button
            onClick={() => setActiveTab('topup')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'topup'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Top Up
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-700">
          {/* Send Money Tab */}
          {activeTab === 'send' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Send Money</h2>
              <form onSubmit={handleSendMoney} className="space-y-6">
                <Input
                  label="Recipient (username or email)"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="john@example.com"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Amount
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-4 py-3 bg-slate-900/50 border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                      required
                    />
                    <select
                      value={sendCurrency}
                      onChange={(e) => setSendCurrency(e.target.value as Currency)}
                      className="px-4 py-3 bg-slate-900/50 border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                    >
                      {getSupportedCurrencies().map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {sendError && (
                  <div className="bg-red-900/30 border border-red-700 text-red-400 p-4 rounded-lg">
                    {sendError}
                  </div>
                )}

                {sendSuccess && (
                  <div className="bg-green-900/30 border border-green-700 text-green-400 p-4 rounded-lg">
                    {sendSuccess}
                  </div>
                )}

                <Button
                  type="submit"
                  isLoading={sendLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {sendLoading ? 'Sending...' : 'Send Money'}
                </Button>
              </form>
            </div>
          )}

          {/* Top Up Tab */}
          {activeTab === 'topup' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Top Up Balance</h2>
              <p className="text-slate-400 mb-6">
                Add funds to your business account (Demo: Fake Money)
              </p>
              
              <form onSubmit={handleTopUp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Amount
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-4 py-3 bg-slate-900/50 border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                      required
                    />
                    <select
                      value={topupCurrency}
                      onChange={(e) => setTopupCurrency(e.target.value as Currency)}
                      className="px-4 py-3 bg-slate-900/50 border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                    >
                      {getSupportedCurrencies().map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {topupError && (
                  <div className="bg-red-900/30 border border-red-700 text-red-400 p-4 rounded-lg">
                    {topupError}
                  </div>
                )}

                {topupSuccess && (
                  <div className="bg-green-900/30 border border-green-700 text-green-400 p-4 rounded-lg">
                    {topupSuccess}
                  </div>
                )}

                <Button
                  type="submit"
                  isLoading={topupLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {topupLoading ? 'Processing...' : 'Add Funds'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
