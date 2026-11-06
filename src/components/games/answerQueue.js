// Yuborilmagan javoblar navbati (TZ §38): ulanish uzilsa javoblar saqlanadi, tiklanganda qayta yuboriladi.
// Server (qid, attempt) bo'yicha idempotent — bir javobni ikki marta yuborish xavfsiz.
import { sendAnswers } from './api';

const KEY_PREFIX = 'vocably-game-queue-';

function read(sessionId) {
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + sessionId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(sessionId, list) {
  try {
    if (list.length) sessionStorage.setItem(KEY_PREFIX + sessionId, JSON.stringify(list));
    else sessionStorage.removeItem(KEY_PREFIX + sessionId);
  } catch {
    // sessionStorage yopiq bo'lsa ham o'yin ishlaydi (xotiradagi navbat qoladi)
  }
}

/**
 * `requestTimeoutMs` (optional): every flush aborts its POST after that long, so a stalled network
 * cannot hold 'flushing' (and everything waiting on it) forever. An aborted flush is an ordinary
 * non-fatal failure: the answers stay pending for the next flush. Without it nothing is aborted.
 */
export function createAnswerQueue(sessionId, { requestTimeoutMs = 0 } = {}) {
  let pending = read(sessionId);
  let flushing = null;

  const persist = () => write(sessionId, pending);

  // AbortController + setTimeout rather than AbortSignal.timeout(): it works on older Safari and
  // under fake timers. The timer is cleared as soon as the request settles.
  const post = (batch) => {
    if (!(requestTimeoutMs > 0) || typeof AbortController === 'undefined') return sendAnswers(sessionId, batch);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), requestTimeoutMs);
    return sendAnswers(sessionId, batch, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
  };

  return {
    get size() {
      return pending.length;
    },
    /** Javobni navbatga qo'shadi (bir xil qid+attempt ikki marta qo'shilmaydi). */
    add(answer) {
      if (!pending.some((a) => a.qid === answer.qid && (a.attempt || 1) === (answer.attempt || 1))) {
        pending.push(answer);
        persist();
      }
    },
    /**
     * Navbatdagi barcha javoblarni bitta so'rovda yuboradi.
     * @returns {Promise<{ok:boolean, results:Array}>} ok=false bo'lsa javoblar navbatda qoladi.
     * (A request aborted by requestTimeoutMs is such an ok=false, non-fatal result.)
     */
    async flush() {
      if (flushing) return flushing;
      if (!pending.length) return { ok: true, results: [] };
      const batch = pending.slice(0, 60);
      flushing = (async () => {
        try {
          const data = await post(batch);
          pending = pending.filter((a) => !batch.some((b) => b.qid === a.qid && (b.attempt || 1) === (a.attempt || 1)));
          persist();
          return { ok: true, results: data.results || [] };
        } catch (err) {
          // Serverdan aniq rad (410 muddati o'tgan / 409 yakunlangan / 404) — qayta yuborishning foydasi yo'q.
          if (err.status === 404 || err.status === 409 || err.status === 410) {
            pending = [];
            persist();
            return { ok: false, results: [], fatal: err };
          }
          return { ok: false, results: [], error: err };
        } finally {
          flushing = null;
        }
      })();
      return flushing;
    },
    clear() {
      pending = [];
      persist();
    },
  };
}
