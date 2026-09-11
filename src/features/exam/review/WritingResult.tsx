'use client';
import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { gradeWriting } from '../state/attemptsApi';
import type { AttemptResult, WritingScore } from '@/lib/exam/types';

// TZ-vocably-v2.md §19 Faza 2 item 13 — AI grader natijasi. `result.writing`
// bo'lmasa (AI vaqtincha ishlamay qolgan bo'lishi mumkin — attempt.status
// server tomonda 'submitted'da qolgan, gradeWritingAttempt() qayta chaqirilsa
// baribir ishlaydi, TZ §8.5 "bir matn ikki marta baholanmaydi" — muvaffaqiyatli
// bo'lgandan keyingina 'graded'ga o'tadi) — "Qayta baholash" tugmasi ko'rsatiladi.
export interface WritingResultProps {
  attemptId: string;
  result: AttemptResult | null;
  onRegraded: (result: AttemptResult | null) => void;
}

function CriterionRow({ label, band, note }: { label: string; band: number; note: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {note && <p className="text-xs text-muted mt-0.5">{note}</p>}
      </div>
      <span className="flex-shrink-0 text-sm font-bold text-brand-text tabular-nums">{band.toFixed(1)}</span>
    </div>
  );
}

function TaskCard({ title, score }: { title: string; score: WritingScore }) {
  return (
    <div className="border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-ink">{title}</p>
        <p className="text-2xl font-bold text-brand-text tabular-nums">{score.band.toFixed(1)}</p>
      </div>
      <p className="text-sm text-muted mb-3">{score.feedbackUz}</p>
      <div>
        <CriterionRow label="Task Achievement / Response" band={score.taskAchievement} note={score.criteriaFeedbackUz.taskAchievement} />
        <CriterionRow label="Coherence & Cohesion" band={score.coherenceCohesion} note={score.criteriaFeedbackUz.coherenceCohesion} />
        <CriterionRow label="Lexical Resource" band={score.lexicalResource} note={score.criteriaFeedbackUz.lexicalResource} />
        <CriterionRow label="Grammatical Range & Accuracy" band={score.grammaticalRange} note={score.criteriaFeedbackUz.grammaticalRange} />
      </div>
      {score.corrections.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tuzatishlar</p>
          {score.corrections.map((c, i) => (
            <div key={i} className="text-xs bg-bg rounded-lg p-2.5">
              <p>
                <span className="line-through text-danger">{c.original}</span> → <span className="text-success font-semibold">{c.suggested}</span>
              </p>
              <p className="text-muted mt-1">{c.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WritingResult({ attemptId, result, onRegraded }: WritingResultProps) {
  const [regrading, setRegrading] = useState(false);
  const [error, setError] = useState('');

  const regrade = async () => {
    setRegrading(true);
    setError('');
    try {
      const { result: graded } = await gradeWriting(attemptId);
      onRegraded(graded);
    } catch {
      setError("Baholab bo'lmadi — AI vaqtincha band bo'lishi mumkin. Yana urinib ko'ring.");
    } finally {
      setRegrading(false);
    }
  };

  if (!result?.writing) {
    return (
      <div className="max-w-md mx-auto p-6 sm:p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Writing</p>
        <p className="text-5xl font-bold text-brand-text mt-2">—</p>
        <p className="text-sm text-muted mt-3">
          Insholaringiz saqlandi{result?.timeSpentSec ? ` (${Math.round(result.timeSpentSec / 60)} daqiqada)` : ''}, lekin AI
          baholashda xatolik yuz berdi.
        </p>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
        <button
          onClick={regrade}
          disabled={regrading}
          className="mt-4 mx-auto flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-semibold rounded-lg"
        >
          {regrading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          Qayta baholash
        </button>
      </div>
    );
  }

  const { writing } = result;

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-10 space-y-5">
      <div className="text-center mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Writing natijasi</p>
        <p className="text-5xl font-bold text-brand-text mt-2 tabular-nums">{writing.band.toFixed(1)}</p>
        <p className="text-[11px] text-muted mt-2 max-w-sm mx-auto">
          Bu AI taxminiy bahosi, rasmiy IELTS bali emas.
        </p>
      </div>

      <TaskCard title="Task 1" score={writing.task1} />
      <TaskCard title="Task 2" score={writing.task2} />
    </div>
  );
}
