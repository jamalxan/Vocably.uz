import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

// Pure server-rendered text — the brief is explicit (§27) that important
// copy must never live only inside the <canvas>. This is the real H1/LCP
// content; the 3D core next to it is purely decorative.
export default function HeroCopy() {
  return (
    <div className="max-w-xl text-center lg:text-left">
      <div className="inline-flex items-center gap-1.5 bg-accent-soft text-accent text-[11px] sm:text-xs font-landing-body font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
        <Sparkles size={13} /> IELTS uchun zamonaviy o'quv platformasi
      </div>

      <h1 className="font-landing-display text-[36px] sm:text-[48px] lg:text-[60px] xl:text-[68px] font-semibold text-ink leading-[1.08] tracking-tight mb-6">
        Ingliz tilini <span className="text-accent">unutmaydigan</span> usulda o'rganing
      </h1>

      <p className="text-base sm:text-lg font-landing-body text-muted max-w-lg mx-auto lg:mx-0 mb-9 leading-relaxed">
        Vocably IELTS imtihoniga tayyorgarlik uchun Reading, Listening, Writing, Speaking, Vocabulary,
        AI va Mock testlarni bitta tizimga birlashtiradi.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
        <Link
          href="/royxat"
          className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-landing-body font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-300 shadow-glow hover:scale-[1.02] active:scale-[0.98]"
        >
          Bepul boshlash
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
        <a
          href="#qanday-ishlaydi"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface border border-border hover:border-accent/40 text-ink font-landing-body font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors duration-300"
        >
          Qanday ishlaydi?
        </a>
      </div>

      <p className="text-xs font-landing-body text-muted mt-5">
        Kredit karta talab qilinmaydi · 1 daqiqada boshlanadi
      </p>
    </div>
  );
}
