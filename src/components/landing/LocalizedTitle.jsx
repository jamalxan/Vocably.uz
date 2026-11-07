'use client';
import { useEffect } from 'react';
import { useT } from '@/context/LocaleContext';

// The landing is a static page, so its <title> (in `metadata`) is the Uzbek one search engines index.
// Visitors who chose Russian or English get the tab title in their language. Next writes the
// metadata <title> back once the page finishes streaming (after this effect has run), so while mounted
// that write is watched for and undone. The original title is put back on unmount.
// `titles.uz` must be the page's metadata title.
export default function LocalizedTitle({ titles }) {
  const { locale } = useT();
  useEffect(() => {
    const base = titles.uz;
    const want = titles[locale];
    if (!want || want === base) return undefined;
    // Only undo Next re-writing the landing's own title; any other title means another page took over.
    const apply = () => {
      if (document.title === base) document.title = want;
    };
    document.title = want;
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      if (document.title === want) document.title = base;
    };
  }, [locale, titles]);
  return null;
}
