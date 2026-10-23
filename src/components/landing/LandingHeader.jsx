'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useT } from '@/context/LocaleContext';
import LanguageSwitch from '@/components/LanguageSwitch';

const NAV_HREFS = ['/ielts', '/dictionary', '/blog', '/pricing'];
const TEXT = {
  en: { nav: ['IELTS', 'Dictionary', 'Blog', 'Pricing'], login: 'Log in', start: 'Start free', menu: 'Main menu', mobile: 'Mobile menu', open: 'Open menu', close: 'Close menu', lang: 'Language' },
  uz: { nav: ['IELTS', "Lug'at", 'Blog', 'Narxlar'], login: 'Kirish', start: 'Bepul boshlash', menu: 'Asosiy menyu', mobile: 'Mobil menyu', open: 'Menyuni ochish', close: 'Menyuni yopish', lang: 'Til' },
};

// Faqat mobil menyu ochiq/yopiqligi uchun client — qolgan butun landing sahifa
// server komponent (statik generatsiya, tezroq LCP).
//
// `floating` (faqat "/" bosh sahifasida, Hero ustida transparent turishi
// kerak bo'lgan joyda) yoqilganda navbar scroll holatiga qarab shaffofdan
// blur qilingan sirtga o'tadi (redesign brief §8). Boshqa marketing
// sahifalar (lugat, narxlar, blog, demo) bu prop'ni bermaydi — ular avvalgi
// statik ko'rinishida qoladi, hech narsa buzilmaydi.
export default function LandingHeader({ floating = false }) {
  const { locale } = useT();
  const tx = TEXT[locale] || TEXT.en;
  const NAV_LINKS = NAV_HREFS.map((href, i) => ({ href, label: tx.nav[i] }));
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(!floating);

  // Escape bosilganda mobil menyu yopiladi
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!floating) return undefined;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [floating]);

  return (
    <header
      className={`z-20 px-4 sm:px-6 py-4 transition-all duration-300 ${
        floating
          ? `sticky top-0 ${
              scrolled
                ? 'bg-surface/85 backdrop-blur-md border-b border-border shadow-sm'
                : 'bg-transparent border-b border-transparent'
            }`
          : 'relative'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandLogo height={32} />
        </Link>

        <nav aria-label={tx.menu} className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted hover:text-accent transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitch />
          <span className="h-6 w-px bg-border" aria-hidden="true" />
          <Link href="/login" className="text-sm font-medium text-ink hover:text-accent transition-colors px-2">
            {tx.login}
          </Link>
          <Link
            href="/register"
            className="bg-accent hover:bg-accent-hover text-on-accent font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-glow"
          >
            {tx.start}
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
        <LanguageSwitch />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? tx.close : tx.open}
          aria-expanded={open}
          aria-controls="landing-mobile-menu"
          className="w-11 h-11 -mr-2 inline-flex items-center justify-center rounded-lg text-ink"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        </div>
      </div>

      {open && (
        <>
          {/* Tashqariga bosilganda yopish uchun shaffof qatlam */}
          <div className="md:hidden fixed inset-0 -z-10" aria-hidden="true" onClick={() => setOpen(false)} />
          <nav
            id="landing-mobile-menu"
            aria-label={tx.mobile}
            className="md:hidden absolute left-4 right-4 sm:left-6 sm:right-6 top-full bg-surface border border-border rounded-2xl shadow-card p-4 flex flex-col gap-1"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-xl text-sm text-ink hover:bg-bg transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="h-px bg-border my-1.5" />
            <Link href="/login" onClick={() => setOpen(false)} className="px-3 py-3 rounded-xl text-sm text-ink hover:bg-bg transition-colors">
              {tx.login}
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="bg-accent text-on-accent font-semibold px-3 py-3 rounded-xl text-sm text-center mt-1"
            >
              {tx.start}
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}
