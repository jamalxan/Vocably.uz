import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AutomationPolicy } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const doc = await AutomationPolicy.findOneAndUpdate(
      { scope: 'global' },
      { $set: { paused: false, pausedAt: null, pausedReason: '', updatedBy: admin._id, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    await writeAuditLog(req, admin._id, 'automation.resume', 'AutomationPolicy', String(doc._id), {});

    return NextResponse.json({ policy: doc });
  } catch (err) {
    return serverError(err, 'admin/automation/resume');
  }
}
