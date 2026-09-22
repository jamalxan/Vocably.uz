// AI-01 worker orchestrator, S14 "auto_publish_gate" — docs/ai-content-agent-
// tz-avtopilot.md §5: bu bosqich `IngestJobSchema.stage` 13-enum'ining
// TASHQARISIDA (`worker/jobRunner.ts`dagi izohga q. — S12.5/S13/S14/S15/S16
// "asosiy pipeline S1-S12 qurilgandan keyin keladi" bo'lgani uchun alohida
// BullMQ bosqichi/navbat xabari EMAS, `qa` muvaffaqiyatli tugagach TO'G'RIDAN-
// TO'G'RI chaqiriladigan orchestrator funksiyasi).
//
// LEGAL-01 + AI-01 KESISHUVI: bu yerdagi qaror BUTUNLAY `canAutoPublish()`
// (src/lib/contentAgent/autopilotGuards.js, ALLAQACHON 8 ta unit test bilan
// tasdiqlangan, DB'dan MUSTAQIL toza funksiya) orqali qabul qilinadi — bu
// yerda qoidani QAYTA YOZISH yoki "shunga o'xshash" boshqa tekshiruv YO'Q.
// Shu bitta funksiya admin "Nashr qilish" tugmasi (kelajakda shu gate'ga
// ulanishi mumkin) va bu avtopilot yo'lining IKKALASI uchun ham yagona
// haqiqat manbai bo'lib qolishi kerak (TZ §3.3: "ikki joyda ikki xil
// yozilib nomuvofiqlashib qolmasin").
import { ExamTest, ContentBook, AutomationPolicy, AgentAction, ReviewItem } from '@/lib/models';
import { canAutoPublish } from '@/lib/contentAgent/autopilotGuards';

const ExamTestModel: any = ExamTest;
const ContentBookModel: any = ContentBook;
const AutomationPolicyModel: any = AutomationPolicy;
const AgentActionModel: any = AgentAction;
const ReviewItemModel: any = ReviewItem;

export interface AutoPublishResult {
  testId: string;
  published: boolean;
  reason: string;
}

/** `ContentBook.automationLevel` (bitta kitobga override) ustunlik qiladi,
 * bo'lmasa global `AutomationPolicy.level`, u ham bo'lmasa eng xavfsiz
 * standart — `'manual'` (hech narsa avtomatik nashr qilinmaydi). */
async function resolveAutomationLevel(bookId: string): Promise<string> {
  const [book, globalPolicy] = await Promise.all([
    ContentBookModel.findById(bookId).select('automationLevel').lean(),
    AutomationPolicyModel.findOne({ scope: 'global' }).lean(),
  ]);
  return book?.automationLevel || globalPolicy?.level || 'manual';
}

async function resolveAutoPublishMinQaScore(bookId: string): Promise<number | undefined> {
  const [bookPolicy, globalPolicy] = await Promise.all([
    AutomationPolicyModel.findOne({ scope: 'book', bookId }).lean(),
    AutomationPolicyModel.findOne({ scope: 'global' }).lean(),
  ]);
  return (bookPolicy || globalPolicy)?.autoPublishMinQaScore; // undefined bo'lsa canAutoPublish o'zining 0.95 standartini ishlatadi
}

/** Bitta test uchun. `ReviewItem` (severity:'blocker', status:'open')
 * hisobi — `validate.ts` (contentValidator xatolari) VA `qa.ts`
 * (qa_disagreement) IKKALASI HAM shu yerga yozadi, shuning uchun BITTA
 * so'rov ikkalasini ham qamraydi — `ExamTest.qa.blockers`ni ALOHIDA
 * qo'shib QO'SHALOQ hisoblash YO'Q. */
export async function runAutoPublishGate(bookId: string, testId: string): Promise<AutoPublishResult> {
  const test = await ExamTestModel.findById(testId);
  if (!test) return { testId, published: false, reason: 'ExamTest topilmadi' };
  if (test.isPublished) return { testId, published: true, reason: "Allaqachon nashr qilingan" };

  const [level, autoPublishMinQaScore, openBlockerCount] = await Promise.all([
    resolveAutomationLevel(bookId),
    resolveAutoPublishMinQaScore(bookId),
    ReviewItemModel.countDocuments({ testId, severity: 'blocker', status: 'open' }),
  ]);

  const decision = canAutoPublish({
    blockers: openBlockerCount,
    qaScore: test.qa?.score ?? null,
    licence: test.rights?.sourceType,
    publishScope: test.rights?.publishScope,
    level,
    autoPublishMinQaScore,
  });

  if (!decision.allowed) {
    await ContentBookModel.updateOne(
      { _id: bookId },
      { $set: { 'progress.message': `Test ${test.source?.testIndex ?? ''}: avto-nashr rad etildi — ${decision.reason}`.trim() } }
    );
    return { testId, published: false, reason: decision.reason };
  }

  test.isPublished = true;
  test.publishedBy = 'ai-agent';
  test.autoPublishedAt = new Date();
  await test.save();

  await AgentActionModel.create({
    bookId,
    testId,
    action: 'auto_publish',
    reasoning: `qa.score=${test.qa?.score ?? 'n/a'}, openBlockers=0, automationLevel=${level}`,
  });

  return { testId, published: true, reason: 'ok' };
}

/** `qa` bosqichi muvaffaqiyatli tugagandan keyin chaqiriladi
 * (`jobRunner.ts`) — kitobning HAR bir assemble qilingan testi uchun
 * gate'ni sinab ko'radi, so'ng `ContentBook.status`ni yakuniy holatga
 * yangilaydi: barchasi nashr qilingan bo'lsa 'published', ochiq blocker
 * qolgan bo'lsa 'needs_review', aks holda 'ready' (tekshirilgan, lekin
 * avtomatik nashr qilinmagan — admin qo'lda ko'rib chiqishi kerak). */
export async function runAutoPublishGateForBook(bookId: string, testIds: string[]): Promise<AutoPublishResult[]> {
  const results: AutoPublishResult[] = [];
  for (const testId of testIds) {
    results.push(await runAutoPublishGate(bookId, testId));
  }

  const anyOpenBlockers = await ReviewItemModel.exists({ bookId, severity: 'blocker', status: 'open' });
  const allPublished = results.length > 0 && results.every((r) => r.published);
  const status = allPublished ? 'published' : anyOpenBlockers ? 'needs_review' : 'ready';

  await ContentBookModel.updateOne({ _id: bookId }, { $set: { status, updatedAt: new Date() } });

  return results;
}
