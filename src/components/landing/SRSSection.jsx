'use client';
import { useRef } from 'react';
import useRevealOnScroll from './useRevealOnScroll';
import useScrollScrub from './useScrollScrub';

// Brief §11 — SRS timeline visualized: the same word reappears at each
// review point, progressively more solid/confident (opacity + scale +
// glow increase left to right) as the connecting line fills on scroll.
const STAGES = [
  { step: 'T+0', label: 'Kartochka', opacity: 0.55, scale: 0.92 },
  { step: 'T+1', label: 'Reading', opacity: 0.72, scale: 0.96 },
  { step: 'T+2', label: 'Listening', opacity: 0.88, scale: 1 },
  { step: 'T+3', label: 'Speaking / Writing', opacity: 1, scale: 1.06 },
];

export default function SRSSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const rowRef = useRef(null);
  const lineFillRef = useRef(null);

  useRevealOnScroll(headingRef, { y: 24 });
  useRevealOnScroll(rowRef, { y: 30, stagger: 0.15, start: 'top 75%' });
  useScrollScrub(
    lineFillRef,
    { scaleX: 1 },
    { triggerRef: sectionRef, start: 'top 55%', end: 'bottom 65%', scrub: 0.5 },
  );

  return (
    <section ref={sectionRef} className="relative px-4 sm:px-6 py-20 sm:py-28 bg-surface border-y border-border">
      <div className="max-w-3xl mx-auto text-center mb-14" ref={headingRef}>
        <p className="font-landing-mono text-xs tracking-widest text-accent uppercase mb-3">Spaced Repetition</p>
        <h2 className="font-landing-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Vocably so'z yodlashni qanday ishlatadi?
        </h2>
        <p className="text-sm sm:text-base font-landing-body text-muted max-w-lg mx-auto">
          Har so'z aynan unutish arafasida qayta ko'rsatiladi — vaqt o'tgan sayin xotirada mustahkamlanadi.
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <div className="hidden sm:block absolute left-0 right-0 top-[52px] h-px bg-border" aria-hidden="true" />
        <div
          ref={lineFillRef}
          className="hidden sm:block absolute left-0 top-[52px] h-px bg-accent origin-left"
          style={{ width: '100%', transform: 'scaleX(0)' }}
          aria-hidden="true"
        />

        <div ref={rowRef} className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-4">
          {STAGES.map((s) => (
            <div key={s.step} className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl border flex items-center justify-center mb-4 transition-transform"
                style={{
                  borderColor: `rgb(var(--color-accent) / ${s.opacity * 0.5})`,
                  background: `rgb(var(--color-accent-soft) / ${s.opacity})`,
                  boxShadow: s.opacity > 0.8 ? '0 0 0 1px rgb(var(--color-accent) / .25), 0 10px 28px -8px rgb(var(--color-accent) / .35)' : 'none',
                  transform: `scale(${s.scale})`,
                }}
              >
                <span
                  className="font-landing-mono text-[13px] font-medium"
                  style={{ color: `rgb(var(--color-accent) / ${Math.max(s.opacity, 0.75)})` }}
                >
                  resilient
                </span>
              </div>
              <span className="font-landing-mono text-[11px] tracking-widest text-accent uppercase mb-1">{s.step}</span>
              <span className="text-sm font-landing-body font-medium text-ink">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
