'use client';
import { Flame } from 'lucide-react';
import { useT } from '@/context/LocaleContext';

// Date.getDay() tartibida (0 = Yakshanba). last7Days API'dan "bugun bilan tugaydigan
// oxirgi 7 kun" (eskisidan boshlab) keladi — yorliq sanadan hisoblanadi, qat'iy
// Du..Ya ketma-ketligi emas. Kun nomlari i18n kalitlarida (`dash.daysShort/daysFull`, '|' bilan ajratilgan).

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
  const { t } = useT();
  const DAY_SHORT = t('dash.daysShort').split('|');
  const DAY_FULL = t('dash.daysFull').split('|');
  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5">
      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Flame size={13} className="text-accent" /> {t('dash.flame')}
      </p>
      <p className="text-3xl font-bold text-ink tabular-nums leading-none">{current}</p>
      <p className="text-xs text-muted mt-1 mb-4">{t('dash.daysInRow')}</p>

      <div className="flex gap-1.5 mb-3" role="list" aria-label={t('dash.last7')}>
        {last7Days.map((done, i) => {
          const isToday = i === last7Days.length - 1;
          const dow = dayIndexFor(i, last7Days.length, dates);
          return (
            <div key={i} className="flex-1 text-center" role="listitem">
              <div
                role="img"
                className={`w-full aspect-square rounded-md ${done ? 'bg-accent' : 'bg-bg'}`}
                aria-label={`${isToday ? t('dash.today') : DAY_FULL[dow]}: ${done ? t('dash.done') : t('dash.skipped')}`}
              />
              <span className={`block mt-1 text-[11px] leading-none ${isToday ? 'text-ink font-semibold' : 'text-muted'}`} aria-hidden="true">
                {DAY_SHORT[dow]}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted">
        {t('dash.record')} <span className="font-semibold text-ink">{longest}</span> {t('dash.recordUnit', { n: longest })}
      </p>
    </div>
  );
}
