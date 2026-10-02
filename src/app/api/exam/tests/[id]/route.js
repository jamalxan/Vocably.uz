import { connectToDatabase } from '@/lib/db';
import { ExamTest } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { TEST_SUMMARY_SELECT, summarizeTest } from '@/lib/exam/testSummary';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §9.2 — Mock intro ekrani ("Cambridge IELTS 19 — Test 1 /
// Academic / Listening 30 daq 40 savol / ...") uchun kerak bo'lgan YENGIL
// metadata. §4 jadvalida bu alohida yo'q — attempt hali YO'Q bosqichda (intro
// attempt yaratilishidan OLDIN ko'rsatiladi, aks holda taymer intro ekranida
// turgan vaqtni ham "yeb qo'yardi"), shuning uchun `/attempts/:id` orqali olib
// bo'lmaydi. Faqat son/vaqt — javob kalitlari bazadan umuman o'qilmaydi
// (proyeksiya: src/lib/exam/testSummary.js).
export async function GET(req, props) {
  const params = await props.params;
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const test = await ExamTest.findById(params.id).select(TEST_SUMMARY_SELECT).lean();
    if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    // Speaking bo'limi bu yo'lda ilgari ko'rsatilmasdi (faqat ro'yxatda) — mavjud mijoz xulqini saqlash uchun olib tashlanadi.
    const { sections, ...rest } = summarizeTest(test);
    const { speaking: _speaking, ...visible } = sections;
    return NextResponse.json({ ...rest, sections: visible });
  } catch (err) {
    return serverError(err, 'exam/tests:get');
  }
}
