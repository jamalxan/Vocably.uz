import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedSession, syncExpiry, publicState, ExamError } from '@/lib/exam/server';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

const SECTIONS = ['listening', 'reading', 'writing', 'speaking'];

// exam.py'ning /section/start'i — bo'limning vakolatli taymerini (bir marta)
// ishga tushiradi. Idempotent — allaqachon boshlangan bo'lsa hech narsa qilmaydi.
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { section } = await req.json();
    if (!SECTIONS.includes(section)) return NextResponse.json({ error: "Noto'g'ri bo'lim" }, { status: 400 });

    await connectToDatabase();
    let doc = await getOwnedSession(params.id, userId);
    if (doc.status !== 'in_progress') {
      return NextResponse.json({ error: 'Imtihon faol emas' }, { status: 409 });
    }

    const sec = doc.sections[section];
    if (!sec.startedAt) {
      const start = new Date();
      sec.startedAt = start;
      sec.endsAt = new Date(start.getTime() + sec.duration * 1000);
      doc.markModified('sections');
      await doc.save();
    }

    doc = await syncExpiry(doc);
    return NextResponse.json(publicState(doc.toObject()));
  } catch (err) {
    if (err instanceof ExamError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/section/start');
  }
}
