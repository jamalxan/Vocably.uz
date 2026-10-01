'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, Gamepad2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { getWeakWords } from './api';

const SKILL_LABELS = { recall: "Ma'no", listening: 'Eshitish', spelling: 'Imlo', context: 'Kontekst', synonym: 'Sinonim', writing: 'Yozish', speaking: 'Gapirish' };

function accuracyTone(pct) {
  if (pct == null) return 'text-muted';
  if (pct >= 70) return 'text-success';
  if (pct >= 50) return 'text-warning';
  return 'text-danger';
}

// Zaif so'zlar ko'rinishi (TZ §20): aniqlik % + sabablar (past recall, ko'p xato, sekin javob, yomon listening/spelling/context).
export default function WeakWordsView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const ctrl = new AbortController();
    getWeakWords(200)
      .then((d) => !ctrl.signal.aborted && setData(d))
      .catch((e) => !ctrl.signal.aborted && setError(e.message || 'Yuklashda xatolik'));
    return () => ctrl.abort();
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
            <Target size={20} aria-hidden="true" /> Zaif so'zlar
          </h1>
          <p className="text-sm text-muted mt-1">
            {data.total > 0
              ? `${data.total} ta so'z diqqatga muhtoj. Eng zaiflari yuqorida.`
              : "Hozircha zaif so'z yo'q — ajoyib! O'yinlar va takrorlash xatolarni shu yerga yig'adi."}
          </p>
        </div>
        {data.total > 0 && (
          <Link href="/app/oyinlar/multiple_choice?mode=weak" className={buttonClasses({ variant: 'primary' })}>
            <Gamepad2 size={16} aria-hidden="true" /> Zaif so'zlar bilan mashq
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
                <p className="text-[11px] text-muted">aniqlik</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {w.reasonLabels.map((r) => (
                <Badge key={r} tone="warning" className="normal-case tracking-normal">
                  {r}
                </Badge>
              ))}
              {w.isLeech && <Badge tone="danger">Leech</Badge>}
              {w.primarySkill && (
                <Badge tone="neutral" className="normal-case tracking-normal">
                  Eng zaif: {SKILL_LABELS[w.primarySkill] || w.primarySkill}
                </Badge>
              )}
              <span className="text-xs text-muted ml-auto tabular-nums">{w.attempts} urinish · {w.lapses} marta unutilgan</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
