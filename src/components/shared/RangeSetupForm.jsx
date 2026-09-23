'use client';
import { useId, useState } from 'react';
import { Target } from 'lucide-react';

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
  buttonLabel = 'Boshlash',
  maxWords,
  onQuickStart,
  quickStartCount = 0,
  error = '',
}) {
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

  return (
    <div className="flex flex-col items-center">
      {showQuickStart && (
        <button
          onClick={onQuickStart}
          className="w-full max-w-md flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-semibold py-3 rounded-xl text-sm transition-colors shadow-glow mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <Target size={16} />
          Bugungi so'zlar bilan boshlash ({quickStartCount} ta)
        </button>
      )}
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card"
      >
        {showQuickStart && <p className="text-[11px] text-muted mb-3 -mt-1">yoki qo'lda oraliq tanlang:</p>}
        <h3 className="font-bold text-ink mb-4 font-display">{title}</h3>
        <div className="space-y-3 mb-2">
          <div className="flex items-center gap-4">
            <label htmlFor={fromId} className="text-xs font-semibold text-muted w-12">
              Dan:
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
              Gacha:
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
          {hasMax && `Jami ${maxWords} ta so'z mavjud — bundan katta qiymat avtomatik shu songa moslashtiriladi.`}
        </p>
        {(rangeInvalid || error) && (
          <p role="alert" className="text-xs font-medium text-danger mb-3">
            {rangeInvalid ? "\"Dan\" qiymati \"Gacha\" qiymatidan katta bo'lmasligi kerak." : error}
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
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}
