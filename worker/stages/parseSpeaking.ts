// AI-01 worker — Speaking bo'limi (part1Questions/part2CueCard/part3Questions)
// odatda kitobning Writing/Reading/Listening'dan ALOHIDA, kichik bir
// bo'limida (yoki umuman yo'q — ko'p practice kitoblarida Speaking mavjud
// emas). `segment` bosqichi buni alohida sahifa oralig'i sifatida
// aniqlamasligi mumkin — shuning uchun bu bosqich `test.sections.speaking`
// bo'sh bo'lsa jimgina o'tkazib yuboradi (xato emas).
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import type { StageContext } from '../types';
import type { SplitSectionsOutput } from './splitSections';

const PROMPT_VERSION = 'v1';

const SPEAKING_SCHEMA = {
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

function buildPrompt(sectionText: string): string {
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
      userContent: buildPrompt(sectionText),
      jsonSchema: { name: 'speaking_section', schema: SPEAKING_SCHEMA },
      promptVersion: PROMPT_VERSION,
      inputForHash: sectionText,
    });

    tests.push({
      index: test.index,
      speaking: {
        part1Questions: (data.part1Questions || []).filter(Boolean),
        part2CueCard: { topic: data.part2CueCard?.topic || '', bulletPoints: (data.part2CueCard?.bulletPoints || []).filter(Boolean), prepSec: 60, speakSec: 120 },
        part3Questions: (data.part3Questions || []).filter(Boolean),
      },
    });
  }

  return { tests };
}
