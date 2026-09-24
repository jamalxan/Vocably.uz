import { ExamTest, ReviewItem } from '@/lib/models';

// Chat agentiga "platformada hozir nima bor" degan HAQIQIY manzarani beradi:
// audio kutayotgan Listening part'lar, rasm kutayotgan Writing task'lar,
// qoralama/nashr statistikasi. Modelga shu real ro'yxat beriladi — shuning
// uchun u mavjud bo'lmagan test/part haqida gapira olmaydi.

function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function partQuestionText(part) {
  return (part.questionGroups || [])
    .map((g) => [stripHtml(g.instructionHtml), stripHtml(g.stemHtml), ...(g.questions || []).map((q) => stripHtml(q.promptHtml))].filter(Boolean).join(' '))
    .join(' \n')
    .slice(0, 4000);
}

function partAnswers(part) {
  return (part.questionGroups || []).flatMap((g) =>
    (g.questions || []).map((q) => ({ number: q.number, accepted: q.answer?.accepted || [] }))
  );
}

/** Audio KUTAYOTGAN (audioUrl bo'sh) Listening part'lar — chatga tashlangan
 * audio shu ro'yxatga qarshi solishtiriladi. `includeFilled` bilan audiosi
 * bor part'lar ham qo'shiladi (admin ataylab "audioni almashtir" desa). */
export async function listListeningCandidates({ includeFilled = false, limit = 60 } = {}) {
  const tests = await ExamTest.find({ 'sections.listening': { $exists: true } })
    .select('title slug sections.listening isPublished')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const candidates = [];
  for (const test of tests) {
    for (const part of test.sections?.listening?.parts || []) {
      const hasAudio = !!part.audioUrl?.trim();
      if (hasAudio && !includeFilled) continue;
      candidates.push({
        testId: String(test._id),
        testTitle: test.title,
        testSlug: test.slug,
        isPublished: !!test.isPublished,
        partOrder: part.order,
        hasAudio,
        contextText: stripHtml(part.contextText),
        transcript: part.transcript || '',
        answers: partAnswers(part),
        questionText: partQuestionText(part),
      });
    }
  }
  return candidates;
}

/** Rasm kutayotgan Writing task'lar (odatda Academic Task 1 grafigi). */
export async function listWritingImageTargets({ limit = 40 } = {}) {
  const tests = await ExamTest.find({ 'sections.writing': { $exists: true } })
    .select('title sections.writing isPublished')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const targets = [];
  for (const test of tests) {
    for (const task of test.sections?.writing?.tasks || []) {
      targets.push({
        testId: String(test._id),
        testTitle: test.title,
        isPublished: !!test.isPublished,
        taskOrder: task.order,
        hasImage: !!task.imageUrl,
        promptText: stripHtml(task.promptHtml).slice(0, 400),
      });
    }
  }
  return targets;
}

export async function getPlatformState() {
  const [draftTests, publishedTests, openReviewItems, recent, listeningTests] = await Promise.all([
    ExamTest.countDocuments({ isPublished: false }),
    ExamTest.countDocuments({ isPublished: true }),
    ReviewItem.countDocuments({ status: 'open' }),
    ExamTest.find({}).select('title sections isPublished').sort({ createdAt: -1 }).limit(6).lean(),
    ExamTest.find({ 'sections.listening': { $exists: true } }).select('sections.listening').lean(),
  ]);

  let listeningPartsMissingAudio = 0;
  for (const t of listeningTests) {
    for (const p of t.sections?.listening?.parts || []) {
      if (!p.audioUrl?.trim()) listeningPartsMissingAudio += 1;
    }
  }

  return {
    draftTests,
    publishedTests,
    openReviewItems,
    listeningPartsMissingAudio,
    recentTests: recent.map((t) => ({
      title: t.title,
      isPublished: !!t.isPublished,
      sections: ['listening', 'reading', 'writing', 'speaking'].filter((k) => t.sections?.[k]),
    })),
  };
}
