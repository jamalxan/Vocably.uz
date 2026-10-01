'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Heart, Lock, Play, X, WifiOff } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Button, { buttonClasses } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { abandonGame, completeGame, getActiveSession, getGames, startGame } from './api';
import { createAnswerQueue } from './answerQueue';
import { ArrangeQuestion, AudioPlayer, ChoiceQuestion, Feedback, MatchQuestion, MemoryQuestion, TypedQuestion } from './QuestionViews';
import ResultScreen from './ResultScreen';

const DIFFICULTY_OPTIONS = [
  { key: 'auto', label: 'Avto (tavsiya)', hint: 'Natijalaringizga moslashadi' },
  { key: 'easy', label: 'Oson', hint: 'Yengil savollar' },
  { key: 'medium', label: "O'rta", hint: 'Muvozanatli' },
  { key: 'hard', label: 'Qiyin', hint: 'Variantsiz / vaqt bilan' },
  { key: 'expert', label: 'Ekspert', hint: "Eng qiyin, ko'proq XP" },
];
const MODE_OPTIONS = [
  { key: 'mixed', label: 'Aralash (tavsiya)' },
  { key: 'review', label: 'Takrorlash kerak bo\'lganlar' },
  { key: 'weak', label: "Zaif so'zlar" },
  { key: 'new', label: "Yangi so'zlar" },
];
const NO_TIMER_KEY = 'vocably-games-no-timer';
const AUTO_ADVANCE_MS = 1000;

const KIND_TITLES = {
  mc_meaning: "So'zning ma'nosini toping",
  mc_word: "Qaysi inglizcha so'z?",
  definition: "Ta'rif qaysi so'zga tegishli?",
  syn_ant: 'Sinonim / antonim',
  fill_choice: "Bo'sh joyga mos so'zni tanlang",
  fill_typed: "Bo'sh joyni to'ldiring",
  listen_choose: "Eshiting va to'g'ri so'zni tanlang",
  listen_type: "Eshiting va yozing",
  sentence_build: 'Jumla quring',
  match_pairs: "Juftliklarni toping",
  memory_pairs: 'Xotira kartalari',
  spell_drop: "Inglizchasini yozing",
  image_word: "Rasmga mos so'zni toping",
  word_image: "So'zga mos rasmni tanlang",
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

function readNoTimer() {
  try {
    return localStorage.getItem(NO_TIMER_KEY) === '1';
  } catch {
    return false;
  }
}

export default function GamePlayer({ gameKey }) {
  const router = useRouter();
  const search = useSearchParams();
  const { categories } = useApp();
  const reducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState('loading'); // loading | setup | starting | playing | finishing | result
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [resumable, setResumable] = useState(null);
  const [opts, setOpts] = useState({ difficulty: 'auto', categoryId: '', mode: search.get('mode') || 'mixed' });
  const [noTimer, setNoTimer] = useState(false);

  const [session, setSession] = useState(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({});
  const [checking, setChecking] = useState(false);
  const [lives, setLives] = useState(null);
  const [offline, setOffline] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [final, setFinal] = useState(null);

  const queueRef = useRef(null);
  const shownAtRef = useRef(0);
  const answeredRef = useRef(new Set());
  const advanceTimer = useRef(null);

  // --- yuklash: katalog + tiklanadigan faol sessiya ---
  useEffect(() => {
    setNoTimer(readNoTimer());
    const ctrl = new AbortController();
    (async () => {
      try {
        const [catalog, active] = await Promise.all([getGames(), getActiveSession(gameKey).catch(() => ({ session: null }))]);
        if (ctrl.signal.aborted) return;
        const g = (catalog.games || []).find((x) => x.key === gameKey);
        if (!g) {
          setError("Bunday o'yin topilmadi.");
          setPhase('setup');
          return;
        }
        setMeta({ ...g, sessionsToday: catalog.sessionsToday, dailyLimit: catalog.dailyLimit, tier: catalog.tier });
        setResumable(active?.session || null);
        setPhase('setup');
      } catch (err) {
        if (ctrl.signal.aborted) return;
        setError(err.message || "Yuklashda xatolik");
        setPhase('setup');
      }
    })();
    return () => ctrl.abort();
  }, [gameKey]);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const questions = session?.questions || [];
  const q = questions[index] || null;
  const result = q ? results[q.qid] : null;
  const instant = session?.instantFeedback !== false;
  const timeLimit = !noTimer && q?.timeLimitSec ? q.timeLimitSec : null;

  // --- sessiyani boshlash / tiklash ---
  const beginSession = useCallback((view) => {
    queueRef.current = createAnswerQueue(view.sessionId);
    answeredRef.current = new Set(Object.keys(view.answered || {}));
    const firstOpen = view.questions.findIndex((x) => !(view.answered || {})[x.qid]);
    setSession(view);
    setResults(view.answered || {});
    setIndex(firstOpen === -1 ? view.questions.length - 1 : firstOpen);
    setLives(view.lives ?? null);
    setFinal(null);
    setOffline(false);
    setChecking(false);
    setError('');
    shownAtRef.current = Date.now();
    setPhase('playing');
  }, []);

  const start = async () => {
    setPhase('starting');
    setError('');
    try {
      const view = await startGame(gameKey, { difficulty: opts.difficulty, categoryId: opts.categoryId, mode: opts.mode });
      beginSession(view);
    } catch (err) {
      setError(err.message || "O'yinni boshlab bo'lmadi");
      setPhase('setup');
    }
  };

  const resume = () => resumable && beginSession(resumable);

  // --- tugatish ---
  const finish = useCallback(async () => {
    if (!session) return;
    setPhase('finishing');
    setError('');
    const queue = queueRef.current;
    let attempts = 0;
    while (queue && queue.size > 0 && attempts < 3) {
      const r = await queue.flush();
      if (r.ok || r.fatal) break;
      attempts += 1;
      await new Promise((res) => setTimeout(res, 600 * attempts));
    }
    try {
      const out = await completeGame(session.sessionId);
      queue?.clear();
      setFinal(out);
      setPhase('result');
    } catch (err) {
      setError(err.message || 'Natijani olishda xatolik');
      setPhase('playing');
      setOffline(err.code === 'network');
    }
  }, [session]);

  const advance = useCallback(() => {
    clearTimeout(advanceTimer.current);
    if (!session) return;
    const isLast = index + 1 >= session.questions.length;
    if (isLast || lives === 0) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    shownAtRef.current = Date.now();
  }, [session, index, lives, finish]);

  // --- javob yuborish ---
  const handleAnswer = useCallback(
    async (answer, { timedOut = false } = {}) => {
      if (!q || answeredRef.current.has(q.qid) || checking) return;
      answeredRef.current.add(q.qid);
      const limitMs = q.timeLimitSec ? q.timeLimitSec * 1000 : null;
      const responseMs = timedOut && limitMs ? limitMs : Math.max(0, Date.now() - shownAtRef.current);
      const queue = queueRef.current;
      queue.add({ qid: q.qid, answer: timedOut ? null : answer, responseMs, attempt: 1 });

      if (instant) {
        setChecking(true);
        const r = await queue.flush();
        const res = r.results.find((x) => x.qid === q.qid);
        if (res && !res.error) {
          setResults((prev) => ({ ...prev, [q.qid]: res }));
          setOffline(false);
          if (!res.isCorrect && lives != null) setLives((l) => Math.max(0, (l ?? 0) - 1));
        } else {
          // Ulanish yo'q: javob navbatda saqlandi, o'yin davom etadi (tiklanganda yuboriladi).
          setResults((prev) => ({ ...prev, [q.qid]: { pending: true, isCorrect: null } }));
          setOffline(true);
        }
        setChecking(false);
      } else {
        // Batch rejimi (tezlik o'yinlari): natija oxirida; har 5 javobda fonda yuboriladi.
        setResults((prev) => ({ ...prev, [q.qid]: { submitted: true, isCorrect: null, timedOut } }));
        if (timedOut && lives != null) setLives((l) => Math.max(0, (l ?? 0) - 1));
        if (queue.size >= 5) queue.flush();
      }
    },
    [q, checking, instant, lives]
  );

  // --- avto-o'tish: to'g'ri javobdan yoki batch rejimida darhol ---
  useEffect(() => {
    if (phase !== 'playing' || !q || !result) return undefined;
    const isCorrect = result.isCorrect === true;
    if (!instant || result.pending || result.submitted) {
      advanceTimer.current = setTimeout(advance, instant ? 500 : 250);
    } else if (isCorrect && !reducedMotion) {
      advanceTimer.current = setTimeout(advance, AUTO_ADVANCE_MS);
    }
    return () => clearTimeout(advanceTimer.current);
  }, [result, phase, q, instant, reducedMotion, advance]);

  // --- taymer (qulaylik: o'chirib qo'yish mumkin) ---
  useEffect(() => {
    if (phase !== 'playing' || !q || !timeLimit || result || checking) {
      setTimeLeft(null);
      return undefined;
    }
    const started = shownAtRef.current || Date.now();
    const total = timeLimit * 1000;
    setTimeLeft(total);
    const id = setInterval(() => {
      const left = total - (Date.now() - started);
      if (left <= 0) {
        clearInterval(id);
        setTimeLeft(0);
        handleAnswer(null, { timedOut: true });
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, q?.qid, timeLimit, !!result, checking]);

  // --- ulanish tiklanganda yuborilmagan javoblarni yuboramiz ---
  useEffect(() => {
    const onOnline = async () => {
      const queue = queueRef.current;
      if (!queue || !queue.size) return;
      const r = await queue.flush();
      if (r.ok) {
        setOffline(false);
        setResults((prev) => {
          const next = { ...prev };
          for (const res of r.results) if (!res.error && next[res.qid]?.pending) next[res.qid] = res;
          return next;
        });
      }
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  // Enter: javobdan keyin keyingi savolga
  useEffect(() => {
    if (phase !== 'playing' || !result || result.isCorrect === true) return undefined;
    const onKey = (e) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, result, advance]);

  const exit = async () => {
    try {
      if (session && phase === 'playing') await abandonGame(session.sessionId);
    } catch {
      // abandon muvaffaqiyatsiz bo'lsa ham chiqamiz (sessiya o'zi eskiradi)
    }
    router.push('/app/oyinlar');
  };

  const toggleNoTimer = (v) => {
    setNoTimer(v);
    try {
      localStorage.setItem(NO_TIMER_KEY, v ? '1' : '0');
    } catch {
      // localStorage yopiq — sozlama shu sessiyada qoladi
    }
  };

  const playAgain = () => {
    setSession(null);
    setFinal(null);
    setResults({});
    setPhase('setup');
    getActiveSession(gameKey).then((a) => setResumable(a?.session || null)).catch(() => {});
  };

  // =========================================================================
  // RENDER
  // =========================================================================
  if (phase === 'loading') {
    return (
      <div className="max-w-2xl mx-auto grid gap-4" aria-busy="true">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (phase === 'result' && final) {
    return <ResultScreen result={final} gameTitle={meta?.title || ''} onPlayAgain={playAgain} />;
  }

  if (phase === 'setup' || phase === 'starting') {
    const locked = meta && !meta.unlocked;
    const unavailable = meta && meta.unlocked && !meta.available;
    return (
      <div className="max-w-2xl mx-auto">
        <Link href="/app/oyinlar" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
          <ArrowLeft size={14} aria-hidden="true" /> Barcha o'yinlar
        </Link>
        <h1 className="text-2xl font-bold text-ink font-display">{meta?.title || "O'yin"}</h1>
        <p className="text-sm text-muted mt-1 mb-5">{meta?.description}</p>

        {error && (
          <p role="alert" className="mb-4 text-sm text-danger bg-danger-soft border border-danger/30 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {locked && (
          <div className="mb-4 flex items-center gap-3 bg-warning-soft text-warning border border-warning/30 rounded-xl px-4 py-3 text-sm">
            <Lock size={16} aria-hidden="true" />
            <span className="flex-1">{meta.lockedReason}</span>
            <Link href="/narxlar" className={buttonClasses({ size: 'sm', variant: 'secondary' })}>
              Tariflar
            </Link>
          </div>
        )}
        {unavailable && (
          <p className="mb-4 text-sm text-muted bg-bg-sunken border border-border rounded-xl px-4 py-3">{meta.unavailableReason}</p>
        )}

        {resumable && !locked && (
          <div className="mb-4 flex flex-wrap items-center gap-3 bg-accent-soft border border-accent/30 rounded-xl px-4 py-3">
            <p className="text-sm text-ink flex-1 min-w-[180px]">Yakunlanmagan sessiya bor. Davom ettirasizmi?</p>
            <Button size="sm" onClick={resume}>
              <Play size={14} aria-hidden="true" /> Davom etish
            </Button>
          </div>
        )}

        {meta && !locked && (
          <fieldset disabled={phase === 'starting' || unavailable} className="bg-surface border border-border rounded-2xl p-5 grid gap-5 shadow-card">
            <div>
              <legend className="text-sm font-semibold text-ink mb-2">Qiyinlik</legend>
              <div role="radiogroup" aria-label="Qiyinlik darajasi" className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    role="radio"
                    aria-checked={opts.difficulty === d.key}
                    onClick={() => setOpts((o) => ({ ...o, difficulty: d.key }))}
                    title={d.hint}
                    className={`px-2 py-2.5 min-h-11 rounded-lg border text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      opts.difficulty === d.key ? 'border-accent bg-accent-soft text-accent-hover' : 'border-border text-ink hover:bg-bg-sunken'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="game-mode" className="block text-sm font-semibold text-ink mb-2">
                  So'zlar
                </label>
                <select
                  id="game-mode"
                  value={opts.mode}
                  onChange={(e) => setOpts((o) => ({ ...o, mode: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-surface text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  {MODE_OPTIONS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="game-cat" className="block text-sm font-semibold text-ink mb-2">
                  Kategoriya
                </label>
                <select
                  id="game-cat"
                  value={opts.categoryId}
                  onChange={(e) => setOpts((o) => ({ ...o, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-surface text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  <option value="">Barcha so'zlarim</option>
                  {(categories || []).map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({(c.words || []).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={noTimer}
                onChange={(e) => toggleNoTimer(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[var(--color-accent)]"
              />
              <span>
                Vaqt chegarasini o'chirish <span className="text-muted">(qulaylik — taymer savollarni cheklamaydi)</span>
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={start} disabled={phase === 'starting' || unavailable}>
                <Play size={18} aria-hidden="true" /> {phase === 'starting' ? 'Tayyorlanmoqda…' : "O'yinni boshlash"}
              </Button>
              {meta.dailyLimit != null && (
                <span className="text-xs text-muted">
                  Bugun: {meta.sessionsToday}/{meta.dailyLimit} ta o'yin
                </span>
              )}
            </div>
          </fieldset>
        )}
      </div>
    );
  }

  // --- playing / finishing ---
  if (!session || !q) return null;
  const total = session.questions.length;
  const progressPct = Math.round((index / total) * 100);
  const showAudio = !!q.audioText && (q.kind === 'listen_choose' || q.kind === 'listen_type');  const questionAnswered = !!result;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">{meta?.title}</p>
          <p className="text-sm font-semibold text-ink tabular-nums" aria-live="polite">
            Savol {index + 1} / {total}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lives != null && (
            <span className="flex items-center gap-1" role="img" aria-label={`${lives} ta jon qoldi`}>
              {Array.from({ length: session.lives || lives }).map((_, i) => (
                <Heart key={i} size={18} aria-hidden="true" className={i < lives ? 'text-danger fill-danger' : 'text-border'} />
              ))}
            </span>
          )}
          <button
            type="button"
            onClick={() => setConfirmExit(true)}
            className="inline-flex items-center gap-1 px-3 py-2 min-h-11 md:min-h-0 rounded-lg border border-border text-xs text-muted hover:bg-bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={14} aria-hidden="true" /> Chiqish
          </button>
        </div>
      </div>

      <div
        className="h-1.5 rounded-full bg-bg-sunken overflow-hidden mb-4"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPct}
        aria-label="O'yin jarayoni"
      >
        <div className="h-full bg-accent motion-safe:transition-[width] duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      {confirmExit && (
        <div role="alertdialog" aria-label="Chiqishni tasdiqlang" className="mb-4 bg-warning-soft border border-warning/30 rounded-xl px-4 py-3 text-sm flex flex-wrap items-center gap-3">
          <p className="flex-1 min-w-[200px] text-ink">O'yindan chiqsangiz, bu sessiya yakunlanmaydi (XP berilmaydi). Chiqasizmi?</p>
          <Button size="sm" variant="secondary" onClick={() => setConfirmExit(false)}>
            Davom etish
          </Button>
          <Button size="sm" variant="danger" onClick={exit}>
            Chiqish
          </Button>
        </div>
      )}

      {offline && (
        <p role="status" className="mb-3 flex items-center gap-2 text-sm text-warning bg-warning-soft border border-warning/30 rounded-xl px-4 py-2.5">
          <WifiOff size={16} aria-hidden="true" /> Ulanish yo'q — javoblaringiz saqlandi, aloqa tiklanganda yuboriladi.
        </p>
      )}
      {error && phase === 'playing' && (
        <p role="alert" className="mb-3 text-sm text-danger bg-danger-soft border border-danger/30 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-3">
          <span className="flex-1">{error}</span>
          <Button size="sm" onClick={finish}>
            Qayta urinish
          </Button>
        </p>
      )}

      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card" aria-busy={phase === 'finishing' || checking}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{KIND_TITLES[q.kind] || ''}</p>

        {timeLimit && timeLeft != null && (
          <div className="mb-3" role="timer" aria-label={`Qolgan vaqt: ${Math.ceil(timeLeft / 1000)} soniya`}>
            <div className="h-1.5 rounded-full bg-bg-sunken overflow-hidden">
              <div
                className={`h-full ${timeLeft < 3000 ? 'bg-warning' : 'bg-accent'}`}
                style={{ width: `${Math.max(0, Math.min(100, (timeLeft / (timeLimit * 1000)) * 100))}%` }}
              />
            </div>
            <p className="text-xs text-muted mt-1 tabular-nums">{Math.ceil(timeLeft / 1000)} s</p>
          </div>
        )}

        {q.kind !== 'listen_choose' && q.kind !== 'listen_type' && q.inputType !== 'match' && (
          <h2 className="text-xl sm:text-2xl font-bold text-ink font-display mb-4 break-words">{q.prompt}</h2>
        )}
        {q.inputType === 'match' && <h2 className="text-lg font-bold text-ink font-display mb-4">{q.prompt}</h2>}
        {q.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={q.imageUrl} alt="Savol rasmi" loading="lazy" className="mb-4 max-h-64 w-full rounded-xl border border-border object-contain bg-bg-sunken" />
        )}
        {showAudio && (
          <div className="mb-4">
            <AudioPlayer key={q.qid} text={q.audioText} />
          </div>
        )}
        {q.kind === 'mc_meaning' && q.audioText && (
          <div className="mb-4">
            <AudioPlayer key={`a-${q.qid}`} text={q.audioText} autoPlay={false} />
          </div>
        )}
        {q.hint && q.inputType === 'choice' && <p className="text-sm text-muted mb-3">{q.hint}</p>}

        {q.inputType === 'choice' && <ChoiceQuestion question={q} result={result} locked={checking || phase === 'finishing'} onAnswer={handleAnswer} />}
        {q.inputType === 'typed' && <TypedQuestion question={q} result={result} locked={checking || phase === 'finishing'} onAnswer={handleAnswer} near={result?.near} />}
        {q.inputType === 'arrange' && <ArrangeQuestion question={q} result={result} locked={checking || phase === 'finishing'} onAnswer={handleAnswer} />}
        {q.inputType === 'match' && q.kind === 'match_pairs' && <MatchQuestion question={q} result={result} locked={checking || phase === 'finishing'} onAnswer={handleAnswer} />}
        {q.inputType === 'match' && q.kind === 'memory_pairs' && (
          <MemoryQuestion question={q} result={result} locked={checking || phase === 'finishing'} onAnswer={handleAnswer} reducedMotion={reducedMotion} />
        )}

        {instant && result && !result.pending && <Feedback result={result} near={result.near} />}
        {result?.pending && (
          <p role="status" className="mt-4 text-sm text-warning">
            Javob saqlandi (ulanish yo'q). Natija aloqa tiklanganda ko'rinadi.
          </p>
        )}
        {checking && (
          <p role="status" className="mt-3 text-xs text-muted">
            Tekshirilmoqda…
          </p>
        )}

        {questionAnswered && (!instant || result.isCorrect !== true || reducedMotion || result.pending) && phase === 'playing' && (
          <div className="mt-5 flex justify-end">
            <Button onClick={advance} autoFocus>
              {index + 1 >= total ? 'Yakunlash' : 'Keyingisi'} <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        )}
        {phase === 'finishing' && (
          <p role="status" className="mt-4 text-sm text-muted">
            Natijalar hisoblanmoqda…
          </p>
        )}
      </div>
    </div>
  );
}
