// Yengil i18n (B1): kutubxonasiz, bundle'ni o'stirmaydi. Standart til — inglizcha (en), ikkinchisi — o'zbekcha (uz); kalit topilmasa en'ga, u ham yo'q bo'lsa kalitning o'ziga tushadi.
// Matnlar bosqichma-bosqich o'tkaziladi: `t()` ishlatilmagan joylar o'zbekcha qoladi (aralash til bo'lmasligi uchun sahifa-sahifa).
import uz from './messages/uz';
import en from './messages/en';

export const LOCALES = ['en', 'uz'];
export const DEFAULT_LOCALE = 'en';
export const LANG_COOKIE = 'vocably_lang';
export const LOCALE_LABELS = { en: 'English', uz: "O'zbekcha" };
const DICTS = { en, uz };

export const normalizeLocale = (v) => (LOCALES.includes(v) ? v : DEFAULT_LOCALE);

/** Ko'plik shakli: en — [birlik, ko'plik] (1 word, 2 words); o'zbekchada faqat birinchi shakl. */
export function pluralForm(locale, n, forms) {
  if (locale !== 'en') return forms[0];
  return Math.abs(Number(n)) === 1 ? forms[0] : (forms[1] ?? forms[0]);
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
