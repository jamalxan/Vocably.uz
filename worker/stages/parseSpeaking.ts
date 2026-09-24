// AI-01 worker — Speaking bo'limi (part1Questions/part2CueCard/part3Questions)
// odatda kitobning Writing/Reading/Listening'dan ALOHIDA, kichik bir
// bo'limida (yoki umuman yo'q — ko'p practice kitoblarida Speaking mavjud
// emas). `segment` bosqichi buni alohida sahifa oralig'i sifatida
// aniqlamasligi mumkin — shuning uchun bu bosqich `test.sections.speaking`
// bo'sh bo'lsa jimgina o'tkazib yuboradi (xato emas).
//
// 2026-09-24 — sxema/prompt/normalizator `@/lib/contentAgent/parsers/
// sectionParsers`da (parseListening.ts izohiga q.).
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import {
  SPEAKING_SCHEMA,
  SPEAKING_PROMPT_VERSION,
  buildSpeakingPrompt,
  normalizeSpeakingSection,
  type SpeakingSectionOutput,
} from '@/lib/contentAgent/parsers/sectionParsers';
import type { StageContext } from '../types';
import type { SplitSectionsOutput } from './splitSections';

export type { SpeakingSectionOutput };

export interface ParseSpeakingOutput {
  tests: { index: number; speaking: SpeakingSectionOutput | null }[];
}

export async function runParseSpeaking(ctx: StageContext): Promise<ParseSpeakingOutput> {
  const splitOutput = (await requireStageOutput(ctx.job.bookId, 'split_sections')) as SplitSectionsOutput;

  const tests: ParseSpeakingOutput['tests'] = [];
  for (const test of splitOutput.tests) {
    const sectionText = test.sections.speaking?.trim();
    if (!sectionText) {
      tests.push({ index: test.index, speaking: null });
      continue;
    }

    const { data } = await runAiStage<{ part1Questions?: string[]; part2CueCard?: { topic?: string; bulletPoints?: string[] }; part3Questions?: string[] }>({
      taskKey: 'speaking.parse',
      bookId: ctx.job.bookId,
      jobId: ctx.job._id,
      systemPrompt: "Sen IELTS Speaking savollarini JSON strukturaga o'giradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
      userContent: buildSpeakingPrompt(sectionText),
      jsonSchema: { name: 'speaking_section', schema: SPEAKING_SCHEMA },
      promptVersion: SPEAKING_PROMPT_VERSION,
      inputForHash: sectionText,
    });

    tests.push({ index: test.index, speaking: normalizeSpeakingSection(data) });
  }

  return { tests };
}
