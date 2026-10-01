import { NextResponse } from 'next/server';
import { User } from '@/lib/models';
import { requireVocabUser, handleRouteError, readJson } from '@/lib/vocab/server/route';
import { buildDiagnostic, scoreDiagnostic } from '@/lib/vocab/diagnostic';

// Onboarding diagnostic (TZ §63–64). Hech qachon bloklamaydi: o'tkazib yuborish mumkin.

// GET — savollar (javoblarsiz) + joriy holat.
export async function GET(req) {
  try {
    const { user, userId, error } = await requireVocabUser(req, { select: 'vocabOnboarding' });
    if (error) return error;
    const questions = buildDiagnostic(userId).map(({ id, word, level, options }) => ({ id, word, level, options }));
    return NextResponse.json({ status: user.vocabOnboarding || {}, questions });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/diagnostic:get');
  }
}

// POST — { answers: [{id, choice|null}] } yoki { skip: true }.
export async function POST(req) {
  try {
    const { userId, error } = await requireVocabUser(req, { select: '_id' });
    if (error) return error;
    const body = (await readJson(req)) || {};
    if (body.skip) {
      await User.updateOne({ _id: userId }, { $set: { 'vocabOnboarding.skippedAt': new Date() } });
      return NextResponse.json({ skipped: true });
    }
    if (!Array.isArray(body.answers) || body.answers.length > 100) {
      return NextResponse.json({ error: "Javoblar noto'g'ri" }, { status: 400 });
    }
    const answers = body.answers
      .filter((a) => a && typeof a.id === 'string' && (a.choice === null || typeof a.choice === 'string'))
      .map((a) => ({ id: a.id.slice(0, 40), choice: a.choice === null ? null : a.choice.slice(0, 200) }));
    const result = scoreDiagnostic(userId, answers);
    await User.updateOne(
      { _id: userId },
      { $set: { 'vocabOnboarding.completedAt': new Date(), 'vocabOnboarding.estimatedLevel': result.level, 'vocabOnboarding.estimatedScore': result.score } }
    );
    return NextResponse.json({ result });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/diagnostic:post');
  }
}
