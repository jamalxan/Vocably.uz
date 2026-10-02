import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { ExamAttempt, User } from '@/lib/models';
import { resolveTestForAttempt } from '@/lib/exam/attemptServer';
import { wrongQuestions } from '@/lib/exam/mistakes';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Mistake notebook: recent wrong Reading/Listening answers (question, your
// answer, the accepted answer) and the words collected from them for SRS
// review. Derived from graded attempts — nothing extra is stored.
const CATEGORY = "Xato asosida qo'shilgan so'zlar";

export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();

    const attempts = await ExamAttempt.find({ userId, status: 'graded', sections: { $in: ['reading', 'listening'] } })
      .sort({ submittedAt: -1 })
      .limit(15)
      .select('testId testVersionId mode submittedAt result.perQuestion')
      .lean();

    const items = [];
    for (const a of attempts) {
      const test = await resolveTestForAttempt(a);
      if (!test) continue;
      for (const m of wrongQuestions(test, a.result?.perQuestion || [])) {
        items.push({ ...m, attemptId: String(a._id), testTitle: test.title || '', mode: a.mode, date: a.submittedAt });
        if (items.length >= 60) break;
      }
      if (items.length >= 60) break;
    }

    const user = await User.findById(userId).select('categories').lean();
    const cat = (user?.categories || []).find((c) => c.name === CATEGORY);
    const now = Date.now();
    const words = (cat?.words || []).map((w) => ({
      id: String(w._id),
      word: w.word,
      syns: w.syns || [],
      skill: w.enrichment?.ieltsSkillTag || null,
      due: !w.stats?.nextReview || new Date(w.stats.nextReview).getTime() <= now,
      level: w.stats?.level || 0,
    }));

    return NextResponse.json({ mistakes: items, words, categoryId: cat ? String(cat._id) : null });
  } catch (err) {
    return serverError(err, 'mistakes:get');
  }
}
