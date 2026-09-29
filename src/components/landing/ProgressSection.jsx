'use client';
import { useRef } from 'react';
import { Flame, Layers, Trophy, TrendingUp } from 'lucide-react';
import useRevealOnScroll from './useRevealOnScroll';
import useCountUp from './useCountUp';

// Brief §18 — "professional analytics... premium dashboard", explicitly NOT
// childish gamification: no badges/confetti, just clean numbers and bars.
const STATS = [
  { icon: Trophy, label: 'XP', end: 2480, suffix: '' },
  { icon: Flame, label: 'Streak', end: 14, suffix: ' kun' },
  { icon: Layers, label: "So'z boyligi", end: 312, suffix: '' },
  { icon: TrendingUp, label: 'Band (mock)', end: 6.5, suffix: '', decimal: true },
];

const WEAKNESS = [
  { label: 'Reading', value: 88 },
  { label: 'Listening', value: 74 },
  { label: 'Speaking', value: 61 },
  { label: 'Writing', value: 69 },
];

function StatTile({ icon: Icon, label, end, suffix, decimal }) {
  const ref = useRef(null);
  useCountUp(ref, {
    end: decimal ? end * 10 : end,
    format: (n) => (decimal ? (n / 10).toFixed(1) : n.toLocaleString('en-US')),
  });

  return (
    <div className="bg-bg border border-border rounded-2xl p-5">
      <Icon size={17} className="text-accent mb-3" />
      <p className="font-landing-display text-2xl sm:text-[28px] font-semibold text-ink tabular-nums">
        <span ref={ref}>0</span>
        {suffix}
      </p>
      <p className="text-xs font-landing-body text-muted mt-1">{label}</p>
    </div>
  );
}

export default function ProgressSection() {
  const headingRef = useRef(null);
  const statsRef = useRef(null);
  const weaknessRef = useRef(null);

  useRevealOnScroll(headingRef, { y: 24 });
  useRevealOnScroll(statsRef, { y: 28, stagger: 0.08, start: 'top 82%' });
  useRevealOnScroll(weaknessRef, { y: 28, delay: 0.15 });

  return (
    <section className="relative px-4 sm:px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto text-center mb-12" ref={headingRef}>
        <p className="font-landing-mono text-xs tracking-widest text-accent uppercase mb-3">Progress</p>
        <h2 className="font-landing-display text-3xl sm:text-4xl font-semibold text-ink leading-tight">
          O'sishingizni raqamlarda ko'ring
        </h2>
      </div>

      <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
        <div ref={statsRef} className="contents">
          {STATS.map((s) => (
            <StatTile key={s.label} {...s} />
          ))}
        </div>

        <div ref={weaknessRef} className="sm:col-span-2 lg:col-span-1 bg-surface border border-border rounded-2xl p-5">
          <p className="text-xs font-landing-body font-semibold text-ink mb-4">Ko'nikmalar bo'yicha</p>
          <div className="space-y-3">
            {WEAKNESS.map((w) => (
              <div key={w.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-landing-body text-muted">{w.label}</span>
                  <span className="text-[11px] font-landing-mono text-ink">{w.value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${w.value}%`,
                      background: w.value < 65 ? 'rgb(var(--color-warning))' : 'rgb(var(--color-accent))',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
