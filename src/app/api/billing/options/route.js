import { NextResponse } from 'next/server';
import { publicPaymentOptions, priceFor, PAID_TIERS } from '@/lib/payments/config';
import { connectToDatabase } from '@/lib/db';
import { getWelcomeTrial } from '@/lib/settings';

// Checkout page data: available payment methods (no secrets) and prices.
// Dynamic on purpose: a static build would freeze whichever providers were
// configured at build time, so adding Payme/Click keys later wouldn't show.
export const dynamic = 'force-dynamic';

export async function GET() {
  const prices = Object.fromEntries(PAID_TIERS.map((t) => [t, { 1: priceFor(t, 1), 12: priceFor(t, 12) }]));
  // Welcome trial (new accounts get a free starter plan) — shown on /pricing.
  let welcomeTrial = null;
  try {
    await connectToDatabase();
    const trial = await getWelcomeTrial();
    if (trial.enabled) welcomeTrial = { tier: trial.tier, months: trial.months };
  } catch (err) {
    console.error('[billing/options] welcomeTrial', err?.message || err);
  }
  return NextResponse.json({ ...publicPaymentOptions(), prices, welcomeTrial });
}
