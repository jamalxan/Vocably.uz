'use client';
import { useT } from '@/context/LocaleContext';

// Landing / marketing / game copy lives next to each component as `const COPY = { uz: {...}, en: {...}, ru: {...} }`.
// This returns the current locale's object. A missing locale falls back to Uzbek (the site's primary
// audience) — except Russian, which falls back to English (more readable for Russian speakers).
// In development it also checks once per dictionary that every locale has the same shape as `en`
// (same keys, same array lengths), so a string added in one language only is caught.
const checked = new WeakSet();

export function copyShape(v) {
  if (Array.isArray(v)) return v.map(copyShape);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, copyShape(v[k])]));
  return typeof v;
}

export function pickCopy(copy, locale) {
  return copy[locale] || (locale === 'ru' ? copy.en : null) || copy.uz;
}

export default function useCopy(copy) {
  const { locale } = useT();
  if (process.env.NODE_ENV !== 'production' && !checked.has(copy)) {
    checked.add(copy);
    const base = copy.en && JSON.stringify(copyShape(copy.en));
    for (const l of ['uz', 'ru']) {
      if (base && copy[l] && JSON.stringify(copyShape(copy[l])) !== base) {
        console.warn(`[useCopy] ${l}/en copy shapes differ`, { [l]: copyShape(copy[l]), en: copyShape(copy.en) });
      }
    }
  }
  return pickCopy(copy, locale);
}
