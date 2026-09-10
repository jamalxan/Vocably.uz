import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedSession, ExamError } from '@/lib/exam/server';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Haqiqiy IELTS interfeysidagi highlight+note funksiyasi — /api/exam/[id]/answer
// bilan bir xil autosave naqshi (server-authoritative, javoblar backend'da
// saqlanadi, frontend faqat ko'rsatadi). Uch amal: add (yangi belgilash),
// remove (belgini olib tashlash), note (mavjud belgiga eslatma yozish/o'zgartirish).
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, section, text, color, highlightId, note } = body;

    await connectToDatabase();
    const doc = await getOwnedSession(params.id, userId);
    if (doc.status !== 'in_progress') {
      return NextResponse.json({ error: 'Imtihon faol emas' }, { status: 409 });
    }

    if (action === 'add') {
      if (!['reading', 'listening'].includes(section) || !text?.trim()) {
        return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
      }
      doc.highlights.push({ section, text: text.trim(), color: color || 'yellow' });
      await doc.save();
      const added = doc.highlights[doc.highlights.length - 1];
      return NextResponse.json({ ok: true, highlight: added });
    }

    if (action === 'remove') {
      if (!highlightId) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
      doc.highlights = doc.highlights.filter((h) => String(h._id) !== String(highlightId));
      await doc.save();
      return NextResponse.json({ ok: true });
    }

    if (action === 'note') {
      if (!highlightId) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
      const h = doc.highlights.id(highlightId);
      if (!h) return NextResponse.json({ error: 'Belgi topilmadi' }, { status: 404 });
      h.note = (note || '').slice(0, 500);
      await doc.save();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
  } catch (err) {
    if (err instanceof ExamError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/highlight');
  }
}
