'use client';
import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { gradeSpeaking } from '../state/attemptsApi';
import type { AttemptResult } from '@/lib/exam/types';

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
  const [regrading, setRegrading] = useState(false);
  const [error, setError] = useState('');

  const regrade = async () => {
    setRegrading(true);
    setError('');
    try {
      const { result: graded } = await gradeSpeaking(attemptId);
      onRegraded(graded);
    } catch {
      setError("Baholab bo'lmadi — AI vaqtincha band bo'lishi mumkin. Yana urinib ko'ring.");
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
          Javoblaringiz saqlandi{result?.timeSpentSec ? ` (${Math.round(result.timeSpentSec / 60)} daqiqada)` : ''}, lekin AI
          baholashda xatolik yuz berdi.
        </p>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
        <Button type="button" onClick={regrade} disabled={regrading} className="mt-4">
          {regrading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          Qayta baholash
        </Button>
      </div>
    );
  }

  const s = result.speaking;

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-10 space-y-5">
      <div className="text-center mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Speaking natijasi</p>
        <p className="text-5xl font-bold text-brand-text mt-2 tabular-nums">{s.band.toFixed(1)}</p>
        <p className="text-[11px] text-warning bg-warning-soft inline-block rounded-lg px-3 py-1.5 mt-3">
          {s.pronunciation
            ? '⚠️ Talaffuz bahosi AI (audio) asosida — rasmiy IELTS pronunciation assessment emas, taxminiy baho.'
            : '⚠️ Talaffuz balli fonema darajasida emas — faqat matn (Whisper transkripti) asosidagi taxminiy kuzatuv.'}
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
            <p className="text-[11px] font-semibold text-muted uppercase mb-0.5">Talaffuz (taxminiy)</p>
            <p className="text-xs text-muted">{s.pronunciationNote}</p>
          </div>
        )}
      </div>

      {s.strengths.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-ink mb-2">Kuchli tomonlar</p>
          <ul className="text-xs text-muted list-disc list-inside space-y-1">
            {s.strengths.map((st, i) => (
              <li key={i}>{st}</li>
            ))}
          </ul>
        </div>
      )}

      {s.corrections.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-ink mb-2">Tuzatishlar</p>
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
          <p className="text-xs font-semibold text-ink mb-2">Keyingi qadamlar</p>
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
