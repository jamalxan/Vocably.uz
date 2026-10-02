// Matnni "so'z topildi / topilmadi" bo'laklariga ajratadi (AI hikoyada o'rganilayotgan so'zlarni belgilash uchun).
// HTML emas — React elementlari sifatida chiziladi, shuning uchun AI matni orqali XSS bo'lmaydi.
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** @returns {{ text: string, hit: boolean }[]} — so'z shakllari (-s/-es/-ed/-ing/-d/-ly) ham belgilanadi. */
export function splitByWords(text, words) {
  const src = typeof text === 'string' ? text : '';
  const list = [...new Set((Array.isArray(words) ? words : []).map((w) => String(w || '').trim()).filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!src || !list.length) return src ? [{ text: src, hit: false }] : [];
  const re = new RegExp(`\\b(?:${list.map(escapeRe).join('|')})(?:s|es|ed|d|ing|ly)?\\b`, 'gi');
  const parts = [];
  let last = 0;
  for (const m of src.matchAll(re)) {
    if (m.index > last) parts.push({ text: src.slice(last, m.index), hit: false });
    parts.push({ text: m[0], hit: true });
    last = m.index + m[0].length;
  }
  if (last < src.length) parts.push({ text: src.slice(last), hit: false });
  return parts;
}
