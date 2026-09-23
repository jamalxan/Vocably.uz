import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { ReviewItem, ContentBook } from '@/lib/models';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md (AI Content Ingestion Agent) §11.3/§12 — "Tekshiruv
// navbati — eng muhim ekran." Worker ULANMAGANI uchun bu ro'yxat hozircha
// bo'sh turadi (hech kim `ReviewItem` yaratmaydi), lekin endpoint/UI to'liq
// ishlaydi va sinaladi — worker ishga tushirilganda qo'shimcha kod
// o'zgarishisiz to'ldirila boshlaydi.
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');
    const severity = searchParams.get('severity');
    const statusFilter = searchParams.get('status') || 'open';

    const query = {};
    if (bookId) query.bookId = bookId;
    if (severity) query.severity = severity;
    if (statusFilter !== 'all') query.status = statusFilter;

    const items = await ReviewItem.find(query).sort({ severity: 1, createdAt: 1 }).limit(500).lean();
    // N-10 — manually-created `ExamTest` items now have `bookId: null`
    // (`reason: 'content_validator_warning'`, see `reviewSync.ts`).
    // `String(null)` would produce the literal string "null", which would
    // then be fed into `ContentBook.find({ _id: { $in: bookIds } })` and
    // throw a Mongoose CastError (invalid ObjectId) — filter those out first.
    const bookIds = [...new Set(items.filter((i) => i.bookId).map((i) => String(i.bookId)))];
    const books = await ContentBook.find({ _id: { $in: bookIds } }).select('title').lean();
    const titleById = new Map(books.map((b) => [String(b._id), b.title]));

    const countMatch = { status: 'open' };
    if (bookId) countMatch.bookId = new mongoose.Types.ObjectId(bookId);
    const counts = await ReviewItem.aggregate([
      { $match: countMatch },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));

    return NextResponse.json({
      items: items.map((i) => ({
        id: String(i._id),
        bookId: i.bookId ? String(i.bookId) : null,
        bookTitle: i.bookId ? (titleById.get(String(i.bookId)) || '') : '',
        testId: i.testId ? String(i.testId) : null,
        target: i.target,
        reason: i.reason,
        severity: i.severity,
        confidence: i.confidence,
        evidence: i.evidence,
        proposed: i.proposed,
        status: i.status,
        createdAt: i.createdAt,
      })),
      counts: { blocker: countMap.blocker || 0, warning: countMap.warning || 0 },
    });
  } catch (err) {
    return serverError(err, 'admin/review:list');
  }
}
