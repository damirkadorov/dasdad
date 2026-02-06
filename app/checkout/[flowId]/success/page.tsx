'use client';

import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function CheckoutSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const flowId = params.flowId as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Authorized!</h1>
        <p className="text-gray-600 mb-6">
          Your payment has been successfully authorized. The merchant will finalize the charge.
        </p>

        <div className="bg-emerald-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Flow Reference</p>
          <p className="font-mono text-sm text-emerald-700 break-all">{flowId}</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="primary"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            Go to Dashboard
          </Button>
          <button
            onClick={() => router.push('/')}
            className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
          >
            Return to Home
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Powered by NovaPay</p>
        </div>
      </div>
    </div>
  );
}
