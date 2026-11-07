// So'z tarjimalari tili (2026-11-07): interfeys ruscha bo'lsa — ruscha (`synsRu`), aks holda o'zbekcha (`syns`).
//
// Saqlash: `syns` — o'zbekcha tarjimalar (tarixiy maydon, butun kod bazasi shuni o'qiydi), `synsRu` — ruscha.
// Ko'rsatish: server so'zlarni foydalanuvchi tilida qaytaradi — `syns` maydoni o'sha tildagi tarjima bilan
// almashtiriladi (localizeWord), shuning uchun o'yinlar, kartochkalar, jadval va h.k. o'zgarishsiz ishlaydi.
// Tanlangan tilda tarjima hali yo'q bo'lsa, ikkinchi tildagisi vaqtincha ko'rsatiladi va `tlMissing: true`
// belgilanadi — mijoz shunda AI orqali to'ldirishni so'raydi (POST /api/words/translations).
import { LANG_COOKIE, translationLangFor } from '@/lib/i18n';

export const TRANSLATION_LANGS = ['uz', 'ru'];
const FIELD = { uz: 'syns', ru: 'synsRu' };

export const synsField = (lang) => FIELD[lang] || FIELD.uz;

/** So'rov cookie'sidan tarjima tili ('uz' | 'ru'). */
export function requestTranslationLang(req) {
  let v;
  try {
    v = req?.cookies?.get?.(LANG_COOKIE)?.value;
  } catch {
    v = undefined;
  }
  return translationLangFor(v);
}

const list = (v) => (Array.isArray(v) ? v.filter((s) => typeof s === 'string' && s.trim()) : []);

/** So'zning `lang` tilidagi tarjimalari (bo'lmasa — bo'sh massiv). */
export function wordTranslations(word, lang) {
  return list(word?.[synsField(lang)]);
}

/**
 * So'zni `lang` tilida ko'rsatish uchun nusxa: `syns` ← shu tildagi tarjimalar (bo'lmasa ikkinchi tildagisi).
 * Mongoose hujjati ham, oddiy obyekt ham qabul qilinadi. uz uchun hech narsa o'zgarmaydi (faqat `syns`
 * bo'sh bo'lib `synsRu` bor bo'lsa — o'shani ko'rsatadi).
 */
export function localizeWord(word, lang) {
  if (!word) return word;
  const plain = typeof word.toObject === 'function' ? word.toObject() : { ...word };
  const own = wordTranslations(plain, lang);
  const other = wordTranslations(plain, lang === 'ru' ? 'uz' : 'ru');
  delete plain.synsRu;
  if (own.length) return { ...plain, syns: own };
  if (lang === 'uz' && !other.length) return { ...plain, syns: list(plain.syns) };
  return { ...plain, syns: other, tlMissing: true };
}

export function localizeCategories(categories, lang) {
  return (categories || []).map((c) => {
    const plain = typeof c?.toObject === 'function' ? c.toObject() : { ...c };
    return { ...plain, words: (plain.words || []).map((w) => localizeWord(w, lang)) };
  });
}

/** Yangi so'z yozuvi: kelgan tarjimalar foydalanuvchi tilidagi maydonga yoziladi. */
export function wordDocForLang({ syns, ...rest }, lang) {
  const clean = list(syns).map((s) => s.trim());
  return lang === 'ru' ? { ...rest, syns: [], synsRu: clean } : { ...rest, syns: clean };
}
