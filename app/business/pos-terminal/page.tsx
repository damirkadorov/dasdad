'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BusinessNavigation from '@/components/business/BusinessNavigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatCurrencyAmount } from '@/lib/utils/currency';
import { Currency } from '@/lib/db/types';

export default function POSTerminal() {
  const router = useRouter();
  
  // Card input state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [description, setDescription] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(value);
    }
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\//g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\//g, '');
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setExpiryDate(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const handleCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate inputs
    if (!cardNumber || cardNumber.length !== 16) {
      setError('Please enter a valid 16-digit card number');
      setLoading(false);
      return;
    }

    if (!expiryDate || expiryDate.length !== 4) {
      setError('Please enter a valid expiry date (MMYY)');
      setLoading(false);
      return;
    }

    if (!cvv || cvv.length !== 3) {
      setError('Please enter a valid 3-digit CVV');
      setLoading(false);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/business/pos-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber,
          expiryDate,
          cvv,
          amount: parseFloat(amount),
          currency,
          description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setSuccess(`Successfully charged ${formatCurrencyAmount(parseFloat(amount), currency)}`);
      setTransactionDetails(data);
      setShowSuccess(true);
      
      // Clear form
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setAmount('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransaction = () => {
    setShowSuccess(false);
    setTransactionDetails(null);
    setSuccess('');
    setError('');
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-900">
        <BusinessNavigation />
        
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
            <div className="text-center">
              {/* Success Animation */}
              <div className="mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-slate-400 mb-6">Transaction completed successfully</p>

              {/* Transaction Details */}
              <div className="bg-slate-700/50 rounded-xl p-6 mb-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Charged:</span>
                    <span className="text-white font-bold text-lg">
                      {transactionDetails && formatCurrencyAmount(transactionDetails.amount, transactionDetails.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Card:</span>
                    <span className="text-white">**** {transactionDetails?.cardLast4}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="text-white font-mono text-sm">{transactionDetails?.transactionId?.substring(0, 8)}</span>
                  </div>
                  {transactionDetails?.description && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Description:</span>
                      <span className="text-white">{transactionDetails.description}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-green-400 font-semibold">✓ Completed</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleNewTransaction} className="flex-1">
                  New Transaction
                </Button>
                <Button onClick={() => router.push('/business/dashboard')} variant="secondary" className="flex-1">
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <BusinessNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            POS Terminal
          </h1>
          <p className="text-slate-400 text-lg">
            Accept card payments from customers
          </p>
        </div>

        {/* POS Terminal Card */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-600">
          <form onSubmit={handleCharge}>
            {/* Amount Section */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                Amount to Charge
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-6 py-4 text-4xl font-bold bg-slate-900/50 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-slate-600"
                    required
                  />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="px-4 py-4 text-xl font-bold bg-slate-900/50 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CHF">CHF</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>

            {/* Card Number */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                Card Number
              </label>
              <input
                type="text"
                value={formatCardNumber(cardNumber)}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-3 bg-slate-900/50 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white text-lg font-mono placeholder-slate-600"
                required
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  value={formatExpiry(expiryDate)}
                  onChange={handleExpiryChange}
                  placeholder="12/25"
                  maxLength={5}
                  className="w-full px-4 py-3 bg-slate-900/50 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white text-lg font-mono placeholder-slate-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                  CVV
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="123"
                  maxLength={3}
                  className="w-full px-4 py-3 bg-slate-900/50 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white text-lg font-mono placeholder-slate-600"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Payment for..."
                className="w-full px-4 py-3 bg-slate-900/50 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-slate-600"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-700 text-red-400 p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Charge Button */}
            <Button
              type="submit"
              isLoading={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xl py-4 rounded-xl shadow-lg"
            >
              {loading ? 'Processing...' : `Charge ${amount ? formatCurrencyAmount(parseFloat(amount), currency) : '—'}`}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-slate-600">
            <p className="text-xs text-slate-400 text-center">
              🔒 Secure payment processing within the ecosystem
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-xl p-4">
          <p className="text-blue-400 text-sm">
            💡 <strong>Tip:</strong> Enter card details from users within your ecosystem. The amount will be deducted from the card owner's balance.
          </p>
        </div>
      </div>
    </div>
  );
}
