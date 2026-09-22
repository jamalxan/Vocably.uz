// AI-01 worker orchestrator, S15 "mock_scheduler" — docs/ai-content-agent-
// tz.md §28 "MOCK AUTO-GENERATION" / avtopilot §5: "Har yangi published
// testdan keyin AI ... mixed mock ... uchun candidate setlar generatsiya
// qiladi" + "inventory audit ... kontent gap'ni topadi."
//
// BU ILOVADA alohida "ExamMock" kolleksiyasi YO'Q — "mock" shunchaki
// Listening+Reading+Writing UCHALASI ham bor bitta `ExamTest`
// (`availability.fullMock`, `assemble.ts` allaqachon hisoblaydi;
// `POST /api/exam/attempts` mode:'mock'da tasodifiy shundan birini
// tanlaydi). Shuning uchun bu scheduler ikkita ANIQ, REAL narsa qiladi —
// YANGI KONTENT HECH QACHON TO'QIMAYDI:
//   1. Agar bitta modulda (academic/general) to'liq mock'ga yaroqli
//      (fullMock) nashr qilingan testlar soni chegaradan PAST bo'lsa,
//      LEKIN alohida-alohida nashr qilingan testlarda YETISHMAGAN
//      bo'limlar (masalan bitta testda faqat Reading, boshqasida faqat
//      Listening+Writing) mavjud bo'lsa — ularni BIRLASHTIRIB, yangi
//      "mixed mock" `ExamTest` yaratadi (`source.composedFrom` bilan
//      kelib chiqishi izlanadigan). Hech qanday AI chaqiruvi YO'Q — bu
//      bosqich sof deterministik (allaqachon tasdiqlangan kontentni
//      qayta joylashtirish, yangi extraction emas).
//   2. Kombinatsiya uchun ham manba TOPILMASA — `content_gap_detected`
//      `AgentAction` yozadi (admin panelda ko'rinadi), FAYK kontent
//      YARATMAYDI.
//
// TRIGGER: hozircha alohida cron/BullMQ repeatable job EMAS — har safar
// `auto_publish_gate` (S14) YANGI testni nashr qilganda REAKTIV chaqiriladi
// (`jobRunner.ts`) — bu aslida "har 6 soatda" so'rovdan KO'RA to'g'riroq:
// inventar DARHOL, yangi kontent paydo bo'lgan zahoti yangilanadi, olti
// soatlik kechikishsiz. Vaqt-asosli davriy sweep (masalan hech qanday yangi
// kontent kelmagan uzoq muddatda ham gap'larni qayta tekshirish) — bu ham
// foydali bo'lardi, lekin ALOHIDA BullMQ repeatable job infratuzilmasi
// talab qiladi — keyingi qadam sifatida qoldirilgan (hozircha ATAYLAB
// qurilmagan, xuddi self-heal/auto-publish gate'dan keyingi S16 kabi).
import { ExamTest, AgentAction, AutomationPolicy } from '@/lib/models';
import { canAutoPublish } from '@/lib/contentAgent/autopilotGuards';

const ExamTestModel: any = ExamTest;
const AgentActionModel: any = AgentAction;
const AutomationPolicyModel: any = AutomationPolicy;

const CORE_SECTIONS = ['reading', 'listening', 'writing'] as const;
type CoreSection = (typeof CORE_SECTIONS)[number];

// Boshlang'ich policy — bu ham (xuddi confidence chegaralari kabi, TZ §15
// izohi) ishlab chiqarish statistikasi bilan keyin kalibrlanishi kerak,
// hozircha AutomationPolicy'da alohida maydon YO'Q (kerak bo'lsa keyin
// qo'shiladi — hozircha bu darajadagi tafsilotni policy sxemasiga
// qo'shish ortiqcha bo'lardi).
const MIN_FULL_MOCKS_PER_MODULE = 3;

const SOURCE_TYPE_RISK: Record<string, number> = { own: 0, ai_generated_original: 0, public_domain: 0, licensed: 1, third_party_copyright: 2 };
const PUBLISH_SCOPE_RISK: Record<string, number> = { public: 0, organization: 1, private: 2 };

function worseOf(map: Record<string, number>, a: string, b: string): string {
  return (map[b] ?? 0) > (map[a] ?? 0) ? b : a;
}

export interface ModuleInventory {
  module: string;
  fullMockCount: number;
  gap: number; // MIN_FULL_MOCKS_PER_MODULEdan qancha kam (0 bo'lsa yetarli)
}

export async function auditMockInventory(): Promise<ModuleInventory[]> {
  const tests = await ExamTestModel.find({ isPublished: true }).select('module availability').lean();
  const byModule = new Map<string, number>();
  for (const t of tests) {
    const count = byModule.get(t.module) || 0;
    byModule.set(t.module, count + (t.availability?.fullMock ? 1 : 0));
  }
  return Array.from(byModule.entries()).map(([module, fullMockCount]) => ({
    module,
    fullMockCount,
    gap: Math.max(0, MIN_FULL_MOCKS_PER_MODULE - fullMockCount),
  }));
}

/** `sections` maydonida kerakli bo'lim BOR, lekin `availability.fullMock`
 * FALSE bo'lgan nashr qilingan testlarni topadi — mixed mock uchun xom
 * material nomzodlari. */
async function findSectionCandidates(module: string): Promise<any[]> {
  return ExamTestModel.find({
    isPublished: true,
    module,
    'availability.fullMock': { $ne: true },
    $or: CORE_SECTIONS.map((s) => ({ [`sections.${s}`]: { $exists: true } })),
  })
    .select('sections rights createdBy')
    .lean();
}

function pickSectionSource(candidates: any[], sectionKey: CoreSection, usedIds: Set<string>): any | null {
  const fresh = candidates.find((t) => t.sections?.[sectionKey] && !usedIds.has(String(t._id)));
  if (fresh) return fresh;
  return candidates.find((t) => t.sections?.[sectionKey]) || null; // manba kam bo'lsa qayta ishlatishga ruxsat (MVP evristika)
}

export interface ComposeResult {
  created: boolean;
  testId?: string;
  reason: string;
}

/** Uchta bo'lim uchun manba topib, BITTA yangi "mixed mock" `ExamTest`
 * yaratadi. Hech qanday AI chaqiruvi yo'q (deterministik) — LEGAL-01 gate
 * esa BARIBIR qo'llaniladi: kombinatsiyadagi ENG CHEKLOVCHI (eng xavfli)
 * `rights` qiymati butun compozitga tarqaladi, so'ng `canAutoPublish()`
 * (autopilotGuards.js, LEGAL-01'ning YAGONA haqiqat manbai) qaror beradi —
 * bu yerda qoida QAYTA yozilmaydi. */
export async function tryComposeMixedMock(module: string, level: string): Promise<ComposeResult> {
  const candidates = await findSectionCandidates(module);
  const usedIds = new Set<string>();
  const picks: Partial<Record<CoreSection, any>> = {};

  for (const sectionKey of CORE_SECTIONS) {
    const source = pickSectionSource(candidates, sectionKey, usedIds);
    if (!source) return { created: false, reason: `'${sectionKey}' uchun manba topilmadi (${module})` };
    picks[sectionKey] = source;
    usedIds.add(String(source._id));
  }

  let worstSourceType = 'own';
  let worstPublishScope = 'public';
  for (const source of Object.values(picks)) {
    worstSourceType = worseOf(SOURCE_TYPE_RISK, worstSourceType, source.rights?.sourceType || 'own');
    worstPublishScope = worseOf(PUBLISH_SCOPE_RISK, worstPublishScope, source.rights?.publishScope || 'public');
  }

  // qaScore/threshold ATAYLAB neytral qilib beriladi (1 / 0) — kombinatsiya
  // yangi extraction QILMAYDI, shuning uchun "QA balli" tushunchasi bu yerga
  // tegishli emas; faqat blocker/licence/level qismlari amal qiladi.
  const gate = canAutoPublish({ blockers: 0, qaScore: 1, licence: worstSourceType, publishScope: worstPublishScope, level, autoPublishMinQaScore: 0 });

  const slug = `mixed-mock-${module}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const composite = await ExamTestModel.create({
    slug,
    title: `Mixed Mock — ${module === 'academic' ? 'Academic' : 'General Training'}`,
    module,
    difficulty: 'medium',
    sections: { reading: picks.reading!.sections.reading, listening: picks.listening!.sections.listening, writing: picks.writing!.sections.writing },
    isPublished: gate.allowed,
    createdBy: picks.reading!.createdBy,
    source: { composedFrom: CORE_SECTIONS.map((s) => ({ testId: picks[s]!._id, sectionKey: s })) },
    availability: { practiceReading: true, practiceListening: true, practiceWriting: true, practiceSpeaking: false, fullMock: true },
    rights: { sourceType: worstSourceType, publisher: '', licence: '', licenceNote: 'Boshqa nashr qilingan testlardan avtomatik birlashtirilgan', publishScope: worstPublishScope },
    publishedBy: gate.allowed ? 'ai-agent' : 'admin',
    autoPublishedAt: gate.allowed ? new Date() : null,
  });

  await AgentActionModel.create({
    testId: composite._id,
    action: 'auto_mock_create',
    reasoning: `${module}: ${CORE_SECTIONS.map((s) => `${s}<-${picks[s]!._id}`).join(', ')}${gate.allowed ? '' : ` (nashr qilinmadi: ${gate.reason})`}`,
  });

  return { created: true, testId: String(composite._id), reason: gate.allowed ? 'ok' : `yaratildi, lekin nashr qilinmadi: ${gate.reason}` };
}

export interface MockSchedulerSummary {
  inventory: ModuleInventory[];
  composed: { module: string; testId: string }[];
  gapsDetected: { module: string; reason: string }[];
}

/** S14 auto-publish gate'dan keyin (yoki qo'lda) chaqiriladi — inventarni
 * tekshiradi, kerak bo'lsa (va faqat `level !== 'manual'`da) mixed mock(lar)
 * yaratadi, hali ham kam bo'lsa (manba yetmasa) gap'ni qayd etadi.
 *
 * `level` — bu yerda BITTA kitobga emas, BUTUN inventarga tegishli global
 * harakat, shuning uchun (self-heal/auto-publish gate'dan farqli, ular
 * `ContentBook.automationLevel` override'ini ham tekshiradi) FAQAT global
 * `AutomationPolicy.level` o'qiladi — "bitta kitob" tushunchasi yo'q. */
export async function runMockScheduler(): Promise<MockSchedulerSummary> {
  const globalPolicy = await AutomationPolicyModel.findOne({ scope: 'global' }).lean();
  const level = globalPolicy?.level || 'manual';

  const inventory = await auditMockInventory();
  const composed: MockSchedulerSummary['composed'] = [];
  const gapsDetected: MockSchedulerSummary['gapsDetected'] = [];

  if (level === 'manual') return { inventory, composed, gapsDetected };

  for (const entry of inventory) {
    if (entry.gap <= 0) continue;
    // Har bir yetishmayotgan birlik uchun bittadan urinamiz — cheksiz
    // tsiklga tushmasin uchun `entry.gap` marta bilan cheklangan.
    for (let i = 0; i < entry.gap; i++) {
      const result = await tryComposeMixedMock(entry.module, level);
      if (result.created && result.testId) {
        composed.push({ module: entry.module, testId: result.testId });
      } else {
        gapsDetected.push({ module: entry.module, reason: result.reason });
        await AgentActionModel.create({ action: 'content_gap_detected', reasoning: `${entry.module}: ${result.reason}` });
        break; // shu moduldagi keyingi urinishlar ham xuddi shu manba yetishmasligiga uchraydi
      }
    }
  }

  return { inventory, composed, gapsDetected };
}
