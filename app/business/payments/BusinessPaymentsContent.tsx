'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BusinessNavigation from '@/components/business/BusinessNavigation';
import Footer from '@/components/layout/Footer';
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
    <div className="min-h-screen flex flex-col bg-[#07090D] text-zinc-100 bg-cyber-grid">
      <BusinessNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#5E9FE8]/10 border border-[#5E9FE8]/30 text-xs font-bold text-[#5E9FE8] mb-2">
            <span className="w-2 h-2 rounded-xl bg-[#5E9FE8] animate-pulse"></span>
            <span>ENTERPRISE TREASURY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Commercial Disbursements &amp; Liquidity
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Initiate counterparty wire transfers or credit corporate balance instantly
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'send'
                ? 'bg-[#5E9FE8] text-[#07090D] shadow-lg shadow-[#5E9FE8]/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Direct Payout
          </button>
          <button
            onClick={() => setActiveTab('topup')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'topup'
                ? 'bg-[#5E9FE8] text-[#07090D] shadow-lg shadow-[#5E9FE8]/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Deposit Capital
          </button>
        </div>

        {/* Content */}
        <div className="bg-white/[0.03] rounded-3xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl">
          {/* Send Money Tab */}
          {activeTab === 'send' && (
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">Send Corporate Payment</h2>
              <p className="text-xs text-zinc-400 mb-6">Dispatch funds across the internal clearing network instantly.</p>
              
              <form onSubmit={handleSendMoney} className="space-y-6">
                <Input
                  label="Recipient (username or email)"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="vendor@company.com"
                  required
                />

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Settlement Amount &amp; Currency
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      step="0.01"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-4 py-3 bg-[#07090D] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] text-white font-mono text-base placeholder-zinc-600"
                      required
                    />
                    <select
                      value={sendCurrency}
                      onChange={(e) => setSendCurrency(e.target.value as Currency)}
                      className="px-4 py-3 bg-[#07090D] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] text-white font-mono text-sm"
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
                  <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
                    {sendError}
                  </div>
                )}

                {sendSuccess && (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm">
                    {sendSuccess}
                  </div>
                )}

                <Button
                  type="submit"
                  isLoading={sendLoading}
                  className="w-full py-3.5 bg-[#5E9FE8] hover:bg-[#7AB2EE] text-[#07090D] font-extrabold text-sm shadow-xl shadow-[#5E9FE8]/20"
                >
                  {sendLoading ? 'Executing Transfer...' : 'Authorize Disbursement'}
                </Button>
              </form>
            </div>
          )}

          {/* Top Up Tab */}
          {activeTab === 'topup' && (
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">Deposit Capital to Treasury</h2>
              <p className="text-xs text-zinc-400 mb-6">
                Direct liquidity injection to company operational balances (Simulation: Instant Settlement).
              </p>
              
              <form onSubmit={handleTopUp} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Amount &amp; Currency
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      step="0.01"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-4 py-3 bg-[#07090D] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] text-white font-mono text-base placeholder-zinc-600"
                      required
                    />
                    <select
                      value={topupCurrency}
                      onChange={(e) => setTopupCurrency(e.target.value as Currency)}
                      className="px-4 py-3 bg-[#07090D] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] text-white font-mono text-sm"
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
                  <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
                    {topupError}
                  </div>
                )}

                {topupSuccess && (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm">
                    {topupSuccess}
                  </div>
                )}

                <Button
                  type="submit"
                  isLoading={topupLoading}
                  className="w-full py-3.5 bg-[#5E9FE8] hover:bg-[#7AB2EE] text-[#07090D] font-extrabold text-sm shadow-xl shadow-[#5E9FE8]/20"
                >
                  {topupLoading ? 'Crediting Treasury...' : 'Credit Liquidity Now'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
