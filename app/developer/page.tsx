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
      </main>

      <Footer />
    </div>
  );
}
