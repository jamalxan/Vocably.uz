import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { referralStats } from '@/lib/referralServer';

// My referral code, link and numbers (TZ 2.0 §10 growth 3). Creates the code on first call.
export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();
    const stats = await referralStats(userId);
    if (!stats) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    return NextResponse.json(stats, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return serverError(err, 'referral');
  }
}
