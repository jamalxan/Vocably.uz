'use client';
import { useT } from '@/context/LocaleContext';

// Landing / marketing copy lives next to each component as `const COPY = { uz: {...}, en: {...} }`.
// This returns the current locale's object; a missing locale falls back to Uzbek, the site's
// primary audience. In development it also checks once per dictionary that both locales have the
// same shape (same keys, same array lengths), so a string added in one language only is caught.
const checked = new WeakSet();

function shape(v) {
  if (Array.isArray(v)) return v.map(shape);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, shape(v[k])]));
  return typeof v;
}

export default function useCopy(copy) {
  const { locale } = useT();
  if (process.env.NODE_ENV !== 'production' && !checked.has(copy)) {
    checked.add(copy);
    if (copy.uz && copy.en && JSON.stringify(shape(copy.uz)) !== JSON.stringify(shape(copy.en))) {
      console.warn('[useCopy] uz/en copy shapes differ', { uz: shape(copy.uz), en: shape(copy.en) });
    }
  }
  return copy[locale] || copy.uz;
}
