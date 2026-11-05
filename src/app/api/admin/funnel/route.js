import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { salesFunnelReport } from '@/lib/salesFunnelServer';

// GET /api/admin/funnel?days=7|30|90 — landing → onboarding → signup → payment (TZ 2.0 §6.12.3).
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const days = Number(new URL(req.url).searchParams.get('days')) || 30;
    return NextResponse.json(await salesFunnelReport({ days }));
  } catch (err) {
    return serverError(err, 'admin/funnel');
  }
}
