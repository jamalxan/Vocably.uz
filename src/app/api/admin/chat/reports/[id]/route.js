import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Report } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { status: newStatus } = await req.json();
    if (!['open', 'reviewed', 'actioned'].includes(newStatus)) {
      return NextResponse.json({ error: "Noto'g'ri status" }, { status: 400 });
    }

    const report = await Report.findByIdAndUpdate(
      params.id,
      { $set: { status: newStatus, reviewedBy: admin._id, reviewedAt: new Date() } },
      { new: true }
    );
    if (!report) return NextResponse.json({ error: 'Report topilmadi' }, { status: 404 });

    await writeAuditLog(req, admin._id, 'chat.report.update', 'Report', report._id, { status: newStatus });

    return NextResponse.json({ report });
  } catch (err) {
    return serverError(err, 'admin/chat/reports/[id] PATCH');
  }
}
