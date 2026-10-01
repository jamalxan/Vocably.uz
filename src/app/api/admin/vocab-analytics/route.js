import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { cached } from '@/lib/cache';
import { adminVocabAnalytics } from '@/lib/vocab/server/analyticsService';

// GET /api/admin/vocab-analytics?days=30 — yig'ma (anonim) lug'at/o'yin analytics (TZ §34, §36).
export async function GET(req) {
  try {
    const admin = await requireAdminUser(req);
    if (admin.error) return NextResponse.json({ error: admin.error }, { status: admin.status });
    const days = Number(new URL(req.url).searchParams.get('days')) || 30;
    // Og'ir aggregatsiya — qisqa muddatga keshlanadi.
    const data = await cached(`admin:vocab-analytics:${days}`, () => adminVocabAnalytics({ days }), 60_000);
    return NextResponse.json(data);
  } catch (err) {
    return serverError(err, 'admin/vocab-analytics');
  }
}
