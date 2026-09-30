'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Logo from '@/components/layout/Logo';

interface Receipt {
  id: string;
  amount: number;
  currency: string;
  description: string;
  merchantName?: string;
  orderId?: string;
  successUrl?: string;
}

export default function PaymentSuccessPage() {
  const params = useParams();
  const paymentId = params.id as string;
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetch(`/api/payment-gateway/process/${paymentId}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setReceipt(data.payment || null))
      .catch(() => setReceipt(null));
  }, [paymentId]);

  const returnToMerchant = () => {
    if (receipt?.successUrl) {
      window.location.href = receipt.successUrl;
      return;
    }
    if (window.opener) {
      window.close();
      return;
    }
    if (window.history.length > 1) window.history.back();
    else window.close();
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#07090D] bg-cyber-grid p-4 text-white">
      <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#101318] p-7 shadow-[0_30px_90px_rgba(0,0,0,.45)] sm:p-8">
        <div className="flex items-center justify-between">
          <Logo size={32} showText textWhite />
          <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Paid</span>
        </div>

        <div className="mt-9 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/10 text-2xl font-semibold text-emerald-300">✓</div>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">Payment complete</h1>
          <p className="mt-2 text-sm text-slate-400">Your payment was authorized and the merchant has been notified.</p>
        </div>

        <div className="mt-7 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
          {receipt && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{receipt.description}</p>
                  <p className="mt-1 text-xs text-slate-500">{receipt.merchantName}</p>
                </div>
                <p className="whitespace-nowrap text-base font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: receipt.currency }).format(receipt.amount)}</p>
              </div>
              <div className="my-4 border-t border-white/[0.08]" />
            </>
          )}
          <dl className="space-y-2 text-xs">
            {receipt?.orderId && <div className="flex justify-between gap-4"><dt className="text-slate-500">Order</dt><dd className="truncate text-slate-300">{receipt.orderId}</dd></div>}
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Receipt</dt><dd className="font-mono text-slate-300">{paymentId.slice(0, 8)}</dd></div>
          </dl>
        </div>

        <button onClick={returnToMerchant} className="mt-6 min-h-12 w-full rounded-xl bg-[#5E9FE8] px-5 text-sm font-semibold text-slate-950 hover:bg-[#7AB2EE]">
          {receipt?.successUrl ? 'Return to merchant' : 'Close receipt'}
        </button>
        <p className="mt-4 text-center text-[11px] text-slate-500">You will not be redirected to a Lingoung dashboard.</p>
      </div>
    </div>
  );
}