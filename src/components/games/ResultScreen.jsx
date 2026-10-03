'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Trophy, Flame, Star, RotateCcw, ArrowRight, ListChecks, ChevronDown, ChevronUp, Sparkles, Award } from 'lucide-react';
import Button, { buttonClasses } from '@/components/ui/Button';
import { normalizeForCompare } from '@/lib/textCompare';
import { useT } from '@/context/LocaleContext';

function formatDuration(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function Stat({ label, value, sub }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 text-center">
      <p className="text-2xl font-bold text-ink font-display tabular-nums">{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-muted/80 mt-0.5">{sub}</p>}
    </div>
  );
}

// Xatoni ko'rib chiqish (TZ §43): sizning javobingiz, to'g'ri javob, nima uchun, misol, qayta urinish.
function MistakeItem({ mistake }) {
  const { t } = useT();
  const [retry, setRetry] = useState(false);
  const [value, setValue] = useState('');
  const [done, setDone] = useState(null);

  const check = (e) => {
    e.preventDefault();
    setDone(normalizeForCompare(value) === normalizeForCompare(mistake.correctAnswer));
  };

  return (
    <li className="bg-surface border border-border rounded-xl p-4">
      <p className="text-sm font-semibold text-ink">{mistake.word}</p>
      {mistake.prompt && <p className="text-sm text-muted mt-1 break-words">{mistake.prompt}</p>}
      <dl className="mt-2 grid gap-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-muted flex-shrink-0">{t('res.yourAnswer')}</dt>
          <dd className="text-danger break-words">{mistake.yourAnswer || t('res.noAnswer')}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted flex-shrink-0">{t('q.correctAnswer')}</dt>
          <dd className="text-success font-medium break-words">{mistake.correctAnswer}</dd>
        </div>
        {mistake.explanation && (
          <div className="flex gap-2">
            <dt className="text-muted flex-shrink-0">{t('res.explanation')}</dt>
            <dd className="text-ink break-words">{mistake.explanation}</dd>
          </div>
        )}
      </dl>
      <div className="mt-3">
        {!retry ? (
          <button
            type="button"
            onClick={() => setRetry(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-11 md:min-h-0 rounded-lg border border-border text-xs font-semibold text-ink hover:bg-bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RotateCcw size={13} aria-hidden="true" /> {t('hub.retry')}
          </button>
        ) : (
          <form onSubmit={check} className="flex flex-wrap items-center gap-2">
            <label htmlFor={`retry-${mistake.qid}`} className="sr-only">
              {t('res.typeCorrect')}
            </label>
            <input
              id={`retry-${mistake.qid}`}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setDone(null);
              }}
              autoComplete="off"
              spellCheck={false}
              placeholder={t('res.typeCorrectPlaceholder')}
              className="flex-1 min-w-[160px] px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            />
            <Button size="sm" type="submit" disabled={!value.trim()}>
              {t('q.check')}
            </Button>
            {done != null && (
              <span role="status" className={`text-xs font-semibold ${done ? 'text-success' : 'text-warning'}`}>
                {done ? t('res.well') : t('res.tryAgain')}
              </span>
            )}
          </form>
        )}
      </div>
    </li>
  );
}

export default function ResultScreen({ result, gameTitle, onPlayAgain, onContinueHref = '/app/oyinlar' }) {
  const { t, ts } = useT();
  const [showMistakes, setShowMistakes] = useState(false);
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);

  const xp = result.xp || {};
  const mistakes = useMemo(() => result.mistakes || [], [result.mistakes]);
  const accuracyTone = result.accuracy >= 80 ? 'text-success' : result.accuracy >= 50 ? 'text-warning' : 'text-danger';
  const title = result.completed ? t('res.done') : t('res.ended');
  const uniqueMissed = useMemo(() => new Set(mistakes.map((m) => m.wordId)).size, [mistakes]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-accent-soft text-accent flex items-center justify-center">
          <Trophy size={26} aria-hidden="true" />
        </div>
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-ink font-display focus:outline-none">
          {title}
        </h2>
        <p className="text-sm text-muted mt-1">{gameTitle}</p>
      </div>

      {result.notice && (
        <p role="status" className="mb-4 text-sm text-warning bg-warning-soft border border-warning/30 rounded-xl px-4 py-3">
          {result.notice}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Stat label={t('res.score')} value={result.score} sub={result.maxCombo > 1 ? `Combo ×${result.maxCombo}` : null} />
        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
          <p className={`text-2xl font-bold font-display tabular-nums ${accuracyTone}`}>{result.accuracy}%</p>
          <p className="text-xs text-muted mt-0.5">{t('res.accuracy')}</p>
        </div>
        <Stat label={t('res.correct')} value={`${result.correct}/${result.total}`} />
        <Stat label={t('res.time')} value={formatDuration(result.durationMs)} />
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-x-6 gap-y-2" aria-label={t('res.rewards')}>
        <p className="flex items-center gap-2 text-lg font-bold text-ink">
          <Star size={18} className="text-warning" aria-hidden="true" />
          XP: <span className="text-accent tabular-nums">+{xp.earned || 0}</span>
        </p>
        <p className="text-sm text-muted">
          {t('res.wordsImproved')} <strong className="text-ink">{result.wordsImproved || 0}</strong>
        </p>
        <p className="text-sm text-muted">
          {t('res.weakWords')} <strong className="text-ink">{result.weakWordCount || 0}</strong>
        </p>
        {result.streak?.streak > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Flame size={16} className="text-warning" aria-hidden="true" />
            <strong className="text-ink">{t('res.streakLine', { n: result.streak.streak })}</strong>
            {result.streak.extended && <span className="text-success text-xs">{t('res.extended')}</span>}
          </p>
        )}
      </div>

      {xp.levelUp && (
        <p role="status" className="mb-4 text-sm font-semibold text-accent-hover bg-accent-soft border border-accent/30 rounded-xl px-4 py-3 flex items-center gap-2">
          <Sparkles size={16} aria-hidden="true" />
          {t('res.levelUp', { level: xp.level?.level, name: ts(xp.level?.name) })}
        </p>
      )}

      {(result.questsCompleted?.length > 0 || result.newBadges?.length > 0) && (
        <ul className="mb-4 grid gap-2" aria-label={t('res.newAch')}>
          {(result.questsCompleted || []).map((q) => (
            <li key={q.key} className="flex items-center gap-2 text-sm bg-success-soft text-success border border-success/30 rounded-xl px-4 py-2.5">
              <Award size={16} aria-hidden="true" /> {t('res.questDone', { title: ts(q.title), xp: q.rewardXp ? `(+${q.rewardXp} XP)` : '' })}
            </li>
          ))}
          {(result.newBadges || []).map((b) => (
            <li key={b.key} className="flex items-center gap-2 text-sm bg-info-soft text-info border border-info/30 rounded-xl px-4 py-2.5">
              <span aria-hidden="true">{b.icon}</span> {t('res.newBadge', { label: ts(b.label) })}
            </li>
          ))}
        </ul>
      )}

      {mistakes.length > 0 && (
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowMistakes((v) => !v)}
            aria-expanded={showMistakes}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 min-h-11 rounded-xl border border-border bg-surface text-sm font-semibold text-ink hover:bg-bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex items-center gap-2">
              <ListChecks size={16} aria-hidden="true" /> {t('res.reviewMistakes', { n: mistakes.length, w: uniqueMissed })}
            </span>
            {showMistakes ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          </button>
          {showMistakes && (
            <>
              <p className="text-xs text-muted mt-2 mb-2">{t('res.mistakesNote')}</p>
              <ul className="grid gap-3">
                {mistakes.map((m) => (
                  <MistakeItem key={m.qid} mistake={m} />
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="secondary" onClick={onPlayAgain}>
          <RotateCcw size={16} aria-hidden="true" /> {t('res.playAgain')}
        </Button>
        {mistakes.length > 0 && (
          <Link href="/app/lugat/zaif-sozlar" className={buttonClasses({ variant: 'secondary' })}>
            {t('hub.statWeak')}
          </Link>
        )}
        <Link href={onContinueHref} className={buttonClasses({ variant: 'primary' })}>
          {t('game.resume')} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
