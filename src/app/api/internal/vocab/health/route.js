import { NextResponse } from 'next/server';
import { bearerMatches } from '@/lib/safeEqual';
import { connectToDatabase } from '@/lib/db';
import { adminVocabAnalytics } from '@/lib/vocab/server/analyticsService';
import { evaluateVocabHealth } from '@/lib/vocab/health';

// Lug'at dvigateli monitoring alerti (TZ §62). Vercel cron (vercel.json); himoya: Authorization: Bearer $CRON_SECRET.
// Anomaliya topilsa `[vocab-alert]` prefiksli console.error yoziladi — Vercel log alert'i shu bo'yicha ishlaydi.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!bearerMatches(req.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
  }
  await connectToDatabase();
  const analytics = await adminVocabAnalytics({ days: 7 });
  const alerts = evaluateVocabHealth(analytics);
  for (const a of alerts) console.error(`[vocab-alert] ${a.level} ${a.code}: ${a.message}`);
  return NextResponse.json({ ok: true, alerts, range: analytics.range });
}
