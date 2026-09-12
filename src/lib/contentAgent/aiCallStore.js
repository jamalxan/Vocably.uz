import { connectToDatabase } from '@/lib/db';
import { AiTaskConfig, AiCall } from '@/lib/models';
import { DEFAULT_MODEL_MATRIX, computeIdempotencyKey, hashInput } from './aiRouter';

// TZ-vocably-v2.md §5.1/§5.3/§11.5 — `aiRouter.js`ning DB'ga bog'liq qismi
// ATAYLAB ALOHIDA fayl: `aiRouter.js` sof (DB'siz) qoladi, worker
// ko'chirilganda o'zgarishsiz olib ketiladi; bu fayl esa Next.js/Mongoose'ga
// xos — worker o'ziga mos DB qatlamini yozadi (bir xil `ai_calls`/
// `AiTaskConfig` kolleksiyalariga yozadigan bo'lsa, shu funksiyalarni
// deyarli aynan takrorlaydi).
export async function getTaskConfig(taskKey) {
  await connectToDatabase();
  const doc = await AiTaskConfig.findOne({ taskKey }).lean();
  if (doc) return { primary: doc.primary, fallback: doc.fallback, temperature: doc.temperature, maxTokens: doc.maxTokens, costCapUsd: doc.costCapUsd };
  return DEFAULT_MODEL_MATRIX[taskKey] || null;
}

// §5.3 item 3 — "Bir xil kirish uchun keshdan olinadi — qayta ishlov
// berish bepul." Kesh manbai — muvaffaqiyatli `AiCall` yozuvlari (alohida
// kesh do'koni shart emas, audit jadvalining o'zi kesh bo'lib xizmat qiladi).
export async function findCachedCall({ taskKey, inputHash, modelId, promptVersion }) {
  await connectToDatabase();
  const idempotencyKey = computeIdempotencyKey({ taskKey, inputHash, modelId, promptVersion });
  return AiCall.findOne({ inputHash: idempotencyKey, taskKey, ok: true }).lean();
}

export async function recordAiCall({ jobId, bookId, taskKey, model, promptVersion, inputHash, modelId, tokensIn, tokensOut, costUsd, latencyMs, ok, validationErrors }) {
  await connectToDatabase();
  const idempotencyKey = computeIdempotencyKey({ taskKey, inputHash, modelId: modelId || model, promptVersion });
  return AiCall.create({
    jobId: jobId || null,
    bookId: bookId || null,
    taskKey,
    model,
    promptVersion: promptVersion || '',
    tokensIn: tokensIn || 0,
    tokensOut: tokensOut || 0,
    costUsd: costUsd || 0,
    latencyMs: latencyMs || 0,
    ok: ok !== false,
    validationErrors: validationErrors || [],
    inputHash: idempotencyKey,
  });
}

export { hashInput };
