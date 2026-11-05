// Per-conversation drafts (Telegram parity): what you typed — and the message you were replying
// to — survives leaving the chat, switching chats and reloading. Stored per user in localStorage;
// pure functions here, the storage wrapper at the bottom. Tested in drafts.test.js.

export const DRAFT_MAX_CHARS = 4000;
export const DRAFT_TTL_MS = 30 * 24 * 3600_000;

export function draftKey(userId) {
  return `vocably_chat_drafts_${userId}`;
}

/** Sets or clears one conversation's draft; returns a new map. Empty text + no reply = removed. */
export function setDraft(map, conversationId, { text = '', replyTo = null } = {}, now = Date.now()) {
  const id = String(conversationId);
  const clean = String(text || '').slice(0, DRAFT_MAX_CHARS);
  const next = { ...map };
  if (!clean.trim() && !replyTo) {
    delete next[id];
    return next;
  }
  next[id] = { text: clean, replyTo: replyTo || null, updatedAt: now };
  return next;
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
    out[id] = { text: d.text.slice(0, DRAFT_MAX_CHARS), replyTo: d.replyTo || null, updatedAt: Number(d.updatedAt) || now };
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
