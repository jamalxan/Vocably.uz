// AI-01 worker, S5 "parse_listening" — bitta testning 4 ta Listening
// part'idagi savol GURUHLARINI JSON'ga o'giradi (audio/transkript emas — bu
// `parse_listening`ning ishi emas, printsipial jihatdan savol MATNI kitobda
// bosilgan, transkript alohida "Audioscripts" sahifalarida, `split_sections`
// uni allaqachon `audioscriptText`ga ajratib qo'ygan; part-part aniq
// moslashtirish — assemble.ts/process_audio ishi, hozircha oddiy string
// sifatida saqlanadi).
//
// Reading uchun (`parseReading.ts`) 15 tur to'liq qamrab olindi; bu yerda
// ATAYLAB qisqaroq, lekin Listening'ga xos 12 turni qamraydigan sxema —
// bir xil naqsh (`type`, `bank`, `stemHtml`, `wordLimit`, `selectCount`),
// diagram/map/plan_label (rasm+hotspot koordinata talab qiladi, matn-only
// pipeline'da ishonchli to'ldirib bo'lmaydi) ATAYLAB CHIQARIB TASHLANGAN —
// Reading'dagi diagram_label bilan bir xil sabab (aiImportSchema.ts izohiga q.).
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import { LISTENING_QUESTION_TYPES } from '../lib/listeningQuestionTypes';
import type { StageContext } from '../types';
import type { SplitSectionsOutput } from './splitSections';
import type { QuestionGroup, QuestionType } from '@/lib/exam/types';

const PROMPT_VERSION = 'v1';

const GROUP_SCHEMA = {
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

const PART_SCHEMA = {
  type: 'object',
  properties: {
    order: { type: 'integer' },
    contextText: { type: 'string' },
    questionGroups: { type: 'array', items: GROUP_SCHEMA },
  },
  required: ['order', 'questionGroups'],
};

const LISTENING_SCHEMA = { type: 'object', properties: { parts: { type: 'array', items: PART_SCHEMA } }, required: ['parts'] };

function buildPrompt(sectionText: string): string {
  return `Quyida bitta IELTS testining BUTUN Listening bo'limi (4 ta part, har birida savollar) — xom matn berilgan. Buni strukturali JSON'ga o'gir.

XOM MATN:
"""
${sectionText.slice(0, 40000)}
"""

Qoidalar:
- Har part uchun: order (1-4), contextText (agar "You will hear..." kabi kontekst jumla bo'lsa), questionGroups.
- Har savol guruhi uchun: type FAQAT ruxsat etilgan 12 tadan biri. Noaniq bo'lsa yoki rasm/xarita talab qiladigan tur bo'lsa (masalan map/plan/diagram label) — needsReview:true qo'y, majburan boshqa turga almashtirma.
- stemHtml/{{qN}} — note/table/flowchart/summary completion uchun umumiy karkas (masalan "<table>...<td>{{q14}}</td>...</table>").
- O'zingdan hech narsa TO'QIMA — faqat berilgan matndan chiqar.`;
}

function escapeHtml(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

interface AiPart {
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

export interface ParseListeningOutput {
  tests: { index: number; parts: ListeningPartOutput[]; needsReview: { testIndex: number; partOrder: number; groupId: string; type: string; reason: string }[] }[];
}

export async function runParseListening(ctx: StageContext): Promise<ParseListeningOutput> {
  const splitOutput = (await requireStageOutput(ctx.job.bookId, 'split_sections')) as SplitSectionsOutput;

  const tests: ParseListeningOutput['tests'] = [];
  for (const test of splitOutput.tests) {
    const sectionText = test.sections.listening?.trim();
    if (!sectionText) continue;

    const { data } = await runAiStage<{ parts?: AiPart[] }>({
      taskKey: 'listening.parse',
      bookId: ctx.job.bookId,
      jobId: ctx.job._id,
      systemPrompt: "Sen IELTS Listening kontentini JSON strukturaga o'giradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
      userContent: buildPrompt(sectionText),
      jsonSchema: { name: 'listening_section', schema: LISTENING_SCHEMA },
      promptVersion: PROMPT_VERSION,
      inputForHash: sectionText,
    });

    const needsReview: ParseListeningOutput['tests'][number]['needsReview'] = [];
    const parts: ListeningPartOutput[] = (data.parts || []).map((p) => ({
      order: p.order,
      contextText: escapeHtml(p.contextText || ''),
      questionGroups: (p.questionGroups || []).map((g, gi) => {
        const id = `t${test.index}-p${p.order}-g${gi + 1}`;
        const type = (LISTENING_QUESTION_TYPES.includes(g.type) ? g.type : 'short_answer') as QuestionType;
        if (g.type !== type || g.needsReview) {
          needsReview.push({ testIndex: test.index, partOrder: p.order, groupId: id, type: g.type, reason: g.reviewReason || `Noma'lum yoki noaniq tur: ${g.type}` });
        }
        return {
          id,
          type,
          instructionHtml: escapeHtml(g.instruction || ''),
          stemHtml: g.stemHtml?.trim() || undefined,
          wordLimit: g.wordLimit?.maxWords ? { maxWords: g.wordLimit.maxWords, maxNumbers: g.wordLimit.maxNumbers, label: g.wordLimit.label || `NO MORE THAN ${g.wordLimit.maxWords} WORDS` } : undefined,
          bank: g.bank?.length ? g.bank.map((b) => ({ key: (b.key || '').toUpperCase(), text: b.text || '' })) : undefined,
          questions: (g.questions || []).map((q) => ({
            number: q.number,
            promptHtml: escapeHtml(q.prompt || ''),
            options: q.options?.map((o) => ({ key: (o.key || '').toUpperCase(), text: o.text || '' })),
            selectCount: q.selectCount || undefined,
            answer: { accepted: (q.accepted || []).filter(Boolean) },
          })),
        };
      }),
    }));

    tests.push({ index: test.index, parts, needsReview });
  }

  return { tests };
}
