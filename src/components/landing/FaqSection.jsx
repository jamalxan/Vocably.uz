'use client';
import { useRef } from 'react';
import { Plus } from 'lucide-react';
import useChapter from './experience/useChapter';
import useRevealOnScroll from './useRevealOnScroll';
import { FAQS } from './faqData';

export default function FaqSection() {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  useChapter(sectionRef, 'faq');
  useRevealOnScroll(listRef, { y: 36, stagger: 0.08, start: 'top 85%' });

  return (
    <section ref={sectionRef} className="relative z-10 px-4 sm:px-6 py-24 lg:py-32">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
        <div>
          <p className="font-landing-mono text-[11px] uppercase tracking-[0.35em] text-accent mb-5">FAQ</p>
          <h2 className="font-landing-display font-semibold tracking-[-0.04em] leading-[0.98] text-[40px] sm:text-[52px] text-ink">
            Ko'p beriladigan savollar
          </h2>
        </div>
        <div ref={listRef} className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-[1.5rem] border border-border bg-surface/90 p-6 transition-colors open:border-accent/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-landing-display text-lg font-semibold text-ink">
                {f.q}
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent transition-transform duration-500 group-open:rotate-45">
                  <Plus size={16} />
                </span>
              </summary>
              <p className="mt-4 text-sm sm:text-base font-landing-body leading-relaxed text-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
