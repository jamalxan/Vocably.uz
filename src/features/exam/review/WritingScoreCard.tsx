'use client';
import type { WritingScore } from '@/lib/exam/types';

// TZ-vocably-v2.md §8.5/§11.2 — Writing bahosi kartasi. Ikkala joyda
// ishlatiladi: WritingResult.tsx (submit'dan darhol keyin) va
// ReviewScreen.tsx (keyinroq, to'liq ko'rib chiqishda) — bir xil ko'rinish,
// shuning uchun bitta umumiy komponent.
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

export interface WritingScoreCardProps {
  title: string;
  score: WritingScore;
  essayText?: string;
}

export default function WritingScoreCard({ title, score, essayText }: WritingScoreCardProps) {
  return (
    <div className="border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-ink">{title}</p>
        <p className="text-2xl font-bold text-brand-text tabular-nums">{score.band.toFixed(1)}</p>
      </div>
      {score.underMinWords && (
        <p className="text-xs text-danger mb-2">
          So&apos;z soni talab qilingan minimaldan kam — Task Achievement bahosi shu sabab jarimalangan.
        </p>
      )}
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
      {essayText && (
        <details className="mt-3">
          <summary className="text-xs font-semibold uppercase tracking-wide text-muted cursor-pointer">Insho matni</summary>
          <p className="text-sm text-ink mt-2 whitespace-pre-wrap">{essayText}</p>
        </details>
      )}
      {score.graderModel && (
        <p className="mt-3 text-[10px] text-muted/70 tabular-nums">
          AI baholadi: {score.graderModel}
          {score.graderVersion ? ` · v${score.graderVersion}` : ''}
        </p>
      )}
    </div>
  );
}
