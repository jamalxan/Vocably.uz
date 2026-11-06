// Server bilan sinxronlanadigan qoralamalar (PARITY_PLAN WP6), klient tomoni.
// localStorage (drafts.js) — tezkor kesh va oflayn zaxira; bu modul:
//   - `createDraftSync` — har suhbat uchun 600 ms debounce bilan PUT /draft (ketma-ket tahrirlar bitta
//     so'rovga birlashadi), tarmoq xatosida bir marta qayta urinadi, keyin jim (yozuv `dirty` qoladi
//     va keyingi ulanishda yana yuboriladi); `flush({ keepalive })` — sahifa yopilayotganda;
//   - `mergeDraft` — mahalliy va server qiymatini yarashtirish qoidasi (pastda);
//   - `getDeviceId` — shu tab/qurilma id'si: o'zimiz yuborgan `draft:update` qaytib kelsa e'tiborsiz.
// Sof funksiyalar va soxta fetch/taymer bilan draftSync.test.js'da tekshiriladi.
import { isEmptyDraft, replyIdOf, sameDraftContent } from './drafts';

export const DRAFT_SYNC_DEBOUNCE_MS = 600;
export const DEVICE_ID_KEY = 'vocably:deviceId';

/** Server vaqti (ISO yoki ms) -> ms; noto'g'ri qiymat -> 0. */
export function serverTime(v) {
  const n = typeof v === 'number' ? v : Date.parse(v || '');
  return Number.isFinite(n) ? n : 0;
}

/** Server qoralamasi `{ text, replyTo, updatedAt }` -> mahalliy yozuv (toza, server vaqti bilan). */
export function draftFromServer(remote, now = Date.now()) {
  return {
    text: String(remote?.text || ''),
    replyTo: remote?.replyTo || null,
    updatedAt: now,
    syncedAt: serverTime(remote?.updatedAt),
    dirty: false,
  };
}

/**
 * Yarashtirish qoidasi (PARITY_PLAN §2.6, WP6):
 *   1) mahalliy yozuv `dirty` (hali PUT bilan tasdiqlanmagan tahrir) — mahalliy yutadi;
 *   2) aks holda server `updatedAt` mahalliy `syncedAt`dan yangiroq bo'lsa — server yutadi
 *      (tombstone ham: tozalangan qoralama boshqa qurilma keshidan qayta tirilmaydi);
 *   3) aks holda mahalliy qoladi. Qurilma soati hech qachon solishtirilmaydi.
 * O'zgarmasa AYNAN `local` qaytadi (chaqiruvchi shu bilan "o'zgardimi"ni biladi).
 */
export function mergeDraft(local, remote, now = Date.now()) {
  if (!remote) return local || null;
  if (local?.dirty) return local;
  const at = serverTime(remote.updatedAt);
  if (!local) return isEmptyDraft(remote) ? null : draftFromServer(remote, now);
  if (at <= (local.syncedAt || 0)) return local;
  if (sameDraftContent(local, remote)) return { ...local, syncedAt: at };
  return draftFromServer(remote, now);
}

/** Bir nechta server qoralamasini xaritaga qo'shadi: [[conversationId, remote|null], ...]. */
export function mergeDraftMap(map, entries, now = Date.now()) {
  let next = map || {};
  for (const [id, remote] of entries || []) {
    const key = String(id);
    const cur = next[key] || null;
    const merged = mergeDraft(cur, remote, now);
    if (merged === cur) continue;
    next = { ...next };
    if (merged) next[key] = merged;
    else delete next[key];
  }
  return next;
}

/** PUT tasdiqlandi: yuborilgan mazmun hali joyida bo'lsa yozuv toza bo'ladi; `syncedAt` server vaqti. */
export function ackDraft(map, conversationId, sent, serverDraft) {
  const key = String(conversationId);
  const cur = map?.[key];
  if (!cur || !serverDraft) return map;
  const at = Math.max(cur.syncedAt || 0, serverTime(serverDraft.updatedAt));
  const dirty = cur.dirty && !sameDraftContent(cur, sent);
  if (at === cur.syncedAt && dirty === cur.dirty) return map;
  return { ...map, [key]: { ...cur, syncedAt: at, dirty } };
}

/** Shu tab id'si (sessionStorage) — o'z `draft:update` hodisamizni tanish uchun. */
export function getDeviceId(storage = globalThis.sessionStorage, random = () => globalThis.crypto?.randomUUID?.() || `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`) {
  try {
    const existing = storage?.getItem(DEVICE_ID_KEY);
    if (existing && /^[A-Za-z0-9_-]{1,64}$/.test(existing)) return existing;
    const id = String(random()).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64) || 'device';
    storage?.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    return String(random()).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64) || 'device';
  }
}

export const draftUrl = (conversationId) => `/api/chat/conversations/${conversationId}/draft`;

/**
 * Debounce'li PUT navbati. `onAck(conversationId, sentDraft, serverDraft)` — server javobi kelganda.
 * Bitta suhbat uchun bir vaqtda faqat bitta so'rov: u tugaguncha kelgan yangi qiymat navbatda kutadi
 * (eski so'rov yangisidan keyin yetib borib, uni bosib ketmasin).
 */
export function createDraftSync({
  fetchImpl = (...args) => globalThis.fetch(...args),
  debounceMs = DRAFT_SYNC_DEBOUNCE_MS,
  deviceId = null,
  onAck = () => {},
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (t) => clearTimeout(t),
} = {}) {
  const pending = new Map(); // id -> { draft, timer }
  const inflight = new Set();
  const queued = new Map(); // id -> draft (in-flight so'rovdan keyin yuboriladi)

  const bodyOf = (draft) => JSON.stringify({ text: String(draft?.text || ''), replyTo: replyIdOf(draft?.replyTo), deviceId });

  async function put(id, draft, keepalive) {
    const init = { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: bodyOf(draft), ...(keepalive ? { keepalive: true } : {}) };
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await fetchImpl(draftUrl(id), init);
      } catch {
        // tarmoq xatosi — bir marta qayta urinamiz, keyin jim (localStorage'da `dirty` bo'lib qoladi)
      }
    }
    return null;
  }

  async function send(id, draft, { keepalive = false } = {}) {
    if (inflight.has(id)) {
      queued.set(id, draft);
      return;
    }
    inflight.add(id);
    try {
      const res = await put(id, draft, keepalive);
      if (res?.ok) {
        const data = await res.json().catch(() => null);
        if (data && 'draft' in data) onAck(id, draft, data.draft);
      }
    } finally {
      inflight.delete(id);
      if (queued.has(id)) {
        const next = queued.get(id);
        queued.delete(id);
        await send(id, next, { keepalive });
      }
    }
  }

  function cancel(id) {
    const p = pending.get(id);
    if (p) clearTimer(p.timer);
    pending.delete(id);
  }

  return {
    schedule(conversationId, draft) {
      const id = String(conversationId);
      cancel(id);
      const timer = setTimer(() => {
        pending.delete(id);
        send(id, draft);
      }, debounceMs);
      pending.set(id, { draft, timer });
    },
    /** Hammasini darhol yuboradi (pagehide / tab yashirildi: `keepalive: true`). */
    flush({ keepalive = false } = {}) {
      const jobs = [];
      for (const [id, { draft, timer }] of pending) {
        clearTimer(timer);
        jobs.push(send(id, draft, { keepalive }));
      }
      pending.clear();
      return Promise.all(jobs);
    },
    /**
     * Xabar yuborildi: server qoralamani o'zi tozalaydi (messages POST), shuning uchun kutayotgan PUT
     * bekor qilinadi. Faqat eski matnli PUT hali yo'lda bo'lsa — undan keyin tombstone yuboriladi,
     * aks holda o'sha kechikkan PUT tozalangan qoralamani qayta tiriltirardi.
     */
    clearAfterSend(conversationId) {
      const id = String(conversationId);
      cancel(id);
      if (inflight.has(id)) queued.set(id, { text: '', replyTo: null });
      else queued.delete(id);
    },
    isPending: (conversationId) => pending.has(String(conversationId)) || inflight.has(String(conversationId)),
    dispose() {
      for (const { timer } of pending.values()) clearTimer(timer);
      pending.clear();
      queued.clear();
    },
  };
}
