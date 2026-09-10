import { connectToDatabase } from '@/lib/db';
import { ListeningAttempt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { answers, highlights } = await req.json();
    if (!Array.isArray(answers)) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });

    await connectToDatabase();
    const attempt = await ListeningAttempt.findOne({ _id: params.id, userId });
    if (!attempt) return NextResponse.json({ error: 'Mashq topilmadi' }, { status: 404 });
    if (attempt.status === 'completed') return NextResponse.json(buildResult(attempt));

    if (Array.isArray(highlights)) {
      attempt.highlights = highlights
        .filter((h) => h?.text?.trim())
        .map((h) => ({ text: h.text.trim(), note: h.note || '', color: h.color || 'yellow' }));
    }

    attempt.answers = attempt.questions.map((_, i) => answers[i] ?? null);
    attempt.score = attempt.questions.reduce(
      (sum, q, i) => sum + (String(attempt.answers[i] || '').trim() === q.correctAnswer.trim() ? 1 : 0),
      0
    );
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    await attempt.save();

    return NextResponse.json(buildResult(attempt));
  } catch (err) {
    return serverError(err, 'listening/submit');
  }
}

function buildResult(attempt) {
  return {
    score: attempt.score,
    total: attempt.questions.length,
    transcript: attempt.transcript,
    questions: attempt.questions.map((q, i) => ({
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      userAnswer: attempt.answers[i],
      isCorrect: String(attempt.answers[i] || '').trim() === q.correctAnswer.trim(),
    })),
  };
}
