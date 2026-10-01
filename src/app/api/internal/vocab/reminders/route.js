import { NextResponse } from 'next/server';
import { bearerMatches } from '@/lib/safeEqual';
import { connectToDatabase } from '@/lib/db';
import { runReminderSweep } from '@/lib/vocab/server/reminderService';

// Kunlik lug'at eslatmalari (Vercel cron, vercel.json). Himoya: Authorization: Bearer $CRON_SECRET.
// Idempotent: har foydalanuvchi kuniga bir marta "band qilinadi", takroriy ishga tushirish ikki marta yubormaydi.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!bearerMatches(req.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
  }
  await connectToDatabase();
  return NextResponse.json({ ok: true, ...(await runReminderSweep()) });
}
