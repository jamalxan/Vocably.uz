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
