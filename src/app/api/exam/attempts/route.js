import { connectToDatabase } from '@/lib/db';
import { ExamTest, ExamAttempt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

const VALID_SECTIONS = ['listening', 'reading', 'writing', 'speaking'];

// TZ-vocably-v2.md §4 (IELTS CD Exam Engine v1.0) — "POST /attempts — Yangi
// urinish. Body: {testId, mode, sections}. Javob: {attemptId}".
//
// Faza 1 doirasida faqat `mode: 'section'` (bitta bo'lim, mashq rejimi kabi)
// ishlaydi — `mode: 'mock'` (bir nechta bo'lim, bir tomonlama o'tish) TZ §9
// orkestratsiyasi Faza 3 ishi (TZ §19). Shu bo'lim uchun allaqachon davom
// etayotgan urinish bo'lsa (sahifa yangilansa) O'SHANI qaytaramiz — yangisini
// yaratmaymiz, aks holda taymer va javoblar yo'qolib, chalkash holatga tushadi.
export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { testId, mode = 'section', section } = await req.json().catch(() => ({}));
    if (!testId) return NextResponse.json({ error: "testId shart" }, { status: 400 });
    if (mode !== 'section') {
      return NextResponse.json({ error: "Faza 1'da faqat mode:'section' qo'llab-quvvatlanadi" }, { status: 400 });
    }
    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: "Noto'g'ri bo'lim" }, { status: 400 });
    }

    await connectToDatabase();

    const test = await ExamTest.findById(testId).lean();
    if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });
    const sectionContent = test.sections?.[section];
    if (!sectionContent) return NextResponse.json({ error: `Testda ${section} bo'limi yo'q` }, { status: 400 });

    const existing = await ExamAttempt.findOne({
      userId,
      testId,
      currentSection: section,
      status: 'in_progress',
    });
    if (existing) return NextResponse.json({ attemptId: String(existing._id) });

    const now = new Date();
    const attempt = await ExamAttempt.create({
      userId,
      testId,
      mode: 'section',
      sections: [section],
      currentSection: section,
      status: 'in_progress',
      startedAt: now,
      sectionStartedAt: now,
      endsAt: new Date(now.getTime() + sectionContent.durationSec * 1000),
      answers: {},
      flagged: [],
      lastQuestion: 0,
    });

    return NextResponse.json({ attemptId: String(attempt._id) });
  } catch (err) {
    return serverError(err, 'exam/attempts:create');
  }
}
