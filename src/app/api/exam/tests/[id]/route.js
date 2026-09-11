import { connectToDatabase } from '@/lib/db';
import { ExamTest } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §9.2 — Mock intro ekrani ("Cambridge IELTS 19 — Test 1 /
// Academic / Listening 30 daq 40 savol / ...") uchun kerak bo'lgan YENGIL
// metadata. §4 jadvalida bu alohida yo'q — attempt hali YO'Q bosqichda (intro
// attempt yaratilishidan OLDIN ko'rsatiladi, aks holda taymer intro ekranida
// turgan vaqtni ham "yeb qo'yardi"), shuning uchun `/attempts/:id` orqali olib
// bo'lmaydi. Faqat son/vaqt — javob kalitlari umuman qatnashmaydi (sanitize
// shart emas, lekin baribir yo'q — schema'da `answer` shu yerda o'qilmaydi ham).
export async function GET(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const test = await ExamTest.findById(params.id).lean();
    if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    const countQuestions = (containers) =>
      (containers || []).reduce(
        (sum, c) => sum + (c.questionGroups || []).reduce((s, g) => s + (g.questions || []).length, 0),
        0
      );

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

    return NextResponse.json({
      id: String(test._id),
      title: test.title,
      module: test.module,
      sections,
    });
  } catch (err) {
    return serverError(err, 'exam/tests:get');
  }
}
