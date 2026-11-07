// Yengil i18n (B1): kutubxonasiz, bundle'ni o'stirmaydi. Tillar: inglizcha (en, standart), o'zbekcha (uz), ruscha (ru, 2026-11-07);
// kalit topilmasa en'ga, u ham yo'q bo'lsa kalitning o'ziga tushadi.
// Matnlar bosqichma-bosqich o'tkaziladi: `t()` ishlatilmagan joylar o'zbekcha qoladi (aralash til bo'lmasligi uchun sahifa-sahifa).
import uz from './messages/uz';
import en from './messages/en';
import ru from './messages/ru';

export const LOCALES = ['en', 'uz', 'ru'];
export const DEFAULT_LOCALE = 'en';
export const LANG_COOKIE = 'vocably_lang';
export const LOCALE_LABELS = { en: 'English', uz: "O'zbekcha", ru: 'Русский' };
const DICTS = { en, uz, ru };

export const normalizeLocale = (v) => (LOCALES.includes(v) ? v : DEFAULT_LOCALE);

/** So'z tarjimalari tili: interfeys ruscha bo'lsa — ruscha, aks holda o'zbekcha (mahsulot qarori 2026-11-07). */
export const translationLangFor = (locale) => (normalizeLocale(locale) === 'ru' ? 'ru' : 'uz');

/** Intl uchun til kodi (sonlar/sanalar). */
export const numLocaleFor = (locale) => ({ uz: 'uz-UZ', ru: 'ru-RU' })[normalizeLocale(locale)] || 'en-US';

/**
 * Ko'plik shakli:
 *  en — [birlik, ko'plik] (1 word, 2 words);
 *  ru — [one, few, many] (1 слово, 2 слова, 5 слов; 11–14 — many);
 *  uz — faqat birinchi shakl.
 */
export function pluralForm(locale, n, forms) {
  const abs = Math.abs(Number(n));
  if (locale === 'en') return abs === 1 ? forms[0] : (forms[1] ?? forms[0]);
  if (locale === 'ru') {
    if (!Number.isInteger(abs)) return forms[1] ?? forms[0];
    const m10 = abs % 10;
    const m100 = abs % 100;
    if (m10 === 1 && m100 !== 11) return forms[0];
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1] ?? forms[0];
    return forms[2] ?? forms[1] ?? forms[0];
  }
  return forms[0];
}

/** `{n}` — oddiy o'rinbosar; `{n#word|words}` — `n` songa qarab ko'plik shakli. Berilmagan o'rinbosar o'zi qoladi. */
export function renderTemplate(locale, template, vars) {
  if (!vars) return template;
  return template
    .replace(/\{(\w+)#([^}]+)\}/g, (m, k, forms) => (k in vars ? pluralForm(locale, vars[k], forms.split('|')) : m))
    .replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function translate(locale, key, vars) {
  const l = normalizeLocale(locale);
  return renderTemplate(l, DICTS[l]?.[key] ?? DICTS.en[key] ?? key, vars);
}

export const MESSAGES = DICTS;
