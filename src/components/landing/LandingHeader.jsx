'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen } from 'lucide-react';

const NAV_LINKS = [
  { href: '/lugat', label: "Lug'at" },
  { href: '/blog', label: 'Blog' },
  { href: '/narxlar', label: 'Narxlar' },
];

// Faqat mobil menyu ochiq/yopiqligi uchun client — qolgan butun landing sahifa
// server komponent (statik generatsiya, tezroq LCP).
export default function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-on-accent shadow-glow">
            <BookOpen size={18} />
          </div>
          <span className="font-luxury text-xl font-bold text-ink">
            Voc<span className="text-accent">ably</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted hover:text-accent transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/kirish" className="text-sm font-medium text-ink hover:text-accent transition-colors px-2">
            Kirish
          </Link>
          <Link
            href="/royxat"
            className="bg-accent hover:bg-accent-hover text-on-accent font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-glow"
          >
            Bepul boshlash
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}
          className="md:hidden p-2 text-ink"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden mt-3 mx-4 bg-surface border border-border rounded-2xl shadow-card p-4 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm text-ink hover:bg-bg transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="h-px bg-border my-1.5" />
          <Link href="/kirish" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl text-sm text-ink hover:bg-bg transition-colors">
            Kirish
          </Link>
          <Link
            href="/royxat"
            onClick={() => setOpen(false)}
            className="bg-accent text-on-accent font-semibold px-3 py-2.5 rounded-xl text-sm text-center mt-1"
          >
            Bepul boshlash
          </Link>
        </div>
      )}
    </header>
  );
}
