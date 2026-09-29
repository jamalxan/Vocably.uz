'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpenText, Ear, Mic, PenLine, Loader2, ChevronRight, RotateCcw, Shuffle, Timer, Sparkles, Highlighter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { createAttempt, createPracticeAttempt, fetchSectionStatuses } from '../state/attemptsApi';
import ExamBackLink from './ExamBackLink';

// One page per skill (2026-09-29, user request: "no separate practice section —
// entering Reading IS practising"). The old /app/<skill>/mashq pages are
// gone; the choice between an untimed practice run and a timed test under
// exam conditions is a switch on this page, and Practice is the default.
//
//   Practice — no timer, the real exam interface (split panes, highlighting),
//              every answer explained right after finishing.
//   Timed    — exam conditions: countdown, auto-submit, band score.
//
// Reading/Listening list tests to choose from; Writing/Speaking draw a random
// task (choosing the topic in advance would defeat the exercise).

const SKILLS = {
  reading: {
    title: 'Reading',
    base: '/app/oqish',
    icon: BookOpenText,
    picker: true,
    practice: true,
    blurb: '3 ta passage, 40 ta savol. Matnni belgilab (highlight) ishlang — xuddi haqiqiy kompyuter imtihonidagidek.',
  },
  listening: {
    title: 'Listening',
    base: '/app/tinglash',
    icon: Ear,
    picker: true,
    practice: true,
    blurb: '4 ta part, 40 ta savol. Mashqda audioni qayta tinglash va tezligini o‘zgartirish mumkin.',
  },
  writing: {
    title: 'Writing',
    base: '/app/yozish',
    icon: PenLine,
    picker: false,
    practice: true,
    blurb: 'Task 1 va Task 2 tasodifiy tushadi. AI 4 mezon (TA/CC/LR/GRA) bo‘yicha baholaydi.',
  },
  speaking: {
    title: 'Speaking',
    base: '/app/gapirish',
    icon: Mic,
    picker: false,
    practice: false,
    blurb: 'Part 1, cue card va Part 3 savollari tasodifiy tushadi — mavzuni oldindan ko‘rmaysiz.',
  },
};

const MODES = [
  { key: 'practice', label: 'Practice', icon: Sparkles, hint: 'Vaqt cheklanmagan · har javob izohi bilan' },
  { key: 'timed', label: 'Timed test', icon: Timer, hint: 'Imtihon sharoiti · taymer · band ball' },
];

const STATUS_BADGE = {
  in_progress: { label: 'Davom etmoqda', className: 'text-warning bg-warning-soft' },
  expired: { label: "Muddati o'tgan", className: 'text-muted bg-bg' },
  submitted: { label: 'Baholanmoqda', className: 'text-muted bg-bg' },
  graded: { label: 'Tugallangan', className: 'text-success bg-success-soft' },
};

function minutes(sec) {
  return Math.round(sec / 60);
}

function testMeta(test, skill) {
  const s = test.sections?.[skill];
  if (!s) return '';
  return `${minutes(s.durationSec)} daq · ${s.questionCount} savol`;
}

function useStoredMode(skill, allowPractice) {
  const [mode, setMode] = useState(allowPractice ? 'practice' : 'timed');
  useEffect(() => {
    if (!allowPractice) return;
    try {
      const saved = localStorage.getItem(`vocably_skill_mode_${skill}`);
      if (saved === 'practice' || saved === 'timed') setMode(saved);
    } catch {}
  }, [skill, allowPractice]);
  const update = (m) => {
    setMode(m);
    try {
      localStorage.setItem(`vocably_skill_mode_${skill}`, m);
    } catch {}
  };
  return [mode, update];
}

function ModeSwitch({ mode, onChange }) {
  return (
    <div role="radiogroup" aria-label="Rejim" className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-bg border border-border">
      {MODES.map((m) => {
        const active = mode === m.key;
        return (
          <button
            key={m.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m.key)}
            className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              active ? 'bg-surface shadow-card ring-1 ring-accent/30' : 'hover:bg-surface/60'
            }`}
          >
            <m.icon size={17} className={`mt-0.5 flex-shrink-0 ${active ? 'text-accent' : 'text-muted'}`} aria-hidden="true" />
            <span className="min-w-0">
              <span className={`block text-sm font-semibold ${active ? 'text-ink' : 'text-muted'}`}>{m.label}</span>
              <span className="block text-[11px] text-muted leading-snug mt-0.5">{m.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TestGrid({ skill, mode, busyId, onPick }) {
  const [tests, setTests] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/exam/tests')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => !cancelled && setTests((data.tests || []).filter((t) => t.sections?.[skill])))
      .catch(() => !cancelled && setError("Testlar ro'yxatini yuklab bo'lmadi."));
    return () => {
      cancelled = true;
    };
  }, [skill]);

  useEffect(() => {
    let cancelled = false;
    setStatuses({});
    fetchSectionStatuses(skill, mode === 'practice' ? 'practice' : 'section')
      .then((s) => !cancelled && setStatuses(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [skill, mode]);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (tests === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-surface border border-border animate-pulse" />
        ))}
      </div>
    );
  }
  if (tests.length === 0) return <p className="text-sm text-muted">Hozircha testlar yo'q.</p>;

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {tests.map((test, i) => {
        const st = statuses[test.id];
        const badge = st ? STATUS_BADGE[st.status] : null;
        const busy = busyId === test.id;
        return (
          <li
            key={test.id}
            className="group relative flex flex-col rounded-2xl border border-border bg-surface shadow-card hover:border-accent/50 hover:shadow-premium motion-safe:hover:-translate-y-0.5 transition-all duration-200"
          >
            <button
              type="button"
              onClick={() => onPick(test.id, false)}
              disabled={!!busyId}
              className="flex-1 flex items-start gap-3 px-4 py-4 text-left min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
            >
              <span className="w-9 h-9 rounded-xl bg-accent-soft text-accent font-display font-bold text-sm grid place-items-center flex-shrink-0 tabular-nums">
                {busy ? <Loader2 size={15} className="animate-spin" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink line-clamp-2">{test.title}</span>
                <span className="block text-xs text-muted mt-1">{testMeta(test, skill)}</span>
                {badge && (
                  <span className={`inline-block mt-2 px-1.5 py-0.5 rounded text-[11px] leading-4 font-semibold ${badge.className}`}>
                    {badge.label}
                    {st.status === 'graded' && st.band != null ? ` · ${Number(st.band).toFixed(1)}` : ''}
                  </span>
                )}
              </span>
              <ChevronRight size={16} className="text-muted group-hover:text-accent flex-shrink-0 mt-2 transition-colors" aria-hidden="true" />
            </button>
            {st && (
              <button
                type="button"
                onClick={() => onPick(test.id, true)}
                disabled={!!busyId}
                className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-10 border-t border-border text-xs font-semibold text-muted hover:text-ink hover:bg-bg transition-colors rounded-b-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
              >
                <RotateCcw size={13} aria-hidden="true" /> Qaytadan boshlash
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function SkillHome({ skill }) {
  const cfg = SKILLS[skill];
  const router = useRouter();
  const { isAuthed } = useApp();
  const [mode, setMode] = useStoredMode(skill, cfg.practice);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  if (!isAuthed) return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;

  const practice = cfg.practice && mode === 'practice';

  const start = async (testId, fresh) => {
    setBusyId(testId || 'random');
    setError('');
    try {
      if (practice) {
        const { attemptId } = await createPracticeAttempt(testId, skill, fresh);
        router.push(`${cfg.base}/mashq/${attemptId}`);
      } else {
        const { attemptId } = await createAttempt(testId, skill, fresh);
        router.push(`${cfg.base}/${attemptId}`);
      }
    } catch {
      setError("Boshlab bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.");
      setBusyId(null);
    }
  };

  const Icon = cfg.icon;
  return (
    <div className="pb-12">
      <ExamBackLink width="max-w-6xl" label="All skills" />
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-10 space-y-6">
        <header className="relative overflow-hidden rounded-3xl bg-primary text-on-primary p-6 sm:p-8">
          <div aria-hidden="true" className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-accent/25 blur-3xl" />
          <div aria-hidden="true" className="absolute right-6 bottom-4 opacity-10">
            <Icon size={120} strokeWidth={1.25} />
          </div>
          <div className="relative flex items-start gap-4">
            <span className="w-12 h-12 rounded-2xl bg-accent grid place-items-center flex-shrink-0 shadow-glow">
              <Icon size={22} className="text-on-accent" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">IELTS Academic</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mt-1">{cfg.title}</h1>
              <p className="text-sm text-on-primary/75 mt-2 max-w-xl">{cfg.blurb}</p>
            </div>
          </div>
          {skill === 'reading' && (
            <p className="relative mt-5 inline-flex items-center gap-2 text-xs text-on-primary/80 bg-on-primary/10 rounded-full px-3 py-1.5">
              <Highlighter size={13} aria-hidden="true" /> Matnni sichqoncha bilan tanlang → Highlight
            </p>
          )}
          {skill === 'listening' && (
            <p className="relative mt-5 inline-flex items-center gap-2 text-xs text-on-primary/80 bg-on-primary/10 rounded-full px-3 py-1.5">
              <Highlighter size={13} aria-hidden="true" /> Savol matnidagi kalit so'zlarni belgilab oling
            </p>
          )}
        </header>

        {cfg.practice && <ModeSwitch mode={mode} onChange={setMode} />}

        {error && <p className="text-sm text-danger">{error}</p>}

        {cfg.picker ? (
          <section aria-label="Testlar">
            <h2 className="text-sm font-semibold text-ink mb-3">Testni tanlang</h2>
            <TestGrid skill={skill} mode={mode} busyId={busyId} onPick={start} />
          </section>
        ) : (
          <section className="rounded-2xl border border-border bg-surface shadow-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{practice ? 'Mashq topshirig‘i' : skill === 'speaking' ? 'Speaking suhbati' : 'Timed Writing'}</p>
              <p className="text-xs text-muted mt-1">
                {practice
                  ? 'Vaqt cheklanmagan — qoralama saqlanadi, yakunlagach batafsil izoh olasiz.'
                  : skill === 'speaking'
                    ? 'Mikrofon kerak. Javoblaringiz yozib olinadi va AI baholaydi.'
                    : '60 daqiqa, taymer bilan — haqiqiy imtihon sharoiti.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => start(undefined, false)}
              disabled={!!busyId}
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-xl bg-accent hover:bg-accent-hover text-on-accent text-sm font-semibold shadow-glow disabled:opacity-60 transition-colors"
            >
              {busyId ? <Loader2 size={16} className="animate-spin" /> : <Shuffle size={16} />}
              {busyId ? 'Tayyorlanmoqda...' : 'Boshlash'}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
