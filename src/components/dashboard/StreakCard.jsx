'use client';
import { Flame, Check } from 'lucide-react';
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
  const activeDays = last7Days.filter(Boolean).length;
  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5 flex flex-col">
      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Flame size={13} className="text-accent" aria-hidden="true" /> {t('dash.flame')}
      </p>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-4xl font-bold text-ink tabular-nums leading-none tracking-tight">{current}</p>
          <p className="text-xs text-muted mt-1.5">{t('dash.daysInRow')}</p>
        </div>
        <div className="relative w-12 h-12 rounded-full grid place-items-center bg-accent-soft text-accent flex-shrink-0" aria-hidden="true">
          <Flame size={22} className={current > 0 ? 'text-accent' : 'text-muted'} />
        </div>
      </div>

      <div className="flex gap-1.5 mt-4 mb-3" role="list" aria-label={t('dash.last7')}>
        {last7Days.map((done, i) => {
          const isToday = i === last7Days.length - 1;
          const dow = dayIndexFor(i, last7Days.length, dates);
          return (
            <div key={i} className="flex-1 text-center" role="listitem">
              <div
                role="img"
                className={`w-full aspect-square rounded-lg grid place-items-center border transition-colors ${
                  done ? 'bg-accent border-accent text-on-accent' : 'bg-bg-sunken/70 border-border/70 text-transparent'
                } ${isToday ? 'ring-2 ring-accent/35 ring-offset-2 ring-offset-surface' : ''}`}
                aria-label={`${isToday ? t('dash.today') : DAY_FULL[dow]}: ${done ? t('dash.done') : t('dash.skipped')}`}
              >
                {done && <Check size={14} strokeWidth={3} aria-hidden="true" />}
              </div>
              <span className={`block mt-1.5 text-[11px] leading-none ${isToday ? 'text-ink font-semibold' : 'text-muted'}`} aria-hidden="true">
                {DAY_SHORT[dow]}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted mt-auto">
        <span className="font-semibold text-ink tabular-nums">{activeDays}/7</span> · {t('dash.record')}{' '}
        <span className="font-semibold text-ink tabular-nums">{longest}</span> {t('dash.recordUnit', { n: longest })}
      </p>
    </div>
  );
}
