import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { normalizeAnswers, isComplete, toUserUpdate, planSummary } from '@/lib/onboarding';

// Vocably 2.0 onboarding (TZ 2.0 §6.1). The quiz itself runs on the public /start page
// before signup; once the user is logged in the browser posts the saved answers here.

const SELECT = 'goal examType targetBand examDate examDateEstimated currentLevel dailyStudyMinutes weakestSkill onboardingCompletedAt vocabOnboarding';

export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();
    const u = await User.findById(userId).select(SELECT).lean();
    if (!u) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    // Older accounts filled these fields on the profile page before onboarding existed —
    // treat them as onboarded so they aren't nagged.
    const legacyOnboarded = !!(u.targetBand && u.examDate && u.dailyStudyMinutes);
    return NextResponse.json({
      completed: !!u.onboardingCompletedAt || legacyOnboarded,
      completedAt: u.onboardingCompletedAt || null,
    });
  } catch (err) {
    return serverError(err, 'onboarding:get');
  }
}

export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "So'rov noto'g'ri" }, { status: 400 });
    }
    const answers = normalizeAnswers(body?.answers);
    if (!isComplete(answers)) {
      return NextResponse.json({ error: "Savollarga to'liq javob berilmagan" }, { status: 400 });
    }
    await connectToDatabase();
    const now = new Date();
    const res = await User.updateOne({ _id: userId }, { $set: toUserUpdate(answers, now) });
    if (!res.matchedCount) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    return NextResponse.json({ success: true, summary: planSummary(answers, now) });
  } catch (err) {
    return serverError(err, 'onboarding:post');
  }
}
