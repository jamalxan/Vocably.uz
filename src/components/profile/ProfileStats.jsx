'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Headphones, PenLine, Mic, Layers, CheckCircle2, Repeat, Flame, ClipboardList } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
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

/** Pure: per-skill { latest, best, attempts } from newest-first history. */
export function skillSummary(history) {
  const out = {};
  for (const { key } of SKILLS) {
    const graded = history.filter((h) => h[key] != null);
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
  return history
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

function Tile({ icon: Icon, label, value, sub }) {
  return (
    <div className="p-4 bg-surface border border-border rounded-2xl shadow-card min-w-0">
      <div className="flex items-start gap-1.5 text-xs font-semibold text-muted leading-tight">
        <Icon size={13} className="text-accent flex-shrink-0 mt-px" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-ink tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

function MasteryBar({ mastery, total }) {
  const parts = [
    { key: 'mastered', label: "O'zlashtirilgan", className: 'bg-success' },
    { key: 'young', label: 'Mustahkamlanmoqda', className: 'bg-info' },
    { key: 'learning', label: "O'rganilmoqda", className: 'bg-warning' },
    { key: 'new', label: 'Yangi', className: 'bg-border' },
  ];
  if (!total) return null;
  return (
    <div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-bg" role="img" aria-label="So'zlar holati bo'yicha taqsimot">
        {parts.map((p) =>
          mastery[p.key] ? <div key={p.key} className={p.className} style={{ width: `${(mastery[p.key] / total) * 100}%` }} /> : null
        )}
      </div>
      <ul className="mt-2.5 grid grid-cols-2 gap-x-5 gap-y-1.5">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center gap-1.5 text-xs text-muted min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.className}`} aria-hidden="true" />
            <span className="truncate">{p.label}</span>
            <span className="ml-auto font-semibold text-ink tabular-nums">{mastery[p.key] || 0}</span>
          </li>
        ))}
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
      <p className="text-xs text-muted py-6 text-center">
        Trend chizig'i kamida 2 ta baholangan urinishdan keyin paydo bo'ladi.
      </p>
    );
  }
  const W = measured || 320;
  const H = 120;
  const PAD = 14;
  const min = Math.max(0, Math.min(...points.map((p) => p.value), target ?? 9) - 0.5);
  const max = Math.min(9, Math.max(...points.map((p) => p.value), target ?? 0) + 0.5);
  const x = (i) => PAD + (i * (W - PAD * 2)) / (points.length - 1);
  const y = (v) => H - PAD - ((v - min) / (max - min || 1)) * (H - PAD * 2);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const last = points[points.length - 1];
  return (
    <figure ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={`Band trendi: oxirgisi ${band(last.value)}`}>
        {target != null && target >= min && target <= max && (
          <>
            <line x1={PAD} x2={W - PAD} y1={y(target)} y2={y(target)} className="stroke-accent/40" strokeDasharray="4 4" />
            <text x={W - PAD} y={y(target) - 4} textAnchor="end" className="fill-accent text-[10px] font-semibold">
              maqsad {band(target)}
            </text>
          </>
        )}
        <path d={d} fill="none" className="stroke-accent" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r={p.mock ? 4.5 : 3} className={p.mock ? 'fill-accent' : 'fill-surface stroke-accent'} strokeWidth="2">
            <title>{`${p.title} — ${band(p.value)} (${formatUzDate(p.date)})`}</title>
          </circle>
        ))}
      </svg>
      <figcaption className="flex items-center gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" /> Mock
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border-2 border-accent" aria-hidden="true" /> Bo'lim mashqi
        </span>
        <span className="ml-auto">Oxirgi {points.length} ta urinish</span>
      </figcaption>
    </figure>
  );
}

function ActivityStrip({ days }) {
  if (!days?.length) return null;
  const max = Math.max(1, ...days.map((d) => d.reviews || 0));
  const active = days.filter((d) => d.reviews > 0).length;
  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        {days.map((d) => {
          const r = d.reviews || 0;
          const level = r === 0 ? 0 : Math.min(4, Math.ceil((r / max) * 4));
          const tone = ['bg-border/50', 'bg-accent/25', 'bg-accent/45', 'bg-accent/70', 'bg-accent'][level];
          return <div key={d.date} title={`${formatUzDate(d.date)}: ${r} ta takror`} className={`aspect-square rounded-[3px] ${tone}`} />;
        })}
      </div>
      <p className="mt-2 text-xs text-muted">
        Oxirgi {days.length} kunda <span className="font-semibold text-ink">{active}</span> kun faol bo'ldingiz.
      </p>
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tile icon={Layers} label="So'zlar" value={totals.words ?? 0} sub={`${totals.categories ?? 0} ta to'plam`} />
        <Tile icon={CheckCircle2} label="O'zlashtirilgan" value={totals.mastered ?? 0} sub={`${masteredPct}% lug'atdan`} />
        <Tile icon={Repeat} label="Takrorlar" value={totals.reviews ?? 0} sub={`bu hafta ${totals.thisWeekReviews ?? 0}`} />
        <Tile icon={Flame} label="Eng uzun seriya" value={dash.streak?.longest ?? 0} sub={`hozir ${dash.streak?.current ?? 0} kun`} />
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
          <span className="ml-auto flex items-center gap-1 text-xs text-muted">
            <ClipboardList size={13} aria-hidden="true" /> {history.length} ta urinish · {mocks} ta mock
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SKILLS.map(({ key, label, icon: Icon, href }) => {
            const s = skills[key];
            return (
              <Link
                key={key}
                href={href}
                className="p-3 rounded-xl border border-border bg-bg hover:border-accent/50 transition-colors min-w-0"
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <Icon size={13} className="text-accent" aria-hidden="true" /> {label}
                </span>
                <span className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="font-display text-xl font-bold text-ink tabular-nums">{band(s.latest)}</span>
                  <span className="text-[11px] text-muted">oxirgi</span>
                </span>
                <span className="block text-[11px] text-muted mt-0.5">
                  {s.attempts ? `eng yaxshi ${band(s.best)} · ${s.attempts} ta` : 'hali topshirilmagan'}
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
