'use client';
import { useId, useState } from 'react';
import { ChevronDown, Target } from 'lucide-react';
import { useT } from '@/context/LocaleContext';

// Barcha o'yin/mashq rejimlarining "boshlash oldidan oraliq tanlash" ekrani uchun umumiy forma —
// avval 5 ta komponentda (Flashcard, Match, Test, Listening, WritingTest) so'zma-so'z takrorlangan edi.
//
// U1 (VOCABLY-TZ.md 1.2/5.3): "SRS tizimi qaysi so'zlarni takrorlash kerakligini o'zi biladi" —
// shuning uchun `onQuickStart` berilsa, "Dan/Gacha" qo'lda kiritishdan OLDIN, tepada bitta
// tugma bilan bugungi due-navbatni boshlash imkoniyati ko'rsatiladi. Erkin oraliq tanlash forma
// SifATIDA baribir qoladi — ba'zan foydalanuvchi ma'lum bir qismni maqsadli mashq qilmoqchi
// bo'ladi (masalan "faqat oxirgi 20 ta so'z"), bu ham qonuniy holat.
export default function RangeSetupForm({
  title,
  range,
  onRangeChange,
  onSubmit,
  buttonLabel,
  maxWords,
  onQuickStart,
  quickStartCount = 0,
  error = '',
}) {
  const { t } = useT();
  // Foydalanuvchi mavjud so'zlar sonidan katta qiymat kiritsa, boshlashda jim-jimgina eng
  // yaqin mumkin bo'lgan songa moslashtiriladi (mos komponentda `Math.min(all.length, range.to)`) —
  // shu haqda oldindan xabar berish uchun mavjud son ko'rsatiladi va input shu songa cheklanadi.
  const hasMax = typeof maxWords === 'number' && maxWords > 0;
  const showQuickStart = !!onQuickStart && quickStartCount > 0;
  const fromId = useId();
  const toId = useId();
  // Input bo'shatilganda darhol "1" ga qaytmasligi uchun xom matn shu yerda saqlanadi;
  // ota komponentga faqat to'g'ri son uzatiladi, blur'da xom matn tashlanadi.
  const [drafts, setDrafts] = useState({ from: null, to: null });

  const handleChange = (field, raw) => {
    setDrafts((d) => ({ ...d, [field]: raw }));
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 1) onRangeChange({ ...range, [field]: n });
  };
  const handleBlur = (field) => setDrafts((d) => ({ ...d, [field]: null }));

  const rangeInvalid = Number(range.from) > Number(range.to);
  const inputClass =
    'flex-1 min-w-0 px-3 py-2 bg-bg border border-border rounded-lg text-base md:text-sm text-ink outline-none focus:border-accent transition-colors';

  const form = (
    <form onSubmit={onSubmit} className={showQuickStart ? 'pt-4' : 'w-full max-w-md bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-card'}>
        <h3 className="font-bold text-ink mb-4 font-display">{title}</h3>
        <div className="space-y-3 mb-2">
          <div className="flex items-center gap-4">
            <label htmlFor={fromId} className="text-xs font-semibold text-muted w-12">
              {t('lg.from')}
            </label>
            <input
              id={fromId}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={hasMax ? maxWords : undefined}
              value={drafts.from ?? range.from}
              onChange={(e) => handleChange('from', e.target.value)}
              onBlur={() => handleBlur('from')}
              aria-invalid={rangeInvalid || undefined}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor={toId} className="text-xs font-semibold text-muted w-12">
              {t('lg.to')}
            </label>
            <input
              id={toId}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={hasMax ? maxWords : undefined}
              value={drafts.to ?? range.to}
              onChange={(e) => handleChange('to', e.target.value)}
              onBlur={() => handleBlur('to')}
              aria-invalid={rangeInvalid || undefined}
              className={inputClass}
            />
          </div>
        </div>
        <p className="text-[11px] text-muted mb-4 min-h-[1em]">
          {hasMax && t('lg.totalAvail', { n: maxWords })}
        </p>
        {(rangeInvalid || error) && (
          <p role="alert" className="text-xs font-medium text-danger mb-3">
            {rangeInvalid ? t('lg.rangeOrder') : error}
          </p>
        )}
        <button
          type="submit"
          disabled={rangeInvalid}
          className={`w-full font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
            showQuickStart
              ? 'bg-surface border border-accent/40 text-accent hover:bg-accent-soft'
              : 'bg-accent hover:bg-accent-hover text-on-accent shadow-glow'
          }`}
        >
          {buttonLabel || t('diag.start')}
        </button>
    </form>
  );

  if (!showQuickStart) return <div className="flex flex-col items-center">{form}</div>;

  // Due-navbat bor: bitta asosiy harakat (bugungi so'zlar), qo'lda oraliq — yig'ilgan ikkinchi daraja.
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Target size={24} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-3xl font-bold leading-none text-ink">{quickStartCount}</p>
            <p className="mt-1 text-sm text-muted">{t('lugat.dueWords')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onQuickStart}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-on-accent shadow-glow transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {t('lg.setupQuick', { n: quickStartCount })}
        </button>
        <details className="group mt-4 border-t border-border pt-3" open={rangeInvalid || !!error || undefined}>
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg py-1 text-sm font-semibold text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
            {t('lg.setupManual')}
            <ChevronDown size={16} aria-hidden="true" className="motion-safe:transition-transform group-open:rotate-180" />
          </summary>
          {form}
        </details>
      </div>
    </div>
  );
}
