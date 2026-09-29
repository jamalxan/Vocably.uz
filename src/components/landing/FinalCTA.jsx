'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import LearningCoreFallback from './LearningCoreFallback';
import useRevealOnScroll from './useRevealOnScroll';

// Brief §20 — the Learning Core reappears at the very end, tying the whole
// scroll story together. Reuses the lightweight CSS-only orb (not a second
// live WebGL canvas) — one Three.js scene per page is enough (§25 perf).
export default function FinalCTA() {
  const ref = useRef(null);
  useRevealOnScroll(ref, { y: 28 });

  return (
    <section className="relative px-4 sm:px-6 py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-70 pointer-events-none" aria-hidden="true">
        <div className="landing-float">
          <LearningCoreFallback size={340} />
        </div>
      </div>

      <div ref={ref} className="relative max-w-2xl mx-auto text-center">
        <h2 className="font-landing-display text-3xl sm:text-4xl lg:text-[44px] font-semibold text-ink leading-tight mb-4">
          Bugundan boshlang. Natijangizni o'zgartiring.
        </h2>
        <p className="text-sm sm:text-base font-landing-body text-muted mb-8">
          Ro'yxatdan o'tish 1 daqiqa, kredit karta shart emas.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/royxat"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-landing-body font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-300 shadow-glow hover:scale-[1.02] active:scale-[0.98]"
          >
            Ro'yxatdan o'tish
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/demo"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface border border-border hover:border-accent/40 text-ink font-landing-body font-semibold px-8 py-4 rounded-xl text-sm transition-colors duration-300"
          >
            Batafsil ma'lumot
          </Link>
        </div>
      </div>
    </section>
  );
}
