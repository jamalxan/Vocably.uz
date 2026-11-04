'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, CalendarDays, Clock, BookOpen, Target, Loader2 } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import {
  ONBOARDING_STORAGE_KEY, DAILY_MINUTES,
  normalizeAnswers, stepsFor, stepDone, isComplete, resumeStep, planSummary,
} from '@/lib/onboarding';
import { buildDiagnostic, scoreDiagnostic } from '@/lib/vocab/diagnostic';
import { TIER_CONFIG } from '@/lib/entitlements';

// Vocably 2.0 onboarding (TZ 2.0 §6.1): up to 7 one-question screens → optional 16-word
// vocabulary check → result with the plan AND the prices visible (TZ §1: we never hide price).
// Answers live in localStorage so a reload resumes where the user stopped; after signup
// OnboardingSync posts them to /api/onboarding.

const COPY = {
  uz: {
    step: 'Qadam', of: 'dan', back: 'Orqaga', next: 'Davom etish', skip: "O'tkazib yuborish",
    q: {
      goal: { title: 'Maqsadingiz nima?', options: { ielts: 'IELTS topshirish', general: 'Umumiy ingliz tili' } },
      examType: { title: 'Qaysi modul?', options: { academic: 'Academic', general: 'General Training' } },
      targetBand: { title: 'Maqsad band?', hint: 'Keyin profil sahifasida o‘zgartirsa bo‘ladi' },
      examDate: { title: 'Imtihon qachon?', unknown: 'Hali bilmayman (90 kunlik reja)' },
      selfLevel: { title: 'Hozirgi darajangiz?', options: { beginner: "Boshlang'ich (A1–A2)", intermediate: "O'rta (B1)", advanced: 'Yuqori (B2+)' } },
      dailyMinutes: { title: 'Kuniga necha daqiqa ajrata olasiz?', unit: 'daqiqa' },
      weakestSkill: { title: 'Eng qiyin ko‘nikma qaysi?', options: { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' } },
    },
    diag: {
      title: "5 daqiqalik so'z testi",
      lead: "16 ta so'z — darajangizni aniqroq bilib, rejani shunga moslaymiz.",
      start: 'Testni boshlash', skip: "Testsiz davom etish", dontKnow: 'Bilmayman',
      progress: (i, n) => `${i} / ${n}`, question: (w) => `"${w}" so'zining ma'nosi?`,
    },
    result: {
      title: 'Shaxsiy rejangiz tayyor',
      days: 'kun', perDay: 'daqiqa / kun', words: "ta so'z kerak", wordsPerDay: (n) => `kuniga ~${n} ta yangi so'z`,
      level: (c, b) => `Taxminiy daraja: ${c} (band ≈ ${b})`,
      offTrack: "Bu sur'atda so'z maqsadiga imtihongacha yetib bo'lmaydi — kunlik vaqtni oshirishni tavsiya qilamiz.",
      planTitle: 'Har kungi reja',
      plan: (w) => [
        "SRS takrorlash — eskirayotgan so'zlar",
        "Yangi so'zlar + 1 o'yin",
        `${w} mashqi (eng zaif ko‘nikmaga ko‘proq vaqt)`,
        'Haftada 1 marta mock bo‘lim — reja qayta hisoblanadi',
      ],
      pricesTitle: 'Narxlar — yashirin narsa yo‘q',
      perMonth: "so'm / oy", free: 'Bepul', trial: "Ro'yxatdan o'tganda Premium sinov — kartasiz",
      cta: 'Rejani saqlash — bepul ro‘yxatdan o‘tish', ctaLoggedIn: 'Rejani saqlash', saving: 'Saqlanmoqda…',
      haveAccount: 'Hisobim bor — kirish', restart: 'Qaytadan boshlash', saveError: 'Saqlab bo‘lmadi, qayta urinib ko‘ring',
    },
  },
  en: {
    step: 'Step', of: 'of', back: 'Back', next: 'Continue', skip: 'Skip',
    q: {
      goal: { title: "What's your goal?", options: { ielts: 'Take the IELTS', general: 'General English' } },
      examType: { title: 'Which module?', options: { academic: 'Academic', general: 'General Training' } },
      targetBand: { title: 'Target band?', hint: 'You can change it later in your profile' },
      examDate: { title: 'When is your exam?', unknown: "I don't know yet (90-day plan)" },
      selfLevel: { title: 'Your current level?', options: { beginner: 'Beginner (A1–A2)', intermediate: 'Intermediate (B1)', advanced: 'Upper (B2+)' } },
      dailyMinutes: { title: 'How many minutes a day can you study?', unit: 'minutes' },
      weakestSkill: { title: 'Which skill is hardest for you?', options: { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' } },
    },
    diag: {
      title: '5-minute vocabulary check',
      lead: "16 words — so we can size your plan to your real level.",
      start: 'Start the check', skip: 'Continue without it', dontKnow: "I don't know",
      progress: (i, n) => `${i} / ${n}`, question: (w) => `What does "${w}" mean?`,
    },
    result: {
      title: 'Your personal plan is ready',
      days: 'days', perDay: 'min / day', words: 'words to learn', wordsPerDay: (n) => `~${n} new words a day`,
      level: (c, b) => `Estimated level: ${c} (band ≈ ${b})`,
      offTrack: "At this pace you won't close the vocabulary gap before the exam — consider more minutes a day.",
      planTitle: 'Every day',
      plan: (w) => [
        'SRS review — words about to fade',
        'New words + 1 game',
        `${w} practice (most time on your weakest skill)`,
        'One mock section a week — the plan recalculates',
      ],
      pricesTitle: 'Prices — nothing hidden',
      perMonth: 'UZS / month', free: 'Free', trial: 'Premium trial on signup — no card needed',
      cta: 'Save my plan — sign up free', ctaLoggedIn: 'Save my plan', saving: 'Saving…',
      haveAccount: 'I have an account — log in', restart: 'Start over', saveError: "Couldn't save, please try again",
    },
  },
};

const BANDS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];
const SKILL_UZ = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };

function readStored() {
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeStored(v) {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* private mode — the quiz still works, it just won't resume */
  }
}

function Choice({ selected, onClick, children }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold transition-colors flex items-center justify-between gap-3 ${
        selected ? 'border-accent bg-accent-soft text-ink' : 'border-border bg-surface text-ink hover:border-accent/50'
      }`}
    >
      <span>{children}</span>
      {selected && <Check className="w-5 h-5 text-accent shrink-0" aria-hidden />}
    </button>
  );
}

function formatUzs(n) {
  return n.toLocaleString('ru-RU').replace(/,/g, ' ');
}

export default function OnboardingWizard() {
  const c = useCopy(COPY);
  const router = useRouter();
  // phase: 'quiz' | 'diagIntro' | 'diag' | 'result'
  const [state, setState] = useState({ answers: normalizeAnswers({}), phase: 'quiz', step: 0, seed: '' });
  const [hydrated, setHydrated] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [diagIndex, setDiagIndex] = useState(0);
  const [diagAnswers, setDiagAnswers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Resume from storage (TZ §6.1.5: "qoldirilgan joydan davom").
  useEffect(() => {
    const s = readStored();
    if (s) {
      const answers = normalizeAnswers(s.answers);
      const phase = ['quiz', 'diagIntro', 'result'].includes(s.phase) ? s.phase : 'quiz';
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
      setState({
        answers,
        phase: phase !== 'quiz' && !isComplete(answers) ? 'quiz' : phase,
        step: phase === 'quiz' ? Math.min(resumeStep(answers), stepsFor(answers).length - 1) : 0,
        seed: s.seed || '',
      });
    }
    setHydrated(true);
    fetch('/api/onboarding', { credentials: 'same-origin' })
      .then((r) => setLoggedIn(r.ok))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (hydrated) writeStored({ ...state, synced: false });
  }, [state, hydrated]);

  const steps = stepsFor(state.answers);
  const stepKey = steps[state.step];
  const questions = useMemo(() => (state.seed ? buildDiagnostic(state.seed) : []), [state.seed]);
  const summary = useMemo(() => planSummary(state.answers), [state.answers]);

  const setAnswer = (patch) => setState((s) => ({ ...s, answers: normalizeAnswers({ ...s.answers, ...patch }) }));

  // Functional update: the step list depends on the answer just given (goal → 4 or 7 steps),
  // and pick() calls this from a timeout, so never read `state` from the closure here.
  const goNext = () =>
    setState((s) => {
      if (s.phase !== 'quiz') return s;
      const list = stepsFor(s.answers);
      return s.step < list.length - 1 ? { ...s, step: s.step + 1 } : { ...s, phase: 'diagIntro' };
    });
  const goBack = () => {
    if (state.phase === 'diagIntro') setState((s) => ({ ...s, phase: 'quiz', step: steps.length - 1 }));
    else if (state.phase === 'result') setState((s) => ({ ...s, phase: 'diagIntro' }));
    else if (state.step > 0) setState((s) => ({ ...s, step: s.step - 1 }));
  };
  // Single-tap questions advance on their own; the date step needs an explicit "Continue".
  const pick = (patch) => {
    setAnswer(patch);
    setTimeout(goNext, 180);
  };

  const startDiag = () => {
    setDiagIndex(0);
    setDiagAnswers([]);
    setState((s) => ({ ...s, seed: s.seed || Math.random().toString(36).slice(2), phase: 'diag' }));
  };
  const answerDiag = (choice) => {
    const q = questions[diagIndex];
    const next = [...diagAnswers, { id: q.id, choice }];
    setDiagAnswers(next);
    if (diagIndex + 1 < questions.length) {
      setDiagIndex(diagIndex + 1);
    } else {
      const r = scoreDiagnostic(state.seed, next);
      setState((s) => ({
        ...s,
        phase: 'result',
        answers: normalizeAnswers({ ...s.answers, diagnosticLevel: r.level, diagnosticScore: r.score }),
      }));
    }
  };

  const restart = () => {
    setState({ answers: normalizeAnswers({}), phase: 'quiz', step: 0, seed: '' });
    setDiagAnswers([]);
    setDiagIndex(0);
  };

  const saveLoggedIn = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const r = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ answers: state.answers }),
      });
      if (!r.ok) throw new Error();
      writeStored({ ...state, synced: true });
      router.push('/app');
    } catch {
      setSaveError(c.result.saveError);
      setSaving(false);
    }
  };

  if (!hydrated) {
    return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-muted" aria-hidden /></div>;
  }

  const total = steps.length;
  const progressPct = state.phase === 'quiz' ? ((state.step) / (total + 1)) * 100 : state.phase === 'result' ? 100 : (total / (total + 1)) * 100;
  const canGoBack = state.phase !== 'quiz' || state.step > 0;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={goBack}
          disabled={!canGoBack || state.phase === 'diag'}
          className="p-2 -ml-2 rounded-full text-muted hover:text-ink disabled:opacity-0"
          aria-label={c.back}
        >
          <ArrowLeft className="w-5 h-5" aria-hidden />
        </button>
        <div className="flex-1 h-2 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct)}>
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
        {state.phase === 'quiz' && (
          <span className="text-xs text-muted tabular-nums">{state.step + 1}/{total}</span>
        )}
      </div>

      {state.phase === 'quiz' && stepKey && (
        <section aria-live="polite">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-6">{c.q[stepKey].title}</h1>

          {['goal', 'examType', 'selfLevel', 'weakestSkill'].includes(stepKey) && (
            <div role="radiogroup" className="space-y-3">
              {Object.entries(c.q[stepKey].options).map(([val, label]) => (
                <Choice key={val} selected={state.answers[stepKey === 'selfLevel' ? 'selfLevel' : stepKey] === val} onClick={() => pick({ [stepKey]: val })}>
                  {label}
                </Choice>
              ))}
            </div>
          )}

          {stepKey === 'targetBand' && (
            <>
              <div role="radiogroup" className="grid grid-cols-3 gap-3">
                {BANDS.map((b) => (
                  <Choice key={b} selected={state.answers.targetBand === b} onClick={() => pick({ targetBand: b })}>
                    {b.toFixed(1)}
                  </Choice>
                ))}
              </div>
              <p className="text-sm text-muted mt-4">{c.q.targetBand.hint}</p>
            </>
          )}

          {stepKey === 'dailyMinutes' && (
            <div role="radiogroup" className="grid grid-cols-2 gap-3">
              {DAILY_MINUTES.map((m) => (
                <Choice key={m} selected={state.answers.dailyMinutes === m} onClick={() => pick({ dailyMinutes: m })}>
                  {m} {c.q.dailyMinutes.unit}
                </Choice>
              ))}
            </div>
          )}

          {stepKey === 'examDate' && (
            <div className="space-y-3">
              <label className="block">
                <span className="sr-only">{c.q.examDate.title}</span>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={state.answers.examDate || ''}
                  onChange={(e) => setAnswer({ examDate: e.target.value || null, examDateUnknown: false })}
                  className="w-full px-4 py-4 rounded-2xl bg-surface border-2 border-border text-ink text-lg focus:border-accent outline-none"
                />
              </label>
              <Choice
                selected={state.answers.examDateUnknown}
                onClick={() => pick({ examDate: null, examDateUnknown: true })}
              >
                {c.q.examDate.unknown}
              </Choice>
              <button
                type="button"
                onClick={goNext}
                disabled={!stepDone('examDate', state.answers)}
                className="w-full mt-2 px-5 py-4 rounded-2xl bg-accent text-on-accent hover:bg-accent-hover font-bold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {c.next} <ArrowRight className="w-5 h-5" aria-hidden />
              </button>
            </div>
          )}
        </section>
      )}

      {state.phase === 'diagIntro' && (
        <section className="text-center">
          <BookOpen className="w-12 h-12 text-accent mx-auto mb-4" aria-hidden />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-3">{c.diag.title}</h1>
          <p className="text-muted mb-8">{c.diag.lead}</p>
          <button type="button" onClick={startDiag} className="w-full px-5 py-4 rounded-2xl bg-accent text-on-accent hover:bg-accent-hover font-bold">
            {c.diag.start}
          </button>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, phase: 'result' }))}
            className="w-full mt-3 px-5 py-3 rounded-2xl text-muted font-semibold hover:text-ink"
          >
            {c.diag.skip}
          </button>
        </section>
      )}

      {state.phase === 'diag' && questions[diagIndex] && (
        <section aria-live="polite">
          <p className="text-sm text-muted mb-2 tabular-nums">{c.diag.progress(diagIndex + 1, questions.length)}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-6">{c.diag.question(questions[diagIndex].word)}</h1>
          <div className="space-y-3">
            {questions[diagIndex].options.map((o) => (
              <Choice key={o} selected={false} onClick={() => answerDiag(o)}>{o}</Choice>
            ))}
            <button type="button" onClick={() => answerDiag(null)} className="w-full px-5 py-3 rounded-2xl text-muted font-semibold hover:text-ink">
              {c.diag.dontKnow}
            </button>
          </div>
        </section>
      )}

      {state.phase === 'result' && (
        <section>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">{c.result.title}</h1>
          <p className="text-muted mb-6">{c.result.level(summary.cefr, summary.estBand.toFixed(1))}</p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              [CalendarDays, summary.days, c.result.days],
              [Clock, summary.minutesPerDay, c.result.perDay],
              [Target, summary.wordsNeeded, c.result.words],
            ].map(([Icon, n, label]) => (
              <div key={label} className="rounded-2xl bg-surface border border-border p-4 text-center">
                <Icon className="w-5 h-5 text-accent mx-auto mb-1" aria-hidden />
                <div className="text-2xl font-bold text-ink tabular-nums">{n.toLocaleString('ru-RU')}</div>
                <div className="text-xs text-muted leading-tight mt-1">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted mb-2">{c.result.wordsPerDay(summary.wordsPerDay)}</p>
          {!summary.onTrack && (
            <p className="text-sm rounded-xl bg-accent-soft text-ink px-4 py-3 mb-4">{c.result.offTrack}</p>
          )}

          <div className="rounded-2xl bg-surface border border-border p-5 mb-6">
            <h2 className="font-bold text-ink mb-3">{c.result.planTitle}</h2>
            <ol className="space-y-2">
              {c.result.plan(SKILL_UZ[summary.weakestSkill]).map((t, i) => (
                <li key={t} className="flex gap-3 text-sm text-ink">
                  <span className="w-6 h-6 rounded-full bg-accent-soft text-accent text-xs font-bold grid place-items-center shrink-0">{i + 1}</span>
                  <span className="pt-0.5">{t}</span>
                </li>
              ))}
            </ol>
          </div>

          <h2 className="font-bold text-ink mb-3">{c.result.pricesTitle}</h2>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['free', 'standard', 'premium'].map((tier) => (
              <div key={tier} className={`rounded-2xl border p-3 text-center ${tier === 'premium' ? 'border-accent bg-accent-soft' : 'border-border bg-surface'}`}>
                <div className="text-xs font-semibold text-muted">{tier === 'free' ? c.result.free : TIER_CONFIG[tier].label}</div>
                <div className="text-base sm:text-lg font-bold text-ink tabular-nums mt-1">
                  {formatUzs(TIER_CONFIG[tier].priceMonthly)}
                </div>
                <div className="text-[11px] text-muted">{c.result.perMonth}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mb-6">
            {c.result.trial} · <Link href="/pricing" className="underline">/pricing</Link>
          </p>

          {loggedIn ? (
            <button
              type="button"
              onClick={saveLoggedIn}
              disabled={saving}
              className="w-full px-5 py-4 rounded-2xl bg-accent text-on-accent hover:bg-accent-hover font-bold disabled:opacity-60"
            >
              {saving ? c.result.saving : c.result.ctaLoggedIn}
            </button>
          ) : (
            <>
              <Link href="/register" className="block w-full text-center px-5 py-4 rounded-2xl bg-accent text-on-accent hover:bg-accent-hover font-bold">
                {c.result.cta}
              </Link>
              <Link href="/login" className="block w-full text-center mt-3 px-5 py-3 rounded-2xl text-muted font-semibold hover:text-ink">
                {c.result.haveAccount}
              </Link>
            </>
          )}
          {saveError && <p role="alert" className="text-sm text-red-600 mt-3 text-center">{saveError}</p>}
          <button type="button" onClick={restart} className="w-full mt-2 text-sm text-muted hover:text-ink py-2">
            {c.result.restart}
          </button>
        </section>
      )}
    </div>
  );
}

