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
      <div className="min-h-screen bg-[#05070B] bg-cyber-grid flex items-center justify-center p-4 text-zinc-100">
        <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4ff00] mx-auto"></div>
          <p className="mt-4 text-xs font-mono text-zinc-400">Initializing checkout session...</p>
        </div>
      </div>
    );
  }

  if (error && !flow) {
    return (
      <div className="min-h-screen bg-[#05070B] bg-cyber-grid flex items-center justify-center p-4 text-zinc-100">
        <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ❌
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">Checkout Error</h2>
          <p className="text-zinc-400 text-xs mb-6">{error}</p>
          <Button onClick={() => router.push('/')} variant="primary" className="bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] font-extrabold">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (flow?.state !== 'CREATED') {
    return (
      <div className="min-h-screen bg-[#05070B] bg-cyber-grid flex items-center justify-center p-4 text-zinc-100">
        <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-950/40 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">Checkout Not Available</h2>
          <p className="text-zinc-400 text-xs mb-6">
            This checkout session has already expired or been finalized. State: <span className="font-mono text-amber-400">{flow?.state}</span>
          </p>
          <Button onClick={handleCancel} variant="primary" className="bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] font-extrabold">
            Return
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070B] bg-cyber-grid flex items-center justify-center p-4 text-zinc-100">
      <div className="bg-white/[0.04] rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full animate-scaleIn relative overflow-hidden">
        {/* Top Header - Reference 2 Affirm Style */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#d4ff00] flex items-center justify-center font-extrabold text-[#05070B] text-xs">
              N
            </div>
            <span className="font-extrabold text-sm text-white tracking-tight">NovaPay Checkout</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active for 01:59:48</span>
          </div>
        </div>

        {/* Big Centered Price - Reference 2 Affirm Style */}
        <div className="text-center mb-6">
          <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono mb-1">
            {flow?.currency === 'USD' ? '$' : flow?.currency === 'EUR' ? '€' : flow?.currency === 'GBP' ? '£' : ''}
            {flow?.amount?.toFixed(2)}
          </div>
          <p className="text-xs text-zinc-400 font-medium">{flow?.memo || 'Order Payment'}</p>
        </div>

        {/* Card Mockup Wave Preview - Affirm Royal Cobalt Wave */}
        <div className="mb-6 card-affirm-wave rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200/90 font-mono">NovaPay Virtual</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wider backdrop-blur-xs font-mono">ONE-TIME CARD</span>
          </div>
          <div className="relative z-10 font-mono text-sm tracking-widest font-bold text-white mb-3">
            {cardNumber || '•••• •••• •••• ••••'}
          </div>
          <div className="relative z-10 flex justify-between items-center text-[11px] text-blue-100 font-mono">
            <span>EXP: {expiryMonth || 'MM'}/{expiryYear || 'YY'}</span>
            <span>CVV: {securityCode ? '•••' : '•••'}</span>
          </div>
        </div>

        {/* Card Form */}
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Card Number (NovaPay starts with 7)
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="7003 2114 8051 1885"
                required
                maxLength={19}
                className="w-full px-4 py-3 bg-[#05070B] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#d4ff00] focus:outline-none text-white text-base font-mono tracking-wider placeholder-zinc-700"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-xs font-extrabold font-mono text-[#d4ff00]">NovaPay</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Month
              </label>
              <select
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                required
                className="w-full px-3 py-3 bg-[#05070B] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#d4ff00] focus:outline-none text-white text-sm font-mono"
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, '0');
                  return <option key={month} value={month}>{month}</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Year
              </label>
              <select
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                required
                className="w-full px-3 py-3 bg-[#05070B] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#d4ff00] focus:outline-none text-white text-sm font-mono"
              >
                <option value="">YY</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = ((new Date().getFullYear() + i) % 100).toString().padStart(2, '0');
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                CVV
              </label>
              <input
                type="text"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="481"
                required
                maxLength={3}
                className="w-full px-3 py-3 bg-[#05070B] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#d4ff00] focus:outline-none text-white text-sm font-mono text-center placeholder-zinc-700"
              />
            </div>
          </div>

          <Input
            label="Email for Transaction Receipt"
            type="email"
            value={cardholderEmail}
            onChange={(e) => setCardholderEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={processing}
            className="w-full py-4 bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] font-extrabold text-base rounded-2xl shadow-xl shadow-[#d4ff00]/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            {processing ? 'Authorizing Payment...' : `Complete Purchase (${flow?.currency} ${flow?.amount?.toFixed(2)})`}
          </Button>

          <button
            type="button"
            onClick={handleCancel}
            className="w-full text-zinc-400 hover:text-white text-xs py-2 transition-colors cursor-pointer"
          >
            Cancel and return to merchant
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-white/10 text-center text-[11px] text-zinc-500">
          <p>🔒 End-to-end encrypted clearance by NovaPay Gateway</p>
        </div>
      </div>
    </div>
  );
}
