'use client';
import { AlertTriangle } from 'lucide-react';

// Eng ko'p adashilayotgan so'zlar — spec §5.2 Blok 7: "eng qadrli funksiya", chunki
// foydalanuvchi aynan zaif joyini ko'radi va bir tugma bilan ular ustida ishlay boshlaydi.
export default function LeechList({ leeches, onPractice }) {
  if (leeches.length === 0) return null;

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5">
      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <AlertTriangle size={13} className="text-accent" /> Qiynalayotgan so'zlar
      </p>

      <ul className="space-y-1.5 mb-4">
        {leeches.map((w) => (
          <li key={w.wordId} className="flex items-center justify-between text-sm py-1">
            <span className="font-medium text-primary truncate">{w.word}</span>
            <span className="text-xs text-accent font-mono tabular-nums flex-shrink-0 ml-3">{w.lapses} xato</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onPractice(leeches)}
        className="w-full px-4 py-2 bg-accent hover:bg-accent-hover text-on-accent rounded-lg text-sm font-semibold transition-colors shadow-glow"
      >
        Shularni mashq qilish
      </button>
    </div>
  );
}
