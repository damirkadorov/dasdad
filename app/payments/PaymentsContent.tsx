'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Currency, CurrencyBalance } from '@/lib/db/types';
import { getSupportedCurrencies, formatCurrencyAmount } from '@/lib/utils/currency';

export default function PaymentsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'send' | 'nfc' | 'topup' | 'iban'>('send');
  const [balances, setBalances] = useState<CurrencyBalance[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(true);
  
  // Send Money State
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState<Currency>('USD');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [sendError, setSendError] = useState('');
  
  // NFC Payment State
  const [nfcAmount, setNfcAmount] = useState('');
  const [nfcCurrency, setNfcCurrency] = useState<Currency>('USD');
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

  // IBAN Transfer State
  const [ibanRecipient, setIbanRecipient] = useState('');
  const [ibanAmount, setIbanAmount] = useState('');
  const [ibanCurrency, setIbanCurrency] = useState<Currency>('USD');
  const [ibanLoading, setIbanLoading] = useState(false);
  const [ibanSuccess, setIbanSuccess] = useState('');
  const [ibanError, setIbanError] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    const action = searchParams.get('action');
    if (tab === 'nfc') {
      setActiveTab('nfc');
    } else if (tab === 'iban') {
      setActiveTab('iban');
    } else if (action === 'topup') {
      setActiveTab('topup');
    }
  }, [searchParams]);

  useEffect(() => {
    void refreshBalances();
  }, []);

  const refreshBalances = async () => {
    try {
      const response = await fetch('/api/user/profile', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const nextBalances = data.user?.balances || [];
      setBalances(nextBalances);
      if (nextBalances.length > 0) {
        setSendCurrency((current) => nextBalances.some((balance: CurrencyBalance) => balance.currency === current) ? current : nextBalances[0].currency);
        setNfcCurrency((current) => nextBalances.some((balance: CurrencyBalance) => balance.currency === current) ? current : nextBalances[0].currency);
      }
    } finally {
      setBalancesLoading(false);
    }
  };

  const getBalance = (currency: Currency) =>
    balances.find((balance) => balance.currency === currency)?.amount ?? 0;

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
      await refreshBalances();
    } catch {
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
          currency: nfcCurrency,
          description: 'NFC Payment'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setNfcError(data.error || 'Payment failed');
        return;
      }

      setNfcSuccess(`Payment of ${formatCurrencyAmount(parseFloat(nfcAmount), nfcCurrency)} completed!`);
      setNfcAmount('');
      await refreshBalances();
    } catch {
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
        setTopupError(data.error || data.message || 'Failed to top up');
        return;
      }

      setTopupSuccess(`Successfully added ${formatCurrencyAmount(parseFloat(topupAmount), topupCurrency)} to your account!`);
      setTopupAmount('');
      await refreshBalances();
    } catch {
      setTopupError('An error occurred. Please try again.');
    } finally {
      setTopupLoading(false);
    }
  };

  const handleIbanTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIbanLoading(true);
    setIbanError('');
    setIbanSuccess('');

    try {
      const response = await fetch('/api/payments/iban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iban: ibanRecipient,
          amount: parseFloat(ibanAmount),
          currency: ibanCurrency
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setIbanError(data.error || 'Failed to complete IBAN transfer');
        return;
      }

      setIbanSuccess(`Successfully transferred ${formatCurrencyAmount(parseFloat(ibanAmount), ibanCurrency)} to ${ibanRecipient}`);
      setIbanRecipient('');
      setIbanAmount('');
      await refreshBalances();
    } catch {
      setIbanError('An error occurred. Please try again.');
    } finally {
      setIbanLoading(false);
    }
  };

  // Helper function for tab button styling
  const getTabClassName = (tab: typeof activeTab) => {
    return `flex-1 py-2.5 px-4 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
      activeTab === tab
        ? 'bg-[#5E9FE8] text-black shadow-lg shadow-[#5E9FE8]/20'
        : 'bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 border border-white/10'
    }`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090D] text-slate-100 bg-cyber-grid selection:bg-[#5E9FE8] selection:text-slate-950">
      <Navigation />
      
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 pt-10 pb-20 animate-fadeIn relative z-10">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
            <span>Transfers &amp; Settlement</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Payments &amp; Transfers</h1>
          <p className="text-xs text-slate-400 mt-0.5">Instant zero-fee multi-currency transfers, top-ups, and NFC contactless checkout.</p>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Available balances</p>
            <button type="button" onClick={() => void refreshBalances()} className="min-h-9 rounded-lg px-3 text-xs font-semibold text-blue-300 hover:bg-white/[0.06]">
              Refresh
            </button>
          </div>
          {balancesLoading ? (
            <p className="text-sm text-slate-500">Loading balances…</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {balances.map((balance) => (
                <div key={balance.currency} className="min-w-[132px] rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-slate-500">{balance.currency}</p>
                  <p className="mt-0.5 whitespace-nowrap font-mono text-sm font-semibold text-white">{formatCurrencyAmount(balance.amount, balance.currency)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto p-1 bg-white/[0.03] rounded-full border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('topup')}
            className={getTabClassName('topup')}
          >
            Top Up
          </button>
          <button
            onClick={() => setActiveTab('send')}
            className={getTabClassName('send')}
          >
            Send Money
          </button>
          <button
            onClick={() => setActiveTab('iban')}
            className={getTabClassName('iban')}
          >
            IBAN Wire
          </button>
          <button
            onClick={() => setActiveTab('nfc')}
            className={getTabClassName('nfc')}
          >
            NFC Terminal
          </button>
        </div>

        {/* Top Up Tab */}
        {activeTab === 'topup' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg tab-panel">
            <h2 className="text-xl font-bold mb-4">Add Money to Your Account</h2>
            
            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Currency
                </label>
                <select
                  value={topupCurrency}
                  onChange={(e) => setTopupCurrency(e.target.value as Currency)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg tab-panel">
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
                label={`Amount · Available ${formatCurrencyAmount(getBalance(sendCurrency), sendCurrency)}`}
                type="number"
                step="0.01"
                min="0.01"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.00"
                required
              />

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Send currency</label>
                <select value={sendCurrency} onChange={(e) => setSendCurrency(e.target.value as Currency)} className="min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white focus:border-blue-300 focus:outline-none">
                  {getSupportedCurrencies().map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                </select>
              </div>

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
                💡 You can send money using the recipient&apos;s username or email address.
              </p>
            </div>
          </div>
        )}

        {/* IBAN Transfer Tab */}
        {activeTab === 'iban' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg tab-panel">
            <h2 className="text-xl font-bold mb-4">International Bank Transfer (IBAN)</h2>
            
            <form onSubmit={handleIbanTransfer} className="space-y-4">
              <Input
                label="Recipient IBAN"
                type="text"
                value={ibanRecipient}
                onChange={(e) => setIbanRecipient(e.target.value)}
                placeholder="GB29 NWBK 6016 1331 9268 19"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Currency
                </label>
                <select
                  value={ibanCurrency}
                  onChange={(e) => setIbanCurrency(e.target.value as Currency)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
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
                value={ibanAmount}
                onChange={(e) => setIbanAmount(e.target.value)}
                placeholder="0.00"
                required
                min="0.01"
                step="0.01"
              />

              {ibanSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-600 dark:text-green-400">{ibanSuccess}</p>
                </div>
              )}

              {ibanError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400">{ibanError}</p>
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={ibanLoading}>
                Send IBAN Transfer
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                🌍 IBAN transfers are used for international bank transfers within supported countries.
              </p>
            </div>
          </div>
        )}

        {/* NFC Payment Tab */}
        {activeTab === 'nfc' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg tab-panel">
            <h2 className="text-xl font-bold mb-4">NFC / Tap to Pay</h2>
            
            <form onSubmit={handleNfcPayment} className="space-y-4">
              <Input
                label={`Payment amount · Available ${formatCurrencyAmount(getBalance(nfcCurrency), nfcCurrency)}`}
                type="number"
                step="0.01"
                min="0.01"
                value={nfcAmount}
                onChange={(e) => setNfcAmount(e.target.value)}
                placeholder="0.00"
                required
              />

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Payment currency</label>
                <select value={nfcCurrency} onChange={(e) => setNfcCurrency(e.target.value as Currency)} className="min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white focus:border-blue-300 focus:outline-none">
                  {getSupportedCurrencies().map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                </select>
              </div>

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
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  📱 Simulate a contactless payment by tapping the button above
                </p>
              </div>
              
              {nfcAnimating && (
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-4xl">📱</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
