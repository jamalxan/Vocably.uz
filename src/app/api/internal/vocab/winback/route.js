import { NextResponse } from 'next/server';
import { bearerMatches } from '@/lib/safeEqual';
import { connectToDatabase } from '@/lib/db';
import { runWinbackSweep } from '@/lib/vocab/server/winbackService';

// "Qaytarish" xabari — kunlik cron (vercel.json, 13:00 UTC = 18:00 Toshkent; kunlik mini-testdan oldin, Telegram
// limitini birinchi u oladi). Himoya: Authorization: Bearer $CRON_SECRET. Idempotent: har nofaollik davri uchun bir marta.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!bearerMatches(req.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
  }
  await connectToDatabase();
  return NextResponse.json({ ok: true, ...(await runWinbackSweep()) });
}
