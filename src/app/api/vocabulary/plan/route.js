import { NextResponse } from 'next/server';
import { User } from '@/lib/models';
import { requireVocabUser, handleRouteError, readJson } from '@/lib/vocab/server/route';
import { buildDailyPlanForUser } from '@/lib/vocab/server/profileService';
import { PLAN_TIME_OPTIONS } from '@/lib/vocab/config';
import { normalizeMinutes } from '@/lib/vocab/dailyPlan';

// GET /api/vocabulary/plan?minutes=20 — bugungi individual reja (TZ §19, §47).
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;
    const raw = new URL(req.url).searchParams.get('minutes');
    const { plan, overview, done } = await buildDailyPlanForUser(user, { minutes: raw ? Number(raw) : undefined });
    return NextResponse.json({ plan, overview, done, options: PLAN_TIME_OPTIONS });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/plan');
  }
}

// POST /api/vocabulary/plan — { minutes } kunlik vaqtni saqlaydi (5/10/20/30/45).
export async function POST(req) {
  try {
    const { user, error } = await requireVocabUser(req, { select: 'role' });
    if (error) return error;
    const body = await readJson(req);
    const minutes = Number(body?.minutes);
    if (!PLAN_TIME_OPTIONS.includes(minutes)) return NextResponse.json({ error: "Noto'g'ri vaqt" }, { status: 400 });
    await User.updateOne({ _id: user._id }, { $set: { dailyStudyMinutes: normalizeMinutes(minutes) } });
    return NextResponse.json({ success: true, minutes });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/plan POST');
  }
}
