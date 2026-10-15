'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Headphones, PenLine, Mic, Layers, CheckCircle2, Repeat, Flame, ClipboardList } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import StatTile from '@/components/ui/StatTile';
import { formatUzDate } from '@/lib/uzDate';

// All-time statistics on the profile page. The dashboard answers "what do I
// do today"; this answers "where am I overall": vocabulary totals, IELTS
// progress per skill (latest vs best band, how many attempts), the band
// trend across graded attempts, and the last 30 days of study activity.
// Reads the same two endpoints the dashboard and results pages use, so
// the numbers always agree with the rest of the app.

const SKILLS = [
  { key: 'listening', label: 'Listening', icon: Headphones, href: '/app/tinglash' },
  { key: 'reading', label: 'Reading', icon: BookOpen, href: '/app/oqish' },
  { key: 'writing', label: 'Writing', icon: PenLine, href: '/app/yozish' },
  { key: 'speaking', label: 'Speaking', icon: Mic, href: '/app/gapirish' },
];

const band = (v) => (v == null ? '—' : Number(v).toFixed(1));

// /api/exam/attempts/history returns the rows OLDEST first (getAttemptHistory
// reverses so the chart grows left to right). Both helpers used to assume
// newest-first, so "latest" showed the first-ever band and the trend line ran
// backwards. Sorting here makes them independent of the API's order.
function newestFirst(history) {
  return [...history].sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
}

/** Pure: per-skill { latest, best, attempts } from the attempt history (any order). */
export function skillSummary(history) {
  const sorted = newestFirst(history);
  const out = {};
  for (const { key } of SKILLS) {
    const graded = sorted.filter((h) => h[key] != null);
    out[key] = {
      latest: graded[0]?.[key] ?? null,
      best: graded.length ? Math.max(...graded.map((h) => h[key])) : null,
      attempts: graded.length,
    };
  }
  return out;
}

/** Pure: chronological points for the trend line — the overall band for a
 * mock, otherwise the mean of the sections graded in that attempt. */
export function trendPoints(history) {
  return newestFirst(history)
    .filter((h) => h.submittedAt)
    .map((h) => {
      const parts = SKILLS.map(({ key }) => h[key]).filter((v) => v != null);
      const value = h.overall ?? (parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null);
      return value == null ? null : { value, date: h.submittedAt, mock: h.mode === 'mock', title: h.testTitle };
    })
    .filter(Boolean)
    .reverse()
    .slice(-12);
}

const MASTERY_PARTS = [
  { key: 'mastered', label: "O'zlashtirilgan", className: 'bg-srs-mastered' },
  { key: 'young', label: 'Mustahkamlanmoqda', className: 'bg-srs-review' },
  { key: 'learning', label: "O'rganilmoqda", className: 'bg-srs-learning' },
  { key: 'new', label: 'Yangi', className: 'bg-srs-new' },
];

function MasteryBar({ mastery, total }) {
  if (!total) return null;
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-bg-sunken/70 gap-px" role="img" aria-label="So'zlar holati bo'yicha taqsimot">
        {MASTERY_PARTS.map((p) =>
          mastery[p.key] ? <div key={p.key} className={`${p.className} first:rounded-l-full last:rounded-r-full`} style={{ width: `${(mastery[p.key] / total) * 100}%` }} /> : null
        )}
      </div>
      {/* Yorliqlar qisqartirilmaydi (mobilda "Mustahkamlanmo…" bo'lib qolardi) — tor ekranda bitta ustun. */}
      <ul className="mt-3 grid grid-cols-1 min-[420px]:grid-cols-2 gap-x-5 gap-y-1.5">
        {MASTERY_PARTS.map((p) => {
          const n = mastery[p.key] || 0;
          return (
            <li key={p.key} className="flex items-center gap-2 text-xs text-muted min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${p.className}`} aria-hidden="true" />
              <span className="min-w-0 leading-tight">{p.label}</span>
              <span className="ml-auto font-semibold text-ink tabular-nums">{n}</span>
              <span className="w-9 text-right tabular-nums text-[11px]">{Math.round((n / total) * 100)}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// The SVG is drawn at the container's real pixel width (not a scaled
// viewBox), so dots stay round and labels stay legible from phone to desktop.
function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function TrendChart({ points, target }) {
  const [ref, measured] = useWidth();
  if (points.length < 2) {
    return (
      <p className="text-xs text-muted py-6 text-center rounded-xl border border-dashed border-border">
        Trend chizig'i kamida 2 ta baholangan urinishdan keyin paydo bo'ladi.
      </p>
    );
  }
  const W = measured || 320;
  const H = 150;
  const PAD_X = 18;
  const PAD_TOP = 22;
  const PAD_BOTTOM = 26;
  const min = Math.max(0, Math.floor((Math.min(...points.map((p) => p.value), target ?? 9) - 0.5) * 2) / 2);
  const max = Math.min(9, Math.ceil((Math.max(...points.map((p) => p.value), target ?? 0) + 0.5) * 2) / 2);
  const x = (i) => PAD_X + (i * (W - PAD_X * 2)) / (points.length - 1);
  const y = (v) => H - PAD_BOTTOM - ((v - min) / (max - min || 1)) * (H - PAD_TOP - PAD_BOTTOM);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${d} L${x(points.length - 1).toFixed(1)},${(H - PAD_BOTTOM).toFixed(1)} L${x(0).toFixed(1)},${(H - PAD_BOTTOM).toFixed(1)} Z`;
  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.value - first.value;
  // Keng diapazonda (masalan 0.0 → 8.0) har 2 bandda bitta chiziq — aks holda 9 ta chiziq zich chiqadi.
  const gridStep = max - min > 4 ? 2 : 1;
  const gridBands = [];
  for (let v = min; v <= max + 1e-9; v += gridStep) gridBands.push(Math.round(v * 2) / 2);
  // Nuqta yorliqlari: birinchi, oxirgi va eng yuqori — qo'shni mock yorliqlari ustma-ust tushmasin.
  const peakIndex = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0);
  const labelled = new Set([0, points.length - 1]);
  if (peakIndex > 1 && peakIndex < points.length - 2) labelled.add(peakIndex); // chetdagi nuqtalarga yopishib qolmasin
  const fmtShort = (iso) => {
    const dt = new Date(iso);
    return `${dt.getDate()}/${dt.getMonth() + 1}`;
  };
  return (
    <figure ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={`Band trendi: oxirgisi ${band(last.value)}`} className="overflow-visible">
        <defs>
          <linearGradient id="profile-trend-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--color-accent))" stopOpacity="0.28" />
            <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridBands.map((v) => (
          <g key={v}>
            <line x1={PAD_X} x2={W - PAD_X} y1={y(v)} y2={y(v)} className="stroke-border/70" strokeDasharray="3 3" />
            <text x={0} y={y(v) + 3.5} className="fill-ink-subtle text-[10px] tabular-nums">
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        {target != null && target >= min && target <= max && (
          <>
            <line x1={PAD_X} x2={W - PAD_X} y1={y(target)} y2={y(target)} className="stroke-accent/60" strokeDasharray="5 4" strokeWidth="1.5" />
            <text x={W - PAD_X} y={y(target) - 5} textAnchor="end" className="fill-accent text-[10px] font-semibold">
              maqsad {band(target)}
            </text>
          </>
        )}
        <path d={area} fill="url(#profile-trend-fill)" />
        <path d={d} fill="none" className="stroke-accent" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={i}>
              <circle cx={x(i)} cy={y(p.value)} r={p.mock ? 5 : 3.5} className={p.mock ? 'fill-accent' : 'fill-surface stroke-accent'} strokeWidth="2">
                <title>{`${p.title} — ${band(p.value)} (${formatUzDate(p.date)})`}</title>
              </circle>
              {labelled.has(i) && (
                <text
                  x={x(i)}
                  y={y(p.value) - (p.mock ? 11 : 9)}
                  textAnchor={isLast ? 'end' : i === 0 ? 'start' : 'middle'}
                  className={`text-[11px] font-semibold tabular-nums ${isLast ? 'fill-ink' : 'fill-ink-muted'}`}
                >
                  {band(p.value)}
                </text>
              )}
              {(i === 0 || isLast || points.length <= 6) && (
                <text x={x(i)} y={H - 8} textAnchor={isLast ? 'end' : i === 0 ? 'start' : 'middle'} className="fill-ink-subtle text-[10px] tabular-nums">
                  {fmtShort(p.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted mt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" /> Mock
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border-2 border-accent" aria-hidden="true" /> Bo'lim mashqi
        </span>
        <span className="ml-auto tabular-nums">
          Oxirgi {points.length} ta urinish ·{' '}
          <span className={`font-semibold ${delta > 0 ? 'text-success' : delta < 0 ? 'text-warning' : 'text-ink'}`}>
            {delta > 0 ? '+' : ''}
            {delta.toFixed(1)}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function ActivityStrip({ days }) {
  if (!days?.length) return null;
  const max = Math.max(1, ...days.map((d) => d.reviews || 0));
  const active = days.filter((d) => d.reviews > 0).length;
  const total = days.reduce((s, d) => s + (d.reviews || 0), 0);
  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }} role="img" aria-label={`Oxirgi ${days.length} kun faolligi`}>
        {days.map((d) => {
          const r = d.reviews || 0;
          const level = r === 0 ? 0 : Math.min(4, Math.ceil((r / max) * 4));
          const tone = ['bg-bg-sunken border border-border/60', 'bg-accent/25', 'bg-accent/45', 'bg-accent/70', 'bg-accent'][level];
          return <div key={d.date} title={`${formatUzDate(d.date)}: ${r} ta takror`} className={`aspect-square rounded-[3px] ${tone}`} />;
        })}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <p>
          Oxirgi {days.length} kunda <span className="font-semibold text-ink tabular-nums">{active}</span> kun faol · <span className="font-semibold text-ink tabular-nums">{total}</span> ta takror
        </p>
        <p className="flex items-center gap-1" aria-hidden="true">
          kam
          {['bg-bg-sunken border border-border/60', 'bg-accent/25', 'bg-accent/45', 'bg-accent/70', 'bg-accent'].map((c) => (
            <span key={c} className={`w-2.5 h-2.5 rounded-[2px] ${c}`} />
          ))}
          ko'p
        </p>
      </div>
    </div>
  );
}

export default function ProfileStats() {
  const [dash, setDash] = useState(null);
  const [history, setHistory] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/dashboard').then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/exam/attempts/history').then((r) => (r.ok ? r.json() : { history: [] })),
    ])
      .then(([d, h]) => {
        if (cancelled) return;
        setDash(d);
        setHistory(h.history || []);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return <p className="text-sm text-muted">Statistikani yuklab bo'lmadi. Sahifani yangilab ko'ring.</p>;
  if (!dash || !history) {
    return (
      <div aria-hidden="true" className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  const totals = dash.totals || {};
  const masteredPct = totals.words ? Math.round((totals.mastered / totals.words) * 100) : 0;
  const skills = skillSummary(history);
  const points = trendPoints(history);
  const mocks = history.filter((h) => h.mode === 'mock').length;
  const target = dash.examPrep?.targetBand ?? null;

  return (
    <div className="space-y-4" data-tabular>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile icon={Layers} label="So'zlar" value={totals.words ?? 0} sub={`${totals.categories ?? 0} ta to'plam`} />
        <StatTile icon={CheckCircle2} label="O'zlashtirilgan" value={totals.mastered ?? 0} sub={`${masteredPct}% lug'atdan`} />
        <StatTile icon={Repeat} label="Takrorlar" value={totals.reviews ?? 0} sub={`bu hafta ${totals.thisWeekReviews ?? 0}`} />
        <StatTile icon={Flame} label="Eng uzun seriya" value={dash.streak?.longest ?? 0} sub={`hozir ${dash.streak?.current ?? 0} kun`} />
      </div>

      <section className="p-5 bg-surface border border-border rounded-2xl shadow-card space-y-3" aria-labelledby="stats-vocab">
        <h3 id="stats-vocab" className="text-sm font-semibold text-ink">
          Lug'at holati
        </h3>
        {totals.words ? (
          <MasteryBar mastery={dash.mastery || {}} total={totals.words} />
        ) : (
          <p className="text-xs text-muted">
            Hali so'z qo'shilmagan.{' '}
            <Link href="/app/lugat/jadval" className="text-accent font-semibold hover:underline">
              Birinchi so'zlaringizni qo'shing
            </Link>
          </p>
        )}
      </section>

      <section className="p-5 bg-surface border border-border rounded-2xl shadow-card space-y-4" aria-labelledby="stats-ielts">
        <div className="flex items-center gap-2">
          <h3 id="stats-ielts" className="text-sm font-semibold text-ink">
            IELTS natijalari
          </h3>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted tabular-nums">
            <ClipboardList size={13} aria-hidden="true" /> {history.length} ta urinish · {mocks} ta mock
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SKILLS.map(({ key, label, icon: Icon, href }) => {
            const s = skills[key];
            const improving = s.latest != null && s.best != null && s.latest >= s.best && s.attempts > 1;
            return (
              <Link
                key={key}
                href={href}
                className="group p-3 rounded-xl border border-border bg-bg-sunken/60 hover:border-accent/50 hover:bg-surface transition-colors min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <Icon size={13} className="text-accent" aria-hidden="true" /> {label}
                </span>
                <span className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-bold text-ink tabular-nums leading-none">{band(s.latest)}</span>
                  <span className="text-[11px] text-muted">oxirgi</span>
                </span>
                <span className="block text-[11px] text-muted mt-1.5 tabular-nums">
                  {s.attempts ? (
                    <>
                      eng yaxshi <span className={improving ? 'text-success font-semibold' : 'text-ink font-semibold'}>{band(s.best)}</span> · {s.attempts} ta
                    </>
                  ) : (
                    'hali topshirilmagan'
                  )}
                </span>
              </Link>
            );
          })}
        </div>
        <TrendChart points={points} target={target} />
      </section>

      <section className="p-5 bg-surface border border-border rounded-2xl shadow-card space-y-3" aria-labelledby="stats-activity">
        <h3 id="stats-activity" className="text-sm font-semibold text-ink">
          Faollik
        </h3>
        <ActivityStrip days={dash.activity30} />
      </section>
    </div>
  );
}
