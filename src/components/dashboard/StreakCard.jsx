'use client';
import { Flame } from 'lucide-react';

const DAY_LABELS = ['D', 'S', 'CH', 'P', 'J', 'SH', 'Y']; // Dush..Yak, 7 harf — mos indeks last7Days bilan

// Urg'u rangi — spec §3.1/§3.2'ning "faqat streak/kunlik maqsad shu rangda" qoidasi
// ushbu brendda ham davom etadi: ko'z avtomatik "bugun qildingmi?" savoliga tushadi.
export default function StreakCard({ current, longest, last7Days }) {
  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5">
      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Flame size={13} className="text-accent" /> Alanga
      </p>
      <p className="text-3xl font-bold text-primary font-mono tabular-nums leading-none">{current}</p>
      <p className="text-xs text-muted mt-1 mb-4">kun ketma-ket</p>

      <div className="flex gap-1.5 mb-3">
        {last7Days.map((done, i) => (
          <div key={i} className="flex-1 text-center">
            <div
              className={`w-full aspect-square rounded-md ${done ? 'bg-accent' : 'bg-bg'}`}
              aria-label={done ? "bajarilgan kun" : "o'tkazib yuborilgan kun"}
            />
            <span className="text-[9px] text-muted">{DAY_LABELS[i]}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted">
        Rekord: <span className="font-semibold text-primary">{longest}</span> kun
      </p>
    </div>
  );
}
