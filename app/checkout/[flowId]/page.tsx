'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface FlowDetails {
  flowId: string;
  amount: number;
  currency: string;
  memo: string;
  state: string;
  customerEmail?: string;
  customerName?: string;
  onComplete?: string;
  onCancel?: string;
  expiresAt?: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const flowId = params.flowId as string;

  const [flow, setFlow] = useState<FlowDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Card form fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [cardholderEmail, setCardholderEmail] = useState('');

  useEffect(() => {
    loadFlow();
  }, [flowId]);

  const loadFlow = async () => {
    try {
      const response = await fetch(`/api/novapay/authorize?flowId=${flowId}`);
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to load payment');
      }

      setFlow(data.flow);
      setCardholderEmail(data.flow.customerEmail || '');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = [];
    for (let i = 0; i < cleaned.length && i < 16; i += 4) {
      chunks.push(cleaned.slice(i, i + 4));
    }
    return chunks.join(' ');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    // Validate card starts with 7
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (!cleanCard.startsWith('7')) {
      setError('Only NovaPay cards (starting with 7) are accepted');
      setProcessing(false);
      return;
    }

    if (cleanCard.length !== 16) {
      setError('Card number must be 16 digits');
      setProcessing(false);
      return;
    }

    try {
      const response = await fetch('/api/novapay/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowId,
          cardNumber: cleanCard,
          expiryMonth,
          expiryYear,
          securityCode,
          cardholderEmail,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      // Redirect to success page or merchant's onComplete URL
      if (data.onComplete) {
        window.location.href = data.onComplete;
      } else {
        router.push(`/checkout/${flowId}/success`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    if (flow?.onCancel) {
      window.location.href = flow.onCancel;
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !flow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Checkout Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} variant="primary">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (flow?.state !== 'CREATED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Checkout Not Available</h2>
            <p className="text-gray-600 mb-6">
              This payment flow is no longer available. Status: {flow?.state}
            </p>
            <Button onClick={handleCancel} variant="primary">
              Return
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-white">N</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">NovaPay Checkout</h1>
          <p className="text-gray-500 text-sm">Secure payment processing</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Amount</span>
            <span className="text-3xl font-bold text-gray-800">
              {flow?.currency} {flow?.amount?.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-gray-200 my-3"></div>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{flow?.memo}</p>
          </div>
        </div>

        {/* Card Form */}
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="7XXX XXXX XXXX XXXX"
                required
                maxLength={19}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg tracking-wider"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-8 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  N
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Only NovaPay cards accepted (starts with 7)</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, '0');
                  return <option key={month} value={month}>{month}</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">YY</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = (new Date().getFullYear() % 100 + i).toString().padStart(2, '0');
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                required
                maxLength={3}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
              />
            </div>
          </div>

          <Input
            label="Email for Receipt"
            type="email"
            value={cardholderEmail}
            onChange={(e) => setCardholderEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={processing}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {processing ? 'Processing...' : `Pay ${flow?.currency} ${flow?.amount?.toFixed(2)}`}
          </Button>

          <button
            type="button"
            onClick={handleCancel}
            className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
          >
            Cancel and return
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>🔒 Protected by NovaPay secure checkout</p>
          <p className="mt-1">Your card details are encrypted end-to-end</p>
        </div>
      </div>
    </div>
  );
}
