'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  description: string;
  merchantId: string;
  status: string;
  customerEmail?: string;
  customerName?: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Payment form
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      const response = await fetch(`/api/payment-gateway/process/${paymentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load payment');
      }

      setPayment(data.payment);
      setEmail(data.payment.customerEmail || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const response = await fetch(`/api/payment-gateway/process/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          cardNumber,
          expiryDate,
          cvv,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Redirect to success page or merchant's success URL
      if (data.successUrl) {
        window.location.href = data.successUrl;
      } else {
        router.push(`/payment/${paymentId}/success`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} variant="primary">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (payment?.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Not Available</h2>
            <p className="text-gray-600 mb-6">
              This payment has already been {payment?.status}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💳</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Secure Payment</h1>
          <p className="text-gray-600">Complete your payment securely</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Amount</span>
            <span className="text-2xl font-bold text-gray-800">
              {payment?.amount} {payment?.currency}
            </span>
          </div>
          <div className="border-t border-gray-200 my-3"></div>
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">{payment?.description}</p>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePayment} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          <Input
            label="Card Number"
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
            placeholder="1234 5678 9012 3456"
            required
            maxLength={16}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry Date"
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              placeholder="MM/YY"
              required
              maxLength={5}
            />

            <Input
              label="CVV"
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
              required
              maxLength={3}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={processing}
            className="w-full"
          >
            {processing ? 'Processing...' : `Pay ${payment?.amount} ${payment?.currency}`}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>🔒 Your payment is secured with end-to-end encryption</p>
        </div>
      </div>
    </div>
  );
}
