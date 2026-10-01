import { NextResponse } from 'next/server';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { handleRouteError, readJson } from '@/lib/vocab/server/route';
import { transitionEntry } from '@/lib/vocab/server/libraryService';

// POST { to: 'UNDER_REVIEW'|'APPROVED'|'REJECTED'|'PUBLISHED'|'ARCHIVED'|'DRAFT', note? }
export async function POST(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { id } = await params;
    const body = await readJson(req);
    if (!body || typeof body.to !== 'string') return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    const entry = await transitionEntry(id, body.to, admin._id, body.note);
    await writeAuditLog(req, admin._id, 'vocab.library.status', 'VocabularyEntry', id, { to: entry.status, word: entry.word });
    return NextResponse.json({ entry });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-library/[id]/status POST');
  }
}
