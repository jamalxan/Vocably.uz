'use client';
import { useEffect, useRef, useState } from 'react';
import { startGame, completeGame } from '@/components/games/api';
import { createAnswerQueue } from '@/components/games/answerQueue';
import { claimGuestMissed, readFx, writeFx, saveGuestMissed } from '@/lib/flagship/client';
import { detectRenderTier } from '@/lib/flagship/gpu';
import { gradeGuest } from '@/lib/flagship/typing';

// Shared plumbing for the typing flagship games (So'z tunneli, Word Defense). Same audience model
// as Vocably Run:
//  - signed in: a regular game session (POST /api/games/:key/start). Questions arrive WITHOUT
//    answers; every typed answer is graded on the server (answer queue, idempotent by qid#attempt);
//    `complete` computes XP once and returns the mistakes.
//  - guest (or a signed-in user with too few words → practice): questions from the public bank,
//    graded on the device with the server's normalisation; no XP.

/** Audience, sound/vibration prefs and render tier, detected once per mount. */
export function useFlagshipAudience(gameKey, onClaimed) {
  const [audience, setAudience] = useState(null); // null (checking) | 'guest' | 'user'
  const [fx, setFx] = useState({ sound: true, vibrate: true });
  const [tier, setTier] = useState('high');
  const fxRef = useRef(fx);
  const claimedRef = useRef(onClaimed);
  useEffect(() => {
    fxRef.current = fx;
  }, [fx]);
  useEffect(() => {
    claimedRef.current = onClaimed;
  }, [onClaimed]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser capabilities once
    setFx(readFx());
    setTier(detectRenderTier());
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
    fetch(`/api/games/${gameKey}/active`, { credentials: 'same-origin', cache: 'no-store' })
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 401) return setAudience('guest');
        setAudience('user');
        const added = await claimGuestMissed();
        if (!cancelled && added > 0) claimedRef.current?.(added);
      })
      .catch(() => !cancelled && setAudience('guest'));
    return () => {
      cancelled = true;
    };
  }, [gameKey]);

  const toggleFx = (k) => {
    const next = { ...fx, [k]: !fx[k] };
    setFx(next);
    writeFx(next);
  };

  return { audience, fx, fxRef, toggleFx, tier, setTier };
}

// Start errors that turn a signed-in round into a practice round on the public bank instead of an
// error screen: too few (typeable) words, or the free plan's daily session limit / a plan gate.
// Practice rounds are graded on the device and never earn XP.
const PRACTICE_REASON = { not_enough_words: 'few_words', no_questions: 'few_words', daily_limit: 'limit', tier: 'limit' };

/**
 * Prepares a round. Returns { qs, session, queue, saveGuest, practice, reason } or throws an
 * ApiError the caller shows. `reason` ('few_words' | 'limit' | null) says why a signed-in player got
 * a practice round. `toQuestion` maps a server question; `guestQuestions()` builds the bank round.
 */
export async function startRound({ gameKey, audience, toQuestion, guestQuestions }) {
  if (audience === 'user') {
    let reason = 'few_words';
    try {
      const session = await startGame(gameKey, { difficulty: 'auto', mode: 'mixed' });
      const qs = (session.questions || []).map(toQuestion);
      if (qs.length) return { qs, session, queue: createAnswerQueue(session.sessionId), saveGuest: false, practice: false, reason: null };
    } catch (e) {
      if (!Object.hasOwn(PRACTICE_REASON, e?.code || '')) throw e;
      reason = PRACTICE_REASON[e.code];
    }
    return { qs: guestQuestions(), session: null, queue: null, saveGuest: false, practice: true, reason };
  }
  return { qs: guestQuestions(), session: null, queue: null, saveGuest: true, practice: false, reason: null };
}

/**
 * Sends one answer through the queue and waits for ITS verdict. A flush that was already in flight
 * when the answer was added does not carry it, so we flush again (bounded) until it is graded.
 * Resolves to { r } (r = the server result, or null when offline / rejected) plus `fatal` when the
 * session itself is gone (expired / already completed) — no later answer can count either.
 */
async function gradeViaQueue(queue, answer) {
  queue.add(answer);
  const attempt = answer.attempt || 1;
  for (let i = 0; i < 3; i++) {
    const res = await queue.flush();
    const r = res.results.find((x) => x.qid === answer.qid && (x.attempt ?? attempt) === attempt);
    if (r) return { r: r.error ? null : r };
    if (res.fatal) return { r: null, fatal: true };
    if (!res.ok) return { r: null };
  }
  return { r: null };
}

const NO_VERDICT = { ok: null, near: false, correctDisplay: '', fatal: false };

/**
 * Grades a typed answer → { ok, near, correctDisplay, fatal }. ok === null means no verdict arrived
 * in time (the answer stays queued and is still counted on the server if it gets through later);
 * fatal means the server session has ended and the round should end too.
 */
export function gradeTyped(round, q, typed, responseMs, { timeoutMs = 4000 } = {}) {
  if (!round.session) return Promise.resolve({ ...gradeGuest(q, typed), fatal: false });
  const verdict = gradeViaQueue(round.queue, { qid: q.qid, answer: typed, responseMs: Math.round(responseMs), attempt: 1 }).then(({ r, fatal }) =>
    r ? { ok: !!r.isCorrect, near: !!r.near, correctDisplay: r.correctDisplay || '', fatal: false } : { ...NO_VERDICT, fatal: !!fatal }
  );
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(NO_VERDICT), timeoutMs);
  });
  return Promise.race([verdict, timeout]).finally(() => clearTimeout(timer));
}

/** Sends whatever is still queued (bounded: a dead network must not hold the result screen). */
async function drain(queue) {
  for (let i = 0; i < 4 && queue.size; i++) {
    const res = await queue.flush();
    if (!res.ok) return;
  }
}

/**
 * Ends a round. Guests: missed bank words are kept for sign-up. Signed in: drain the queue, complete
 * (XP once, on the server) and use the server's mistake list. Returns { xp, missed, flagged }.
 */
export async function completeRound(round, missed) {
  if (!round.session) {
    if (round.saveGuest && missed.length) saveGuestMissed(missed.map((m) => m.word));
    return { xp: null, flagged: false, missed: missed.map((m) => ({ word: m.word, note: m.note || m.prompt || '', yours: m.yours || '' })) };
  }
  let xp = null;
  let flagged = false;
  let list = missed.map((m) => ({ word: m.word, note: m.prompt || '', yours: m.yours || '' }));
  try {
    await drain(round.queue);
    let r;
    try {
      r = await completeGame(round.session.sessionId);
    } catch (e) {
      if (e?.status !== 0) throw e;
      await new Promise((resolve) => setTimeout(resolve, 1200)); // one retry on a dropped connection
      await drain(round.queue);
      r = await completeGame(round.session.sessionId);
    }
    xp = r?.xp?.earned ?? null;
    flagged = Boolean(r?.notice);
    if (Array.isArray(r?.mistakes)) {
      list = r.mistakes.map((m) => ({ word: m.correctAnswer || m.word || '', note: m.prompt || m.explanation || '', yours: m.yourAnswer || '' }));
    }
  } catch {
    /* the result is still shown; the session expires on its own */
  }
  return { xp, flagged, missed: list };
}

/**
 * Keeps the playing stage exactly inside the visible area above an on-screen keyboard
 * (visualViewport), so the prompt, the scene and the input stay in view on phones.
 */
export function useVisualViewport(active) {
  const [box, setBox] = useState(null);
  useEffect(() => {
    if (!active || typeof window === 'undefined') return undefined;
    const vv = window.visualViewport;
    const update = () => setBox(vv ? { top: vv.offsetTop, height: vv.height } : { top: 0, height: window.innerHeight });
    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.body.style.overflow = prev;
    };
  }, [active]);
  return active ? box : null;
}
