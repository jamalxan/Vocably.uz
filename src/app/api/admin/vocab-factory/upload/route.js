import { NextResponse } from 'next/server';
import { requireAdminUser, checkRateLimit } from '@/lib/chatAuth';
import { handleRouteError } from '@/lib/vocab/server/route';
import { storeUploadPart } from '@/lib/vocab/server/factoryService';
import { validatePart } from '@/lib/vocab/uploadParts';

// POST multipart { uploadId, index, total, file } — katta fayl qismi (Vercel ~4.5 MB so'rov chegarasi: qism ≤ 3 MB).
// Qismlar vaqtincha saqlanadi; hammasi kelgach /upload/complete faylni yig'adi.
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    if (!(await checkRateLimit(admin._id, 'admin-vocab-factory-part', 120))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }
    const form = await req.formData().catch(() => null);
    const file = form?.get('file');
    if (!file || typeof file.arrayBuffer !== 'function') return NextResponse.json({ error: 'Qism yuborilmadi' }, { status: 400 });

    const check = validatePart({ uploadId: form.get('uploadId'), index: form.get('index'), total: form.get('total'), size: file.size });
    if (!check.ok) return NextResponse.json({ error: check.error, code: check.code }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    await storeUploadPart({ adminId: admin._id, uploadId: check.meta.uploadId, index: check.meta.index, buffer });
    return NextResponse.json({ success: true, index: check.meta.index });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-factory/upload POST');
  }
}
