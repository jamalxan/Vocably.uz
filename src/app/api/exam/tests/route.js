import { connectToDatabase } from '@/lib/db';
import { ExamTest } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §20 migratsiyasi — standalone Reading/Listening/Writing/
// Speaking sahifalarida foydalanuvchi QAYSI testni mashq qilishni TANLAYDI
// (faqat Mock avtomatik-tasodifiy, §9). Shu tanlash ekrani uchun yengil
// ro'yxat — `/api/exam/tests/[id]`dagi bilan bir xil shakl (javob kalitlari
// qatnashmaydi), faqat bir nechta test uchun.
function countQuestions(containers) {
  return (containers || []).reduce(
    (sum, c) => sum + (c.questionGroups || []).reduce((s, g) => s + (g.questions || []).length, 0),
    0
  );
}

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const tests = await ExamTest.find({ isPublished: true }).sort({ createdAt: 1 }).lean();

    const list = tests.map((test) => {
      const sections = {};
      if (test.sections?.listening) {
        sections.listening = {
          durationSec: test.sections.listening.durationSec,
          questionCount: countQuestions(test.sections.listening.parts),
        };
      }
      if (test.sections?.reading) {
        sections.reading = {
          durationSec: test.sections.reading.durationSec,
          questionCount: countQuestions(test.sections.reading.passages),
        };
      }
      if (test.sections?.writing) {
        sections.writing = {
          durationSec: test.sections.writing.durationSec,
          taskCount: (test.sections.writing.tasks || []).length,
        };
      }
      if (test.sections?.speaking) {
        sections.speaking = { durationSec: test.sections.speaking.durationSec };
      }

      return {
        id: String(test._id),
        title: test.title,
        module: test.module,
        sections,
      };
    });

    return NextResponse.json({ tests: list });
  } catch (err) {
    return serverError(err, 'exam/tests:list');
  }
}
