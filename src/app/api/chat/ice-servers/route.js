import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { buildIceServers } from '@/lib/turn';
import { NextResponse } from 'next/server';

// Vaqtinchalik TURN credential'lari (docs/chat/CALLS_SPEC.md §6.2, §8.1). Qo'ng'iroq
// qabul qiluvchi call:invite kelganda chaqiradi (CallProvider keshlaydi) — hech qachon
// taymer bilan emas: har bir /api/chat/* so'rovi lastActiveAt'ni yangilaydi, ICE so'rovlari
// presence'ni oshkor qilmasligi kerak.
export async function GET(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    if (!(await checkRateLimit(user._id, 'ice-servers', 20))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting.", code: 'rate_limited' }, { status: 429 });
    }

    const { iceServers, ttlSec, turn } = buildIceServers(String(user._id));
    return NextResponse.json({ iceServers, ttlSec, ttl: ttlSec, turn }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return serverError(err, 'chat/ice-servers GET');
  }
}
