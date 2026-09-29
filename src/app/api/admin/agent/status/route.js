import { requireAdminUser } from '@/lib/chatAuth';
import { ExamTest, ReviewItem } from '@/lib/models';
import { listListeningCandidates, listWritingImageTargets } from '@/lib/contentAgent/agent/candidates';
import { validateTest, hasBlockingErrors } from '@/lib/exam/contentValidator';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// What the content agent screen shows above the chat: what is ready to
// publish, what still waits for audio/images, and whether any AI provider is
// configured at all (without one, file analysis can't run).
export const dynamic = 'force-dynamic';

const AI_KEYS = ['OPENROUTER_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GROQ_API_KEY', 'CEREBRAS_API_KEY'];

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    const [drafts, audio, images, openReview] = await Promise.all([
      ExamTest.find({ isPublished: false }).sort({ createdAt: -1 }).limit(40).lean(),
      listListeningCandidates({ limit: 60 }),
      listWritingImageTargets({ limit: 40 }),
      ReviewItem.countDocuments({ status: 'open' }),
    ]);

    const ready = [];
    const blocked = [];
    for (const t of drafts) {
      const issues = validateTest(t);
      const entry = { id: String(t._id), title: t.title };
      if (hasBlockingErrors(issues)) blocked.push({ ...entry, blockers: issues.filter((i) => i.severity === 'error').length });
      else ready.push(entry);
    }

    return NextResponse.json({
      aiConfigured: AI_KEYS.some((k) => !!process.env[k]),
      ready,
      blocked,
      waitingAudio: audio.map((a) => ({ testId: a.testId, testTitle: a.testTitle, partOrder: a.partOrder })),
      waitingImages: images.filter((t) => !t.hasImage && t.taskOrder === 1).map((t) => ({ testId: t.testId, testTitle: t.testTitle })),
      openReview,
    });
  } catch (err) {
    return serverError(err, 'admin/agent/status');
  }
}
