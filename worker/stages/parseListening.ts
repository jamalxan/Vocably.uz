// AI-01 worker, S5 "parse_listening" — bitta testning 4 ta Listening
// part'idagi savol GURUHLARINI JSON'ga o'giradi (audio/transkript emas — bu
// `parse_listening`ning ishi emas: savol MATNI kitobda bosilgan, transkript
// alohida "Audioscripts" sahifalarida, `split_sections` uni allaqachon
// `audioscriptText`ga ajratib qo'ygan).
//
// 2026-09-24 — sxema/prompt/normalizator `@/lib/contentAgent/parsers/
// sectionParsers` ichiga ko'chirildi (admin AI chat ham aynan shu bosqichni
// worker'siz bajaradi). Bu yerda QOLGANI — worker'ga xos qobiq: job
// konteksti, `runAiStage` (model routeri + `AiCall` auditi) va bosqichlar
// orasidagi bog'liqlik.
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import {
  LISTENING_SCHEMA,
  LISTENING_PROMPT_VERSION,
  buildListeningPrompt,
  normalizeListeningParts,
  type AiListeningPart,
  type ListeningPartOutput,
} from '@/lib/contentAgent/parsers/sectionParsers';
import type { StageContext } from '../types';
import type { SplitSectionsOutput } from './splitSections';

export type { ListeningPartOutput };

export interface ParseListeningOutput {
  tests: { index: number; parts: ListeningPartOutput[]; needsReview: { testIndex: number; partOrder: number; groupId: string; type: string; reason: string }[] }[];
}

export async function runParseListening(ctx: StageContext): Promise<ParseListeningOutput> {
  const splitOutput = (await requireStageOutput(ctx.job.bookId, 'split_sections')) as SplitSectionsOutput;

  const tests: ParseListeningOutput['tests'] = [];
  for (const test of splitOutput.tests) {
    const sectionText = test.sections.listening?.trim();
    if (!sectionText) continue;

    const { data } = await runAiStage<{ parts?: AiListeningPart[] }>({
      taskKey: 'listening.parse',
      bookId: ctx.job.bookId,
      jobId: ctx.job._id,
      systemPrompt: "Sen IELTS Listening kontentini JSON strukturaga o'giradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
      userContent: buildListeningPrompt(sectionText, splitOutput.answerKeyText),
      jsonSchema: { name: 'listening_section', schema: LISTENING_SCHEMA },
      promptVersion: LISTENING_PROMPT_VERSION,
      inputForHash: sectionText,
    });

    const { parts, needsReview } = normalizeListeningParts(data, `t${test.index}`);
    tests.push({
      index: test.index,
      parts,
      needsReview: needsReview.map((r) => ({ testIndex: test.index, ...r })),
    });
  }

  return { tests };
}
