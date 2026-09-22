// AI-01 worker orchestrator, S16 "content_gap_scan" — docs/ai-content-agent-
// tz.md §28: "AI tekshiradi: Academic Reading: 37 sets, Listening Part 4:
// 11 sets, Writing Task 1 process: 2 sets, Speaking Part 2: 5 sets va
// kontent gap'ni topadi."
//
// S15 mock_scheduler'dan FARQI: bu bosqich "to'liq mockga yetadimi"
// darajasida EMAS, ANIQROQ — har MODUL ichida har savol TURI/bo'lim
// bo'yicha necha nusxa borligini sanaydi (masalan "academic reading
// matching_headings: 2 ta" — kam bo'lsa, foydalanuvchi bir xil savol
// turini qayta-qayta ko'radi). MUTLAQO O'QISH-FAQAT (read-only) — hech
// qanday kontent YARATMAYDI, TUZATMAYDI, faqat topilgan bo'shliqni
// `AgentAction(action:'content_gap_detected')`ga yozadi, admin panelda
// ko'rinsin uchun. Kontentni to'ldirish — admin qo'lda yangi kitob
// yuklashi yoki (agar kelajakda qurilsa) S15'ga o'xshash "yangi generatsiya
// qilish" bosqichi ishi, bu yerda EMAS.
//
// ALOHIDA POLICY BAYROG'I: `level`ga (self-heal/auto-publish/mock-scheduler
// kabi) EMAS, `AutomationPolicy.autoContentGapScan` (standart `false`,
// models.js'da ALLAQACHON mavjud edi — bu bosqich qurilishidan OLDIN ham)
// ga bog'liq — bu o'qish-faqat hisobot bo'lsa ham, admin buni ATAYLAB
// yoqishi kerak (standart o'chirilgan, "har safar nashrdan keyin yana bir
// AI tahlili" xarajatini kim xohlamasa majburlamaslik uchun).
import { ExamTest, AgentAction, AutomationPolicy } from '@/lib/models';
import { AI_IMPORT_QUESTION_TYPES } from '@/lib/exam/aiImportSchema';
import { LISTENING_QUESTION_TYPES } from '../lib/listeningQuestionTypes';

const ExamTestModel: any = ExamTest;
const AgentActionModel: any = AgentAction;
const AutomationPolicyModel: any = AutomationPolicy;

const MODULES = ['academic', 'general'] as const;
const LISTENING_PARTS = [1, 2, 3, 4] as const;
const WRITING_TASK_ORDERS = [1, 2] as const;

// Boshlang'ich chegaralar — xuddi MIN_FULL_MOCKS_PER_MODULE (mockScheduler.ts)
// kabi, ishlab chiqarish statistikasi bilan keyin kalibrlanadi.
function minimumFor(dimension: string): number {
  if (dimension === 'reading.passage') return 10;
  if (dimension.startsWith('reading.type.')) return 3;
  if (dimension.startsWith('listening.part.')) return 5;
  if (dimension.startsWith('listening.type.')) return 3;
  if (dimension.startsWith('writing.task.')) return 5;
  if (dimension === 'speaking.section') return 5;
  return 3;
}

export interface DimensionCount {
  module: string;
  dimension: string;
  count: number;
  minimumTarget: number;
}

/** Har (module, dimension) juftligini OLDINDAN 0 bilan "urug'lantiradi" —
 * aks holda BIR MARTA ham ishlatilmagan tur (masalan hech qachon
 * `matching_sentence_endings` chiqmagan) sanoqda UMUMAN ko'rinmay qolardi,
 * garchi bu eng katta bo'shliqning o'zi bo'lsa ham. */
function seedCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const examModule of MODULES) {
    counts.set(`${examModule}::reading.passage`, 0);
    counts.set(`${examModule}::speaking.section`, 0);
    for (const type of AI_IMPORT_QUESTION_TYPES) counts.set(`${examModule}::reading.type.${type}`, 0);
    for (const type of LISTENING_QUESTION_TYPES) counts.set(`${examModule}::listening.type.${type}`, 0);
    for (const part of LISTENING_PARTS) counts.set(`${examModule}::listening.part.${part}`, 0);
    for (const order of WRITING_TASK_ORDERS) counts.set(`${examModule}::writing.task.${order}`, 0);
  }
  return counts;
}

export async function auditContentInventory(): Promise<DimensionCount[]> {
  const counts = seedCounts();
  const bump = (examModule: string, dimension: string) => {
    const key = `${examModule}::${dimension}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  };

  const tests = await ExamTestModel.find({ isPublished: true }).select('module sections').lean();
  for (const test of tests) {
    const examModule = MODULES.includes(test.module) ? test.module : 'academic';

    for (const passage of test.sections?.reading?.passages || []) {
      bump(examModule, 'reading.passage');
      for (const group of passage.questionGroups || []) bump(examModule, `reading.type.${group.type}`);
    }
    for (const part of test.sections?.listening?.parts || []) {
      if (LISTENING_PARTS.includes(part.order)) bump(examModule, `listening.part.${part.order}`);
      for (const group of part.questionGroups || []) bump(examModule, `listening.type.${group.type}`);
    }
    for (const task of test.sections?.writing?.tasks || []) {
      if (WRITING_TASK_ORDERS.includes(task.order)) bump(examModule, `writing.task.${task.order}`);
    }
    if (test.sections?.speaking) bump(examModule, 'speaking.section');
  }

  return Array.from(counts.entries()).map(([key, count]) => {
    const [examModule, dimension] = key.split('::');
    return { module: examModule, dimension, count, minimumTarget: minimumFor(dimension) };
  });
}

export function detectGaps(counts: DimensionCount[]): DimensionCount[] {
  return counts.filter((c) => c.count < c.minimumTarget);
}

export interface ContentGapScanSummary {
  ran: boolean;
  totalDimensions: number;
  gaps: DimensionCount[];
}

/** `AutomationPolicy.autoContentGapScan` (global) yoqilgan bo'lsagina
 * ishlaydi. Topilgan bo'shliqlar BITTA `AgentAction`ga JAMLANADI (har
 * bo'shliq uchun alohida yozuv EMAS — o'nlab qator bilan jurnalni
 * shishirmaslik uchun; `mockScheduler.ts`da modul soni kam (2) bo'lgani
 * uchun u yerda har modul alohida yozilishi mumkin edi, bu yerda
 * o'nlab o'lchov bo'lishi mumkin). */
export async function runContentGapScan(): Promise<ContentGapScanSummary> {
  const globalPolicy = await AutomationPolicyModel.findOne({ scope: 'global' }).lean();
  if (!globalPolicy?.autoContentGapScan) {
    return { ran: false, totalDimensions: 0, gaps: [] };
  }

  const counts = await auditContentInventory();
  const gaps = detectGaps(counts);

  if (gaps.length > 0) {
    // `AgentAction.reasoning` oddiy String — birinchi 30 tasi bilan
    // cheklanadi (audit qatorini o'qib bo'lmas darajada uzun qilmaslik
    // uchun). TO'LIQ ro'yxat hech qayerda saqlanmaydi — chaqiruvchi
    // (`jobRunner.ts`) hozircha bu funksiyaning qaytgan qiymatini faqat
    // xato-tutish uchun ishlatadi, log qilmaydi. Admin panelda to'liq
    // ro'yxat kerak bo'lsa — bu keyingi, alohida ish (masalan alohida
    // `ContentGapReport` hujjati).
    const summary = gaps
      .slice(0, 30)
      .map((g) => `${g.module}/${g.dimension}: ${g.count}/${g.minimumTarget}`)
      .join('; ');
    await AgentActionModel.create({
      action: 'content_gap_detected',
      reasoning: `Content gap scan: ${gaps.length} ta o'lchov chegaradan past — ${summary}${gaps.length > 30 ? ` (+${gaps.length - 30} yana)` : ''}`,
    });
  }

  return { ran: true, totalDimensions: counts.length, gaps };
}
