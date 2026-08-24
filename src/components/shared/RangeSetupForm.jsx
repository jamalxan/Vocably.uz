'use client';

// Barcha o'yin/mashq rejimlarining "boshlash oldidan oraliq tanlash" ekrani uchun umumiy forma —
// avval 5 ta komponentda (Flashcard, Match, Test, Listening, WritingTest) so'zma-so'z takrorlangan edi.
export default function RangeSetupForm({ title, range, onRangeChange, onSubmit, buttonLabel = 'Boshlash', maxWords }) {
  // Foydalanuvchi mavjud so'zlar sonidan katta qiymat kiritsa, boshlashda jim-jimgina eng
  // yaqin mumkin bo'lgan songa moslashtiriladi (mos komponentda `Math.min(all.length, range.to)`) —
  // shu haqda oldindan xabar berish uchun mavjud son ko'rsatiladi va input shu songa cheklanadi.
  const hasMax = typeof maxWords === 'number' && maxWords > 0;
  return (
    <div className="flex flex-col items-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card"
      >
        <h3 className="font-bold text-primary mb-4 font-display">{title}</h3>
        <div className="space-y-3 mb-2">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-muted w-12">Dan:</span>
            <input
              type="number"
              min={1}
              max={hasMax ? maxWords : undefined}
              value={range.from}
              onChange={(e) => onRangeChange({ ...range, from: parseInt(e.target.value) || 1 })}
              className="flex-1 px-3 py-1.5 bg-bg border border-border rounded-lg text-sm text-primary outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-muted w-12">Gacha:</span>
            <input
              type="number"
              min={1}
              max={hasMax ? maxWords : undefined}
              value={range.to}
              onChange={(e) => onRangeChange({ ...range, to: parseInt(e.target.value) || 1 })}
              className="flex-1 px-3 py-1.5 bg-bg border border-border rounded-lg text-sm text-primary outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>
        <p className="text-[11px] text-muted mb-4 min-h-[1em]">
          {hasMax && `Jami ${maxWords} ta so'z mavjud — bundan katta qiymat avtomatik shu songa moslashtiriladi.`}
        </p>
        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-hover text-on-accent font-semibold py-3 rounded-xl text-sm transition-colors shadow-glow"
        >
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}
