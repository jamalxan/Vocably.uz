'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Swords, Shuffle, UserPlus, Link2, Trophy, Loader2, ChevronRight } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { DUEL_COPY, fill } from './duelCopy';

// So'z dueli hub (TZ 2.0 §6.8.4): rating, three ways to start, and my recent duels.

function statusLabel(d, c) {
  if (d.canJoin) return { text: c.invitedYou, tone: 'accent' };
  if (d.canPlay) return { text: c.yourTurn, tone: 'accent' };
  if (d.status === 'finished' && d.winner) {
    if (d.winner === 'draw') return { text: c.draw, tone: 'muted' };
    return d.winner === d.side ? { text: c.won, tone: 'success' } : { text: c.lost, tone: 'danger' };
  }
  if (d.status === 'expired') return { text: c.expired, tone: 'muted' };
  if (d.status === 'declined') return { text: c.declined, tone: 'muted' };
  return { text: c.waitingOpponent, tone: 'muted' };
}
const TONE = { accent: 'text-accent', success: 'text-success', danger: 'text-danger', muted: 'text-muted' };

export default function DuelHub() {
  const c = useCopy(DUEL_COPY);
  const router = useRouter();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/duels', { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then(setData)
      .catch(() => {
        if (!ctrl.signal.aborted) setError(c.error);
      });
    return () => ctrl.abort();
  }, [c.error]);

  const start = async (mode) => {
    setBusy(mode);
    setError('');
    try {
      const r = await fetch('/api/duels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'friend' ? { mode, username } : { mode }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || c.error);
      router.push(`/app/duel/${j.duel.code}`);
    } catch (e) {
      setError(e.message || c.error);
      setBusy('');
    }
  };

  const s = data?.stats;
  return (
    <div className="space-y-5" data-testid="duel-hub">
      <header className="rounded-2xl bg-primary text-on-primary p-5 sm:p-6 shadow-premium relative overflow-hidden">
        <Swords size={140} strokeWidth={1} className="absolute -right-6 -bottom-10 text-on-primary/10 pointer-events-none" aria-hidden="true" />
        <h1 className="text-2xl font-bold font-display flex items-center gap-2 relative">
          <Swords size={24} aria-hidden="true" /> {c.title}
        </h1>
        <p className="text-sm text-on-primary/80 mt-1 max-w-lg relative">{c.tagline}</p>
        <div className="mt-4 flex items-end gap-4 relative">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-on-primary/70 font-semibold flex items-center gap-1">
              <Trophy size={12} aria-hidden="true" /> {c.rating}
            </p>
            <p className="text-3xl font-bold tabular-nums" data-testid="duel-rating">{s ? s.rating : '—'}</p>
          </div>
          {s && <p className="text-xs text-on-primary/75 pb-1 tabular-nums">{fill(c.record, { w: s.wins, d: s.draws, l: s.losses })}</p>}
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => start('random')}
          disabled={!!busy}
          className="text-left rounded-2xl border border-border bg-surface shadow-card p-4 hover:border-accent/40 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="w-10 h-10 rounded-xl bg-accent text-on-accent grid place-items-center">
            {busy === 'random' ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Shuffle size={18} aria-hidden="true" />}
          </span>
          <span className="block text-sm font-bold text-ink mt-3">{c.random}</span>
          <span className="block text-xs text-muted mt-0.5">{c.randomHint}</span>
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim()) start('friend');
          }}
          className="rounded-2xl border border-border bg-surface shadow-card p-4"
        >
          <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent grid place-items-center">
            <UserPlus size={18} aria-hidden="true" />
          </span>
          <label htmlFor="duel-username" className="block text-sm font-bold text-ink mt-3">{c.friend}</label>
          <span className="block text-xs text-muted mt-0.5">{c.friendHint}</span>
          <div className="flex gap-2 mt-2">
            <input
              id="duel-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={c.usernamePh}
              autoComplete="off"
              maxLength={33}
              className="min-w-0 flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button type="submit" disabled={!!busy || !username.trim()} className="rounded-xl bg-accent text-on-accent text-sm font-semibold px-3 disabled:opacity-50">
              {busy === 'friend' ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : c.invite}
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={() => start('link')}
          disabled={!!busy}
          className="text-left rounded-2xl border border-border bg-surface shadow-card p-4 hover:border-accent/40 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent grid place-items-center">
            {busy === 'link' ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Link2 size={18} aria-hidden="true" />}
          </span>
          <span className="block text-sm font-bold text-ink mt-3">{c.link}</span>
          <span className="block text-xs text-muted mt-0.5">{c.linkHint}</span>
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 text-danger text-sm px-3.5 py-2.5" data-testid="duel-error">
          {error}
        </p>
      )}

      <section aria-labelledby="duel-list-h">
        <h2 id="duel-list-h" className="text-sm font-bold text-ink mb-2">{c.myDuels}</h2>
        {!data ? (
          !error && (
            <div className="h-24 grid place-items-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted" aria-hidden="true" />
            </div>
          )
        ) : data.duels.length === 0 ? (
          <p className="text-sm text-muted rounded-2xl border border-dashed border-border p-5 text-center">{c.none}</p>
        ) : (
          <ul className="space-y-2" data-testid="duel-list">
            {data.duels.map((d) => {
              const st = statusLabel(d, c);
              const action = d.canPlay || d.canJoin;
              return (
                <li key={d.code}>
                  <Link
                    href={`/app/duel/${d.code}`}
                    className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 bg-surface hover:border-accent/40 ${action ? 'border-accent/40' : 'border-border'}`}
                  >
                    <Swords size={16} className="text-muted flex-shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink truncate">
                        {c.vs} {d.opponent?.name || c.unknown}
                      </span>
                      <span className={`block text-xs font-semibold ${TONE[st.tone]}`}>{st.text}</span>
                    </span>
                    {d.status === 'finished' && d.me && d.opponent?.score != null && (
                      <span className="text-sm font-bold tabular-nums text-ink">
                        {d.me.score} : {d.opponent.score}
                      </span>
                    )}
                    {action ? (
                      <span className="rounded-lg bg-accent text-on-accent text-xs font-semibold px-2.5 py-1">{c.play}</span>
                    ) : (
                      <ChevronRight size={15} className="text-muted" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
