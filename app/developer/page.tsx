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

        {/* Info Banner - Where to find API keys */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                <span aria-hidden="true">ℹ️</span> Правильное место для создания API ключей
              </h3>
              <p className="text-sm text-gray-700">
                <strong>Вы находитесь на правильной странице!</strong> Здесь создаются API ключи для интеграции платежной системы на ваш сайт. 
                API ключи <strong className="text-red-600">НЕ создаются</strong> в бизнес-дашборде (<code className="bg-gray-200 px-1 py-0.5 rounded">/business/dashboard</code>) - 
                там только управление банковским счетом.
              </p>
            </div>
          </div>
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
          
          <div className="space-y-6 text-sm">
            {/* Step 1 */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Create a Payment
              </h3>
              <p className="text-gray-600 mb-3">
                Send a POST request to create a new payment. The response will include a <code className="bg-gray-200 px-2 py-1 rounded">paymentUrl</code> where your customer will complete the payment.
              </p>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`POST /api/payment-gateway/payments
Headers:
  X-API-Key: your_api_key_here
  Content-Type: application/json

Request Body:
{
  "amount": 100,              // Required: Payment amount
  "currency": "USD",          // Required: USD, EUR, GBP, CHF, JPY, CAD, AUD
  "description": "Order #123",// Required: Payment description
  "customerEmail": "customer@example.com",  // Optional
  "orderId": "12345",         // Optional: Your order reference
  "successUrl": "https://yoursite.com/success",  // Optional: Redirect after payment
  "webhookUrl": "https://yoursite.com/webhook"   // Optional: Receive notifications
}`}
              </pre>
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800 mb-2">✅ Success Response (201):</p>
                <pre className="text-green-700 text-xs overflow-x-auto">
{`{
  "success": true,
  "paymentId": "abc123-uuid",
  "paymentUrl": "https://yourbank.com/payment/abc123-uuid",
  "status": "pending",
  "amount": 100,
  "currency": "USD"
}`}
                </pre>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Redirect Customer
              </h3>
              <p className="text-gray-600 mb-3">
                Redirect your customer to the <code className="bg-gray-200 px-2 py-1 rounded">paymentUrl</code> returned in the response. They will enter their card details on our secure payment page.
              </p>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`// JavaScript example
if (response.success) {
  // Redirect customer to payment page
  window.location.href = response.paymentUrl;
}`}
              </pre>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                Handle Webhook Notifications
              </h3>
              <p className="text-gray-600 mb-3">
                When a payment is completed, we&apos;ll send a POST request to your <code className="bg-gray-200 px-2 py-1 rounded">webhookUrl</code> with the payment details. Use this to fulfill the order.
              </p>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`// Webhook payload you will receive:
{
  "event": "payment.completed",
  "paymentId": "abc123-uuid",
  "amount": 100,
  "currency": "USD",
  "orderId": "12345",
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// Example webhook handler (Node.js/Express):
app.post('/webhook', (req, res) => {
  const { event, paymentId, orderId, amount } = req.body;
  
  if (event === 'payment.completed') {
    // Fulfill the order
    console.log(\`Payment \${paymentId} completed for order \${orderId}\`);
    processOrder(orderId);
  }
  
  res.status(200).send('OK');
});`}
              </pre>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                Check Payment Status (Optional)
              </h3>
              <p className="text-gray-600 mb-3">
                You can check the status of any payment using the payment ID.
              </p>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`GET /api/payment-gateway/payments?paymentId=abc123-uuid
Headers:
  X-API-Key: your_api_key_here`}
              </pre>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 mb-2">📋 Response:</p>
                <pre className="text-blue-700 text-xs overflow-x-auto">
{`{
  "paymentId": "abc123-uuid",
  "status": "completed",  // pending, processing, completed, failed
  "amount": 100,
  "currency": "USD",
  "description": "Order #123",
  "orderId": "12345",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:01:00.000Z"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* API Reference */}
          <div className="mt-8 pt-6 border-t border-purple-200">
            <h3 className="font-bold text-gray-800 mb-4">📖 API Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">Supported Currencies</h4>
                <div className="flex flex-wrap gap-2">
                  {['🇺🇸 USD', '🇪🇺 EUR', '🇬🇧 GBP', '🇨🇭 CHF', '🇯🇵 JPY', '🇨🇦 CAD', '🇦🇺 AUD'].map(c => (
                    <span key={c} className="px-2 py-1 bg-gray-100 rounded text-xs">{c}</span>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">Transaction Fee</h4>
                <p className="text-gray-600">
                  <span className="text-2xl font-bold text-purple-600">2.5%</span>
                  <span className="text-sm ml-2">per successful transaction</span>
                </p>
              </div>
            </div>
          </div>

          {/* Error Handling */}
          <div className="mt-6 pt-6 border-t border-purple-200">
            <h3 className="font-bold text-gray-800 mb-4">⚠️ Error Handling</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-gray-600 mb-3">All errors return a JSON response with an <code className="bg-gray-200 px-1 py-0.5 rounded">error</code> field:</p>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`// Error Response Example:
{
  "error": "Invalid API key"  // Description of the error
}

// Common HTTP Status Codes:
// 400 - Bad Request (missing/invalid fields)
// 401 - Unauthorized (invalid API key)
// 403 - Forbidden (not authorized for this resource)
// 404 - Not Found (payment not found)
// 500 - Internal Server Error`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
