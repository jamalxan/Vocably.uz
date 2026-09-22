// AI-01 worker orchestrator, S12.5 "self_heal" — docs/ai-content-agent-tz-
// avtopilot.md §5: `qa` bosqichi bitta savolda AI extraction'i manba
// matnga mos kelmayapti deb topsa (`ReviewItem reason:'qa_disagreement'`,
// `qa.ts` yozadi), bu orchestrator o'sha BITTA savolni QAYTA generatsiya
// qilishga urinadi — butun bo'limni emas (TZ: "faqat shikoyat qilingan
// maydonni qayta generatsiya qiladi, butun guruhni emas").
//
// Ikki bosqichli, HAR IKKALASI HAM haqiqiy AI chaqiruvi:
//   1. Tuzatish — savolning original parse taskKey'i (reading.parse/
//      listening.parse) bilan, faqat shu savol + QA shikoyati kontekstida,
//      to'g'ri javobni ASL matndan qayta chiqaradi.
//   2. Tasdiqlash — `qa.validate` taskKey (MUSTAQIL model oilasi, xuddi
//      `qa.ts`dagi kabi) bilan, yangi javob haqiqatan ham manba matnga mos
//      kelishini MUSTAQIL tekshiradi.
// Faqat IKKALASI HAM muvaffaqiyatli (mos + yetarli ishonch) bo'lsa tuzatish
// qabul qilinadi. `AutomationPolicy.autoSelfHealMaxAttempts` (standart 2)
// urinishdan keyin ham muvaffaqiyatsiz bo'lsa — `ReviewItem.reason`
// `'self_heal_exhausted'`ga o'zgaradi (admin uchun aniq signal: "AI urindi,
// ololmadi"), status hamon 'open' qoladi (odam ko'rib chiqishi kerak).
//
// Faqat `reading`/`listening` + aniq `questionNumber`li itemlar
// qamrab olinadi — `validate.ts` yozgan `validation_failed` itemlarda
// `questionNumber` yo'q (strukturaviy muammolar, "qaysi bitta savol"
// degan savol ma'nosiz), writing/speaking esa "bitta to'g'ri javob"
// tushunchasiga ega emas (insho/nutq, qayta baholash kerak, qayta
// GENERATSIYA emas) — bularning barchasi ATAYLAB o'tkazib yuboriladi.
import { ExamTest, ReviewItem, AgentAction, AutomationPolicy, ContentBook } from '@/lib/models';
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import type { SplitSectionsOutput } from '../stages/splitSections';

const ExamTestModel: any = ExamTest;
const ReviewItemModel: any = ReviewItem;
const AgentActionModel: any = AgentAction;
const AutomationPolicyModel: any = AutomationPolicy;
const ContentBookModel: any = ContentBook;

const PROMPT_VERSION = 'v1';
const SELF_HEALABLE_SECTIONS = new Set(['reading', 'listening']);

const FIX_SCHEMA = {
  type: 'object',
  properties: { accepted: { type: 'array', items: { type: 'string' } }, confidence: { type: 'number' } },
  required: ['accepted', 'confidence'],
};

const VERIFY_SCHEMA = {
  type: 'object',
  properties: { matches: { type: 'boolean' }, confidence: { type: 'number' }, explanation: { type: 'string' } },
  required: ['matches', 'confidence'],
};

function buildFixPrompt(sourceText: string, questionNumber: number, currentAccepted: string[], complaint: string): string {
  return `Quyida IELTS testining bo'lim matni va bitta savol haqida QA (sifat nazorati) topgan MUAMMO berilgan. Vazifang — shu savolning TO'G'RI javobini ASL matndan aniqlash.

ASL MATN:
"""
${sourceText.slice(0, 30000)}
"""

Savol raqami: ${questionNumber}
Hozirgi (ehtimol noto'g'ri) javob: ${JSON.stringify(currentAccepted)}
QA'ning muammosi: ${complaint}

Asl matnni diqqat bilan o'qib, savol ${questionNumber} uchun TO'G'RI javob(lar)ni "accepted" massiviga yoz (bir nechta qabul qilinadigan variant bo'lsa hammasini qo'sh — o'zingdan yangi variant TO'QIMA, faqat matnda borini). "confidence" (0-1) — yangi javobingga ishonching.`;
}

function buildVerifyPrompt(sourceText: string, questionNumber: number, newAccepted: string[]): string {
  return `Quyida ASL matn va savol ${questionNumber} uchun TAKLIF QILINGAN javob bor. MUSTAQIL tekshir (buni sen yaratmagansan) — bu javob asl matnga TO'G'RI mos keladimi?

ASL MATN:
"""
${sourceText.slice(0, 30000)}
"""

Savol ${questionNumber} uchun taklif qilingan javob: ${JSON.stringify(newAccepted)}

"matches" — mos kelsa true, aks holda false. "confidence" (0-1) — ishonching. "explanation" — qisqa sabab.`;
}

function findQuestion(test: any, sectionKey: string, questionNumber: number): { question: any; groupType: string } | null {
  const containers = sectionKey === 'reading' ? test.sections?.reading?.passages : test.sections?.listening?.parts;
  for (const container of containers || []) {
    for (const group of container.questionGroups || []) {
      const question = (group.questions || []).find((q: any) => q.number === questionNumber);
      if (question) return { question, groupType: group.type };
    }
  }
  return null;
}

async function getSelfHealAttemptCount(reviewItemId: string): Promise<number> {
  return AgentActionModel.countDocuments({ reviewItemId, action: 'self_heal' });
}

export interface SelfHealResult {
  reviewItemId: string;
  outcome: 'healed' | 'exhausted' | 'skipped' | 'retrying';
  reason: string;
}

export async function runSelfHealForReviewItem(
  reviewItem: any,
  opts: { maxAttempts: number; autoAcceptConfidence: number }
): Promise<SelfHealResult> {
  const reviewItemId = String(reviewItem._id);
  const sectionKey = reviewItem.target?.sectionKey;
  const questionNumber = reviewItem.target?.questionNumber;

  if (!SELF_HEALABLE_SECTIONS.has(sectionKey) || questionNumber == null) {
    return { reviewItemId, outcome: 'skipped', reason: `self-heal ${sectionKey}/savol-raqamsiz itemlarni qamramaydi` };
  }
  if (!reviewItem.testId) {
    return { reviewItemId, outcome: 'skipped', reason: "ReviewItem'da testId yo'q" };
  }

  const attemptsSoFar = await getSelfHealAttemptCount(reviewItemId);
  if (attemptsSoFar >= opts.maxAttempts) {
    if (reviewItem.reason !== 'self_heal_exhausted') {
      await ReviewItemModel.updateOne({ _id: reviewItemId }, { $set: { reason: 'self_heal_exhausted' } });
    }
    return { reviewItemId, outcome: 'exhausted', reason: `${attemptsSoFar}/${opts.maxAttempts} urinish sarflangan` };
  }

  const test = await ExamTestModel.findById(reviewItem.testId);
  if (!test) return { reviewItemId, outcome: 'skipped', reason: 'ExamTest topilmadi' };

  const found = findQuestion(test, sectionKey, questionNumber);
  if (!found) return { reviewItemId, outcome: 'skipped', reason: `Savol ${questionNumber} testda topilmadi (${sectionKey})` };

  let sourceText = '';
  try {
    const split = (await requireStageOutput(String(test.source.bookId), 'split_sections')) as SplitSectionsOutput;
    const sourceTest = split.tests.find((t) => t.index === test.source.testIndex);
    sourceText = (sourceTest?.sections as any)?.[sectionKey] || '';
  } catch {
    return { reviewItemId, outcome: 'skipped', reason: "Manba matn (split_sections) hali tayyor emas" };
  }
  if (!sourceText.trim()) return { reviewItemId, outcome: 'skipped', reason: 'Manba matn bo\'sh' };

  const taskKey = sectionKey === 'reading' ? 'reading.parse' : 'listening.parse';
  const currentAccepted: string[] = found.question.answer?.accepted || [];
  const complaint = reviewItem.evidence?.rawText || 'Aniqlanmagan nomuvofiqlik';
  let totalCostUsd = 0;

  let fix: { accepted: string[]; confidence: number };
  try {
    const { data, costUsd } = await runAiStage<{ accepted?: string[]; confidence?: number }>({
      taskKey,
      bookId: String(test.source.bookId),
      jobId: reviewItemId, // bu orchestrator harakati alohida IngestJob'ga ega emas — ReviewItem ID audit uchun yetarli identifikator
      systemPrompt: "Sen IELTS savol javobini asl matndan aniqlaydigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
      userContent: buildFixPrompt(sourceText, questionNumber, currentAccepted, complaint),
      jsonSchema: { name: 'self_heal_fix', schema: FIX_SCHEMA },
      promptVersion: PROMPT_VERSION,
      inputForHash: `${reviewItemId}:${attemptsSoFar}:fix`,
    });
    totalCostUsd += costUsd;
    fix = { accepted: (data.accepted || []).filter(Boolean), confidence: data.confidence ?? 0 };
  } catch (err) {
    await AgentActionModel.create({
      bookId: test.source.bookId,
      testId: test._id,
      reviewItemId,
      action: 'self_heal',
      reasoning: `Tuzatish chaqiruvi muvaffaqiyatsiz: ${(err as Error).message}`,
      beforeConfidence: reviewItem.confidence ?? null,
      afterConfidence: null,
      costUsd: totalCostUsd,
    });
    return { reviewItemId, outcome: 'retrying', reason: 'AI tuzatish chaqiruvi muvaffaqiyatsiz — keyingi safar qayta uriniladi' };
  }

  if (fix.accepted.length === 0) {
    await AgentActionModel.create({
      bookId: test.source.bookId,
      testId: test._id,
      reviewItemId,
      action: 'self_heal',
      reasoning: "AI to'g'ri javob topa olmadi (bo'sh 'accepted')",
      beforeConfidence: reviewItem.confidence ?? null,
      afterConfidence: fix.confidence,
      costUsd: totalCostUsd,
    });
    return { reviewItemId, outcome: attemptsSoFar + 1 >= opts.maxAttempts ? 'exhausted' : 'retrying', reason: "Tuzatish bo'sh javob qaytardi" };
  }

  // MUSTAQIL tasdiqlash — o'z-o'zini tekshirish emas (qa.ts bilan bir xil
  // "boshqa model oilasi" tamoyili, DEFAULT_MODEL_MATRIX'da qa.validate ->
  // Claude, reading/listening.parse -> Gemini, aiRouter.js izohiga q.).
  let verify: { matches: boolean; confidence: number };
  try {
    const { data, costUsd } = await runAiStage<{ matches?: boolean; confidence?: number }>({
      taskKey: 'qa.validate',
      bookId: String(test.source.bookId),
      jobId: reviewItemId,
      systemPrompt: "Sen IELTS kontentini MUSTAQIL tekshiradigan tafitchisan. Faqat so'ralgan JSON'ni qaytar.",
      userContent: buildVerifyPrompt(sourceText, questionNumber, fix.accepted),
      jsonSchema: { name: 'self_heal_verify', schema: VERIFY_SCHEMA },
      promptVersion: PROMPT_VERSION,
      inputForHash: `${reviewItemId}:${attemptsSoFar}:verify:${fix.accepted.join(',')}`,
    });
    totalCostUsd += costUsd;
    verify = { matches: !!data.matches, confidence: data.confidence ?? 0 };
  } catch {
    verify = { matches: false, confidence: 0 };
  }

  const healed = verify.matches && verify.confidence >= opts.autoAcceptConfidence;

  await AgentActionModel.create({
    bookId: test.source.bookId,
    testId: test._id,
    reviewItemId,
    action: 'self_heal',
    reasoning: healed ? `Tuzatildi: ${JSON.stringify(fix.accepted)}` : `Tasdiqlanmadi (matches=${verify.matches}, confidence=${verify.confidence})`,
    beforeConfidence: reviewItem.confidence ?? null,
    afterConfidence: verify.confidence,
    costUsd: totalCostUsd,
  });

  if (!healed) {
    const attemptsNow = attemptsSoFar + 1;
    if (attemptsNow >= opts.maxAttempts) {
      await ReviewItemModel.updateOne({ _id: reviewItemId }, { $set: { reason: 'self_heal_exhausted' } });
      return { reviewItemId, outcome: 'exhausted', reason: `${attemptsNow}/${opts.maxAttempts} urinishdan keyin ham tasdiqlanmadi` };
    }
    return { reviewItemId, outcome: 'retrying', reason: 'Tasdiqlanmadi, keyingi safar qayta uriniladi' };
  }

  found.question.answer = { accepted: fix.accepted };
  test.markModified('sections');
  await test.save();

  await ReviewItemModel.updateOne({ _id: reviewItemId }, { $set: { status: 'fixed', fixedBy: 'ai-agent', fixedAt: new Date() } });

  return { reviewItemId, outcome: 'healed', reason: 'ok' };
}

/** `qa` bosqichi muvaffaqiyatli tugagandan keyin chaqiriladi
 * (`jobRunner.ts`, `runAutoPublishGateForBook`dan OLDIN — davolangan
 * savollar auto-publish gate'ning blocker hisobiga TO'G'RI ta'sir qilishi
 * uchun). `level:'manual'`da BUTUNLAY o'tkazib yuboriladi — self-heal ham
 * avtonom AI harakati, policy'dan mustaqil emas. */
export async function runSelfHealForBook(bookId: string): Promise<{ healed: number; exhausted: number; skipped: number; retrying: number }> {
  const [book, globalPolicy, bookPolicy] = await Promise.all([
    ContentBookModel.findById(bookId).select('automationLevel').lean(),
    AutomationPolicyModel.findOne({ scope: 'global' }).lean(),
    AutomationPolicyModel.findOne({ scope: 'book', bookId }).lean(),
  ]);
  const level = book?.automationLevel || globalPolicy?.level || 'manual';
  if (level === 'manual') return { healed: 0, exhausted: 0, skipped: 0, retrying: 0 };

  const effectivePolicy = bookPolicy || globalPolicy;
  const maxAttempts = effectivePolicy?.autoSelfHealMaxAttempts ?? 2;
  const autoAcceptConfidence = effectivePolicy?.autoAcceptConfidence ?? 0.93;

  const openItems = await ReviewItemModel.find({ bookId, severity: 'blocker', status: 'open', reason: 'qa_disagreement' }).lean();

  const counts = { healed: 0, exhausted: 0, skipped: 0, retrying: 0 };
  for (const item of openItems) {
    const result = await runSelfHealForReviewItem(item, { maxAttempts, autoAcceptConfidence });
    counts[result.outcome] += 1;
  }
  return counts;
}
