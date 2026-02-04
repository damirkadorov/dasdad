'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'send' | 'nfc'>('send');
  
  // Send Money State
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [sendError, setSendError] = useState('');
  
  // NFC Payment State
  const [nfcAmount, setNfcAmount] = useState('');
  const [nfcLoading, setNfcLoading] = useState(false);
  const [nfcSuccess, setNfcSuccess] = useState('');
  const [nfcError, setNfcError] = useState('');
  const [nfcAnimating, setNfcAnimating] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'nfc') {
      setActiveTab('nfc');
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
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.message || 'Failed to send money');
      }

      setSendSuccess(`Successfully sent $${sendAmount} to ${recipient}!`);
      setRecipient('');
      setSendAmount('');
      
      setTimeout(() => setSendSuccess(''), 5000);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send money');
    } finally {
      setSendLoading(false);
    }
  };

  const handleNfcPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setNfcLoading(true);
    setNfcError('');
    setNfcSuccess('');
    setNfcAnimating(true);

    try {
      // Simulate NFC tap animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch('/api/payments/nfc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(nfcAmount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.message || 'Failed to process payment');
      }

      setNfcSuccess(`Payment of $${nfcAmount} completed successfully!`);
      setNfcAmount('');
      
      setTimeout(() => {
        setNfcSuccess('');
        setNfcAnimating(false);
      }, 3000);
    } catch (err) {
      setNfcError(err instanceof Error ? err.message : 'Failed to process payment');
      setNfcAnimating(false);
    } finally {
      setNfcLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Payments 💸
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'send'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            💸 Send Money
          </button>
          <button
            onClick={() => setActiveTab('nfc')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'nfc'
                ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📱 NFC Payment
          </button>
        </div>

        {/* Send Money Tab */}
        {activeTab === 'send' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💸</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Send Money
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Transfer money to anyone instantly
              </p>
            </div>

            <form onSubmit={handleSendMoney} className="space-y-6">
              <Input
                label="Recipient (username or email)"
                type="text"
                placeholder="john.doe or john@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />

              <Input
                label="Amount ($)"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                required
              />

              <Button
                type="submit"
                isLoading={sendLoading}
                className="w-full"
                size="lg"
              >
                Send Money
              </Button>
            </form>

            {sendSuccess && (
              <div className="mt-6 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg flex items-center">
                <span className="text-2xl mr-3">✅</span>
                {sendSuccess}
              </div>
            )}

            {sendError && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center">
                <span className="text-2xl mr-3">❌</span>
                {sendError}
              </div>
            )}
          </div>
        )}

        {/* NFC Payment Tab */}
        {activeTab === 'nfc' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className={`text-6xl mb-4 ${nfcAnimating ? 'animate-bounce' : ''}`}>
                📱
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                NFC Payment
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Make contactless payments with a tap
              </p>
            </div>

            <form onSubmit={handleNfcPayment} className="space-y-6">
              <Input
                label="Amount ($)"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={nfcAmount}
                onChange={(e) => setNfcAmount(e.target.value)}
                required
              />

              <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl p-8 text-white text-center">
                <div className={`text-7xl mb-4 ${nfcAnimating ? 'animate-pulse' : ''}`}>
                  {nfcAnimating ? '✨' : '📲'}
                </div>
                <p className="text-lg font-semibold mb-2">
                  {nfcAnimating ? 'Processing payment...' : 'Ready to pay'}
                </p>
                <p className="text-white/80 text-sm">
                  {nfcAnimating 
                    ? 'Hold your device steady' 
                    : 'Tap the button below to simulate NFC payment'}
                </p>
              </div>

              <Button
                type="submit"
                isLoading={nfcLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700"
                size="lg"
              >
                {nfcAnimating ? 'Processing...' : '📱 Tap to Pay'}
              </Button>
            </form>

            {nfcSuccess && (
              <div className="mt-6 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg flex items-center">
                <span className="text-2xl mr-3">✅</span>
                {nfcSuccess}
              </div>
            )}

            {nfcError && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center">
                <span className="text-2xl mr-3">❌</span>
                {nfcError}
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
              💡 Send Money Tips
            </h3>
            <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
              <li>• Use username or email address</li>
              <li>• Instant transfer, no fees</li>
              <li>• Recipient must be registered</li>
            </ul>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">
              📱 NFC Payment Info
            </h3>
            <ul className="text-sm text-orange-800 dark:text-orange-300 space-y-1">
              <li>• Contactless payment simulation</li>
              <li>• Fast and secure transactions</li>
              <li>• Works like Apple Pay / Google Pay</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
