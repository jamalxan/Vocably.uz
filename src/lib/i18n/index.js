// Yengil i18n (B1): kutubxonasiz, bundle'ni o'stirmaydi. Asos til — o'zbekcha (uz); kalit boshqa tilda yo'q bo'lsa uz'ga, u ham yo'q bo'lsa kalitning o'ziga tushadi.
// Matnlar bosqichma-bosqich o'tkaziladi: `t()` ishlatilmagan joylar o'zbekcha qoladi (aralash til bo'lmasligi uchun sahifa-sahifa).
import uz from './messages/uz';
import ru from './messages/ru';

export const LOCALES = ['uz', 'ru'];
export const DEFAULT_LOCALE = 'uz';
export const LANG_COOKIE = 'vocably_lang';
export const LOCALE_LABELS = { uz: "O'zbekcha", ru: 'Русский' };
const DICTS = { uz, ru };

export const normalizeLocale = (v) => (LOCALES.includes(v) ? v : DEFAULT_LOCALE);

const RU_PLURALS = new Intl.PluralRules('ru');

/** Ko'plik shakli: ru — [bir, ikki-to'rt, ko'p] (1 слово, 2 слова, 5 слов); boshqa tillarda faqat birinchi shakl. */
export function pluralForm(locale, n, forms) {
  if (locale !== 'ru') return forms[0];
  const c = RU_PLURALS.select(Math.abs(Number(n)) || 0);
  return c === 'one' ? forms[0] : c === 'few' ? (forms[1] ?? forms[0]) : (forms[2] ?? forms[1] ?? forms[0]);
}

/** `{n}` — oddiy o'rinbosar; `{n#слово|слова|слов}` — `n` songa qarab ko'plik shakli. Berilmagan o'rinbosar o'zi qoladi. */
export function renderTemplate(locale, template, vars) {
  if (!vars) return template;
  return template
    .replace(/\{(\w+)#([^}]+)\}/g, (m, k, forms) => (k in vars ? pluralForm(locale, vars[k], forms.split('|')) : m))
    .replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function translate(locale, key, vars) {
  const l = normalizeLocale(locale);
  return renderTemplate(l, DICTS[l]?.[key] ?? DICTS.uz[key] ?? key, vars);
}

export const MESSAGES = DICTS;
