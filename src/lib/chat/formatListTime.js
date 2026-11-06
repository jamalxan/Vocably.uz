// Suhbatlar ro'yxatidagi vaqt yorlig'i (PARITY_PLAN WP8.10, Telegram): bugun — `HH:mm`, kecha —
// "Kecha", oxirgi 7 kun ichida — hafta kuni (qisqa), undan eski — `dd.MM.yy`.
// Sof funksiya (React'siz) — ro'yxat ham, test ham shu yerdan import qiladi.
const UZ_WEEKDAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
const YESTERDAY = { uz: 'Kecha', en: 'Yesterday', ru: 'Вчера' };
const pad = (n) => String(n).padStart(2, '0');

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * @param {string|number|Date} date  xabar vaqti
 * @param {Date} [now]               "hozir" (test uchun)
 * @param {string} [locale]          'uz' | 'en' | 'ru'
 * @param {{ yesterday?: string }} [labels]  i18n'dan kelgan "Kecha" (bo'lmasa ichki lug'at)
 */
export function formatListTime(date, now = new Date(), locale = 'uz', labels = {}) {
  if (!date) return '';
  const d = new Date(date);
  if (!Number.isFinite(d.getTime())) return '';
  // Kunlar farqi kalendar bo'yicha (yarim tun chegarasi), soatlar farqi bo'yicha emas.
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (days <= 0) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (days === 1) return labels.yesterday || YESTERDAY[locale] || YESTERDAY.en;
  if (days < 7) {
    if (locale === 'uz') return UZ_WEEKDAYS[d.getDay()];
    try {
      return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d);
    } catch {
      return UZ_WEEKDAYS[d.getDay()];
    }
  }
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)}`;
}
