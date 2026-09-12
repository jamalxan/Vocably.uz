import crypto from 'crypto';

// TZ-vocably-v2.md (AI Content Ingestion Agent) §5 — "Hech bir bosqich
// modelga qattiq bog'lanmaydi." Bu modul TZ §21 M1 item 5'dagi
// `worker/ai/router.ts`ning JS ekvivalenti: hozircha bu Next.js reposida
// yashaydi (worker hali alohida repo/konteyner sifatida qurilmagan —
// yuqoridagi commit izohlariga q.), lekin ATAYLAB portativ (faqat `crypto`
// va global `fetch`ga tayanadi, hech qanday Next.js-ga xos import yo'q) —
// worker qurilganda deyarli o'zgarishsiz ko'chirilishi mumkin.
//
// MUHIM — bu sessiyada haqiqiy OpenRouter chaqiruvi bilan SINALMAGAN
// (OPENROUTER_API_KEY yo'q, tarmoq yo'q). Pastdagi retry/fallback/
// idempotentlik MANTIG'I `aiRouter.test.js`da mock `fetch` bilan to'liq
// sinalgan — lekin haqiqiy OpenRouter javob shakli (`response_format:
// json_schema`, xato kodlari) bilan mos kelishi hali TASDIQLANMAGAN,
// chunki tekshirib bo'lmaydi. Haqiqiy kalit ulanganda birinchi chaqiruvlar
// diqqat bilan kuzatilishi kerak.

// §5.2 — boshlang'ich model matritsasi. DB'dagi `AiTaskConfig` hujjati
// bo'lsa O'SHA ustunlik qiladi (admin dropdown orqali o'zgartirilgan
// bo'lishi mumkin) — bu faqat DB bo'sh bo'lganda ishlatiladigan standart.
export const DEFAULT_MODEL_MATRIX = {
  'book.segment': { primary: 'google/gemini-2.5-pro', fallback: ['anthropic/claude-sonnet-4.5'], temperature: 0.1, maxTokens: 8000, costCapUsd: 1 },
  'section.split': { primary: 'google/gemini-2.5-flash', fallback: ['google/gemini-2.5-pro'], temperature: 0.1, maxTokens: 4000, costCapUsd: 0.2 },
  'reading.parse': { primary: 'google/gemini-2.5-pro', fallback: ['anthropic/claude-sonnet-4.5', 'google/gemini-2.5-flash'], temperature: 0.1, maxTokens: 8000, costCapUsd: 0.5 },
  'listening.parse': { primary: 'google/gemini-2.5-pro', fallback: ['anthropic/claude-sonnet-4.5', 'google/gemini-2.5-flash'], temperature: 0.1, maxTokens: 8000, costCapUsd: 0.5 },
  'writing.parse': { primary: 'google/gemini-2.5-flash', fallback: ['google/gemini-2.5-pro'], temperature: 0.1, maxTokens: 4000, costCapUsd: 0.1 },
  'speaking.parse': { primary: 'google/gemini-2.5-flash', fallback: ['google/gemini-2.5-pro'], temperature: 0.1, maxTokens: 4000, costCapUsd: 0.1 },
  'answerkey.parse': { primary: 'google/gemini-2.5-flash', fallback: ['google/gemini-2.5-pro'], temperature: 0, maxTokens: 4000, costCapUsd: 0.1 },
  'image.classify': { primary: 'google/gemini-2.5-flash', fallback: [], temperature: 0.1, maxTokens: 1000, costCapUsd: 0.05 },
  // §5.3 item — QA HAR DOIM parse bosqichidan boshqa oila: bir xil model
  // o'z xatosini ko'rmaydi. Bu yerda ataylab Gemini emas, Claude.
  'qa.validate': { primary: 'anthropic/claude-sonnet-4.5', fallback: ['google/gemini-2.5-pro'], temperature: 0.1, maxTokens: 4000, costCapUsd: 0.3 },
  'writing.grade': { primary: 'anthropic/claude-sonnet-4.5', fallback: ['google/gemini-2.5-pro'], temperature: 0.2, maxTokens: 4000, costCapUsd: 0.2 },
  'speaking.grade': { primary: 'anthropic/claude-sonnet-4.5', fallback: ['google/gemini-2.5-pro'], temperature: 0.2, maxTokens: 4000, costCapUsd: 0.2 },
};

const RETRY_DELAYS_MS = [1000, 4000, 16000]; // §5.3 item 5 — 1s -> 4s -> 16s, 3 urinish

export class AiRouterError extends Error {
  constructor(message, { retryable = false, status = null, retryAfterSec = null } = {}) {
    super(message);
    this.name = 'AiRouterError';
    this.retryable = retryable;
    this.status = status;
    this.retryAfterSec = retryAfterSec;
  }
}

// §5.3 item 3 — "idempotencyKey = hash(taskKey + inputHash + modelId +
// promptVersion). Bir xil kirish uchun keshdan olinadi."
export function computeIdempotencyKey({ taskKey, inputHash, modelId, promptVersion }) {
  return crypto.createHash('sha256').update(`${taskKey}:${inputHash}:${modelId}:${promptVersion}`).digest('hex');
}

export function hashInput(input) {
  return crypto.createHash('sha256').update(typeof input === 'string' ? input : JSON.stringify(input)).digest('hex');
}

// OpenRouter — OpenAI Chat Completions'ga mos REST API, alohida SDK shart
// emas (§21 M1 item 5 izohiga q. — bu sessiyada SDK o'rnatib bo'lmaydi,
// lekin buning aslida keragi yo'q, oddiy fetch yetarli).
export function buildRequestBody({ model, systemPrompt, userContent, jsonSchema, temperature, maxTokens }) {
  const body = {
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  };
  // §5.3 item 1 — "Har parse chaqiruvida JSON Schema beriladi... Erkin
  // matn qabul qilinmaydi."
  if (jsonSchema) {
    body.response_format = {
      type: 'json_schema',
      json_schema: { name: jsonSchema.name || 'response', strict: true, schema: jsonSchema.schema || jsonSchema },
    };
  }
  return body;
}

function classifyHttpError(status, retryAfterHeader) {
  const retryAfterSec = retryAfterHeader ? Number(retryAfterHeader) : null;
  if (status === 429) return new AiRouterError('Tezlik chegarasi (429)', { retryable: true, status, retryAfterSec });
  if (status >= 500) return new AiRouterError(`Server xatosi (${status})`, { retryable: true, status });
  return new AiRouterError(`So'rov rad etildi (${status})`, { retryable: false, status });
}

// §5.3 item 5 — eksponensial backoff, `Retry-After` hurmat qilinadi.
async function withRetry(attemptFn, { maxAttempts = RETRY_DELAYS_MS.length + 1, sleepFn = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await attemptFn(attempt);
    } catch (err) {
      lastError = err;
      if (!(err instanceof AiRouterError) || !err.retryable || attempt === maxAttempts - 1) throw err;
      const delayMs = err.retryAfterSec != null ? err.retryAfterSec * 1000 : RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
      await sleepFn(delayMs);
    }
  }
  throw lastError;
}

// Bitta model bilan bitta (retry ichidagi) urinish — mock qilinishi uchun
// `fetchImpl` inject qilinadi (aynan shu narsa `aiRouter.test.js`da haqiqiy
// tarmoqsiz sinashga imkon beradi).
async function callModelOnce({ apiKey, model, body, fetchImpl, timeoutMs = 60000 }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new AiRouterError('Vaqt tugadi (timeout)', { retryable: true });
    throw new AiRouterError(err.message || 'Tarmoq xatoligi', { retryable: true });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw classifyHttpError(res.status, res.headers?.get?.('retry-after'));
  }

  const json = await res.json();
  const choice = json.choices?.[0];
  const content = choice?.message?.content;
  if (!content) throw new AiRouterError("Modeldan bo'sh javob keldi", { retryable: true });

  let data;
  try {
    data = JSON.parse(content);
  } catch {
    throw new AiRouterError("Model javobi to'g'ri JSON emas", { retryable: true });
  }

  return {
    data,
    tokensIn: json.usage?.prompt_tokens ?? 0,
    tokensOut: json.usage?.completion_tokens ?? 0,
    costUsd: json.usage?.cost ?? 0, // OpenRouter `x-openrouter-cost`/`usage.cost` — TZ §5.2
  };
}

/**
 * TZ §5.1-5.3 to'liq oqimi: taskKey -> config -> [primary, ...fallback]
 * ketma-ket sinaladi, har biri o'z ichida retry qiladi. Birinchi
 * muvaffaqiyatli model natijani qaytaradi. `config` berilmasa
 * `DEFAULT_MODEL_MATRIX`dan olinadi (DB'dan o'qish chaqiruvchining
 * mas'uliyati — bu funksiya ataylab DB'ga bog'liq emas, sof va sinaladigan).
 */
export async function callTask({
  taskKey,
  systemPrompt,
  userContent,
  jsonSchema,
  config,
  apiKey,
  fetchImpl = typeof fetch !== 'undefined' ? fetch : undefined,
  sleepFn, // faqat testlar uchun — chaqiruvchi haqiqiy kodda bermaydi, haqiqiy backoff ishlaydi
}) {
  if (!apiKey) throw new AiRouterError('OPENROUTER_API_KEY berilmagan', { retryable: false });
  if (!fetchImpl) throw new AiRouterError('fetch mavjud emas', { retryable: false });

  const resolved = config || DEFAULT_MODEL_MATRIX[taskKey];
  if (!resolved) throw new AiRouterError(`Noma'lum taskKey: ${taskKey}`, { retryable: false });

  const models = [resolved.primary, ...(resolved.fallback || [])];
  const attempts = [];
  let lastError;

  for (const model of models) {
    const body = buildRequestBody({
      model,
      systemPrompt,
      userContent,
      jsonSchema,
      temperature: resolved.temperature ?? 0.2,
      maxTokens: resolved.maxTokens ?? 8000,
    });
    const startedAt = Date.now();
    try {
      const result = await withRetry(
        (attempt) => callModelOnce({ apiKey, model, body, fetchImpl }).then((r) => ({ ...r, attempt })),
        sleepFn ? { sleepFn } : undefined
      );
      attempts.push({ model, ok: true, latencyMs: Date.now() - startedAt });
      return { ...result, model, attempts };
    } catch (err) {
      lastError = err;
      attempts.push({ model, ok: false, error: err.message, latencyMs: Date.now() - startedAt });
      // Keyingi model (fallback)ga o'tamiz.
    }
  }

  const err = new AiRouterError(`Barcha modellar muvaffaqiyatsiz: ${lastError?.message || 'noma\'lum xato'}`, { retryable: false });
  err.attempts = attempts;
  throw err;
}
