// AI-01 worker, S6 "parse_writing" — Task 1/Task 2 topshiriq matnini
// chiqaradi. Rasm (Academic Task 1 grafik/jadval) ni bu bosqich hali
// BIRIKTIRMAYDI — `extract_images` alohida ishlaydi, `assemble.ts` ikkalasini
// birlashtiradi (rasm sahifa raqami bo'yicha, TZ §8 taxminiga ko'ra).
//
// 2026-09-24 — sxema/prompt/normalizator `@/lib/contentAgent/parsers/
// sectionParsers`da (parseListening.ts izohiga q.).
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import {
  WRITING_SCHEMA,
  WRITING_PROMPT_VERSION,
  buildWritingPrompt,
  normalizeWritingTasks,
  type WritingTaskOutput,
} from '@/lib/contentAgent/parsers/sectionParsers';
import type { StageContext } from '../types';
import type { SplitSectionsOutput } from './splitSections';

export type { WritingTaskOutput };

export interface ParseWritingOutput {
  tests: { index: number; tasks: WritingTaskOutput[] }[];
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
      userContent: buildWritingPrompt(sectionText),
      jsonSchema: { name: 'writing_section', schema: WRITING_SCHEMA },
      promptVersion: WRITING_PROMPT_VERSION,
      inputForHash: sectionText,
    });

    tests.push({ index: test.index, tasks: normalizeWritingTasks(data) });
  }

  return { tests };
}
