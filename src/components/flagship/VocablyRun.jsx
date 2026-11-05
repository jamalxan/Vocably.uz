'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Heart, Pause, Play, RotateCcw, Volume2, VolumeX, Smartphone, ArrowRight, Loader2, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { RUN, initialRun, resolveGate, moveLane, summary, guestQuestions, travelMsFor, speedFor } from '@/lib/flagship/run';
import { RUN_BANK, bankEntry } from '@/lib/flagship/runBank';
import { saveGuestMissed, claimGuestMissed, readFx, writeFx, beep } from '@/lib/flagship/client';
import { startGame, completeGame } from '@/components/games/api';
import { createAnswerQueue } from '@/components/games/answerQueue';
import ShareCard from './ShareCard';

const RunScene3D = dynamic(() => import('./RunScene3D'), { ssr: false, loading: () => null });

// Vocably Run (TZ 2.0 §7). One controller for both audiences:
//  - signed in: questions come from the user's own words via the regular game session
//    (POST /api/games/vocably_run/start); every gate is graded on the server and goes into
//    SRS by response time; the round completes like any game (XP, plan "game" task).
//  - guest: 30 gates from the public bank, graded on the device; missed words are kept in
//    localStorage and saved to a deck after sign-up (claimGuestMissed on the dashboard).
// The game loop lives in refs; React state only carries the HUD.

const COPY = {
  uz: {
    title: 'Vocably Run',
    tagline: "Tepada ma'no — to'g'ri so'z turgan yo'lakka o'ting.",
    rules: ["3 ta jon. Xato yo'lak — bitta jon ketadi.", "Har 10 to'g'ri javobda tezlik +8%.", 'Ball = to‘g‘ri javob × tezlik × kombo. Raund 90 soniya.'],
    controls: "Boshqaruv: ← → (yoki A/D), ekranni suring yoki pastdagi so'zni bosing.",
    guestNote: "Ro'yxatdan o'tmasdan o'ynaysiz. Xato so'zlaringiz saqlanadi — hisob ochsangiz, takrorlashga qo'shiladi.",
    userNote: "So'zlar o'z lug'atingizdan olinadi. Har javob takrorlash jadvaliga yoziladi.",
    start: 'Boshlash',
    again: 'Yana o‘ynash',
    loading: 'Tayyorlanmoqda…',
    meaning: "Ma'nosi",
    definition: 'Definition',
    lives: 'Jon',
    score: 'Ball',
    combo: 'Kombo',
    time: 'Vaqt',
    pause: 'Pauza',
    resume: 'Davom etish',
    paused: 'Pauza',
    sound: 'Ovoz',
    vibrate: 'Tebranish',
    lane: (n, w) => `${n}-yo'lak: ${w}`,
    locked: 'Tanlandi',
    right: "To'g'ri!",
    wrong: "Xato. To'g'risi:",
    offline: "Aloqa yo'q — bu javob hisoblanmadi",
    over: 'Jonlar tugadi',
    timeUp: 'Vaqt tugadi',
    finished: 'Raund tugadi',
    correct: "To'g'ri",
    accuracy: 'Aniqlik',
    maxCombo: 'Eng uzun kombo',
    seconds: 'Soniya',
    xp: (n) => `+${n} XP`,
    missedTitle: "Xato qilingan so'zlar",
    noMissed: "Birorta ham xato yo'q — zo'r!",
    reviewNow: 'Hozir takrorlash',
    saveCta: 'Natijangni saqlash va rejangni olish',
    saveNote: (n) => `${n} ta xato so'z hisobingizdagi takrorlashga qo'shiladi.`,
    practiceFallback: "Lug'atingizda so'z kam — umumiy so'zlar bilan o'ynayapsiz (natija saqlanmaydi).",
    errorStart: "O'yinni boshlab bo'lmadi",
    claimed: (n) => `Vocably Run'dagi ${n} ta xato so'z takrorlashga qo'shildi.`,
  },
  en: {
    title: 'Vocably Run',
    tagline: 'Meaning on top — run into the lane with the right word.',
    rules: ['3 lives. Wrong lane costs one.', 'Speed +8% every 10 correct answers.', 'Score = correct × speed × combo. 90-second round.'],
    controls: 'Controls: ← → (or A/D), swipe, or tap a word below.',
    guestNote: 'No account needed. Your missed words are kept — sign up and they go into your reviews.',
    userNote: 'Words come from your own vocabulary. Every answer updates your review schedule.',
    start: 'Start',
    again: 'Play again',
    loading: 'Getting ready…',
    meaning: 'Meaning',
    definition: 'Definition',
    lives: 'Lives',
    score: 'Score',
    combo: 'Combo',
    time: 'Time',
    pause: 'Pause',
    resume: 'Resume',
    paused: 'Paused',
    sound: 'Sound',
    vibrate: 'Vibration',
    lane: (n, w) => `Lane ${n}: ${w}`,
    locked: 'Locked',
    right: 'Correct!',
    wrong: 'Wrong. Answer:',
    offline: 'No connection — this answer was not counted',
    over: 'Out of lives',
    timeUp: "Time's up",
    finished: 'Round over',
    correct: 'Correct',
    accuracy: 'Accuracy',
    maxCombo: 'Best combo',
    seconds: 'Seconds',
    xp: (n) => `+${n} XP`,
    missedTitle: 'Words you missed',
    noMissed: 'No mistakes at all — great!',
    reviewNow: 'Review now',
    saveCta: 'Save your result and get your plan',
    saveNote: (n) => `${n} missed words will go into your reviews once you have an account.`,
    practiceFallback: 'You have few words yet — playing with common words (not saved).',
    errorStart: 'Could not start the game',
    claimed: (n) => `${n} missed words from Vocably Run were added to your reviews.`,
  },
};

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Fallback when 3D is off (no WebGL or reduced motion): the gate slides down a 2D track. */
function Track2D({ sceneRef, running }) {
  const bar = useRef(null);
  useEffect(() => {
    if (!running) return undefined;
    let id;
    const loop = () => {
      const p = Math.min(1, sceneRef.current.progress || 0);
      if (bar.current) bar.current.style.transform = `translateY(${p * 100}%)`;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [running, sceneRef]);
  return (
    <div className="absolute inset-0 bg-[#0b1020]" aria-hidden="true">
      <div className="absolute inset-x-6 top-0 bottom-0 grid grid-cols-3 border-x border-white/10">
        <div className="border-r border-white/10" />
        <div className="border-r border-white/10" />
        <div />
      </div>
      <div className="absolute inset-x-6 top-0 h-[80%]">
        <div ref={bar} className="h-2 w-full rounded-full bg-accent shadow-[0_0_16px_rgba(224,86,106,.8)]" />
      </div>
    </div>
  );
}

export default function VocablyRun() {
  const c = useCopy(COPY);
  const [audience, setAudience] = useState(null); // null (checking) | 'guest' | 'user'
  const [phase, setPhase] = useState('intro'); // intro | loading | playing | finishing | result
  const [paused, setPaused] = useState(false);
  const [use3d, setUse3d] = useState(true);
  const [fx, setFx] = useState({ sound: true, vibrate: true });
  const [hud, setHud] = useState({ lives: RUN.lives, score: 0, combo: 0, timeLeft: RUN.roundMs / 1000, prompt: '', promptKind: 'meaning', options: [], lane: 1, locked: false, feedback: null });
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [announce, setAnnounce] = useState('');

  const sceneRef = useRef({ lane: 1, progress: 0, options: [], feedback: null, speed: 1, running: false, locked: false });
  const g = useRef({ active: false });
  const fxRef = useRef(fx);
  useEffect(() => {
    fxRef.current = fx;
  }, [fx]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser capabilities once
    setFx(readFx());
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setUse3d(webglOk() && !reduce);
    let cancelled = false;
    let authed = false;
    try {
      authed = localStorage.getItem('vocably_authed') === '1';
    } catch {
      authed = false;
    }
    if (!authed) {
      setAudience('guest');
      return () => {
        cancelled = true;
      };
    }
    fetch('/api/games/vocably_run/active', { credentials: 'same-origin', cache: 'no-store' })
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 401) return setAudience('guest');
        setAudience('user');
        const added = await claimGuestMissed();
        if (!cancelled && added > 0) setNotice(c.claimed(added));
      })
      .catch(() => !cancelled && setAudience('guest'));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per mount
  }, []);

  const toggleFx = (k) => {
    const next = { ...fx, [k]: !fx[k] };
    setFx(next);
    writeFx(next);
  };

  // ---------- game loop ----------
  const showGate = useCallback((s, now) => {
    const q = s.qs[s.idx];
    s.gap = false;
    s.locked = false;
    s.resolving = false;
    s.gateStart = now;
    s.lastMove = 0;
    s.travel = travelMsFor(s.run.correct);
    Object.assign(sceneRef.current, { options: q.options, feedback: null, locked: false, progress: 0, speed: speedFor(s.run.correct) });
    setHud((h) => ({ ...h, prompt: q.prompt, promptKind: q.promptKind, options: q.options, locked: false, feedback: null }));
    setAnnounce(`${q.promptKind === 'definition' ? c.definition : c.meaning}: ${q.prompt}`);
  }, [c]);

  const finish = useCallback(async () => {
    const s = g.current;
    if (!s.active) return;
    s.active = false;
    cancelAnimationFrame(s.raf);
    sceneRef.current.running = false;
    const durationMs = performance.now() - s.roundStart - (s.pausedTotal || 0);
    const sum = summary(s.run, durationMs);
    const reason = s.run.over ? c.over : durationMs >= RUN.roundMs ? c.timeUp : c.finished;
    beep('end', fxRef.current);
    if (!s.session) {
      if (s.saveGuest) saveGuestMissed(sum.missed.map((m) => m.word));
      setResult({ ...sum, reason, guest: s.saveGuest, practice: !s.saveGuest, missed: sum.missed.map((m) => ({ word: m.word, note: bankEntry(m.word)?.uz || m.prompt })) });
      setPhase('result');
      return;
    }
    setPhase('finishing');
    await s.queue.flush();
    let xp = null;
    let missed = sum.missed.map((m) => ({ word: m.word, note: m.prompt }));
    try {
      const r = await completeGame(s.session.sessionId);
      xp = r?.xp?.earned ?? null;
      if (Array.isArray(r?.mistakes) && r.mistakes.length) missed = r.mistakes.map((m) => ({ word: m.word || m.correctDisplay, note: m.explanation || '' }));
    } catch { /* result still shown; the session expires on its own */ }
    setResult({ ...sum, reason, xp, guest: false, missed });
    setPhase('result');
  }, [c]);

  const grade = useCallback((q, optionId, responseMs) => {
    const s = g.current;
    if (!s.session) {
      const correctLane = q.options.findIndex((o) => o.id === q.answer);
      return Promise.resolve({ ok: optionId === q.answer, correctDisplay: q.word, correctLane });
    }
    s.queue.add({ qid: q.qid, answer: optionId || '', responseMs });
    return s.queue.flush().then((res) => {
      const r = res.ok ? res.results.find((x) => x.qid === q.qid) : null;
      if (!r || r.error) return { ok: null, correctDisplay: '', correctLane: -1 };
      const correctLane = q.options.findIndex((o) => o.text === r.correctDisplay);
      return { ok: !!r.isCorrect, correctDisplay: r.correctDisplay || '', correctLane };
    });
  }, []);

  const tickRef = useRef(() => {});
  const tick = useCallback(() => {
    const s = g.current;
    if (!s.active) return;
    const now = performance.now();
    if (!s.pausedAt) {
      const t = now - s.gateStart;
      sceneRef.current.progress = t / s.travel;
      if (!s.gap) {
        if (!s.locked && t >= s.travel - RUN.lockBeforeMs) {
          const q = s.qs[s.idx];
          s.locked = true;
          s.chosen = s.lane;
          s.responseMs = Math.round(s.lastMove > s.gateStart ? s.lastMove - s.gateStart : t);
          s.pending = grade(q, q.options[s.chosen]?.id, s.responseMs);
          sceneRef.current.locked = true;
          setHud((h) => ({ ...h, locked: true }));
        }
        if (s.locked && t >= s.travel && !s.resolving) {
          s.resolving = true;
          const q = s.qs[s.idx];
          const timeout = new Promise((r) => setTimeout(() => r({ ok: null, correctDisplay: '', correctLane: -1 }), 2500));
          Promise.race([s.pending, timeout]).then((res) => {
            if (!s.active) return;
            s.run = resolveGate(s.run, { ok: res.ok, qid: q.qid, word: res.correctDisplay, prompt: q.prompt, responseMs: s.responseMs, chosen: s.chosen });
            const feedback = { ok: res.ok, chosen: s.chosen, correctLane: res.correctLane, word: res.correctDisplay };
            sceneRef.current.feedback = feedback;
            if (res.ok !== null) beep(res.ok ? 'ok' : 'wrong', fxRef.current);
            setHud((h) => ({ ...h, lives: s.run.lives, score: s.run.score, combo: s.run.combo, feedback }));
            setAnnounce(res.ok === null ? c.offline : res.ok ? c.right : `${c.wrong} ${res.correctDisplay}`);
            s.gap = true;
            s.gapUntil = performance.now() + 650;
          });
        }
      } else if (now >= s.gapUntil) {
        const elapsed = now - s.roundStart - s.pausedTotal;
        if (s.run.over || elapsed >= RUN.roundMs || s.idx + 1 >= s.qs.length) {
          finish();
          return;
        }
        s.idx += 1;
        showGate(s, now);
      }
      if (now - s.lastHud > 250) {
        s.lastHud = now;
        const left = Math.max(0, Math.ceil((RUN.roundMs - (now - s.roundStart - s.pausedTotal)) / 1000));
        setHud((h) => (h.timeLeft === left ? h : { ...h, timeLeft: left }));
      }
    }
    s.raf = requestAnimationFrame(() => tickRef.current());
  }, [c, finish, grade, showGate]);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const start = async () => {
    setError('');
    setNotice('');
    setResult(null);
    let qs;
    let session = null;
    let saveGuest = audience !== 'user';
    if (audience === 'user') {
      setPhase('loading');
      try {
        session = await startGame('vocably_run', { difficulty: 'auto', mode: 'mixed' });
        qs = session.questions.map((q) => ({ qid: q.qid, prompt: q.prompt, promptKind: q.kind === 'definition' ? 'definition' : 'meaning', options: q.options || [] }));
      } catch (e) {
        if (e?.code === 'not_enough_words' || e?.code === 'no_questions') {
          setNotice(c.practiceFallback);
          session = null;
          saveGuest = false;
        } else {
          setError(e?.message || c.errorStart);
          setPhase('intro');
          return;
        }
      }
    }
    if (!qs) qs = guestQuestions(RUN_BANK, Math.random, 30);
    const now = performance.now();
    g.current = {
      active: true,
      qs,
      idx: 0,
      lane: 1,
      run: initialRun(),
      session,
      saveGuest,
      queue: session ? createAnswerQueue(session.sessionId) : null,
      roundStart: now,
      pausedTotal: 0,
      pausedAt: 0,
      lastHud: 0,
    };
    Object.assign(sceneRef.current, { lane: 1, running: true });
    setHud({ lives: RUN.lives, score: 0, combo: 0, timeLeft: RUN.roundMs / 1000, prompt: '', promptKind: 'meaning', options: [], lane: 1, locked: false, feedback: null });
    setPaused(false);
    setPhase('playing');
    showGate(g.current, now);
    g.current.raf = requestAnimationFrame(() => tickRef.current());
  };

  const setLane = useCallback((lane) => {
    const s = g.current;
    if (!s.active || s.pausedAt) return;
    if (lane === s.lane) return;
    s.lane = lane;
    if (!s.locked) s.lastMove = performance.now();
    sceneRef.current.lane = lane;
    setHud((h) => ({ ...h, lane }));
  }, []);

  const pause = useCallback(() => {
    const s = g.current;
    if (!s.active || s.pausedAt) return;
    s.pausedAt = performance.now();
    sceneRef.current.running = false;
    setPaused(true);
  }, []);
  const resume = useCallback(() => {
    const s = g.current;
    if (!s.active || !s.pausedAt) return;
    const d = performance.now() - s.pausedAt;
    s.pausedAt = 0;
    s.pausedTotal += d;
    s.gateStart += d;
    if (s.gapUntil) s.gapUntil += d;
    if (s.lastMove) s.lastMove += d;
    sceneRef.current.running = true;
    setPaused(false);
  }, []);

  // keyboard + tab visibility
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const onKey = (e) => {
      if (e.target?.closest?.('input,textarea,select')) return;
      const s = g.current;
      if (e.key === 'ArrowLeft' || e.code === 'KeyA') setLane(moveLane(s.lane, -1));
      else if (e.key === 'ArrowRight' || e.code === 'KeyD') setLane(moveLane(s.lane, 1));
      else if (['1', '2', '3'].includes(e.key)) setLane(Number(e.key) - 1);
      else if (e.key === 'Escape' || e.code === 'KeyP') (s.pausedAt ? resume : pause)();
      else return;
      e.preventDefault();
    };
    const onVis = () => document.visibilityState === 'hidden' && pause();
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [phase, setLane, pause, resume]);

  useEffect(() => () => {
    g.current.active = false;
    cancelAnimationFrame(g.current.raf);
  }, []);

  const swipe = useRef(null);
  const onPointerDown = (e) => (swipe.current = { x: e.clientX, y: e.clientY });
  const onPointerUp = (e) => {
    const s0 = swipe.current;
    swipe.current = null;
    if (!s0) return;
    const dx = e.clientX - s0.x;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(e.clientY - s0.y)) setLane(moveLane(g.current.lane, dx));
  };

  const playing = phase === 'playing';
  const showStage = playing || phase === 'finishing';

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="sr-only" aria-live="polite">{announce}</p>

      {phase === 'intro' || phase === 'loading' ? (
        <section aria-labelledby="run-h" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <Zap size={13} aria-hidden="true" /> IELTS vocabulary
          </p>
          <h1 id="run-h" className="font-luxury text-3xl sm:text-4xl font-bold text-ink mt-1">{c.title}</h1>
          <p className="text-muted mt-2">{c.tagline}</p>
          <ul className="mt-5 space-y-2 text-sm text-ink">
            {c.rules.map((r) => (
              <li key={r} className="flex gap-2"><span className="text-accent" aria-hidden="true">•</span>{r}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">{c.controls}</p>
          {audience && <p className="mt-4 rounded-xl bg-bg border border-border px-3.5 py-2.5 text-xs text-muted">{audience === 'user' ? c.userNote : c.guestNote}</p>}
          {notice && <p role="status" className="mt-3 rounded-xl bg-success-soft px-3.5 py-2.5 text-xs text-ink">{notice}</p>}
          {error && <p role="alert" className="mt-3 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{error}</p>}
          <div className="mt-5 flex gap-2">
            <FxToggle on={fx.sound} label={c.sound} Icon={fx.sound ? Volume2 : VolumeX} onClick={() => toggleFx('sound')} />
            <FxToggle on={fx.vibrate} label={c.vibrate} Icon={Smartphone} onClick={() => toggleFx('vibrate')} />
          </div>
          <button
            type="button"
            onClick={start}
            disabled={!audience || phase === 'loading'}
            className="mt-6 w-full min-h-14 rounded-2xl bg-accent text-on-accent text-lg font-bold hover:bg-accent-hover disabled:opacity-50 inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {phase === 'loading' || !audience ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
            {phase === 'loading' ? c.loading : c.start}
          </button>
        </section>
      ) : null}

      {showStage && (
        <section aria-label={c.title} className="relative rounded-3xl overflow-hidden border border-border shadow-card bg-[#0b1020] select-none touch-none" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          {/* HUD */}
          <div className="relative z-10 flex items-center justify-between gap-2 px-4 pt-3 text-white">
            <div className="flex items-center gap-1" aria-label={`${c.lives}: ${hud.lives}`} role="img">
              {Array.from({ length: RUN.lives }, (_, i) => (
                <Heart key={i} size={18} className={i < hud.lives ? 'fill-rose-500 text-rose-500' : 'text-white/25'} aria-hidden="true" />
              ))}
            </div>
            <div className="text-center">
              <p className="text-2xl font-black tabular-nums leading-none">{hud.score}</p>
              {hud.combo >= 2 && <p className="text-[11px] font-bold text-amber-300 tabular-nums">{c.combo} ×{hud.combo}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tabular-nums" aria-label={`${c.time}: ${hud.timeLeft}`}>{hud.timeLeft}s</span>
              <button type="button" onClick={pause} className="p-2 rounded-lg bg-white/10 hover:bg-white/20" aria-label={c.pause}>
                <Pause size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* prompt */}
          <div className="relative z-10 mx-4 mt-3 rounded-2xl bg-white/95 text-[#0b1020] px-4 py-3 text-center shadow-lg">
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent">{hud.promptKind === 'definition' ? c.definition : c.meaning}</p>
            <p className="text-lg sm:text-xl font-bold leading-snug break-words">{hud.prompt}</p>
          </div>

          {/* scene */}
          <div className="relative h-[46vh] min-h-72 max-h-[440px] -mt-14">
            {use3d ? <RunScene3D sceneRef={sceneRef} running={playing && !paused} /> : <Track2D sceneRef={sceneRef} running={playing && !paused} />}
            {hud.feedback && (
              <p className={`absolute left-1/2 -translate-x-1/2 bottom-4 rounded-full px-4 py-1.5 text-sm font-bold shadow-lg ${hud.feedback.ok ? 'bg-emerald-500 text-white' : hud.feedback.ok === false ? 'bg-rose-500 text-white' : 'bg-white/90 text-[#0b1020]'}`}>
                {hud.feedback.ok ? c.right : hud.feedback.ok === false ? `${c.wrong} ${hud.feedback.word}` : c.offline}
              </p>
            )}
          </div>

          {/* lanes — the accessible control and the one-thumb control */}
          <div className="relative z-10 grid grid-cols-3 gap-2 p-3 bg-[#0b1020]">
            {hud.options.map((o, i) => {
              const fb = hud.feedback;
              const tone = fb
                ? i === fb.correctLane ? 'bg-emerald-500 text-white border-emerald-300' : i === fb.chosen && fb.ok === false ? 'bg-rose-500 text-white border-rose-300' : 'bg-white/5 text-white/60 border-white/10'
                : i === hud.lane ? (hud.locked ? 'bg-amber-400 text-[#0b1020] border-amber-200' : 'bg-accent text-on-accent border-white/60') : 'bg-white/10 text-white border-white/15';
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setLane(i)}
                  aria-pressed={i === hud.lane}
                  aria-label={c.lane(i + 1, o.text)}
                  className={`min-h-14 rounded-xl border-2 px-1.5 text-sm sm:text-base font-bold font-word break-words leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${tone}`}
                >
                  {o.text}
                </button>
              );
            })}
          </div>
          <div className="relative z-10 flex justify-between px-4 pb-3 text-white/40 text-[11px]" aria-hidden="true">
            <ChevronLeft size={14} /> <span>{hud.locked ? c.locked : ''}</span> <ChevronRight size={14} />
          </div>

          {(paused || phase === 'finishing') && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-[#0b1020]/80 backdrop-blur-sm">
              {phase === 'finishing' ? (
                <Loader2 className="w-8 h-8 animate-spin text-white" aria-label={c.loading} />
              ) : (
                <div className="text-center">
                  <p className="text-white text-xl font-bold mb-4">{c.paused}</p>
                  <button type="button" onClick={resume} autoFocus className="min-h-12 px-6 rounded-2xl bg-accent text-on-accent font-bold inline-flex items-center gap-2">
                    <Play size={18} aria-hidden="true" /> {c.resume}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {phase === 'result' && result && <RunResult c={c} result={result} onAgain={start} />}
    </div>
  );
}

function FxToggle({ on, label, Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex items-center gap-1.5 min-h-10 px-3 rounded-xl border text-xs font-semibold ${on ? 'border-accent/40 bg-accent-soft text-ink' : 'border-border text-muted'}`}
    >
      <Icon size={14} aria-hidden="true" /> {label}
    </button>
  );
}

function RunResult({ c, result, onAgain }) {
  const stats = [
    [c.correct, result.correct],
    [c.accuracy, `${result.accuracy}%`],
    [c.maxCombo, result.maxCombo],
    [c.seconds, result.seconds],
  ];
  return (
    <section aria-labelledby="run-res-h" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">{result.reason}</p>
      <h2 id="run-res-h" className="mt-1 text-5xl font-black text-ink tabular-nums">{result.score}</h2>
      <p className="text-sm text-muted">{c.score}{result.xp ? ` · ${c.xp(result.xp)}` : ''}</p>
      <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-xl bg-bg border border-border px-1 py-2.5">
            <dd className="text-lg font-bold text-ink tabular-nums">{v}</dd>
            <dt className="text-[10px] text-muted leading-tight">{k}</dt>
          </div>
        ))}
      </dl>
      <ShareCard game="run" result={result} />

      <h3 className="mt-6 text-sm font-semibold text-ink">{c.missedTitle}</h3>
      {result.missed.length ? (
        <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-bg">
          {result.missed.slice(0, 12).map((m) => (
            <li key={m.word} className="px-3.5 py-2.5">
              <span className="font-word font-semibold text-ink">{m.word}</span>
              {m.note && <span className="block text-xs text-muted break-words">{m.note}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">{c.noMissed}</p>
      )}

      <div className="mt-6 grid gap-2">
        {result.guest ? (
          <>
            <Link href="/start" className="w-full min-h-14 rounded-2xl bg-accent text-on-accent font-bold inline-flex items-center justify-center gap-2 hover:bg-accent-hover text-center px-4">
              {c.saveCta} <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {result.missed.length > 0 && <p className="text-xs text-muted text-center">{c.saveNote(result.missed.length)}</p>}
          </>
        ) : (
          !result.practice && result.missed.length > 0 && (
            <Link href="/app/vocabulary/review" className="w-full min-h-12 rounded-2xl bg-accent text-on-accent font-bold inline-flex items-center justify-center gap-2 hover:bg-accent-hover">
              {c.reviewNow} <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )
        )}
        <button type="button" onClick={onAgain} className="w-full min-h-12 rounded-2xl border border-border bg-bg text-ink font-semibold inline-flex items-center justify-center gap-2 hover:border-accent/40">
          <RotateCcw size={16} aria-hidden="true" /> {c.again}
        </button>
      </div>
    </section>
  );
}
