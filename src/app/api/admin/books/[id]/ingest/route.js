import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { ContentBook, IngestJob } from '@/lib/models';
import { enqueueIngestJob } from '@/lib/queue/contentQueue';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// TZ-vocably-v2.md (AI Content Ingestion Agent) §7/§12/§13/§19 M1 — "job
// navbatga tushadi". BU FAQAT NAVBATGA QO'YISH: haqiqiy ishlov berish (ffmpeg,
// PDF tahlili, OpenRouter chaqiruvlari) alohida Docker worker'da bo'ladi
// (TZ §3.1 — Vercel'da ISHLAMAYDI, 300s limit + ffmpeg/poppler yo'q).
//
// AUDIT AI-01 (VOCABLY_TZ_FINAL... 2026-09-20 §13, "Redis / managed queue")
// — bu yerda endi `enqueueIngestJob` orqali Redis (BullMQ, `contentQueue.js`)
// navbatiga HAM yozib qo'yiladi, worker esa ATAYLAB HALI QURILMAGAN
// (foydalanuvchi bilan kelishilgan: "Redis bilan davom et, worker keyinroq").
// `REDIS_URL` sozlanmagan bo'lsa `enqueueIngestJob` jim `{queued:false}`
// qaytaradi va Mongo `IngestJob` baribir "queued" holida saqlanadi — bu
// funksionallik hech qanday sharoitda YO'QOLMAYDI, faqat Redis mavjud
// bo'lganda QO'SHIMCHA ravishda ishga tayyor navbat xabari ham paydo bo'ladi.
// Buni "succeeded" deb ko'rsatish HALI HAM YOLG'ON bo'lardi (worker yo'q).
const STAGES = [
  'extract', 'segment', 'split_sections', 'parse_reading', 'parse_listening',
  'parse_writing', 'parse_speaking', 'parse_answerkey', 'extract_images',
  'process_audio', 'assemble', 'validate', 'qa',
];

export async function POST(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const book = await ContentBook.findById(params.id);
    if (!book) return NextResponse.json({ error: 'Kitob topilmadi' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const requestedStages = Array.isArray(body.stages) && body.stages.length > 0 ? body.stages : STAGES;
    const invalid = requestedStages.filter((s) => !STAGES.includes(s));
    if (invalid.length > 0) {
      return NextResponse.json({ error: `Noto'g'ri bosqich(lar): ${invalid.join(', ')}` }, { status: 400 });
    }

    const jobs = [];
    let redisQueued = 0;
    for (const stage of requestedStages) {
      const idempotencyKey = crypto
        .createHash('sha256')
        .update(`${book._id}:${stage}:${book.updatedAt.toISOString()}`)
        .digest('hex');
      // TZ §5.3 item 3 — bir xil kirish uchun mavjud job qaytariladi (qayta
      // ishlov berish bepul/kesh) — allaqachon navbatda/ishlab turgan bosqich
      // uchun ikkinchi nusxa yaratilmaydi.
      let job = await IngestJob.findOne({ idempotencyKey });
      if (!job) {
        job = await IngestJob.create({ bookId: book._id, stage, status: 'queued', idempotencyKey });
      }
      jobs.push(job);

      // Redis navbatiga ham yoziladi (AI-01) — `jobId: idempotencyKey` bo'lgani
      // uchun bu ham xavfsiz takrorlanadi: mavjud (findOne bilan topilgan) job
      // uchun qayta chaqirilsa ham BullMQ dublikat yaratmaydi.
      const { queued } = await enqueueIngestJob({ ingestJobId: job._id, bookId: book._id, stage, idempotencyKey });
      if (queued) redisQueued += 1;
    }

    book.status = 'processing';
    book.progress = { stage: requestedStages[0], percent: 0, message: 'Navbatga qo\'yildi — worker ulanishini kutmoqda' };
    book.updatedAt = new Date();
    await book.save();

    await writeAuditLog(req, admin._id, 'content_book.ingest', 'ContentBook', book._id, { stages: requestedStages });

    return NextResponse.json({
      queued: jobs.length,
      jobs: jobs.map((j) => ({ id: String(j._id), stage: j.stage, status: j.status })),
      note:
        redisQueued > 0
          ? `Redis navbatiga ${redisQueued}/${jobs.length} bosqich qo'yildi — worker hali ulanmagan, ishga tushirilganda shu navbatdan davom etadi.`
          : "Redis ulanmagan (REDIS_URL yo'q) — bosqichlar faqat Mongo'da 'queued' holatida kutadi.",
    });
  } catch (err) {
    return serverError(err, 'admin/books:ingest');
  }
}
