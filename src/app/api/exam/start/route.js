import { connectToDatabase } from '@/lib/db';
import { ExamSession } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { getMock, publicMock, SECTION_DURATIONS } from '@/lib/exam/content';
import { syncExpiry, publicState } from '@/lib/exam/server';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// exam.py'ning /start'i — yangi sessiya yaratadi, YOKI shu user+mock+mode uchun
// davom etayotgan sessiya bo'lsa o'shani qaytaradi (sahifa yangilansa/qayta
// ochilsa, taymer va javoblar yo'qolmasligi shu orqali ta'minlanadi).
export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { mockId = 'full-8', mode = 'exam' } = await req.json().catch(() => ({}));
    if (!getMock(mockId)) return NextResponse.json({ error: 'Mock topilmadi' }, { status: 404 });
    if (!['exam', 'practice'].includes(mode)) {
      return NextResponse.json({ error: "Noto'g'ri rejim" }, { status: 400 });
    }

    await connectToDatabase();

    let doc = await ExamSession.findOne({ userId, mockId, mode, status: 'in_progress' });
    if (doc) {
      doc = await syncExpiry(doc);
      return NextResponse.json({ content: publicMock(mockId), state: publicState(doc.toObject()) });
    }

    const sections = {};
    for (const [key, duration] of Object.entries(SECTION_DURATIONS)) {
      sections[key] = { startedAt: null, endsAt: null, locked: false, duration };
    }

    doc = await ExamSession.create({
      userId,
      mockId,
      examType: getMock(mockId).exam_type,
      mode,
      status: 'in_progress',
      sections,
      answers: {},
      essays: { task1: '', task2: '' },
      audio: {},
      result: null,
    });

    return NextResponse.json({ content: publicMock(mockId), state: publicState(doc.toObject()) });
  } catch (err) {
    return serverError(err, 'exam/start');
  }
}
