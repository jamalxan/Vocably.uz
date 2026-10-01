import { NextResponse } from 'next/server';
import { requireAdminUser, checkRateLimit, writeAuditLog } from '@/lib/chatAuth';
import { handleRouteError } from '@/lib/vocab/server/route';
import { createJob, formatFromName, listJobs } from '@/lib/vocab/server/factoryService';

// Vercel serverless so'rov hajmi chegarasi (~4.5 MB) — kattaroq kitoblar bo'limlarga bo'lib yoki matn sifatida yuklanadi.
const MAX_FILE_BYTES = 4 * 1024 * 1024;

export const maxDuration = 60;

// GET — oxirgi ishlar (holat/progress bilan)
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    return NextResponse.json({ jobs: await listJobs() });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-factory GET');
  }
}

// POST — yangi ish: multipart (file) yoki JSON ({ text, filename }). Matn ajratiladi va bo'laklanadi;
// AI qayta ishlash alohida (/[id]/run) — navbat bo'laklari bo'yicha davom ettiriladi.
export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    if (!(await checkRateLimit(admin._id, 'admin-vocab-factory-create', 20))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }

    let args;
    const type = req.headers.get('content-type') || '';
    if (type.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');
      if (!file || typeof file.arrayBuffer !== 'function') return NextResponse.json({ error: 'Fayl yuborilmadi' }, { status: 400 });
      const format = formatFromName(file.name);
      if (!format) return NextResponse.json({ error: "Faqat PDF, DOCX yoki TXT fayllar qo'llab-quvvatlanadi" }, { status: 415 });
      if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: 'Fayl juda katta (maks 4 MB). Bo\'limlarga bo\'lib yuklang.' }, { status: 413 });
      args = { filename: file.name, format, buffer: Buffer.from(await file.arrayBuffer()) };
    } else {
      const body = await req.json().catch(() => null);
      if (!body || typeof body.text !== 'string') return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
      args = { filename: String(body.filename || 'matn').slice(0, 160), format: 'text', text: body.text };
    }

    const job = await createJob({ adminId: admin._id, ...args });
    await writeAuditLog(req, admin._id, 'vocab.factory.create', 'VocabIngestJob', job.id, {
      filename: job.filename,
      chunks: job.chunks.total,
      chars: job.charCount,
    });
    return NextResponse.json({ job }, { status: 201 });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-factory POST');
  }
}
