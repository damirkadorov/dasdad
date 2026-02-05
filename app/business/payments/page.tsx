'use client';

import { Suspense } from 'react';
import BusinessPaymentsContent from './BusinessPaymentsContent';

export default function BusinessPaymentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-900">Loading...</div>}>
      <BusinessPaymentsContent />
    </Suspense>
  );
}
