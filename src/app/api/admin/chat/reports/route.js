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

    const reports = await Report.find(query).sort({ createdAt: -1 }).limit(200).lean();
    const reporterIds = [...new Set(reports.map((r) => String(r.reporterId)))];
    const reporters = await User.find({ _id: { $in: reporterIds } }).select('username name').lean();
    const byId = new Map(reporters.map((u) => [String(u._id), u]));

    return NextResponse.json({
      reports: reports.map((r) => ({ ...r, reporter: byId.get(String(r.reporterId)) || null })),
    });
  } catch (err) {
    return serverError(err, 'admin/chat/reports GET');
  }
}
