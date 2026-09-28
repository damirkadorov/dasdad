'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#05070B] bg-cyber-grid flex items-center justify-center p-4 text-zinc-100">
      <div className="bg-white/[0.04] rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl p-8 max-w-md w-full text-center animate-scaleIn">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#d4ff00] to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#d4ff00]/20 text-[#05070B]">
            <span className="text-3xl font-extrabold">✓</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-xs font-bold text-[#d4ff00] mb-3 font-mono">
            <span>✓ TRANSACTION SETTLED</span>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Payment Completed!
          </h1>
          <p className="text-zinc-400 text-xs mb-6">
            Your card transaction has been cleared and funds transferred securely.
          </p>

          {/* Payment ID */}
          <div className="bg-[#05070B] border border-white/10 rounded-2xl p-4 mb-6 text-left font-mono">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Receipt ID</p>
            <p className="text-xs text-[#d4ff00] break-all font-bold select-all">{paymentId}</p>
          </div>

          {/* Info */}
          <p className="text-xs text-zinc-400 mb-6 flex items-center justify-center gap-1.5 font-mono">
            <span>Redirecting to your dashboard in</span>
            <span className="font-bold text-[#d4ff00] px-2 py-0.5 rounded bg-white/[0.06] border border-white/10">{countdown}s</span>
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="primary"
              className="w-full py-3.5 bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] font-extrabold text-sm shadow-xl shadow-[#d4ff00]/20"
            >
              Go to Dashboard Now
            </Button>
            <Button
              onClick={() => window.close()}
              variant="secondary"
              className="w-full border border-white/10 text-zinc-300 hover:text-white"
            >
              Close Receipt Window
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
