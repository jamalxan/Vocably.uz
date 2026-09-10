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

// So'zning lug'at-yozuvi maydonlari (VOCABLY-TZ.md §4.1'dan moslashtirilgan). TZ'dagi
// asl model UMUMIY (global) `words` kolleksiyasini nazarda tutadi; bu loyihada so'zlar
// har foydalanuvchida ALOHIDA-ALOHIDA saqlanadi (User.categories[].words[]) — shuning
// uchun faqat leksik-mazmun maydonlari ko'chirildi, faqat global lug'atga tegishli
// maydonlar (frequency_rank, source, created_by, admin verified/publish oqimi)
// OLIB TASHLANDI. `audioUrl`/`imageUrl` — hozircha bo'sh qoladi: loyihada TTS audio
// fayl yoki rasm generatsiya/CDN quvuri yo'q (T4), shuning uchun enrich endpoint
// (POST /api/words/enrich) bu ikkalasini TO'LDIRMAYDI — faqat matn maydonlari.
const WordEnrichmentSchema = new mongoose.Schema(
  {
    pos: {
      type: String,
      enum: ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom', 'phrasal_verb', ''],
      default: '',
    },
    definitionEn: { type: String, trim: true, default: '' },
    definitionUz: { type: String, trim: true, default: '' },
    // Kamida 2 ta — kontekstsiz so'z yodlanmaydi (TZ §4.1 izohi).
    examples: [{ en: { type: String, trim: true }, uz: { type: String, trim: true } }],
    collocations: [{ type: String, trim: true }],
    wordFamily: [{ form: { type: String, trim: true }, pos: { type: String, trim: true } }],
    // Inglizcha yaqin ma'noli so'zlar (distraktor/"sinonim gradusi" rejimlari uchun) —
    // mavjud `syns` maydonidan FARQLI: `syns` — o'zbekcha tarjima(lar), bu — inglizcha.
    synonymsEn: [{ type: String, trim: true }],
    antonyms: [{ type: String, trim: true }],
    cefr: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', ''], default: '' },
    register: { type: String, enum: ['formal', 'neutral', 'informal', 'academic', ''], default: '' },
    topics: [{ type: String, trim: true }],
    mnemonicUz: { type: String, trim: true, default: '' },
    // Foydalanuvchining o'zi yozgan mnemonika (V6 — "Mnemonika ustaxonasi") — AI taklifidan
    // (yuqoridagi mnemonicUz) ATAYLAB alohida: elaborative encoding eng kuchli o'zi
    // ijod qilganda ishlaydi (TZ 6.2 V6 izohi), shuning uchun AI varianti faqat "ilhom"
    // sifatida ko'rsatiladi, ustidan yozib qo'yilmaydi.
    userMnemonicUz: { type: String, trim: true, default: '' },
    commonMistakes: [{ type: String, trim: true }],
    // Hozircha bo'sh — audio/rasm quvuri qo'shilganda to'ldiriladi (yuqoridagi izoh).
    audioUrl: { uk: { type: String, default: '' }, us: { type: String, default: '' } },
    imageUrl: { type: String, default: '' },
    aiEnrichedAt: { type: Date, default: null },
  },
  { _id: false }
);

const WordSchema = new mongoose.Schema({
  word: { type: String, required: true, trim: true },
  syns: [{ type: String, trim: true }],
  // AI orqali qo'shilgan so'zlar uchun talaffuz transkripsiyasi (masalan "/əˈraɪz/") —
  // ixtiyoriy, qo'lda qo'shilgan eski so'zlarda bo'sh qoladi. Bu maydon TZ §4.1'dagi
  // `ipa`ning aynan o'zi — ikkinchi nom bilan dublikat qilinmadi.
  pronunciation: { type: String, trim: true, default: '' },
  stats: { type: WordStatsSchema, default: () => ({}) },
  enrichment: { type: WordEnrichmentSchema, default: () => ({}) },
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
  // `default` yo'q — muhim: agar `default: null` bo'lsa, mongoose har bir yangi
  // hujjatga `username: null` maydonini aynan shu qiymat bilan yozadi. Sparse indeks
  // faqat maydon UMUMAN yo'q hujjatlarni e'tiborsiz qoldiradi — `null` qiymat esa
  // "mavjud" hisoblanadi, shuning uchun ikkinchi ro'yxatdan o'tgan foydalanuvchi
  // (unga hali username tayinlanmagan bo'lsa ham) E11000 duplicate key xatosiga
  // uchraydi (`username_1` unique indeks). Default'siz maydon shunchaki mavjud
  // bo'lmaydi (admin uni keyinroq tayinlagunga qadar), sparse indeks buni to'g'ri o'tkazib yuboradi.
  username: { type: String, trim: true, unique: true, sparse: true, index: true },
  chatAccess: { type: Boolean, default: false },
  chatBanned: { type: Boolean, default: false },
  // Do'stlar bo'limida "oxirgi marta ko'rilgan" uchun — requireChatUser() har /api/chat/*
  // so'rovida (throttled) yangilaydi, src/lib/chatAuth.js.
  lastActiveAt: { type: Date, default: null },
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
  // FAZA 5 — gamifikatsiya (VOCABLY-TZ.md §13). Jami XP; daraja shundan hosila
  // hisoblanadi (src/lib/gamification.js:levelForXp), bazada saqlanmaydi —
  // XP o'zgarganda avtomatik to'g'ri chiqadi, ikkalasi sinxronsizlanib qolmaydi.
  xp: { type: Number, default: 0 },
  badges: [{ key: { type: String, required: true }, earnedAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now },
});

// Perfomans indekslari (docs/DB_PERFORMANCE.md audit'i): `phone`/`username` yuqorida
// maydon darajasida allaqachon indekslangan (unique). Qo'shimcha:
// - `role` — admin/stats va telegram/webhook'dagi countDocuments({role:'admin'}) uchun.
// - `chatAccess`+`chatBanned` — Do'stlar bo'limi statistikasi/ro'yxatlari birga filtrlaydi.
// - `createdAt` — admin/stats (dayAgo/weekAgo), telegram /users, admin/chat/users sort'i uchun.
// - `telegramChatId` — telegram/webhook har bir admin buyrug'ida actor'ni shu bo'yicha topadi.
UserSchema.index({ role: 1 });
UserSchema.index({ chatAccess: 1, chatBanned: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ telegramChatId: 1 });

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
// telegram/webhook.js kontakt qadamida shu 3 maydon bo'yicha aynan shu tartibda so'raydi
// (findOne({telegramChatId, status}).sort({createdAt:-1})) — compound indeks to'liq qoplaydi.
OtpSessionSchema.index({ telegramChatId: 1, status: 1, createdAt: -1 });

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
// ObjectId qiymatlari bo'yicha saralangan holda saqlanadi.
// `pairKey` — "kichikId_kattaId" ko'rinishidagi hosila maydon, (A,B)/(B,A) uchun
// bitta hujjatgina bo'lishini shu orqali ta'minlaymiz. MUHIM: buni to'g'ridan-to'g'ri
// `participantIds` massivi ustida `unique: true` bilan qilib bo'lmaydi — Mongo'da
// massiv ustidagi unique indeks butun massivni emas, HAR BIR ELEMENTNI alohida
// (collection bo'yicha) unique qiladi, ya'ni bitta user faqat BITTA suhbatda
// qatnasha oladigan bo'lib qolardi. Shuning uchun oddiy skalyar `pairKey`ga unique
// qo'yamiz, `participantIds`dagi indeks esa faqat "mening suhbatlarim" so'rovi uchun
// (unique emas, multikey qidiruv).
const ConversationSchema = new mongoose.Schema({
  participantIds: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
    validate: (v) => Array.isArray(v) && v.length === 2,
  },
  pairKey: { type: String, required: true, unique: true },
  lastMessageAt: { type: Date, default: Date.now },
  lastMessagePreview: { type: String, default: '', trim: true },
  createdAt: { type: Date, default: Date.now },
  // Kim shu suhbatni "ovozsiz" qilgan (push/bell bildirishnoma o'chirilgan) —
  // faqat o'sha userga ta'sir qiladi, ikkinchi tomon buni bilmaydi/ko'rmaydi.
  mutedBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  // Kim shu suhbatning IKKINCHI tomoni onlayn bo'lganda Telegram bot orqali xabar
  // olishni so'ragan — faqat o'sha userga ta'sir qiladi (ikkinchi tomon buni
  // bilmaydi/ko'rmaydi). realtime-server foydalanuvchi onlaynga o'tganda
  // /api/internal/presence-online'ga xabar beradi, u esa shu massivni tekshirib
  // Telegram orqali "onlayn bo'ldi" xabarini yuboradi (src/app/api/internal/presence-online).
  onlineNotifyBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  // Kim "Do'stlar" ro'yxatidan shu suhbatni o'chirgan (hujjat o'zi o'chmaydi —
  // faqat shu userning ro'yxatida yashiriladi). Bitta tomon o'chirsa — faqat shu
  // ro'yxatdan yashiriladi (deletedFor xabarlarga qo'shiladi, ikkinchi tomon
  // hech narsani sezmaydi). Ikkala tomon uchun o'chirilsa — ikkalasi ham shu
  // massivga tushadi va barcha xabarlar HAR IKKI tomonning id'si bilan deletedFor'ga
  // qo'shiladi (deletedForEveryone EMAS — shu tufayli hech qanday "o'chirilgan xabar"
  // tombstone'i ko'rinmaydi, suhbat chindan ham izsiz "yangidan boshlanadi"). Ikkala
  // holatda ham keyinroq (qidiruv orqali qayta ochilsa yoki yangi xabar kelsa) shu
  // userning id'si bu massivdan olib tashlanadi — suhbat ro'yxatga qaytadi (src/app/api/chat/conversations).
  hiddenFor: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  // Har bir tomon boshqasiga o'zi xohlagan taxallus qo'yishi mumkin (faqat o'zida
  // ko'rinadi) — kalit shu userning id'si (String), qiymat esa u ko'rgan taxallus.
  // .lean() bilan oddiy JS obyektiga aylanadi (src/app/api/chat/conversations/[id]/nickname).
  nicknames: { type: Map, of: String, default: {} },
});
// Ikkita boshqa-boshqa so'rov shakli: (1) bitta userning suhbatlar ro'yxati, eng
// yangisi birinchi (src/app/api/chat/conversations); (2) admin panelning BARCHA
// suhbatlar ro'yxati, eng yangisi birinchi (src/app/api/admin/chat/conversations).
ConversationSchema.index({ participantIds: 1, lastMessageAt: -1 });
ConversationSchema.index({ lastMessageAt: -1 });

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

// Javob (reply) — original xabarning to'liq hujjatiga bog'lanish o'rniga, yaratilish
// paytidagi kichik "surat" (snapshot) saqlanadi: shu tufayli original keyinchalik
// (ikkala tomondan) o'chirilsa ham javob pufakchasida iqtibos ko'rinishda qolaveradi,
// va xabarlarni o'qishda har safar qo'shimcha so'rov/JOIN kerak bo'lmaydi.
const ReplyToSchema = new mongoose.Schema(
  {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    text: { type: String, default: '' },
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
  replyTo: { type: ReplyToSchema, default: null },
  readAt: { type: Date, default: null },
  // Telegram uslubidagi ikki xil o'chirish: `deletedFor` — faqat shu ro'yxatdagi
  // foydalanuvchi(lar) o'z tarafidan ko'rmaydi (boshqa tomon xabarni odatdagidek
  // ko'radi); `deletedForEveryone` — ikkala tomondan ham (faqat o'z xabarini yubor-
  // gan kishi tanlashi mumkin). Hech biri hujjatni haqiqatan o'chirmaydi — admin
  // panelda audit uchun to'liq matn/holat saqlanib qoladi.
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deletedForEveryone: { type: Boolean, default: false },
  // Admin o'z xabarini "hamma uchun" o'chirsa — oddiy foydalanuvchidan farqli o'laroq
  // hech qanday "xabar o'chirildi" belgisi qoldirmaydi, xuddi umuman yozilmagandek
  // (chat/conversations/[id]/messages GET query'si shu bayroqli xabarlarni butunlay
  // chiqarib tashlaydi). Hujjatning o'zi baribir saqlanadi — admin panelning audit
  // ko'rinishi (admin/chat/conversations/[id]/messages) hech narsani filtrlamaydi.
  deletedForEveryoneSilently: { type: Boolean, default: false },
  // Tahrirlash: oddiy foydalanuvchi chatida faqat "tahrirlangan" belgisi ko'rinadi
  // (eski matn ko'rsatilmaydi), lekin admin panelda audit uchun ikkalasi ham kerak —
  // shuning uchun `originalText` birinchi tahrirdan oldingi holatni saqlaydi.
  edited: { type: Boolean, default: false },
  editedAt: { type: Date, default: null },
  originalText: { type: String, default: null },
  flagged: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
MessageSchema.index({ conversationId: 1, createdAt: -1 });
// admin/stats'dagi Message.aggregate($group by type) — indeks bo'lmasa har safar butun
// kolleksiyani skanerlaydi; bu indeks bilan faqat indeksning o'zidan hisoblanadi (covered).
MessageSchema.index({ type: 1 });

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

// ============================================================================
// Bildirishnomalar — ilova ichidagi (qo'ng'iroq belgisi) va brauzer push
// bildirishnomalari. Ikkalasi ham shu bitta manbadan ishlaydi: har hodisa
// (yangi chat xabari, admin e'loni) bitta Notification hujjati yaratadi,
// mavjud bo'lsa PushSubscription orqali haqiqiy brauzer bildirishnomasi ham
// yuboriladi (src/lib/webPush.js).
// ============================================================================

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['chat_message', 'announcement'], required: true },
  title: { type: String, required: true, trim: true },
  body: { type: String, default: '', trim: true },
  // 'chat_message' uchun suhbat ID'si, 'announcement' uchun Announcement ID'si —
  // bildirishnoma bosilganda qayerga o'tishni frontend shu bo'yicha hal qiladi.
  link: { type: String, default: null },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// Admin tomonidan yozilgan e'lon — yuborilganda har bir foydalanuvchiga bitta
// Notification hujjati "fan-out" qilinadi (src/app/api/admin/announcements/route.js).
const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, default: '', trim: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
AnnouncementSchema.index({ createdAt: -1 });

export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

// Brauzer push obunasi (Web Push API) — bitta foydalanuvchi bir nechta qurilma/brauzerdan
// obuna bo'lishi mumkin, shuning uchun userId unique emas, `endpoint` unique.
const PushSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export const PushSubscription =
  mongoose.models.PushSubscription || mongoose.model('PushSubscription', PushSubscriptionSchema);

// ============================================================================
// FAZA 3 (VOCABLY-TZ.md 7-10) — Reading/Listening/Speaking/Writing ko'nikma
// modullari. TZ asl modeli admin tomonidan oldindan tayyorlanadigan, tasdiqdan
// o'tgan KONTENT BANKINI (passages/listening_items/speaking_prompts/mocks,
// alohida verified/publish oqimi bilan) nazarda tutadi — bu FAZA 5'dagi admin
// CMS'ga bog'liq, hali qurilmagan. Shuning uchun bu yerda: har mashq AI orqali
// SO'ROV PAYTIDA generatsiya qilinadi (bank emas) va natija shu bitta hujjatda
// saqlanadi — ham "javob kaliti"ni generate/submit orasida saqlash usuli, ham
// foydalanuvchi uchun tabiiy tarixni beradi. `correctAnswer`/`explanation`
// maydonlari generatsiyadan keyin CLIENTGA YUBORILMAYDI (faqat submit
// javobida) — Everest-Mock'dagi "correct javoblar clientga yubormaslik"
// qoidasi shu yerda ham qo'llanadi (11.2-bo'lim).
const ReadingQuestionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['mcq', 'tfng'], required: true },
    prompt: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true }, // mcq: option matni; tfng: 'True'|'False'|'Not Given'
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const ReadingAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cefr: { type: String, required: true },
  topic: { type: String, default: '' },
  targetWords: [{ type: String }], // Zanjir mexanizmi (6.3) — so'nggi o'rganilgan so'zlar shu yerda
  passage: { type: String, required: true },
  questions: [ReadingQuestionSchema],
  answers: [{ type: String, default: null }],
  // Mock imtihondagi bilan bir xil highlight+note funksiyasi (ExamSession.highlights'ga
  // qarang) — bu yerda esa sahifa arxitekturasiga mos ravishda (javoblar ham faqat
  // /submit'da saqlanadi, autosave yo'q) faqat submit paytida backend'ga yuboriladi.
  highlights: [{ text: String, note: { type: String, default: '' }, color: { type: String, default: 'yellow' } }],
  score: { type: Number, default: null },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
});
ReadingAttemptSchema.index({ userId: 1, createdAt: -1 });

export const ReadingAttempt = mongoose.models.ReadingAttempt || mongoose.model('ReadingAttempt', ReadingAttemptSchema);

const ListeningAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cefr: { type: String, required: true },
  topic: { type: String, default: '' },
  targetWords: [{ type: String }],
  transcript: { type: String, required: true },
  questions: [ReadingQuestionSchema],
  answers: [{ type: String, default: null }],
  highlights: [{ text: String, note: { type: String, default: '' }, color: { type: String, default: 'yellow' } }],
  score: { type: Number, default: null },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
});
ListeningAttemptSchema.index({ userId: 1, createdAt: -1 });

export const ListeningAttempt =
  mongoose.models.ListeningAttempt || mongoose.model('ListeningAttempt', ListeningAttemptSchema);

const WritingAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  task: { type: Number, enum: [1, 2], required: true },
  prompt: { type: String, required: true },
  text: { type: String, required: true },
  wordCount: { type: Number, default: 0 },
  feedback: {
    band: Number,
    criteria: {
      taskAchievement: { band: Number, note: String },
      coherenceCohesion: { band: Number, note: String },
      lexicalResource: { band: Number, note: String },
      grammaticalRange: { band: Number, note: String },
    },
    inlineCorrections: [{ original: String, suggestion: String, reason: String }],
    vocabularyUpgrades: [{ original: String, better: [String] }],
    nextStepsUz: [String],
  },
  createdAt: { type: Date, default: Date.now },
});
WritingAttemptSchema.index({ userId: 1, createdAt: -1 });

export const WritingAttempt = mongoose.models.WritingAttempt || mongoose.model('WritingAttempt', WritingAttemptSchema);

// Audio fayl (blob) SAQLANMAYDI — faqat transkripsiya + AI tahlili. Sabab: media
// yuklash/saqlash (S3 presign) qo'shimcha infratuzilma, bu FAZA doirasida
// ataylab qoldirilmadi (TZ 9.3'dagi "Yozuvni tinglash" tugmasi shuning uchun yo'q).
const SpeakingAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  part: { type: Number, enum: [1, 2, 3], required: true },
  prompt: { type: String, required: true },
  transcript: { type: String, default: '' },
  feedback: {
    band: Number,
    criteria: {
      fluencyCoherence: { band: Number, note: String },
      lexicalResource: { band: Number, note: String },
      grammaticalRange: { band: Number, note: String },
      pronunciation: { band: Number, note: String },
    },
    strengths: [String],
    corrections: [{ original: String, suggestion: String }],
    nextStepsUz: [String],
  },
  createdAt: { type: Date, default: Date.now },
});
SpeakingAttemptSchema.index({ userId: 1, createdAt: -1 });

export const SpeakingAttempt =
  mongoose.models.SpeakingAttempt || mongoose.model('SpeakingAttempt', SpeakingAttemptSchema);

// ============================================================================
// FAZA 4 (VOCABLY-TZ.md §11) — Mock imtihon. github.com/jamalxan/Everest-Mock
// (backend/exam.py) dan PORTLANGAN — server-authoritative taymer, autosave,
// play-once audio, idempotent submit. Asl Python demo `user_id`ni CLIENTDAN
// ishonib oladi (auth qatlami yo'q) — bu yerda esa har doim JWT'dan olingan
// `userId` (src/lib/auth.js) ishlatiladi va har so'rovda egalik tekshiriladi
// (src/app/api/exam/**). Bu — mantiqni "qayta yozish" emas, faqat xavfsizlik
// qatlamini shu ilovaning haqiqiy autentifikatsiyasiga ulash (11.2'dagi
// "Bu mantiqni qayta yozmang" qoidasiga zid emas — taymer/autosave/audio-once/
// submit hisoblash mantig'i lib/exam/engine.ts'da so'zma-so'z bir xil).
const ExamSectionStateSchema = new mongoose.Schema(
  {
    startedAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    locked: { type: Boolean, default: false },
    duration: { type: Number, required: true }, // soniyalarda
  },
  { _id: false }
);

const ExamSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mockId: { type: String, required: true },
  examType: { type: String, default: 'ielts_academic' },
  // TZ §11.3 — "practice"da applyExpiry o'chadi, javob har savoldan keyin
  // ko'rsatiladi, audio qayta ijro etiladi (lib/exam/engine.ts'dagi tekshiruvlar).
  mode: { type: String, enum: ['exam', 'practice'], default: 'exam' },
  status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress' },
  sections: {
    listening: { type: ExamSectionStateSchema, required: true },
    reading: { type: ExamSectionStateSchema, required: true },
    writing: { type: ExamSectionStateSchema, required: true },
    speaking: { type: ExamSectionStateSchema, required: true },
  },
  answers: { type: mongoose.Schema.Types.Mixed, default: {} }, // {questionId: value}
  essays: {
    task1: { type: String, default: '' },
    task2: { type: String, default: '' },
  },
  audio: { type: mongoose.Schema.Types.Mixed, default: {} }, // {sectionKey: {startedAt, plays}}
  // Haqiqiy IELTS interfeysidagi kabi — o'quvchi passage/savol matnidagi istalgan
  // qismni belgilab (highlight) qoldirishi va unga eslatma (note) yozishi mumkin.
  // `text` — belgilangan matnning o'zi (aniq offset emas, chunki kontent AI orqali
  // generatsiya qilingan bo'lsa ham sessiya davomida o'zgarmaydi — matnni qidirib
  // topish yetarli, murakkab offset-tracking shart emas). Backend'da saqlanadi
  // (frontend state emas) — 2026-09-10 so'rovi: "javoblar frontda emas backendda".
  highlights: [
    {
      section: { type: String, enum: ['reading', 'listening'], required: true },
      text: { type: String, required: true },
      note: { type: String, default: '' },
      color: { type: String, default: 'yellow' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  result: { type: mongoose.Schema.Types.Mixed, default: null },
  submittedAt: { type: Date, default: null },
  submitReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
}, {
  // MUHIM: Mongoose standart holatda ({ minimize: true }) saqlashdan oldin BO'SH
  // obyektlarni ({}) hujjatdan butunlay olib tashlaydi. `answers`/`audio` yangi
  // sessiyada aynan {} bo'lib boshlanadi — shuning uchun minimize yoqilgan bo'lsa,
  // bu maydonlar bazada umuman yo'q bo'lib qoladi, keyin publicState() `undefined`
  // qaytaradi va client `answers[q.id]`ni o'qiganda qulaydi (2026-09-10'da topilgan
  // haqiqiy production bug — /app/mock/[id]'da bo'lim boshlanganda "Application
  // error"). minimize: false shu bo'sh obyektlarni ham saqlab qoladi.
  minimize: false,
});
// start'dagi "davom ettirish" so'rovi shu bo'yicha (userId+mockId+status) — exam.py'dagi
// server.py'dan portlangan indeks bilan bir xil.
ExamSessionSchema.index({ userId: 1, mockId: 1, status: 1 });

export const ExamSession = mongoose.models.ExamSession || mongoose.model('ExamSession', ExamSessionSchema);

// FAZA 5 (VOCABLY-TZ.md §13) — har bir XP berilishi shu yerga yoziladi (ReviewEvent'dagi
// bilan bir xil append-only audit naqshi). User.xp — joriy jami (tez o'qish uchun);
// bu kolleksiya esa VAQT OYNASI bo'yicha so'rovlar uchun (haftalik reyting) — faqat
// User.xp'dan buni olib bo'lmaydi, chunki u umr bo'yi jamlanma.
const XpEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true }, // 'review' | 'new_word' | 'mock'
  createdAt: { type: Date, default: Date.now },
});
XpEventSchema.index({ userId: 1, createdAt: -1 });
XpEventSchema.index({ createdAt: -1 }); // haftalik reyting — barcha userlar bo'yicha

export const XpEvent = mongoose.models.XpEvent || mongoose.model('XpEvent', XpEventSchema);
