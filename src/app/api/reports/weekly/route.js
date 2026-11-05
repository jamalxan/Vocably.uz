import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { resolveReportWeek, safeTimeZone } from '@/lib/weeklyReport';
import { getWeeklyReport } from '@/lib/weeklyReportServer';

// "Haftalik hisobot" (TZ 2.0 §6.2.4, §10). ?week=2026-W45 (optional; default: this week on Sunday,
// otherwise the last finished week). Core report for everyone, the personal part for Premium.
export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();
    const user = await User.findById(userId).select('timezone').lean();
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    const requested = new URL(req.url).searchParams.get('week');
    const now = new Date();
    const week = resolveReportWeek(requested, now, safeTimeZone(user.timezone));
    if (!week) return NextResponse.json({ error: 'Noto‘g‘ri hafta' }, { status: 400 });
    const report = await getWeeklyReport(userId, { week, now });
    if (!report) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    return NextResponse.json(report, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return serverError(err, 'reports/weekly');
  }
}
