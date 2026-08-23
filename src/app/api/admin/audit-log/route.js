import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AdminAuditLog, User } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const logs = await AdminAuditLog.find({}).sort({ createdAt: -1 }).limit(300).lean();
    const actorIds = [...new Set(logs.map((l) => String(l.actorId)))];
    const actors = await User.find({ _id: { $in: actorIds } }).select('username name').lean();
    const byId = new Map(actors.map((u) => [String(u._id), u]));

    return NextResponse.json({
      logs: logs.map((l) => ({ ...l, actor: byId.get(String(l.actorId)) || null })),
    });
  } catch (err) {
    return serverError(err, 'admin/audit-log');
  }
}
