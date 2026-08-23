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

    const before = req.nextUrl.searchParams.get('before');
    const query = before ? { createdAt: { $lt: new Date(before) } } : {};
    const limitParam = parseInt(req.nextUrl.searchParams.get('limit'), 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;

    const logs = await AdminAuditLog.find(query).sort({ createdAt: -1 }).limit(limit + 1).lean();
    const hasMore = logs.length > limit;
    const page = hasMore ? logs.slice(0, limit) : logs;
    const nextCursor = hasMore ? page[page.length - 1].createdAt : null;

    const actorIds = [...new Set(page.map((l) => String(l.actorId)))];
    const actors = await User.find({ _id: { $in: actorIds } }).select('username name').lean();
    const byId = new Map(actors.map((u) => [String(u._id), u]));

    return NextResponse.json({
      logs: page.map((l) => ({ ...l, actor: byId.get(String(l.actorId)) || null })),
      nextCursor,
    });
  } catch (err) {
    return serverError(err, 'admin/audit-log');
  }
}
