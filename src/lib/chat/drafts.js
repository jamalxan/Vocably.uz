// Per-conversation drafts (Telegram parity): what you typed — and the message you were replying
// to — survives leaving the chat, switching chats and reloading. Stored per user in localStorage;
// pure functions here, the storage wrapper at the bottom. Tested in drafts.test.js.
//
// PARITY_PLAN WP6 — localStorage endi server qoralamasining tezkor keshi va oflayn zaxirasi:
//   - `syncedAt`  — server bergan oxirgi `updatedAt` (ms), hali sinxronlanmagan bo'lsa 0;
//   - `dirty`     — mahalliy tahrir hali PUT bilan tasdiqlanmagan (bunday yozuv har doim yutadi);
//   - tombstone   — bo'sh matn + javobsiz yozuv: boshqa qurilmadagi eski qoralama qayta tirilmasin.
// `updatedAt` — mahalliy tahrir vaqti, faqat eskirgan yozuvlarni tozalash (TTL) uchun; solishtirishda
// qurilma soati ishlatilmaydi (faqat server vaqti — `syncedAt`).

export const DRAFT_MAX_CHARS = 4000;
export const DRAFT_TTL_MS = 30 * 24 * 3600_000;

export function draftKey(userId) {
  return `vocably_chat_drafts_${userId}`;
}

/** Javob nishonining id'si: mahalliy snapshot `{ id }`, server `{ id }` yoki oddiy id satri. */
export const replyIdOf = (r) => (r ? String(r.id || r.messageId || r) : null);

/** Ikki qoralama mazmunan bir xilmi (matn + javob nishoni). */
export function sameDraftContent(a, b) {
  return String(a?.text || '') === String(b?.text || '') && replyIdOf(a?.replyTo) === replyIdOf(b?.replyTo);
}

export const isEmptyDraft = (d) => !String(d?.text || '').trim() && !d?.replyTo;

/**
 * Sets or clears one conversation's draft; returns a new map, or the SAME map when nothing changed
 * (callers then skip the server sync). Empty text + no reply = a tombstone when something was there.
 * `dirty: false` — a clean local write (after a send: the server clears the draft itself).
 */
export function setDraft(map, conversationId, { text = '', replyTo = null } = {}, now = Date.now(), { dirty = true } = {}) {
  const base = map || {};
  const id = String(conversationId);
  const prev = base[id] || null;
  const entry = { text: String(text || '').slice(0, DRAFT_MAX_CHARS), replyTo: replyTo || null };
  const empty = isEmptyDraft(entry);
  if (!prev && empty) return base;
  if (prev && sameDraftContent(prev, empty ? { text: '', replyTo: null } : entry)) {
    return prev.dirty && !dirty ? { ...base, [id]: { ...prev, dirty: false } } : base;
  }
  return {
    ...base,
    [id]: { text: empty ? '' : entry.text, replyTo: empty ? null : entry.replyTo, updatedAt: now, syncedAt: prev?.syncedAt || 0, dirty },
  };
}

export function getDraft(map, conversationId) {
  return map?.[String(conversationId)] || null;
}

/** Drops ancient drafts and junk entries (a corrupted store never breaks the chat). */
export function pruneDrafts(map, now = Date.now()) {
  const out = {};
  for (const [id, d] of Object.entries(map || {})) {
    if (!d || typeof d !== 'object') continue;
    if (typeof d.text !== 'string') continue;
    if (now - (Number(d.updatedAt) || 0) > DRAFT_TTL_MS) continue;
    // WP6 dan oldingi yozuv (`syncedAt` yo'q) — hali serverga yetmagan mahalliy tahrir deb hisoblanadi.
    const legacy = !('syncedAt' in d);
    out[id] = {
      text: d.text.slice(0, DRAFT_MAX_CHARS),
      replyTo: d.replyTo || null,
      updatedAt: Number(d.updatedAt) || now,
      syncedAt: Number(d.syncedAt) || 0,
      dirty: legacy ? !isEmptyDraft(d) : d.dirty === true,
    };
  }
  return out;
}

export function readDrafts(userId, storage = globalThis.localStorage) {
  if (!userId || !storage) return {};
  try {
    const raw = storage.getItem(draftKey(userId));
    return pruneDrafts(raw ? JSON.parse(raw) : {});
  } catch {
    return {};
  }
}

export function writeDrafts(userId, map, storage = globalThis.localStorage) {
  if (!userId || !storage) return;
  try {
    storage.setItem(draftKey(userId), JSON.stringify(map));
  } catch {
    // quota / private mode — drafts live in memory for this session only
  }
}
