import crypto from 'crypto';

// TZ-vocably-v2.md (AI Content Ingestion Agent) §5 — "Hech bir bosqich
// modelga qattiq bog'lanmaydi." Bu modul TZ §21 M1 item 5'dagi
// `worker/ai/router.ts`ning JS ekvivalenti: hozircha bu Next.js reposida
// yashaydi (worker hali alohida repo/konteyner sifatida qurilmagan —
// yuqoridagi commit izohlariga q.), lekin ATAYLAB portativ (faqat `crypto`
// va global `fetch`ga tayanadi, hech qanday Next.js-ga xos import yo'q) —
// worker qurilganda deyarli o'zgarishsiz ko'chirilishi mumkin.
//
// 2026-09-12: `OPENROUTER_API_KEY` ulandi va bu modulning asosiy taxmini —
// `response_format:{type:'json_schema',strict:true}` OpenRouter tomonidan
// hurmat qilinishi va javobda `usage.cost` maydoni kelishi — jonli chaqiruv
// bilan TASDIQLANDI (google/gemini-2.5-flash, HTTP 200, `usage.cost`
// mavjud). Pastdagi retry/fallback/idempotentlik mantig'i `aiRouter.test.js`da
// mock `fetch` bilan to'liq sinalgan; endi asosiy shakl ham real tarmoqda
// tekshirilgan — lekin bu hali ham faqat bitta oddiy so'rov, xato
// kodlari (429/5xx)ning haqiqiy formati va boshqa modellar (Claude,
// Gemini Pro)ning `strict:true` bilan mosligi hali kuzatilishi kerak.

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
  // Admin AI chat (kontent agenti, 2026-09-24) — ikki yangi bosqich:
  // `agent.classify` sarlavhasiz hujjat qaysi bo'limga tegishliligini
  // aniqlaydi (arzon, qisqa javob), `audio.match` esa audio transkripti
  // qaysi Listening part'iga mos kelishini baholaydi. Ikkalasi ham xuddi
  // boshqa bosqichlar kabi admin panelidan (AiTaskConfig) qayta
  // sozlanishi mumkin.
  'agent.classify': { primary: 'google/gemini-2.5-flash', fallback: ['google/gemini-2.5-pro'], temperature: 0.1, maxTokens: 1000, costCapUsd: 0.05 },
  'audio.match': { primary: 'google/gemini-2.5-flash', fallback: ['google/gemini-2.5-pro'], temperature: 0.1, maxTokens: 2000, costCapUsd: 0.1 },
  // Admin agent chatining oddiy matnli javobi — tez model (interaktiv).
  'agent.converse': { primary: 'google/gemini-2.5-flash', fallback: ['google/gemini-2.5-pro'], temperature: 0.3, maxTokens: 1500, costCapUsd: 0.05 },
  'writing.grade': { primary: 'anthropic/claude-sonnet-4.5', fallback: ['google/gemini-2.5-pro'], temperature: 0.2, maxTokens: 4000, costCapUsd: 0.2 },
  'speaking.grade': { primary: 'anthropic/claude-sonnet-4.5', fallback: ['google/gemini-2.5-pro'], temperature: 0.2, maxTokens: 4000, costCapUsd: 0.2 },
};

const RETRY_DELAYS_MS = [1000, 4000, 16000]; // §5.3 item 5 — 1s -> 4s -> 16s, 3 urinish

export class AiRouterError extends Error {
  constructor(message, { retryable = false, status = null, retryAfterSec = null, timeout = false } = {}) {
    super(message);
    this.name = 'AiRouterError';
    this.retryable = retryable;
    this.timeout = timeout;
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
// `messages` (ixtiyoriy) — admin AI sinov-chat playground'i uchun (§11.5 ga
// yaqin, lekin TZ'da alohida band emas): ko'p burilishli suhbat tarixini
// (`[{role:'user'|'assistant', content}]`) uzatish kerak bo'lganda
// `userContent` o'rniga shu beriladi. Berilmasa, eski bitta-burilishli
// xatti-harakat o'zgarishsiz qoladi (orqaga mos).
export function buildRequestBody({ model, systemPrompt, userContent, messages, jsonSchema, temperature, maxTokens }) {
  const body = {
    model,
    temperature,
    max_tokens: maxTokens,
    messages:
      messages && messages.length
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : [
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

// Bitta chaqiruvga ajratiladigan eng kam vaqt — bundan kam qolgan bo'lsa
// modelni chaqirishning ma'nosi yo'q (javob baribir ulgurmaydi).
const MIN_CALL_MS = 8000;
const DEFAULT_CALL_TIMEOUT_MS = 120000;

function remainingMs(deadlineAt) {
  return deadlineAt ? deadlineAt - Date.now() : Infinity;
}

// §5.3 item 5 — eksponensial backoff, `Retry-After` hurmat qilinadi.
// `deadlineAt` (ixtiyoriy, epoch ms) — interaktiv so'rovlar (admin chat)
// uchun: kutish muddatdan oshib ketadigan bo'lsa qayta urinmaymiz, xatoni
// darhol qaytaramiz (serverless 300s chegarasiga urilib, JSON o'rniga
// "An error occurred..." matni qaytishidan ko'ra).
async function withRetry(attemptFn, { maxAttempts = RETRY_DELAYS_MS.length + 1, sleepFn = (ms) => new Promise((r) => setTimeout(r, ms)), deadlineAt = null } = {}) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await attemptFn(attempt);
    } catch (err) {
      lastError = err;
      if (!(err instanceof AiRouterError) || !err.retryable || attempt === maxAttempts - 1) throw err;
      const delayMs = err.retryAfterSec != null ? err.retryAfterSec * 1000 : RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
      if (remainingMs(deadlineAt) - delayMs < MIN_CALL_MS) throw err;
      await sleepFn(delayMs);
    }
  }
  throw lastError;
}

// Bitta model bilan bitta (retry ichidagi) urinish — mock qilinishi uchun
// `fetchImpl` inject qilinadi (aynan shu narsa `aiRouter.test.js`da haqiqiy
// tarmoqsiz sinashga imkon beradi).
async function callModelOnce({ apiKey, model, body, fetchImpl, timeoutMs = DEFAULT_CALL_TIMEOUT_MS }) {
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
    // Timeout — o'sha modelni XUDDI SHU katta so'rov bilan qayta urish odatda
    // yana timeout beradi (jonli Vercel logida: bitta model 4 x 60s + backoff
    // ~4.5 daqiqa, so'ng "Task timed out after 300 seconds"). Shuning uchun
    // darhol keyingi (fallback) modelga o'tamiz.
    if (err.name === 'AbortError') throw new AiRouterError('Vaqt tugadi (timeout)', { retryable: false, timeout: true });
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
  messages,
  jsonSchema,
  config,
  apiKey,
  fetchImpl = typeof fetch !== 'undefined' ? fetch : undefined,
  sleepFn, // faqat testlar uchun — chaqiruvchi haqiqiy kodda bermaydi, haqiqiy backoff ishlaydi
  deadlineAt = null, // ixtiyoriy epoch ms — interaktiv so'rovlar uchun qat'iy muddat
  timeoutMs = DEFAULT_CALL_TIMEOUT_MS,
}) {
  if (!apiKey) throw new AiRouterError('OPENROUTER_API_KEY berilmagan', { retryable: false });
  if (!fetchImpl) throw new AiRouterError('fetch mavjud emas', { retryable: false });

  const resolved = config || DEFAULT_MODEL_MATRIX[taskKey];
  if (!resolved) throw new AiRouterError(`Noma'lum taskKey: ${taskKey}`, { retryable: false });

  const models = [resolved.primary, ...(resolved.fallback || [])];
  const attempts = [];
  let lastError;

  for (const model of models) {
    if (remainingMs(deadlineAt) < MIN_CALL_MS) {
      lastError = lastError || new AiRouterError('Vaqt chegarasi — model chaqirilmadi', { retryable: false, timeout: true });
      break;
    }
    const body = buildRequestBody({
      model,
      systemPrompt,
      userContent,
      messages,
      jsonSchema,
      temperature: resolved.temperature ?? 0.2,
      maxTokens: resolved.maxTokens ?? 8000,
    });
    const startedAt = Date.now();
    try {
      const result = await withRetry(
        (attempt) =>
          callModelOnce({
            apiKey,
            model,
            body,
            fetchImpl,
            timeoutMs: Math.max(1000, Math.min(timeoutMs, remainingMs(deadlineAt) - 2000)),
          }).then((r) => ({ ...r, attempt })),
        { ...(sleepFn ? { sleepFn } : {}), deadlineAt }
      );
      attempts.push({ model, ok: true, latencyMs: Date.now() - startedAt });
      return { ...result, model, attempts };
    } catch (err) {
      lastError = err;
      attempts.push({ model, ok: false, error: err.message, latencyMs: Date.now() - startedAt });
      // Keyingi model (fallback)ga o'tamiz.
    }
  }

  const err = new AiRouterError(`Barcha modellar muvaffaqiyatsiz: ${lastError?.message || 'noma\'lum xato'}`, {
    retryable: false,
    timeout: !!lastError?.timeout,
  });
  err.attempts = attempts;
  throw err;
}
