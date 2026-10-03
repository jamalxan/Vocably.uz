// Keyingi takrorlash intervalini qisqa matn qiladi (daq/soat/kun/oy/yil) — `t` i18n funksiyasi bilan (uz/ru).
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatInterval(ms, t) {
  if (ms < HOUR_MS) return t('hub.minShort', { n: Math.max(1, Math.round(ms / MINUTE_MS)) });
  if (ms < DAY_MS) return t('time.hour', { n: Math.round(ms / HOUR_MS) });
  const days = ms / DAY_MS;
  if (days < 30) return t('time.day', { n: Math.round(days) });
  if (days < 365) return t('lg.durMonth', { n: Math.round(days / 30) });
  return t('lg.durYear', { n: Math.round(days / 365) });
}
