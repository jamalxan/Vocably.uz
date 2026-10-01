import { NextResponse } from 'next/server';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { handleRouteError, readJson } from '@/lib/vocab/server/route';
import { deleteEntry, getAdminEntry, updateEntry } from '@/lib/vocab/server/libraryService';

export async function GET(req, { params }) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { id } = await params;
    return NextResponse.json({ entry: await getAdminEntry(id) });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-library/[id] GET');
  }
}

// PATCH — tahrirlash (versiya oshadi, eski holat tarixga yoziladi)
export async function PATCH(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { id } = await params;
    const body = await readJson(req);
    if (!body || typeof body !== 'object') return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    const entry = await updateEntry(id, body, admin._id);
    await writeAuditLog(req, admin._id, 'vocab.library.update', 'VocabularyEntry', id, { word: entry.word, version: entry.contentVersion });
    return NextResponse.json({ entry });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-library/[id] PATCH');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { id } = await params;
    await deleteEntry(id);
    await writeAuditLog(req, admin._id, 'vocab.library.delete', 'VocabularyEntry', id, {});
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-library/[id] DELETE');
  }
}
