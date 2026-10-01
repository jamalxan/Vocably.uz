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

export function createAnswerQueue(sessionId) {
  let pending = read(sessionId);
  let flushing = null;

  const persist = () => write(sessionId, pending);

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
     */
    async flush() {
      if (flushing) return flushing;
      if (!pending.length) return { ok: true, results: [] };
      const batch = pending.slice(0, 60);
      flushing = (async () => {
        try {
          const data = await sendAnswers(sessionId, batch);
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
