'use client';
import { Flame } from 'lucide-react';

const DAY_LABELS = ['D', 'S', 'CH', 'P', 'J', 'SH', 'Y']; // Dush..Yak, 7 harf — mos indeks last7Days bilan

// Amber — spec §3.1/§3.2: butun ilovada faqat streak/kunlik maqsad shu rangda, shuning uchun
// ko'z avtomatik "bugun qildingmi?" savoliga tushadi.
export default function StreakCard({ current, longest, last7Days }) {
  return (
    <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Flame size={13} className="text-amber-500" /> Alanga
      </p>
      <p className="text-3xl font-bold text-slate-800 font-mono tabular-nums leading-none">{current}</p>
      <p className="text-xs text-slate-400 mt-1 mb-4">kun ketma-ket</p>

      <div className="flex gap-1.5 mb-3">
        {last7Days.map((done, i) => (
          <div key={i} className="flex-1 text-center">
            <div
              className={`w-full aspect-square rounded-md ${done ? 'bg-amber-400' : 'bg-slate-100'}`}
              aria-label={done ? "bajarilgan kun" : "o'tkazib yuborilgan kun"}
            />
            <span className="text-[9px] text-slate-400">{DAY_LABELS[i]}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        Rekord: <span className="font-semibold text-slate-600">{longest}</span> kun
      </p>
    </div>
  );
}
