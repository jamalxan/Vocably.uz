import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { ExamAttempt } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §15.2 — "Statistika: har savol bo'yicha to'g'ri javob %.
// 95% dan yuqori yoki 10% dan past bo'lsa — savol shubhali, belgilanadi."
// Oddiy JS'da agregatsiya (Mongo aggregation pipeline emas) — TZ-vocably-v2.md
// bo'ylab bu sessiyada allaqachon qabul qilingan pragmatik yondashuv
// (masalan attemptServer.ts#getAttemptHistory), chunki hozircha bitta
// testning urinishlar soni katta emas.
export async function GET(req, { params }) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const attempts = await ExamAttempt.find({ testId: params.id, status: 'graded' }).select('result.perQuestion').lean();

    const byNumber = new Map();
    for (const a of attempts) {
      for (const q of a.result?.perQuestion || []) {
        const entry = byNumber.get(q.number) || { number: q.number, type: q.type, correct: 0, total: 0 };
        entry.total += 1;
        if (q.correct) entry.correct += 1;
        byNumber.set(q.number, entry);
      }
    }

    const questions = Array.from(byNumber.values())
      .map((q) => ({ ...q, accuracy: q.total > 0 ? q.correct / q.total : 0 }))
      .sort((a, b) => a.number - b.number)
      // 5'dan kam urinishda 100%/0% tasodifiy bo'lishi mumkin — "shubhali" belgisi
      // uchun minimal ishonchlilik chegarasi (TZ'ning o'zi bu chegarani aytmagan,
      // lekin belgisiz kichik namunada belgi ma'nosiz shovqin bo'lar edi).
      .map((q) => ({ ...q, suspicious: q.total >= 5 && (q.accuracy > 0.95 || q.accuracy < 0.1) }));

    return NextResponse.json({ attemptCount: attempts.length, questions });
  } catch (err) {
    return serverError(err, 'admin/exam-tests:id:stats');
  }
}
