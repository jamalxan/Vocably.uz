// Do'stlar bo'limida "onlayn" / "oxirgi marta ko'rilgan" matnini hisoblaydi.
// `lastActiveAt` — src/lib/chatAuth.js'dagi requireChatUser() har /api/chat/* so'rovida
// (throttled, 2 daqiqada bir marta) yozadigan vaqt tamg'asi.
const ONLINE_THRESHOLD_MS = 90 * 1000;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function isOnline(lastActiveAt) {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_THRESHOLD_MS;
}

export function formatLastSeen(lastActiveAt) {
  if (!lastActiveAt) return null;
  if (isOnline(lastActiveAt)) return 'Onlayn';

  const diff = Date.now() - new Date(lastActiveAt).getTime();
  if (diff < HOUR_MS) return `${Math.max(1, Math.round(diff / MINUTE_MS))} daqiqa oldin`;
  if (diff < DAY_MS) return `${Math.round(diff / HOUR_MS)} soat oldin`;
  const days = Math.round(diff / DAY_MS);
  if (days < 7) return `${days} kun oldin`;
  return new Date(lastActiveAt).toLocaleDateString('uz-UZ');
}
