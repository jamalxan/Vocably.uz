import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { getTodayPlan } from '@/lib/plan/server';

// "Bugungi reja" (TZ 2.0 §6.2) — today's tasks, built on the first read of the local day.
export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();
    const plan = await getTodayPlan(userId);
    if (!plan) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    return NextResponse.json(plan, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return serverError(err, 'plan/today');
  }
}
