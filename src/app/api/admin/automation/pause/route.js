import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AutomationPolicy } from '@/lib/models';
import { NextResponse } from 'next/server';

// docs/ai-content-agent-tz-avtopilot.md §3.3 item 6/§7.1 — "Katta qizil
// tugma: Avtopilotni to'xtatish". Faqat global policy'ga ta'sir qiladi
// (per-book override'lar bu bilan o'chmaydi, lekin orchestrator har doim
// AVVAL global `paused`ni tekshirishi kerak bo'ladi — hozircha orchestrator
// yo'q, bu yerda faqat flag saqlanadi va o'qiladi).
export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === 'string' ? body.reason.slice(0, 500) : 'admin_manual';

    const doc = await AutomationPolicy.findOneAndUpdate(
      { scope: 'global' },
      { $set: { paused: true, pausedAt: new Date(), pausedReason: reason, updatedBy: admin._id, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    await writeAuditLog(req, admin._id, 'automation.pause', 'AutomationPolicy', String(doc._id), { reason });

    return NextResponse.json({ policy: doc });
  } catch (err) {
    return serverError(err, 'admin/automation/pause');
  }
}
