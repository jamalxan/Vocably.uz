import { requireAdminUser } from '@/lib/chatAuth';
import { ExamAttempt, ExamTest } from '@/lib/models';
import { contentQuality } from '@/lib/exam/contentQuality';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Cross-test content quality (src/lib/exam/contentQuality.js): last 90 days
// of Reading/Listening attempts. Practice runs count too — they are real
// answers to the same questions.
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const since = new Date(Date.now() - 90 * 24 * 3600 * 1000);
    const attempts = await ExamAttempt.find({ startedAt: { $gte: since }, sections: { $in: ['reading', 'listening'] } })
      .select('testId userId status result.perQuestion result.reading.band result.listening.band')
      .limit(20000)
      .lean();
    const ids = [...new Set(attempts.map((a) => String(a.testId)))];
    const tests = await ExamTest.find({ _id: { $in: ids } }).select('title').lean();
    const titles = new Map(tests.map((t) => [String(t._id), t.title]));
    return NextResponse.json({ tests: contentQuality(attempts, titles), since });
  } catch (err) {
    return serverError(err, 'admin/content-quality');
  }
}
