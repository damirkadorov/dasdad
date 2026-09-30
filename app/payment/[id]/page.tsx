'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Logo from '@/components/layout/Logo';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  customerEmail?: string;
  customerName?: string;
  merchantName?: string;
  orderId?: string;
  successUrl?: string;
  cancelUrl?: string;
  createdAt?: string;
  expiresAt?: string;
}

interface SavedCard {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  currency: string;
  cardType: string;
  status: string;
}

const DEMO_CARD = {
  cardNumber: '7003211480511885',
  expiryDate: '07/31',
  cvv: '481',
  cardholderName: 'Demo Customer',
};

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export default function PaymentPage() {
  const params = useParams();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('new');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    void loadCheckout();
    // loadCheckout intentionally reloads only when the checkout ID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  const loadCheckout = async () => {
    try {
      const paymentResponse = await fetch(`/api/payment-gateway/process/${paymentId}`, { cache: 'no-store' });
      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) throw new Error(paymentData.error || 'Unable to load this payment');

      setPayment(paymentData.payment);
      setEmail(paymentData.payment.customerEmail || '');
      setCardholderName(paymentData.payment.customerName || '');

      const cardsResponse = await fetch('/api/cards', { cache: 'no-store' });
      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json();
        const availableCards = (cardsData.cards || []).filter((card: SavedCard) => card.status === 'active');
        setSavedCards(availableCards);
      }
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to load this payment');
    } finally {
      setLoading(false);
    }
  };

  const expiresIn = useMemo(() => {
    if (!payment?.expiresAt) return null;
    const minutes = Math.max(0, Math.ceil((new Date(payment.expiresAt).getTime() - Date.now()) / 60000));
    return `${minutes} min`;
  }, [payment?.expiresAt]);

  const selectSavedCard = (card: SavedCard) => {
    setSelectedCardId(card.id);
    setCardNumber(formatCardNumber(card.cardNumber));
    setExpiryDate(formatExpiry(card.expiryDate));
    // CVC is never persisted in the checkout form, even for a saved card.
    setCvv('');
    setError('');
  };

  const useAnotherCard = () => {
    setSelectedCardId('new');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setError('');
  };

  const notifyParent = (message: Record<string, unknown>) => {
    if (window.parent && window.parent !== window) window.parent.postMessage(message, '*');
    if (window.opener) window.opener.postMessage(message, '*');
  };

  const handleCancel = async () => {
    try {
      await fetch(`/api/payment-gateway/process/${paymentId}`, { method: 'DELETE', keepalive: true });
    } catch {
      // Navigation must still be available if cancellation logging fails.
    }
    notifyParent({ type: 'lingoung.payment.cancel', paymentId });
    if (payment?.cancelUrl) {
      window.location.href = payment.cancelUrl;
      return;
    }
    if (window.parent !== window || window.opener) {
      window.close();
      return;
    }
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  };

  const handleReturnToMerchant = () => {
    if (payment?.successUrl) {
      window.location.href = payment.successUrl;
      return;
    }
    void handleCancel();
  };

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const cleanCard = cardNumber.replace(/\D/g, '');
    const cleanExpiry = expiryDate.replace(/\D/g, '');
    if (cleanCard.length !== 16) return setError('Enter a valid 16-digit card number');
    if (cleanExpiry.length !== 4) return setError('Enter expiry date in MM/YY format');
    const expiryMonth = Number(cleanExpiry.slice(0, 2));
    const expiryYear = 2000 + Number(cleanExpiry.slice(2));
    const now = new Date();
    if (expiryMonth < 1 || expiryMonth > 12 || expiryYear < now.getFullYear() || (expiryYear === now.getFullYear() && expiryMonth < now.getMonth() + 1)) {
      return setError('This card expiry date is invalid or has passed');
    }
    if (cvv.length !== 3) return setError('Enter a valid 3-digit security code');

    setProcessing(true);
    try {
      const response = await fetch(`/api/payment-gateway/process/${paymentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          cardholderName,
          cardNumber: cleanCard,
          expiryDate: cleanExpiry,
          cvv,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment could not be completed');

      notifyParent({
        type: 'lingoung.payment.success',
        event: 'payment.completed',
        paymentId,
        amount: payment?.amount,
        currency: payment?.currency,
        orderId: payment?.orderId,
      });

      if (window.parent !== window || window.opener) return;
      window.location.href = data.successUrl || `/payment/${paymentId}/success`;
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Payment could not be completed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07090D] text-slate-400">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />
          <p className="mt-4 text-sm">Opening secure checkout…</p>
        </div>
      </div>
    );
  }

  if (!payment || error && !payment) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07090D] p-5 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101318] p-7 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-red-500/10 text-red-300">!</div>
          <h1 className="mt-4 text-xl font-semibold">Checkout unavailable</h1>
          <p className="mt-2 text-sm text-slate-400">{error || 'This payment link is no longer available.'}</p>
          <button onClick={handleCancel} className="mt-6 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] text-sm font-semibold hover:bg-white/[0.1]">Return to merchant</button>
        </div>
      </div>
    );
  }

  if (payment.status !== 'pending') {
    const completed = payment.status === 'completed';
    return (
      <div className="grid min-h-screen place-items-center bg-[#07090D] p-5 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101318] p-7 text-center">
          <div className={`mx-auto grid h-12 w-12 place-items-center rounded-xl ${completed ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>{completed ? '✓' : '!'}</div>
          <h1 className="mt-4 text-xl font-semibold">{completed ? 'Payment already completed' : 'Payment unavailable'}</h1>
          <p className="mt-2 text-sm text-slate-400">{completed ? 'This payment was successfully processed.' : 'Create a new payment session and try again.'}</p>
          <button onClick={handleReturnToMerchant} className="mt-6 min-h-11 w-full rounded-xl bg-[#5E9FE8] text-sm font-semibold text-slate-950 hover:bg-[#7AB2EE]">Return to merchant</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090D] px-4 py-5 text-white sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-5 flex items-center justify-between">
          <Logo size={32} showText textWhite />
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-emerald-300 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Secure checkout</span>
            <button onClick={handleCancel} aria-label="Cancel payment" className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-xl text-slate-400 hover:bg-white/[0.08] hover:text-white">×</button>
          </div>
        </header>

        <div className="grid overflow-hidden rounded-[24px] border border-white/10 bg-[#101318] shadow-[0_32px_90px_rgba(0,0,0,.45)] lg:grid-cols-[1fr_360px]">
          <main className="p-5 sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-300">Pay securely</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Card details</h1>
              <p className="mt-1 text-sm text-slate-400">Choose a saved Lingoung card or enter another card.</p>
            </div>

            {savedCards.length > 0 && (
              <section className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Saved cards</h2>
                  {selectedCardId !== 'new' && <button type="button" onClick={useAnotherCard} className="text-xs font-semibold text-blue-300 hover:text-blue-200">Use another card</button>}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {savedCards.map((card) => (
                    <button key={card.id} type="button" onClick={() => selectSavedCard(card)} className={`flex min-h-16 items-center justify-between rounded-xl border px-4 text-left transition-colors ${selectedCardId === card.id ? 'border-blue-300/50 bg-blue-400/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}>
                      <span>
                        <span className="block text-sm font-semibold">•••• {card.cardNumber.replace(/\s/g, '').slice(-4)}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{card.currency} · {card.cardType === 'nova-plus' ? 'Lingoung+' : 'Lingoung'}</span>
                      </span>
                      <span className="text-xs font-semibold italic text-slate-300">VISA</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label htmlFor="cardholder" className="mb-2 block text-xs font-semibold text-slate-400">Name on card</label>
                <input id="cardholder" autoComplete="cc-name" required value={cardholderName} onChange={(event) => setCardholderName(event.target.value)} placeholder="Full name" className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-slate-600 focus:border-blue-300 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="card-number" className="mb-2 block text-xs font-semibold text-slate-400">Card number</label>
                <div className="relative">
                  <input id="card-number" inputMode="numeric" autoComplete="cc-number" required value={cardNumber} onChange={(event) => { setSelectedCardId('new'); setCardNumber(formatCardNumber(event.target.value)); }} placeholder="1234 5678 9012 3456" className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-16 font-mono text-sm text-white placeholder:text-slate-600 focus:border-blue-300 focus:outline-none" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold italic text-slate-500">VISA</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="expiry" className="mb-2 block text-xs font-semibold text-slate-400">Expiry</label>
                  <input id="expiry" inputMode="numeric" autoComplete="cc-exp" required value={expiryDate} onChange={(event) => setExpiryDate(formatExpiry(event.target.value))} placeholder="MM/YY" className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 font-mono text-sm text-white placeholder:text-slate-600 focus:border-blue-300 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="cvv" className="mb-2 block text-xs font-semibold text-slate-400">Security code</label>
                  <input id="cvv" type="password" inputMode="numeric" autoComplete="cc-csc" required value={cvv} onChange={(event) => setCvv(event.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="CVC" className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 font-mono text-sm text-white placeholder:text-slate-600 focus:border-blue-300 focus:outline-none" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold text-slate-400">Receipt email</label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-slate-600 focus:border-blue-300 focus:outline-none" />
              </div>

              {savedCards.length === 0 && (
                <button type="button" onClick={() => { setCardholderName(DEMO_CARD.cardholderName); setCardNumber(formatCardNumber(DEMO_CARD.cardNumber)); setExpiryDate(DEMO_CARD.expiryDate); setCvv(DEMO_CARD.cvv); }} className="text-left text-xs text-blue-300 hover:text-blue-200">
                  Sandbox only: fill the demo card
                </button>
              )}

              {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

              <button type="submit" disabled={processing} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#5E9FE8] px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#7AB2EE] disabled:opacity-60">
                {processing ? 'Processing securely…' : `Pay ${formatMoney(payment.amount, payment.currency)}`}
              </button>
            </form>

            <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">Your card data is encrypted in transit. This sandbox processes demo funds only.</p>
          </main>

          <aside className="order-first border-b border-white/10 bg-black/20 p-5 sm:p-8 lg:order-none lg:border-b-0 lg:border-l">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Order summary</p>
            <div className="mt-6 flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-white">{payment.description}</p>
                <p className="mt-1 text-xs text-slate-500">{payment.merchantName}</p>
              </div>
              <p className="whitespace-nowrap text-sm font-semibold text-white">{formatMoney(payment.amount, payment.currency)}</p>
            </div>
            <div className="my-6 border-t border-white/10" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Total</p>
              <p className="text-xl font-semibold tracking-[-0.03em] text-white">{formatMoney(payment.amount, payment.currency)}</p>
            </div>
            <dl className="mt-8 space-y-3 text-xs">
              {payment.orderId && <div className="flex justify-between gap-4"><dt className="text-slate-500">Order</dt><dd className="max-w-[180px] truncate text-slate-300">{payment.orderId}</dd></div>}
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Payment ID</dt><dd className="font-mono text-slate-300">{payment.id.slice(0, 8)}</dd></div>
              {expiresIn && <div className="flex justify-between gap-4"><dt className="text-slate-500">Session expires</dt><dd className="text-slate-300">{expiresIn}</dd></div>}
            </dl>
            <div className="mt-8 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-3 text-xs leading-5 text-emerald-200/80">Funds are transferred only after successful authorization.</div>
          </aside>
        </div>
      </div>
    </div>
  );
}