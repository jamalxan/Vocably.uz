// Do'stlar bo'limi uchun umumiy konstantalar — ham server (src/lib/chatAuth.js
// requireChatUser'dagi "oxirgi faol" throttle), ham client (src/lib/presence.js
// onlayn/oflayn hisoblash) tomonidan ishlatiladi. Shuning uchun bu faylda
// mongoose/DB kabi server-only import BO'LMASLIGI SHART — client bundle'ga
// to'g'ridan-to'g'ri import qilinadi (masalan ConversationList.jsx).
export const LAST_ACTIVE_THROTTLE_MS = 2 * 60 * 1000;

// Message.type -> qisqa yorliq — media xabarlarda matn yo'q, shuning uchun
// javob (reply) iqtibosida va tahrirlash-taqiqlangan holatlarda shu ko'rsatiladi
// (MessageBubble.jsx'dagi ReplyQuote va Composer.jsx'dagi javob paneli ishlatadi).
export const REPLY_TYPE_LABEL = {
  image: '📷 Rasm',
  video: '🎬 Video',
  voice: '🎤 Ovozli xabar',
  file: '📎 Fayl',
  sticker: '😊 Stiker',
  call: "📞 Qo'ng'iroq", // himoya uchun: qo'ng'iroqqa javob berib bo'lmaydi (server rad etadi)
};

// "typing" socket hodisasining `kind`i -> ConversationView/ConversationList'da
// ko'rsatiladigan matn (Composer'da yozish, VoiceRecorder/VideoRecorder'da
// yozib turish uchun bir xil "typing" kanali ishlatiladi, faqat matni farq qiladi).
export const TYPING_LABEL = {
  text: 'yozmoqda...',
  voice: 'ovoz yubormoqda...',
  video: 'video yubormoqda...',
};

// Matnsiz (media/stiker) xabarlar uchun suhbatlar ro'yxatidagi qisqa preview —
// src/app/api/chat/conversations/[id]/messages/route.js (yangi xabar yozilganda)
// va .../[messageId]/route.js (C-02 — o'chirilgandan keyin qayta hisoblashda)
// ikkalasi ham shu bitta manbadan foydalanadi (ikkitasi mos kelmay qolmasin).
export const PREVIEW_BY_TYPE = {
  image: '📷 Rasm',
  video: '🎬 Video',
  voice: '🎤 Ovozli xabar',
  file: '📎 Fayl',
  sticker: '😊 Stiker',
  call: "📞 Qo'ng'iroq",
};

// Qo'ng'iroq yozuvining natijalari (docs/chat/CALLS_SPEC.md §7). Xabarning o'zi qo'ng'iroq tarixi.
export const CALL_OUTCOMES = ['ended', 'missed', 'declined', 'busy', 'cancelled', 'failed'];

/** null -> '', 0 -> '0:00', 133 -> '2:13', 3661 -> '61:01' (soat ajratilmaydi — Telegram kabi). */
export function formatCallDuration(sec) {
  if (sec === null || sec === undefined || sec === '') return '';
  const n = Number(sec);
  if (!Number.isFinite(n) || n < 0) return '';
  const s = Math.floor(n);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Ro'yxatdagi preview ikkala tomon uchun umumiy (lastMessagePreview), shuning uchun "kim kimga"
// qo'ng'iroq qilganidan qat'i nazar neytral matn (PARITY_PLAN §2.7). Pufakchalar esa ko'ruvchiga xos.
export function callPreview(call) {
  const outcome = call?.outcome;
  if (outcome === 'ended') {
    const d = formatCallDuration(call?.durationSec);
    return d ? `📞 Qo'ng'iroq (${d})` : "📞 Qo'ng'iroq";
  }
  if (outcome === 'missed' || outcome === 'busy' || outcome === 'cancelled') return "📞 Javobsiz qo'ng'iroq";
  if (outcome === 'declined') return "📞 Rad etilgan qo'ng'iroq";
  if (outcome === 'failed') return "📞 Amalga oshmagan qo'ng'iroq";
  return "📞 Qo'ng'iroq";
}

/** Bitta manba: matn/izoh -> 80 belgi; qo'ng'iroq -> callPreview; boshqasi -> PREVIEW_BY_TYPE. */
export function previewForMessage(m) {
  if (!m) return '';
  if (m.type === 'call') return callPreview(m.call);
  if (m.text) return String(m.text).slice(0, 80);
  return PREVIEW_BY_TYPE[m.type] || '';
}

// H-1 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 H) — "Oxirgi marta ko'rilgan"/onlayn
// holatini VIEWER'ga (shu holatni ko'rmoqchi bo'lgan foydalanuvchiga) ko'rsatish
// kerakmi-yo'qmi, egasining `User.lastSeenVisibility` sozlamasiga qarab hal qiladi.
// Sof funksiya — src/app/api/chat/conversations route'lari (GET/POST) `otherUser.
// lastActiveAt`/`showPresence`ni hisoblashda shu yerdan foydalanadi. ATAYLAB
// src/lib/presence.js'da EMAS: u fayl React hook (useState/useEffect) eksport qilgani
// uchun Next.js uni faqat Client Component'lar import qila oladigan modul deb
// belgilaydi — server route undan sof funksiya olsa ham build xatosiga uchraydi.
// Bu fayl (chatConstants.js) hech qanday React/DB import qilmaydi, shuning uchun
// server (bu yerda) va klient tomondan ham xavfsiz.
//
// `hasConversation` — "Do'stlar"da alohida "do'stlar ro'yxati" tushunchasi yo'qligi
// sababli, TZ H bandidagi "Do'stlar" tanlovining eng oddiy talqini: "bu ikkovi orasida
// mavjud suhbat bor" (chaqiruvchi route'lar — conversations GET/POST — bu kontekstda
// har doim `true` beradi, chunki ular allaqachon ikkovi orasidagi suhbat doirasida).
export function shouldShowLastSeen(visibility, hasConversation) {
  if (visibility === 'nobody') return false;
  if (visibility === 'friends') return !!hasConversation;
  return true; // 'everyone' yoki noma'lum/eski qiymat — standart xatti-harakat o'zgarmaydi
}

// G-3 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 G — "Mute: 1 soat / 8 soat / 1 kun /
// doimiy") — bitta suhbatda berilgan foydalanuvchi HOZIR ovozsizmi (doimiy — `mutedBy`,
// YOKI hali tugamagan muddatli — `mutedUntil`). Sof funksiya (DB'siz) — server
// (messages/route.js push gate'i, conversations GET/POST) va test bitta manbadan
// foydalanadi. `convo.mutedUntil` mongoose Map (to'liq hujjat) YOKI oddiy JS obyekt
// (`.lean()` natijasi) bo'lishi mumkin — ikkalasi ham qo'llab-quvvatlanadi.
export function isConversationMuted(convo, userId, now = Date.now()) {
  const uid = String(userId);
  if ((convo?.mutedBy || []).some((id) => String(id) === uid)) return true;
  const raw = convo?.mutedUntil?.get ? convo.mutedUntil.get(uid) : convo?.mutedUntil?.[uid];
  if (!raw) return false;
  return new Date(raw).getTime() > now;
}

// Shu suhbatga yangi xabar kelganda `userId`ga Telegram bot orqali xabar borishi
// kerakmi. Userning shu suhbatdagi aniq tanlovi (tgMessageNotifyOn/Off) har doim
// ustun; tanlov bo'lmasa — admin userga bergan umumiy sozlama (`userDefault`,
// User.tgMessageNotify) amal qiladi.
export function isTgMessageNotifyOn(convo, userId, userDefault) {
  const uid = String(userId);
  if ((convo?.tgMessageNotifyOff || []).some((id) => String(id) === uid)) return false;
  if ((convo?.tgMessageNotifyOn || []).some((id) => String(id) === uid)) return true;
  return !!userDefault;
}

// Bitta suhbatdan ketma-ket kelgan xabarlar uchun Telegram bildirishnomasi orasidagi
// minimal oraliq — har bir xabarga alohida bot xabari kelib spam bo'lmasligi uchun.
// 2026-09-29: 60s → 20s — bir daqiqalik jimlik "xabar Telegram'ga bormay qoldi"
// deb qabul qilinardi; 20s ichidagi ketma-ket xabarlar baribir bitta signal.
export const TG_MESSAGE_NOTIFY_THROTTLE_MS = 20 * 1000;

// Xuddi shu g'oya, lekin klientning GET /conversations javobidan kelgan, ALLAQACHON
// tekislangan shakli uchun ({muted, mutedUntil}) — ChatContext.jsx yangi xabar
// toast'ini ko'rsatishdan oldin server round-trip'ni kutmasdan shu bilan tekshiradi.
export function isMutedNow(conv, now = Date.now()) {
  if (!conv) return false;
  if (conv.mutedUntil) return new Date(conv.mutedUntil).getTime() > now;
  return !!conv.muted;
}

// Bell tugmasi bosilganda ochiladigan muddat tanlovi (MuteDurationModal.jsx).
// `durationMs: null` — "Doimiy" (mutedBy'ga yoziladi, muddatsiz).
export const MUTE_DURATION_OPTIONS = [
  { value: '1h', label: '1 soatga', durationMs: 60 * 60 * 1000 },
  { value: '8h', label: '8 soatga', durationMs: 8 * 60 * 60 * 1000 },
  { value: '1d', label: '1 kunga', durationMs: 24 * 60 * 60 * 1000 },
  { value: 'forever', label: 'Doimiy', durationMs: null },
];

// H-2 — shikoyat sababi kategoriyalari. Client (ReportReasonModal.jsx select'i) va
// admin (ReportsQueue.jsx yorlig'i) bitta manbadan — ikkalasi mos kelmay qolmasin.
export const REPORT_REASON_CATEGORIES = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: "Tazyiq/xafa qilish" },
  { value: 'inappropriate_content', label: 'Nomaqbul kontent' },
  { value: 'other', label: 'Boshqa' },
];
