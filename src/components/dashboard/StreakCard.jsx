'use client';
import { Flame } from 'lucide-react';

// Date.getDay() tartibida (0 = Yakshanba). last7Days API'dan "bugun bilan tugaydigan
// oxirgi 7 kun" (eskisidan boshlab) keladi — yorliq sanadan hisoblanadi, qat'iy
// Du..Ya ketma-ketligi emas.
const DAY_SHORT = ['Y', 'D', 'S', 'CH', 'P', 'J', 'SH'];
const DAY_FULL = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

// dates berilmasa (eski javob) — bugundan orqaga sanab chiqamiz.
function dayIndexFor(i, total, dates) {
  if (dates?.[i]) return new Date(`${dates[i]}T00:00:00`).getDay();
  const d = new Date();
  d.setDate(d.getDate() - (total - 1 - i));
  return d.getDay();
}

// Urg'u rangi — spec §3.1/§3.2'ning "faqat streak/kunlik maqsad shu rangda" qoidasi
// ushbu brendda ham davom etadi: ko'z avtomatik "bugun qildingmi?" savoliga tushadi.
export default function StreakCard({ current, longest, last7Days, dates }) {
  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5">
      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Flame size={13} className="text-accent" /> Alanga
      </p>
      <p className="text-3xl font-bold text-ink tabular-nums leading-none">{current}</p>
      <p className="text-xs text-muted mt-1 mb-4">kun ketma-ket</p>

      <div className="flex gap-1.5 mb-3" role="list" aria-label="Oxirgi 7 kun">
        {last7Days.map((done, i) => {
          const isToday = i === last7Days.length - 1;
          const dow = dayIndexFor(i, last7Days.length, dates);
          return (
            <div key={i} className="flex-1 text-center" role="listitem">
              <div
                role="img"
                className={`w-full aspect-square rounded-md ${done ? 'bg-accent' : 'bg-bg'}`}
                aria-label={`${isToday ? 'Bugun' : DAY_FULL[dow]}: ${done ? 'bajarilgan' : "o'tkazib yuborilgan"}`}
              />
              <span className={`block mt-1 text-[11px] leading-none ${isToday ? 'text-ink font-semibold' : 'text-muted'}`} aria-hidden="true">
                {DAY_SHORT[dow]}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted">
        Rekord: <span className="font-semibold text-ink">{longest}</span> kun
      </p>
    </div>
  );
}
