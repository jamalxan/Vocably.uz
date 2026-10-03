'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, Gamepad2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useT } from '@/context/LocaleContext';
import { getWeakWords } from './api';

const SKILL_KEYS = new Set(['recall', 'listening', 'spelling', 'context', 'synonym', 'writing', 'speaking']);

function accuracyTone(pct) {
  if (pct == null) return 'text-muted';
  if (pct >= 70) return 'text-success';
  if (pct >= 50) return 'text-warning';
  return 'text-danger';
}

// Zaif so'zlar ko'rinishi (TZ §20): aniqlik % + sabablar (past recall, ko'p xato, sekin javob, yomon listening/spelling/context).
// Sabab nomlari serverdan (uz) keladi va `ts()` bilan tarjima qilinadi.
export default function WeakWordsView() {
  const { t, ts } = useT();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const ctrl = new AbortController();
    getWeakWords(200)
      .then((d) => !ctrl.signal.aborted && setData(d))
      .catch((e) => !ctrl.signal.aborted && setError(e.message || t('hub.loadError')));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <p role="alert" className="text-sm text-danger bg-danger-soft border border-danger/30 rounded-xl px-4 py-3">
        {error}
      </p>
    );
  }
  if (!data) {
    return (
      <div className="grid gap-3" aria-busy="true">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-ink font-display flex items-center gap-2">
            <Target size={20} aria-hidden="true" /> {t('hub.statWeak')}
          </h1>
          <p className="text-sm text-muted mt-1">{data.total > 0 ? t('weak.count', { n: data.total }) : t('weak.none')}</p>
        </div>
        {data.total > 0 && (
          <Link href="/app/oyinlar/multiple_choice?mode=weak" className={buttonClasses({ variant: 'primary' })}>
            <Gamepad2 size={16} aria-hidden="true" /> {t('coach.actionWeak')}
          </Link>
        )}
      </div>

      <ul className="grid gap-3">
        {data.words.map((w) => (
          <li key={w.wordId} className="bg-surface border border-border rounded-2xl p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold text-ink break-words">{w.word}</p>
                <p className="text-sm text-muted break-words">{w.translations.join(', ')}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-xl font-bold font-display tabular-nums ${accuracyTone(w.accuracy)}`}>{w.accuracy == null ? '—' : `${w.accuracy}%`}</p>
                <p className="text-[11px] text-muted">{t('weak.accuracy')}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {w.reasonLabels.map((r) => (
                <Badge key={r} tone="warning" className="normal-case tracking-normal">
                  {ts(r)}
                </Badge>
              ))}
              {w.isLeech && <Badge tone="danger">Leech</Badge>}
              {w.primarySkill && (
                <Badge tone="neutral" className="normal-case tracking-normal">
                  {t('weak.hardest', { skill: SKILL_KEYS.has(w.primarySkill) ? t(`weak.skill.${w.primarySkill}`) : w.primarySkill })}
                </Badge>
              )}
              <span className="text-xs text-muted ml-auto tabular-nums">{t('weak.attempts', { a: w.attempts, b: w.lapses })}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
