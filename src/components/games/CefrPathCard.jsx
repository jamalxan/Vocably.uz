'use client';
import { Check } from 'lucide-react';

// TZ §46: lug'at darajasi (CEFR) va IELTS band — ALOHIDA ko'rsatkichlar, bir-biriga tenglashtirilmaydi.
const STEP_STYLE = {
  reached: 'border-success/40 bg-success-soft text-success',
  current: 'border-accent bg-accent-soft text-accent-hover ring-2 ring-accent/30',
  upcoming: 'border-border bg-bg-sunken text-muted',
};

export default function CefrPathCard({ cefrPath, ieltsPath, targetBand }) {
  if (!cefrPath?.steps) return null;
  const { steps, current } = cefrPath;
  const target = Number(targetBand) || null;

  return (
    <section className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card" aria-labelledby="hub-cefr">
      <h2 id="hub-cefr" className="text-lg font-bold text-ink font-display mb-1">
        Lug&apos;at yo&apos;li
      </h2>
      <p className="text-xs text-muted mb-4">
        {current
          ? `Lug'at darajangiz taxminan ${current}. Bu IELTS balli emas — alohida ko'rsatkich.`
          : "Daraja baholanishi uchun CEFR belgisi bor kamida 10 ta so'zni o'rganing."}
      </p>

      <ol className="grid grid-cols-3 sm:grid-cols-6 gap-2" aria-label="CEFR darajalari">
        {steps.map((s) => (
          <li
            key={s.level}
            aria-current={s.status === 'current' ? 'step' : undefined}
            className={`rounded-xl border px-2 py-3 text-center ${STEP_STYLE[s.status]}`}
          >
            <p className="text-base font-bold font-display flex items-center justify-center gap-1">
              {s.level}
              {s.status === 'reached' && <Check size={14} aria-label="erishilgan" />}
            </p>
            <p className="text-[11px] tabular-nums">
              {s.learned}/{s.total} so&apos;z
            </p>
          </li>
        ))}
      </ol>
      {cefrPath.unlabeled > 0 && (
        <p className="mt-2 text-xs text-muted">{cefrPath.unlabeled} ta so&apos;zda CEFR belgisi yo&apos;q (AI bilan boyiting).</p>
      )}

      <h3 className="text-sm font-semibold text-ink mt-5 mb-2">IELTS maqsad yo&apos;li</h3>
      <ol className="flex flex-wrap gap-2" aria-label="IELTS band yo'li">
        {(ieltsPath || []).map((b) => {
          const isTarget = target != null && (b === target || (b === ieltsPath[ieltsPath.length - 1] && target >= b));
          return (
            <li
              key={b}
              aria-current={isTarget ? 'step' : undefined}
              className={`px-3 py-1.5 rounded-lg border text-sm tabular-nums ${isTarget ? 'border-accent bg-accent-soft text-accent-hover font-semibold' : 'border-border bg-bg-sunken text-muted'}`}
            >
              {b === ieltsPath[ieltsPath.length - 1] ? `${b.toFixed(1)}+` : b.toFixed(1)}
              {isTarget && <span className="ml-1 text-[11px]">maqsad</span>}
            </li>
          );
        })}
      </ol>
      {target == null && <p className="mt-2 text-xs text-muted">Maqsad bandini profil sozlamalarida belgilang.</p>}
    </section>
  );
}
