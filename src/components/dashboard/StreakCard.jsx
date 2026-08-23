'use client';
import { Flame } from 'lucide-react';

const DAY_LABELS = ['D', 'S', 'CH', 'P', 'J', 'SH', 'Y']; // Dush..Yak, 7 harf — mos indeks last7Days bilan

// Oltin — spec §3.1/§3.2'ning "faqat streak/kunlik maqsad shu rangda" qoidasi ushbu
// brendda ham davom etadi: butun panelda faqat shu yerda ishlatiladi, ko'z avtomatik
// "bugun qildingmi?" savoliga tushadi.
export default function StreakCard({ current, longest, last7Days }) {
  return (
    <div className="bg-gradient-to-br from-cherry-900/60 to-coffee-800/60 rounded-2xl shadow-admin-card border border-cherry-800/60 p-5">
      <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Flame size={13} className="text-gold-400" /> Alanga
      </p>
      <p className="text-3xl font-bold text-alabaster-50 font-mono tabular-nums leading-none">{current}</p>
      <p className="text-xs text-alabaster-600 mt-1 mb-4">kun ketma-ket</p>

      <div className="flex gap-1.5 mb-3">
        {last7Days.map((done, i) => (
          <div key={i} className="flex-1 text-center">
            <div
              className={`w-full aspect-square rounded-md ${done ? 'bg-gold-500' : 'bg-cherry-950/60'}`}
              aria-label={done ? "bajarilgan kun" : "o'tkazib yuborilgan kun"}
            />
            <span className="text-[9px] text-alabaster-600">{DAY_LABELS[i]}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-alabaster-600">
        Rekord: <span className="font-semibold text-alabaster-300">{longest}</span> kun
      </p>
    </div>
  );
}
