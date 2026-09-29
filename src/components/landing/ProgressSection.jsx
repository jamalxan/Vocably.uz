'use client';
import { useLayoutEffect, useRef } from 'react';
import { Flame, Layers, Trophy, TrendingUp, Target } from 'lucide-react';
import { gsap } from './gsapConfig';
import useChapter from './experience/useChapter';
import useRevealOnScroll from './useRevealOnScroll';
import useCountUp from './useCountUp';

const WEEK = [
  { d: 'Du', v: 42 },
  { d: 'Se', v: 64 },
  { d: 'Ch', v: 50 },
  { d: 'Pa', v: 82 },
  { d: 'Ju', v: 70 },
  { d: 'Sh', v: 96 },
  { d: 'Ya', v: 78 },
];

const SKILLS = [
  { label: 'Reading', value: 88 },
  { label: 'Listening', value: 74 },
  { label: 'Speaking', value: 61 },
  { label: 'Writing', value: 69 },
];

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;
const VOCAB = 312;
const VOCAB_GOAL = 500;

function Count({ end, decimal = false, className = '' }) {
  const ref = useRef(null);
  useCountUp(ref, {
    end: decimal ? end * 10 : end,
    format: (n) => (decimal ? (n / 10).toFixed(1) : n.toLocaleString('en-US')),
  });
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      0
    </span>
  );
}

// Premium analytics bento — color blocks and real-looking data, no
// childish badges/confetti (brief §18).
export default function ProgressSection() {
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const gridRef = useRef(null);
  useChapter(sectionRef, 'progress');
  useRevealOnScroll(headRef, { y: 40, stagger: 0.08 });
  useRevealOnScroll(gridRef, { y: 60, stagger: 0.1, start: 'top 85%', duration: 1 });

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      const st = { trigger: gridRef.current, start: 'top 70%' };
      gsap.from('[data-bar]', { scaleY: 0, transformOrigin: 'bottom', duration: 1.1, ease: 'expo.out', stagger: 0.06, scrollTrigger: st });
      gsap.from('[data-dot]', { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2)', stagger: 0.07, scrollTrigger: st });
      gsap.from('[data-fill]', { scaleX: 0, transformOrigin: 'left', duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: st });
      gsap.fromTo(
        '[data-ring]',
        { strokeDashoffset: RING_C },
        { strokeDashoffset: RING_C * (1 - VOCAB / VOCAB_GOAL), duration: 1.6, ease: 'expo.out', scrollTrigger: st },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 px-4 sm:px-6 py-24 lg:py-36">
      <div className="max-w-7xl mx-auto">
        <div ref={headRef} className="max-w-3xl mb-12 lg:mb-16">
          <p className="font-landing-mono text-[11px] uppercase tracking-[0.35em] text-accent mb-5">Progress</p>
          <h2 className="font-landing-display font-semibold tracking-[-0.04em] leading-[0.98] text-[40px] sm:text-[56px] lg:text-[72px] text-ink">
            O'sishingizni raqamlarda ko'ring
          </h2>
        </div>

        <div ref={gridRef} className="grid gap-4 lg:gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(230px,auto))]">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary p-7 lg:p-9 text-on-primary sm:col-span-2 lg:row-span-2 shadow-premium">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(circle at 90% 0%, rgb(var(--color-accent) / .55), transparent 55%)' }}
            />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-landing-mono text-xs uppercase tracking-[0.25em] text-on-primary/70">
                  <Trophy size={14} /> XP · bu hafta
                </span>
                <span className="rounded-full bg-on-primary/10 px-3 py-1 font-landing-mono text-[11px]">+18%</span>
              </div>
              <p className="font-landing-display font-semibold leading-none tracking-[-0.05em] text-[72px] sm:text-[96px] lg:text-[120px]">
                <Count end={2480} />
              </p>
              <div className="flex h-36 items-end gap-2 sm:gap-3" aria-hidden="true">
                {WEEK.map((w, i) => (
                  <div key={w.d} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                    <span
                      data-bar
                      className="w-full rounded-t-xl rounded-b-md"
                      style={{
                        height: `${w.v}%`,
                        background:
                          i === 5
                            ? 'linear-gradient(to top, rgb(var(--color-accent)), rgb(var(--color-warning) / .9))'
                            : 'rgb(var(--color-on-primary) / .18)',
                      }}
                    />
                    <span className="font-landing-mono text-[10px] text-on-primary/60">{w.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-surface/90 p-7">
            <span className="flex items-center gap-2 font-landing-mono text-xs uppercase tracking-[0.25em] text-ink/60 mb-5">
              <Flame size={14} className="text-accent" /> Streak
            </span>
            <p className="font-landing-display font-semibold tracking-[-0.04em] text-[56px] leading-none text-ink">
              <Count end={14} />
              <span className="ml-2 text-xl text-ink/60">kun</span>
            </p>
            <div className="mt-7 flex gap-2" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <span
                  key={d}
                  data-dot
                  className="h-7 flex-1 rounded-lg"
                  style={{ background: d < 5 ? 'rgb(var(--color-accent))' : 'rgb(var(--color-border))' }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-surface/90 p-7 flex items-center gap-6">
            <div className="relative h-32 w-32 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="60" cy="60" r={RING_R} fill="none" stroke="rgb(var(--color-border))" strokeWidth="10" />
                <circle
                  data-ring
                  cx="60"
                  cy="60"
                  r={RING_R}
                  fill="none"
                  stroke="rgb(var(--color-accent))"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - VOCAB / VOCAB_GOAL)}
                />
              </svg>
              <span className="absolute inset-0 grid place-items-center font-landing-display text-2xl font-semibold text-ink">
                <Count end={VOCAB} />
              </span>
            </div>
            <div>
              <span className="flex items-center gap-2 font-landing-mono text-xs uppercase tracking-[0.25em] text-ink/60 mb-2">
                <Layers size={14} className="text-accent" /> Lug'at
              </span>
              <p className="text-sm font-landing-body text-ink/75">
                {VOCAB_GOAL} so'zlik maqsadning {Math.round((VOCAB / VOCAB_GOAL) * 100)}%i
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-accent-soft border border-accent/15 p-7">
            <span className="flex items-center gap-2 font-landing-mono text-xs uppercase tracking-[0.25em] text-ink/60 mb-5">
              <TrendingUp size={14} className="text-accent" /> Band (mock)
            </span>
            <p className="flex items-end gap-3 font-landing-display font-semibold tracking-[-0.04em] leading-none text-ink">
              <span className="text-[56px]">
                <Count end={6.5} decimal />
              </span>
              <span className="mb-2 flex items-center gap-1 text-lg text-accent">
                <Target size={16} /> 7.5
              </span>
            </p>
            <div className="mt-6 h-2 rounded-full bg-surface overflow-hidden">
              <span data-fill className="block h-full w-[72%] rounded-full bg-accent" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-surface/90 p-7">
            <span className="block font-landing-mono text-xs uppercase tracking-[0.25em] text-ink/60 mb-5">
              Ko'nikmalar bo'yicha
            </span>
            <div className="space-y-3.5">
              {SKILLS.map((s) => (
                <div key={s.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-landing-body text-ink/75">{s.label}</span>
                    <span className="text-xs font-landing-mono text-ink">{s.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <span
                      data-fill
                      className="block h-full rounded-full"
                      style={{
                        width: `${s.value}%`,
                        background: s.value < 65 ? 'rgb(var(--color-warning))' : 'rgb(var(--color-accent))',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
