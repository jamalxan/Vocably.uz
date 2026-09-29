'use client';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from './gsapConfig';
import useChapter from './experience/useChapter';
import useRevealOnScroll from './useRevealOnScroll';

// Chart geometry — retention over 7 days.
const W = 560;
const H = 280;
const PL = 40;
const PR = 14;
const PT = 30;
const PB = 34;
const DAYS = 7;
const FLOOR = 0.12;
const x = (t) => PL + (t / DAYS) * (W - PL - PR);
const y = (r) => PT + (1 - r) * (H - PT - PB);
const retention = (dt, s) => FLOOR + (1 - FLOOR) * Math.exp(-dt / s);

function forgettingPath() {
  let d = `M ${x(0)} ${y(1)}`;
  for (let i = 1; i <= 70; i++) {
    const t = (i / 70) * DAYS;
    d += ` L ${x(t).toFixed(1)} ${y(retention(t, 1.1)).toFixed(1)}`;
  }
  return d;
}

const REVIEWS = [0, 1, 2, 3];
const STABILITY = [0.9, 1.9, 3.8, 9];

function srsPath() {
  let d = `M ${x(0)} ${y(1)}`;
  REVIEWS.forEach((tr, k) => {
    const end = k < REVIEWS.length - 1 ? REVIEWS[k + 1] : DAYS;
    for (let i = 1; i <= 24; i++) {
      const t = tr + ((end - tr) * i) / 24;
      d += ` L ${x(t).toFixed(1)} ${y(retention(t - tr, STABILITY[k])).toFixed(1)}`;
    }
    if (k < REVIEWS.length - 1) d += ` L ${x(end).toFixed(1)} ${y(1)}`;
  });
  return d;
}

const FORGET_D = forgettingPath();
const SRS_D = srsPath();

const STAGES = [
  { step: 'T+0', label: 'Kartochka', opacity: 0.55, scale: 0.9 },
  { step: 'T+1', label: 'Reading', opacity: 0.72, scale: 0.96 },
  { step: 'T+2', label: 'Listening', opacity: 0.88, scale: 1.02 },
  { step: 'T+3', label: 'Speaking / Writing', opacity: 1, scale: 1.1 },
];

export default function SRSSection() {
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const chartRef = useRef(null);
  const stagesRef = useRef(null);
  useChapter(sectionRef, 'srs');
  useRevealOnScroll(headRef, { y: 40, stagger: 0.1 });
  useRevealOnScroll(stagesRef, { y: 40, stagger: 0.12, start: 'top 85%' });

  // Both curves draw themselves as the chart scrolls through; review markers
  // pop in as the SRS line reaches them.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: chartRef.current, start: 'top 80%', end: 'bottom 45%', scrub: 0.8 },
      });
      tl.fromTo('[data-curve="forget"]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, ease: 'none' })
        .fromTo('[data-curve="srs"]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, ease: 'none' }, 0.2)
        .from('[data-marker]', { scale: 0, opacity: 0, transformOrigin: 'center', stagger: 0.45, duration: 0.3 }, 0.25);
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 px-4 sm:px-6 py-24 lg:py-36">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
        <div ref={headRef}>
          <p className="font-landing-mono text-[11px] uppercase tracking-[0.35em] text-accent mb-5">Spaced Repetition</p>
          <h2 className="font-landing-display font-semibold tracking-[-0.035em] leading-[1.02] text-[34px] sm:text-[46px] lg:text-[58px] text-ink mb-6">
            Vocably so'z yodlashni qanday ishlatadi?
          </h2>
          <p className="font-landing-body text-base lg:text-lg text-ink/75 leading-relaxed max-w-md">
            Yangi so'z bir necha kunda xotiradan o'chadi. Vocably uni aynan unutish arafasida qayta ko'rsatadi — har
            takrorlashdan keyin egri chiziq sekinroq pasayadi va so'z uzoq muddatli xotiraga o'tadi.
          </p>
          <div className="mt-8 flex flex-wrap gap-5 font-landing-mono text-xs">
            <span className="flex items-center gap-2 text-ink/70">
              <span className="h-[3px] w-7 rounded-full bg-ink/25" /> Oddiy yodlash
            </span>
            <span className="flex items-center gap-2 text-ink">
              <span className="h-[3px] w-7 rounded-full bg-accent" /> Vocably SRS
            </span>
          </div>
        </div>

        <div
          ref={chartRef}
          className="relative rounded-[2rem] border border-border bg-surface/85 p-4 sm:p-7 shadow-premium"
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Unutish egri chizig'i va SRS takrorlash egri chizig'i taqqoslanishi">
            {[0, 0.25, 0.5, 0.75, 1].map((r) => (
              <g key={r}>
                <line x1={PL} x2={W - PR} y1={y(r)} y2={y(r)} stroke="rgb(var(--color-border))" strokeDasharray="3 5" />
                <text x={PL - 8} y={y(r) + 4} textAnchor="end" className="font-landing-mono" fontSize="10" fill="rgb(var(--color-ink) / .5)">
                  {Math.round(r * 100)}%
                </text>
              </g>
            ))}
            {Array.from({ length: DAYS + 1 }, (_, d) => (
              <text key={d} x={x(d)} y={H - 10} textAnchor="middle" className="font-landing-mono" fontSize="10" fill="rgb(var(--color-ink) / .5)">
                {d}k
              </text>
            ))}
            <path
              data-curve="forget"
              d={FORGET_D}
              pathLength="1"
              strokeDasharray="1"
              fill="none"
              stroke="rgb(var(--color-ink) / .28)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              data-curve="srs"
              d={SRS_D}
              pathLength="1"
              strokeDasharray="1"
              fill="none"
              stroke="rgb(var(--color-accent))"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 6px 12px rgb(var(--color-accent) / .35))' }}
            />
            {REVIEWS.map((t, k) => (
              <g key={t} data-marker>
                <circle cx={x(t)} cy={y(1)} r="11" fill="rgb(var(--color-accent) / .15)" />
                <circle cx={x(t)} cy={y(1)} r="5.5" fill="rgb(var(--color-accent))" stroke="rgb(var(--color-surface-2))" strokeWidth="2" />
                <text x={x(t)} y={y(1) - 16} textAnchor="middle" className="font-landing-mono" fontSize="11" fontWeight="600" fill="rgb(var(--color-accent))">
                  T+{k}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div ref={stagesRef} className="max-w-5xl mx-auto mt-16 lg:mt-24 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAGES.map((s) => (
          <div key={s.step} className="rounded-3xl border border-border bg-surface/80 p-5 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-full max-w-[140px] items-center justify-center rounded-2xl border"
              style={{
                borderColor: `rgb(var(--color-accent) / ${s.opacity * 0.5})`,
                background: `rgb(var(--color-accent-soft) / ${s.opacity})`,
                boxShadow:
                  s.opacity > 0.8
                    ? '0 0 0 1px rgb(var(--color-accent) / .25), 0 12px 32px -8px rgb(var(--color-accent) / .45)'
                    : 'none',
                transform: `scale(${s.scale})`,
              }}
            >
              <span className="font-landing-mono text-[13px] font-medium text-accent" style={{ opacity: Math.max(s.opacity, 0.7) }}>
                resilient
              </span>
            </div>
            <p className="font-landing-mono text-[11px] tracking-[0.25em] text-accent uppercase mb-1">{s.step}</p>
            <p className="text-sm font-landing-body font-medium text-ink">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
