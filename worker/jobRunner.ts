// AI-01 worker — bitta BullMQ ishini (Redis xabari) HAQIQIY `IngestJob`
// hujjati hayot sikliga (`queued -> running -> succeeded|failed`) bog'laydi,
// `AutomationPolicy` orqali xavfsizlik tekshiruvlarini o'tkazadi
// (`autopilotGuards.js` — MUSTAQIL, DB'siz — TZ §3.3 "policy'dan mustaqil,
// hardcoded qolishi shart" talabiga rioya qilib, bu yerda POLICY'DAN
// o'qilgan qiymatlar ULARGA argument sifatida beriladi, policy o'zi
// qoidani aylanib o'tolmaydi).
import { UnrecoverableError } from 'bullmq';
import { ContentBook, IngestJob, AgentAction, AutomationPolicy } from '@/lib/models';
import { canContinueAutonomous } from '@/lib/contentAgent/autopilotGuards';
import { STAGE_REGISTRY } from './stageRegistry';
import { RetryableStageError, UnrecoverableStageError } from './lib/errors';
import type { IngestStage } from './types';

const IngestJobModel: any = IngestJob;
const ContentBookModel: any = ContentBook;
const AgentActionModel: any = AgentAction;
const AutomationPolicyModel: any = AutomationPolicy;

export interface WorkerJobData {
  ingestJobId: string;
  bookId: string;
  stage: IngestStage;
}

/** Faqat BUGUNGI (UTC kun boshidan) `AgentAction.costUsd` yig'indisi —
 * `autopilotGuards.js`ning o'z izohi: "chaqiruvchi costUsdTodayni
 * agent_actions'dan yig'ib berishi kerak, ai_calls'ning umumidan emas." */
async function getCostUsdToday(): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const result = await AgentActionModel.aggregate([
    { $match: { createdAt: { $gte: startOfDay } } },
    { $group: { _id: null, total: { $sum: '$costUsd' } } },
  ]);
  return result[0]?.total || 0;
}

async function resolvePolicy(bookId: string): Promise<{ paused: boolean; maxAutonomousCostUsdPerDay: number }> {
  const [bookPolicy, globalPolicy] = await Promise.all([
    AutomationPolicyModel.findOne({ scope: 'book', bookId }).lean(),
    AutomationPolicyModel.findOne({ scope: 'global' }).lean(),
  ]);
  const effective = bookPolicy || globalPolicy;
  return {
    paused: globalPolicy?.paused === true, // pauza FAQAT global'da ma'noga ega (AutomationPolicySchema izohiga q.)
    maxAutonomousCostUsdPerDay: effective?.maxAutonomousCostUsdPerDay ?? 15,
  };
}

export class JobPausedSignal extends Error {
  constructor() {
    super('AutomationPolicy pauza qilingan — bu ish hozircha ishlanmaydi');
    this.name = 'JobPausedSignal';
  }
}

/** BullMQ processor'idan chaqiriladi (`index.ts`). Xato otganda BullMQ o'zi
 * `attempts`/`backoff` (qayta urinish uchun) yoki `UnrecoverableError`
 * (darhol "failed", qayta urinishsiz) semantikasini qo'llaydi. */
export async function runJob(data: WorkerJobData): Promise<unknown> {
  const job = await IngestJobModel.findById(data.ingestJobId);
  if (!job) throw new UnrecoverableError(`IngestJob topilmadi: ${data.ingestJobId}`);

  // Idempotentlik: bu ish ALLAQACHON muvaffaqiyatli tugagan bo'lsa (masalan
  // BullMQ'ning o'zi jobId=idempotencyKey orqali dublikatni to'xtatolmagan
  // holat — qo'lda qayta enqueue yoki eski Redis xabari), qayta ishlamaymiz.
  if (job.status === 'succeeded') return job.output;

  const policy = await resolvePolicy(data.bookId);
  if (policy.paused) {
    // Pauza — bu ISH XATOSI EMAS, shuning uchun 'failed'ga o'tkazmaymiz.
    // Holatni 'queued'da qoldiramiz (admin keyinroq qo'lda qayta ingest
    // chaqirganda yoki pauza olib tashlanganda tabiiy davom etadi).
    throw new JobPausedSignal();
  }

  const costUsdToday = await getCostUsdToday();
  const costGate = canContinueAutonomous({ costUsdToday, maxAutonomousCostUsdPerDay: policy.maxAutonomousCostUsdPerDay });
  if (!costGate.allowed) {
    await AgentActionModel.create({ bookId: data.bookId, action: 'autopilot_paused_cost_cap', reasoning: costGate.reason });
    throw new JobPausedSignal();
  }

  const handler = STAGE_REGISTRY[data.stage];
  if (!handler) throw new UnrecoverableError(`Noma'lum bosqich: ${data.stage}`);

  await IngestJobModel.updateOne(
    { _id: job._id },
    { $set: { status: 'running', 'metrics.startedAt': new Date() }, $inc: { attempt: 1 } }
  );
  await ContentBookModel.updateOne({ _id: data.bookId }, { $set: { status: 'processing', 'progress.stage': data.stage, updatedAt: new Date() } });

  try {
    const output = await handler({ job: { _id: String(job._id), bookId: data.bookId, stage: data.stage, attempt: job.attempt + 1 } });
    await IngestJobModel.updateOne(
      { _id: job._id },
      { $set: { status: 'succeeded', output, 'metrics.finishedAt': new Date() }, $unset: { error: 1 } }
    );
    return output;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const retryable = error instanceof UnrecoverableStageError ? false : true; // noma'lum xato turlari DEFOLT retryable=true (RetryableStageError shu jumladan)
    await IngestJobModel.updateOne(
      { _id: job._id },
      { $set: { status: 'failed', error: { message: error.message, stack: error.stack || '', retryable }, 'metrics.finishedAt': new Date() } }
    );

    // MUHIM: `ContentBook.status`ni FAQAT qaytarib bo'lmaydigan (retryable:false)
    // xatoda 'failed'ga o'tkazamiz. `RetryableStageError` (masalan
    // `requireStageOutput`dan — "bog'liq bosqich hali tugamagan") BUTUNLAY
    // NORMAL holat, chunki `ingest/route.js` BARCHA 13 bosqichni bir vaqtda
    // navbatga qo'yadi (dependencies.ts izohiga q.) — downstream bosqich
    // dependency kutayotganda "failed" deb ko'rsatish admin panelida
    // yolg'on/chayqaluvchi status (retry muvaffaqiyatli bo'lgach o'zi
    // to'g'rilanadi, lekin shu oraliqda chalkashtiradi).
    if (!retryable) {
      await ContentBookModel.updateOne({ _id: data.bookId }, { $set: { status: 'failed', 'progress.message': error.message, updatedAt: new Date() } });
      throw new UnrecoverableError(error.message);
    }
    throw error;
  }
}
