import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError, readJson } from '@/lib/vocab/server/route';
import { submitAnswers } from '@/lib/vocab/server/sessionService';

// POST /api/games/sessions/:id/answer — { answers: [{ qid, answer, responseMs, attempt? }] }
// Batch + idempotent: bir (qid, attempt) ikki marta sanalmaydi. Klient "isCorrect"/XP yubormaydi —
// to'g'rilik SERVERda xom javobdan hisoblanadi (TZ §12.2, §39).
export async function POST(req, props) {
  const params = await props.params;
  try {
    const { userId, error } = await requireVocabUser(req, { select: 'role' });
    if (error) return error;
    const body = await readJson(req);
    if (!body || !Array.isArray(body.answers)) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    const out = await submitAnswers({
      userId,
      sessionId: params.id,
      answers: body.answers.map((a) => ({
        qid: a?.qid,
        answer: a?.answer,
        responseMs: a?.responseMs,
        attempt: a?.attempt,
      })),
    });
    return NextResponse.json(out);
  } catch (err) {
    return handleRouteError(err, 'games/answer');
  }
}
