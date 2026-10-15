import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SEO_WORDS } from '@/lib/seoWords';
import LandingHeader from '@/components/landing/LandingHeader';

export const metadata = {
  title: "Ingliz tili so'zlari lug'ati — Vocably",
  description: "Ingliz tilidagi eng foydali so'zlarning tarjimasi, talaffuzi va misol jumlalari. Har bir so'z uchun batafsil sahifa.",
  alternates: { canonical: '/lugat' },
};

// Ochiq, statik SEO indeks — src/lib/seoWords.js'dagi izohga q. (foydalanuvchi
// shaxsiy lug'atidan mustaqil).
export default function LugatIndexPage() {
  return (
    <div className="min-h-dvh bg-bg">
      <LandingHeader />
      <main className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        <h1 className="font-luxury text-2xl sm:text-3xl font-bold text-ink mb-2">Ingliz tili so'zlari</h1>
        <p className="text-sm text-muted mb-8">Tarjimasi, talaffuzi va misollar bilan.</p>
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-3">
          {SEO_WORDS.map((w) => (
            <Link
              key={w.slug}
              href={`/lugat/${w.slug}`}
              className="flex items-center justify-between gap-2 p-4 bg-surface border border-border rounded-2xl shadow-card hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink font-word break-words">{w.word}</p>
                <p className="text-xs text-muted truncate" title={w.translations[0]}>{w.translations[0]}</p>
              </div>
              <ArrowRight size={14} className="text-muted flex-shrink-0" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
