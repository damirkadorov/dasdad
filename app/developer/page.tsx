'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CodeIcon } from '@/components/icons/Icons';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  domain?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastUsed?: string;
}

export default function DeveloperPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');

  // Ready HTML Integration States
  const [activeHtmlTab, setActiveHtmlTab] = useState<'sdk' | 'standalone' | 'iframe' | 'react'>('sdk');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [testTesting, setTestTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const activeApiKey = apiKeys.find(k => k.status === 'active')?.key || 'pk_f5b9c5381e00084a9e00ee970c6ef79c39c506ee1fc5e6785f8e63e707db46cf';

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleDownloadDemoHtml = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lingoung-bank.vercel.app';
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lingoung Bank Payment Checkout Demo</title>
  <!-- Lingoung Bank Drop-in SDK -->
  <script src="${origin}/lingoung-pay.js"></script>
  <style>
    body {
      background: #05070B;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #090d16;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 32px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(212, 255, 0, 0.1);
      color: #d4ff00;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .price {
      font-size: 40px;
      font-weight: 900;
      margin: 12px 0 24px;
      color: #fff;
    }
    .btn {
      background: #d4ff00;
      color: #05070B;
      font-weight: 800;
      font-size: 15px;
      padding: 16px 28px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      width: 100%;
      transition: all 0.2s;
    }
    .btn:hover {
      background: #bce600;
      transform: translateY(-1px);
      box-shadow: 0 10px 25px rgba(212,255,0,0.3);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Official Storefront Checkout</div>
    <h2 style="margin:0 0 8px;">Order #4092</h2>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 16px;">Cyberpunk High-Top Sneakers</p>
    <div class="price">$100.00 <span style="font-size:16px;color:#94a3b8;font-weight:400;">USD</span></div>
    
    <!-- Lingoung Drop-in Checkout Button -->
    <button 
      class="btn"
      data-lingoung-pay
      data-key="${activeApiKey}"
      data-amount="100.00"
      data-currency="USD"
      data-description="Order #4092 - Cyberpunk Sneakers">
      ⚡ Pay with Lingoung Bank
    </button>
  </div>

  <script>
    document.querySelector('[data-lingoung-pay]').addEventListener('lingoung:success', function(e) {
      alert('Payment successful! Transaction ID: ' + e.detail.paymentId);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lingoung-checkout-demo.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTestDropInWidget = () => {
    if (typeof window === 'undefined') return;
    setTestTesting(true);
    setTestResult(null);

    const runCheckout = () => {
      if ((window as any).LingoungPay) {
        (window as any).LingoungPay.checkout({
          apiKey: activeApiKey,
          amount: 100,
          currency: 'USD',
          description: 'Developer Sandbox Test Order #4092',
          mode: 'modal',
          onSuccess: (data: any) => {
            setTestResult(`Payment Completed! Payment ID: ${data.paymentId || 'completed'}`);
            setTestTesting(false);
          },
          onCancel: () => {
            setTestResult('Modal was closed without payment.');
            setTestTesting(false);
          },
          onError: (err: any) => {
            setTestResult('Error: ' + err.message);
            setTestTesting(false);
          }
        });
      }
    };

    if (!(window as any).LingoungPay) {
      const script = document.createElement('script');
      script.src = '/lingoung-pay.js';
      script.onload = () => runCheckout();
      document.body.appendChild(script);
    } else {
      runCheckout();
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/payment-gateway/keys');
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      setApiKeys(data.apiKeys || []);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/payment-gateway/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, domain }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create API key');
      }

      setApiKeys([...apiKeys, data.apiKey]);
      setShowForm(false);
      setName('');
      setDomain('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const toggleApiKeyStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const response = await fetch('/api/payment-gateway/keys', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update API key');
      }

      setApiKeys(apiKeys.map(k => k.id === id ? { ...k, status: newStatus } : k));
    } catch (err) {
      console.error('Failed to update API key:', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05070B] text-zinc-100 bg-cyber-grid">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl animate-fadeIn">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-xs font-bold text-[#d4ff00] mb-3">
              <CodeIcon size={14} />
              <span>DEVELOPER PORTAL &bull; API ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Payment Gateway API
            </h1>
            <p className="text-zinc-400 mt-1 max-w-2xl text-sm sm:text-base">
              Integrate the Lingoung Bank payment infrastructure directly into your online store or custom applications.
            </p>
          </div>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="self-start sm:self-auto bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] font-extrabold shadow-lg shadow-[#d4ff00]/20"
          >
            {showForm ? '✕ Close Form' : '+ Generate API Key'}
          </Button>
        </div>

        {/* Create API Key Form Modal / Drawer */}
        {showForm && (
          <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl animate-slideDown">
            <h2 className="text-xl font-extrabold text-white mb-2">Generate New API Key</h2>
            <p className="text-xs text-zinc-400 mb-6">
              Keys authenticate your server-side requests to the Lingoung Bank payment gateway.
            </p>
            
            <form onSubmit={handleCreateApiKey} className="space-y-4 max-w-xl">
              <Input
                label="Application Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Production Store"
                required
              />

              <Input
                label="Allowed Domain (optional)"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. store.example.com"
              />

              {error && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" isLoading={creating} className="bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] font-extrabold">
                  Create API Key
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* API Keys List */}
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Active Merchant Credentials</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Keep your keys confidential. Never expose private keys in client-side code.</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[#d4ff00]">
              {apiKeys.length} {apiKeys.length === 1 ? 'Key' : 'Keys'}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d4ff00] mx-auto"></div>
              <p className="mt-3 text-xs text-zinc-400">Loading API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
              <div className="text-4xl mb-3">🔑</div>
              <h3 className="text-base font-bold text-white mb-1">No API keys created yet</h3>
              <p className="text-xs text-zinc-400 mb-4 max-w-sm mx-auto">
                Generate your first key to start accepting automated transactions via our REST API.
              </p>
              <Button size="sm" onClick={() => setShowForm(true)} className="bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] font-extrabold">
                Create Your First Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="p-5 rounded-2xl border border-white/10 bg-[#05070B] hover:border-[#d4ff00]/40 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{apiKey.name}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            apiKey.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {apiKey.status}
                        </span>
                      </div>
                      {apiKey.domain && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Bound to domain: <span className="font-mono text-zinc-300">{apiKey.domain}</span>
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant={apiKey.status === 'active' ? 'danger' : 'secondary'}
                      onClick={() => toggleApiKeyStatus(apiKey.id, apiKey.status)}
                    >
                      {apiKey.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/10 mb-3">
                    <code className="text-xs font-mono text-[#d4ff00] flex-1 truncate select-all">
                      {apiKey.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      className="px-3 py-1 bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {copiedKeyId === apiKey.id ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-zinc-500 font-mono">
                    <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                    {apiKey.lastUsed && (
                      <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documentation Section */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">⚡</span>
              <div>
                <h2 className="text-xl font-extrabold text-white">API Quickstart Guide</h2>
                <p className="text-xs text-zinc-400">Follow these 3 simple steps to accept payments in under 5 minutes.</p>
              </div>
            </div>
            <Link
              href="/developer/tester"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] text-xs font-extrabold rounded-xl shadow-lg shadow-[#d4ff00]/20 transition-all active:scale-[0.98]"
            >
              <span>🧪 Launch Live API Sandbox</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#05070B] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#d4ff00] text-[#05070B] font-extrabold flex items-center justify-center text-sm mb-3">1</div>
                <h3 className="font-bold text-white text-sm mb-2">Create Payment Session</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Make a server-to-server POST request with your API Key to initialize the payment intent.
                </p>
              </div>
              <div className="bg-black/60 border border-white/10 text-zinc-300 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
                <p className="text-[#d4ff00] font-bold mb-1">POST /api/payment-gateway/payments</p>
                <p>{`{ "amount": 100, "currency": "USD", "description": "Order #4092" }`}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#05070B] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white font-extrabold flex items-center justify-center text-sm mb-3">2</div>
                <h3 className="font-bold text-white text-sm mb-2">Redirect Customer</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Send the customer to the secure hosted <code className="bg-white/10 px-1 py-0.5 rounded text-[#d4ff00]">paymentUrl</code> returned in the response payload.
                </p>
              </div>
              <div className="bg-black/60 border border-white/10 text-zinc-300 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
                <p className="text-emerald-400 font-bold mb-1">Response 201 Created</p>
                <p>{`{ "paymentUrl": "https://.../checkout/...", "status": "pending" }`}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#05070B] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-extrabold flex items-center justify-center text-sm mb-3">3</div>
                <h3 className="font-bold text-white text-sm mb-2">Receive Webhooks</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  When the user taps or enters their card, Lingoung Bank securely posts the confirmation event to your webhook.
                </p>
              </div>
              <div className="bg-black/60 border border-white/10 text-zinc-300 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
                <p className="text-amber-400 font-bold mb-1">Webhook Event</p>
                <p>{`{ "event": "payment.completed", "amount": 100 }`}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ready-to-Use HTML Integration Section */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4ff00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-xs font-bold text-[#d4ff00] mb-2">
                <span>⚡</span>
                <span>Zero-Config Drop-in Integration</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Ready-to-Use HTML Integration</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Copy and paste this ready-to-run snippet into any website, static HTML, WordPress, Shopify, or Webflow page to start accepting instant payments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadDemoHtml}
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                title="Download self-contained ready-to-run HTML demo file"
              >
                <span>💾</span>
                <span>Download checkout.html</span>
              </button>

              <button
                onClick={handleTestDropInWidget}
                disabled={testTesting}
                className="px-4 py-2.5 rounded-xl bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] text-xs font-extrabold shadow-lg shadow-[#d4ff00]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <span>{testTesting ? '⏳' : '⚡'}</span>
                <span>{testTesting ? 'Launching...' : 'Test Drop-in Widget Live'}</span>
              </button>
            </div>
          </div>

          {testResult && (
            <div className="mb-6 p-4 rounded-2xl bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-xs text-[#d4ff00] flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span className="font-semibold">{testResult}</span>
              </div>
              <button onClick={() => setTestResult(null)} className="text-zinc-400 hover:text-white text-sm">✕</button>
            </div>
          )}

          {/* Integration Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-5 overflow-x-auto relative z-10">
            <button
              onClick={() => setActiveHtmlTab('sdk')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeHtmlTab === 'sdk'
                  ? 'bg-[#d4ff00] text-black shadow-md shadow-[#d4ff00]/20'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              ⚡ Drop-in SDK (1 Line + Button)
            </button>
            <button
              onClick={() => setActiveHtmlTab('standalone')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeHtmlTab === 'standalone'
                  ? 'bg-[#d4ff00] text-black shadow-md shadow-[#d4ff00]/20'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              📦 Standalone HTML & JS (Zero Dependencies)
            </button>
            <button
              onClick={() => setActiveHtmlTab('iframe')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeHtmlTab === 'iframe'
                  ? 'bg-[#d4ff00] text-black shadow-md shadow-[#d4ff00]/20'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              🖼️ Embedded iFrame Widget
            </button>
            <button
              onClick={() => setActiveHtmlTab('react')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeHtmlTab === 'react'
                  ? 'bg-[#d4ff00] text-black shadow-md shadow-[#d4ff00]/20'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              ⚛️ React / Next.js Component
            </button>
          </div>

          {/* Tab 1: SDK Drop-in */}
          {activeHtmlTab === 'sdk' && (
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400 font-mono">index.html (Drop-in Modal)</span>
                <button
                  onClick={() => handleCopySnippet(`<!-- 1. Include Lingoung Pay SDK -->
<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://lingoung-bank.vercel.app'}/lingoung-pay.js"></script>

<!-- 2. Drop-in Checkout Button -->
<button 
  data-lingoung-pay
  data-key="${activeApiKey}"
  data-amount="100.00"
  data-currency="USD"
  data-description="Order #4092 - Cyberpunk Sneakers"
  style="background:#d4ff00;color:#05070B;font-weight:800;padding:14px 28px;border-radius:12px;border:none;cursor:pointer;font-family:sans-serif;box-shadow:0 10px 20px rgba(212,255,0,0.25);">
  ⚡ Pay $100.00 with Lingoung Bank
</button>

<script>
  // Listen for payment completion
  document.querySelector('[data-lingoung-pay]').addEventListener('lingoung:success', function(e) {
    alert('Payment successful! Transaction ID: ' + e.detail.paymentId);
  });
</script>`)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono font-bold text-white transition-all cursor-pointer"
                >
                  {copiedSnippet ? '✓ Copied' : '📋 Copy Code'}
                </button>
              </div>

              <div className="bg-[#05070B] border border-white/10 p-4 rounded-2xl text-[12px] font-mono text-zinc-300 overflow-x-auto leading-relaxed shadow-inner">
                <p className="text-zinc-500">{`<!-- 1. Include Lingoung Pay SDK in your <head> or before </body> -->`}</p>
                <p className="text-blue-400">&lt;<span className="text-rose-400">script</span> <span className="text-amber-300">src</span>=<span className="text-emerald-300">&quot;{typeof window !== 'undefined' ? window.location.origin : 'https://lingoung-bank.vercel.app'}/lingoung-pay.js&quot;</span>&gt;&lt;/<span className="text-rose-400">script</span>&gt;</p>
                <br />
                <p className="text-zinc-500">{`<!-- 2. Drop-in Checkout Button (pre-configured with your active API key) -->`}</p>
                <p className="text-blue-400">&lt;<span className="text-rose-400">button</span></p>
                <p className="text-amber-300 pl-4">data-lingoung-pay</p>
                <p className="text-amber-300 pl-4">data-key=<span className="text-emerald-300">&quot;{activeApiKey}&quot;</span></p>
                <p className="text-amber-300 pl-4">data-amount=<span className="text-emerald-300">&quot;100.00&quot;</span></p>
                <p className="text-amber-300 pl-4">data-currency=<span className="text-emerald-300">&quot;USD&quot;</span></p>
                <p className="text-amber-300 pl-4">data-description=<span className="text-emerald-300">&quot;Order #4092 - Cyberpunk Sneakers&quot;</span></p>
                <p className="text-amber-300 pl-4">style=<span className="text-emerald-300">&quot;background:#d4ff00;color:#05070B;font-weight:800;padding:14px 28px;border-radius:12px;border:none;cursor:pointer;&quot;</span>&gt;</p>
                <p className="pl-4 text-white">⚡ Pay $100.00 with Lingoung Bank</p>
                <p className="text-blue-400">&lt;/<span className="text-rose-400">button</span>&gt;</p>
                <br />
                <p className="text-zinc-500">{`<!-- 3. Optional event listener -->`}</p>
                <p className="text-blue-400">&lt;<span className="text-rose-400">script</span>&gt;</p>
                <p className="pl-4 text-zinc-300">document.querySelector(<span className="text-emerald-300">&apos;[data-lingoung-pay]&apos;</span>).addEventListener(<span className="text-emerald-300">&apos;lingoung:success&apos;</span>, <span className="text-blue-400">function</span>(e) &#123;</p>
                <p className="pl-8 text-zinc-300">alert(<span className="text-emerald-300">&apos;Payment successful! Transaction ID: &apos;</span> + e.detail.paymentId);</p>
                <p className="pl-4 text-zinc-300">&#125;);</p>
                <p className="text-blue-400">&lt;/<span className="text-rose-400">script</span>&gt;</p>
              </div>
            </div>
          )}

          {/* Tab 2: Standalone Pure HTML/JS */}
          {activeHtmlTab === 'standalone' && (
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400 font-mono">checkout.html (Zero external dependencies)</span>
                <button
                  onClick={() => handleCopySnippet(`<button id="lingoung-checkout-btn" style="background:#d4ff00;color:#05070B;font-weight:800;padding:14px 28px;border-radius:12px;border:none;cursor:pointer;font-family:sans-serif;box-shadow:0 10px 20px rgba(212,255,0,0.25);">
  ⚡ Pay $100.00 with Lingoung
</button>

<script>
  document.getElementById('lingoung-checkout-btn').addEventListener('click', async function() {
    const btn = this;
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Creating Payment...';

    try {
      const response = await fetch('${typeof window !== 'undefined' ? window.location.origin : 'https://lingoung-bank.vercel.app'}/api/payment-gateway/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '${activeApiKey}'
        },
        body: JSON.stringify({
          amount: 100.00,
          currency: 'USD',
          description: 'Order #4092'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment failed');
      
      // Redirect customer to secure Lingoung Bank checkout
      window.location.href = data.paymentUrl;
    } catch (err) {
      alert('Payment initialization error: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerText = originalText;
    }
  });
</script>`)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono font-bold text-white transition-all cursor-pointer"
                >
                  {copiedSnippet ? '✓ Copied' : '📋 Copy Code'}
                </button>
              </div>

              <div className="bg-[#05070B] border border-white/10 p-4 rounded-2xl text-[12px] font-mono text-zinc-300 overflow-x-auto leading-relaxed shadow-inner">
                <p className="text-zinc-500">{`<!-- Fully self-contained drop-in button and handler -->`}</p>
                <p className="text-blue-400">&lt;<span className="text-rose-400">button</span> <span className="text-amber-300">id</span>=<span className="text-emerald-300">&quot;lingoung-checkout-btn&quot;</span> <span className="text-amber-300">style</span>=<span className="text-emerald-300">&quot;background:#d4ff00;color:#05070B;font-weight:800;padding:14px 28px;border-radius:12px;border:none;cursor:pointer;&quot;</span>&gt;</p>
                <p className="pl-4 text-white">⚡ Pay $100.00 with Lingoung</p>
                <p className="text-blue-400">&lt;/<span className="text-rose-400">button</span>&gt;</p>
                <br />
                <p className="text-blue-400">&lt;<span className="text-rose-400">script</span>&gt;</p>
                <p className="pl-4 text-zinc-300">document.getElementById(<span className="text-emerald-300">&apos;lingoung-checkout-btn&apos;</span>).addEventListener(<span className="text-emerald-300">&apos;click&apos;</span>, <span className="text-blue-400">async function</span>() &#123;</p>
                <p className="pl-8 text-zinc-300"><span className="text-blue-400">const</span> res = <span className="text-blue-400">await</span> fetch(<span className="text-emerald-300">&apos;{typeof window !== 'undefined' ? window.location.origin : 'https://lingoung-bank.vercel.app'}/api/payment-gateway/payments&apos;</span>, &#123;</p>
                <p className="pl-12 text-zinc-300">method: <span className="text-emerald-300">&apos;POST&apos;</span>,</p>
                <p className="pl-12 text-zinc-300">headers: &#123; <span className="text-emerald-300">&apos;Content-Type&apos;</span>: <span className="text-emerald-300">&apos;application/json&apos;</span>, <span className="text-emerald-300">&apos;X-API-Key&apos;</span>: <span className="text-emerald-300">&apos;{activeApiKey}&apos;</span> &#125;,</p>
                <p className="pl-12 text-zinc-300">body: JSON.stringify(&#123; amount: 100, currency: <span className="text-emerald-300">&apos;USD&apos;</span>, description: <span className="text-emerald-300">&apos;Order #4092&apos;</span> &#125;)</p>
                <p className="pl-8 text-zinc-300">&#125;);</p>
                <p className="pl-8 text-zinc-300"><span className="text-blue-400">const</span> data = <span className="text-blue-400">await</span> res.json();</p>
                <p className="pl-8 text-emerald-400">window.location.href = data.paymentUrl;</p>
                <p className="pl-4 text-zinc-300">&#125;);</p>
                <p className="text-blue-400">&lt;/<span className="text-rose-400">script</span>&gt;</p>
              </div>
            </div>
          )}

          {/* Tab 3: iFrame Widget */}
          {activeHtmlTab === 'iframe' && (
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400 font-mono">Storefront iFrame Container</span>
                <button
                  onClick={() => handleCopySnippet(`<div style="width:100%;max-width:480px;height:650px;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.15);box-shadow:0 20px 50px rgba(0,0,0,0.6);margin:0 auto;">
  <iframe 
    src="${typeof window !== 'undefined' ? window.location.origin : 'https://lingoung-bank.vercel.app'}/payment/YOUR_PAYMENT_ID?embedded=true" 
    width="100%" 
    height="100%" 
    frameborder="0" 
    allow="payment">
  </iframe>
</div>`)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono font-bold text-white transition-all cursor-pointer"
                >
                  {copiedSnippet ? '✓ Copied' : '📋 Copy Code'}
                </button>
              </div>

              <div className="bg-[#05070B] border border-white/10 p-4 rounded-2xl text-[12px] font-mono text-zinc-300 overflow-x-auto leading-relaxed shadow-inner">
                <p className="text-zinc-500">{`<!-- Embed Lingoung Bank checkout directly inside your checkout page -->`}</p>
                <p className="text-blue-400">&lt;<span className="text-rose-400">div</span> <span className="text-amber-300">style</span>=<span className="text-emerald-300">&quot;max-width:480px;height:650px;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.15);&quot;</span>&gt;</p>
                <p className="pl-4 text-blue-400">&lt;<span className="text-rose-400">iframe</span></p>
                <p className="pl-8 text-amber-300">src=<span className="text-emerald-300">&quot;{typeof window !== 'undefined' ? window.location.origin : 'https://lingoung-bank.vercel.app'}/payment/PAYMENT_ID?embedded=true&quot;</span></p>
                <p className="pl-8 text-amber-300">width=<span className="text-emerald-300">&quot;100%&quot;</span> height=<span className="text-emerald-300">&quot;100%&quot;</span> frameborder=<span className="text-emerald-300">&quot;0&quot;</span> allow=<span className="text-emerald-300">&quot;payment&quot;</span>&gt;</p>
                <p className="pl-4 text-blue-400">&lt;/<span className="text-rose-400">iframe</span>&gt;</p>
                <p className="text-blue-400">&lt;/<span className="text-rose-400">div</span>&gt;</p>
              </div>
            </div>
          )}

          {/* Tab 4: React / Next.js */}
          {activeHtmlTab === 'react' && (
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400 font-mono">LingoungPayButton.tsx</span>
                <button
                  onClick={() => handleCopySnippet(`import { useState } from 'react';

export function LingoungPayButton({ amount = 100, currency = 'USD', description = 'Order #4092' }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('${typeof window !== 'undefined' ? window.location.origin : 'https://lingoung-bank.vercel.app'}/api/payment-gateway/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '${activeApiKey}',
        },
        body: JSON.stringify({ amount, currency, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="px-6 py-3.5 bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] font-extrabold text-sm rounded-xl shadow-lg transition-all"
    >
      {loading ? 'Processing...' : \`Pay \${amount} \${currency} with Lingoung\`}
    </button>
  );
}`)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono font-bold text-white transition-all cursor-pointer"
                >
                  {copiedSnippet ? '✓ Copied' : '📋 Copy Code'}
                </button>
              </div>

              <div className="bg-[#05070B] border border-white/10 p-4 rounded-2xl text-[12px] font-mono text-zinc-300 overflow-x-auto leading-relaxed shadow-inner">
                <p className="text-zinc-500">{`// Ready React / Next.js button component`}</p>
                <p className="text-blue-400">import <span className="text-white">&#123; useState &#125;</span> from <span className="text-emerald-300">&apos;react&apos;</span>;</p>
                <br />
                <p className="text-blue-400">export function <span className="text-amber-300">LingoungPayButton</span>() &#123;</p>
                <p className="pl-4 text-blue-400">const <span className="text-white">[loading, setLoading] = useState(false);</span></p>
                <br />
                <p className="pl-4 text-blue-400">const <span className="text-amber-300">handleCheckout</span> = async () =&gt; &#123;</p>
                <p className="pl-8 text-zinc-300">setLoading(true);</p>
                <p className="pl-8 text-blue-400">const <span className="text-zinc-300">res = await fetch(</span><span className="text-emerald-300">&apos;{typeof window !== 'undefined' ? window.location.origin : 'https://lingoung-bank.vercel.app'}/api/payment-gateway/payments&apos;</span>, &#123;</p>
                <p className="pl-12 text-zinc-300">method: <span className="text-emerald-300">&apos;POST&apos;</span>,</p>
                <p className="pl-12 text-zinc-300">headers: &#123; <span className="text-emerald-300">&apos;Content-Type&apos;</span>: <span className="text-emerald-300">&apos;application/json&apos;</span>, <span className="text-emerald-300">&apos;X-API-Key&apos;</span>: <span className="text-emerald-300">&apos;{activeApiKey}&apos;</span> &#125;,</p>
                <p className="pl-12 text-zinc-300">body: JSON.stringify(&#123; amount: 100, currency: <span className="text-emerald-300">&apos;USD&apos;</span>, description: <span className="text-emerald-300">&apos;Order #4092&apos;</span> &#125;)</p>
                <p className="pl-8 text-zinc-300">&#125;);</p>
                <p className="pl-8 text-blue-400">const <span className="text-zinc-300">data = await res.json();</span></p>
                <p className="pl-8 text-emerald-400">window.location.href = data.paymentUrl;</p>
                <p className="pl-4 text-zinc-300">&#125;;</p>
                <br />
                <p className="pl-4 text-blue-400">return (</p>
                <p className="pl-8 text-blue-400">&lt;<span className="text-rose-400">button</span> <span className="text-amber-300">onClick</span>=&#123;handleCheckout&#125; <span className="text-amber-300">className</span>=<span className="text-emerald-300">&quot;px-6 py-3 bg-[#d4ff00] text-black font-extrabold rounded-xl&quot;</span>&gt;</p>
                <p className="pl-12 text-white">&#123;loading ? &apos;Processing...&apos; : &apos;Pay with Lingoung&apos;&#125;</p>
                <p className="pl-8 text-blue-400">&lt;/<span className="text-rose-400">button</span>&gt;</p>
                <p className="pl-4 text-blue-400">);</p>
                <p className="text-blue-400">&#125;</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
