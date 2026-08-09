'use client';

// Barcha o'yin/mashq rejimlarining "boshlash oldidan oraliq tanlash" ekrani uchun umumiy forma —
// avval 5 ta komponentda (Flashcard, Match, Test, Listening, WritingTest) so'zma-so'z takrorlangan edi.
export default function RangeSetupForm({ title, range, onRangeChange, onSubmit, buttonLabel = 'Boshlash' }) {
  return (
    <div className="flex flex-col items-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm"
      >
        <h3 className="font-bold text-slate-800 mb-4 font-display">{title}</h3>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-400 w-12">Dan:</span>
            <input
              type="number"
              min={1}
              value={range.from}
              onChange={(e) => onRangeChange({ ...range, from: parseInt(e.target.value) || 1 })}
              className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-400 w-12">Gacha:</span>
            <input
              type="number"
              min={1}
              value={range.to}
              onChange={(e) => onRangeChange({ ...range, to: parseInt(e.target.value) || 1 })}
              className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}
