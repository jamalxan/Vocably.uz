'use client';
import Link from 'next/link';
import { CalendarCheck, CheckCircle2, Circle, ChevronRight, Star } from 'lucide-react';
import { buildDailyPlan } from '@/lib/studyPlan';

const SKILL_LABEL = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };

// "Bugungi reja" — today's concrete tasks (src/lib/studyPlan.js), built from
// the same dashboard response, so it costs no extra request.
export default function StudyPlanCard({ data }) {
  const plan = buildDailyPlan({
    due: data.today?.due,
    newAvailable: data.today?.newAvailable,
    reviewsToday: data.today?.reviews,
    goal: data.today?.goal,
    daysLeft: data.examPrep?.daysLeft ?? null,
    targetBand: data.examPrep?.targetBand ?? null,
    skillBands: data.examPrep?.skillBands || {},
    sectionsDoneToday: data.plan?.sectionsDoneToday || [],
    mistakeWordsDue: data.plan?.mistakeWordsDue || 0,
    dailyMinutes: data.examPrep?.dailyStudyMinutes ?? null,
    now: new Date(),
  });
  const doneCount = plan.tasks.length - plan.remaining;

  return (
    <section aria-labelledby="plan-h" className="rounded-2xl border border-border bg-surface shadow-card p-5">
      <div className="flex flex-wrap items-start gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent grid place-items-center flex-shrink-0">
          <CalendarCheck size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="plan-h" className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            Bugungi reja
          </h2>
          <p className="text-sm font-semibold text-ink mt-0.5">{plan.headline}</p>
        </div>
        <span className="text-xs text-muted tabular-nums self-center">
          {doneCount}/{plan.tasks.length} · ~{plan.totalMinutes} daq
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-bg overflow-hidden mb-4" aria-hidden="true">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(doneCount / Math.max(1, plan.tasks.length)) * 100}%` }} />
      </div>
      <ul className="space-y-2">
        {plan.tasks.map((t) => (
          <li key={t.key}>
            <Link
              href={t.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-colors ${
                t.done ? 'border-success/30 bg-success-soft' : 'border-border bg-bg hover:border-accent/40'
              }`}
            >
              {t.done ? (
                <CheckCircle2 size={18} className="text-success flex-shrink-0" aria-hidden="true" />
              ) : (
                <Circle size={18} className="text-muted flex-shrink-0" aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold ${t.done ? 'text-muted line-through' : 'text-ink'}`}>{t.title}</span>
                {t.focus && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-accent font-semibold mt-0.5">
                    <Star size={11} aria-hidden="true" /> Eng zaif ko‘nikma: {SKILL_LABEL[t.skill]}
                  </span>
                )}
              </span>
              <span className="text-xs text-muted tabular-nums flex-shrink-0">{t.minutes} daq</span>
              <ChevronRight size={15} className="text-muted flex-shrink-0" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
