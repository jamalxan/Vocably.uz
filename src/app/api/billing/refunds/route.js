import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/chatAuth';
import { requestRefund } from '@/lib/payments/refund';

// POST /api/billing/refunds { paymentId, reason? } — 14-day full refund request (TZ 2.0 §10).
export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();
    if (!(await checkRateLimit(String(userId), 'refund-request', 5))) {
      return NextResponse.json({ error: "Juda ko'p urinish. Biroz kuting." }, { status: 429 });
    }
    const body = await req.json().catch(() => ({}));
    const paymentId = typeof body?.paymentId === 'string' ? body.paymentId : '';
    const reason = typeof body?.reason === 'string' ? body.reason : '';
    const res = await requestRefund(userId, paymentId, reason);
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });
    return NextResponse.json({ ok: true, refund: res.refund });
  } catch (err) {
    return serverError(err, 'billing/refunds:post');
  }
}
