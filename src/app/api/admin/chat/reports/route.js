import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Report, User } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const statusFilter = req.nextUrl.searchParams.get('status') || 'open';
    const query = statusFilter === 'all' ? {} : { status: statusFilter };
    const before = req.nextUrl.searchParams.get('before');
    if (before) query.createdAt = { $lt: new Date(before) };
    const limitParam = parseInt(req.nextUrl.searchParams.get('limit'), 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;

    const reports = await Report.find(query).sort({ createdAt: -1 }).limit(limit + 1).lean();
    const hasMore = reports.length > limit;
    const page = hasMore ? reports.slice(0, limit) : reports;
    const nextCursor = hasMore ? page[page.length - 1].createdAt : null;

    const reporterIds = [...new Set(page.map((r) => String(r.reporterId)))];
    const reporters = await User.find({ _id: { $in: reporterIds } }).select('username name').lean();
    const byId = new Map(reporters.map((u) => [String(u._id), u]));

    return NextResponse.json({
      reports: page.map((r) => ({ ...r, reporter: byId.get(String(r.reporterId)) || null })),
      nextCursor,
    });
  } catch (err) {
    return serverError(err, 'admin/chat/reports GET');
  }
}
