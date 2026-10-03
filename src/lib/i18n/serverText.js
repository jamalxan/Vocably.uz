// Serverdan o'zbekcha tayyor holda keladigan matnlar (o'yin/vazifa/yutuq nomlari, daraja, reja, sabablar) uchun mijoz tomonidagi tarjimon.
// Server kodiga tegmaydi: aniq moslik (`exact`) yoki shablon (`patterns`: "{n} ta so'zni takrorlang" → ruscha ko'plik bilan).
// Tarjimasi yo'q matn o'zgarmay qaytadi (uz asos). Qamrov testi: src/lib/i18n/serverText.test.ts — konfiguratsiyalardagi har bir matn tarjima qilinganini tekshiradi.
import { renderTemplate, normalizeLocale } from './index';
import RU from './serverTextRu';

const DATA = { ru: RU };
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "{n} ta so'z" → /^(?<n>.+?) ta so'z$/ (kompilyatsiya bir marta)
const compiled = new Map();
function compile(locale) {
  if (compiled.has(locale)) return compiled.get(locale);
  const patterns = (DATA[locale]?.patterns || []).map(({ uz, tr }) => {
    const names = [];
    const src = uz
      .split(/(\{\w+\})/)
      .map((part) => {
        const m = part.match(/^\{(\w+)\}$/);
        if (!m) return escapeRe(part);
        names.push(m[1]);
        return `(?<${m[1]}>.+?)`;
      })
      .join('');
    return { re: new RegExp(`^${src}$`), tr, names };
  });
  compiled.set(locale, patterns);
  return patterns;
}

/** Server matnini tanlangan tilga o'giradi; til uz yoki tarjima yo'q bo'lsa — matn o'zgarmaydi. */
export function translateServerText(locale, text) {
  const l = normalizeLocale(locale);
  if (l === 'uz' || typeof text !== 'string' || !text) return text;
  const hit = DATA[l]?.exact?.[text];
  if (hit !== undefined) return hit;
  for (const p of compile(l)) {
    const m = text.match(p.re);
    if (!m) continue;
    const vars = {};
    for (const n of p.names) {
      const v = m.groups[n];
      vars[n] = /^-?\d+$/.test(v) ? Number(v) : v; // sonlar ko'plik shakli uchun son bo'lishi kerak
    }
    return renderTemplate(l, p.tr, vars);
  }
  return text;
}

/** Qamrov testi uchun: matn uchun tarjima (aniq yoki shablon) mavjudmi — nomlar (Vocabulary Boss) o'zgarmasa ham "bor" hisoblanadi. */
export function hasServerTranslation(locale, text) {
  const l = normalizeLocale(locale);
  if (DATA[l]?.exact && Object.prototype.hasOwnProperty.call(DATA[l].exact, text)) return true;
  return compile(l).some((p) => p.re.test(text));
}

export const SERVER_TEXT = DATA;
