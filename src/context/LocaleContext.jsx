'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, LANG_COOKIE, normalizeLocale, translate } from '@/lib/i18n';

// Til brauzerda saqlanadi (cookie `vocably_lang`, 1 yil) va FAQAT mijozda o'qiladi: ildiz layout'da `cookies()` ishlatish barcha sahifani
// dinamik qilib, SEO/statik sahifalarni sekinlashtirardi. Birinchi chizish har doim uz (gidratatsiya mos), so'ng tanlangan til qo'llanadi.
const LocaleContext = createContext({ locale: DEFAULT_LOCALE, setLocale: () => {}, t: (k, v) => translate(DEFAULT_LOCALE, k, v) });

function readCookie() {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`));
    return m ? normalizeLocale(decodeURIComponent(m[1])) : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  useEffect(() => {
    const l = readCookie();
    setLocaleState(l);
    document.documentElement.lang = l;
  }, []);

  const setLocale = useCallback((next) => {
    const l = normalizeLocale(next);
    try {
      document.cookie = `${LANG_COOKIE}=${l}; Path=/; Max-Age=${365 * 24 * 3600}; SameSite=Lax`;
    } catch {
      // cookie yopiq — joriy sessiya uchun holat baribir o'zgaradi
    }
    document.documentElement.lang = l;
    setLocaleState(l);
  }, []);

  const value = useMemo(() => ({ locale, setLocale, t: (key, vars) => translate(locale, key, vars) }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useT = () => useContext(LocaleContext);

/** Server komponentlar ichida ham ishlatiladi: <T k="practice.title" /> */
export function T({ k, vars }) {
  const { t } = useT();
  return t(k, vars);
}
