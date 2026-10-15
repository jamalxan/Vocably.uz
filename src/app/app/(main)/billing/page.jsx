import { Suspense } from 'react';
import Checkout from '@/components/billing/Checkout';

export const metadata = { title: 'To‘lov — Vocably', robots: { index: false } };

export default function TolovPage() {
  return (
    <Suspense fallback={null}>
      <Checkout />
    </Suspense>
  );
}
