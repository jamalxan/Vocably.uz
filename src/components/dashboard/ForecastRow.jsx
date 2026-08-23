'use client';

const DAY_SHORT = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

// Keyingi 7 kunda qancha so'z due bo'lishini oldindan ko'rsatadi (spec §5.2 Blok 8) —
// foydalanuvchi ertangi ish hajmini oldindan rejalashtirishi uchun.
export default function ForecastRow({ forecast }) {
  const max = Math.max(1, ...forecast.map((f) => f.dueCount));

  return (
    <div className="bg-cherry-950/40 rounded-2xl shadow-admin-card border border-cherry-800/60 p-5">
      <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-4">Kelgusi yuk (7 kun)</p>
      <div className="flex items-end gap-2 h-24">
        {forecast.map((f) => {
          const d = new Date(`${f.date}T00:00:00`);
          const heightPct = f.dueCount > 0 ? Math.max(8, (f.dueCount / max) * 100) : 4;
          return (
            <div key={f.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[11px] font-mono tabular-nums text-alabaster-500">{f.dueCount || ''}</span>
              <div
                className={`w-full rounded-md ${f.dueCount > 0 ? 'bg-racing-700' : 'bg-coffee-950/60'}`}
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[10px] text-alabaster-600">{DAY_SHORT[d.getDay()]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
