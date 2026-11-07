'use client';
import { useEffect } from 'react';
import { useT } from '@/context/LocaleContext';

// The landing is a static page, so its <title> (in `metadata`) is the Uzbek one search engines index.
// Visitors who chose Russian or English get the tab title in their language. The original title
// is put back on unmount, so client-side navigation away doesn't carry it over.
export default function LocalizedTitle({ titles }) {
  const { locale } = useT();
  useEffect(() => {
    const want = titles[locale];
    if (!want) return undefined;
    const prev = document.title;
    document.title = want;
    return () => {
      if (document.title === want) document.title = prev;
    };
  }, [locale, titles]);
  return null;
}
