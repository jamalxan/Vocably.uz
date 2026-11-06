// Xabar reaksiyalari (docs/chat/PARITY_PLAN.md WP7) — server route ham, ChatContext ham, pufakcha
// ham shu sof funksiyalardan foydalanadi: qoida (bir foydalanuvchi — bitta reaksiya, bir xil emoji
// qayta bosilsa olib tashlanadi) bitta joyda.

/** Tezkor qator (ReactionBar) — Telegram'ning standart to'plamiga yaqin. */
export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

// Eng uzun RGI emoji ketma-ketligi (teri rangli ZWJ juftliklari, 🏴 subdivision bayroqlari)
// UTF-8'da ~35 bayt. Rejadagi 16 bayt ZWJ ketma-ketliklarini (👨‍👩‍👧‍👦 = 25 bayt) rad etardi,
// holbuki "+" picker ularni taklif qiladi — shuning uchun 40.
export const MAX_EMOJI_BYTES = 40;

const VS16 = '️';

// `v` bayrog'i (Unicode property of strings) — RGI_Emoji ZWJ, bayroq, keycap va teri rangini
// to'liq biladi. Eski muhitda (bayroq yo'q) — pastdagi taxminiy tekshiruv.
const RGI_EMOJI_RE = (() => {
  try {
    return new RegExp(String.raw`^\p{RGI_Emoji}$`, 'v');
  } catch {
    return null;
  }
})();
const PICTOGRAPHIC_RE = /\p{Extended_Pictographic}|\p{Regional_Indicator}|⃣/u;

function byteLength(s) {
  return new TextEncoder().encode(s).length;
}

function graphemeCount(s) {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s)].length;
  }
  return null;
}

function isSingleEmoji(s) {
  if (RGI_EMOJI_RE) return RGI_EMOJI_RE.test(s);
  const n = graphemeCount(s);
  return (n === null || n === 1) && PICTOGRAPHIC_RE.test(s) && !/[\p{L}\s]/u.test(s);
}

/**
 * Emoji'ni saqlanadigan ko'rinishga keltiradi yoki `null` (ruxsat etilmagan). Faqat bitta emoji
 * grafemasi; `❤` (VS16'siz matn ko'rinishi) `❤️` ga aylantiriladi — aks holda bir xil yurak
 * ikkita alohida chip bo'lib qolardi.
 */
export function normalizeEmoji(input) {
  if (typeof input !== 'string') return null;
  const s = input.trim();
  if (!s || byteLength(s) > MAX_EMOJI_BYTES) return null;
  if (QUICK_REACTIONS.includes(s)) return s;
  if (isSingleEmoji(s)) return s;
  if (!s.endsWith(VS16) && byteLength(s + VS16) <= MAX_EMOJI_BYTES && isSingleEmoji(s + VS16)) return s + VS16;
  return null;
}

export function isAllowedEmoji(input) {
  return normalizeEmoji(input) !== null;
}

const uid = (v) => (v == null ? '' : String(v));
const atMs = (r) => {
  const t = new Date(r?.at).getTime();
  return Number.isFinite(t) ? t : 0;
};

/** Mening hozirgi reaksiyam (emoji) yoki null. */
export function myReaction(reactions, myId) {
  const mine = (reactions || []).find((r) => uid(r.userId) === uid(myId));
  return mine ? mine.emoji : null;
}

/**
 * Toggle qoidasi: shu emoji allaqachon meniki bo'lsa — olib tashlash (null), aks holda shu emoji
 * (boshqasi bo'lsa almashtiriladi). Server POST va klient bir xil natijaga keladi.
 */
export function nextReactionFor(reactions, myId, emoji) {
  return myReaction(reactions, myId) === emoji ? null : emoji;
}

/**
 * Foydalanuvchining reaksiyasini qo'yadi/almashtiradi (`emoji`) yoki olib tashlaydi (`null`).
 * Boshqalarning yozuvlari va tartibi o'zgarmaydi; yangi yozuv oxiriga qo'shiladi.
 */
export function applyReaction(list, { userId, emoji, at = new Date() }) {
  const rest = (list || []).filter((r) => uid(r.userId) !== uid(userId));
  return emoji ? [...rest, { emoji, userId: uid(userId), at }] : rest;
}

/**
 * Chiplar uchun: `[{ emoji, count, mine }]`, har emoji o'zining eng birinchi `at` vaqti bo'yicha
 * tartiblangan (yangi reaksiya chipni oldinga surmaydi — Telegram'dagidek barqaror).
 */
export function groupReactions(reactions, myId) {
  const groups = new Map();
  for (const r of reactions || []) {
    if (!r?.emoji) continue;
    const g = groups.get(r.emoji) || { emoji: r.emoji, count: 0, mine: false, first: Infinity };
    g.count += 1;
    if (uid(r.userId) === uid(myId)) g.mine = true;
    g.first = Math.min(g.first, atMs(r));
    groups.set(r.emoji, g);
  }
  return [...groups.values()]
    .sort((a, b) => a.first - b.first)
    .map(({ emoji, count, mine }) => ({ emoji, count, mine }));
}

/** API/socket shakli: `userId` satr, `at` ISO. Eski hujjatlarda maydon yo'q — bo'sh massiv. */
export function serializeReactions(reactions) {
  return (reactions || []).map((r) => ({
    emoji: r.emoji,
    userId: uid(r.userId),
    at: r.at instanceof Date ? r.at.toISOString() : r.at || null,
  }));
}
