import { NextResponse } from 'next/server';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { handleRouteError } from '@/lib/vocab/server/route';
import { exportCsv } from '@/lib/vocab/server/libraryService';

// GET /api/admin/vocab-library/export?status= — CSV (Excel uchun UTF-8 BOM bilan)
export async function GET(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const csv = await exportCsv({ status: req.nextUrl.searchParams.get('status') || '' });
    await writeAuditLog(req, admin._id, 'vocab.library.export', 'VocabularyEntry', null, {});
    return new NextResponse(`﻿${csv}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="vocably-vocabulary.csv"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-library/export GET');
  }
}
