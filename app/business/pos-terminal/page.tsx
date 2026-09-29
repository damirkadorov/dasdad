'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BusinessNavigation from '@/components/business/BusinessNavigation';
import Footer from '@/components/layout/Footer';
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
      <div className="min-h-screen flex flex-col bg-[#07090D] text-zinc-100 bg-cyber-grid">
        <BusinessNavigation />
        
        <main className="flex-1 container mx-auto px-4 py-12 max-w-xl animate-scaleIn">
          <div className="bg-white/[0.03] rounded-3xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl text-center">
            {/* Success Animation */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#5E9FE8] to-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-[#5E9FE8]/20 text-[#07090D]">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#5E9FE8]/10 border border-[#5E9FE8]/30 text-xs font-bold text-[#5E9FE8] mb-3">
              <span>✓ TRANSACTION CLEARED</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white mb-2">Payment Settled!</h2>
            <p className="text-zinc-400 text-sm mb-6">Customer funds captured and credited to corporate treasury</p>

            {/* Transaction Receipt Card */}
            <div className="bg-[#07090D] border border-white/10 rounded-2xl p-6 mb-6 text-left font-mono">
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-zinc-400 uppercase">Amount Captured:</span>
                  <span className="text-[#5E9FE8] font-extrabold text-xl">
                    {transactionDetails && formatCurrencyAmount(transactionDetails.amount, transactionDetails.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Card Mask:</span>
                  <span className="text-white font-bold">•••• •••• •••• {transactionDetails?.cardLast4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Clearance Ref:</span>
                  <span className="text-zinc-300 select-all">{transactionDetails?.transactionId?.substring(0, 14)}...</span>
                </div>
                {transactionDetails?.description && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Memo:</span>
                    <span className="text-white">{transactionDetails.description}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-zinc-400">Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    SETTLED (INSTANT)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleNewTransaction} className="flex-1 bg-[#5E9FE8] hover:bg-[#7AB2EE] text-[#07090D] font-extrabold">
                + New Terminal Charge
              </Button>
              <Button onClick={() => router.push('/business/dashboard')} variant="secondary" className="flex-1 border border-white/10 text-white">
                Treasury Dashboard
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07090D] text-zinc-100 bg-cyber-grid">
      <BusinessNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-xl animate-fadeIn">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#5E9FE8]/10 border border-[#5E9FE8]/30 text-xs font-bold text-[#5E9FE8] mb-3">
            <span className="w-2 h-2 rounded-xl bg-[#5E9FE8] animate-pulse"></span>
            <span>VIRTUAL POINT-OF-SALE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            POS Terminal Terminal
          </h1>
          <p className="text-zinc-400 text-sm">
            Instant customer card debit and real-time merchant settlement
          </p>
        </div>

        {/* POS Terminal Card */}
        <div className="bg-white/[0.03] rounded-3xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl">
          <form onSubmit={handleCharge}>
            {/* Amount Section */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                Charge Amount
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-5 py-3.5 text-3xl font-extrabold bg-[#07090D] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] text-white font-mono placeholder-zinc-700"
                    required
                  />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="px-4 py-3.5 text-lg font-bold bg-[#07090D] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] text-white font-mono"
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
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                Customer Card Number (16 Digits)
              </label>
              <input
                type="text"
                value={formatCardNumber(cardNumber)}
                onChange={handleCardNumberChange}
                placeholder="7000 0000 0000 0000"
                maxLength={19}
                className="w-full px-4 py-3 bg-[#07090D] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] text-white text-base font-mono tracking-wider placeholder-zinc-700"
                required
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  value={formatExpiry(expiryDate)}
                  onChange={handleExpiryChange}
                  placeholder="12/28"
                  maxLength={5}
                  className="w-full px-4 py-3 bg-[#07090D] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] text-white text-base font-mono placeholder-zinc-700"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                  CVV Code
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="123"
                  maxLength={3}
                  className="w-full px-4 py-3 bg-[#07090D] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] text-white text-base font-mono placeholder-zinc-700"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                Transaction Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Retail Order #892"
                className="w-full px-4 py-3 bg-[#07090D] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] text-white text-sm placeholder-zinc-700"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-950/40 border border-red-500/30 text-red-400 p-4 rounded-xl text-center text-sm">
                {error}
              </div>
            )}

            {/* Charge Button */}
            <Button
              type="submit"
              isLoading={loading}
              className="w-full bg-[#5E9FE8] hover:bg-[#7AB2EE] text-[#07090D] font-extrabold text-base py-4 rounded-2xl shadow-xl shadow-[#5E9FE8]/20"
            >
              {loading ? 'Processing Authorization...' : `Charge ${amount ? formatCurrencyAmount(parseFloat(amount), currency) : 'Now'}`}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <span>🔒</span>
            <span>256-bit encrypted clearance channel</span>
          </div>
        </div>

        {/* Tip Box */}
        <div className="mt-4 bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-xs text-zinc-400 flex items-center gap-2.5">
          <span className="text-base text-[#5E9FE8]">💡</span>
          <span>
            <strong>Note:</strong> POS Terminal accepts customer personal Lingoung cards for instant clearing directly into this corporate balance.
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
