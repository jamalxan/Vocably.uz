import { NextResponse } from 'next/server';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { handleRouteError, readJson } from '@/lib/vocab/server/route';
import { importEntries } from '@/lib/vocab/server/libraryService';

// POST { csv?: string, items?: object[], aiGenerated?: boolean } — ommaviy import; hammasi DRAFT / AI_GENERATED
// holatida kiradi (nashr faqat ko'rib chiqishdan keyin). Bulk amal audit logga yoziladi (TZ §30).
export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const body = await readJson(req);
    if (!body || typeof body !== 'object') return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    if (typeof body.csv === 'string' && body.csv.length > 5_000_000) {
      return NextResponse.json({ error: 'Fayl juda katta (maks 5 MB)' }, { status: 413 });
    }
    const result = await importEntries({ csv: body.csv, items: body.items }, admin._id, { aiGenerated: body.aiGenerated === true });
    await writeAuditLog(req, admin._id, 'vocab.library.import', 'VocabularyEntry', null, {
      total: result.total,
      created: result.created,
      duplicates: result.duplicates,
      invalid: result.invalid,
      aiGenerated: body.aiGenerated === true,
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-library/import POST');
  }
}
