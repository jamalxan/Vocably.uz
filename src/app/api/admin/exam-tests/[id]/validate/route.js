import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { ExamTest } from '@/lib/models';
import { validateTest, hasBlockingErrors } from '@/lib/exam/contentValidator';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §12 — "POST /api/admin/exam-tests/:id/validate →
// validatsiyani qayta ishga tushirish." `PATCH .../:id` faqat `isPublished:
// true` yuborilganda validatsiya qiladi (yon ta'sir — testni haqiqatan ham
// nashr qiladi); bu endpoint esa HECH NARSANI o'zgartirmasdan, faqat joriy
// holatni tekshirib ko'rish uchun — admin "Nashr qilish"ni bosishdan oldin
// blocker/warning sonini oldindan bilmoqchi bo'lsa ishlatiladi.
export async function POST(req, { params }) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const test = await ExamTest.findById(params.id).lean();
    if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    const issues = validateTest(test);
    return NextResponse.json({ issues, blockers: hasBlockingErrors(issues) });
  } catch (err) {
    return serverError(err, 'admin/exam-tests:id/validate');
  }
}
