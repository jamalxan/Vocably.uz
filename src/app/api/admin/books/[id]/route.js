import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { ContentBook, ContentAsset, IngestJob } from '@/lib/models';
import { deleteSourceObject } from '@/lib/storage/r2';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const book = await ContentBook.findById(params.id).lean();
    if (!book) return NextResponse.json({ error: 'Kitob topilmadi' }, { status: 404 });

    const assets = await ContentAsset.find({ bookId: book._id }).select('kind storage.key storage.bytes storage.contentType audio.durationMs createdAt').lean();
    const jobs = await IngestJob.find({ bookId: book._id }).select('stage status attempt metrics.startedAt metrics.finishedAt metrics.costUsd error.message').sort({ createdAt: 1 }).lean();

    return NextResponse.json({
      book: { ...book, id: String(book._id), _id: undefined },
      assets: assets.map((a) => ({ id: String(a._id), kind: a.kind, bytes: a.storage.bytes, contentType: a.storage.contentType, durationMs: a.audio?.durationMs ?? null, createdAt: a.createdAt })),
      jobs: jobs.map((j) => ({ id: String(j._id), stage: j.stage, status: j.status, attempt: j.attempt, startedAt: j.metrics?.startedAt, finishedAt: j.metrics?.finishedAt, costUsd: j.metrics?.costUsd, errorMessage: j.error?.message })),
    });
  } catch (err) {
    return serverError(err, 'admin/books:get');
  }
}

export async function PATCH(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const book = await ContentBook.findById(params.id);
    if (!book) return NextResponse.json({ error: 'Kitob topilmadi' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const { title, publisher, series, volume, module, licence, licenceNote, publishScope } = body;

    const nextLicence = licence ?? book.licence;
    const nextScope = publishScope ?? book.publishScope;
    if (nextLicence === 'third_party_copyright' && nextScope === 'public') {
      return NextResponse.json(
        { error: "Uchinchi tomon mualliflik huquqidagi kitobni ommaviy (public) nashr qilib bo'lmaydi." },
        { status: 403 }
      );
    }

    if (title !== undefined) book.title = title;
    if (publisher !== undefined) book.publisher = publisher;
    if (series !== undefined) book.series = series;
    if (volume !== undefined) book.volume = volume;
    if (module !== undefined) book.module = module;
    if (licence !== undefined) book.licence = licence;
    if (licenceNote !== undefined) book.licenceNote = licenceNote;
    if (publishScope !== undefined) book.publishScope = publishScope;
    book.updatedAt = new Date();
    await book.save();

    await writeAuditLog(req, admin._id, 'content_book.update', 'ContentBook', book._id, body);

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'admin/books:update');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const book = await ContentBook.findById(params.id);
    if (!book) return NextResponse.json({ error: 'Kitob topilmadi' }, { status: 404 });

    // Kaskad: R2'dagi haqiqiy fayllar ham o'chiriladi (chat media'dan farqli
    // — bu yerda "yumshoq o'chirish" audit talabi yo'q, kitob manbasi shaxsiy
    // ma'lumot emas). Bitta faylning o'chirilmay qolishi butun so'rovni
    // to'xtatmasin uchun har biri alohida try/catch bilan.
    const assets = await ContentAsset.find({ bookId: book._id }).select('storage.key').lean();
    for (const a of assets) {
      try {
        await deleteSourceObject(a.storage.key);
      } catch (err) {
        console.error('[admin/books:delete] R2 obyektini o\'chirishda xatolik', a.storage.key, err);
      }
    }
    await ContentAsset.deleteMany({ bookId: book._id });
    await IngestJob.deleteMany({ bookId: book._id });
    await book.deleteOne();

    await writeAuditLog(req, admin._id, 'content_book.delete', 'ContentBook', params.id, { title: book.title });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'admin/books:delete');
  }
}
