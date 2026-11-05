import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { FunnelHit } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/chatAuth';
import { clientIp } from '@/lib/clientIp';
import { localDateWithCutoff } from '@/lib/srs';
import { cleanFunnelHit, isBotAgent } from '@/lib/salesFunnel';

// POST /api/funnel { stage, vid, path } — anonymous funnel beacon (TZ 2.0 §6.12.3), sent with navigator.sendBeacon.
// Always 204: the page never waits on it and a probe learns nothing. Signed-in visitors and crawlers are skipped;
// one row per (day, stage, vid) so reloads and retries don't inflate the counts.
const done = () => new NextResponse(null, { status: 204 });

export async function POST(req) {
  try {
    if (isBotAgent(req.headers.get('user-agent') || '')) return done();
    const text = await req.text();
    if (text.length > 1000) return done();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      return done();
    }
    const hit = cleanFunnelHit(body);
    if (!hit) return done();
    await connectToDatabase();
    if (await getUserIdFromRequest(req)) return done();
    if (!(await checkRateLimit(clientIp(req), 'funnel-ip', 60))) return done();
    const day = localDateWithCutoff(new Date(), 'Asia/Tashkent');
    await FunnelHit.updateOne({ day, stage: hit.stage, vid: hit.vid }, { $setOnInsert: { path: hit.path, createdAt: new Date() } }, { upsert: true }).catch((err) => {
      if (err?.code !== 11000) throw err; // parallel duplicate — already counted
    });
    return done();
  } catch (err) {
    console.error('[funnel]', err?.message || err);
    return done();
  }
}
