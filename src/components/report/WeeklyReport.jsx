'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, BookOpen, ChevronLeft, ChevronRight, Flame, Lock, Loader2, RotateCcw, Sparkles, Star, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { useT } from '@/context/LocaleContext';
import { addDays, weekKey, weekStartOf, WEEKLY_REPORT_CONFIG } from '@/lib/weeklyReport';

// "Haftalik hisobot" (TZ 2.0 §6.2.4, §10): words learned, band change and next week's focus for
// everyone; the personal part (day by day, accuracy, skills, comparison, next week's targets) for
// Premium. Data: GET /api/reports/weekly?week=YYYY-Www.

const SKILL = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };
const SKILL_HREF = { reading: '/app/reading', listening: '/app/listening', writing: '/app/writing', speaking: '/app/speaking' };

const COPY = {
  uz: {
    title: 'Haftalik hisobot',
    prev: 'Oldingi hafta',
    next: 'Keyingi hafta',
    thisWeek: 'Shu hafta (davom etmoqda)',
    loadError: "Hisobotni yuklab bo'lmadi",
    retry: 'Qayta urinish',
    empty: "Bu haftada mashg'ulot bo'lmagan.",
    emptyNow: "Bu hafta hali mashg'ulot bo'lmagan — bugungi rejadan boshlang, yakshanba kuni hisobot keladi.",
    toPlan: 'Bugungi rejaga',
    inProgress: "Solishtirish va keyingi hafta maqsadi hafta tugagach, yakshanba kuni hisoblanadi.",
    words: "Yangi so'zlar",
    wordsGoal: 'maqsad {n}',
    xp: 'XP',
    activeDays: 'Faol kunlar',
    streak: 'Seriya',
    streakDays: '{n} kun',
    longest: 'rekord {n}',
    band: 'Band bahosi',
    noBand: "Hali baho yo'q — bitta bo'lim testini ishlang",
    bandSame: "o'zgarmadi",
    target: 'maqsad {b}',
    focus: 'Keyingi hafta fokus',
    focusWeakest: "Eng past natija — {b}. Bu hafta unga ko'proq vaqt bering.",
    focusUntested: "Bu ko'nikma bo'yicha hali natija yo'q — bitta test ishlab, darajangizni aniqlang.",
    practice: 'Mashq qilish',
    personal: 'Shaxsiy tahlil',
    byDay: 'Kunlar kesimida (XP)',
    days: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
    accuracy: "To'g'ri javoblar",
    reviews: '{n} ta javob',
    tasks: 'Reja bajarilishi',
    tasksOf: '{done}/{total} vazifa',
    skills: "Ko'nikmalar",
    sessions: '{n} ta mashq',
    vsPrev: "O'tgan haftaga nisbatan",
    noPrev: "O'tgan hafta ma'lumoti yo'q",
    nextWeek: 'Keyingi hafta maqsadi',
    goalDays: 'Kamida {n} kun mashq qiling',
    goalWords: "{n} ta yangi so'z o'rganing",
    goalFocus: '{skill} bo‘yicha {n} ta mashq',
    tips: {
      consistency: "Har kuni oz-ozdan: 10 daqiqa ham seriyani saqlaydi va so'zlarni yodda tutadi.",
      words: "So'z maqsadiga yetish uchun har kuni yangi so'zlar vazifasini bajaring.",
      testFocus: 'Fokus ko‘nikma bo‘yicha bitta bo‘lim testi — keyingi hisobotda band o‘zgarishini ko‘rasiz.',
      practiceFocus: 'Reja fokus ko‘nikmaga 5 kundan 2 kunini beradi — o‘sha kunlarni o‘tkazib yubormang.',
      focusMissed: "Bu hafta fokus ko'nikma bo'yicha mashq bo'lmadi — keyingi haftada 2 ta mashqdan boshlang.",
    },
    lockedTitle: 'Shaxsiy hisobot — Premium',
    lockedBody: "Kunlar kesimidagi faollik, to'g'ri javoblar foizi, ko'nikmalar tahlili, o'tgan hafta bilan solishtirish va keyingi hafta uchun aniq maqsadlar.",
    upgrade: "Premium'ga o'tish",
  },
  en: {
    title: 'Weekly report',
    prev: 'Previous week',
    next: 'Next week',
    thisWeek: 'This week (in progress)',
    loadError: 'Could not load the report',
    retry: 'Try again',
    empty: 'No study this week.',
    emptyNow: 'No study yet this week — start with today’s plan; the report arrives on Sunday.',
    toPlan: 'Go to today’s plan',
    inProgress: 'The comparison and next week’s goals are worked out once the week ends, on Sunday.',
    words: 'New words',
    wordsGoal: 'goal {n}',
    xp: 'XP',
    activeDays: 'Active days',
    streak: 'Streak',
    streakDays: '{n} days',
    longest: 'best {n}',
    band: 'Band estimate',
    noBand: 'No estimate yet — take one section test',
    bandSame: 'no change',
    target: 'target {b}',
    focus: 'Next week’s focus',
    focusWeakest: 'Your lowest score — {b}. Give it more time this week.',
    focusUntested: 'No result for this skill yet — take one test to find your level.',
    practice: 'Practise',
    personal: 'Personal analysis',
    byDay: 'By day (XP)',
    days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    accuracy: 'Correct answers',
    reviews: '{n} answers',
    tasks: 'Plan completion',
    tasksOf: '{done}/{total} tasks',
    skills: 'Skills',
    sessions: '{n} sessions',
    vsPrev: 'Compared with last week',
    noPrev: 'No data for last week',
    nextWeek: 'Next week’s goals',
    goalDays: 'Study on at least {n} days',
    goalWords: 'Learn {n} new words',
    goalFocus: '{n} {skill} sessions',
    tips: {
      consistency: 'A little every day: even 10 minutes keeps the streak and the words alive.',
      words: 'Do the new-words task every day to reach the word goal.',
      testFocus: 'One section test in your focus skill — next report will show the band change.',
      practiceFocus: 'The plan gives your focus skill 2 days out of 5 — don’t skip those.',
      focusMissed: 'No practice in your focus skill this week — start next week with 2 sessions.',
    },
    lockedTitle: 'Personal report — Premium',
    lockedBody: 'Day-by-day activity, accuracy, skill breakdown, comparison with last week and concrete goals for next week.',
    upgrade: 'Upgrade to Premium',
  },
};

const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
const fmtBand = (b) => Number(b).toFixed(1);

/** Uzbek range comes from the server ("2–8 noyabr"); English is formatted here. */
function rangeLabel(data, locale) {
  if (locale !== 'en') return data.range;
  const f = (d, opts) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });
  return data.start.slice(5, 7) === data.end.slice(5, 7)
    ? `${f(data.start, { day: 'numeric' })}–${f(data.end, { day: 'numeric', month: 'long' })}`
    : `${f(data.start, { day: 'numeric', month: 'long' })} – ${f(data.end, { day: 'numeric', month: 'long' })}`;
}

function Tile({ icon: Icon, label, value, sub, testId }) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card p-4" data-testid={testId}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
        <Icon size={13} aria-hidden="true" /> {label}
      </p>
      <p className="text-2xl font-bold text-ink tabular-nums mt-1">{value}</p>
      {sub && <p className="text-xs text-muted tabular-nums mt-0.5">{sub}</p>}
    </div>
  );
}

function Delta({ n, suffix = '' }) {
  if (n == null) return <span className="text-muted">—</span>;
  if (n === 0) return <span className="text-muted tabular-nums">0{suffix}</span>;
  const up = n > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold tabular-nums ${up ? 'text-success' : 'text-danger'}`}>
      <Icon size={13} aria-hidden="true" /> {up ? '+' : ''}{n}{suffix}
    </span>
  );
}

export default function WeeklyReport({ week }) {
  const c = useCopy(COPY);
  const { locale } = useT();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/reports/weekly${week ? `?week=${encodeURIComponent(week)}` : ''}`, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        setData(j);
        setError(false);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setError(true);
      });
    return () => ctrl.abort();
  }, [week, attempt]);

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-border bg-surface shadow-card p-5 text-sm text-muted flex items-center justify-between gap-3">
        {c.loadError}
        <button type="button" onClick={() => setAttempt((n) => n + 1)} className="p-2 rounded-lg hover:bg-bg" aria-label={c.retry}>
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }
  if (!data) {
    return (
      <div aria-busy="true" className="rounded-2xl border border-border bg-surface shadow-card h-64 grid place-items-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted" aria-hidden="true" />
      </div>
    );
  }

  const prevWeek = weekKey(addDays(weekStartOf(data.week), -7));
  const weeksBack = Math.round((Date.parse(`${weekStartOf(data.thisWeek)}T00:00:00Z`) - Date.parse(`${weekStartOf(data.week)}T00:00:00Z`)) / (7 * 86400000));
  const canPrev = weeksBack < WEEKLY_REPORT_CONFIG.maxWeeksBack;
  const inProgress = data.week === data.thisWeek;
  const nextWeek = weekKey(addDays(weekStartOf(data.week), 7));
  const canNext = data.week < data.thisWeek;
  const p = data.personal;
  const maxXp = p ? Math.max(1, ...p.days.map((d) => d.xp)) : 1;
  const b = data.band;

  return (
    <div className="space-y-4" data-testid="weekly-report">
      <header className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <BarChart3 size={20} className="text-accent" aria-hidden="true" /> {c.title}
          </h1>
          <p className="text-sm text-muted mt-0.5" data-testid="report-range">
            {rangeLabel(data, locale)}
            {data.week === data.thisWeek ? ` · ${c.thisWeek}` : ''}
          </p>
        </div>
        {canPrev ? (
          <Link href={`/app/report?week=${prevWeek}`} className="p-2 rounded-xl border border-border bg-surface hover:border-accent/40" aria-label={c.prev}>
            <ChevronLeft size={18} aria-hidden="true" />
          </Link>
        ) : (
          <span className="p-2 rounded-xl border border-border bg-surface opacity-40" aria-hidden="true">
            <ChevronLeft size={18} />
          </span>
        )}
        {canNext ? (
          <Link href={`/app/report?week=${nextWeek}`} className="p-2 rounded-xl border border-border bg-surface hover:border-accent/40" aria-label={c.next}>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        ) : (
          <span className="p-2 rounded-xl border border-border bg-surface opacity-40" aria-hidden="true">
            <ChevronRight size={18} />
          </span>
        )}
      </header>

      {data.empty ? (
        <div className="rounded-2xl border border-border bg-surface shadow-card p-5 text-sm text-muted" data-testid="report-empty">
          <p>{inProgress ? c.emptyNow : c.empty}</p>
          <Link href="/app" className="inline-block mt-3 text-accent font-semibold hover:underline">{c.toPlan}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile icon={BookOpen} label={c.words} value={data.words.learned} sub={fill(c.wordsGoal, { n: data.words.goal })} testId="report-words" />
          <Tile icon={Zap} label={c.xp} value={data.xp} testId="report-xp" />
          <Tile icon={Star} label={c.activeDays} value={`${data.activeDays}/7`} />
          <Tile icon={Flame} label={c.streak} value={fill(c.streakDays, { n: data.streak.days })} sub={fill(c.longest, { n: data.streak.longest })} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <section className="rounded-2xl border border-border bg-surface shadow-card p-4" data-testid="report-band">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Target size={13} aria-hidden="true" /> {c.band}
          </h2>
          {b.end == null ? (
            <p className="text-sm text-muted mt-2">{c.noBand}</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-ink tabular-nums mt-1">
                {b.start != null && b.start !== b.end && <span className="text-muted font-semibold">{fmtBand(b.start)} → </span>}
                {fmtBand(b.end)}
              </p>
              <p className="text-xs mt-0.5 flex items-center gap-2">
                {b.change == null ? null : b.change === 0 ? <span className="text-muted">{c.bandSame}</span> : <Delta n={b.change} />}
                {b.target && <span className="text-muted">{fill(c.target, { b: fmtBand(b.target) })}</span>}
              </p>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-accent/30 bg-accent-soft p-4" data-testid="report-focus">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <Sparkles size={13} aria-hidden="true" /> {c.focus}
          </h2>
          <p className="text-2xl font-bold text-ink mt-1">{SKILL[data.focus.skill]}</p>
          <p className="text-xs text-ink-muted mt-0.5">
            {data.focus.reason === 'untested' ? c.focusUntested : fill(c.focusWeakest, { b: fmtBand(data.focus.band) })}
          </p>
          <Link href={SKILL_HREF[data.focus.skill]} className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-accent hover:underline">
            {c.practice} <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </section>
      </div>

      {data.locked ? (
        <section className="rounded-2xl border border-border bg-surface shadow-card p-5" data-testid="report-locked">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Lock size={16} className="text-accent" aria-hidden="true" /> {c.lockedTitle}
          </h2>
          <p className="text-sm text-muted mt-1.5">{c.lockedBody}</p>
          <Link href="/pricing" className="inline-block mt-4 rounded-xl bg-accent text-on-accent text-sm font-semibold px-4 py-2.5 hover:bg-accent-hover">
            {c.upgrade}
          </Link>
        </section>
      ) : (
        p && (
          <section className="space-y-3" data-testid="report-personal">
            <h2 className="text-sm font-bold text-ink">{c.personal}</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="md:col-span-2 rounded-2xl border border-border bg-surface shadow-card p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{c.byDay}</p>
                <ol className="mt-3 grid grid-cols-7 gap-2 items-end h-32" aria-label={c.byDay}>
                  {p.days.map((d, i) => (
                    <li key={d.date} className="flex flex-col items-center justify-end h-full gap-1" aria-label={`${c.days[i]}: ${d.xp} XP`}>
                      <span className="text-[10px] text-muted tabular-nums">{d.xp || ''}</span>
                      <span
                        className={`w-full max-w-8 rounded-t-md ${d.active ? 'bg-accent' : 'bg-border'}`}
                        style={{ height: `${d.xp ? Math.max(6, Math.round((d.xp / maxXp) * 80)) : 3}%` }}
                      />
                      <span className="text-[11px] text-muted">{c.days[i]}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-border bg-surface shadow-card p-4 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{c.accuracy}</p>
                  <p className="text-xl font-bold text-ink tabular-nums">{p.accuracy == null ? '—' : `${p.accuracy}%`}</p>
                  <p className="text-xs text-muted">{fill(c.reviews, { n: p.reviews })}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{c.tasks}</p>
                  <p className="text-xl font-bold text-ink tabular-nums">{p.tasks.pct == null ? '—' : `${p.tasks.pct}%`}</p>
                  <p className="text-xs text-muted">{fill(c.tasksOf, { done: p.tasks.done, total: p.tasks.total })}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-surface shadow-card p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{c.skills}</p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {Object.entries(p.skills).map(([k, s]) => (
                    <li key={k} className="flex items-center justify-between gap-2">
                      <span className={`font-semibold ${k === data.focus.skill ? 'text-accent' : 'text-ink'}`}>{SKILL[k]}</span>
                      <span className="text-xs text-muted tabular-nums">
                        {fill(c.sessions, { n: s.sessions })}{s.band != null ? ` · ${fmtBand(s.band)}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-surface shadow-card p-4" data-testid="report-compare">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{c.vsPrev}</p>
                {inProgress ? (
                  <p className="text-sm text-muted mt-2" data-testid="report-in-progress">{c.inProgress}</p>
                ) : p.compare.xp == null ? (
                  <p className="text-sm text-muted mt-2">{c.noPrev}</p>
                ) : (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    <li className="flex justify-between"><span className="text-ink">{c.xp}</span><Delta n={p.compare.xp} /></li>
                    <li className="flex justify-between"><span className="text-ink">{c.words}</span><Delta n={p.compare.words} /></li>
                    <li className="flex justify-between"><span className="text-ink">{c.activeDays}</span><Delta n={p.compare.activeDays} /></li>
                  </ul>
                )}
              </div>
              <div className="rounded-2xl border border-border bg-surface shadow-card p-4" data-testid="report-next">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{c.nextWeek}</p>
                {inProgress ? (
                  <p className="text-sm text-muted mt-2">{c.inProgress}</p>
                ) : (
                <>
                <ul className="mt-2 space-y-1.5 text-sm text-ink list-disc pl-4">
                  <li>{fill(c.goalDays, { n: p.next.days })}</li>
                  <li>{fill(c.goalWords, { n: p.next.words })}</li>
                  <li>{fill(c.goalFocus, { n: p.next.focusSessions, skill: SKILL[p.next.focusSkill] })}</li>
                </ul>
                <ul className="mt-3 space-y-1 text-xs text-muted">
                  {p.next.tips.map((tip) => <li key={tip}>{c.tips[tip]}</li>)}
                </ul>
                </>
                )}
              </div>
            </div>
          </section>
        )
      )}
    </div>
  );
}
