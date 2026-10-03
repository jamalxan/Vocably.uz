// Browsers' ICU data has no Uzbek month names: `toLocaleDateString('uz-UZ',
// { month: 'long' })` renders "M10" instead of "oktabr" (Chromium/Node). Use
// this wherever a date shows a month name.
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

/** Til bo'yicha: ru — "29 сентября" (Intl biladi), boshqasi — formatUzDate ("29-sentabr"). */
export function formatDateLocale(locale, date, opts = {}) {
  if (locale !== 'ru') return formatUzDate(date, opts);
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const { year = false, timeZone = 'Asia/Tashkent' } = opts;
  return new Intl.DateTimeFormat('ru-RU', { timeZone, day: 'numeric', month: 'long', ...(year ? { year: 'numeric' } : {}) }).format(d);
}

/** "29-sentabr" / "29-sentabr, 2026" in Asia/Tashkent by default. */
export function formatUzDate(date, { year = false, timeZone = 'Asia/Tashkent' } = {}) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d);
  const get = (type) => Number(parts.find((p) => p.type === type)?.value);
  const text = `${get('day')}-${MONTHS[get('month') - 1]}`;
  return year ? `${text}, ${get('year')}` : text;
}
