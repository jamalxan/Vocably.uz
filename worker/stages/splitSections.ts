// AI-01 worker, S3 "split_sections" — AI EMAS, oddiy deterministik kesish:
// `segment` chiqargan sahifa-xaritasi bo'yicha `extract`dan kelgan har
// sahifa matnini tegishli bo'lim matniga birlashtiradi. Bu bosqich hech
// qachon "gallyutsinatsiya" qilolmaydi — faqat mavjud matnni ko'chiradi.
import { requireStageOutputs } from '../lib/dependencies';
import type { StageContext } from '../types';
import type { ExtractOutput } from './extract';
import type { SegmentOutput } from './segment';

function joinPages(pages: { n: number; text: string }[], pageFrom?: number, pageTo?: number): string {
  if (pageFrom == null || pageTo == null) return '';
  return pages
    .filter((p) => p.n >= pageFrom && p.n <= pageTo)
    .map((p) => p.text)
    .join('\n\n');
}

export interface SplitSectionsOutput {
  tests: {
    index: number;
    sections: { listening: string; reading: string; writing: string; speaking: string };
    // AUDIT — audio<->test kontent-asosli moslashtirish uchun (processAudio.ts).
    // `segment` shu testga aniq audioscript sahifa oralig'ini bera olgan bo'lsa
    // O'SHA, bo'lmasa BUTUN KITOB audioscripti (pastdagi `audioscriptText` bilan
    // bir xil) — bu holda moslashtirish kamroq aniq bo'ladi, lekin baribir
    // ishlaydi (chaqiruvchi buni ishonch darajasi sifatida hisobga oladi).
    audioscriptText: string;
  }[];
  answerKeyText: string;
  audioscriptText: string;
}

export async function runSplitSections(ctx: StageContext): Promise<SplitSectionsOutput> {
  const { extract, segment } = await requireStageOutputs(ctx.job.bookId, ['extract', 'segment']);
  const pages = (extract as ExtractOutput).pages.map((p) => ({ n: p.n, text: p.text }));
  const segmentOutput = segment as SegmentOutput;

  const audioscriptText = segmentOutput.audioscriptPages
    .map((n) => pages.find((p) => p.n === n)?.text || '')
    .filter(Boolean)
    .join('\n\n');

  const tests = segmentOutput.tests.map((t) => ({
    index: t.index,
    sections: {
      listening: joinPages(pages, t.sections.listening?.pageFrom, t.sections.listening?.pageTo),
      reading: joinPages(pages, t.sections.reading?.pageFrom, t.sections.reading?.pageTo),
      writing: joinPages(pages, t.sections.writing?.pageFrom, t.sections.writing?.pageTo),
      speaking: joinPages(pages, t.sections.speaking?.pageFrom, t.sections.speaking?.pageTo),
    },
    audioscriptText: t.audioscript ? joinPages(pages, t.audioscript.pageFrom, t.audioscript.pageTo) || audioscriptText : audioscriptText,
  }));

  const answerKeyText = segmentOutput.answerKeyPages
    .map((n) => pages.find((p) => p.n === n)?.text || '')
    .filter(Boolean)
    .join('\n\n');

  return { tests, answerKeyText, audioscriptText };
}
