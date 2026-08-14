'use client';
import { AlertTriangle } from 'lucide-react';

// Eng ko'p adashilayotgan so'zlar — spec §5.2 Blok 7: "eng qadrli funksiya", chunki
// foydalanuvchi aynan zaif joyini ko'radi va bir tugma bilan ular ustida ishlay boshlaydi.
export default function LeechList({ leeches, onPractice }) {
  if (leeches.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <AlertTriangle size={13} className="text-amber-500" /> Qiynalayotgan so'zlar
      </p>

      <ul className="space-y-1.5 mb-4">
        {leeches.map((w) => (
          <li key={w.wordId} className="flex items-center justify-between text-sm py-1">
            <span className="font-medium text-slate-700 truncate">{w.word}</span>
            <span className="text-xs text-red-500 font-mono tabular-nums flex-shrink-0 ml-3">{w.lapses} xato</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onPractice(leeches)}
        className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
      >
        Shularni mashq qilish
      </button>
    </div>
  );
}
