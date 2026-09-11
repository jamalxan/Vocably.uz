// TZ-vocably-v2.md §4 (IELTS CD Exam Engine v1.0) — API route'lar orasida
// takrorlanadigan DB-bog'liq mantiq, `./server.ts` (eski ExamSession dvigateli)
// bilan bir xil naqsh: sof hisoblash `./scoring.ts`/`./sanitize.ts`da, bu yerda
// faqat Mongoose bilan gaplashish bor. YANGI `ExamAttempt`/`ExamTest` modellari
// bilan ishlaydi (`@/lib/models`) — eski `ExamSession`ga TEGMAYDI.
import { ExamAttempt as ExamAttemptModel, ExamTest as ExamTestModel } from '@/lib/models';
import { isCorrect, isSetCorrect, listeningBand, readingBand, overallBand } from './scoring';
import { sanitizeForExam } from './sanitize';
import { gradeEssay, combineWritingBand } from './writingGrader';
import type {
  AnswerKey,
  AnswerValue,
  AttemptReviewDetail,
  AttemptResult,
  ExamSectionKey,
  Question,
  ReviewQuestion,
  SanitizedTest,
  Test,
  WordLimit,
} from './types';

// TZ-vocably-v2.md §9.1 — Mock'da bo'limlar QAT'IY shu tartibda o'tiladi
// (Listening → Reading → Writing; Speaking Faza 3'dan tashqarida, §9.1 "Speaking
// alohida, mock natijasiga null sifatida kiradi"). Bu tartib faqat mock uchun —
// `mode:'section'` urinishlar bitta bo'limning o'zi bilan cheklangan, tartibga
// ehtiyoj yo'q.
const MOCK_SECTION_ORDER: ExamSectionKey[] = ['listening', 'reading', 'writing'];

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
 * bo'lsa ham server bajaradi)". O'zgargan bo'lsa yangilangan hujjatni qaytaradi.
 *
 * `mode:'mock'`da `endsAt` BUTUN mock emas, FAQAT joriy bo'limning muddati
 * (TZ §9.1 ketma-ket bo'lim taymerlari) — shuning uchun vaqt tugashi to'g'ridan-
 * to'g'ri submit emas, balki "keyingi bo'limga o't" degani (oxirgi bo'lim —
 * Writing — bo'lsagina haqiqiy submit). `mode:'section'`da o'zgarishsiz. */
export async function syncAttemptExpiry(doc: any) {
  if (doc.status !== 'in_progress') return doc;
  if (remainingSec(doc.endsAt) > 0) return doc;
  if (doc.mode === 'mock') {
    await advanceMockSection(String(doc._id), String(doc.userId), 'time_expired');
    return ExamAttempt.findById(doc._id);
  }
  await submitAttempt(String(doc._id), String(doc.userId), 'time_expired');
  return ExamAttempt.findById(doc._id);
}

/** TZ §4/§9.1 — "POST /attempts/:id/section/next — Mock'da keyingi bo'limga
 * o'tish (orqaga qaytish mumkin emas)". Joriy bo'limning JAVOBLARI hech qanday
 * baholashsiz saqlanib qoladi (submitAttempt() BARCHA bo'limlarni FAQAT oxirgi
 * bo'lim — Writing — tugagach birga baholaydi, TZ Mock arxitekturasi shunday:
 * bir martalik yakuniy submit, bo'lim-bo'lim emas). Bu funksiya faqat
 * `currentSection`/`endsAt`ni yangilaydi.
 *
 * Idempotent emas — ikki marta chaqirilsa ikki marta ilgarilab ketishi mumkin,
 * lekin chaqiruvchilar (syncAttemptExpiry — faqat vaqt haqiqatan tugaganda;
 * route — faqat 'in_progress' holatida) bu holatga deyarli olib kelmaydi;
 * to'liq atomik himoya kerak bo'lsa (parallel so'rovlar), keyingi qadam sifatida
 * qo'shilishi mumkin — hozircha real xavf past (bitta foydalanuvchi, ketma-ket
 * chaqiruvlar).
 */
export async function advanceMockSection(attemptId: string, userId: string, reason: string) {
  const attempt = await getOwnedAttempt(attemptId, userId);
  if (attempt.mode !== 'mock' || attempt.status !== 'in_progress') return attempt;

  const sections: ExamSectionKey[] = attempt.sections || [];
  const currentIdx = sections.indexOf(attempt.currentSection);
  const nextSection = sections[currentIdx + 1];

  if (!nextSection) {
    // Oxirgi bo'lim tugadi — bu endi "keyingisi"ga o'tish emas, HAQIQIY yakunlash.
    await submitAttempt(attemptId, userId, reason);
    return ExamAttempt.findById(attemptId);
  }

  const test: Test | null = await ExamTest.findById(attempt.testId).lean();
  const nextDuration = (test?.sections as any)?.[nextSection]?.durationSec;
  if (typeof nextDuration !== 'number') {
    throw new ExamAttemptError(`Testda "${nextSection}" bo'limi yo'q`, 400);
  }

  const now = new Date();
  await ExamAttempt.updateOne(
    { _id: attemptId, status: 'in_progress' },
    { $set: { currentSection: nextSection, sectionStartedAt: now, endsAt: new Date(now.getTime() + nextDuration * 1000) } }
  );
  return ExamAttempt.findById(attemptId);
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
 * Reading/Listening darhol (lokal hisoblash) baholanadi — shu urinish
 * o'shanda `status: 'graded'` bo'lib qoladi. Writing esa AI chaqiruvi kerak
 * (sekinroq, tarmoqqa bog'liq) — shuning uchun Writing bo'lgan urinish
 * `status: 'submitted'`da qoladi, `gradeWritingAttempt()` (klient submit'dan
 * DARHOL keyin chaqiradi, TZ §4 alohida `/grade-writing` endpointi) uni
 * `'graded'`ga o'tkazadi. Speaking hali umuman baholanmaydi (Faza 3).
 */
export async function submitAttempt(attemptId: string, userId: string, reason: string): Promise<AttemptResult | null> {
  // Mock'da vaqtidan oldin (Writing'gacha yetmasdan) submit chaqirilsa —
  // xato o'rniga xavfsiz tarzda "keyingi bo'limga o't"ga yo'naltiramiz.
  // syncAttemptExpiry() buni allaqachon to'g'ri qiladi, lekin klient /submit'ni
  // to'g'ridan-to'g'ri (masalan eski kod yo'li yoki xato bosilgan tugma bilan)
  // chaqirib qolishi mumkin — himoya shu yerda ikkinchi qatlam sifatida.
  const preCheck = await ExamAttempt.findOne({ _id: attemptId, userId }).select('mode sections currentSection status').lean();
  if (preCheck?.mode === 'mock' && preCheck.status === 'in_progress') {
    const sections: ExamSectionKey[] = preCheck.sections || [];
    const isLastSection = sections.indexOf(preCheck.currentSection as ExamSectionKey) === sections.length - 1;
    if (!isLastSection) {
      await advanceMockSection(attemptId, userId, reason);
      const advanced = await ExamAttempt.findById(attemptId).select('result').lean();
      return advanced?.result ?? null;
    }
  }

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

  const hasPendingWriting = attemptSections.includes('writing');
  const status = hasPendingWriting ? 'submitted' : 'graded';

  await ExamAttempt.updateOne({ _id: attemptId }, { $set: { result, status } });
  return result;
}

/** TZ §4/§8.5 — "POST /attempts/:id/grade-writing" ishi. Idempotent (§8.5:
 * "bir matn ikki marta baholanmaydi") — attempt allaqachon `'graded'` bo'lsa
 * saqlangan natijani qaytaradi, qayta AI chaqirmaydi. Ikkala insho PARALLEL
 * baholanadi (umumiy kutish vaqtini yarmiga tushiradi — queue yo'qligida bu
 * muhim, TZ §4.3/§8.5 izohiga q. writingGrader.ts'da).
 */
export async function gradeWritingAttempt(attemptId: string, userId: string): Promise<AttemptResult | null> {
  const attempt = await getOwnedAttempt(attemptId, userId);
  if (attempt.status === 'graded') return attempt.result;
  if (attempt.status !== 'submitted') {
    throw new ExamAttemptError('Urinish hali yakunlanmagan yoki holati mos emas', 409);
  }

  const test: Test | null = await ExamTest.findById(attempt.testId).lean();
  const tasks = test?.sections.writing?.tasks;
  if (!tasks) throw new ExamAttemptError('Testda Writing bo\'limi yo\'q', 400);

  const [task1, task2] = tasks;
  const essayText1 = attempt.essays?.task1?.text || '';
  const essayText2 = attempt.essays?.task2?.text || '';

  const [score1, score2] = await Promise.all([gradeEssay(task1, essayText1), gradeEssay(task2, essayText2)]);

  const writing = { task1: score1, task2: score2, band: combineWritingBand(score1, score2) };
  const result: AttemptResult = { ...(attempt.result || {}), writing };

  // Writing yagona baholanadigan bo'lim bo'lgan `mode:'section'` urinishlarda
  // (Faza 2'ning yagona holati) `overall` xuddi shu Writing bandiga teng —
  // Mock (bir nechta bo'lim) qo'shilganda bu yerga reading/listening
  // bandlarini ham qo'shib hisoblash kerak bo'ladi (Faza 3).
  result.overall = overallBand({
    reading: result.reading?.band ?? null,
    listening: result.listening?.band ?? null,
    writing: writing.band,
    speaking: null,
  });

  await ExamAttempt.updateOne({ _id: attemptId }, { $set: { result, status: 'graded' } });
  return result;
}

/** GET /attempts/:id uchun — javob kalitlari HECH QACHON bu orqali chiqmaydi
 * (TZ §4.1). To'liq (izohli) ko'rinish faqat quyidagi
 * `getAttemptReviewDetail()` orqali, alohida `/attempts/:id/result`
 * endpointida (TZ §19 Faza 3 item 16), faqat `status==='graded'` bo'lganda. */
export function sanitizedTestFor(test: Test): SanitizedTest {
  return sanitizeForExam(test);
}

function buildReviewQuestion(q: Question, perQuestion: AttemptResult['perQuestion']): ReviewQuestion {
  const scored = perQuestion.find((p) => p.number === q.number);
  return {
    number: q.number,
    promptHtml: q.promptHtml || '',
    options: q.options,
    userAnswer: scored?.userAnswer || '',
    correct: scored?.correct || false,
    accepted: scored?.accepted || q.answer?.accepted || [],
    explanationHtml: q.explanationHtml || '',
    locatorParagraph: q.locatorParagraph,
  };
}

/** TZ §4/§11.2 — "GET /attempts/:id/result — To'g'ri javoblar + izohlar —
 * faqat status==='graded' bo'lsa". `result.perQuestion`dan (submitAttempt()
 * paytida ALLAQACHON hisoblangan to'g'ri/noto'g'ri) foydalanadi — qayta
 * hisoblamaydi, faqat test'ning xom (sanitizatsiyalanmagan) savol
 * matni/izohi/lokatori bilan BOYITADI. Shu tufayli review'dagi natija
 * submit paytida ko'rsatilgan natija bilan har doim MOS keladi (ikki xil
 * hisoblash yo'li — ikkita mumkin bo'lgan javob — yo'q).
 */
export async function getAttemptReviewDetail(attemptId: string, userId: string): Promise<AttemptReviewDetail> {
  const attempt = await getOwnedAttempt(attemptId, userId);
  if (attempt.status !== 'graded') {
    throw new ExamAttemptError("Urinish hali baholanmagan", 409);
  }

  const test: Test | null = await ExamTest.findById(attempt.testId).lean();
  if (!test) throw new ExamAttemptError('Test topilmadi', 404);

  const result: AttemptResult = attempt.result || { timeSpentSec: 0, perQuestion: [] };
  const perQuestion = result.perQuestion || [];
  const detail: AttemptReviewDetail = { overall: result.overall };

  if (test.sections.reading && result.reading) {
    detail.reading = {
      band: result.reading.band,
      raw: result.reading.raw,
      passages: test.sections.reading.passages.map((p) => ({
        order: p.order,
        title: p.title,
        paragraphs: p.paragraphs,
        questions: p.questionGroups.flatMap((g) => g.questions.map((q) => buildReviewQuestion(q, perQuestion))),
      })),
    };
  }

  if (test.sections.listening && result.listening) {
    detail.listening = {
      band: result.listening.band,
      raw: result.listening.raw,
      parts: test.sections.listening.parts.map((p) => ({
        order: p.order,
        transcript: p.transcript || '',
        contextText: p.contextText,
        questions: p.questionGroups.flatMap((g) => g.questions.map((q) => buildReviewQuestion(q, perQuestion))),
      })),
    };
  }

  if (test.sections.writing && result.writing) {
    detail.writing = {
      task1: result.writing.task1,
      task2: result.writing.task2,
      band: result.writing.band,
      essays: { task1: attempt.essays?.task1?.text || '', task2: attempt.essays?.task2?.text || '' },
    };
  }

  return detail;
}
