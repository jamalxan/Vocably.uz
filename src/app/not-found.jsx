import Link from 'next/link';
import { ArrowRight, SearchX } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'Sahifa topilmadi — Vocably',
  robots: { index: false },
};

// Noma'lum manzillar (masalan eskirgan /lugat/* yoki /blog/* havola) uchun
// brendli, o'zbekcha 404 sahifa.
export default function NotFound() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <LandingHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent-soft text-accent flex items-center justify-center mb-6">
          <SearchX size={28} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">404</p>
        <h1 className="font-luxury text-2xl sm:text-3xl font-bold text-ink mb-3">Sahifa topilmadi</h1>
        <p className="text-sm text-muted max-w-md mb-8">
          Siz izlagan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan. Quyidagi bo'limlardan
          birini tanlang.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors shadow-glow"
          >
            Bosh sahifa <ArrowRight size={16} />
          </Link>
          <Link
            href="/lugat"
            className="inline-flex items-center justify-center bg-surface border border-border hover:border-accent/40 text-ink font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors"
          >
            So'zlar lug'ati
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center bg-surface border border-border hover:border-accent/40 text-ink font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors"
          >
            Blog
          </Link>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
