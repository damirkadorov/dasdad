'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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
    } catch (err: any) {
      setError(err.message);
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

      setApiKeys(apiKeys.map(key => 
        key.id === id ? { ...key, status: newStatus } : key
      ));
    } catch (err) {
      console.error('Failed to toggle API key:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Gateway API</h1>
          <p className="text-gray-600">
            Integrate our payment system into your website or application
          </p>
        </div>

        {/* Create API Key Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="primary"
          >
            + Create New API Key
          </Button>
        </div>

        {/* Create API Key Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New API Key</h2>
            <form onSubmit={handleCreateApiKey} className="space-y-4">
              <Input
                label="API Key Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Website"
                required
              />

              <Input
                label="Domain (optional)"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create API Key'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* API Keys List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your API Keys</h2>
          
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No API keys yet</p>
              <p className="text-sm">Create your first API key to start accepting payments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{apiKey.name}</h3>
                      {apiKey.domain && (
                        <p className="text-sm text-gray-500">Domain: {apiKey.domain}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apiKey.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {apiKey.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-gray-700 font-mono break-all">
                        {apiKey.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="ml-2 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors whitespace-nowrap"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                      <p>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                      {apiKey.lastUsed && (
                        <p>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => toggleApiKeyStatus(apiKey.id, apiKey.status)}
                      variant={apiKey.status === 'active' ? 'danger' : 'primary'}
                      className="text-sm"
                    >
                      {apiKey.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documentation */}
        <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📚 Quick Start Guide</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">1. Create a Payment</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`POST /api/payment-gateway/payments
Headers:
  X-API-Key: your_api_key_here
  Content-Type: application/json

Body:
{
  "amount": 100,
  "currency": "USD",
  "description": "Order #12345",
  "customerEmail": "customer@example.com",
  "orderId": "12345",
  "successUrl": "https://yoursite.com/success",
  "webhookUrl": "https://yoursite.com/webhook"
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">2. Redirect Customer</h3>
              <p className="text-gray-600 mb-2">
                Redirect your customer to the <code className="bg-gray-200 px-2 py-1 rounded">paymentUrl</code> returned in the response.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">3. Handle Webhook</h3>
              <p className="text-gray-600 mb-2">
                Receive payment confirmation via webhook when the payment is completed.
              </p>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`{
  "event": "payment.completed",
  "paymentId": "uuid",
  "amount": 100,
  "currency": "USD",
  "orderId": "12345",
  "timestamp": "2024-01-01T00:00:00.000Z"
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">4. Check Payment Status</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`GET /api/payment-gateway/payments?paymentId=xxx
Headers:
  X-API-Key: your_api_key_here`}
              </pre>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-purple-200">
            <h3 className="font-semibold text-gray-800 mb-2">Supported Currencies</h3>
            <p className="text-gray-600">USD, EUR, GBP, CHF, JPY, CAD, AUD</p>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Transaction Fee</h3>
            <p className="text-gray-600">2.5% per transaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}
