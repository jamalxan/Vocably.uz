// AI-01 worker, S2 "segment" — butun kitob matnidan "xarita" chiqaradi: qaysi
// sahifalar qaysi testga, qaysi bo'limga tegishli. TZ §13 S2 izohi bo'yicha
// ATAYLAB "AI faqat xaritani chizadi, matnni ko'chirmaydi" — gallyutsinatsiya
// xavfini kamaytirish uchun (parse_* bosqichlari haqiqiy matnni keyinroq,
// split_sections orqali, DETERMINISTIK tarzda kesib oladi).
//
// 2026-09-24 — sxema, prompt va deterministik cross-check
// `@/lib/contentAgent/parsers/bookMap`ga ko'chirildi: admin AI chat (kitobni
// chatga tashlab, bo'laklarini o'sha zahoti joylash oqimi) xuddi shu
// xaritani worker'siz chiqaradi. Bu yerda faqat worker qobig'i qoldi.
import { ContentBook } from '@/lib/models';
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import { SEGMENT_SCHEMA, SEGMENT_PROMPT_VERSION, buildSegmentPrompt, crossCheckTestBoundaries } from '@/lib/contentAgent/parsers/bookMap';
import type { StageContext } from '../types';
import type { ExtractOutput } from './extract';

const ContentBookModel: any = ContentBook;

// v2 — har test uchun `audioscript` sahifa oralig'i so'raladigan bo'ldi
// (audio<->test kontent-asosli moslashtirish uchun, processAudio.ts izohiga q.).
const PROMPT_VERSION = SEGMENT_PROMPT_VERSION;

export interface SegmentOutput {
  tests: {
    index: number;
    pageFrom: number;
    pageTo: number;
    sections: Record<string, { pageFrom: number; pageTo: number } | undefined>;
    audioscript?: { pageFrom: number; pageTo: number };
    confidence?: number;
  }[];
  answerKeyPages: number[];
  audioscriptPages: number[];
  generalTrainingPages: number[];
  frontMatterPages: number[];
  crossCheckWarnings: string[];
}

export async function runSegment(ctx: StageContext): Promise<SegmentOutput> {
  const extractOutput = (await requireStageOutput(ctx.job.bookId, 'extract')) as ExtractOutput;
  const pages = extractOutput.pages.map((p) => ({ n: p.n, text: p.text }));

  const { data } = await runAiStage<{
    tests: SegmentOutput['tests'];
    answerKeyPages?: number[];
    audioscriptPages?: number[];
    generalTrainingPages?: number[];
    frontMatterPages?: number[];
  }>({
    taskKey: 'book.segment',
    bookId: ctx.job.bookId,
    jobId: ctx.job._id,
    systemPrompt: "Sen IELTS practice test kitoblarini tuzilishiga qarab xaritalaydigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
    userContent: buildSegmentPrompt(pages),
    jsonSchema: { name: 'book_segment', schema: SEGMENT_SCHEMA },
    promptVersion: PROMPT_VERSION,
    inputForHash: pages.map((p) => `${p.n}:${p.text.length}`).join(','),
  });

  const tests = Array.isArray(data.tests) ? data.tests : [];
  const crossCheckWarnings = crossCheckTestBoundaries(pages, tests);

  const output: SegmentOutput = {
    tests,
    answerKeyPages: data.answerKeyPages || [],
    audioscriptPages: data.audioscriptPages || [],
    generalTrainingPages: data.generalTrainingPages || [],
    frontMatterPages: data.frontMatterPages || [],
    crossCheckWarnings,
  };

  await ContentBookModel.updateOne(
    { _id: ctx.job.bookId },
    {
      $set: {
        'detected.tests': tests,
        'detected.answerKeyPages': output.answerKeyPages,
        'detected.audioscriptPages': output.audioscriptPages,
        updatedAt: new Date(),
      },
    }
  );

  return output;
}
