// D (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 D — composer) — xabar matnidagi
// oddiy Markdown-uslubidagi belgilash: **qalin** va _kursiv_. Bu TO'LIQ Markdown
// parser EMAS (ichma-ich, qochirish/escape, `kod`/||spoiler|| qo'llab-quvvatlanmaydi
// — ataylab eng sodda, past xavfli yondashuv): faqat MessageBubble.jsx allaqachon
// bor bo'lgan linkifyText naqshiga o'xshab, matnni bo'laklarga ajratadi. Pure
// funksiya — DOM/React'ga bog'liq emas, shuning uchun bevosita unit test qilinadi.
const TOKEN_RE = /(\*\*[^*\n]+\*\*|_[^_\n]+_)/g;

/**
 * @param {string} text
 * @returns {Array<{ type: 'text' | 'bold' | 'italic', value: string }>}
 */
export function parseMessageFormatting(text) {
  if (!text) return [];
  const str = String(text);
  const tokens = [];
  let lastIndex = 0;
  // `.split(regex)` ATAYLAB ishlatilmadi: u mos kelmagan bo'laklarni ham
  // qaytaradi, va agar matn tasodifan "**...**" bilan boshlanib/tugasa (lekin
  // regex hech qanday joyda mos kelmasa — masalan orasida qatorko'chirish bo'lsa),
  // shu YAXLIT bo'lak ham noto'g'ri "bold" deb aniqlanib qolardi (faqat
  // boshi/oxiriga qarab). `matchAll` esa FAQAT haqiqatan mos kelgan joylarni
  // beradi, ular orasidagi hamma narsa (mos kelmagan bo'lsa ham) oddiy matn bo'lib qoladi.
  for (const match of str.matchAll(TOKEN_RE)) {
    const full = match[0];
    const index = match.index;
    if (index > lastIndex) {
      tokens.push({ type: 'text', value: str.slice(lastIndex, index) });
    }
    if (full.startsWith('**')) {
      tokens.push({ type: 'bold', value: full.slice(2, -2) });
    } else {
      tokens.push({ type: 'italic', value: full.slice(1, -1) });
    }
    lastIndex = index + full.length;
  }
  if (lastIndex < str.length) {
    tokens.push({ type: 'text', value: str.slice(lastIndex) });
  }
  return tokens;
}
