'use client';
import { useEffect } from 'react';
import { Trophy, RotateCcw, X } from 'lucide-react';

// O'yin/mashq tugaganda natijani ko'rsatadigan umumiy modal — avval bu joyda alert() ishlatilardi,
// bu esa ilovaning boshqa qismidagi uslubdan (ConfirmModal, UndoToast) butunlay chetga chiqardi.
export default function SessionCompleteCard({ open, title = 'Yakunlandi!', score, total, onRestart, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 w-full max-w-sm text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
          <Trophy size={26} />
        </div>
        <h3 className="font-bold text-slate-800 font-display text-lg mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-5">
          Natija: <span className="font-bold text-indigo-600">{score}</span>/{total}{' '}
          <span className="text-slate-400">({pct}%)</span>
        </p>
        {children}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
          >
            <X size={15} /> Yopish
          </button>
          <button
            type="button"
            autoFocus
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <RotateCcw size={15} /> Qayta boshlash
          </button>
        </div>
      </div>
    </div>
  );
}
