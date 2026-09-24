import { useEffect, useState } from 'react';
import { LAST_ACTIVE_THROTTLE_MS } from './chatConstants';

// formatLastSeen/isOnline har render'da Date.now()'dan qayta hisoblanadi, lekin
// hech qanday boshqa holat o'zgarmasa (yangi xabar, typing va h.k.) component
// qayta render bo'lmaydi — natijada "5 daqiqa oldin" matni yangi xabar kelguncha
// "muzlab qolgandek" ko'rinadi (avvalgi xato manbai — real vaqtda yangilanmasdi).
// Shu hook har `intervalMs'da bitta mayda state o'zgarishi orqali qayta render'ni
// majburlaydi (ConversationView.jsx, ConversationList.jsx foydalanadi).
export function useLiveClock(intervalMs = 30000) {
  const [, forceRender] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceRender((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

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

// Suhbatlar ro'yxatidagi "oxirgi xabar qachon" vaqt yorlig'i uchun — TZ-vocably-v2.md
// BUG-4 (chat UI audit): avval ConversationList o'zining qisqa, probelsiz formatini
// ishlatardi ("3kun", "19s"), formatLastSeen esa to'liq so'zli format ("19 daqiqa
// oldin") — ikkalasi bir ekranda ko'ringanda nomuvofiq edi. Endi ikkalasi ham shu
// bitta formatga tayanadi.
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < MINUTE_MS) return 'hozir';
  if (diff < HOUR_MS) return `${Math.round(diff / MINUTE_MS)} daqiqa oldin`;
  if (diff < DAY_MS) return `${Math.round(diff / HOUR_MS)} soat oldin`;
  const days = Math.round(diff / DAY_MS);
  if (days < 7) return `${days} kun oldin`;
  return new Date(dateStr).toLocaleDateString('uz-UZ');
}

// C-07 — suhbat sarlavhasidagi status matni. Ilgari (yoki boshqa joyda ishlatilsa)
// faqat qisqa nisbiy vaqt ("19 daqiqa oldin") qaytarardi — ConversationView'da
// username ostida bitta o'zi turgach, ma'nosi tushunarsiz edi ("nima 19 daqiqa
// oldin?"). Endi Telegram uslubidagi to'liq jumla: "oxirgi marta ko'rilgan …".
export function formatLastSeen(lastActiveAt, liveOnline) {
  if (isOnline(lastActiveAt, liveOnline)) return 'Onlayn';
  if (!lastActiveAt) return null;

  const diff = Date.now() - new Date(lastActiveAt).getTime();
  if (diff < HOUR_MS) return `oxirgi marta ko'rilgan ${Math.max(1, Math.round(diff / MINUTE_MS))} daqiqa oldin`;
  if (diff < DAY_MS) return `oxirgi marta ko'rilgan ${Math.round(diff / HOUR_MS)} soat oldin`;
  const days = Math.round(diff / DAY_MS);
  if (days < 7) return `oxirgi marta ko'rilgan ${days} kun oldin`;
  return `oxirgi marta ko'rilgan ${new Date(lastActiveAt).toLocaleDateString('uz-UZ')}`;
}

// H-1 — "Oxirgi marta ko'rilgan"ni kim ko'rishi (`shouldShowLastSeen`) src/lib/chatConstants.js'ga
// ko'chirildi: bu fayl (presence.js) React hook'lar (useState/useEffect) eksport qilgani
// uchun Next.js uni "client-only" modul deb hisoblaydi — server API route (chat/conversations)
// undan sof funksiya import qilsa ham, build vaqtida "faqat Client Component'da ishlaydi"
// xatosi berardi. chatConstants.js hech qanday React/DB import qilmaydi, shuning uchun
// ikkala tomondan ham xavfsiz import qilinadi (o'sha faylning boshidagi izohga qarang).

// G-3 — bell tugmasi/sarlavha ostida "necha vaqtgacha ovozsiz" qoldirilganini
// ko'rsatish uchun qisqa matn. `mutedUntilIso` — o'tmishda yoki bo'sh bo'lsa (masalan
// muddat allaqachon tugagan) `null` qaytaradi (ChatContext holati keyingi yangilanishda
// baribir tozalanadi — bu yerda faqat ko'rinish uchun ehtiyot chorasi).
export function formatMuteUntil(mutedUntilIso) {
  if (!mutedUntilIso) return null;
  const diff = new Date(mutedUntilIso).getTime() - Date.now();
  if (diff <= 0) return null;
  if (diff < HOUR_MS) return `${Math.max(1, Math.round(diff / MINUTE_MS))} daqiqagacha ovozsiz`;
  if (diff < DAY_MS) return `${Math.round(diff / HOUR_MS)} soatgacha ovozsiz`;
  return `${Math.round(diff / DAY_MS)} kungacha ovozsiz`;
}
