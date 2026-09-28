'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

  // Form Inputs
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('7003211480511885');
  const [expiryDate, setExpiryDate] = useState('07/31');
  const [cvv, setCvv] = useState('481');
  const [showCardNumber, setShowCardNumber] = useState(true);
  const [copied, setCopied] = useState(false);

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
      setEmail(data.payment.customerEmail || 'dkadorov@gmail.com');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate: expiryDate.replace(/\//g, ''),
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

  const copyCardNumber = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDisplayCard = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (!showCardNumber) {
      return `•••• •••• •••• ${clean.slice(-4)}`;
    }
    return clean.replace(/(\d{4})/g, '$1 ').trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5FA] dark:bg-[#07090E] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-gray-500">Preparing secure checkout session...</p>
        </div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="min-h-screen bg-[#F4F5FA] dark:bg-[#07090E] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
            ✕
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Payment Session Expired</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (payment?.status !== 'pending') {
    return (
      <div className="min-h-screen bg-[#F4F5FA] dark:bg-[#07090E] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 text-lg font-bold">
            ✓
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Payment Already Settled</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            This checkout session has already been completed.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5FA] dark:bg-[#07090E] text-gray-900 dark:text-white flex flex-col items-center justify-center px-4 py-10 selection:bg-blue-600 selection:text-white">
      {/* Container modeled directly after Reference Image 2 (Affirm Checkout) */}
      <div className="w-full max-w-[420px] mx-auto flex flex-col items-center">
        {/* Top Header with Close Icon */}
        <div className="w-full flex justify-between items-center mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 cursor-pointer"
            title="Cancel and close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">NovaPay Checkout</span>
          <div className="w-6"></div>
        </div>

        {/* Heading: Ready to check out */}
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Ready to check out{payment?.description ? ` for ${payment.description}` : ''}?
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[320px] mx-auto leading-relaxed">
            Use your NovaPay Card at the register or online. Your balance applies to this transaction.
          </p>
        </div>

        {/* Big Amount & Active Status Badge (Reference: Image 2) */}
        <div className="text-center my-4 space-y-3">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-gray-900 dark:text-white">
            ${payment?.amount.toFixed(2)}
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
              Active for 01:59:48
            </span>
          </div>
          <div>
            <button
              onClick={() => router.push('/')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Cancel transaction
            </button>
          </div>
        </div>

        {/* Royal Cobalt Wave Card (Reference: Image 2 Affirm Card) */}
        <div className="w-full card-affirm-wave p-6 text-white my-4 relative shadow-2xl">
          {/* Card Brand Header */}
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight font-sans">nova</span>
              <span className="text-xs uppercase tracking-widest font-mono text-blue-200 bg-white/10 px-2 py-0.5 rounded">PAY</span>
            </div>
            <span className="font-mono text-xs text-blue-200">Virtual</span>
          </div>

          {/* Card Number with Copy Action */}
          <div className="relative z-10 mb-6">
            <p className="text-[10px] font-mono text-blue-200 uppercase tracking-widest mb-1">CARD NUMBER</p>
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg sm:text-xl font-bold tracking-widest text-white">
                {formatDisplayCard(cardNumber)}
              </span>
              <button
                onClick={copyCardNumber}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Copy card number"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Expiry, CVV & Visa Mark */}
          <div className="flex justify-between items-end relative z-10">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[9px] font-mono text-blue-200 uppercase tracking-wider">EXPIRES</p>
                <p className="font-mono text-sm font-semibold text-white">{expiryDate}</p>
              </div>
              <div>
                <p className="text-[9px] font-mono text-blue-200 uppercase tracking-wider">CVV</p>
                <p className="font-mono text-sm font-semibold text-white">{cvv}</p>
              </div>
            </div>
            <div className="font-bold italic text-xl tracking-tighter font-sans text-white/95">
              VISA
            </div>
          </div>
        </div>

        {/* Toggle Hide/Show Number Button (Reference: Image 2) */}
        <div className="my-2">
          <button
            type="button"
            onClick={() => setShowCardNumber(!showCardNumber)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showCardNumber ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
            </svg>
            <span>{showCardNumber ? 'Hide number' : 'Show number'}</span>
          </button>
        </div>

        {/* Form Inputs (Customizable if user wants different credentials) */}
        <form onSubmit={handlePayment} className="w-full mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase font-mono mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase font-mono mb-1">Card Number</label>
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
              ❌ {error}
            </div>
          )}

          {/* Primary Action Button (Reference: Image 2 "Shop online") */}
          <button
            type="submit"
            disabled={processing}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Authorizing Payment...</span>
              </>
            ) : (
              <span>Shop online (${payment?.amount.toFixed(2)})</span>
            )}
          </button>

          {/* Secondary Action Button (Reference: Image 2 "Apple Pay") */}
          <button
            type="button"
            onClick={() => handlePayment()}
            disabled={processing}
            className="w-full py-3.5 px-6 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold text-sm rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span></span>
            <span>Pay</span>
          </button>
        </form>

        <p className="text-[11px] text-gray-400 text-center mt-6">
          🔒 Secured with NovaPay 256-bit End-to-End Encryption
        </p>
      </div>
    </div>
  );
}
