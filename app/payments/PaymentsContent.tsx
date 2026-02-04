'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Currency } from '@/lib/db/types';
import { getSupportedCurrencies, formatCurrencyAmount } from '@/lib/utils/currency';

export default function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'send' | 'nfc' | 'topup'>('send');
  
  // Send Money State
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState<Currency>('USD');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [sendError, setSendError] = useState('');
  
  // NFC Payment State
  const [nfcAmount, setNfcAmount] = useState('');
  const [nfcLoading, setNfcLoading] = useState(false);
  const [nfcSuccess, setNfcSuccess] = useState('');
  const [nfcError, setNfcError] = useState('');
  const [nfcAnimating, setNfcAnimating] = useState(false);

  // Top Up State
  const [topupAmount, setTopupAmount] = useState('');
  const [topupCurrency, setTopupCurrency] = useState<Currency>('USD');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState('');
  const [topupError, setTopupError] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    const action = searchParams.get('action');
    if (tab === 'nfc') {
      setActiveTab('nfc');
    } else if (action === 'topup') {
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
          amount: parseFloat(sendAmount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setSendError(data.error || 'Failed to send money');
        return;
      }

      setSendSuccess(`Successfully sent $${sendAmount} to ${recipient}`);
      setRecipient('');
      setSendAmount('');
    } catch (error) {
      setSendError('An error occurred. Please try again.');
    } finally {
      setSendLoading(false);
    }
  };

  const handleNfcPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setNfcAnimating(true);
    setNfcLoading(true);
    setNfcError('');
    setNfcSuccess('');

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const response = await fetch('/api/payments/nfc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(nfcAmount),
          description: 'NFC Payment'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setNfcError(data.error || 'Payment failed');
        return;
      }

      setNfcSuccess(`Payment of $${nfcAmount} completed!`);
      setNfcAmount('');
    } catch (error) {
      setNfcError('An error occurred. Please try again.');
    } finally {
      setNfcLoading(false);
      setNfcAnimating(false);
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
        setTopupError(data.message || 'Failed to top up');
        return;
      }

      setTopupSuccess(`Successfully added ${formatCurrencyAmount(parseFloat(topupAmount), topupCurrency)} to your account!`);
      setTopupAmount('');
    } catch (error) {
      setTopupError('An error occurred. Please try again.');
    } finally {
      setTopupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-2xl mx-auto p-4 pt-20 pb-24">
        <h1 className="text-3xl font-bold mb-6">Payments</h1>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('topup')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'topup'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Top Up
          </button>
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'send'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Send Money
          </button>
          <button
            onClick={() => setActiveTab('nfc')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'nfc'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            NFC Payment
          </button>
        </div>

        {/* Top Up Tab */}
        {activeTab === 'topup' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add Money to Your Account</h2>
            
            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Currency
                </label>
                <select
                  value={topupCurrency}
                  onChange={(e) => setTopupCurrency(e.target.value as Currency)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  {getSupportedCurrencies().map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Amount"
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="0.00"
                required
                min="0.01"
                step="0.01"
              />

              <Button
                type="submit"
                isLoading={topupLoading}
                className="w-full"
              >
                Top Up Account
              </Button>

              {topupSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                  {topupSuccess}
                </div>
              )}

              {topupError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                  {topupError}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Send Money Tab */}
        {activeTab === 'send' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Send Money to Another User</h2>
            
            <form onSubmit={handleSendMoney} className="space-y-4">
              <Input
                label="Recipient (username or email)"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="@username or email@example.com"
                required
              />

              <Input
                label="Amount ($)"
                type="number"
                step="0.01"
                min="0.01"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.00"
                required
              />

              {sendSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-600 dark:text-green-400">{sendSuccess}</p>
                </div>
              )}

              {sendError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400">{sendError}</p>
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={sendLoading}>
                Send Money
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                💡 You can send money using the recipient's username or email address.
              </p>
            </div>
          </div>
        )}

        {/* NFC Payment Tab */}
        {activeTab === 'nfc' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">NFC / Tap to Pay</h2>
            
            <form onSubmit={handleNfcPayment} className="space-y-4">
              <Input
                label="Payment Amount ($)"
                type="number"
                step="0.01"
                min="0.01"
                value={nfcAmount}
                onChange={(e) => setNfcAmount(e.target.value)}
                placeholder="0.00"
                required
              />

              {nfcSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-600 dark:text-green-400">{nfcSuccess}</p>
                </div>
              )}

              {nfcError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400">{nfcError}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full relative overflow-hidden" 
                isLoading={nfcLoading}
              >
                {nfcAnimating ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-white opacity-75"></span>
                    <span className="relative">Processing...</span>
                  </span>
                ) : (
                  '📱 Tap to Pay'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  📱 Simulate a contactless payment by tapping the button above
                </p>
              </div>
              
              {nfcAnimating && (
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-4xl">📱</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
