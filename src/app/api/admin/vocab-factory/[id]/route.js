import { NextResponse } from 'next/server';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { handleRouteError, readJson } from '@/lib/vocab/server/route';
import { cancelJob, deleteJob, getJob } from '@/lib/vocab/server/factoryService';

export async function GET(req, { params }) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { id } = await params;
    return NextResponse.json({ job: await getJob(id) });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-factory/[id] GET');
  }
}

// PATCH { cancel: true } — ishni to'xtatish (qayta ishlash to'xtaydi, yaratilgan yozuvlar qoladi)
export async function PATCH(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { id } = await params;
    const body = await readJson(req);
    if (body?.cancel !== true) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    await cancelJob(id);
    await writeAuditLog(req, admin._id, 'vocab.factory.cancel', 'VocabIngestJob', id, {});
    return NextResponse.json({ job: await getJob(id) });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-factory/[id] PATCH');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { id } = await params;
    await deleteJob(id);
    await writeAuditLog(req, admin._id, 'vocab.factory.delete', 'VocabIngestJob', id, {});
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-factory/[id] DELETE');
  }
}
