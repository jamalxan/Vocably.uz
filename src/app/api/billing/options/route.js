import { NextResponse } from 'next/server';
import { publicPaymentOptions, priceFor, PAID_TIERS } from '@/lib/payments/config';

// Checkout page data: available payment methods (no secrets) and prices.
// Dynamic on purpose: a static build would freeze whichever providers were
// configured at build time, so adding Payme/Click keys later wouldn't show.
export const dynamic = 'force-dynamic';

export async function GET() {
  const prices = Object.fromEntries(PAID_TIERS.map((t) => [t, { 1: priceFor(t, 1), 12: priceFor(t, 12) }]));
  return NextResponse.json({ ...publicPaymentOptions(), prices });
}
