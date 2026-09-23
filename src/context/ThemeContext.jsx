'use client';
import { createContext, useContext, useCallback, useEffect, useState } from 'react';

// Uch holatli tema: 'light' | 'dark' | 'system'. localStorage'da saqlanadi va
// <html data-theme="..."> ga qo'yiladi — haqiqiy rang qiymatlari globals.css'dagi
// [data-theme="dark"] / @media(prefers-color-scheme: dark) bloklarida (deyarli
// barcha tokenlar invert bo'ladi, faqat --color-primary/-hover emas — sabab shu
// faylning yonidagi globals.css izohida).
// 'system' tanlanganda <html> ga data-theme atributi umuman qo'yilmaydi — CSS'dagi
// @media bloki OS afzalligiga qarab o'zi hal qiladi.
const STORAGE_KEY = 'vocably-theme';

// Layout.jsx'ning <body> boshida bloklovchi <script> sifatida inline qo'yiladi —
// birinchi bo'yoqdan OLDIN data-theme'ni o'rnatib, "yorug' tema bir lahza
// chaqnab keyin qorong'iga o'tishi" (FOUC) muammosining oldini oladi. Faqat
// localStorage'ni o'qiydi, hech qanday tashqi so'rov yubormaydi.
// Brauzer paneli (<meta name="theme-color">) ham tanlangan temaga moslanadi —
// aks holda OS light bo'lib, "Tungi" tanlanganda qora sahifa ustida och panel qolardi.
// Qiymatlar = --color-bg (globals.css) light/dark.
const THEME_COLORS = { light: '#F3EDE6', dark: '#14090D' };

export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);var c=t==='dark'?'${THEME_COLORS.dark}':'${THEME_COLORS.light}';var m=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<m.length;i++)m[i].setAttribute('content',c);}}catch(e){}})();`;

function syncThemeColor(theme) {
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    const own = (m.getAttribute('media') || '').includes('dark') ? 'dark' : 'light';
    m.setAttribute('content', THEME_COLORS[theme === 'system' ? own : theme]);
  });
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('system');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored);
        syncThemeColor(stored);
      }
    } catch {
      // localStorage yopiq (private rejim va h.k.) — 'system' bilan davom etamiz
    }
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // yozib bo'lmasa ham UI holati baribir yangilanadi — shu sessiyada ishlaydi
    }
    if (next === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', next);
    syncThemeColor(next);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme faqat ThemeProvider ichida ishlatiladi');
  return ctx;
}
