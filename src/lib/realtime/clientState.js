// RealtimeProvider (src/context/RealtimeContext.jsx) uchun sof yordamchilar — DOM/React/tarmoqsiz,
// shuning uchun to'liq unit-test qilinadi (clientState.test.js). docs/chat/PARITY_PLAN.md WP1.
import { isMutedNow } from '@/lib/chatConstants';

// 'unauthorized' rad etilgandan keyin socket.io o'zi qayta ulanmaydi (socket.active === false) —
// provider qo'lda ulanadi: 2 s, 4 s, 8 s, 16 s, keyin 30 s'da to'xtaydi (CALLS_SPEC §3.3).
const BACKOFF_STEPS_MS = [2000, 4000, 8000, 16000, 30000];

/** `attempt` — 0 dan boshlanadigan urinish raqami (har muvaffaqiyatli `connect`da 0 ga qaytadi). */
export function nextBackoffMs(attempt) {
  const i = Math.max(0, Math.floor(Number(attempt) || 0));
  return BACKOFF_STEPS_MS[Math.min(i, BACKOFF_STEPS_MS.length - 1)];
}

export const EMPTY_UNREAD = Object.freeze({ total: 0, mutedTotal: 0, chats: 0 });

const isActiveVisible = ({ conversationId, activeConversationId, hidden }) =>
  !!activeConversationId && String(conversationId) === String(activeConversationId) && !hidden;

/**
 * `message:new` kelganda nav belgisi/tab sarlavhasi uchun umumiy o'qilmaganlar soni. O'z xabarim,
 * allaqachon o'qilgan xabar (masalan javob berilgan qo'ng'iroq) yoki hozir ochiq va ko'rinib turgan
 * suhbatga kelgan xabar hisoblanmaydi. `silent` (ovozsiz suhbat) — `mutedTotal`ga.
 * `chats` — yangi suhbatda birinchi o'qilmagan bo'lsa oshadi (`wasUnread` — shu suhbatda oldin
 * o'qilmagan bor edimi; noma'lum bo'lsa oshirilmaydi, keyingi refreshUnread to'g'rilaydi).
 * O'zgarmasa AYNAN shu `state` obyektini qaytaradi (React keraksiz qayta chizmasin).
 */
export function applyUnreadOnMessage(state, { conversationId, message, silent, myId, activeConversationId, hidden, wasUnread = true, archived = false }) {
  if (!message || String(message.senderId) === String(myId) || message.readAt) return state;
  if (archived) return state; // arxivdagi suhbat — server countUnread kabi hisoblanmaydi
  if (isActiveVisible({ conversationId, activeConversationId, hidden })) return state;
  if (silent) return { ...state, mutedTotal: state.mutedTotal + 1 };
  return { ...state, total: state.total + 1, chats: state.chats + (wasUnread ? 0 : 1) };
}

/**
 * ChatProvider'dagi to'liq ro'yxatdan (GET /api/chat/conversations shakli) hisoblash — server
 * GET /api/chat/unread bilan bir xil qoidalar: arxivdagilar hisoblanmaydi, ovozsizlar `mutedTotal`ga.
 */
export function unreadFromConversations(list, now = Date.now()) {
  let total = 0;
  let mutedTotal = 0;
  let chats = 0;
  for (const c of list || []) {
    const n = Number(c?.unreadCount) || 0;
    if (n <= 0 || c.archived) continue;
    if (isMutedNow(c, now)) mutedTotal += n;
    else {
      total += n;
      chats += 1;
    }
  }
  return { total, mutedTotal, chats };
}

/** Ikki unread holati teng bo'lsa eskisini qaytaradi (keraksiz render bo'lmasin). */
export function sameUnread(a, b) {
  return !!a && !!b && a.total === b.total && a.mutedTotal === b.mutedTotal && a.chats === b.chats;
}

const BADGE_PREFIX_RE = /^\(\d+\+?\) /;

/** `(3) Vocably` — mavjud `(n) ` prefiksi almashtiriladi; 0 -> prefikssiz; 99 dan ko'pi `(99+)`. */
export function titleWithBadge(title, n) {
  const base = String(title || '').replace(BADGE_PREFIX_RE, '');
  const count = Math.max(0, Math.floor(Number(n) || 0));
  if (!count) return base;
  return `(${count > 99 ? '99+' : count}) ${base}`;
}

/** Nav belgisidagi matn: 99 dan ko'pi `99+`. */
export function badgeLabel(n) {
  const count = Math.max(0, Math.floor(Number(n) || 0));
  return count > 99 ? '99+' : String(count);
}

/**
 * Ilova ichidagi toast ko'rsatilsinmi: boshqa tomondan, qo'ng'iroq yozuvi emas, ovozsiz emas va
 * hozir ochiq + ko'rinib turgan suhbatga tegishli emas.
 */
export function shouldToast({ conversationId, message, silent, myId, activeConversationId, hidden }) {
  if (!message || !conversationId) return false;
  if (message._event) return false; // eski server: tahrir/o'chirish shu kanal orqali keladi
  if (String(message.senderId) === String(myId)) return false;
  if (message.type === 'call') return false;
  if (silent) return false;
  return !isActiveVisible({ conversationId, activeConversationId, hidden });
}

/**
 * Onlayn holat xaritasiga (`userId -> true | false | null`) yangi qiymatlarni qo'shadi va kim
 * HOZIR oflaynga o'tganini aytadi — o'sha lahza uning "oxirgi marta ko'rilgan" vaqti
 * (src/lib/presence.js formatLastSeen). `broadcast` — server e'lon qilgan `presence:update`:
 * u faqat haqiqiy o'tishda yuboriladi, shuning uchun bu yerda oldin onlayn ko'rilmagan
 * foydalanuvchi uchun ham hisoblanadi. So'rov javobida (`presence:query`) esa faqat oldin onlayn
 * bo'lgani ma'lum bo'lsa. `null` (yashirin holat) hech qachon hisoblanmaydi.
 * O'zgarmasa AYNAN shu `prev` obyektini qaytaradi.
 */
export function mergePresence(prev, patch, { broadcast = false } = {}) {
  const wentOffline = [];
  let changed = false;
  for (const [id, value] of Object.entries(patch || {})) {
    if (prev[id] !== value) changed = true;
    if (value === false && (prev[id] === true || (broadcast && prev[id] !== false))) wentOffline.push(id);
  }
  return { next: changed ? { ...prev, ...patch } : prev, wentOffline };
}
