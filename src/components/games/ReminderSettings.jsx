'use client';
import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import Switch from '@/components/ui/Switch';
import { useT } from '@/context/LocaleContext';
import { getReminderPrefs, saveReminderPrefs } from './api';

const FREQ = [
  { key: 'daily', labelKey: 'rem.daily' },
  { key: 'every_2_days', labelKey: 'rem.every2' },
  { key: 'weekly', labelKey: 'rem.weekly' },
];

// Lug'at eslatmalari sozlamasi (TZ §55): yoqish/o'chirish va chastota. Spam bo'lmasligi uchun server kuniga
// ko'pi bilan bitta eslatma yuboradi va bugun o'qigan foydalanuvchiga umuman yubormaydi.
export default function ReminderSettings() {
  const { t } = useT();
  const [prefs, setPrefs] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getReminderPrefs()
      .then((p) => !cancelled && setPrefs(p))
      .catch(() => {}); // sozlama yuklanmasa karta shunchaki ko'rinmaydi
    return () => {
      cancelled = true;
    };
  }, []);

  if (!prefs) return null;

  const update = async (patch) => {
    const prev = prefs;
    setPrefs({ ...prefs, ...patch });
    setError('');
    try {
      setPrefs(await saveReminderPrefs(patch));
    } catch (e) {
      setPrefs(prev);
      setError(e.message || t('rem.saveFail'));
    }
  };

  return (
    <section className="bg-surface border border-border rounded-2xl p-4 shadow-card" aria-labelledby="reminder-settings">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="reminder-settings" className="text-sm font-bold text-ink font-display flex items-center gap-2">
            <BellRing size={16} aria-hidden="true" /> {t('rem.title')}
          </h2>
          <p className="text-xs text-muted mt-0.5">{t('rem.intro')}</p>
        </div>
        <Switch checked={prefs.enabled} onChange={(v) => update({ enabled: v })} aria-label={t('rem.enable')} />
      </div>
      {prefs.enabled && (
        <div className="flex flex-wrap gap-2 mt-3" role="radiogroup" aria-label={t('rem.freqAria')}>
          {FREQ.map((f) => (
            <button
              key={f.key}
              type="button"
              role="radio"
              aria-checked={prefs.frequency === f.key}
              onClick={() => update({ frequency: f.key })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border min-h-11 md:min-h-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                prefs.frequency === f.key ? 'bg-accent text-on-accent border-accent' : 'bg-surface text-ink border-border hover:bg-bg-sunken'
              }`}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
      )}
      {prefs.enabled && (
        <div className="flex items-center justify-between gap-3 mt-3">
          <label htmlFor="reminder-hour" className="text-sm font-semibold text-ink">
            {t('rem.time')} <span className="font-normal text-muted">({prefs.timezone})</span>
          </label>
          <select
            id="reminder-hour"
            value={prefs.sendHour}
            onChange={(e) => update({ sendHour: Number(e.target.value) })}
            className="px-3 py-2 min-h-11 md:min-h-0 border border-border rounded-lg text-sm bg-surface text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            {Array.from({ length: 14 }, (_, i) => 8 + i).map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>
      )}
      {prefs.enabled && (
        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{t('rem.tgAlso')}</p>
            <p className="text-xs text-muted mt-0.5">{prefs.telegramLinked ? t('rem.tgLinked') : t('rem.tgNot')}</p>
          </div>
          <Switch checked={!!prefs.telegram} disabled={!prefs.telegramLinked} onChange={(v) => update({ telegram: v })} aria-label={t('rem.tgEnable')} />
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-danger mt-2">
          {error}
        </p>
      )}
    </section>
  );
}
