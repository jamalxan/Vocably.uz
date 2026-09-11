import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedAttempt, ExamAttemptError } from '@/lib/exam/attemptServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §6.3 / §19 Faza 3 item 19 — "Matn belgilash va eslatma".
// Old-engine'dagi `/api/exam/[id]/highlight`ning naqshiga o'xshash (action:
// add/remove/note), lekin YANGI engine'ning offset-based saqlash formatiga
// mos (§6.3'dagi `Highlight` interfeysi — TreeWalker orqali hisoblangan
// `paragraphIndex`/`startOffset`/`endOffset`, DOM qayta chizilganda aniq
// `Range` tiklash uchun; eski engine oddiy matn saqlaydi, bu yerda YETARLI
// EMAS edi — chunki bir xil matn bir paragrafda bir necha marta uchrashi
// mumkin).
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const attempt = await getOwnedAttempt(params.id, userId);
    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ error: 'Urinish faol emas' }, { status: 409 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, passageOrder, paragraphIndex, startOffset, endOffset, note, highlightId } = body;

    if (action === 'add') {
      if (
        typeof passageOrder !== 'number' ||
        typeof paragraphIndex !== 'number' ||
        typeof startOffset !== 'number' ||
        typeof endOffset !== 'number' ||
        endOffset <= startOffset
      ) {
        return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
      }
      attempt.highlights.push({ passageOrder, paragraphIndex, startOffset, endOffset, note: '' });
      await attempt.save();
      const added = attempt.highlights[attempt.highlights.length - 1];
      return NextResponse.json({ highlight: { id: String(added._id), passageOrder, paragraphIndex, startOffset, endOffset, note: '' } });
    }

    if (action === 'remove') {
      if (!highlightId) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
      attempt.highlights = attempt.highlights.filter((h) => String(h._id) !== String(highlightId));
      await attempt.save();
      return NextResponse.json({ ok: true });
    }

    if (action === 'note') {
      if (!highlightId) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
      const h = attempt.highlights.id(highlightId);
      if (!h) return NextResponse.json({ error: 'Belgi topilmadi' }, { status: 404 });
      h.note = String(note || '').slice(0, 500);
      await attempt.save();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:highlight');
  }
}
