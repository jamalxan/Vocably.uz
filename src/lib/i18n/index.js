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

/** `{n}` kabi o'rinbosarlar `vars` bilan almashtiriladi; topilmasa o'rinbosar o'zi qoladi. */
export function translate(locale, key, vars) {
  const raw = DICTS[normalizeLocale(locale)]?.[key] ?? DICTS.uz[key] ?? key;
  return vars ? raw.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : raw;
}

export const MESSAGES = DICTS;
