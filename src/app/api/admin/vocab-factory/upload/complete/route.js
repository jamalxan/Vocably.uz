import { NextResponse } from 'next/server';
import { requireAdminUser, checkRateLimit, writeAuditLog } from '@/lib/chatAuth';
import { handleRouteError } from '@/lib/vocab/server/route';
import { completeUpload } from '@/lib/vocab/server/factoryService';

// POST { uploadId, total, filename } — qismlarni yig'ib ish yaratadi. Skanerlangan PDF bo'lsa job.ocr = true
// (matn ishlash paytida OCR qilinadi); aks holda oddiy matn ishi.
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    if (!(await checkRateLimit(admin._id, 'admin-vocab-factory-create', 20))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }
    const body = await req.json().catch(() => null);
    const uploadId = String(body?.uploadId || '');
    const total = Number(body?.total);
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(uploadId) || !Number.isInteger(total) || total < 1) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }
    const job = await completeUpload({ adminId: admin._id, uploadId, total, filename: String(body?.filename || '').slice(0, 160) });
    await writeAuditLog(req, admin._id, 'vocab.factory.create', 'VocabIngestJob', job.id, {
      filename: job.filename,
      chunks: job.chunks.total,
      chars: job.charCount,
      ocr: job.ocr,
      pages: job.pages,
    });
    return NextResponse.json({ job }, { status: 201 });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-factory/upload/complete POST');
  }
}
