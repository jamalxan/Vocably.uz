import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { priceFor } from '@/lib/payments/config';
import { resolvePromo } from '@/lib/promoServer';
import { PROMO_MESSAGES } from '@/lib/promoMessages';

// POST { code, tier, months } → the discounted price for this user, or why the code is refused.
// Rate-limited per user: codes must not be guessable by brute force.
export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();
    if (!(await checkRateLimit(String(userId), 'promo-check', 20))) {
      return NextResponse.json({ error: "Juda ko'p urinish. Biroz kuting." }, { status: 429 });
    }
    const body = await req.json().catch(() => ({}));
    const listPrice = priceFor(String(body?.tier || ''), Number(body?.months));
    if (!listPrice) return NextResponse.json({ error: "Noto'g'ri tarif yoki muddat" }, { status: 400 });
    const r = await resolvePromo(body?.code, { userId, listPrice });
    if (r.error) return NextResponse.json({ error: PROMO_MESSAGES[r.error] || PROMO_MESSAGES.not_found, code: r.error }, { status: 404 });
    return NextResponse.json({ code: r.promo.code, kind: r.promo.kind, ...r.quote }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return serverError(err, 'billing/promo');
  }
}
