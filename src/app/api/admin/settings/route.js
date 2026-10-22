import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { getWelcomeTrial, setWelcomeTrial, normalizeWelcomeTrial, WELCOME_TRIAL_MONTHS } from '@/lib/settings';
import { PAID_TIERS } from '@/lib/payments/config';
import { NextResponse } from 'next/server';

// Admin settings (src/lib/settings.js). Today: the welcome trial — the free
// starter plan every new account gets at registration.
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    await connectToDatabase();
    return NextResponse.json({ welcomeTrial: await getWelcomeTrial(), options: { tiers: PAID_TIERS, months: WELCOME_TRIAL_MONTHS } });
  } catch (err) {
    return serverError(err, 'admin/settings GET');
  }
}

export async function PATCH(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    if (body.welcomeTrial === undefined) return NextResponse.json({ error: "O'zgartiriladigan sozlama yo'q" }, { status: 400 });

    const current = await getWelcomeTrial();
    const next = normalizeWelcomeTrial(body.welcomeTrial, current);
    if (!next) return NextResponse.json({ error: "Noto'g'ri qiymat: tarif standard/premium, muddat 1/3/6/12 oy" }, { status: 400 });
    await setWelcomeTrial(next, admin._id);
    await writeAuditLog(req, admin._id, 'settings.update', 'AppSetting', 'welcomeTrial', { from: current, to: next });
    return NextResponse.json({ welcomeTrial: next });
  } catch (err) {
    return serverError(err, 'admin/settings PATCH');
  }
}
