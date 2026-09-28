'use client';

import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function CheckoutSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const flowId = params.flowId as string;

  return (
    <div className="min-h-screen bg-[#05070B] bg-cyber-grid flex items-center justify-center p-4 text-zinc-100">
      <div className="bg-white/[0.04] rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl p-8 max-w-md w-full text-center animate-scaleIn">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#d4ff00] to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#d4ff00]/20 text-[#05070B]">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-xs font-bold text-[#d4ff00] mb-3 font-mono">
          <span>✓ CLEARANCE AUTHORIZED</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Payment Authorized!</h1>
        <p className="text-zinc-400 text-xs mb-6">
          Your card authorization was cleared successfully. The merchant will finalize and deliver your order.
        </p>

        <div className="bg-[#05070B] border border-white/10 rounded-2xl p-4 mb-6 text-left font-mono">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Flow Reference Key</p>
          <p className="text-xs text-[#d4ff00] break-all select-all font-bold">{flowId}</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="primary"
            className="w-full py-3.5 bg-[#d4ff00] hover:bg-[#bce600] text-[#05070B] font-extrabold text-sm shadow-xl shadow-[#d4ff00]/20"
          >
            Go to Customer Dashboard
          </Button>
          <button
            onClick={() => router.push('/')}
            className="w-full text-zinc-400 hover:text-white text-xs py-2 transition-colors cursor-pointer"
          >
            Return to Store
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 text-xs text-zinc-500 font-mono">
          <p>Powered by Lingoung Bank &bull; NovaPay</p>
        </div>
      </div>
    </div>
  );
}
