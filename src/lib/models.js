import mongoose from 'mongoose';
import { normalizeRole } from './chatRoles';

// Rolni yozishdan oldin normallashtiramiz: 'function'/'tool' -> 'user', 'assistant' -> 'model'.
// Shu tufayli bazaga Gemini qabul qilmaydigan rol tushib qolmaydi.
const roleField = {
  type: String,
  enum: ['user', 'model'],
  required: true,
  set: (v) => normalizeRole(v) || v,
};

const WordStatsSchema = new mongoose.Schema(
  {
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    lastReviewed: { type: Date, default: null },
    // Eski flat-lookup darajasi (0-5) — hozir yangi SRS maydonlaridan derived, faqat orqaga
    // moslik uchun saqlanadi (masalan "O'zlashtirilgan" hisoblagichi shu bo'yicha filtrlaydi).
    level: { type: Number, default: 0, min: 0, max: 5 },
    nextReview: { type: Date, default: Date.now },
    // --- src/lib/srs.ts SRS enjini uchun (docs/AUDIT_FINDINGS.md ijro. xulosasi §3) ---
    srsState: { type: String, enum: ['new', 'learning', 'review', 'relearning'], default: 'new' },
    ease: { type: Number, default: 2.5 },
    intervalDays: { type: Number, default: 0 },
    learningStep: { type: Number, default: 0 },
    lapses: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    isLeech: { type: Boolean, default: false },
  },
  { _id: false }
);

const WordSchema = new mongoose.Schema({
  word: { type: String, required: true, trim: true },
  syns: [{ type: String, trim: true }],
  stats: { type: WordStatsSchema, default: () => ({}) },
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  words: [WordSchema],
});

const ChatMessageSchema = new mongoose.Schema(
  {
    role: roleField,
    parts: [{ text: { type: String, required: true } }],
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSessionMessageSchema = new mongoose.Schema(
  {
    role: roleField,
    parts: [{ text: { type: String, required: true } }],
    // Eski yozuvlarda bitta rasm shu maydonda saqlangan (orqaga moslik uchun qoldirilgan).
    imageUrl: { type: String, default: null },
    // Yangi yozuvlar bir nechta rasmni (10 tagacha) shu yerda saqlaydi.
    imageUrls: [{ type: String }],
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSessionSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: 'Yangi suhbat' },
  messages: [ChatSessionMessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, trim: true, index: true },
  name: { type: String, trim: true, default: '' },
  password: { type: String, required: true },
  telegramChatId: { type: Number, default: null },
  // --- Do'stlar (foydalanuvchilararo chat) uchun, docs/ (chat plani) ---
  // `role` admin panelga kirishni, `chatAccess` esa Do'stlar bo'limining butunlay
  // yashirin/ko'rinishini boshqaradi — ikkalasi ham faqat admin tomonidan o'zgartiriladi.
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  username: { type: String, trim: true, default: null, unique: true, sparse: true, index: true },
  chatAccess: { type: Boolean, default: false },
  chatBanned: { type: Boolean, default: false },
  categories: [CategorySchema],
  // Eski, uzluksiz chat tarixi — endi ishlatilmaydi, faqat orqaga moslik uchun saqlanadi.
  chatHistory: [ChatMessageSchema],
  chatSessions: [ChatSessionSchema],
  // Aqlli takrorlash uchun kunlik faollik ketma-ketligi (streak).
  reviewStreak: { type: Number, default: 0 },
  longestReviewStreak: { type: Number, default: 0 },
  lastReviewDate: { type: String, default: null }, // 'YYYY-MM-DD', foydalanuvchi timezone'i + 04:00 chegarasi bo'yicha
  // Streak/"bugun" hisob-kitobi shu bo'yicha (B10 — ilgari UTC bo'yicha hisoblanardi).
  // To'liq Settings sahifasi hali yo'q, shuning uchun hozircha faqat shu bitta maydon.
  timezone: { type: String, default: 'Asia/Tashkent' },
  // Dashboard'dagi kunlik maqsad halqasi uchun (spec §5.2 "daily_goal_reviews"). To'liq Settings
  // sahifasi hali yo'q, shuning uchun hozircha o'zgartirib bo'lmaydigan default qiymat.
  dailyGoal: { type: Number, default: 20 },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Ro'yxatdan o'tish / parolni tiklash uchun vaqtinchalik Telegram tasdiqlash sessiyasi.
// 15 daqiqadan so'ng MongoDB TTL indeksi orqali avtomatik o'chiriladi.
const OtpSessionSchema = new mongoose.Schema({
  sessionToken: { type: String, required: true, unique: true, index: true },
  purpose: { type: String, enum: ['register', 'reset'], required: true },
  phone: { type: String, required: true },
  name: { type: String, trim: true, default: '' },
  passwordHash: { type: String, default: null }, // faqat 'register' uchun
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // faqat 'reset' uchun
  telegramChatId: { type: Number, default: null },
  code: { type: String, default: null },
  status: {
    type: String,
    enum: ['awaiting_telegram', 'code_sent', 'verified', 'mismatch'],
    default: 'awaiting_telegram',
  },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // 15 daqiqa TTL
});

export const OtpSession = mongoose.models.OtpSession || mongoose.model('OtpSession', OtpSessionSchema);

// So'zlar User hujjati ichida embedded bo'lgani uchun (alohida Word/UserWordState jadvali
// yo'q), har bir javobning to'liq audit yozuvi alohida, yengil, faqat-qo'shiladigan (append-only)
// to'plamda saqlanadi — spec §6.1'dagi review_events'ning Mongo'ga moslashtirilgan varianti.
// Kelgusi FAZA 3 statistika/dashboard endpointlari shu yerdan o'qiydi, User hujjatini emas.
const ReviewEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
  wordId: { type: mongoose.Schema.Types.ObjectId, required: true },
  mode: { type: String, default: 'spaced' }, // flashcard | typing | quiz | matching | listening | spaced | ...
  rating: { type: Number, min: 1, max: 4, required: true },
  isCorrect: { type: Boolean, required: true },
  prevState: { type: String },
  newState: { type: String },
  prevIntervalDays: { type: Number },
  newIntervalDays: { type: Number },
  prevEase: { type: Number },
  newEase: { type: Number },
  reviewedAt: { type: Date, default: Date.now },
});
ReviewEventSchema.index({ userId: 1, reviewedAt: -1 });

export const ReviewEvent = mongoose.models.ReviewEvent || mongoose.model('ReviewEvent', ReviewEventSchema);

// ============================================================================
// Do'stlar (foydalanuvchilararo 1:1 chat) — yangi top-level kolleksiyalar.
// ReviewEvent'dagi kabi, User hujjati ichiga embed qilinmaydi: bu yerda
// cross-user so'rovlar (admin nazorati, qidiruv) kerak bo'ladi, embedded
// massivlar buni samarali qila olmaydi (docs/DB_SCHEMA.md'dagi izohga qarang).
// ============================================================================

// Ikki foydalanuvchi orasidagi bitta doimiy suhbat. `participantIds` doim
// ObjectId qiymatlari bo'yicha saralangan holda saqlanadi — shu tufayli
// (A,B) va (B,A) uchun bitta hujjatgina bo'lishini unique indeks kafolatlaydi.
const ConversationSchema = new mongoose.Schema({
  participantIds: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
    validate: (v) => Array.isArray(v) && v.length === 2,
  },
  lastMessageAt: { type: Date, default: Date.now },
  lastMessagePreview: { type: String, default: '', trim: true },
  createdAt: { type: Date, default: Date.now },
});
ConversationSchema.index({ participantIds: 1 }, { unique: true });

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

const MessageMediaSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // S3/MinIO object key — hech qachon to'g'ridan-to'g'ri URL saqlanmaydi
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    durationSec: { type: Number, default: null },
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'image', 'video', 'voice', 'file', 'sticker'], required: true },
  text: { type: String, trim: true, default: '' },
  media: { type: MessageMediaSchema, default: null },
  stickerId: { type: String, default: null }, // src/lib/stickers.js manifest'idagi statik id
  readAt: { type: Date, default: null },
  deletedForEveryone: { type: Boolean, default: false },
  flagged: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

// Bir tomonlama bloklash — bloklovchi bloklanganning xabarini ko'rmaydi/qabul qilmaydi.
const BlockSchema = new mongoose.Schema({
  blockerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  blockedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});
BlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

export const Block = mongoose.models.Block || mongoose.model('Block', BlockSchema);

// Foydalanuvchi shikoyati — admin panelning "Reports" navbatida ko'rib chiqiladi.
const ReportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['user', 'message'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, trim: true, required: true },
  status: { type: String, enum: ['open', 'reviewed', 'actioned'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
});
ReportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);

// Har bir admin mutatsiyasi shu yerga yoziladi (docs/VOCABLY_REDESIGN_SPEC.md §9.1'dagi
// admin_audit_log'ning to'g'ridan-to'g'ri Mongo ekvivalenti).
const AdminAuditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: { type: String, default: null },
  targetId: { type: String, default: null },
  diff: { type: mongoose.Schema.Types.Mixed, default: null },
  ip: { type: String, default: null },
  userAgent: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});
AdminAuditLogSchema.index({ createdAt: -1 });

export const AdminAuditLog = mongoose.models.AdminAuditLog || mongoose.model('AdminAuditLog', AdminAuditLogSchema);

// Infratuzilma qo'shmasdan (Redis'siz) oddiy sliding-window tezlik cheklash uchun:
// bitta hujjat = bitta (userId, action) juftligining joriy oynadagi hisoblagichi.
// TTL indeksi orqali oyna tugagach avtomatik o'chadi — src/lib/chatAuth.js'da ishlatiladi.
const RateLimitHitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // `${userId}:${action}`
  count: { type: Number, default: 0 },
  windowStart: { type: Date, default: Date.now, expires: 60 }, // 60s oyna, TTL bilan avtomatik tozalanadi
});

export const RateLimitHit = mongoose.models.RateLimitHit || mongoose.model('RateLimitHit', RateLimitHitSchema);
