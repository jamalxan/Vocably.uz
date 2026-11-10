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

/** Every request of a signed-in round (each answer flush, complete) is aborted after this long. */
export const REQUEST_TIMEOUT_MS = 8000;
/**
 * The 'finishing' spinner stays up at most about this long, the wait for verdicts still in flight
 * included; then the result screen shows and the save carries on in the background.
 */
export const FINISH_BUDGET_MS = 8000;
const MIN_DEADLINE_MS = 2000;

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
      if (qs.length) {
        const queue = createAnswerQueue(session.sessionId, { requestTimeoutMs: REQUEST_TIMEOUT_MS });
        return { qs, session, queue, saveGuest: false, practice: false, reason: null };
      }
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
export async function gradeViaQueue(queue, answer) {
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/** Worth another try: a dropped or timed-out connection (status 0) or a server error. */
const transient = (e) => e?.status === 0 || e?.status >= 500;

/** completeGame within REQUEST_TIMEOUT_MS (an aborted request fails like a dropped connection). */
function completeWithLimit(sessionId) {
  if (typeof AbortController === 'undefined') return completeGame(sessionId);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  return completeGame(sessionId, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

/**
 * Sends whatever is still queued. A flush that fails for a non-fatal reason (offline, timed out,
 * 5xx) is tried 3 times per stall, 600 then 1200 ms apart (as GamePlayer.finish does); a fatal
 * reply (404 / 409 / 410: the session is gone) ends the drain. Resolves to false when answers are
 * still pending after those tries.
 */
async function drain(queue) {
  let failures = 0;
  while (queue.size) {
    const res = await queue.flush();
    if (res.ok) failures = 0;
    else if (res.fatal) return true;
    else if (++failures >= 3) return false;
    else await wait(600 * failures);
  }
  return true;
}

/**
 * The save of a signed-in round: drain the queue, then complete (XP once, on the server). Answers
 * still pending after the drain's tries are not completed over: a completed session refuses every
 * later answer (409), so they would be lost for good; the result offers "send again" instead
 * (retry: true). The server's complete is idempotent (a second call returns the finalized result),
 * so it is retried once on a dropped connection or a server error.
 */
async function syncRound(round, list) {
  const unsaved = { xp: null, flagged: false, missed: list, retry: true };
  const closed = { xp: null, flagged: false, missed: list, retry: false };
  if (!(await drain(round.queue))) return unsaved;
  let r;
  try {
    r = await completeWithLimit(round.session.sessionId);
  } catch (e) {
    if (!transient(e)) return closed; // 404 / 410: the session expired or was closed, nothing left to save
    await wait(1200);
    try {
      r = await completeWithLimit(round.session.sessionId);
    } catch (e2) {
      return transient(e2) ? unsaved : closed;
    }
  }
  const mistakes = Array.isArray(r?.mistakes)
    ? r.mistakes.map((m) => ({ word: m.correctAnswer || m.word || '', note: m.prompt || m.explanation || '', yours: m.yourAnswer || '' }))
    : list;
  return { xp: r?.xp?.earned ?? null, flagged: Boolean(r?.notice), missed: mistakes, retry: false };
}

/** Starts the round's save, or joins the one still running (never two completes at once). */
function syncOnce(round, list) {
  if (!round.sync) {
    const sync = syncRound(round, list)
      .catch(() => ({ xp: null, flagged: false, missed: list, retry: false })) // never rejects: the result is still shown
      .finally(() => {
        if (round.sync === sync) round.sync = null;
      });
    round.sync = sync;
  }
  return round.sync;
}

/**
 * Ends a round → { xp, flagged, missed, retry }. Guests: missed bank words are kept for sign-up.
 * Signed in: the round's save (syncRound) and the server's mistake list; retry: true means the
 * result has not reached the server yet (the result screen offers "send again", which calls this
 * again and joins a save that is still running). With `deadlineMs` the save is waited for at most
 * that long: past it this resolves at once with the local list, retry: true and `later` (the save,
 * still running in the background; it resolves to the same shape).
 */
export async function completeRound(round, missed, { deadlineMs = 0 } = {}) {
  if (!round.session) {
    if (round.saveGuest && missed.length) saveGuestMissed(missed.map((m) => m.word));
    return { xp: null, flagged: false, missed: missed.map((m) => ({ word: m.word, note: m.note || m.prompt || '', yours: m.yours || '' })), retry: false };
  }
  const list = missed.map((m) => ({ word: m.word, note: m.prompt || '', yours: m.yours || '' }));
  const sync = syncOnce(round, list);
  if (!(deadlineMs > 0)) return sync;
  let timer;
  const deadline = new Promise((resolve) => {
    timer = setTimeout(() => resolve({ xp: null, flagged: false, missed: list, retry: true, later: sync }), deadlineMs);
  });
  return Promise.race([sync, deadline]).finally(() => clearTimeout(timer));
}

/** What is left of FINISH_BUDGET_MS after `elapsedMs` on the finishing spinner, but at least 2 s. */
export function finishDeadline(elapsedMs) {
  return Math.max(MIN_DEADLINE_MS, FINISH_BUDGET_MS - Math.max(0, elapsedMs));
}

/**
 * Resolves once `done()` is true or `timeoutMs` has passed, whichever comes first (checked at once,
 * then every `stepMs`). The games use it to let verdicts that are still held or in flight land
 * before a round's summary is made.
 */
export function waitUntil(done, timeoutMs, stepMs = 50) {
  return new Promise((resolve) => {
    let poll = 0;
    let limit = 0;
    const stop = () => {
      clearTimeout(poll);
      clearTimeout(limit);
      resolve();
    };
    const check = () => {
      if (done()) stop();
      else poll = setTimeout(check, stepMs);
    };
    limit = setTimeout(stop, Math.max(0, timeoutMs));
    check();
  });
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
