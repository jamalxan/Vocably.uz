import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedSession, ExamError } from '@/lib/exam/server';
import { sectionOfQuestion, answerKey } from '@/lib/exam/content';
import { sectionRemaining } from '@/lib/exam/engine';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// exam.py'ning /answer'i — bitta javobni darhol saqlaydi (autosave). Bo'lim vaqti
// tugagan bo'lsa rad etiladi. "practice" rejimida — TZ §11.3: to'g'ri javob
// darhol qaytadi (shu javobga).
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { questionId, value } = await req.json();
    if (!questionId) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });

    await connectToDatabase();
    const doc = await getOwnedSession(params.id, userId);
    if (doc.status !== 'in_progress') {
      return NextResponse.json({ error: 'Imtihon faol emas' }, { status: 409 });
    }

    const section = sectionOfQuestion(doc.mockId, questionId);
    if (section && doc.mode !== 'practice') {
      const sec = doc.sections[section];
      if (sec.endsAt && sectionRemaining(sec) === 0) {
        return NextResponse.json({ error: "Bo'lim vaqti tugadi" }, { status: 409 });
      }
    }

    doc.answers = { ...doc.answers, [questionId]: value };
    doc.markModified('answers');
    await doc.save();

    const body = { ok: true, saved: questionId };
    if (doc.mode === 'practice' && section) {
      const correct = answerKey(doc.mockId, section)[questionId];
      body.correct = correct;
      body.isCorrect = value === correct;
    }
    return NextResponse.json(body);
  } catch (err) {
    if (err instanceof ExamError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/answer');
  }
}
