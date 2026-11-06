// Xabarlarni guruhlash (PARITY_PLAN WP8.2, Telegram): bir yuboruvchining ketma-ket, 5 daqiqa ichidagi
// va bir kunda yozilgan xabarlari bitta guruh — guruh ichida 2 px oraliq, guruhlar orasida 10 px,
// "dum" (tail) faqat guruhning oxirgi pufakchasida. Qo'ng'iroq yozuvi har doim alohida guruh.
// O'chirilgan xabar ham yuboruvchiniki bo'lib qoladi — guruhni uzmaydi.
export const GROUP_WINDOW_MS = 5 * 60 * 1000;

const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
};

/** Ikki ketma-ket xabar bitta guruhgami (`prev` — oldingisi, `next` — keyingisi). */
export function sameGroup(prev, next, windowMs = GROUP_WINDOW_MS) {
  if (!prev || !next) return false;
  if (prev.type === 'call' || next.type === 'call') return false;
  if (String(prev.senderId) !== String(next.senderId)) return false;
  const a = new Date(prev.createdAt).getTime();
  const b = new Date(next.createdAt).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  if (b - a > windowMs || b < a) return false;
  return dayKey(prev.createdAt) === dayKey(next.createdAt);
}

/**
 * `list` — ekrandagi tartibda xabarlar (albom uchun uning vakili). Har biri uchun
 * `{ first, last }`: guruhning birinchisi / oxirgisimi.
 */
export function groupMessages(list, { windowMs = GROUP_WINDOW_MS } = {}) {
  return list.map((m, i) => ({
    first: !sameGroup(list[i - 1], m, windowMs),
    last: !sameGroup(m, list[i + 1], windowMs),
  }));
}
