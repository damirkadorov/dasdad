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
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <span className="text-4xl">✓</span>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully.
          </p>

          {/* Payment ID */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Payment ID</p>
            <p className="text-sm font-mono text-gray-800 break-all">{paymentId}</p>
          </div>

          {/* Info */}
          <p className="text-sm text-gray-500 mb-6">
            You can close this window or you will be redirected in {countdown} seconds
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="primary"
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => window.close()}
              variant="secondary"
              className="w-full"
            >
              Close Window
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
