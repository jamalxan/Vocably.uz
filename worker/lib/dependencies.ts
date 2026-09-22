// AI-01 worker — bosqichlar orasidagi bog'liqlik. `admin/books/[id]/ingest/
// route.js` BARCHA 13 bosqichni BIR VAQTDA navbatga qo'yadi (ketma-ketlikni
// kutmasdan) — bu joyni o'zgartirmadik (mavjud, allaqachon ishlatilayotgan
// endpoint). Shuning uchun bog'liq bosqich hali tugamagan bo'lishi tabiiy —
// bu funksiya shunday holatda `RetryableStageError` otadi, BullMQ o'z
// `backoff`i bilan keyinroq qayta uradi (poll-via-retry: TO'G'RI DAG
// rejalashtiruvchi emas — masalan BullMQ "flows" — lekin birinchi ishlaydigan
// versiya uchun yetarli, keyingi qadam sifatida yaxshilanishi mumkin).
import { IngestJob } from '@/lib/models';
import { RetryableStageError } from './errors';

const IngestJobModel: any = IngestJob;

/** `stage` bosqichi shu kitob uchun `succeeded` holatda tugagan bo'lsa uning
 * `output`ini qaytaradi; aks holda (hali yo'q/queued/running/failed)
 * `RetryableStageError` otadi. */
export async function requireStageOutput(bookId: string, stage: string): Promise<unknown> {
  const job = await IngestJobModel.findOne({ bookId, stage }).sort({ createdAt: -1 }).select('status output error').lean();
  if (!job) throw new RetryableStageError(`Bog'liq bosqich '${stage}' hali navbatga tushmagan`);
  if (job.status === 'succeeded') return job.output;
  if (job.status === 'failed') throw new RetryableStageError(`Bog'liq bosqich '${stage}' muvaffaqiyatsiz tugadi: ${job.error?.message || ''}`);
  throw new RetryableStageError(`Bog'liq bosqich '${stage}' hali tugamagan (holat: ${job.status})`);
}

export async function requireStageOutputs(bookId: string, stages: string[]): Promise<Record<string, unknown>> {
  const entries = await Promise.all(stages.map(async (s) => [s, await requireStageOutput(bookId, s)] as const));
  return Object.fromEntries(entries);
}
