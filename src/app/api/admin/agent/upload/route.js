import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, checkRateLimit, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AgentAttachment, AgentUploadChunk } from '@/lib/models';
import { detectAttachment, exceedsSizeLimit, humanSize, MAX_BYTES, MAX_TRANSCRIBE_BYTES } from '@/lib/contentAgent/agent/attachmentKind';
import { extractDocumentText } from '@/lib/contentAgent/documentText';
import { uploadAudioBuffer } from '@/lib/exam/audioStorage';
import { uploadImageBuffer } from '@/lib/exam/imageStorage';
import { transcribeAudio } from '@/lib/transcribe';
import { NextResponse } from 'next/server';

// Admin AI chatiga fayl yuklash. Fayl BO'LAK-BO'LAK keladi (klient ~3MB'ga
// bo'lib yuboradi) — sabab: Vercel serverless funksiyasining so'rov tanasi
// ~4.5MB bilan cheklangan, IELTS kitobi PDF'i esa o'nlab MB. Kitob
// pipeline'i (`/api/admin/books`) buni presigned R2 PUT bilan hal qiladi,
// lekin R2 hali sozlanmagan (`R2_*` yo'q) — chat esa BUGUN ishlashi kerak,
// shuning uchun bo'laklar Mongo'da (TTL bilan) yig'iladi va oxirgi bo'lak
// kelganda bitta buferga birlashtiriladi.
//
// Fayl baytlari qayerda qoladi:
//   - hujjat (PDF/DOCX/TXT): HECH QAYERDA — faqat undan AJRATILGAN MATN
//     sahifalarga bo'lingan holda `AgentAttachment.pages`ga yoziladi. Kitob
//     PDF'ining o'zini saqlab qo'yish huquqiy jihatdan ham (LEGAL-01)
//     keraksiz xavf, pipeline esa faqat matnga muhtoj.
//   - audio: GridFS `examAudio` bucket — ya'ni Listening part'iga
//     biriktirilganda fayl KO'CHIRILMAYDI, faqat `audioUrl` yoziladi.
//   - rasm: GridFS `examImages`.
export const maxDuration = 300;

const MAX_CHUNKS = 400; // 400 x 3MB = 1.2GB — amaliy chegara `MAX_BYTES`da

// MongoDB hujjati 16MB bilan cheklangan. IELTS kitobi matni odatda 1-3MB,
// lekin juda katta to'plam (1000+ sahifa) chegaradan oshib ketishi mumkin —
// bunday holda yozuv umuman SAQLANMAY, admin sababini bilmay qolardi.
// Shuning uchun matn ataylab kesiladi va bu chatda AYTILADI.
const MAX_STORED_CHARS = 6_000_000;

function capPages(pages) {
  const kept = [];
  let total = 0;
  for (const page of pages) {
    total += (page.text || '').length;
    if (total > MAX_STORED_CHARS) return { pages: kept, truncated: true };
    kept.push(page);
  }
  return { pages: kept, truncated: false };
}

async function assembleChunks(uploadId, expectedChunks) {
  const chunks = await AgentUploadChunk.find({ uploadId }).sort({ index: 1 }).lean();
  if (chunks.length !== expectedChunks) {
    throw new Error(`Bo'laklar to'liq kelmadi (${chunks.length}/${expectedChunks}) — yuklashni qaytadan boshlang.`);
  }
  const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c.data.buffer || c.data)));
  await AgentUploadChunk.deleteMany({ uploadId });
  return buffer;
}

export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    // Bo'lak-bo'lak yuklash tabiatan ko'p so'rovli — chegara shunga mos
    // (60s oynada 200 ta bo'lak ≈ 600MB, ya'ni amalda faqat suiiste'molni
    // to'xtatadi).
    if (!(await checkRateLimit(admin._id, 'admin-agent-upload', 200))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }

    await connectToDatabase();

    const form = await req.formData();
    const uploadId = String(form.get('uploadId') || '').slice(0, 80);
    const index = Number(form.get('index'));
    const totalChunks = Number(form.get('totalChunks'));
    const filename = String(form.get('filename') || 'fayl').slice(0, 200);
    const mimeType = String(form.get('mimeType') || '');
    const size = Number(form.get('size') || 0);
    const threadId = form.get('threadId') ? String(form.get('threadId')) : null;
    const chunk = form.get('chunk');

    if (!uploadId || !/^[a-zA-Z0-9_-]+$/.test(uploadId)) {
      return NextResponse.json({ error: "uploadId noto'g'ri" }, { status: 400 });
    }
    if (!Number.isInteger(index) || index < 0 || !Number.isInteger(totalChunks) || totalChunks < 1 || totalChunks > MAX_CHUNKS) {
      return NextResponse.json({ error: "Bo'lak raqami noto'g'ri" }, { status: 400 });
    }
    if (!chunk || typeof chunk.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Fayl bo\'lagi yuborilmadi' }, { status: 400 });
    }

    const detected = detectAttachment(filename, mimeType);
    if (detected.kind === 'unsupported') {
      return NextResponse.json({ error: detected.reason, unsupported: true }, { status: 415 });
    }
    if (exceedsSizeLimit(detected.kind, size)) {
      return NextResponse.json(
        { error: `Fayl juda katta (${humanSize(size)}). Bu tur uchun chegara — ${humanSize(MAX_BYTES[detected.kind])}.` },
        { status: 413 }
      );
    }

    const bytes = Buffer.from(await chunk.arrayBuffer());
    await AgentUploadChunk.updateOne(
      { uploadId, index },
      { $set: { data: bytes, createdAt: new Date() } },
      { upsert: true }
    );

    // Oxirgi bo'lak emas — shunchaki tasdiqlaymiz.
    if (index + 1 < totalChunks) {
      return NextResponse.json({ received: index + 1, totalChunks });
    }

    const fileBuffer = await assembleChunks(uploadId, totalChunks);

    const attachment = {
      adminId: admin._id,
      threadId,
      kind: detected.kind,
      filename,
      mimeType,
      bytes: fileBuffer.length,
    };
    const notes = [];

    if (detected.kind === 'document' || detected.kind === 'text') {
      const extracted = await extractDocumentText(fileBuffer, detected.documentFormat);
      if (!extracted.fullText.trim()) {
        return NextResponse.json(
          { error: "Fayldan matn ajratib bo'lmadi — skan qilingan (rasm) PDF bo'lishi mumkin. Matn qatlamli PDF yoki DOCX tashlang." },
          { status: 422 }
        );
      }
      // Faqat `pages` saqlanadi — to'liq matn undan istalgan payt yig'iladi.
      // (Ikkalasini ham saqlash hujjatni ikki barobar shishirardi va
      // MongoDB'ning 16MB hujjat chegarasiga katta kitoblarda tez urilardi.)
      const { pages, truncated } = capPages(extracted.pages);
      attachment.pages = pages;
      attachment.pageCount = extracted.pageCount;
      attachment.hasTextLayer = extracted.hasTextLayer;
      if (truncated) {
        notes.push(
          `Hujjat juda katta — ${pages.length}/${extracted.pageCount} sahifa olindi. Qolganini alohida fayl qilib tashlasangiz, davomini ham joylashtiraman.`
        );
      }
      if (!extracted.hasTextLayer) {
        notes.push("Hujjatda matn juda kam topildi — natija to'liq bo'lmasligi mumkin.");
      }
    } else if (detected.kind === 'audio') {
      attachment.audioFileId = await uploadAudioBuffer(fileBuffer, filename, mimeType || 'audio/mpeg');
      if (fileBuffer.length <= MAX_TRANSCRIBE_BYTES && process.env.GROQ_API_KEY) {
        try {
          attachment.text = await transcribeAudio(fileBuffer, filename, mimeType || 'audio/mpeg');
        } catch (err) {
          notes.push("Audioni matnga o'girib bo'lmadi — qaysi Listening uchun ekanini o'zingiz ko'rsatishingiz kerak bo'ladi.");
        }
      } else {
        notes.push(
          fileBuffer.length > MAX_TRANSCRIBE_BYTES
            ? `Audio ${humanSize(fileBuffer.length)} — avtomatik tekshiruv uchun juda katta (chegara ${humanSize(MAX_TRANSCRIBE_BYTES)}). Qaysi Listening uchun ekanini o'zingiz ko'rsatasiz.`
            : "Transkripsiya sozlanmagan — qaysi Listening uchun ekanini o'zingiz ko'rsatasiz."
        );
      }
    } else if (detected.kind === 'image') {
      attachment.imageFileId = await uploadImageBuffer(fileBuffer, filename, mimeType || 'image/png');
    }

    const doc = await AgentAttachment.create(attachment);
    await writeAuditLog(req, admin._id, 'agent.attachment.upload', 'AgentAttachment', doc._id, {
      filename,
      kind: detected.kind,
      bytes: fileBuffer.length,
    });

    return NextResponse.json({
      attachment: {
        id: String(doc._id),
        kind: doc.kind,
        filename: doc.filename,
        bytes: doc.bytes,
        pageCount: doc.pageCount,
        hasText: !!doc.text || (doc.pages || []).length > 0,
        audioFileId: doc.audioFileId,
        imageFileId: doc.imageFileId,
      },
      notes,
    });
  } catch (err) {
    return serverError(err, 'admin/agent:upload');
  }
}
