// TZ-vocably-v2.md §4 (IELTS CD Exam Engine v1.0) — API route'lar orasida
// takrorlanadigan DB-bog'liq mantiq, `./server.ts` (eski ExamSession dvigateli)
// bilan bir xil naqsh: sof hisoblash `./scoring.ts`/`./sanitize.ts`da, bu yerda
// faqat Mongoose bilan gaplashish bor. YANGI `ExamAttempt`/`ExamTest` modellari
// bilan ishlaydi (`@/lib/models`) — eski `ExamSession`ga TEGMAYDI.
import crypto from 'crypto';
import { ExamAttempt as ExamAttemptModel, ExamTest as ExamTestModel, ExamTestVersion as ExamTestVersionModel } from '@/lib/models';
import { isCorrect, isSetCorrect, listeningBand, readingBand, officialStyleOverallBand } from './scoring';
import { sanitizeForExam } from './sanitize';
import { gradeEssay, combineWritingBand } from './writingGrader';
import { gradeSpeaking } from './speakingGrader';
import { uploadAudioBuffer } from './audioStorage';
import { transcribeAudio } from '@/lib/transcribe';
import type {
  AnswerKey,
  AnswerValue,
  AttemptHistoryEntry,
  AttemptReviewDetail,
  AttemptResult,
  ExamSectionKey,
  Question,
  QuestionType,
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
const ExamTestVersion: any = ExamTestVersionModel;

export class ExamAttemptError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** P0-05 — bir xil kontent uchun bir xil hash (admin testni ochib qayta
 * saqlasa-yu mazmuni o'zgarmasa, yangi versiya CHIQMASLIGI kerak). Faqat
 * BAHOLASH/REVIEW uchun ahamiyatli maydonlar hash'ga kiradi — `isPublished`,
 * `qa`, `reviewSummary` kabi metadata o'zgarishi versiya YARATMASLIGI kerak. */
function computeTestContentHash(test: { module?: string; sections?: unknown; bandTable?: unknown }): string {
  const material = JSON.stringify({ module: test.module, sections: test.sections, bandTable: test.bandTable || null });
  return crypto.createHash('sha256').update(material).digest('hex');
}

/** P0-05 — urinish yaratilganda chaqiriladi: shu paytdagi test kontenti bilan
 * mos `ExamTestVersion`ni topadi (content-hash bo'yicha, takrorlanmasin) yoki
 * yangisini yaratadi, so'ng uning ID'sini qaytaradi — chaqiruvchi buni
 * `ExamAttempt.testVersionId`ga yozadi. Shu paytdan boshlab ushbu urinish
 * uchun test kontenti MUZLAYDI: admin keyinroq shu testni tahrirlasa, bu
 * urinish (submit/review/scoring) hamon ESKI snapshotdan ishlaydi. */
export async function getOrCreateTestVersion(test: any): Promise<string> {
  const contentHash = computeTestContentHash(test);
  const existing = await ExamTestVersion.findOne({ parentTestId: test._id, contentHash }).select('_id').lean();
  if (existing) return String(existing._id);

  const last = await ExamTestVersion.findOne({ parentTestId: test._id }).sort({ versionNumber: -1 }).select('versionNumber').lean();
  const versionNumber = (last?.versionNumber || 0) + 1;

  const snapshot = {
    _id: String(test._id),
    slug: test.slug,
    title: test.title,
    module: test.module,
    difficulty: test.difficulty,
    sections: test.sections,
    bandTable: test.bandTable || null,
    isPublished: test.isPublished,
    createdBy: test.createdBy ? String(test.createdBy) : undefined,
    createdAt: test.createdAt,
  };

  try {
    const version = await ExamTestVersion.create({
      parentTestId: test._id,
      versionNumber,
      contentHash,
      snapshot,
      createdBy: test.createdBy || null,
    });
    return String(version._id);
  } catch (err: any) {
    // Poyga holati: parallel so'rov xuddi shu (parentTestId, contentHash) uchun
    // versiyani BIZDAN OLDIN yaratdi (unique index, models.js) — duplikat
    // yaratish o'rniga g'olib versiyani qaytaramiz.
    if (err?.code === 11000) {
      const winner = await ExamTestVersion.findOne({ parentTestId: test._id, contentHash }).select('_id').lean();
      if (winner) return String(winner._id);
    }
    throw err;
  }
}

/** P0-05 — urinishning haqiqiy test kontentini oladi: `testVersionId` bog'langan
 * bo'lsa (bu migratsiyadan keyin yaratilgan HAR bir urinishda shunday) shu
 * MUZLATILGAN snapshotdan, aks holda (migratsiyadan OLDINGI eski urinishlar —
 * orqaga moslik) live `ExamTest`dan. Submit/scoring/review/GET — BARCHASI shu
 * bitta funksiya orqali o'tishi kerak, aks holda ikkita hisoblash yo'li paydo
 * bo'ladi (TZ intizomi — q. `submitAttempt` boshidagi izoh). */
export async function resolveTestForAttempt(attempt: { testId: unknown; testVersionId?: unknown }): Promise<Test | null> {
  if (attempt.testVersionId) {
    const version = await ExamTestVersion.findById(attempt.testVersionId).select('snapshot').lean();
    if (version?.snapshot) return version.snapshot as Test;
  }
  return ExamTest.findById(attempt.testId).lean();
}

/** Urinishni egasi (userId) bo'yicha tekshirib qaytaradi — client attemptId'ga
 * ishonib boshqa foydalanuvchi urinishini so'ray olmasligi uchun MAJBURIY. */
export async function getOwnedAttempt(attemptId: string, userId: string) {
  const doc = await ExamAttempt.findOne({ _id: attemptId, userId });
  if (!doc) throw new ExamAttemptError('Urinish topilmadi', 404);
  return doc;
}

/** AUDIT PERF-01 (VOCABLY_TZ_FINAL... 2026-09-20 §23) — avvalgi autosave yo'li
 * `attempt.answers = {...attempt.answers, ...answers}; attempt.markModified
 * ('answers'); attempt.save()` edi. `answers` schema'da `Mixed` tur (models.js
 * — chuqur ichma-ich `AnswerValue` shakllari DB sxemasi darajasida emas,
 * ilova darajasida tekshiriladi) — Mongoose Mixed maydonlarda QISMAN
 * dirty-tracking QILA OLMAYDI: `markModified()` chaqirilgach BUTUN `answers`
 * obyektini (nechta savolga javob berilgan bo'lsa ham) qayta yozib
 * yuboradi. Amalda bu shuni anglatardi: 40-savolli Reading testida oxirgi
 * savolga javob berilganda ham OLDINGI 39 ta javob QAYTA MongoDB'ga
 * yoziladi — har autosave'da (odatda bir necha soniyada bir marta).
 *
 * Tuzatish: `attempt.save()` O'RNIGA to'g'ridan-to'g'ri `updateOne` +
 * MongoDB NUQTA-NOTATSIYASI (`'answers.q17'`) — bu Mongoose'ning Mixed-tur
 * cheklovidan chetlab o'tadi, chunki MongoDB'ning o'zi (Mongoose emas)
 * hujjat ichidagi ISTALGAN chuqurlikdagi yo'lni QISMAN yangilay oladi.
 * Natijada faqat HAQIQATAN O'ZGARGAN savol(lar) yoziladi, qolganlariga
 * tegilmaydi. */
export interface AttemptAnswersPatch {
  answers?: Record<string, AnswerValue>;
  flagged?: number[];
  lastQuestion?: number;
  essays?: { task1?: { text: string; wordCount?: number }; task2?: { text: string; wordCount?: number } };
}

/** Sof funksiya (DB'siz) — `patchAttemptAnswers`dan ATAYLAB ajratilgan, shu
 * sessiyada butun kodda takrorlangan naqsh bo'yicha (scoring.ts,
 * worker/stages/*.ts): DB-bog'liq qism ingichka qoladi, haqiqiy MANTIQ
 * (qaysi maydon qaysi nuqta-notatsiyali kalitga aylanishi) alohida, sinash
 * mumkin bo'lgan joyda. `now` — faqat testlar uchun (deterministik
 * `updatedAt`), real chaqiruvda berilmaydi. */
export function buildAnswersPatchSetOps(patch: AttemptAnswersPatch, now: Date = new Date()): Record<string, unknown> {
  const setOps: Record<string, unknown> = {};

  if (patch.answers && typeof patch.answers === 'object') {
    for (const [key, value] of Object.entries(patch.answers)) {
      setOps[`answers.${key}`] = value;
    }
  }
  if (Array.isArray(patch.flagged)) setOps.flagged = patch.flagged;
  if (typeof patch.lastQuestion === 'number') setOps.lastQuestion = patch.lastQuestion;
  if (patch.essays && typeof patch.essays === 'object') {
    for (const key of ['task1', 'task2'] as const) {
      const incoming = patch.essays[key];
      if (incoming && typeof incoming.text === 'string') {
        setOps[`essays.${key}`] = { text: incoming.text, wordCount: Number(incoming.wordCount) || 0, updatedAt: now };
      }
    }
  }

  return setOps;
}

export async function patchAttemptAnswers(attemptId: string, userId: string, patch: AttemptAnswersPatch): Promise<{ saved: boolean }> {
  const setOps = buildAnswersPatchSetOps(patch);
  if (Object.keys(setOps).length === 0) return { saved: false };

  // `status:'in_progress'` shart — allaqachon yakunlangan/muddati o'tgan
  // urinishga "kech" autosave so'rovi (masalan tarmoq kechikishi bilan
  // keyinroq yetib kelgan) yozilib qolmasin uchun ikkinchi himoya qatlami
  // (route.js allaqachon buni oldindan tekshiradi, lekin race-condition
  // xavfsizligi uchun query filtrida ham takrorlanadi).
  await ExamAttempt.updateOne({ _id: attemptId, userId, status: 'in_progress' }, { $set: setOps });
  return { saved: true };
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

  const test = await resolveTestForAttempt(attempt);
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
 * chiqaradi — `wordLimit`/`type` guruh darajasida turadi, har savolga shu
 * yerda tarqatiladi. `type` — TZ §19 Faza 3 item 17 (natija analitikasi,
 * savol turi bo'yicha) uchun kerak. */
function collectByContainer(test: Test, sectionKey: 'listening' | 'reading') {
  const section = sectionKey === 'reading' ? test.sections.reading : test.sections.listening;
  if (!section) return [] as { number: number; answer: AnswerKey; wordLimit?: WordLimit; type: QuestionType }[][];
  const containers = sectionKey === 'reading' ? (section as any).passages : (section as any).parts;
  return (containers || []).map((container: any) =>
    (container.questionGroups || []).flatMap((g: any) =>
      (g.questions || []).map((q: any) => ({ number: q.number, answer: q.answer, wordLimit: g.wordLimit, type: g.type }))
    )
  ) as { number: number; answer: AnswerKey; wordLimit?: WordLimit; type: QuestionType }[][];
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
        type: q.type,
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

  const test = await resolveTestForAttempt(pre);
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
    const { band, estimated } = readingBand(scored.raw, test.module, test.bandTable?.reading);
    sectionBands.reading = band;
    result.reading = { raw: scored.raw, band, bandEstimated: estimated, perPassage: scored.perContainer };
    perQuestion = perQuestion.concat(scored.perQuestion);
  }
  if (test?.sections.listening && attemptSections.includes('listening')) {
    const scored = scoreSection(test, attemptAnswers, 'listening');
    const { band, estimated } = listeningBand(scored.raw, test.bandTable?.listening);
    sectionBands.listening = band;
    result.listening = { raw: scored.raw, band, bandEstimated: estimated, perPart: scored.perContainer };
    perQuestion = perQuestion.concat(scored.perQuestion);
  }

  result.perQuestion = perQuestion;
  // P0-04: faqat SHU urinishga kiritilgan barcha bo'limlar baholanganda overall
  // chiqadi (masalan mockda Writing hali AI navbatida bo'lsa, L+R "umumiy band"
  // sifatida ko'rsatilmaydi — quyida gradeWritingAttempt/gradeSpeakingAttempt
  // qayta hisoblab to'ldiradi).
  result.overall = officialStyleOverallBand(attemptSections, sectionBands) ?? undefined;

  // Writing va Speaking ikkalasi ham AI orqali (submitAttempt'dan TASHQARIDA,
  // grade-writing/grade-speaking endpoint'lari orqali) baholanadi — shuning
  // uchun ikkalasi ham kutilmagan bo'lsa status 'submitted'da qoladi. Amalda
  // bitta urinish ikkalasini birga o'z ichiga olmaydi (MOCK_SECTION_ORDER
  // Speaking'ni o'z ichiga olmaydi, §9.1 — Speaking mock'dan tashqari, alohida
  // mode:'section' urinish), lekin kelajakda birlashtirilsa ham to'g'ri
  // ishlashi uchun ikkalasi ham tekshiriladi.
  const hasPendingWriting = attemptSections.includes('writing');
  const hasPendingSpeaking = attemptSections.includes('speaking');
  const status = hasPendingWriting || hasPendingSpeaking ? 'submitted' : 'graded';

  await ExamAttempt.updateOne({ _id: attemptId }, { $set: { result, status } });
  return result;
}

/** TZ §19 Faza 4 item 23 — bitta Speaking javobini (Part 1/3'ning bitta
 * savoli yoki Part 2'ning cue card javobi) yozib olingandan keyin yuklaydi:
 * GridFS'ga saqlaydi (audioStorage.ts, Listening bilan bir xil bucket) va
 * DARHOL transkripsiya qiladi (transcribe.js) — final baholash (gradeSpeaking)
 * keyinroq faqat matn bilan ishlaydi, audio bilan qayta gaplashmaydi.
 * Bir xil part+questionIndex qayta yozib olinsa (foydalanuvchi "qayta
 * urinish" bossa) ESKI yozuv ALMASHTIRILADI — ikkita nusxa saqlanmaydi. */
export async function addSpeakingRecording(
  attemptId: string,
  userId: string,
  args: { part: 1 | 2 | 3; questionIndex: number; buffer: Buffer; filename: string; mimeType: string; durationSec: number }
): Promise<{ audioFileId: string; transcript: string }> {
  const attempt = await getOwnedAttempt(attemptId, userId);
  if (attempt.status !== 'in_progress') {
    throw new ExamAttemptError('Urinish allaqachon yakunlangan', 409);
  }
  if (!(attempt.sections || []).includes('speaking')) {
    throw new ExamAttemptError("Bu urinishda Speaking bo'limi yo'q", 400);
  }

  const [audioFileId, transcript] = await Promise.all([
    uploadAudioBuffer(args.buffer, args.filename, args.mimeType),
    transcribeAudio(args.buffer, args.filename, args.mimeType),
  ]);

  const recordings = (attempt.speaking?.recordings || []).filter(
    (r: any) => !(r.part === args.part && r.questionIndex === args.questionIndex)
  );
  recordings.push({
    part: args.part,
    questionIndex: args.questionIndex,
    audioFileId,
    transcript,
    durationSec: args.durationSec,
    recordedAt: new Date(),
  });
  attempt.speaking = { recordings };
  attempt.markModified('speaking');
  await attempt.save();

  return { audioFileId, transcript };
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

  const test = await resolveTestForAttempt(attempt);
  const tasks = test?.sections.writing?.tasks;
  if (!tasks) throw new ExamAttemptError('Testda Writing bo\'limi yo\'q', 400);

  const [task1, task2] = tasks;
  const essayText1 = attempt.essays?.task1?.text || '';
  const essayText2 = attempt.essays?.task2?.text || '';

  const [score1, score2] = await Promise.all([gradeEssay(task1, essayText1), gradeEssay(task2, essayText2)]);

  const writing = { task1: score1, task2: score2, band: combineWritingBand(score1, score2) };
  const result: AttemptResult = { ...(attempt.result || {}), writing };

  result.overall = officialStyleOverallBand(attempt.sections || [], {
    reading: result.reading?.band ?? null,
    listening: result.listening?.band ?? null,
    writing: writing.band,
    speaking: result.speaking?.band ?? null,
  }) ?? undefined;

  // §9.1 — amalda Writing va Speaking bitta urinishda birga bo'lmaydi (q.
  // submitAttempt'dagi izoh), lekin status shu qoidaga qat'iy rioya qiladi:
  // boshqa AI-navbatdagi bo'lim hali natija bermagan bo'lsa 'submitted'da qoladi.
  const stillPendingSpeaking = (attempt.sections || []).includes('speaking') && !result.speaking;
  const status = stillPendingSpeaking ? 'submitted' : 'graded';

  await ExamAttempt.updateOne({ _id: attemptId }, { $set: { result, status } });
  return result;
}

/** TZ §19 Faza 4 item 23 — "POST /attempts/:id/grade-speaking". `gradeWritingAttempt`
 * bilan bir xil naqsh (idempotent, AI sinxron chaqiriladi — navbat infratuzilmasi
 * yo'q). Farqi: baholanadigan "matn" avvaldan yig'ilgan (attempt.speaking.recordings,
 * har biri yuklangan paytda allaqachon transkripsiya qilingan — speaking-recording
 * route.js), shuning uchun bu yerda audio bilan ishlash yo'q, faqat mavjud
 * transkriptlarni bitta yaxlit AI so'rovida baholash (speakingGrader.ts). */
export async function gradeSpeakingAttempt(attemptId: string, userId: string): Promise<AttemptResult | null> {
  const attempt = await getOwnedAttempt(attemptId, userId);
  if (attempt.status === 'graded') return attempt.result;
  if (attempt.status !== 'submitted') {
    throw new ExamAttemptError('Urinish hali yakunlanmagan yoki holati mos emas', 409);
  }

  const test = await resolveTestForAttempt(attempt);
  const section = test?.sections.speaking;
  if (!section) throw new ExamAttemptError("Testda Speaking bo'limi yo'q", 400);

  const recordings = attempt.speaking?.recordings || [];
  const speaking = await gradeSpeaking(section, recordings);
  const result: AttemptResult = { ...(attempt.result || {}), speaking };

  result.overall = officialStyleOverallBand(attempt.sections || [], {
    reading: result.reading?.band ?? null,
    listening: result.listening?.band ?? null,
    writing: result.writing?.band ?? null,
    speaking: speaking.band,
  }) ?? undefined;

  const stillPendingWriting = (attempt.sections || []).includes('writing') && !result.writing;
  const status = stillPendingWriting ? 'submitted' : 'graded';

  await ExamAttempt.updateOne({ _id: attemptId }, { $set: { result, status } });
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

  const test = await resolveTestForAttempt(attempt);
  if (!test) throw new ExamAttemptError('Test topilmadi', 404);

  const result: AttemptResult = attempt.result || { timeSpentSec: 0, perQuestion: [] };
  const perQuestion = result.perQuestion || [];
  const detail: AttemptReviewDetail = { overall: result.overall };

  if (test.sections.reading && result.reading) {
    detail.reading = {
      band: result.reading.band,
      raw: result.reading.raw,
      bandEstimated: result.reading.bandEstimated,
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
      bandEstimated: result.listening.bandEstimated,
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

  if (test.sections.speaking && result.speaking) {
    const speakingSection = test.sections.speaking;
    const recordings = (attempt.speaking?.recordings || []) as { part: 1 | 2 | 3; questionIndex: number; audioFileId: string; transcript: string }[];
    const promptFor = (part: 1 | 2 | 3, questionIndex: number): string => {
      if (part === 1) return speakingSection.part1Questions[questionIndex] || '';
      if (part === 3) return speakingSection.part3Questions[questionIndex] || '';
      return speakingSection.part2CueCard.topic;
    };
    detail.speaking = {
      ...result.speaking,
      recordings: recordings
        .slice()
        .sort((a, b) => a.part - b.part || a.questionIndex - b.questionIndex)
        .map((r) => ({
          part: r.part,
          questionIndex: r.questionIndex,
          promptText: promptFor(r.part, r.questionIndex),
          audioFileId: r.audioFileId,
          transcript: r.transcript,
        })),
    };
  }

  return detail;
}

/** TZ §11.1 item 8 / §19 Faza 3 item 17 — "Tarix: oldingi mocklar bilan
 * taqqoslash grafigi". Foydalanuvchining baholangan urinishlarini vaqt
 * bo'yicha (eng eskisidan eng yangisiga — grafik chapdan o'ngga o'sishi
 * uchun) qaytaradi.
 *
 * `mode: 'practice'` ATAYLAB chiqarib tashlanadi — bu "haqiqiy" urinish emas
 * (vaqtsiz, cheksiz qayta tinglash), tarix grafigiga qo'shilsa foydalanuvchi
 * progressini soxta ko'rsatardi (masalan bir xil testni 5 marta mashq qilib,
 * "5 ta urinish" bo'lib chiqishi mumkin edi). */
export async function getAttemptHistory(userId: string, limit = 20): Promise<AttemptHistoryEntry[]> {
  const attempts = await ExamAttempt.find({ userId, status: 'graded', mode: { $ne: 'practice' } })
    .sort({ submittedAt: -1 })
    .limit(limit)
    .select('testId mode submittedAt result')
    .lean();

  const testIds = [...new Set(attempts.map((a: any) => String(a.testId)))];
  const tests = await ExamTest.find({ _id: { $in: testIds } }).select('title').lean();
  const titleById = new Map(tests.map((t: any) => [String(t._id), t.title]));

  return attempts
    .map((a: any) => ({
      id: String(a._id),
      testId: String(a.testId),
      testTitle: titleById.get(String(a.testId)) || '',
      mode: a.mode,
      submittedAt: a.submittedAt ? new Date(a.submittedAt).toISOString() : null,
      overall: a.result?.overall ?? null,
      listening: a.result?.listening?.band ?? null,
      reading: a.result?.reading?.band ?? null,
      writing: a.result?.writing?.band ?? null,
    }))
    .reverse(); // eng eskisi birinchi — grafik chapdan o'ngga o'sadi
}
