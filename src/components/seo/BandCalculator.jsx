'use client';
import { useState } from 'react';
import { listeningBand, readingBand, roundOverall } from '@/lib/exam/scoring';

// Same conversion the app uses to grade tests (src/lib/exam/scoring.ts), so
// the public calculator and a user's real results never disagree.
const BANDS = [9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3];

function RawInput({ id, label, value, onChange }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="mt-1.5 flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={0}
          max={40}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-[rgb(var(--color-accent))]"
        />
        <input
          type="number"
          min={0}
          max={40}
          value={value}
          aria-label={`${label} — to‘g‘ri javoblar`}
          onChange={(e) => onChange(Math.max(0, Math.min(40, Number(e.target.value) || 0)))}
          className="w-16 px-2 py-1.5 rounded-lg bg-bg border border-border text-ink text-center tabular-nums"
        />
        <span className="text-xs text-muted">/ 40</span>
      </div>
    </label>
  );
}

function BandSelect({ id, label, value, onChange }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-bg border border-border text-ink"
      >
        {BANDS.map((b) => (
          <option key={b} value={b}>
            {b.toFixed(1)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function BandCalculator() {
  const [lRaw, setLRaw] = useState(30);
  const [rRaw, setRRaw] = useState(30);
  const [module, setModule] = useState('academic');
  const [w, setW] = useState(6.5);
  const [s, setS] = useState(6.5);

  const l = listeningBand(lRaw).band;
  const r = readingBand(rRaw, module).band;
  const avg = (l + r + w + s) / 4;
  const overall = roundOverall(avg);

  return (
    <div className="rounded-3xl border border-border bg-surface shadow-card p-5 sm:p-7 space-y-6">
      <div className="flex gap-1.5 p-1 rounded-xl bg-bg border border-border w-fit" role="radiogroup" aria-label="Modul">
        {[
          ['academic', 'Academic'],
          ['general', 'General Training'],
        ].map(([k, lab]) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={module === k}
            onClick={() => setModule(k)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold ${module === k ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'}`}
          >
            {lab}
          </button>
        ))}
      </div>

      <div className="grid gap-5">
        <RawInput id="l-raw" label={`Listening — band ${l.toFixed(1)}`} value={lRaw} onChange={setLRaw} />
        <RawInput id="r-raw" label={`Reading (${module === 'academic' ? 'Academic' : 'GT'}) — band ${r.toFixed(1)}`} value={rRaw} onChange={setRRaw} />
        <div className="grid grid-cols-2 gap-4">
          <BandSelect id="w-band" label="Writing band" value={w} onChange={setW} />
          <BandSelect id="s-band" label="Speaking band" value={s} onChange={setS} />
        </div>
      </div>

      <output
        htmlFor="l-raw r-raw w-band s-band"
        className="flex items-center justify-between gap-4 rounded-2xl bg-primary text-on-primary px-5 py-4"
        aria-live="polite"
      >
        <span>
          <span className="block text-xs uppercase tracking-wider text-on-primary/70">Umumiy (Overall) band</span>
          <span className="block text-xs text-on-primary/60 mt-0.5">o‘rtacha {avg.toFixed(3)} → yaxlitlangan</span>
        </span>
        <span className="font-display text-4xl font-bold tabular-nums">{overall.toFixed(1)}</span>
      </output>
    </div>
  );
}
