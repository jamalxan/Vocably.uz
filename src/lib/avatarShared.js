// Profil rasmlari uchun SOF funksiyalar — server (API route'lar) ham, klient
// (Avatar.jsx) ham shu bitta manbadan foydalanadi. Bu yerda React/DB importi
// BO'LMASLIGI SHART (chatConstants.js bilan bir xil sabab — ikkala tomonga ham
// xavfsiz import qilinishi kerak).

export const PHOTO_VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Hamma' },
  { value: 'friends', label: 'Suhbatlashganlar' },
  { value: 'nobody', label: 'Hech kim' },
];
export const PHOTO_VISIBILITY_VALUES = PHOTO_VISIBILITY_OPTIONS.map((o) => o.value);

// Bitta foydalanuvchida saqlanadigan eng ko'p rasm soni (Telegram cheklamaydi,
// lekin bu yerda S3 hajmi o'smasligi uchun — oshsa eng eskisi o'chiriladi).
export const MAX_PROFILE_PHOTOS = 50;

// API javobi uchun — S3 kalitlari HECH QACHON klientga chiqmaydi, faqat id/sana.
export function serializePhotos(photos) {
  return (photos || []).map((p) => ({ id: String(p._id), createdAt: p.createdAt }));
}

// Rasm URL'i — faqat o'zimizning route orqali (u maxfiylikni tekshiradi va
// S3'ning vaqtinchalik imzolangan URL'iga yo'naltiradi). `photoId` URL'da
// bo'lgani uchun rasm almashsa URL ham almashadi — eski rasm keshdan chiqmaydi.
export function avatarUrl(userId, photoId, size = 'small') {
  if (!userId || !photoId) return null;
  return `/api/avatars/${userId}/${photoId}?size=${size === 'full' ? 'full' : 'small'}`;
}

// Egasi o'zinikini har doim ko'radi; boshqalar uchun lastSeenVisibility bilan bir
// xil talqin: 'friends' — "ikkovi orasida suhbat bor" (chatConstants.js#shouldShowLastSeen).
export function canViewPhoto(visibility, { isOwner, hasConversation, blocked }) {
  if (isOwner) return true;
  if (blocked) return false;
  if (visibility === 'nobody') return false;
  if (visibility === 'friends') return !!hasConversation;
  return true;
}

// Telegram'ning rasm yo'q bo'lgandagi 7 ta gradient rangi (qizil, to'q sariq,
// binafsha, yashil, moviy-yashil, ko'k, pushti) — rang userId'dan BARQAROR
// tanlanadi, ya'ni bir kishi hamma joyda bir xil rangda ko'rinadi.
export const AVATAR_GRADIENTS = [
  ['#FF885E', '#FF516A'],
  ['#FFCD6A', '#FFA85C'],
  ['#E0A2F3', '#D669ED'],
  ['#A0DE7E', '#54CB68'],
  ['#53EDD6', '#28C9B7'],
  ['#72D5FD', '#2A9EF1'],
  ['#FFA8A8', '#FF719A'],
];

export function avatarGradient(seed) {
  const str = String(seed || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

// Telegram kabi: ism bo'lsa ikki so'zning bosh harflari ("Ali Valiyev" -> "AV"),
// bitta so'z bo'lsa bitta harf; ism yo'q bo'lsa username'ning birinchi harfi.
// Emoji/surrogat juftliklar yarmidan kesilmasligi uchun Array.from ishlatiladi.
export function avatarInitials(name, username) {
  const words = String(name || '')
    .trim()
    .replace(/^@/, '')
    .split(/\s+/)
    .filter(Boolean);
  const first = (w) => Array.from(w)[0] || '';
  if (words.length >= 2) return (first(words[0]) + first(words[words.length - 1])).toUpperCase();
  if (words.length === 1) return first(words[0]).toUpperCase();
  const u = String(username || '').replace(/^@/, '');
  return (first(u) || '?').toUpperCase();
}
