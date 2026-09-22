// AI-01 worker, S6 "parse_writing" — Task 1/Task 2 topshiriq matnini
// chiqaradi. Rasm (Academic Task 1 grafik/jadval) ni bu bosqich hali
// BIRIKTIRMAYDI — `extract_images` alohida ishlaydi, `assemble.ts` ikkalasini
// birlashtiradi (rasm sahifa raqami bo'yicha, TZ §8 taxminiga ko'ra).
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import type { StageContext } from '../types';
import type { SplitSectionsOutput } from './splitSections';

const PROMPT_VERSION = 'v1';

const WRITING_SCHEMA = {
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

function buildPrompt(sectionText: string): string {
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

export interface ParseWritingOutput {
  tests: { index: number; tasks: WritingTaskOutput[] }[];
}

function escapeHtml(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function runParseWriting(ctx: StageContext): Promise<ParseWritingOutput> {
  const splitOutput = (await requireStageOutput(ctx.job.bookId, 'split_sections')) as SplitSectionsOutput;

  const tests: ParseWritingOutput['tests'] = [];
  for (const test of splitOutput.tests) {
    const sectionText = test.sections.writing?.trim();
    if (!sectionText) continue;

    const { data } = await runAiStage<{ tasks?: { order: number; minWords?: number; promptText: string; hasVisual?: boolean; visualPageHint?: number }[] }>({
      taskKey: 'writing.parse',
      bookId: ctx.job.bookId,
      jobId: ctx.job._id,
      systemPrompt: "Sen IELTS Writing topshiriqlarini JSON strukturaga o'giradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
      userContent: buildPrompt(sectionText),
      jsonSchema: { name: 'writing_section', schema: WRITING_SCHEMA },
      promptVersion: PROMPT_VERSION,
      inputForHash: sectionText,
    });

    const tasks: WritingTaskOutput[] = (data.tasks || []).map((t) => {
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

    tests.push({ index: test.index, tasks });
  }

  return { tests };
}
