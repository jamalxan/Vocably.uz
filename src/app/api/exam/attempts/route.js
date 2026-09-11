import { connectToDatabase } from '@/lib/db';
import { ExamTest, ExamAttempt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

const VALID_SECTIONS = ['listening', 'reading', 'writing', 'speaking'];
// TZ §9.1 — Mock'da bo'limlar shu ketma-ketlikda (attemptServer.ts'dagi bilan
// bir xil — Speaking Faza 3'dan tashqarida).
const MOCK_SECTION_ORDER = ['listening', 'reading', 'writing'];

// TZ-vocably-v2.md §4 (IELTS CD Exam Engine v1.0) — "POST /attempts — Yangi
// urinish. Body: {testId, mode, sections}. Javob: {attemptId}".
//
// `mode: 'section'` — bitta bo'lim (mashq rejimi kabi, Faza 1/2). `mode: 'mock'`
// — testda mavjud bo'lgan listening/reading/writing bo'limlarining BARCHASI,
// TZ §9.1 tartibida, bitta attempt ichida ketma-ket (§19 Faza 3 item 15).
// Ikkala holatda ham allaqachon davom etayotgan mos urinish bo'lsa (sahifa
// yangilansa) O'SHANI qaytaramiz — yangisini yaratmaymiz, aks holda taymer va
// javoblar yo'qolib, chalkash holatga tushadi.
export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { testId, mode = 'section', section } = await req.json().catch(() => ({}));
    if (!testId) return NextResponse.json({ error: 'testId shart' }, { status: 400 });
    if (!['section', 'mock'].includes(mode)) {
      return NextResponse.json({ error: "mode faqat 'section' yoki 'mock' bo'lishi mumkin" }, { status: 400 });
    }

    await connectToDatabase();
    const test = await ExamTest.findById(testId).lean();
    if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    if (mode === 'mock') {
      const sections = MOCK_SECTION_ORDER.filter((key) => test.sections?.[key]);
      if (sections.length === 0) {
        return NextResponse.json({ error: "Testda listening/reading/writing bo'limlaridan birontasi yo'q" }, { status: 400 });
      }

      const existing = await ExamAttempt.findOne({ userId, testId, mode: 'mock', status: 'in_progress' });
      if (existing) return NextResponse.json({ attemptId: String(existing._id) });

      const firstSection = sections[0];
      const now = new Date();
      const attempt = await ExamAttempt.create({
        userId,
        testId,
        mode: 'mock',
        sections,
        currentSection: firstSection,
        status: 'in_progress',
        startedAt: now,
        sectionStartedAt: now,
        endsAt: new Date(now.getTime() + test.sections[firstSection].durationSec * 1000),
        answers: {},
        flagged: [],
        lastQuestion: 0,
      });

      return NextResponse.json({ attemptId: String(attempt._id) });
    }

    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: "Noto'g'ri bo'lim" }, { status: 400 });
    }
    const sectionContent = test.sections?.[section];
    if (!sectionContent) return NextResponse.json({ error: `Testda ${section} bo'limi yo'q` }, { status: 400 });

    const existing = await ExamAttempt.findOne({
      userId,
      testId,
      currentSection: section,
      mode: 'section',
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
