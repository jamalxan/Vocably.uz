// Tugagan qo'ng'iroqni Next.js'ga yozish: POST ${NEXTJS_INTERNAL_URL}/api/internal/call-event
// (X-Internal-Secret bilan). Next tomoni callId bo'yicha idempotent — shuning uchun
// tarmoq xatosi yoki 5xx'da (masalan Vercel sovuq start) bemalol qayta urinamiz:
// har urinishga 8 s, keyin 1 s / 3 s / 9 s kutib. 4xx'da qayta urinilmaydi (so'rovning
// o'zi noto'g'ri — takrorlash yordam bermaydi). Oxirida ham bo'lmasa — to'liq tana bilan
// log qilinadi (qo'lda tiklash uchun) va `null` qaytadi; qo'ng'iroqning o'ziga ta'sir yo'q.
'use strict';

function createPersister({
  url,
  secret,
  fetchImpl = globalThis.fetch,
  timeoutMs = 8000,
  retryDelaysMs = [1000, 3000, 9000],
  log = console,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  setTimer = setTimeout,
  clearTimer = clearTimeout,
} = {}) {
  if (!url) {
    log.warn("[realtime] NEXTJS_INTERNAL_URL sozlanmagan — calls: history disabled (qo'ng'iroq tarixi yozilmaydi)");
    return async () => null;
  }
  const endpoint = `${String(url).replace(/\/$/, '')}/api/internal/call-event`;

  async function attempt(body) {
    const controller = new AbortController();
    const timer = setTimer(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': secret || '' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return { done: true, value: data && data.message ? { message: data.message } : null };
      }
      if (res.status >= 400 && res.status < 500) {
        log.error(`[realtime] call-event rad etildi (${res.status})`, JSON.stringify(body));
        return { done: true, value: null };
      }
      return { done: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { done: false, error: err && err.name === 'AbortError' ? 'timeout' : (err && err.message) || String(err) };
    } finally {
      clearTimer(timer);
    }
  }

  return async function persist(body) {
    const attempts = retryDelaysMs.length + 1;
    for (let i = 0; i < attempts; i += 1) {
      const r = await attempt(body);
      if (r.done) return r.value;
      if (i < retryDelaysMs.length) {
        log.warn(`[realtime] call-event urinish ${i + 1} muvaffaqiyatsiz (${r.error}), qayta uriniladi`);
        await sleep(retryDelaysMs[i]);
      }
    }
    log.error('[realtime] call-event saqlanmadi', JSON.stringify(body));
    return null;
  };
}

module.exports = { createPersister };
