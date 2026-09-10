import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §D1 (BUG-006) — yagona AI xato-boshqarish qatlami. `src/lib/aiJson.js`
// (Reading/Listening/Writing/Speaking generatsiya/baholash) va
// `src/app/api/ai/chat/route.js` (asosiy AI chat) shu modulni ishlatadi, shunda:
//   - retry faqat vaqtinchalik xatolarda (429/500/502/503/504/tarmoq) bo'ladi,
//     eksponensial backoff + jitter bilan (1s -> 2.5s -> 6s);
//   - foydalanuvchiga FAQAT o'zbekcha, provayder/model/endpoint nomisiz xabar boradi;
//   - texnik tafsilot (model, endpoint, status, requestId, userId) faqat serverdagi
//     logga tushadi (hozircha strukturali console.error — Sentry keyinroq shu funksiyaga
//     ulanadi, chaqiruvchi joylarni o'zgartirmasdan).

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
// TZ D1.1: 1s -> 2.5s -> 6s (bazaviy), ustiga tasodifiy jitter qo'shiladi.
const BASE_DELAYS_MS = [1000, 2500, 6000];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Status kodi bo'lsa faqat ro'yxatdagilar; status yo'q bo'lsa (fetch tarmoq xatosi bilan
 * throw qilganda `.status` bo'lmaydi) — tarmoq xatosi deb hisoblab retry qilinadi. */
export function isRetryableAiError(err) {
  const status = err?.status ?? err?.response?.status;
  if (status != null) return RETRYABLE_STATUSES.has(Number(status));
  return true;
}

/**
 * `fn(attemptIndex)` ni eksponensial backoff + jitter bilan qayta uradi. `isRetryable`
 * har bir xatodan keyin tekshiriladi — chat oqimida bo'lgani kabi, urinish davomida
 * foydalanuvchiga allaqachon matn chiqarilgan bo'lsa retry qilib bo'lmaydi (chaqiruvchi
 * shu holatni o'z `isRetryable` callback'ida hisobga oladi).
 */
export async function withRetry(fn, { maxAttempts = 3, isRetryable = isRetryableAiError } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      const isLast = attempt === maxAttempts - 1;
      if (isLast || !isRetryable(err)) throw err;
      const base = BASE_DELAYS_MS[attempt] ?? BASE_DELAYS_MS[BASE_DELAYS_MS.length - 1];
      await sleep(base + base * 0.3 * Math.random());
    }
  }
  throw lastErr;
}

/** TZ D1.3 — foydalanuvchiga ko'rinadigan xabar. Hech qachon provayder nomi, model,
 * endpoint yoki xom `err.message` chiqarilmaydi. */
export function toUserMessage(err) {
  const status = err?.status ?? err?.response?.status;
  const msg = err?.message || '';
  if (status === 429 || /quota|rate limit|429/i.test(msg)) {
    return "AI hozir band. Qayta urinish tugmasini bosing yoki 30 soniyadan keyin harakat qiling.";
  }
  if (status === 503 || /overloaded|unavailable|503/i.test(msg)) {
    return "AI hozir band. Qayta urinish tugmasini bosing yoki 30 soniyadan keyin harakat qiling.";
  }
  if (err?.name === 'AbortError' || /timeout/i.test(msg)) {
    return 'Javob juda uzoq davom etdi. Qayta urinamizmi?';
  }
  if (err?.name === 'TypeError' || /network|fetch failed|ECONNRESET|ENOTFOUND/i.test(msg)) {
    return 'Internet bilan bog\'lanishda muammo. Ulanishni tekshiring.';
  }
  return 'Kutilmagan xato yuz berdi. Biz xabardor bo\'ldik.';
}

/** Barcha `generateJson`-asosidagi route'lar (writing/listening/reading/speaking generate
 * va submit, words/enrich) shu bitta helper orqali xato javob qaytaradi — TZ D1.3
 * (o'zbekcha, texnik tafsilotsiz xabar) + D1.4 (log) + "requestId klientga qaytariladi"
 * talablarini bitta joyda ta'minlaydi. `meta`: { status?, model?, endpoint?, userId? }. */
export function aiErrorResponse(err, { status = 502, ...meta } = {}) {
  const requestId = logAiError(err, meta);
  return NextResponse.json({ error: toUserMessage(err), requestId }, { status });
}

function newRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Texnik tafsilotning yagona chiqish nuqtasi — hech qachon klientga yuborilmaydi (§D1.4).
 * `meta`: { requestId?, model?, endpoint?, status?, userId? }. requestId berilmasa
 * yaratiladi va qaytariladi, shunda chaqiruvchi uni klientga (faqat ID sifatida) qo'shib
 * yuborishi mumkin — support so'ralganda shu ID orqali logdan topiladi. */
export function logAiError(err, meta = {}) {
  const requestId = meta.requestId || newRequestId();
  const status = err?.status ?? err?.response?.status ?? meta.status ?? null;
  console.error(
    JSON.stringify({
      level: 'error',
      scope: 'ai',
      requestId,
      model: meta.model || null,
      endpoint: meta.endpoint || null,
      status,
      userId: meta.userId || null,
      message: err?.message || String(err),
      stack: err?.stack,
    })
  );
  return requestId;
}

/** TZ D1.2 — `AI_MODEL_CHAIN` env orqali provayder tartibini sozlash (masalan
 * "groq,openrouter,gemini"). Sozlanmagan yoki bo'sh bo'lsa, chaqiruvchining o'z
 * standart tartibi ishlatiladi — mavjud xatti-harakat buzilmaydi. */
export function resolveModelChainOrder(defaultOrder) {
  const raw = process.env.AI_MODEL_CHAIN;
  if (!raw || !raw.trim()) return defaultOrder;
  const requested = raw.split(',').map((s) => s.trim()).filter(Boolean);
  const known = new Set(defaultOrder);
  const ordered = requested.filter((name) => known.has(name));
  if (ordered.length === 0) return defaultOrder;
  // Env'da sanalmagan, lekin standart zanjirda mavjud provayderlarni oxiriga qo'shamiz —
  // shunda AI_MODEL_CHAIN faqat *tartibni* boshqaradi, birontasini butunlay o'chirib
  // qo'ymaydi (buni xohlagan bo'lsa alohida env kerak bo'lardi, hozircha shart emas).
  for (const name of defaultOrder) if (!ordered.includes(name)) ordered.push(name);
  return ordered;
}

/** TZ D1.6 — foydalanuvchi boshiga soatlik generatsiya limiti. Redis o'rniga mavjud
 * MongoDB ulanishidan foydalanadi (`aiUsage` kolleksiyasi, TTL index bilan avtomatik
 * tozalanadi — src/lib/models.js'dagi AiUsage sxemasiga q.). Limitga yetilganda
 * `{ allowed:false, retryAfterMinutes }` qaytaradi, aks holda hisoblagichni oshirib
 * `{ allowed:true }` qaytaradi. */
export async function checkAndIncrementAiRateLimit(userId) {
  const limit = Number(process.env.AI_HOURLY_LIMIT || 30);
  if (!userId || !Number.isFinite(limit) || limit <= 0) return { allowed: true };

  const { AiUsage } = await import('@/lib/models');
  const now = new Date();
  const hourBucket = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}`;

  const doc = await AiUsage.findOneAndUpdate(
    { userId, hourBucket },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000) } },
    { upsert: true, new: true }
  );

  if (doc.count > limit) {
    const minutesLeft = 60 - now.getUTCMinutes();
    return { allowed: false, retryAfterMinutes: minutesLeft };
  }
  return { allowed: true };
}

export function rateLimitMessage(retryAfterMinutes) {
  return `Bu soatlik AI so'rovlar chegarasiga yetdingiz. ${retryAfterMinutes} daqiqadan keyin qayta urinib ko'ring.`;
}
