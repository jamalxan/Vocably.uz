import { LAST_ACTIVE_THROTTLE_MS } from './chatConstants';

// Do'stlar bo'limida "onlayn" / "oxirgi marta ko'rilgan" matnini hisoblaydi.
// `lastActiveAt` — src/lib/chatAuth.js'dagi requireChatUser() har /api/chat/* so'rovida
// (throttled, LAST_ACTIVE_THROTTLE_MS'da bir marta) yozadigan vaqt tamg'asi.
//
// MUHIM (avvalgi xato manbai): "onlayn" chegarasi throttle oralig'idan KICHIK bo'lsa,
// faol foydalanuvchi ham — hujjat hali qayta yozilmagan throttle oynasi ichida —
// vaqtincha "2 daqiqa oldin" bo'lib ko'rinib turardi, garchi u aynan shu daqiqada
// sahifada bo'lsa ham. Shuning uchun chegara throttle oralig'idan har doim KATTA
// bo'lishi shart (+bir oz zaxira tarmoq kechikishi uchun).
const ONLINE_THRESHOLD_MS = LAST_ACTIVE_THROTTLE_MS + 60 * 1000; // throttle (2d) + 1d zaxira
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// `liveOnline` — realtime-server socket ulanishidan olingan ANIQ holat (true/false),
// src/context/ChatContext.jsx'dagi `livePresence` xaritasidan keladi. Mavjud bo'lsa
// (boolean) har doim ustuvor — bu "hozir aynan ulanganmi" degan haqiqiy signal,
// `lastActiveAt` esa faqat throttled taxmin. Socket yo'q/hali javob bermagan bo'lsa
// (undefined) — eski taxminga tushamiz.
export function isOnline(lastActiveAt, liveOnline) {
  if (typeof liveOnline === 'boolean') return liveOnline;
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_THRESHOLD_MS;
}

export function formatLastSeen(lastActiveAt, liveOnline) {
  if (isOnline(lastActiveAt, liveOnline)) return 'Onlayn';
  if (!lastActiveAt) return null;

  const diff = Date.now() - new Date(lastActiveAt).getTime();
  if (diff < HOUR_MS) return `${Math.max(1, Math.round(diff / MINUTE_MS))} daqiqa oldin`;
  if (diff < DAY_MS) return `${Math.round(diff / HOUR_MS)} soat oldin`;
  const days = Math.round(diff / DAY_MS);
  if (days < 7) return `${days} kun oldin`;
  return new Date(lastActiveAt).toLocaleDateString('uz-UZ');
}
