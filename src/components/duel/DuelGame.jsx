'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Swords, Loader2, Check, X, Copy, Send, BookPlus, Trophy, Clock } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { DUEL_COPY, fill, signed, errorText } from './duelCopy';

// One duel (TZ 2.0 §6.8.4): accept → play 10 questions (7 s each, the clock runs on the server)
// → result. The browser never learns the right answer before it has answered.

async function api(path, body) {
  const r = await fetch(path, body === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(j.error || 'error');
    e.code = j.code;
    e.status = r.status;
    throw e;
  }
  return j;
}

function Bar({ endsAt, limitMs }) {
  const [left, setLeft] = useState(() => Math.max(0, endsAt - Date.now()));
  useEffect(() => {
    let raf;
    const tick = () => {
      setLeft(Math.max(0, endsAt - Date.now()));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [endsAt]);
  const pct = Math.max(0, Math.min(100, (left / limitMs) * 100));
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <Clock size={14} className={left < 2000 ? 'text-danger' : 'text-muted'} />
      <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
        <div className={`h-full rounded-full ${left < 2000 ? 'bg-danger' : 'bg-accent'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted w-8 text-right">{Math.ceil(left / 1000)}s</span>
    </div>
  );
}

function Play({ code, c, onDone }) {
  const [q, setQ] = useState(null);
  const [endsAt, setEndsAt] = useState(0);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');
  const busy = useRef(false);
  // Nothing fires after unmount: a "next" request after Back would start the next question's clock.
  const alive = useRef(true);
  const timer = useRef(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const loadNext = useCallback(async () => {
    try {
      const j = await api(`/api/duels/${code}/next`, {});
      if (!alive.current) return;
      if (j.done) return onDone();
      setQ(j.question);
      setEndsAt(Date.now() + j.remainingMs);
      setPicked(null);
      setFeedback(null);
      setError('');
      busy.current = false;
    } catch (e) {
      if (alive.current) setError(errorText(c, e));
      busy.current = false;
    }
  }, [code, onDone, c]);

  useEffect(() => {
    api(`/api/duels/${code}/next`, {})
      .then((j) => {
        if (!alive.current) return;
        if (j.done) return onDone();
        setQ(j.question);
        setEndsAt(Date.now() + j.remainingMs);
      })
      .catch((e) => alive.current && setError(errorText(c, e)));
  }, [code, onDone, c]);

  const answer = useCallback(
    async (choice) => {
      if (!q || busy.current) return;
      busy.current = true;
      setPicked(choice ?? -1); // -1 = time ran out on this device
      const send = () => api(`/api/duels/${code}/answer`, { index: q.index, choice });
      try {
        let r;
        try {
          r = await send();
        } catch (e) {
          if (!(e instanceof TypeError)) throw e;
          r = await send(); // one silent retry on a dropped connection; the server clock decides anyway
        }
        if (!alive.current) return;
        setFeedback(r);
        setScore(r.score);
        timer.current = setTimeout(() => (r.done ? onDone() : loadNext()), r.ok ? 550 : 1000);
      } catch (e) {
        if (!alive.current) return;
        // Already answered (double tap / another tab) → move on.
        if (e.code === 'stale' || e.code === 'finished') loadNext();
        else {
          setError(errorText(c, e));
          busy.current = false;
        }
      }
    },
    [q, code, loadNext, onDone, c]
  );

  // Time up on this device → send "no answer" (graded wrong on the server).
  useEffect(() => {
    if (!q || picked !== null) return undefined;
    const ms = Math.max(0, endsAt - Date.now());
    const id = setTimeout(() => answer(null), ms + 50);
    return () => clearTimeout(id);
  }, [q, endsAt, picked, answer]);

  const retry = (
    <div role="alert" className="rounded-xl bg-danger/10 text-danger text-sm px-3.5 py-2.5 flex items-center justify-between gap-3" data-testid="duel-play-error">
      <span>{error}</span>
      <button type="button" onClick={() => loadNext()} className="shrink-0 rounded-lg border border-danger/40 px-2.5 py-1 text-xs font-semibold">
        {c.retry}
      </button>
    </div>
  );
  if (!q) return error ? retry : <Loader2 className="w-6 h-6 animate-spin text-muted mx-auto" aria-label={c.loading} />;

  return (
    <div className="space-y-4" data-testid="duel-play">
      {error && retry}
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-ink tabular-nums" data-testid="duel-qnum">{fill(c.question, { i: q.index + 1, n: q.total })}</span>
        <span className="text-muted tabular-nums">
          {c.score}: <b className="text-ink">{score}</b>
        </span>
      </div>
      {picked === null ? <Bar endsAt={endsAt} limitMs={q.limitMs} /> : <div className="h-2" />}
      <div className="rounded-2xl bg-primary text-on-primary p-6 text-center">
        <p className="text-xs uppercase tracking-wider text-on-primary/70">{q.dir === 'en_uz' ? c.chooseUz : c.chooseEn}</p>
        <p className="text-3xl font-bold font-display mt-2 break-words" data-testid="duel-prompt">{q.prompt}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-2.5" role="group" aria-label={q.prompt}>
        {q.options.map((o, i) => {
          const isRight = feedback && feedback.correct === i;
          const isWrongPick = feedback && picked === i && !feedback.ok;
          return (
            <button
              key={`${q.index}-${i}`}
              type="button"
              onClick={() => answer(i)}
              disabled={picked !== null}
              data-testid="duel-option"
              className={`min-h-14 rounded-xl border-2 px-4 py-3 text-base font-semibold text-left transition-colors flex items-center justify-between gap-2 ${
                isRight ? 'border-success bg-success-soft text-ink' : isWrongPick ? 'border-danger bg-danger/10 text-ink' : picked === i ? 'border-accent bg-accent-soft text-ink' : 'border-border bg-surface text-ink hover:border-accent/50'
              }`}
            >
              <span className="break-words">{o}</span>
              {isRight && <Check size={18} className="text-success flex-shrink-0" aria-hidden="true" />}
              {isWrongPick && <X size={18} className="text-danger flex-shrink-0" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <p className="h-5 text-center text-sm font-semibold" role="status" aria-live="polite">
        {feedback && (feedback.ok ? <span className="text-success">{fill(c.points, { n: feedback.points })}</span> : picked === -1 || feedback.late ? <span className="text-danger">{c.timeUp}</span> : null)}
      </p>
    </div>
  );
}

function Share({ code, c }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/app/duel/${code}` : `/app/duel/${code}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(c.shareText)}`;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(url).then(() => setCopied(true)).catch(() => {});
        }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink hover:border-accent/40"
      >
        <Copy size={15} aria-hidden="true" /> {copied ? c.copied : c.copy}
      </button>
      <a href={tg} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-[#2AABEE] text-white px-3.5 py-2 text-sm font-semibold hover:opacity-90">
        <Send size={15} aria-hidden="true" /> {c.shareTg}
      </a>
    </div>
  );
}

function Result({ duel, c, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(duel.me.savedWords);
  const [error, setError] = useState('');
  const me = duel.me;
  const opp = duel.opponent;
  const finished = duel.status === 'finished';
  const headline = !finished
    ? null
    : duel.winner === 'draw'
      ? c.itsDraw
      : duel.winner === duel.side
        ? c.youWon
        : c.youLost;

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api(`/api/duels/${duel.code}/save-words`, {});
      setSaved(true);
      onSaved?.();
    } catch (e) {
      setError(errorText(c, e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="duel-result">
      {finished ? (
        <div className={`rounded-2xl p-5 text-center ${duel.winner === duel.side ? 'bg-success-soft' : 'bg-surface border border-border'}`}>
          <Trophy size={28} className={`mx-auto ${duel.winner === duel.side ? 'text-success' : 'text-muted'}`} aria-hidden="true" />
          <p className="text-xl font-bold text-ink mt-1" data-testid="duel-verdict">{headline}</p>
          <div className="mt-3 grid grid-cols-3 items-center gap-2">
            <div>
              <p className="text-xs text-muted">{c.you}</p>
              <p className="text-3xl font-bold tabular-nums text-ink">{me.score}</p>
              <p className="text-xs text-muted">{fill(c.correct, { n: me.correct })}</p>
            </div>
            <p className="text-muted font-semibold">{c.vs}</p>
            <div>
              <p className="text-xs text-muted truncate">{opp?.name}</p>
              <p className="text-3xl font-bold tabular-nums text-ink">{opp?.score}</p>
              <p className="text-xs text-muted">{fill(c.correct, { n: opp?.correct ?? 0 })}</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold flex justify-center gap-3">
            <span className={me.ratingDelta > 0 ? 'text-success' : me.ratingDelta < 0 ? 'text-danger' : 'text-muted'} data-testid="duel-delta">
              {fill(c.ratingDelta, { d: signed(me.ratingDelta) })}
            </span>
            {me.xp > 0 && <span className="text-accent">{fill(c.xp, { n: me.xp })}</span>}
          </p>
          {duel.rated === false && <p className="mt-1 text-xs text-muted">{c.unrated}</p>}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-5">
          {me.finished && (
            <>
              <p className="text-xs uppercase tracking-wider text-muted font-semibold">{c.yourResult}</p>
              <p className="text-3xl font-bold tabular-nums text-ink" data-testid="duel-myscore">{me.score}</p>
              <p className="text-xs text-muted">{fill(c.correct, { n: me.correct })}</p>
              <hr className="my-4 border-border" />
            </>
          )}
          {duel.status === 'expired' ? (
            <p className="text-sm text-muted">{c.expiredBody}</p>
          ) : duel.status === 'declined' ? (
            <p className="text-sm text-muted">{c.declinedBody}</p>
          ) : (
            <>
              <p className="text-sm font-bold text-ink" data-testid="duel-waiting">{opp ? c.waitingTitle : c.noOpponentYet}</p>
              <p className="text-xs text-muted mt-1 mb-3">{c.waitingBody}</p>
              {duel.mode !== 'random' && <Share code={duel.code} c={c} />}
            </>
          )}
        </div>
      )}

      {!me.review && me.finished && !['finished', 'expired', 'declined'].includes(duel.status) && (
        <p className="text-xs text-muted" data-testid="duel-review-locked">{c.reviewLocked}</p>
      )}
      {me.review && (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="text-sm font-bold text-ink mb-2">{c.review}</h2>
          <ul className="divide-y divide-border">
            {me.review.map((r, i) => (
              <li key={i} className="flex items-center gap-2 py-2 text-sm">
                {r.ok ? <Check size={16} className="text-success" aria-label="✓" /> : <X size={16} className="text-danger" aria-label="✗" />}
                <span className="font-semibold text-ink">{r.word}</span>
                <span className="text-muted truncate flex-1">— {r.uz}</span>
                <span className="text-xs tabular-nums text-muted">{r.late ? c.late : r.ms != null ? `${(r.ms / 1000).toFixed(1)}s` : ''}</span>
              </li>
            ))}
          </ul>
          {me.missed > 0 && (
            <div className="mt-3">
              {saved ? (
                <p className="text-sm text-success font-semibold" data-testid="duel-saved">{c.saved}</p>
              ) : (
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent text-on-accent px-3.5 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <BookPlus size={15} aria-hidden="true" />}
                  {fill(c.saveWords, { n: me.missed })}
                </button>
              )}
              {error && <p className="text-sm text-danger mt-2">{error}</p>}
            </div>
          )}
        </section>
      )}

      <Link href="/app/duel" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:border-accent/40">
        <Swords size={15} aria-hidden="true" /> {c.again}
      </Link>
    </div>
  );
}

export default function DuelGame({ code }) {
  const c = useCopy(DUEL_COPY);
  const [duel, setDuel] = useState(null);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('view'); // view | playing
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const j = await api(`/api/duels/${code}`);
      setDuel(j.duel);
      setError('');
      return j.duel;
    } catch (e) {
      setError(e.status === 404 ? c.notFound : errorText(c, e));
      return null;
    }
  }, [code, c]);

  useEffect(() => {
    let on = true;
    api(`/api/duels/${code}`)
      .then((j) => on && setDuel(j.duel))
      .catch((e) => on && setError(e.status === 404 ? c.notFound : errorText(c, e)));
    return () => {
      on = false;
    };
  }, [code, c]);

  // Waiting for the opponent → refresh every 15 s while the tab is visible.
  const waiting = duel && duel.me?.finished && !['finished', 'expired', 'declined'].includes(duel.status);
  useEffect(() => {
    if (!waiting) return undefined;
    const id = setInterval(() => document.visibilityState === 'visible' && load(), 15_000);
    return () => clearInterval(id);
  }, [waiting, load]);

  // Fetch the result first, then leave the game screen; otherwise the stale "Ready?" card flashes.
  const onDone = useCallback(async () => {
    await load();
    setPhase('view');
  }, [load]);

  const act = async (path) => {
    setBusy(true);
    try {
      const j = await api(`/api/duels/${code}/${path}`, {});
      if (path === 'join') {
        setDuel(j.duel);
        setError('');
        setPhase('playing');
      } else await load();
    } catch (e) {
      setError(errorText(c, e));
      if (e.status === 409) await load(); // someone else got in / the invite closed: show the real state
    } finally {
      setBusy(false);
    }
  };

  const banner = error && duel && (
    <p role="alert" className="rounded-xl bg-danger/10 text-danger text-sm px-3.5 py-2.5" data-testid="duel-error">
      {error}
    </p>
  );

  let body;
  if (error && !duel) {
    body = (
      <div className="text-center space-y-3" data-testid="duel-notfound">
        <p className="text-sm text-muted">{error}</p>
        <Link href="/app/duel" className="text-accent font-semibold hover:underline">{c.back}</Link>
      </div>
    );
  } else if (!duel) {
    body = <Loader2 className="w-6 h-6 animate-spin text-muted mx-auto" aria-label={c.loading} />;
  } else if (phase === 'playing') {
    body = <Play code={code} c={c} onDone={onDone} />;
  } else if (duel.canJoin) {
    body = (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center space-y-3" data-testid="duel-join">
        <Swords size={32} className="text-accent mx-auto" aria-hidden="true" />
        <p className="text-lg font-bold text-ink">{fill(c.challenge, { name: duel.opponent?.name || c.unknown })}</p>
        <p className="text-sm text-muted">{c.joinBody}</p>
        <div className="flex justify-center gap-2 pt-1">
          <button type="button" onClick={() => act('join')} disabled={busy} className="rounded-xl bg-accent text-on-accent px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
            {c.accept}
          </button>
          {duel.canDecline && (
            <button type="button" onClick={() => act('decline')} disabled={busy} className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-ink">
              {c.decline}
            </button>
          )}
        </div>
      </div>
    );
  } else if (duel.canPlay) {
    const started = !!duel.me?.started;
    body = started ? (
      <Play code={code} c={c} onDone={onDone} />
    ) : (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center space-y-3" data-testid="duel-ready">
        <p className="text-lg font-bold text-ink">{c.readyTitle}</p>
        <p className="text-sm text-muted">{c.readyBody}</p>
        {duel.opponent && <p className="text-sm text-ink">{c.vs} <b>{duel.opponent.name}</b> · {duel.opponent.rating}</p>}
        <button type="button" onClick={() => setPhase('playing')} className="rounded-xl bg-accent text-on-accent px-6 py-2.5 text-sm font-semibold">
          {c.start}
        </button>
      </div>
    );
  } else if (duel.me) {
    body = <Result duel={duel} c={c} onSaved={load} />;
  } else {
    // Not a player: the link was already taken, the invite expired, or it was declined.
    const text = duel.status === 'expired' ? c.expiredBody : duel.status === 'declined' ? c.declinedBody : c.closedBody;
    body = (
      <div className="text-center space-y-3" data-testid="duel-closed">
        <p className="text-sm text-muted">{text}</p>
        <Link href="/app/duel" className="text-accent font-semibold hover:underline">{c.back}</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink flex items-center gap-2">
        <Swords size={18} className="text-accent" aria-hidden="true" /> {c.title}
      </h1>
      {banner}
      {body}
    </div>
  );
}
