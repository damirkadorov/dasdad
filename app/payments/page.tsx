'use client';

import { Suspense } from 'react';
import PaymentsContent from './PaymentsContent';

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
