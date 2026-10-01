import { NextResponse } from 'next/server';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { handleRouteError, readJson } from '@/lib/vocab/server/route';
import { createEntry, listAdminEntries } from '@/lib/vocab/server/libraryService';

// GET /api/admin/vocab-library?q=&status=&cefr=&pos=&topic=&page=&limit=
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const sp = req.nextUrl.searchParams;
    const params = Object.fromEntries(['q', 'status', 'cefr', 'pos', 'topic', 'page', 'limit'].map((k) => [k, sp.get(k) || '']));
    return NextResponse.json(await listAdminEntries(params));
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-library GET');
  }
}

// POST — yangi yozuv (DRAFT)
export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const body = await readJson(req);
    if (!body || typeof body !== 'object') return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    const entry = await createEntry(body, admin._id);
    await writeAuditLog(req, admin._id, 'vocab.library.create', 'VocabularyEntry', entry.id, { word: entry.word });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-library POST');
  }
}
