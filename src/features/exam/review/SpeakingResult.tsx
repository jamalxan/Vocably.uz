'use client';
import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { gradeSpeaking } from '../state/attemptsApi';
import type { AttemptResult } from '@/lib/exam/types';
import { useT } from '@/context/LocaleContext';

// TZ-vocably-v2.md §19 Faza 4 item 23 — AI Speaking grader natijasi.
// WritingResult.tsx bilan bir xil naqsh (result.speaking bo'lmasa "Qayta
// baholash" tugmasi — AI vaqtincha band bo'lgan bo'lishi mumkin), lekin
// mezon qatori/kartochka shakli eski (pre-exam-engine) /app/gapirish
// sahifasidagi natija ko'rinishidan ko'chirilgan (SpeakingScore turi ham
// o'sha yerdagi javob shakli bilan ataylab bir xil — speakingGrader.ts'ga q.).
const CRITERIA_LABEL: Record<string, string> = {
  fluencyCoherence: 'Fluency & Coherence',
  lexicalResource: 'Lexical Resource',
  grammaticalRange: 'Grammar',
};

export interface SpeakingResultProps {
  attemptId: string;
  result: AttemptResult | null;
  onRegraded: (result: AttemptResult | null) => void;
}

export default function SpeakingResult({ attemptId, result, onRegraded }: SpeakingResultProps) {
  const { t } = useT();
  const [regrading, setRegrading] = useState(false);
  const [error, setError] = useState('');

  const regrade = async () => {
    setRegrading(true);
    setError('');
    try {
      const { result: graded } = await gradeSpeaking(attemptId);
      onRegraded(graded);
    } catch {
      setError(t('rs.writingErr'));
    } finally {
      setRegrading(false);
    }
  };

  if (!result?.speaking) {
    return (
      <div className="max-w-md mx-auto p-6 sm:p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Speaking</p>
        <p className="text-5xl font-bold text-brand-text mt-2">—</p>
        <p className="text-sm text-muted mt-3">
          {t('sp.saved', { time: result?.timeSpentSec ? t('rs.inMin', { n: Math.round(result.timeSpentSec / 60) }) : '' })}
        </p>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
        <Button type="button" onClick={regrade} disabled={regrading} className="mt-4">
          {regrading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          {t('rs.regrade')}
        </Button>
      </div>
    );
  }

  const s = result.speaking;

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-10 space-y-5">
      <div className="text-center mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('rs.sectionResult', { label: 'Speaking' })}</p>
        <p className="text-5xl font-bold text-brand-text mt-2 tabular-nums">{s.band.toFixed(1)}</p>
        <p className="text-[11px] text-warning bg-warning-soft inline-block rounded-lg px-3 py-1.5 mt-3">
          {s.pronunciation
            ? t('sp.warnAudio')
            : t('sp.warnText')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {(['fluencyCoherence', 'lexicalResource', 'grammaticalRange'] as const).map((key) => (
          <div key={key} className="bg-surface border border-border rounded-xl p-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-muted uppercase mb-0.5">{CRITERIA_LABEL[key]}</p>
              <p className="text-xs text-muted">{s[key].note}</p>
            </div>
            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-accent-soft text-accent text-xs font-bold">{s[key].band}</span>
          </div>
        ))}
        {s.pronunciation ? (
          <div className="bg-surface border border-border rounded-xl p-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-muted uppercase mb-0.5">Pronunciation</p>
              <p className="text-xs text-muted">{s.pronunciation.note}</p>
            </div>
            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-accent-soft text-accent text-xs font-bold">{s.pronunciation.band}</span>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="text-[11px] font-semibold text-muted uppercase mb-0.5">{t('sp.pronApprox')}</p>
            <p className="text-xs text-muted">{s.pronunciationNote}</p>
          </div>
        )}
      </div>

      {s.metrics && <FluencyMetrics m={s.metrics} />}

      {s.strengths.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-ink mb-2">{t('sp.strengths')}</p>
          <ul className="text-xs text-muted list-disc list-inside space-y-1">
            {s.strengths.map((st, i) => (
              <li key={i}>{st}</li>
            ))}
          </ul>
        </div>
      )}

      {s.corrections.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-ink mb-2">{t('rs.corrections')}</p>
          <div className="space-y-1.5">
            {s.corrections.map((c, i) => (
              <p key={i} className="text-xs">
                <span className="line-through text-danger">{c.original}</span> <span className="text-success font-semibold">→ {c.suggestion}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {s.nextStepsUz.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-ink mb-2">{t('sp.nextSteps')}</p>
          <ul className="text-xs text-muted list-disc list-inside space-y-1">
            {s.nextStepsUz.map((st, i) => (
              <li key={i}>{st}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function mmss(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

// Measured, not AI-judged: speech rate, fillers, Part 2 length, variety.
function FluencyMetrics({ m }: { m: NonNullable<NonNullable<AttemptResult['speaking']>['metrics']> }) {
  const { t } = useT();
  const tiles = [
    {
      label: t('sp.m.rate'),
      value: m.wordsPerMinute != null ? `${m.wordsPerMinute}` : '—',
      unit: t('sp.m.rateUnit'),
      ok: m.wordsPerMinute != null && m.wordsPerMinute >= 100 && m.wordsPerMinute <= 185,
      hint: 'Band 7: ~120–160',
    },
    {
      label: t('sp.m.fillers'),
      value: String(m.fillers.total),
      unit: t('sp.m.fillersUnit', { n: m.fillers.per100 }),
      ok: m.fillers.per100 <= 5,
      hint: m.fillers.top.map((f) => `${f.word}×${f.count}`).join(', ') || t('sp.m.none'),
    },
    {
      label: t('sp.m.part2'),
      value: m.part2Sec != null ? mmss(m.part2Sec) : '—',
      unit: '/ 2:00',
      ok: m.part2Sec != null && m.part2Sec >= 90,
      hint: t('sp.m.part2Hint'),
    },
    {
      label: t('sp.m.variety'),
      value: m.lexicalVariety != null ? `${Math.round(m.lexicalVariety * 100)}%` : '—',
      unit: t('sp.m.varietyUnit'),
      ok: m.lexicalVariety == null || m.lexicalVariety >= 0.45,
      hint: t('sp.m.total', { n: m.totalWords }),
    },
  ];
  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-ink mb-3">{t('sp.m.title')}</p>
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((tile) => (
          <div key={tile.label} className={`rounded-xl border p-3 ${tile.ok ? 'border-border bg-bg' : 'border-warning/40 bg-warning-soft'}`}>
            <p className="text-[11px] text-muted">{tile.label}</p>
            <p className="mt-0.5 text-ink">
              <span className="text-xl font-bold tabular-nums">{tile.value}</span> <span className="text-[11px] text-muted">{tile.unit}</span>
            </p>
            <p className="text-[11px] text-muted mt-0.5 truncate">{tile.hint}</p>
          </div>
        ))}
      </div>
      {m.tipsUz.length > 0 && (
        <ul className="mt-3 text-xs text-ink list-disc list-inside space-y-1">
          {m.tipsUz.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      )}
      <p className="text-[10px] text-muted mt-2">{t('sp.m.note')}</p>
    </div>
  );
}
