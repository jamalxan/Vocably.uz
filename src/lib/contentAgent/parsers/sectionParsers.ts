// Listening / Writing / Speaking bo'lim matnini `src/lib/exam/types.ts`
// shakliga o'giradigan SOF qatlam: JSON sxema + prompt + normalizator.
// Reading uchun bunday modul allaqachon bor — `src/lib/exam/aiImportSchema.ts`
// (`buildAiImportPrompt`/`normalizeAiPassages`), shuning uchun bu yerda
// TAKRORLANMAYDI.
//
// Avval bu mantiq `worker/stages/parseListening.ts`, `parseWriting.ts`,
// `parseSpeaking.ts` ichida edi va faqat worker (Redis+R2+BullMQ) orqali
// ishga tushardi. Admin AI chat (2026-09-24) aynan shu ishni worker'siz —
// admin faylni chatga tashlagan zahoti — bajarishi kerak, shuning uchun sof
// qism shu yerga ko'chirildi; worker bosqichlari endi shu moduldan import
// qiladi (ikkala oqim bitta prompt/sxemani baham ko'radi, natija shakli
// kafolatlangan holda bir xil bo'ladi).
import type { QuestionGroup, QuestionType } from '@/lib/exam/types';

// Listening-legal savol turlari. map/plan/diagram_label ATAYLAB yo'q — ular
// rasm + hotspot koordinatalarini talab qiladi, matn-only oqimda ishonchli
// to'ldirib bo'lmaydi (aiImportSchema.ts'dagi diagram_label bilan bir xil sabab).
export const LISTENING_QUESTION_TYPES = [
  'multiple_choice_single',
  'multiple_choice_multi',
  'sentence_completion',
  'short_answer',
  'note_completion',
  'table_completion',
  'flowchart_completion',
  'summary_completion',
  'summary_completion_bank',
  'matching_features',
  'matching_sentence_endings',
  'form_completion',
];

export function escapeHtml(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================================
// Listening
// ============================================================================

const LISTENING_GROUP_SCHEMA = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: LISTENING_QUESTION_TYPES },
    instruction: { type: 'string' },
    stemHtml: { type: 'string' },
    wordLimit: { type: 'object', properties: { maxWords: { type: 'integer' }, maxNumbers: { type: 'integer' }, label: { type: 'string' } } },
    bank: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, text: { type: 'string' } }, required: ['key', 'text'] } },
    needsReview: { type: 'boolean' },
    reviewReason: { type: 'string' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          number: { type: 'integer' },
          prompt: { type: 'string' },
          options: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, text: { type: 'string' } }, required: ['key', 'text'] } },
          selectCount: { type: 'integer' },
          accepted: { type: 'array', items: { type: 'string' } },
        },
        required: ['number', 'accepted'],
      },
    },
  },
  required: ['type', 'instruction', 'questions'],
};

const LISTENING_PART_SCHEMA = {
  type: 'object',
  properties: {
    order: { type: 'integer' },
    contextText: { type: 'string' },
    questionGroups: { type: 'array', items: LISTENING_GROUP_SCHEMA },
  },
  required: ['order', 'questionGroups'],
};

export const LISTENING_SCHEMA = {
  type: 'object',
  properties: { parts: { type: 'array', items: LISTENING_PART_SCHEMA } },
  required: ['parts'],
};

export const LISTENING_PROMPT_VERSION = 'v1';

export function buildListeningPrompt(sectionText: string, answerKeyText = ''): string {
  return `Quyida bitta IELTS testining BUTUN Listening bo'limi (odatda 4 ta part, har birida savollar) — xom matn berilgan. Buni strukturali JSON'ga o'gir.

XOM MATN:
"""
${sectionText.slice(0, 40000)}
"""
${answerKeyText ? `\nJAVOB KALITI (shu bo'limga tegishli qismini ishlat):\n"""\n${answerKeyText.slice(0, 8000)}\n"""\n` : ''}
Qoidalar:
- Har part uchun: order (1-4), contextText (agar "You will hear..." kabi kontekst jumla bo'lsa), questionGroups.
- Har savol guruhi uchun: type FAQAT ruxsat etilgan turlardan biri. Noaniq bo'lsa yoki rasm/xarita talab qiladigan tur bo'lsa (masalan map/plan/diagram label) — needsReview:true va reviewReason yoz, majburan boshqa turga almashtirma.
- stemHtml/{{qN}} — note/table/flowchart/summary/form completion uchun umumiy karkas (masalan "<table>...<td>{{q14}}</td>...</table>").
- accepted — javob kalitidagi to'g'ri javob(lar). Javob kaliti berilmagan bo'lsa yoki topilmasa, accepted'ni BO'SH massiv qoldir va guruhga needsReview:true qo'y — javobni O'YLAB TOPMA.
- O'zingdan hech narsa TO'QIMA — faqat berilgan matndan chiqar.`;
}

export interface AiListeningPart {
  order: number;
  contextText?: string;
  questionGroups: {
    type: string;
    instruction: string;
    stemHtml?: string;
    wordLimit?: { maxWords?: number; maxNumbers?: number; label?: string };
    bank?: { key: string; text: string }[];
    needsReview?: boolean;
    reviewReason?: string;
    questions: { number: number; prompt?: string; options?: { key: string; text: string }[]; selectCount?: number; accepted: string[] }[];
  }[];
}

export interface ListeningPartOutput {
  order: number;
  contextText: string;
  questionGroups: QuestionGroup[];
}

export interface ParsedListening {
  parts: ListeningPartOutput[];
  needsReview: { partOrder: number; groupId: string; type: string; reason: string }[];
}

// Modellar tur nomini ko'pincha "qisqartirib" qaytaradi ("form",
// "note", "multiple_choice"). Bu xaritasiz ular `short_answer`ga
// zaxiralanib, savol turi jimgina buzilardi — HAQIQIY chaqiruvda
// kuzatilgan (2026-09-24 smoke-test: Groq `type:"form"` qaytardi).
const TYPE_ALIASES: Record<string, string> = {
  form: 'form_completion',
  note: 'note_completion',
  notes: 'note_completion',
  note_completion_table: 'table_completion',
  table: 'table_completion',
  flowchart: 'flowchart_completion',
  flow_chart: 'flowchart_completion',
  summary: 'summary_completion',
  sentence: 'sentence_completion',
  short: 'short_answer',
  multiple_choice: 'multiple_choice_single',
  mcq: 'multiple_choice_single',
  matching: 'matching_features',
};

function canonicalType(raw: string, allowed: string[]): string | null {
  const key = String(raw || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (allowed.includes(key)) return key;
  const alias = TYPE_ALIASES[key];
  return alias && allowed.includes(alias) ? alias : null;
}

function toAcceptedArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.flat(2).filter((v) => typeof v === 'string' && v.trim()) as string[];
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
}

/** Guruh darajasida `accepted` berilib, `questions` berilmagan holat
 * (modelning tez-tez uchraydigan "yassilashtirishi"): `stemHtml`dagi
 * `{{qN}}` joylari bo'yicha savollar TIKLANADI. Aks holda butun guruh
 * savolsiz — ya'ni foydasiz — bo'lib qolardi. */
function rebuildQuestionsFromStem(stemHtml: string | undefined, accepted: unknown): { number: number; accepted: string[] }[] {
  const numbers = Array.from(String(stemHtml || '').matchAll(/\{\{q(\d+)\}\}/g)).map((m) => Number(m[1]));
  if (numbers.length === 0) return [];

  const raw = Array.isArray(accepted) ? accepted : [];
  return numbers.map((number, i) => ({
    number,
    accepted: toAcceptedArray(raw[i]),
  }));
}

/** AI javobini `ListeningPart.questionGroups` shakliga o'giradi. `idPrefix` —
 * guruh id'lari global noyob bo'lishi uchun (worker'da `t{testIndex}`,
 * admin chatda `a{attachmentId}` kabi). */
export function normalizeListeningParts(data: { parts?: AiListeningPart[] }, idPrefix: string): ParsedListening {
  const needsReview: ParsedListening['needsReview'] = [];
  const parts: ListeningPartOutput[] = (data.parts || []).map((p, pi) => ({
    order: Number.isFinite(p.order) ? p.order : pi + 1,
    contextText: escapeHtml(p.contextText || ''),
    questionGroups: (p.questionGroups || []).map((g: any, gi) => {
      const order = Number.isFinite(p.order) ? p.order : pi + 1;
      const id = `${idPrefix}-p${order}-g${gi + 1}`;
      const canonical = canonicalType(g.type, LISTENING_QUESTION_TYPES);
      const type = (canonical || 'short_answer') as QuestionType;
      if (!canonical || g.needsReview) {
        needsReview.push({ partOrder: order, groupId: id, type: g.type, reason: g.reviewReason || `Noma'lum yoki noaniq tur: ${g.type}` });
      }

      // Savollar berilmagan bo'lsa — stemHtml'dagi {{qN}} joylaridan tiklaymiz.
      const rawQuestions = Array.isArray(g.questions) && g.questions.length
        ? g.questions
        : rebuildQuestionsFromStem(g.stemHtml, g.accepted);
      if (!Array.isArray(g.questions) || g.questions.length === 0) {
        needsReview.push({
          partOrder: order,
          groupId: id,
          type: g.type,
          reason: rawQuestions.length
            ? "Model savollarni guruh darajasida yassilashtirib qaytardi — javoblar {{qN}} joylari bo'yicha tiklandi, tekshiring."
            : 'Guruhda savol topilmadi.',
        });
      }

      return {
        id,
        type,
        instructionHtml: escapeHtml(g.instruction || ''),
        stemHtml: g.stemHtml?.trim() || undefined,
        wordLimit: g.wordLimit?.maxWords
          ? { maxWords: g.wordLimit.maxWords, maxNumbers: g.wordLimit.maxNumbers, label: g.wordLimit.label || `NO MORE THAN ${g.wordLimit.maxWords} WORDS` }
          : undefined,
        bank: g.bank?.length ? g.bank.map((b: any) => ({ key: (b.key || '').toUpperCase(), text: b.text || '' })) : undefined,
        questions: rawQuestions.map((q: any) => ({
          number: q.number,
          promptHtml: escapeHtml(q.prompt || ''),
          options: q.options?.map((o: any) => ({ key: (o.key || '').toUpperCase(), text: o.text || '' })),
          selectCount: q.selectCount || undefined,
          answer: { accepted: toAcceptedArray(q.accepted) },
        })),
      };
    }),
  }));

  return { parts, needsReview };
}

// ============================================================================
// Writing
// ============================================================================

export const WRITING_SCHEMA = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          order: { type: 'integer' },
          minWords: { type: 'integer' },
          promptText: { type: 'string' },
          hasVisual: { type: 'boolean' },
          visualPageHint: { type: 'integer' },
        },
        required: ['order', 'promptText'],
      },
    },
  },
  required: ['tasks'],
};

export const WRITING_PROMPT_VERSION = 'v1';

export function buildWritingPrompt(sectionText: string): string {
  return `Quyida bitta IELTS testining Writing bo'limi (Task 1 va Task 2) matni berilgan.

XOM MATN:
"""
${sectionText.slice(0, 12000)}
"""

Har task uchun: order (1 yoki 2), minWords (Task 1 uchun odatda 150, Task 2 uchun 250), promptText (topshiriqning TO'LIQ matni), hasVisual (Task 1'da grafik/jadval/diagramma bo'lsa true — buni matn ichida "The chart/graph/table below shows..." kabi iboradan bilib olasan), visualPageHint (agar aniq bilsang, shu rasm qaysi sahifada bo'lishi mumkinligini taxmin qil, aks holda qoldirib ket).`;
}

export interface WritingTaskOutput {
  order: 1 | 2;
  minWords: 150 | 250;
  recommendedMin: 20 | 40;
  promptHtml: string;
  hasVisual: boolean;
  visualPageHint?: number;
}

export function normalizeWritingTasks(data: {
  tasks?: { order: number; minWords?: number; promptText: string; hasVisual?: boolean; visualPageHint?: number }[];
}): WritingTaskOutput[] {
  return (data.tasks || []).map((t) => {
    const order = (t.order === 2 ? 2 : 1) as 1 | 2;
    return {
      order,
      minWords: (order === 1 ? 150 : 250) as 150 | 250,
      recommendedMin: (order === 1 ? 20 : 40) as 20 | 40,
      promptHtml: `<p>${escapeHtml(t.promptText || '')}</p>`,
      hasVisual: !!t.hasVisual,
      visualPageHint: t.visualPageHint,
    };
  });
}

// ============================================================================
// Speaking
// ============================================================================

export const SPEAKING_SCHEMA = {
  type: 'object',
  properties: {
    part1Questions: { type: 'array', items: { type: 'string' } },
    part2CueCard: {
      type: 'object',
      properties: { topic: { type: 'string' }, bulletPoints: { type: 'array', items: { type: 'string' } } },
    },
    part3Questions: { type: 'array', items: { type: 'string' } },
  },
  required: ['part1Questions', 'part3Questions'],
};

export const SPEAKING_PROMPT_VERSION = 'v1';

export function buildSpeakingPrompt(sectionText: string): string {
  return `Quyida bitta IELTS testining Speaking bo'limi matni berilgan (Part 1 savollari, Part 2 cue card, Part 3 savollari).

XOM MATN:
"""
${sectionText.slice(0, 8000)}
"""

part1Questions — Part 1'dagi barcha savollar ro'yxati. part2CueCard — {topic, bulletPoints} (cue card mavzusi + "You should say:" ostidagi punktlar). part3Questions — Part 3'dagi barcha savollar. O'zingdan savol TO'QIMA — faqat berilgan matndan chiqar.`;
}

export interface SpeakingSectionOutput {
  part1Questions: string[];
  part2CueCard: { topic: string; bulletPoints: string[]; prepSec: number; speakSec: number };
  part3Questions: string[];
}

export function normalizeSpeakingSection(data: {
  part1Questions?: string[];
  part2CueCard?: { topic?: string; bulletPoints?: string[] };
  part3Questions?: string[];
}): SpeakingSectionOutput {
  return {
    part1Questions: (data.part1Questions || []).filter(Boolean),
    part2CueCard: {
      topic: data.part2CueCard?.topic || '',
      bulletPoints: (data.part2CueCard?.bulletPoints || []).filter(Boolean),
      prepSec: 60,
      speakSec: 120,
    },
    part3Questions: (data.part3Questions || []).filter(Boolean),
  };
}
