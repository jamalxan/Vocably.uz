import { connectToDatabase } from '@/lib/db';
import { ExamTest } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { TEST_SUMMARY_SELECT, summarizeTest } from '@/lib/exam/testSummary';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §20 migratsiyasi — standalone Reading/Listening/Writing/
// Speaking sahifalarida foydalanuvchi QAYSI testni mashq qilishni TANLAYDI
// (faqat Mock avtomatik-tasodifiy, §9). Shu tanlash ekrani uchun yengil
// ro'yxat — `/api/exam/tests/[id]`dagi bilan bir xil shakl (javob kalitlari
// qatnashmaydi). Bazadan faqat proyeksiya bilan kerakli maydonlar olinadi
// (src/lib/exam/testSummary.js) — to'liq testlar o'qilmaydi.
export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const tests = await ExamTest.find({ isPublished: true }).select(TEST_SUMMARY_SELECT).sort({ createdAt: 1 }).lean();

    return NextResponse.json({ tests: tests.map(summarizeTest) });
  } catch (err) {
    return serverError(err, 'exam/tests:list');
  }
}
