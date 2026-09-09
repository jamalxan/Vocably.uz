import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedSession, ExamError } from '@/lib/exam/server';
import { sectionRemaining } from '@/lib/exam/engine';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// exam.py'ning /essay'i — Writing inshosini autosave qiladi (task1/task2).
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { task, text } = await req.json();
    if (!['task1', 'task2'].includes(task) || typeof text !== 'string') {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    await connectToDatabase();
    const doc = await getOwnedSession(params.id, userId);
    if (doc.status !== 'in_progress') {
      return NextResponse.json({ error: 'Imtihon faol emas' }, { status: 409 });
    }

    if (doc.mode !== 'practice') {
      const sec = doc.sections.writing;
      if (sec.endsAt && sectionRemaining(sec) === 0) {
        return NextResponse.json({ error: "Bo'lim vaqti tugadi" }, { status: 409 });
      }
    }

    doc.essays[task] = text;
    doc.markModified('essays');
    await doc.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ExamError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/essay');
  }
}
