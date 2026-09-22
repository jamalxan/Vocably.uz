// AI-01 worker, S11 "validate" — AI EMAS, TO'G'RIDAN-TO'G'RI mavjud
// `src/lib/exam/contentValidator.ts` (`validateTest`/`hasBlockingErrors`)
// qayta ishlatiladi — bu funksiya admin JSON/DSL/AI import oqimida
// ALLAQACHON ishlatilmoqda (P0 stabilizatsiya, shu sessiyaning oldingi
// bosqichi), shuning uchun worker'dan yaratilgan test ham ADMIN QO'LDA
// YARATGAN test bilan BIR XIL qoidalar bilan tekshiriladi — ikkinchi,
// nomuvofiq bo'lishi mumkin bo'lgan validatsiya yo'li yo'q.
import { ExamTest, ReviewItem } from '@/lib/models';
import { validateTest, type ValidationIssue } from '@/lib/exam/contentValidator';
import { requireStageOutput } from '../lib/dependencies';
import type { StageContext } from '../types';
import type { AssembleOutput } from './assemble';

const ExamTestModel: any = ExamTest;
const ReviewItemModel: any = ReviewItem;

const SECTION_KEYS = new Set(['listening', 'reading', 'writing', 'speaking']);

function sectionKeyFromPath(path: string): string | null {
  const first = path.split('.')[0]?.split('[')[0];
  return first && SECTION_KEYS.has(first) ? first : null;
}

export interface ValidateTestResult {
  testId: string;
  blockers: number;
  warnings: number;
}

export interface ValidateOutput {
  results: ValidateTestResult[];
}

export async function runValidate(ctx: StageContext): Promise<ValidateOutput> {
  const assembleOutput = (await requireStageOutput(ctx.job.bookId, 'assemble')) as AssembleOutput;

  const results: ValidateTestResult[] = [];
  for (const testId of assembleOutput.testIds) {
    const test = await ExamTestModel.findById(testId);
    if (!test) continue;

    const issues: ValidationIssue[] = validateTest(test.toObject());
    const blockers = issues.filter((i) => i.severity === 'error').length;
    const warnings = issues.filter((i) => i.severity === 'warning').length;

    test.qa = { score: null, blockers, warnings, validatedAt: new Date() };
    await test.save();

    // Faqat BLOKLOVCHI xatolarni ReviewItem'ga yozamiz (warning'lar shu
    // bosqichda review navbatini shishirmasin — ular publish gate'ni
    // to'xtatmaydi, faqat sifat signalidir).
    await Promise.all(
      issues
        .filter((i) => i.severity === 'error')
        .map((issue) => {
          const sectionKey = sectionKeyFromPath(issue.path);
          if (!sectionKey) return null; // book-darajasidagi (title/slug/rights) — alohida section'ga tegishli emas
          return ReviewItemModel.create({
            bookId: ctx.job.bookId,
            testId,
            target: { sectionKey },
            reason: 'validation_failed',
            severity: 'blocker',
            evidence: { rawText: issue.message },
            status: 'open',
          });
        })
    );

    results.push({ testId, blockers, warnings });
  }

  return { results };
}
