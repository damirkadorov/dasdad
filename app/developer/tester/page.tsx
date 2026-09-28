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

  const hostOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://lingoung-bank.vercel.app';

  const curlCommand = `curl -X POST "${hostOrigin}/api/payment-gateway/payments" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "amount": ${amount},
    "currency": "${currency}",
    "description": "${description}",
    "customerEmail": "${customerEmail}",
    "customerName": "${customerName}"
  }'`;

  const dropInHtmlSnippet = `<!-- Lingoung Bank Ready-to-Use HTML Integration -->
<script src="${hostOrigin}/lingoung-pay.js"></script>

<button 
  data-lingoung-pay
  data-key="${apiKey}"
  data-amount="${amount}"
  data-currency="${currency}"
  data-description="${description}"
  data-customer-name="${customerName}"
  data-customer-email="${customerEmail}"
  style="background:#d4ff00;color:#05070B;font-weight:800;padding:14px 28px;border-radius:12px;border:none;cursor:pointer;font-family:sans-serif;box-shadow:0 10px 20px rgba(212,255,0,0.25);">
  ⚡ Pay ${amount} ${currency} with Lingoung Bank
</button>

<script>
  document.querySelector('[data-lingoung-pay]').addEventListener('lingoung:success', function(e) {
    alert('Payment successful! Transaction ID: ' + e.detail.paymentId);
  });
</script>`;

  const downloadHtmlDemo = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lingoung Bank Payment Demo</title>
  <script src="${hostOrigin}/lingoung-pay.js"></script>
  <style>
    body { background: #05070B; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #090d16; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .price { font-size: 38px; font-weight: 900; margin: 16px 0; color: #d4ff00; }
    .btn { background: #d4ff00; color: #000; font-weight: 800; padding: 16px 24px; border-radius: 12px; border: none; cursor: pointer; width: 100%; font-size: 16px; transition: transform 0.2s; }
    .btn:hover { transform: scale(1.02); }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;">Lingoung Bank Checkout</div>
    <h2>${description}</h2>
    <p style="color:#94a3b8;font-size:14px;margin-bottom:16px;">${customerName} (${customerEmail})</p>
    <div class="price">${amount} ${currency}</div>
    <button class="btn" data-lingoung-pay data-key="${apiKey}" data-amount="${amount}" data-currency="${currency}" data-description="${description}">
      ⚡ Pay with Lingoung Bank
    </button>
  </div>
  <script>
    document.querySelector('[data-lingoung-pay]').addEventListener('lingoung:success', function(e) {
      alert('Payment Completed! Transaction ID: ' + e.detail.paymentId);
    });
  </script>
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingoung-checkout-${currency.toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05070B] text-zinc-100 bg-cyber-grid">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl animate-fadeIn">
        {/* Breadcrumb Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#d4ff00] uppercase tracking-wider mb-1">
              <Link href="/developer" className="hover:underline flex items-center gap-1">
                <span>← Developer Portal</span>
              </Link>
              <span>/</span>
              <span>API Gateway Sandbox</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>⚡ API Interactive Sandbox &amp; Demo Store</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Test and verify your payment gateway integration in 3 live steps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#d4ff00] animate-pulse"></span>
              SANDBOX ENGINE READY
            </span>
            <Button size="sm" variant="secondary" onClick={resetFlow} className="border border-white/10 text-zinc-300 hover:text-white">
              🔄 Reset Flow
            </Button>
          </div>
        </div>

        {/* API Key Banner */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                🔑 Merchant Public API Key (X-API-Key)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 bg-[#05070B] border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs text-[#d4ff00] focus:outline-none focus:ring-2 focus:ring-[#d4ff00]"
                  placeholder="pk_..."
                />
                <button
                  onClick={() => copyToClipboard(apiKey, 'apiKey')}
                  className="px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  {copiedText === 'apiKey' ? '✓ Copied' : 'Copy Key'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Stepper Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Step 1 Pill */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              currentStep === 1
                ? 'bg-[#d4ff00]/10 border-[#d4ff00] shadow-lg shadow-[#d4ff00]/10'
                : paymentSession
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-white/[0.02] border-white/10 opacity-70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                  paymentSession
                    ? 'bg-emerald-500 text-zinc-950'
                    : currentStep === 1
                    ? 'bg-[#d4ff00] text-[#05070B]'
                    : 'bg-white/10 text-zinc-400'
                }`}
              >
                {paymentSession ? '✓' : '1'}
              </div>
              <div>
                <p className="text-xs font-bold text-white">1. Create Session</p>
                <p className="text-[11px] text-zinc-400 font-mono">POST /api/payment-gateway/payments</p>
              </div>
            </div>
          </div>

          {/* Step 2 Pill */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              currentStep === 2
                ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/10'
                : pollingStatus === 'completed'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-white/[0.02] border-white/10 opacity-70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                  pollingStatus === 'completed'
                    ? 'bg-emerald-500 text-zinc-950'
                    : currentStep === 2
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-zinc-400'
                }`}
              >
                {pollingStatus === 'completed' ? '✓' : '2'}
              </div>
              <div>
                <p className="text-xs font-bold text-white">2. Customer Checkout</p>
                <p className="text-[11px] text-zinc-400 font-mono">Hosted Clearance Page</p>
              </div>
            </div>
          </div>

          {/* Step 3 Pill */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              pollingStatus === 'completed'
                ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10'
                : currentStep === 3 || pollingStatus === 'pending'
                ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                : 'bg-white/[0.02] border-white/10 opacity-70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                  pollingStatus === 'completed'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-white/10 text-zinc-400'
                }`}
              >
                {pollingStatus === 'completed' ? '✓' : '3'}
              </div>
              <div>
                <p className="text-xs font-bold text-white">3. Webhook Dispatch</p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {pollingStatus === 'completed'
                    ? 'payment.completed'
                    : pollingStatus === 'pending'
                    ? 'Awaiting clearance...'
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
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
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
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#d4ff00] bg-[#d4ff00]/10 shadow-md shadow-[#d4ff00]/10'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-white/[0.05]">{preset.icon}</span>
                        <div>
                          <p className="font-bold text-xs text-white">{preset.name}</p>
                          <p className="text-[11px] text-zinc-400">{preset.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold font-mono text-[#d4ff00]">
                          {preset.amount} {preset.currency}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Intent Fields */}
              <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
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
                      className="w-full px-3 py-2 bg-[#05070B] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-[#d4ff00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-[#05070B] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-[#d4ff00]"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CHF">CHF (₣)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#05070B] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#d4ff00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#05070B] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#d4ff00]"
                  />
                </div>
              </div>

              {/* Action Trigger */}
              <div className="mt-5">
                <button
                  onClick={handleCreatePayment}
                  disabled={isCreating}
                  className="w-full py-3 px-4 bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] font-extrabold text-xs rounded-xl shadow-lg shadow-[#d4ff00]/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#05070B] border-t-transparent rounded-full animate-spin"></div>
                      <span>Initializing Session...</span>
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
                <div className="mt-3 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400">
                  ❌ {error}
                </div>
              )}
            </div>

            {/* Test Card Cheat Sheet Card */}
            <div className="p-6 rounded-3xl bg-white/[0.03] text-white border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4ff00] flex items-center gap-1.5">
                  <span>💳 Sandbox Test Card</span>
                </h3>
                <span className="text-[10px] bg-[#d4ff00]/20 text-[#d4ff00] px-2 py-0.5 rounded-full border border-[#d4ff00]/30 font-bold">
                  Pre-funded ($1,000)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                Use this active test card on the hosted checkout page to complete the transaction:
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#05070B] border border-white/10">
                  <span className="text-zinc-500 text-[11px]">Card Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold tracking-wider">7003 2114 8051 1885</span>
                    <button
                      onClick={() => copyToClipboard('7003211480511885', 'cardNum')}
                      className="text-[10px] text-[#d4ff00] hover:underline cursor-pointer"
                    >
                      {copiedText === 'cardNum' ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#05070B] border border-white/10">
                    <span className="text-zinc-500 text-[11px]">Exp:</span>
                    <span className="text-white font-bold">07/31</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#05070B] border border-white/10">
                    <span className="text-zinc-500 text-[11px]">CVV:</span>
                    <span className="text-white font-bold">481</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Execution & Response Inspector (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 2: Payment Session Result & Redirection */}
            <div className={`p-6 rounded-3xl bg-white/[0.03] border transition-all backdrop-blur-xl ${currentStep >= 2 ? 'border-blue-500/40 shadow-xl' : 'border-white/10 opacity-75'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500 text-white font-extrabold flex items-center justify-center text-xs">2</div>
                  <h2 className="font-bold text-sm text-white">Customer Hosted Checkout Clearance</h2>
                </div>
                {paymentSession && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    201 Created
                  </span>
                )}
              </div>

              {paymentSession ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#05070B] border border-white/10">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Hosted Payment URL:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={paymentSession.paymentUrl}
                        className="flex-1 bg-transparent border-0 font-mono text-xs text-blue-400 select-all focus:outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(paymentSession.paymentUrl, 'payUrl')}
                        className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
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
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>👉 Open Hosted Payment Checkout</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-2xl text-zinc-500">
                  <p className="text-xs">Click «Create Payment Session» in Step 1 to generate a live customer checkout session.</p>
                </div>
              )}
            </div>

            {/* Step 3: Webhook & Status Monitor */}
            <div className={`p-6 rounded-3xl bg-white/[0.03] border transition-all backdrop-blur-xl ${pollingStatus === 'completed' ? 'border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center text-xs ${pollingStatus === 'completed' ? 'bg-emerald-500 text-zinc-950' : 'bg-emerald-500/20 text-emerald-400'}`}>3</div>
                  <h2 className="font-bold text-sm text-white">Webhook &amp; Live Settlement Confirmation</h2>
                </div>
                <div className="flex items-center gap-2">
                  {pollingStatus === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      Listening for payment...
                    </span>
                  )}
                  {pollingStatus === 'completed' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span>✅</span> payment.completed
                    </span>
                  )}
                </div>
              </div>

              {pollingStatus === 'completed' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-xl font-bold">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">
                          Payment Successfully Settled!
                        </h4>
                        <p className="text-xs text-emerald-400">
                          Merchant balance credited with {completedPayment?.amount} {completedPayment?.currency}. Webhook event fired.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#05070B] text-zinc-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-white/10">
                    <p className="text-[#d4ff00] font-bold mb-2">// Webhook Event Payload Dispatched to Merchant Server</p>
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
                <div className="bg-[#05070B] text-zinc-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-white/10">
                  <p className="text-zinc-500 mb-2">// Webhook Dispatcher Listener</p>
                  <p className="text-xs text-zinc-400">
                    {paymentSession
                      ? `Awaiting clearance confirmation for Session ID: ${paymentSession.paymentId}... Pay using the test card on the opened checkout page.`
                      : 'Webhook event will trigger automatically once customer enters card credentials and confirms payment.'}
                  </p>
                </div>
              )}
            </div>

            {/* Developer cURL Tab */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <span>💻 Terminal cURL Command</span>
                </h3>
                <button
                  onClick={() => copyToClipboard(curlCommand, 'curl')}
                  className="text-xs text-[#d4ff00] hover:underline cursor-pointer"
                >
                  {copiedText === 'curl' ? '✓ Copied' : 'Copy cURL'}
                </button>
              </div>
              <div className="bg-[#05070B] p-4 rounded-2xl font-mono text-xs text-emerald-400 overflow-x-auto border border-white/10">
                <pre>{curlCommand}</pre>
              </div>
            </div>

            {/* Drop-in HTML Integration Card */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4ff00] flex items-center gap-1.5">
                    <span>🌐 Ready-to-Use Drop-in HTML Code</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Paste this snippet directly into any HTML page to embed this exact test transaction.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadHtmlDemo}
                    className="px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono font-bold text-white transition-all cursor-pointer"
                  >
                    💾 Download HTML
                  </button>
                  <button
                    onClick={() => copyToClipboard(dropInHtmlSnippet, 'html')}
                    className="px-3 py-1 rounded-lg bg-[#d4ff00] hover:bg-[#bce600] text-xs font-mono font-extrabold text-[#05070B] transition-all cursor-pointer"
                  >
                    {copiedText === 'html' ? '✓ Copied' : '📋 Copy HTML'}
                  </button>
                </div>
              </div>
              <div className="bg-[#05070B] p-4 rounded-2xl font-mono text-xs text-zinc-300 overflow-x-auto border border-white/10">
                <pre>{dropInHtmlSnippet}</pre>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
