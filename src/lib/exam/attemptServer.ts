// TZ-vocably-v2.md §4 (IELTS CD Exam Engine v1.0) — API route'lar orasida
// takrorlanadigan DB-bog'liq mantiq, `./server.ts` (eski ExamSession dvigateli)
// bilan bir xil naqsh: sof hisoblash `./scoring.ts`/`./sanitize.ts`da, bu yerda
// faqat Mongoose bilan gaplashish bor. YANGI `ExamAttempt`/`ExamTest` modellari
// bilan ishlaydi (`@/lib/models`) — eski `ExamSession`ga TEGMAYDI.
import { ExamAttempt as ExamAttemptModel, ExamTest as ExamTestModel } from '@/lib/models';
import { isCorrect, isSetCorrect, listeningBand, readingBand, overallBand } from './scoring';
import { sanitizeForExam } from './sanitize';
import type { AnswerKey, AnswerValue, AttemptResult, SanitizedTest, Test, WordLimit } from './types';

// models.js oddiy JavaScript — .ts fayldan chaqirilganda Mongoose static
// metodlarining generic bo'lmagan turi bilan to'qnashadi (TZ2349). `./server.ts`
// xuddi shu sababdan xuddi shu naqshni ishlatadi.
const ExamAttempt: any = ExamAttemptModel;
const ExamTest: any = ExamTestModel;

export class ExamAttemptError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Urinishni egasi (userId) bo'yicha tekshirib qaytaradi — client attemptId'ga
 * ishonib boshqa foydalanuvchi urinishini so'ray olmasligi uchun MAJBURIY. */
export async function getOwnedAttempt(attemptId: string, userId: string) {
  const doc = await ExamAttempt.findOne({ _id: attemptId, userId });
  if (!doc) throw new ExamAttemptError('Urinish topilmadi', 404);
  return doc;
}

export async function getTestOrThrow(testId: string): Promise<any> {
  const test = await ExamTest.findById(testId);
  if (!test) throw new ExamAttemptError('Test topilmadi', 404);
  return test;
}

export function remainingSec(endsAt: Date, now: Date = new Date()): number {
  return Math.max(0, Math.round((endsAt.getTime() - now.getTime()) / 1000));
}

/** Vaqti tugagan (`in_progress` holatida, `remainingSec === 0`) urinishni
 * avtomatik yakunlaydi — TZ §18 "Vaqt tugaganda avtomatik submit (klient yopiq
 * bo'lsa ham server bajaradi)". O'zgargan bo'lsa yangilangan hujjatni qaytaradi. */
export async function syncAttemptExpiry(doc: any) {
  if (doc.status !== 'in_progress') return doc;
  if (remainingSec(doc.endsAt) > 0) return doc;
  await submitAttempt(String(doc._id), String(doc.userId), 'time_expired');
  return ExamAttempt.findById(doc._id);
}

/** Bitta konteyner (passage yoki listening part) ichidagi savollarni tekislab
 * chiqaradi — `wordLimit` guruh darajasida turadi, har savolga shu yerda tarqatiladi. */
function collectByContainer(test: Test, sectionKey: 'listening' | 'reading') {
  const section = sectionKey === 'reading' ? test.sections.reading : test.sections.listening;
  if (!section) return [] as { number: number; answer: AnswerKey; wordLimit?: WordLimit }[][];
  const containers = sectionKey === 'reading' ? (section as any).passages : (section as any).parts;
  return (containers || []).map((container: any) =>
    (container.questionGroups || []).flatMap((g: any) =>
      (g.questions || []).map((q: any) => ({ number: q.number, answer: q.answer, wordLimit: g.wordLimit }))
    )
  ) as { number: number; answer: AnswerKey; wordLimit?: WordLimit }[][];
}

/** Bitta savolni baholaydi. TZ §10.1: ko'p tanlovli (`multiple_choice_multi`,
 * `selectCount` bor) savollar massiv qiymat sifatida keladi (Faza 2
 * QuestionRenderer'i — MultipleChoice.tsx) va to'plam sifatida solishtiriladi
 * (`isSetCorrect`, qisman ball yo'q); qolgan barcha turlar bitta qatorli
 * matn/tanlov sifatida keladi va `isCorrect` orqali tekshiriladi. */
function scoreOne(userValue: AnswerValue, key: AnswerKey, wordLimit?: WordLimit): boolean {
  if (userValue == null) return false;
  if (Array.isArray(userValue)) return isSetCorrect(userValue, key);
  return isCorrect(userValue, key, wordLimit);
}

export interface SectionScore {
  raw: number;
  total: number;
  perContainer: number[];
  perQuestion: AttemptResult['perQuestion'];
}

export function scoreSection(test: Test, attemptAnswers: Record<string, AnswerValue>, sectionKey: 'listening' | 'reading'): SectionScore {
  const containers = collectByContainer(test, sectionKey);
  let raw = 0;
  let total = 0;
  const perContainer: number[] = [];
  const perQuestion: AttemptResult['perQuestion'] = [];

  for (const questions of containers) {
    let containerRaw = 0;
    for (const q of questions) {
      const given = attemptAnswers[`q${q.number}`] ?? null;
      const ok = scoreOne(given, q.answer, q.wordLimit);
      if (ok) {
        raw += 1;
        containerRaw += 1;
      }
      total += 1;
      perQuestion.push({
        number: q.number,
        userAnswer: Array.isArray(given) ? given.join(', ') : given || '',
        correct: ok,
        accepted: q.answer?.accepted || [],
      });
    }
    perContainer.push(containerRaw);
  }

  return { raw, total, perContainer, perQuestion };
}

/** Idempotent submit+baholash — `./server.ts#finalize`dagi bilan bir xil atomik
 * naqsh (`status: 'in_progress' -> 'submitted'`): ikki marta chaqirilsa
 * (parallel tab, tarmoq qayta urinishi, taymer + foydalanuvchi bir vaqtda)
 * ikkinchisi hech narsa qilmaydi, saqlangan natijani qaytaradi.
 *
 * Writing/Speaking hozircha baholanmaydi (`null` qoladi) — AI grader Faza 2/3
 * ishi (TZ §19).
 */
export async function submitAttempt(attemptId: string, userId: string, reason: string): Promise<AttemptResult | null> {
  const pre = await ExamAttempt.findOneAndUpdate(
    { _id: attemptId, userId, status: 'in_progress' },
    { $set: { status: 'submitted', submittedAt: new Date(), submitReason: reason } },
    { new: false }
  );

  if (!pre) {
    const existing = await ExamAttempt.findOne({ _id: attemptId, userId });
    return existing?.result ?? null;
  }

  const test: Test | null = await ExamTest.findById(pre.testId).lean();
  const attemptAnswers: Record<string, AnswerValue> = pre.answers || {};
  const attemptSections: string[] = pre.sections || [];

  const sectionBands: Record<string, number | null> = { listening: null, reading: null, writing: null, speaking: null };
  let perQuestion: AttemptResult['perQuestion'] = [];
  const result: AttemptResult = {
    timeSpentSec: Math.round((Date.now() - new Date(pre.startedAt).getTime()) / 1000),
    perQuestion: [],
  };

  if (test?.sections.reading && attemptSections.includes('reading')) {
    const scored = scoreSection(test, attemptAnswers, 'reading');
    sectionBands.reading = readingBand(scored.raw);
    result.reading = { raw: scored.raw, band: sectionBands.reading, perPassage: scored.perContainer };
    perQuestion = perQuestion.concat(scored.perQuestion);
  }
  if (test?.sections.listening && attemptSections.includes('listening')) {
    const scored = scoreSection(test, attemptAnswers, 'listening');
    sectionBands.listening = listeningBand(scored.raw);
    result.listening = { raw: scored.raw, band: sectionBands.listening, perPart: scored.perContainer };
    perQuestion = perQuestion.concat(scored.perQuestion);
  }

  result.perQuestion = perQuestion;
  result.overall = overallBand(sectionBands) ?? undefined;

  await ExamAttempt.updateOne({ _id: attemptId }, { $set: { result, status: 'graded' } });
  return result;
}

/** GET /attempts/:id uchun — javob kalitlari HECH QACHON bu orqali chiqmaydi
 * (TZ §4.1). To'liq (izohli) ko'rinish keyinroq qo'shiladigan alohida
 * `/attempts/:id/result` endpointi ishi (TZ §19 Faza 3), faqat `status==='graded'`
 * bo'lganda. */
export function sanitizedTestFor(test: Test): SanitizedTest {
  return sanitizeForExam(test);
}
