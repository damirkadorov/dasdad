'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

interface ProductPreset {
  id: string;
  name: string;
  amount: number;
  currency: string;
  icon: string;
  description: string;
}

const PRESETS: ProductPreset[] = [
  {
    id: 'sneakers',
    name: 'Cyberpunk High-Top Sneakers',
    amount: 100,
    currency: 'USD',
    icon: '👟',
    description: 'Order #4092 - Cyberpunk Edition',
  },
  {
    id: 'sub',
    name: 'Pro Cloud Developer Pass (1 Mo)',
    amount: 25,
    currency: 'USD',
    icon: '⚡',
    description: 'Monthly Developer Subscription',
  },
  {
    id: 'coffee',
    name: 'Single-Origin Coffee Beans (1kg)',
    amount: 18,
    currency: 'EUR',
    icon: '☕',
    description: 'Artisan Roast - Batch #88',
  },
];

export default function PaymentGatewayTesterPage() {
  const [apiKey, setApiKey] = useState('pk_f5b9c5381e00084a9e00ee970c6ef79c39c506ee1fc5e6785f8e63e707db46cf');
  const [selectedPreset, setSelectedPreset] = useState<string>('sneakers');
  const [amount, setAmount] = useState<number>(100);
  const [currency, setCurrency] = useState<string>('USD');
  const [description, setDescription] = useState<string>('Order #4092');
  const [customerEmail, setCustomerEmail] = useState<string>('dkadorov@gmail.com');
  const [customerName, setCustomerName] = useState<string>('Damir Kadorov');

  // Flow State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [paymentSession, setPaymentSession] = useState<{
    paymentId: string;
    paymentUrl: string;
    status: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Status Polling for Step 3
  const [pollingStatus, setPollingStatus] = useState<'pending' | 'completed' | 'failed' | 'idle'>('idle');
  const [completedPayment, setCompletedPayment] = useState<any>(null);

  // Preset Selection
  const handleSelectPreset = (preset: ProductPreset) => {
    setSelectedPreset(preset.id);
    setAmount(preset.amount);
    setCurrency(preset.currency);
    setDescription(preset.description);
  };

  // Step 1: Create Payment Session
  const handleCreatePayment = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch('/api/payment-gateway/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey.trim(),
        },
        body: JSON.stringify({
          amount: Number(amount),
          currency,
          description,
          customerEmail,
          customerName,
          orderId: `ORDER-${Date.now().toString().slice(-6)}`,
          successUrl: typeof window !== 'undefined' ? `${window.location.origin}/developer/tester?status=success` : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      setPaymentSession(data);
      setPollingStatus('pending');
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || 'Error creating payment');
    } finally {
      setIsCreating(false);
    }
  };

  // Poll for status when in step 2 or 3
  useEffect(() => {
    if (!paymentSession?.paymentId || pollingStatus === 'completed') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment-gateway/payments?paymentId=${paymentSession.paymentId}`, {
          headers: {
            'X-API-Key': apiKey.trim(),
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'completed') {
            setPollingStatus('completed');
            setCompletedPayment(data);
            setCurrentStep(3);
          } else if (data.status === 'failed') {
            setPollingStatus('failed');
          }
        }
      } catch (e) {
        // silent polling catch
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [paymentSession?.paymentId, pollingStatus, apiKey]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setPaymentSession(null);
    setPollingStatus('idle');
    setCompletedPayment(null);
    setError(null);
  };

  const curlCommand = `curl -X POST "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/payment-gateway/payments" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "amount": ${amount},
    "currency": "${currency}",
    "description": "${description}",
    "customerEmail": "${customerEmail}",
    "customerName": "${customerName}"
  }'`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#06090e]">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
              <Link href="/developer" className="hover:underline flex items-center gap-1">
                <span>← Developer Portal</span>
              </Link>
              <span>/</span>
              <span>Payment Gateway Sandbox</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
              <span>⚡ API Interactive Tester & Demo Store</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Test and verify your payment gateway integration in 3 live steps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sandbox Ready
            </span>
            <Button size="sm" variant="secondary" onClick={resetFlow}>
              🔄 Reset Flow
            </Button>
          </div>
        </div>

        {/* API Key Banner */}
        <div className="bezel-card mb-8">
          <div className="bezel-card-inner p-5 sm:p-6 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-transparent">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  🔑 Your Merchant Public API Key (X-API-Key)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3.5 py-2 font-mono text-xs text-purple-600 dark:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="pk_..."
                  />
                  <button
                    onClick={() => copyToClipboard(apiKey, 'apiKey')}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {copiedText === 'apiKey' ? '✓ Copied' : 'Copy Key'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Stepper Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Step 1 Pill */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              currentStep === 1
                ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
                : paymentSession
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 opacity-70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  paymentSession
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 1
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {paymentSession ? '✓' : '1'}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">1. Create Session</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">POST /api/payment-gateway/payments</p>
              </div>
            </div>
          </div>

          {/* Step 2 Pill */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              currentStep === 2
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                : pollingStatus === 'completed'
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 opacity-70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  pollingStatus === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {pollingStatus === 'completed' ? '✓' : '2'}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">2. Redirect & Pay</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Customer Hosted Checkout</p>
              </div>
            </div>
          </div>

          {/* Step 3 Pill */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              pollingStatus === 'completed'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                : currentStep === 3 || pollingStatus === 'pending'
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                : 'bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 opacity-70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  pollingStatus === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {pollingStatus === 'completed' ? '✓' : '3'}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">3. Webhook & Status</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {pollingStatus === 'completed'
                    ? 'payment.completed'
                    : pollingStatus === 'pending'
                    ? 'Listening for payment...'
                    : 'Awaiting webhook'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Preset Storefront & Intent Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Storefront Presets Card */}
            <div className="bezel-card">
              <div className="bezel-card-inner p-5">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🛍️ Sample Store Items</span>
                </h2>
                <div className="space-y-2.5">
                  {PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 rounded-lg bg-gray-100 dark:bg-gray-800">{preset.icon}</span>
                          <div>
                            <p className="font-semibold text-xs text-gray-900 dark:text-white">{preset.name}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">{preset.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400">
                            {preset.amount} {preset.currency}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Intent Fields */}
                <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => {
                          setAmount(Number(e.target.value));
                          setSelectedPreset('');
                        }}
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CHF">CHF (₣)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Action Trigger */}
                <div className="mt-5">
                  <button
                    onClick={handleCreatePayment}
                    disabled={isCreating}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Calling API...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡ Step 1: Create Payment Session</span>
                        <span className="font-mono">({amount} {currency})</span>
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400">
                    ❌ {error}
                  </div>
                )}
              </div>
            </div>

            {/* Test Card Cheat Sheet Card */}
            <div className="bezel-card">
              <div className="bezel-card-inner p-5 bg-gradient-to-br from-gray-900 to-gray-950 text-white border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <span>💳 Sandbox Test Card</span>
                  </h3>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                    Pre-funded ($1000)
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">
                  Use this active test card on the hosted checkout page to complete the transaction:
                </p>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-gray-800">
                    <span className="text-gray-400 text-[11px]">Card Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold tracking-wider">7003 2114 8051 1885</span>
                      <button
                        onClick={() => copyToClipboard('7003211480511885', 'cardNum')}
                        className="text-[10px] text-purple-400 hover:text-purple-300 cursor-pointer"
                      >
                        {copiedText === 'cardNum' ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-gray-800">
                      <span className="text-gray-400 text-[11px]">Exp:</span>
                      <span className="text-white font-bold">07/31</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-gray-800">
                      <span className="text-gray-400 text-[11px]">CVV:</span>
                      <span className="text-white font-bold">481</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Execution & Response Inspector (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 2: Payment Session Result & Redirection */}
            <div className={`bezel-card transition-all ${currentStep >= 2 ? 'opacity-100 ring-2 ring-blue-500/30' : 'opacity-75'}`}>
              <div className="bezel-card-inner p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">2</div>
                    <h2 className="font-bold text-sm text-gray-900 dark:text-white">Customer Redirection (Hosted Checkout)</h2>
                  </div>
                  {paymentSession && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      201 Created
                    </span>
                  )}
                </div>

                {paymentSession ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800">
                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Hosted Payment URL:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={paymentSession.paymentUrl}
                          className="flex-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1.5 font-mono text-xs text-blue-600 dark:text-blue-400 select-all"
                        />
                        <button
                          onClick={() => copyToClipboard(paymentSession.paymentUrl, 'payUrl')}
                          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          {copiedText === 'payUrl' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <a
                        href={paymentSession.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>👉 Open Hosted Payment Page</span>
                        <span className="text-blue-200">↗</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-400">
                    <p className="text-xs">Click «Create Payment Session» in Step 1 to generate a real checkout session.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Webhook & Status Monitor */}
            <div className={`bezel-card transition-all ${pollingStatus === 'completed' ? 'ring-2 ring-emerald-500 shadow-lg' : ''}`}>
              <div className="bezel-card-inner p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center text-xs ${pollingStatus === 'completed' ? 'bg-emerald-600 text-white' : 'bg-emerald-500/20 text-emerald-600'}`}>3</div>
                    <h2 className="font-bold text-sm text-gray-900 dark:text-white">Webhook & Live Status Confirmation</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {pollingStatus === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        Listening for payment...
                      </span>
                    )}
                    {pollingStatus === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        <span>✅</span> payment.completed
                      </span>
                    )}
                  </div>
                </div>

                {pollingStatus === 'completed' ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl">
                          ✓
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                            Payment Successfully Settled!
                          </h4>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">
                            Merchant account received {completedPayment?.amount} {completedPayment?.currency}. Webhook event fired.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900 text-gray-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-gray-800">
                      <p className="text-emerald-400 font-bold mb-2">// Webhook Event Payload Dispatched to Merchant</p>
                      <pre>{JSON.stringify({
                        event: 'payment.completed',
                        paymentId: completedPayment?.paymentId,
                        orderId: completedPayment?.orderId,
                        amount: completedPayment?.amount,
                        currency: completedPayment?.currency,
                        status: 'completed',
                        completedAt: completedPayment?.completedAt || new Date().toISOString(),
                        signature: 'sig_' + Math.random().toString(36).substring(2, 15)
                      }, null, 2)}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900 text-gray-300 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-gray-800">
                    <p className="text-gray-500 mb-2">// Webhook Dispatcher Listener</p>
                    <p className="text-gray-400 text-xs">
                      {paymentSession
                        ? `Awaiting payment confirmation for Session ID: ${paymentSession.paymentId}... Complete the payment on the opened checkout page.`
                        : 'Webhook event will trigger automatically once customer enters card credentials and confirms payment.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Developer cURL Tab */}
            <div className="bezel-card">
              <div className="bezel-card-inner p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <span>💻 Equivalent Terminal cURL Command</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(curlCommand, 'curl')}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    {copiedText === 'curl' ? '✓ Copied' : 'Copy cURL'}
                  </button>
                </div>
                <div className="bg-gray-950 p-3.5 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-gray-800">
                  <pre>{curlCommand}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
