import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { ContentBook, ContentAsset } from '@/lib/models';
import { validateSourceUpload, buildSourceKey, presignSourceUpload } from '@/lib/storage/r2';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md (AI Content Ingestion Agent) §11.1/§12/§21 M1 — "1-qadam:
// Fayllar". Kitob hujjati + PDF/audio uchun presigned PUT URL'lar bitta
// so'rovda qaytariladi (klient to'g'ridan-to'g'ri R2'ga yuklaydi, TZ §4.3 —
// fayl Next.js serveri orqali o'TMAYDI, Vercel body limitidan qochish uchun).
//
// §16 — huquqiy himoya: `licence:'third_party_copyright'` + `publishScope:
// 'public'` kombinatsiyasi shu yerda 403 bilan bloklanadi, UI'dan mustaqil
// (kimdir to'g'ridan-to'g'ri API'ga so'rov yuborsa ham himoyalangan bo'lsin).
export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const body = await req.json().catch(() => ({}));
    const {
      title,
      publisher = '',
      series = '',
      volume = null,
      module = 'academic',
      licence,
      licenceNote = '',
      publishScope = 'private',
      pdf, // { mimeType, size }
      audio = [], // [{ mimeType, size }]
    } = body;

    if (!title || !licence) {
      return NextResponse.json({ error: "title va licence majburiy" }, { status: 400 });
    }
    if (licence === 'third_party_copyright' && publishScope === 'public') {
      return NextResponse.json(
        { error: "Uchinchi tomon mualliflik huquqidagi kitobni ommaviy (public) nashr qilib bo'lmaydi." },
        { status: 403 }
      );
    }
    if (!pdf?.mimeType || !pdf?.size) {
      return NextResponse.json({ error: 'PDF fayl ma\'lumoti (mimeType, size) majburiy' }, { status: 400 });
    }
    const pdfValidationError = validateSourceUpload('pdf', pdf.mimeType, pdf.size);
    if (pdfValidationError) return NextResponse.json({ error: pdfValidationError }, { status: 400 });
    for (const a of audio) {
      const err = validateSourceUpload('audio', a.mimeType, a.size);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }

    const book = await ContentBook.create({
      title,
      publisher,
      series,
      volume,
      module,
      licence,
      licenceNote,
      publishScope,
      status: 'uploaded',
      createdBy: admin._id,
    });

    // PDF uchun bitta ContentAsset + presigned PUT URL.
    const pdfKey = buildSourceKey(book._id, 'pdf', pdf.mimeType);
    const pdfAsset = await ContentAsset.create({
      bookId: book._id,
      kind: 'pdf',
      storage: { bucket: process.env.R2_BUCKET || '', key: pdfKey, bytes: pdf.size, contentType: pdf.mimeType },
    });
    book.source.pdfAssetId = pdfAsset._id;
    await book.save();
    const pdfUploadUrl = await presignSourceUpload(pdfKey, pdf.mimeType);

    // Har audio fayl uchun ham xuddi shunday — asset + presigned URL.
    const audioUploads = [];
    for (const a of audio) {
      const key = buildSourceKey(book._id, 'audio', a.mimeType);
      const asset = await ContentAsset.create({
        bookId: book._id,
        kind: 'audio',
        storage: { bucket: process.env.R2_BUCKET || '', key, bytes: a.size, contentType: a.mimeType },
      });
      const uploadUrl = await presignSourceUpload(key, a.mimeType);
      audioUploads.push({ assetId: String(asset._id), key, uploadUrl, filename: a.filename || '' });
    }

    await writeAuditLog(req, admin._id, 'content_book.create', 'ContentBook', book._id, { title, licence, publishScope });

    return NextResponse.json({
      bookId: String(book._id),
      uploadUrls: {
        pdf: { assetId: String(pdfAsset._id), key: pdfKey, uploadUrl: pdfUploadUrl },
        audio: audioUploads,
      },
    });
  } catch (err) {
    return serverError(err, 'admin/books:create');
  }
}

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const licenceFilter = searchParams.get('licence');
    const query = {};
    if (statusFilter) query.status = statusFilter;
    if (licenceFilter) query.licence = licenceFilter;

    const books = await ContentBook.find(query).sort({ createdAt: -1 }).limit(200).lean();

    return NextResponse.json({
      books: books.map((b) => ({
        id: String(b._id),
        title: b.title,
        publisher: b.publisher,
        module: b.module,
        licence: b.licence,
        publishScope: b.publishScope,
        status: b.status,
        progress: b.progress,
        detected: { testsCount: (b.detected?.tests || []).length, generatedTestsCount: (b.detected?.generatedTestIds || []).length },
        stats: b.stats,
        createdAt: b.createdAt,
      })),
    });
  } catch (err) {
    return serverError(err, 'admin/books:list');
  }
}
