'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, CheckCircle2, Circle, ChevronRight, Star, RotateCcw, Check, Loader2, Flame, Snowflake } from 'lucide-react';
import { useT } from '@/context/LocaleContext';

const SKILL_LABEL = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };

// "Bugungi reja" (TZ 2.0 §6.2). The plan is built and stored on the server once per local
// day (GET /api/plan/today); completion is detected from activity, and skill/mock tasks can
// be ticked by hand. Task titles arrive in Uzbek and are translated with ts().
function Ring({ pct, size = 52, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-bg" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
        className="text-accent transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
}

export default function StudyPlanCard() {
  const { t, ts } = useT();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async (signal) => {
    try {
      const r = await fetch('/api/plan/today', { signal, cache: 'no-store' });
      if (!r.ok) throw new Error();
      const j = await r.json();
      if (signal?.aborted) return;
      setPlan(j);
      setError(false);
      if (j.streak?.extended) setToast(t('plan.streakUp', { n: j.streak.streak }));
      else if (j.xpPaid > 0) setToast(t('plan.xpGained', { xp: j.xpPaid }));
    } catch {
      if (!signal?.aborted) setError(true);
    }
  }, [t]);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    // Coming back to the tab after a review session → refresh progress.
    const onVis = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      ctrl.abort();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const markDone = async (key) => {
    setBusy(key);
    // Optimistic: TZ asks for the tick to show within a second.
    setPlan((p) => p && { ...p, tasks: p.tasks.map((x) => (x.key === key ? { ...x, status: 'done' } : x)) });
    try {
      const r = await fetch(`/api/plan/tasks/${encodeURIComponent(key)}/complete`, { method: 'POST' });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error();
      if (j.streak?.extended) setToast(t('plan.streakUp', { n: j.streak.streak }));
      else if (j.xpPaid > 0) setToast(t('plan.xpGained', { xp: j.xpPaid }));
      await load();
    } catch {
      await load();
    } finally {
      setBusy('');
    }
  };

  if (error && !plan) {
    return (
      <section aria-labelledby="plan-h" className="rounded-2xl border border-border bg-surface shadow-card p-5 text-sm text-muted flex items-center justify-between gap-3">
        <h2 id="plan-h" className="sr-only">{t('hub.plan')}</h2>
        {t('plan.loadError')}
        <button type="button" onClick={() => load()} className="p-2 rounded-lg hover:bg-bg" aria-label={t('hub.retry')}>
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </section>
    );
  }
  if (!plan) {
    return (
      <section aria-labelledby="plan-h" aria-busy="true" className="rounded-2xl border border-border bg-surface shadow-card p-5 h-64 grid place-items-center">
        <h2 id="plan-h" className="sr-only">{t('hub.plan')}</h2>
        <Loader2 className="w-5 h-5 animate-spin text-muted" aria-hidden="true" />
      </section>
    );
  }

  const done = plan.tasks.filter((x) => x.status === 'done').length;
  const total = plan.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const xpTotal = plan.tasks.reduce((s, x) => s + (x.xp || 0), 0);
  const xpEarned = plan.tasks.filter((x) => x.status === 'done').reduce((s, x) => s + (x.xp || 0), 0);
  const minutes = plan.tasks.reduce((s, x) => s + x.minutes, 0);
  const dl = plan.daysLeft;
  const headline =
    dl == null ? t('plan.noExam')
      : dl < 0 ? t('plan.examPassed')
        : dl === 0 ? t('plan.examToday')
          : `${t('plan.daysToExam', { n: dl })}${plan.targetBand ? ` · ${t('plan.target', { b: Number(plan.targetBand).toFixed(1) })}` : ''}`;

  return (
    <section aria-labelledby="plan-h" className="relative rounded-2xl border border-border bg-surface shadow-card p-5">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative shrink-0">
          <Ring pct={pct} />
          <span className="absolute inset-0 grid place-items-center text-xs font-bold text-ink tabular-nums">{done}/{total}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="plan-h" className="text-[11px] font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <CalendarCheck size={13} aria-hidden="true" /> {t('hub.plan')}
          </h2>
          <p className="text-sm font-semibold text-ink mt-0.5">{headline}</p>
          <p className="text-xs text-muted tabular-nums mt-0.5">
            ~{t('hub.minShort', { n: minutes })} · {t('plan.xpToday', { earned: xpEarned, total: xpTotal })}
          </p>
          {plan.streakNow && (
            <p className="text-xs tabular-nums mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className={`inline-flex items-center gap-1 font-semibold ${plan.streakNow.todayDone ? 'text-accent' : 'text-muted'}`}>
                <Flame size={13} aria-hidden="true" /> {t('plan.streak', { n: plan.streakNow.days })}
              </span>
              {plan.streakNow.freezes > 0 && (
                <span className="inline-flex items-center gap-1 text-muted" title={t('plan.freezeHint')}>
                  <Snowflake size={13} aria-hidden="true" /> {t('plan.freezes', { n: plan.streakNow.freezes })}
                </span>
              )}
              {!plan.streakNow.todayDone && <span className="text-muted">{t('plan.streakHint')}</span>}
            </p>
          )}
        </div>
      </div>

      {done === total && total > 0 && (
        <p className="mb-3 rounded-xl bg-success-soft text-ink text-sm font-semibold px-3.5 py-2.5">{t('plan.allDone', { xp: xpEarned })}</p>
      )}

      <ul className="space-y-2">
        {plan.tasks.map((task) => {
          const isDone = task.status === 'done';
          const showProgress = !isDone && task.target > 1 && task.progress > 0;
          return (
            <li key={task.key} className="flex items-stretch gap-2">
              <Link
                href={task.href}
                className={`flex-1 min-w-0 flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-colors ${
                  isDone ? 'border-success/30 bg-success-soft' : 'border-border bg-bg hover:border-accent/40'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={18} className="text-success flex-shrink-0" aria-hidden="true" />
                ) : (
                  <Circle size={18} className="text-muted flex-shrink-0" aria-hidden="true" />
                )}
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold ${isDone ? 'text-muted line-through' : 'text-ink'}`}>{ts(task.title)}</span>
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    {task.focus && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-accent font-semibold">
                        <Star size={11} aria-hidden="true" /> {t('dash.weakestSkill', { skill: SKILL_LABEL[task.skill] })}
                      </span>
                    )}
                    {task.carried && <span className="text-[11px] text-muted font-semibold">{t('plan.carried')}</span>}
                    {showProgress && <span className="text-[11px] text-muted tabular-nums">{task.progress}/{task.target}</span>}
                  </span>
                </span>
                <span className="text-right flex-shrink-0">
                  <span className="block text-xs text-muted tabular-nums">{t('hub.minShort', { n: task.minutes })}</span>
                  <span className="block text-[11px] font-semibold text-accent tabular-nums">+{task.xp} XP</span>
                </span>
                <ChevronRight size={15} className="text-muted flex-shrink-0" aria-hidden="true" />
              </Link>
              {task.manualAllowed && !isDone && (
                <button
                  type="button"
                  onClick={() => markDone(task.key)}
                  disabled={busy === task.key}
                  className="shrink-0 px-3 rounded-xl border border-border bg-bg text-muted hover:text-success hover:border-success/40 disabled:opacity-50"
                  aria-label={`${t('plan.markDone')}: ${ts(task.title)}`}
                  title={t('plan.markDone')}
                >
                  <Check size={16} aria-hidden="true" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {toast && (
        <div role="status" className="absolute top-3 right-3 rounded-full bg-accent text-on-accent text-xs font-bold px-3 py-1 shadow-card">
          {toast}
        </div>
      )}
    </section>
  );
}
