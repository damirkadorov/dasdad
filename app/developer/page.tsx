'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#06090e]">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl animate-fadeIn">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs font-semibold text-purple-700 dark:text-purple-300 mb-3">
              <CodeIcon size={14} />
              <span>Developer Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Payment Gateway API
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl text-sm sm:text-base">
              Integrate the Lingoung Bank payment infrastructure directly into your online store or custom applications.
            </p>
          </div>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="self-start sm:self-auto"
          >
            {showForm ? '✕ Close Form' : '+ Generate API Key'}
          </Button>
        </div>

        {/* Create API Key Form Modal / Drawer */}
        {showForm && (
          <div className="bezel-card mb-8 animate-slideDown">
            <div className="bezel-card-inner p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Generate New API Key</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
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
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="submit" isLoading={creating}>
                    Create API Key
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* API Keys List */}
        <div className="bezel-card mb-10">
          <div className="bezel-card-inner p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active API Keys</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Keep your keys confidential. Never expose private keys in frontend bundles.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {apiKeys.length} {apiKeys.length === 1 ? 'Key' : 'Keys'}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading API keys...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                <div className="text-4xl mb-3">🔑</div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No API keys created yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                  Generate your first key to start accepting automated transactions via our REST API.
                </p>
                <Button size="sm" onClick={() => setShowForm(true)}>
                  Create Your First Key
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 hover:border-purple-500/40 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-base">{apiKey.name}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              apiKey.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {apiKey.status}
                          </span>
                        </div>
                        {apiKey.domain && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Bound to: <span className="font-mono">{apiKey.domain}</span>
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

                    <div className="flex items-center gap-2 bg-white dark:bg-gray-950 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 mb-3">
                      <code className="text-xs font-mono text-purple-600 dark:text-purple-400 flex-1 truncate select-all">
                        {apiKey.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {copiedKeyId === apiKey.id ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
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
        </div>

        {/* Documentation Section */}
        <div className="bezel-card mb-12">
          <div className="bezel-card-inner p-6 sm:p-8">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-2xl">⚡</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Quickstart Guide</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Follow these 3 simple steps to accept payments in under 5 minutes.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-sm mb-3">1</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Create Payment Session</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Make a server-to-server POST request with your API Key to initialize the payment intent.
                  </p>
                </div>
                <div className="bg-gray-900 text-gray-300 p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
                  <p className="text-purple-400 font-bold mb-1">POST /api/payment-gateway/payments</p>
                  <p>{`{ "amount": 100, "currency": "USD", "description": "Order #4092" }`}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm mb-3">2</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Redirect Customer</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Send the customer to the secure hosted <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-purple-600">paymentUrl</code> returned in the response payload.
                  </p>
                </div>
                <div className="bg-gray-900 text-gray-300 p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
                  <p className="text-emerald-400 font-bold mb-1">Response 201 Created</p>
                  <p>{`{ "paymentUrl": "https://.../checkout/...", "status": "pending" }`}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-3">3</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Receive Webhooks</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    When the user taps or enters their card, Lingoung Bank securely posts the confirmation event to your webhook.
                  </p>
                </div>
                <div className="bg-gray-900 text-gray-300 p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
                  <p className="text-amber-400 font-bold mb-1">Webhook Event</p>
                  <p>{`{ "event": "payment.completed", "amount": 100 }`}</p>
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
