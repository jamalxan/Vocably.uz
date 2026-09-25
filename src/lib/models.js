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
    // EDU-02 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md — "taxonomy/band/skill yo'q")
    // — IELTS lug'at-ko'nikma bog'lanishi uchun DATA MODEL. Qaysi so'z qaysi
    // band/ko'nikmaga tegishli ekanini TO'LDIRISH alohida KONTENT-KURASIYA
    // vazifasi (bu o'zgarishda ATAYLAB QILINMAGAN — real IELTS taxonomy'ni
    // to'g'ri joylashtirish AI kod chaqiruvi emas, lingvistik kontent ishi).
    // Bu yerda faqat sxema imkoniyati qo'shilmoqda — EDU-03 (xato-asosida
    // avtomatik qo'shilgan so'zlar) shu maydonga yoza oladi, kelgusida to'liq
    // taxonomy curation qilinganda ham struktura tayyor turadi.
    ieltsSkillTag: { type: String, enum: ['reading', 'listening', 'writing', 'speaking', null], default: null },
    ieltsBandLevel: { type: Number, default: null },
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
  // TCH-01 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md — "Rol tanlovi faqat
  // user/admin") — 'teacher' faqat admin tomonidan (admin/chat/users/[id]
  // PATCH, xuddi 'admin' rolini berish bilan bir xil oqim) beriladi, o'zi
  // ro'yxatdan o'ta olmaydi.
  role: { type: String, enum: ['user', 'admin', 'teacher'], default: 'user' },
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
  // H-1 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 H) — "Oxirgi marta ko'rilgan"/onlayn
  // holatini kim ko'rishi mumkinligi. 'friends' — bu ilovada alohida "do'stlar ro'yxati"
  // tushunchasi yo'qligi sababli, eng oddiy talqin bilan: "shu user bilan mavjud suhbati
  // bor kishi" (src/lib/presence.js#shouldShowLastSeen, chat/conversations route'lari
  // shu yerda hisoblanadi — suhbat ro'yxati/oynasi har doim ikkalasi orasida suhbat
  // borligini bildiradi, shuning uchun bu kontekstda 'friends' === 'everyone').
  lastSeenVisibility: { type: String, enum: ['everyone', 'friends', 'nobody'], default: 'everyone' },
  // Profil rasmlari — Telegram uslubida TARIX bilan: massivning 0-elementi HAR DOIM
  // joriy (asosiy) rasm, qolganlari eskiroqlari (yangisi oldinga qo'shiladi, "Asosiy
  // qilish" esa tanlanganini 0-o'ringa ko'chiradi). Har bir rasm ikki o'lchamda
  // saqlanadi (klient kesib/kichraytirib yuklaydi, src/lib/avatarCrop.js): `key` —
  // 640x640 (ko'ruvchi uchun), `smallKey` — 160x160 (ro'yxat/sarlavha avatarlari).
  // Kalitlar S3'da `avatars/{userId}/...` ostida (src/lib/s3.js#buildAvatarKey).
  photos: {
    type: [
      new mongoose.Schema(
        {
          key: { type: String, required: true },
          smallKey: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
        { _id: true }
      ),
    ],
    default: [],
  },
  // Profil rasmini kim ko'radi — lastSeenVisibility bilan bir xil qiymatlar va
  // talqin (src/lib/chatConstants.js#shouldShowLastSeen). Egasi o'zinikini har doim ko'radi.
  photoVisibility: { type: String, enum: ['everyone', 'friends', 'nobody'], default: 'everyone' },
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
  // EDU-01a (VOCABLY_TZ_FINAL...2026-09-20.md §11 "Onboarding") — IELTS
  // tayyorgarlik profili. Barchasi ixtiyoriy/`default: null` — mavjud
  // foydalanuvchilar buni to'ldirmagan holatda ham hech narsa buzilmaydi
  // (Profil sahifasida "O'rnatilmagan" sifatida so'raladi, Dashboard shunga
  // moslashib ko'rsatadi/berkitadi — hech narsani BLOKLAMAYDI).
  targetBand: { type: Number, min: 5, max: 9, default: null }, // 5.0-9.0, 0.5 qadam bilan
  examType: { type: String, enum: ['academic', 'general', null], default: null },
  examDate: { type: Date, default: null },
  // Erkin matn emas — kichik, oddiy enum (TZ "Current level"ni qat'iy
  // formatlamagan, MVP doirasida shu uchtasi yetarli).
  currentLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', null], default: null },
  dailyStudyMinutes: { type: Number, default: null },
  // BILL-01/02 (VOCABLY_TZ_FINAL...2026-09-20.md §46) — entitlement modeli.
  // Bu bosqichda haqiqiy to'lov integratsiyasi YO'Q (checkout emas) — tarif
  // FAQAT admin tomonidan qo'lda tayinlanadi (src/app/api/admin/chat/users/[id]/route.js
  // PATCH), shuning uchun `subscriptionSetAt`/`subscriptionSetBy` audit uchun
  // kim/qachon tayinlaganini saqlaydi. Enum qiymatlari va narx/feature
  // ro'yxati src/lib/entitlements.js'da (hardcode qilinmaydi, TZ §46.2 talabi).
  subscriptionTier: { type: String, enum: ['free', 'standard', 'premium'], default: 'free' },
  subscriptionSetAt: { type: Date, default: null },
  subscriptionSetBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
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
  // G-3 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 G — "Mute: 1 soat / 8 soat / 1 kun /
  // doimiy") — `mutedBy` yuqorida ENDI faqat "doimiy" ovozsizlantirishni bildiradi;
  // muddatli mute shu Map'da alohida saqlanadi (kalit — userId string, qiymat — tugash
  // vaqti). Ikkalasi ham faqat shu userga tegishli (mutedBy kabi). Muddat o'tgach alohida
  // tozalash job'i kerak emas — src/lib/chatConstants.js#isConversationMuted shunchaki
  // "hozir > tugash vaqti" deb tekshiradi (dangasa/lazy expiry).
  mutedUntil: { type: Map, of: Date, default: {} },
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
  // TZ-vocably-v2.md BUG-024 tuzatilishi: har bir tomon suhbatni qachon "tozalagani"
  // (hiddenFor'ga qo'shilgan payt — [id] DELETE). `lastMessageAt`/`lastMessagePreview`
  // IKKALA tomon uchun UMUMIY (bitta xabar ikkalasiga ham tegishli), shuning uchun
  // ularni bitta tomon tozalasa ham o'zgartirib bo'lmaydi (ikkinchi tomonning haqiqiy
  // tarixini buzib qo'yardi). Buning o'rniga GET /conversations HAR BIR foydalanuvchi
  // uchun alohida: agar shu userning clearedAt'i lastMessageAt'dan keyin bo'lsa,
  // preview'ni ko'rsatmaydi (chunki u xabarlar allaqachon shu user uchun deletedFor
  // orqali yashirilgan) — aks holda "oke · 2kun" kabi eski preview ko'rinib, lekin
  // suhbat ochilganda "Hali xabar yo'q" chiqib, foydalanuvchini chalg'itardi.
  clearedAt: { type: Map, of: Date, default: {} },
  // C-10 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.2/§9.3 C) — yuqoriga qadalgan
  // xabarlar, eng ko'pi 5 ta (TZ "5 tagacha" talabi — API tarafda tekshiriladi,
  // src/app/api/chat/conversations/[id]/messages/[messageId]/pin). Ikkala tomon
  // uchun UMUMIY (kim qadagan bo'lishidan qat'iy nazar, ikkalasi ham ko'radi) —
  // mutedBy/nicknames kabi faqat-o'zimga-tegishli maydonlardan farqli.
  pinnedMessageIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], default: [] },
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
  // C-16 — klient tomonidan yaratilgan vaqtinchalik id (UUID), "yuborilmoqda" holatini
  // haqiqiy server _id kelgunga qadar kuzatish uchun. Shuningdek server tarafda oddiy
  // idempotentlik: tarmoq uzilib client qayta yuborsa, xuddi shu clientMessageId bilan
  // ikkinchi hujjat yaratilmaydi (pastdagi POST route'dagi tekshiruvga qarang).
  clientMessageId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});
MessageSchema.index({ conversationId: 1, createdAt: -1 });
// C-16 idempotentlik tekshiruvi (bir suhbat ichida clientMessageId bo'yicha) shu
// indeksga tayanadi — `sparse` chunki eski xabarlarning aksariyatida bu maydon yo'q.
MessageSchema.index({ conversationId: 1, clientMessageId: 1 }, { sparse: true });
// admin/stats'dagi Message.aggregate($group by type) — indeks bo'lmasa har safar butun
// kolleksiyani skanerlaydi; bu indeks bilan faqat indeksning o'zidan hisoblanadi (covered).
MessageSchema.index({ type: 1 });

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

// Admin yaratadigan stiker to'plamlari (src/lib/stickers.js'dagi statik "Standart"
// to'plamga QO'SHIMCHA). Fayllar S3'da `stickers/{packId}/{stickerId}.{ext}`
// (src/lib/s3.js#buildStickerKey). Message.stickerId — stikerning `_id` satri.
// O'chirish YUMSHOQ (`deletedAt`): stiker/to'plam tanlash oynasidan yo'qoladi,
// lekin ilgari yuborilgan xabarlarda ko'rinishda qoladi (Telegram'dagidek).
const StickerItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    mimeType: { type: String, required: true },
    label: { type: String, trim: true, default: '' },
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const StickerPackSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  // O'chirilgan (active=false) to'plam foydalanuvchilarga ko'rinmaydi — admin
  // tayyorlab bo'lgach yoqadi.
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  stickers: { type: [StickerItemSchema], default: [] },
  deletedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
});
StickerPackSchema.index({ deletedAt: 1, order: 1 });
StickerPackSchema.index({ 'stickers._id': 1 });

export const StickerPack = mongoose.models.StickerPack || mongoose.model('StickerPack', StickerPackSchema);

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
  // H-2 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 H — "sabab kategoriyasi + xabar
  // konteksti admin'ga boradi") — ilgari faqat erkin `reason` matni bor edi. Kategoriya
  // ro'yxati src/lib/chatConstants.js#REPORT_REASON_CATEGORIES (client select va admin
  // ReportsQueue.jsx yorlig'i shu bitta manbadan). Bu maydon qo'shilishidan OLDINGI
  // eski report'larda yo'q — default 'other' bilan orqaga moslik ta'minlanadi.
  category: { type: String, enum: ['spam', 'harassment', 'inappropriate_content', 'other'], default: 'other' },
  // Endi ixtiyoriy qo'shimcha izoh — asosiy signal yuqoridagi `category`.
  reason: { type: String, trim: true, default: '' },
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

// BILL-01/02 — /narxlar sahifasidagi STANDARD/PREMIUM "Bog'lanish" tugmasi
// bosilganda shu yerga yoziladi. HECH QANDAY to'lov maydoni yo'q (karta,
// summa va h.k.) — bu checkout emas, faqat "kim qaysi tarifga qiziqdi"
// degan belgi, admin keyin qo'lda (Telegram/telefon orqali) bog'lanadi va
// UsersTable'dan tarifni tayinlaydi.
const BillingInterestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  tier: { type: String, enum: ['standard', 'premium'], required: true },
  createdAt: { type: Date, default: Date.now },
});
BillingInterestSchema.index({ createdAt: -1 });

export const BillingInterest =
  mongoose.models.BillingInterest || mongoose.model('BillingInterest', BillingInterestSchema);

// TZ-vocably-v2.md §D1.6 — soatlik AI generatsiya limiti (src/lib/ai/client.js
// checkAndIncrementAiRateLimit). RateLimitHit'dan farqli o'laroq bucket kaliti
// (userId, hourBucket) juftligi — bir soat davomida bitta hujjat, TTL orqali
// 2 soatdan keyin avtomatik o'chadi (`expiresAt` alohida maydon, chunki bucket
// boshlanishi emas, tugashi bo'yicha muddat kerak).
const AiUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hourBucket: { type: String, required: true }, // "YYYY-M-D-H" (UTC)
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 },
});
AiUsageSchema.index({ userId: 1, hourBucket: 1 }, { unique: true });

export const AiUsage = mongoose.models.AiUsage || mongoose.model('AiUsage', AiUsageSchema);

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
  // TZ-vocably-v2.md §C3 F-W1 (BUG-014) — Task 1 uchun: AI'ning struktura ma'lumoti
  // (chartType/title/categories/series) va undan renderChartSvg() bilan chizilgan
  // SVG/jadval matni. Task 2 uchun ikkalasi ham null — grafik shart emas.
  chart: { type: mongoose.Schema.Types.Mixed, default: null },
  chartSvg: { type: String, default: '' },
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
// Eski (Everest-Mock'dan portlangan) `ExamSession` dvigateli TZ §20 migratsiyasi
// YAKUNLANGANDA (2026-09-12) shu yerdan o'chirildi — pastdagi `ExamTest`/
// `ExamAttempt` uni to'liq almashtirdi (`/app/oqish`, `/app/tinglash`,
// `/app/yozish`, `/app/mock`, `/app/gapirish` barchasi endi shularga ishlaydi).
// ============================================================================
// TZ-vocably-v2.md (IELTS CD Exam Engine v1.0) §3 — exam engine modellari
// (eski `ExamSession`ni to'liq almashtirgan, yuqoridagi izohga q.). Model
// nomlari ataylab `ExamTest`/`ExamAttempt` (TZ'dagi `Test`/`Attempt` emas) —
// `src/lib/exam/types.ts`dagi bir xil nomli TS interfeyslar bilan chalkashmasin
// va kodda grep qilinganda "yangi dvigatel" ekani darhol ko'rinsin uchun.
//
// `sections` (kontent — passage/audio/savollar/javob kalitlari) va `answers`/
// `audio`/`essays`/`events` (urinish holati) ATAYLAB Mixed: TZ §3'dagi chuqur
// ichma-ich turlar (Test -> sections -> passages -> questionGroups -> questions)
// DB sxemasi darajasida emas, ilova darajasida (`types.ts` + admin validator,
// TZ §15.2, Faza 4) tekshiriladi — xuddi eski `ExamSession.answers` kabi.
// ============================================================================

const ExamTestSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  module: { type: String, enum: ['academic', 'general'], default: 'academic' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  // { listening?, reading?, writing?, speaking? } — TZ §3.2-3.4, §3 SpeakingSection
  sections: { type: mongoose.Schema.Types.Mixed, default: {} },
  // §10.2 — odatda bo'sh (default jadval ishlatiladi), faqat testga xos konversiya
  // kerak bo'lsa to'ldiriladi.
  bandTable: { type: mongoose.Schema.Types.Mixed, default: null },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },

  // TZ-vocably-v2.md (AI Content Ingestion Agent) §6.6 — kitobdan avtomatik
  // yaratilgan testlar uchun. Qo'lda (JSON/DSL) yaratilgan testlarda `source`
  // `null` bo'lib qoladi — ikkalasi ham xuddi shu `ExamTest` hujjati, faqat
  // kelib chiqishi farqlanadi. Barchasi ixtiyoriy/default'li — mavjud 4 ta
  // qo'lda yaratilgan test bu maydonlarsiz ham to'g'ri ishlayveradi.
  source: {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentBook', default: null },
    bookTitle: { type: String, default: '' },
    testIndex: { type: Number, default: null },
    // Admin AI chat orqali yaratilganda (worker pipeline'idan farqli —
    // u yerda `bookId` bor) qaysi `AgentAttachment`dan kelib chiqqanini
    // saqlaydi. 2026-09-24, jonli Chrome sinovida topilgan xato: bitta
    // "joylashtirish" taklifi ikki marta bosilsa (yoki qayta yuborilsa),
    // bir xil (attachmentId, testIndex) uchun IKKINCHI marta test
    // yaratilmasin — `apply/route.js#ingestOneTest` shu juftlik bo'yicha
    // avval qidiradi.
    agentAttachmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentAttachment', default: null },
    // docs/ai-content-agent-tz.md §28 / avtopilot §5 S15 "mock_scheduler" —
    // bitta kitobda L/R/W'ning barchasi bo'lmasa (masalan faqat Reading
    // kitobi), lekin BOSHQA nashr qilingan testlarda yetishmagan bo'limlar
    // mavjud bo'lsa, scheduler ularni BITTA "mixed mock"ga BIRLASHTIRADI —
    // yangi kontent TO'QIMAYDI, faqat qayta joylashtiradi. Shunday hujjatda
    // `bookId` yagona manba bo'lmagani uchun `null` qoladi, o'rniga har bir
    // bo'lim qaysi asl testdan olinganini shu yerda saqlaydi.
    composedFrom: [
      {
        testId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest' },
        sectionKey: { type: String, enum: ['listening', 'reading', 'writing', 'speaking'] },
      },
    ],
  },
  availability: {
    practiceReading: { type: Boolean, default: true },
    practiceListening: { type: Boolean, default: true },
    practiceWriting: { type: Boolean, default: true },
    practiceSpeaking: { type: Boolean, default: true },
    fullMock: { type: Boolean, default: true },
  },
  qa: {
    score: { type: Number, default: null },
    blockers: { type: Number, default: 0 },
    warnings: { type: Number, default: 0 },
    validatedAt: { type: Date, default: null },
  },

  // AUDIT EX-06/N-06 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md, Sprint 1) —
  // qat'iy IELTS mock shakliga (3x40 Reading, 4x10 Listening, 2 Writing task)
  // mos-emasligini oldindan bilish uchun. NOT user-settable directly — faqat
  // publish vaqtida `contentValidator.ts#checkMockEligibility` hisoblab
  // yozadi (`isPublished`/`isMockEligible/[id]/route.js` PATCH va POST).
  isMockEligible: { type: Boolean, default: false },

  // AUDIT LEGAL-01 (VOCABLY_TZ_FINAL... 2026-09-20 §17) — kontentning huquqiy
  // kelib chiqishi. Default `sourceType:'own', publishScope:'public'` — mavjud
  // testlarni (bu maydon qo'shilishidan OLDIN yaratilgan) to'satdan bloklamaydi;
  // gate faqat admin ONGLI ravishda `third_party_copyright` deb belgilaganda
  // ishga tushadi (`contentValidator.ts` `checkCopyright`, publish vaqtida).
  rights: {
    sourceType: {
      type: String,
      enum: ['own', 'licensed', 'public_domain', 'third_party_copyright', 'ai_generated_original'],
      default: 'own',
    },
    publisher: { type: String, default: '' },
    licence: { type: String, default: '' },
    licenceNote: { type: String, default: '' },
    rightsVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rightsVerifiedAt: { type: Date, default: null },
    publishScope: { type: String, enum: ['public', 'organization', 'private'], default: 'public' },
  },

  // docs/ai-content-agent-tz-avtopilot.md §4.4 — kim nashr qildi. Qo'lda
  // (JSON/DSL/admin "Nashr qilish" tugmasi) yaratilgan testlarda hamon
  // `'admin'` (default) — orqaga mos, mavjud 4 ta test buzilmaydi.
  publishedBy: { type: String, enum: ['admin', 'ai-agent'], default: 'admin' },
  autoPublishedAt: { type: Date, default: null },
  reviewSummary: {
    autoAccepted: { type: Number, default: 0 },
    humanReviewed: { type: Number, default: 0 },
    selfHealed: { type: Number, default: 0 },
  },
});

export const ExamTest = mongoose.models.ExamTest || mongoose.model('ExamTest', ExamTestSchema);

// AUDIT P0-05 (VOCABLY_TZ_FINAL... 2026-09-20 §3) — "ExamAttempt live ExamTest'ga
// bog'langan. Immutable test version/snapshot yo'q." Admin nashr qilingan testni
// o'zgartirsa, eski attempt review qilinganda savol matni/javob kaliti/audio boshqa
// versiyaga o'tib ketishi mumkin edi. Bu model shu holatning oldini oladi: har bir
// urinish YARATILGAN PAYTDAGI test kontenti to'liq (`snapshot`) shu yerga "muzlatib"
// qo'yiladi, attempt esa `ExamTest`ga emas, shu muzlatilgan versiyaga bog'lanadi
// (`ExamAttempt.testVersionId`, pastda). Bir xil kontent uchun qayta-qayta nusxa
// yaratilmasligi uchun `contentHash` bo'yicha deduplikatsiya qilinadi
// (`attemptServer.ts` `getOrCreateTestVersion`).
const ExamTestVersionSchema = new mongoose.Schema({
  parentTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest', required: true, index: true },
  versionNumber: { type: Number, required: true },
  // sha256(module+sections+bandTable) — bir xil kontent uchun bir xil hash,
  // shuning uchun admin test hujjatini saqlab qo'ysa-yu mazmuni o'zgarmasa
  // (masalan faqat `isPublished`ni bosib qo'ysa) yangi versiya CHIQARILMAYDI.
  contentHash: { type: String, required: true, index: true },
  // Attempt yaratilgan paytdagi to'liq Test shakli (slug/title/module/difficulty/
  // sections/bandTable) — review/scoring shu yerdan o'qiladi, live ExamTest'dan EMAS.
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
  publishedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'superseded'], default: 'active' },
});
// unique: 2 ta parallel so'rov bir xil (parentTestId, contentHash) uchun bir
// vaqtda versiya yaratmoqchi bo'lsa (masalan mock uchun "$sample" bilan bir xil
// test 2 marta tanlanib qolsa), DB darajasida ikkinchisini rad etadi —
// `getOrCreateTestVersion` (attemptServer.ts) buni tutib, g'olib versiyani qaytaradi.
ExamTestVersionSchema.index({ parentTestId: 1, contentHash: 1 }, { unique: true });
ExamTestVersionSchema.index({ parentTestId: 1, versionNumber: -1 });

export const ExamTestVersion = mongoose.models.ExamTestVersion || mongoose.model('ExamTestVersion', ExamTestVersionSchema);

// AUDIT PERF/xavfsizlik (VOCABLY_TZ_FINAL... 2026-09-20 §23, "Event log:
// Arbitrary `type`ni enum bilan whitelist qilish") — avvalgi versiyada
// `events[].type` ISTALGAN string qabul qilardi (faqat "bo'sh emasmi"
// tekshirilardi, route.js). Backend qabul qiladigan qiymatlar TO'PLAMI ochiq
// bo'lib qolishi kerak emas — TZ §14/§52.6 o'zi aniq nomlagan uchtasi (tab
// switch, fullscreen exit, paste) + ular bilan tabiiy juftlashadigan
// qarama-qarshi holatlar. `route.js` (`/api/exam/attempts/[id]/event`) HAM
// shu ro'yxatni import qilib, Mongoose validatsiya xatosi sifatida emas, aniq
// 400 bilan rad etadi — ikkala qatlam (API + schema) bitta ro'yxatni baham
// ko'radi. AUDIT Sprint 2/§52.6 — bu endpoint endi client tomonidan
// HAQIQATDA chaqiriladi (useIntegrityEvents.ts, mode:'mock' mock urinishlar
// uchun, faqat mockKind !== 'practice'da) — avval qurilgan-lekin-ulanmagan edi.
export const ATTEMPT_EVENT_TYPES = ['visibility_hidden', 'visibility_visible', 'fullscreen_exit', 'fullscreen_enter', 'paste', 'copy', 'blur', 'focus'];

const ExamAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest', required: true },
    // P0-05 — shu urinish qaysi MUZLATILGAN test snapshotiga bog'langan.
    // `null` bo'lishi mumkin: shu migratsiyadan OLDIN yaratilgan eski urinishlar
    // uchun (orqaga moslik) — bunday holda kod live `ExamTest`ga qaytadi
    // (`resolveTestForAttempt`, attemptServer.ts).
    testVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTestVersion', default: null },
    // 'practice' — VOCABLY_TZ_FINAL...2026-09-20.md "Practice mode" (Listening:
    // replay/tezlik erkin, Reading/Writing hali qurilmagan). `mode:'section'`
    // bilan bir xil shaklda (bitta bo'lim), faqat cheksizga yaqin `endsAt`
    // bilan yaratiladi (POST /attempts route.js) va tarix grafigiga qo'shilmaydi
    // (getAttemptHistory, attemptServer.ts) — bu "haqiqiy" urinish emas.
    mode: { type: String, enum: ['mock', 'section', 'practice'], default: 'section' },
    // AUDIT Sprint 2/§52.1 — "Mock rejimlari: Practice / Exam Simulation /
    // Secure Mock" — faqat `mode:'mock'` uchun ma'noga ega (boshqa `mode`larda
    // ishlatilmaydi, default qiymatida qoladi). `'exam'` default — mavjud
    // eski mock urinishlar (shu maydon qo'shilishidan OLDIN yaratilgan) ilgari
    // amalda bo'lgan qat'iy-timer/section-locking xatti-harakatini saqlab
    // qoladi (orqaga moslik — attempts/route.js va attemptServer.ts izohiga q.).
    mockKind: { type: String, enum: ['practice', 'exam', 'secure'], default: 'exam' },
    sections: [{ type: String, enum: ['listening', 'reading', 'writing', 'speaking'] }],
    currentSection: { type: String, enum: ['listening', 'reading', 'writing', 'speaking'], required: true },
    status: { type: String, enum: ['in_progress', 'submitted', 'graded', 'expired', 'abandoned'], default: 'in_progress' },

    // Taymer — SERVER manbai (TZ §4.2). Klient faqat ko'rsatadi.
    startedAt: { type: Date, default: Date.now },
    sectionStartedAt: { type: Date, default: Date.now },
    endsAt: { type: Date, required: true },
    pausedSec: { type: Number, default: 0 }, // faqat practice rejimda

    answers: { type: mongoose.Schema.Types.Mixed, default: {} }, // { "q12": AnswerValue }
    flagged: [{ type: Number }],
    lastQuestion: { type: Number, default: 0 },

    audio: {
      partIndex: { type: Number, default: 0 },
      positionSec: { type: Number, default: 0 },
      playedParts: [{ type: Number }],
      volume: { type: Number, default: 1 },
    },

    essays: {
      task1: {
        text: { type: String, default: '' },
        wordCount: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      task2: {
        text: { type: String, default: '' },
        wordCount: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
    },

    // Yaxlitlik (TZ §14) — halol bo'lish maqsadida faqat log, hech narsani bloklamaydi.
    events: [
      {
        type: { type: String, required: true, enum: ATTEMPT_EVENT_TYPES },
        at: { type: Date, default: Date.now },
        meta: { type: mongoose.Schema.Types.Mixed, default: null },
      },
    ],
    tabSwitchCount: { type: Number, default: 0 },

    // TZ §19 Faza 4 item 23 — Speaking: yozib olingan javoblar ro'yxati.
    // `essays` kabi sobit task1/task2 kalitlar EMAS (Speaking'da bir nechta
    // alohida javob bor) — part+questionIndex juftligi bo'yicha upsert
    // qilinadi (speaking-recording route.js).
    speaking: {
      recordings: [
        {
          part: { type: Number, enum: [1, 2, 3], required: true },
          questionIndex: { type: Number, required: true },
          audioFileId: { type: String, required: true },
          transcript: { type: String, default: '' },
          durationSec: { type: Number, default: 0 },
          recordedAt: { type: Date, default: Date.now },
        },
      ],
    },

    // TZ §6.3 / §19 Faza 3 item 19 — Reading passage'da matn belgilash +
    // eslatma. Faqat Reading (§6 butunlay Reading UI'siga bag'ishlangan —
    // Listening'da imtihon paytida transkript ko'rsatilmaydi, belgilaydigan
    // matn yo'q). Offset-based (TZ'ning o'zidagi interfeys) — DOM qayta
    // chizilganda TreeWalker bilan aniq Range tiklash uchun.
    highlights: [
      {
        passageOrder: { type: Number, required: true },
        paragraphIndex: { type: Number, required: true },
        startOffset: { type: Number, required: true },
        endOffset: { type: Number, required: true },
        note: { type: String, default: '' },
      },
    ],

    result: { type: mongoose.Schema.Types.Mixed, default: null },
    submittedAt: { type: Date, default: null },
  },
  // ExamSession'dagi kabi: bo'sh {}/[] maydonlar minimize:true bilan saqlashdan
  // oldin butunlay yo'qolib qolmasin (yuqoridagi ExamSessionSchema izohiga q.).
  { minimize: false }
);
ExamAttemptSchema.index({ userId: 1, testId: 1, currentSection: 1, status: 1 });

// AUDIT PERF (§23, "Mongo indexes yo'q") — TZ hujjatining o'zi taklif qilgan
// `userId+mode+status`/`userId+createdAt`/`testId+createdAt` O'RNIGA, REPO
// ICHIDAGI HAQIQIY so'rovlar qidirib topilib (`grep -rn "ExamAttempt.find"`),
// ULARGA aniq mos indekslar qo'shildi — taxminiy emas:
//  - {userId, mode, status}: active-mock/route.js + attempts/route.js'dagi
//    "davom etayotgan mock/section bormi" tekshiruvlari (har urinish
//    yaratishda/GET active-mock'da chaqiriladi).
//  - {testId, status}: admin/exam-tests/[id]/stats/route.js — bitta test
//    bo'yicha barcha 'graded' urinishlarni yig'adi (savol-turi statistikasi).
//  - {userId, status, submittedAt}: attemptServer.ts `getAttemptHistory` —
//    aynan shu maydonlar bo'yicha filtrlab, `submittedAt`ga qarab saralaydi
//    (TZ o'zi taklif qilgan `createdAt` EMAS — kod haqiqatda `submittedAt`
//    ishlatadi).
ExamAttemptSchema.index({ userId: 1, mode: 1, status: 1 });
ExamAttemptSchema.index({ testId: 1, status: 1 });
ExamAttemptSchema.index({ userId: 1, status: 1, submittedAt: -1 });

export const ExamAttempt = mongoose.models.ExamAttempt || mongoose.model('ExamAttempt', ExamAttemptSchema);

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

// ============================================================================
// TZ-vocably-v2.md (AI Content Ingestion Agent, 2026-09-12) §6 — "admin kitob
// (PDF), audio va rasm yuklaydi — tizim qolganini o'zi qiladi." M1 bosqichi:
// R2 yuklash + kolleksiyalar + kitob CRUD/UI (TZ §19/§21). Bosqichlab ishlov
// berish (BullMQ worker, Lightsail'da) va AI parse (OpenRouter router) —
// alohida infratuzilma (Redis, Docker worker, Cloudflare R2 hisobi,
// OpenRouter API kaliti) talab qiladi va BU SESSIYADA yo'q (tarmoqsiz
// sandbox) — shuning uchun M1'dan faqat kredensialsiz qurilishi VA
// tekshirilishi mumkin bo'lgan qism qurilgan: kolleksiyalar, R2 klienti,
// kitob CRUD API'lari, yuklash sehrgari UI. `ingest_jobs` hujjati worker
// ULANMAGANI uchun ATAYLAB "queued" holatida qotib qoladi — bu yolg'on
// "succeeded" ko'rsatishdan ko'ra to'g'riroq (worker ulanganda shu yerdan
// davom etadi, kod o'zgarishi shart emas).
// ============================================================================

// §6.1 — bitta yuklangan kitob (PDF + unga tegishli audio fayllar manbasi).
const ContentBookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  publisher: { type: String, default: '' },
  series: { type: String, default: '' },
  volume: { type: Number, default: null },
  module: { type: String, enum: ['academic', 'general', 'both'], default: 'academic' },
  language: { type: String, default: 'en' },

  // §16 — huquqiy himoya: bu ikki maydon majburiy, API darajasida
  // `licence:'third_party_copyright'` + `publishScope:'public'` bloklanadi
  // (src/app/api/admin/books/route.js).
  licence: {
    type: String,
    enum: ['own', 'licensed', 'public_domain', 'third_party_copyright'],
    required: true,
  },
  licenceNote: { type: String, default: '' },
  publishScope: { type: String, enum: ['private', 'internal', 'public'], default: 'private' },

  source: {
    pdfAssetId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentAsset', default: null },
    pageCount: { type: Number, default: null },
    hasTextLayer: { type: Boolean, default: null },
    sha256: { type: String, default: null },
  },

  status: {
    type: String,
    enum: ['uploaded', 'processing', 'needs_review', 'ready', 'published', 'failed'],
    default: 'uploaded',
  },
  progress: {
    stage: { type: String, default: '' },
    percent: { type: Number, default: 0 },
    message: { type: String, default: '' },
  },

  detected: {
    tests: { type: mongoose.Schema.Types.Mixed, default: [] },
    answerKeyPages: { type: [Number], default: [] },
    audioscriptPages: { type: [Number], default: [] },
    generatedTestIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest' }],
  },

  stats: {
    totalCostUsd: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    durationSec: { type: Number, default: 0 },
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // docs/ai-content-agent-tz-avtopilot.md §4.4/§3.2 — global
  // `AutomationPolicy`ni shu kitob uchun almashtiradi (topilmasa global
  // ishlatiladi). `null` — override yo'q (odatiy holat).
  automationLevel: { type: String, enum: ['manual', 'assisted', 'autopilot'], default: null },
});
ContentBookSchema.index({ status: 1, createdAt: -1 });

export const ContentBook = mongoose.models.ContentBook || mongoose.model('ContentBook', ContentBookSchema);

// §6.2 — R2'ga yuklangan/generatsiya qilingan har bir fayl (PDF, audio,
// rasm, sahifa render'i) uchun bitta hujjat — real bayt saqlanadi R2'da,
// bu yerda faqat metama'lumot + `storage.key`.
const ContentAssetSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentBook', default: null },
  // §50.2 — 'docx' MongoDB TZ_V2 AUDIT'dagi ko'p-format talabiga javoban
  // qo'shildi (PDF'ning muqobili — bitta kitobga bitta manba hujjat, xuddi
  // 'pdf' kabi `ContentBook.source.pdfAssetId`ga yoziladi, faqat matn
  // formati farq qiladi — src/lib/contentAgent/sourceFormat.ts izohiga q.).
  kind: { type: String, enum: ['pdf', 'docx', 'audio', 'image', 'page_render'], required: true },
  storage: {
    bucket: { type: String, required: true },
    key: { type: String, required: true },
    bytes: { type: Number, required: true },
    contentType: { type: String, required: true },
    sha256: { type: String, default: null },
  },
  audio: {
    durationMs: { type: Number, default: null },
    sampleRate: { type: Number, default: null },
    channels: { type: Number, default: null },
    bitrateKbps: { type: Number, default: null },
    transcript: { type: mongoose.Schema.Types.Mixed, default: null },
    parentAssetId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentAsset', default: null },
    cutFrom: { startMs: Number, endMs: Number },
  },
  image: {
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    pageNumber: { type: Number, default: null },
    bbox: { type: [Number], default: undefined },
  },
  usage: {
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest', default: null },
    sectionKey: { type: String, default: null },
    partIndex: { type: Number, default: null },
    questionGroupId: { type: String, default: null },
  },
  createdAt: { type: Date, default: Date.now },
});
ContentAssetSchema.index({ bookId: 1, kind: 1 });

export const ContentAsset = mongoose.models.ContentAsset || mongoose.model('ContentAsset', ContentAssetSchema);

// §6.3 — pipeline'ning har bosqichi uchun bitta job hujjati (BullMQ worker
// ULANGANDA shu yerdan navbatni to'ldiradi/o'qiydi — hozircha faqat "queued"
// holatida yozib qo'yiladi, TZ §21 M1 qabul mezoniga mos: "job navbatga
// tushadi", worker ulanmagani hujjatning o'zida ko'rinadi).
const IngestJobSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentBook', required: true },
  stage: {
    type: String,
    enum: [
      'extract', 'segment', 'split_sections', 'parse_reading', 'parse_listening',
      'parse_writing', 'parse_speaking', 'parse_answerkey', 'extract_images',
      'process_audio', 'assemble', 'validate', 'qa',
    ],
    required: true,
  },
  status: { type: String, enum: ['queued', 'running', 'succeeded', 'failed', 'cancelled'], default: 'queued' },
  attempt: { type: Number, default: 0 },
  input: { type: mongoose.Schema.Types.Mixed, default: {} },
  output: { type: mongoose.Schema.Types.Mixed, default: {} },
  error: {
    message: { type: String, default: '' },
    stack: { type: String, default: '' },
    retryable: { type: Boolean, default: true },
  },
  metrics: {
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    costUsd: { type: Number, default: 0 },
    tokensIn: { type: Number, default: 0 },
    tokensOut: { type: Number, default: 0 },
  },
  idempotencyKey: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});
IngestJobSchema.index({ bookId: 1, stage: 1 });
IngestJobSchema.index({ status: 1, createdAt: 1 });

export const IngestJob = mongoose.models.IngestJob || mongoose.model('IngestJob', IngestJobSchema);

// §6.4 — har AI chaqiruvi uchun audit yozuvi (worker/ai/router.ts ULANGANDA
// to'ldiriladi — TZ §5.1 "har chaqiruvni ai_calls'ga yozish"). Hozircha
// bo'sh turadi, lekin admin panel xarajat ekrani (§11.5) shu kolleksiyaga
// so'rov yuborishga tayyor bo'lishi uchun oldindan qo'yilgan.
const AiCallSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'IngestJob', default: null },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentBook', default: null },
  taskKey: { type: String, required: true },
  model: { type: String, required: true },
  promptVersion: { type: String, default: '' },
  tokensIn: { type: Number, default: 0 },
  tokensOut: { type: Number, default: 0 },
  costUsd: { type: Number, default: 0 },
  latencyMs: { type: Number, default: 0 },
  ok: { type: Boolean, default: true },
  validationErrors: { type: [String], default: [] },
  inputHash: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
AiCallSchema.index({ bookId: 1, createdAt: -1 });
AiCallSchema.index({ taskKey: 1, createdAt: -1 });

export const AiCall = mongoose.models.AiCall || mongoose.model('AiCall', AiCallSchema);

// §6.5 — tekshiruv navbati (§11.3): AI ishonchi past yoki validatsiya
// xatosi bo'lgan savol guruhlari shu yerga tushadi, admin ko'rib chiqadi.
const ReviewItemSchema = new mongoose.Schema({
  // N-10 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md, Sprint 1) — `bookId` WAS
  // required, but manually/admin-created `ExamTest` docs (JSON/DSL import,
  // not the AI content-ingestion pipeline) have no `ContentBook` at all —
  // made optional (default null) so `contentValidator.ts#validateTest`
  // warnings for those tests (see `reason: 'content_validator_warning'`
  // below) have somewhere to persist too.
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentBook', default: null },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest', default: null },
  target: {
    sectionKey: { type: String, enum: ['listening', 'reading', 'writing', 'speaking'], required: true },
    partIndex: { type: Number, default: null },
    groupId: { type: String, default: null },
    questionNumber: { type: Number, default: null },
  },
  reason: {
    type: String,
    enum: [
      'low_confidence',
      'validation_failed',
      'qa_disagreement',
      'missing_answer',
      'image_unmatched',
      'word_limit_violation',
      // docs/ai-content-agent-tz-avtopilot.md §5 S12.5 "self_heal" — orchestrator
      // avtomatik tuzatishga bir necha marta urinib (`AutomationPolicy.
      // autoSelfHealMaxAttempts`) baribir muvaffaqiyatsiz bo'lsa, `reason`
      // shu qiymatga YANGILANADI (original 'qa_disagreement' ustidan) — admin
      // "AI umuman ko'rmagan" bilan "AI urindi-yu, ololmadi"ni farqlab ko'rsin.
      'self_heal_exhausted',
      // N-10 — manually-created `ExamTest` docs have no `ContentBook`, so
      // `contentValidator.ts#validateTest` warnings/errors for them are
      // synced into the review queue with this reason instead (see
      // `src/lib/exam/reviewSync.ts`), distinct from the AI pipeline's
      // `validation_failed` (which is always tied to a real `bookId`).
      'content_validator_warning',
    ],
    required: true,
  },
  severity: { type: String, enum: ['blocker', 'warning'], required: true },
  confidence: { type: Number, default: null },
  evidence: {
    pageNumber: { type: Number, default: null },
    pageImageUrl: { type: String, default: '' },
    bbox: { type: [Number], default: undefined },
    rawText: { type: String, default: '' },
  },
  proposed: { type: mongoose.Schema.Types.Mixed, default: null },
  status: { type: String, enum: ['open', 'fixed', 'accepted', 'rejected'], default: 'open' },
  // docs/ai-content-agent-tz-avtopilot.md §2 item 2/§5 S13 — avvalgi versiyada
  // faqat admin ObjectId'i bo'lardi. Endi AI'ning o'zi avto-qabul qilsa,
  // literal `'ai-agent'` yoziladi (ObjectId emas) — shuning uchun Mixed.
  fixedBy: { type: mongoose.Schema.Types.Mixed, default: null },
  fixedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});
ReviewItemSchema.index({ bookId: 1, status: 1, severity: 1 });

export const ReviewItem = mongoose.models.ReviewItem || mongoose.model('ReviewItem', ReviewItemSchema);

// §5.1/§11.5 — "Hech bir bosqich modelga qattiq bog'lanmaydi... yaxshiroq
// model chiqsa admin paneldagi bitta dropdown o'zgartiriladi, kod
// tegilmaydi." Bitta hujjat = bitta `taskKey`. `src/lib/contentAgent/
// aiRouter.js` chaqiruvdan OLDIN shu yerdan o'qiydi (DB'da yo'q taskKey
// uchun modulning o'z ichki standart qiymatiga qaytadi — §5.2 dagi
// boshlang'ich matritsa), shuning uchun bu kolleksiya bo'sh bo'lsa ham
// router ishlayveradi.
const AiTaskConfigSchema = new mongoose.Schema({
  taskKey: { type: String, required: true, unique: true },
  primary: { type: String, required: true },
  fallback: { type: [String], default: [] },
  temperature: { type: Number, default: 0.2 },
  maxTokens: { type: Number, default: 8000 },
  costCapUsd: { type: Number, default: 1 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  updatedAt: { type: Date, default: Date.now },
});

export const AiTaskConfig = mongoose.models.AiTaskConfig || mongoose.model('AiTaskConfig', AiTaskConfigSchema);

// ============================================================================
// docs/ai-content-agent-tz-avtopilot.md (v1.1 — "Avtopilot qo'shimchasi", §4)
// — M7 qatlami: admin pipeline bosqichlari orasida qo'lda tugma bosmasin,
// policy ruxsat bergan darajada AI o'zi qaror qabul qilsin. Bu ikki
// kolleksiya shu qatlamning ma'lumot asosi; orchestrator (worker/
// orchestrator/*) va real S12.5/S13/S14/S15 bosqichlari M2-M6'dagi asosiy
// pipeline (S1-S12) qurilgandan keyin keladi (§9) — hozircha bu yerda
// faqat policy'ning o'zi va uni o'qish/yozish, jurnal yozuvlari va ularni
// KO'RSATISH qatlami bor.
// ============================================================================

// §4.1 — `scope:'global'` bitta hujjat (odatda yagona yozuv), `scope:{bookId}`
// faqat kerak bo'lgandagina (bitta kitobga override) yaratiladi.
const AutomationPolicySchema = new mongoose.Schema({
  scope: { type: String, enum: ['global', 'book'], required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentBook', default: null }, // faqat scope:'book'
  level: { type: String, enum: ['manual', 'assisted', 'autopilot'], default: 'assisted' },
  autoAcceptConfidence: { type: Number, default: 0.93 },
  autoPublishMinQaScore: { type: Number, default: 0.95 },
  autoSelfHealMaxAttempts: { type: Number, default: 2 },
  autoMockGeneration: { type: Boolean, default: true },
  autoContentGapScan: { type: Boolean, default: false },
  maxAutonomousCostUsdPerDay: { type: Number, default: 15 },
  // §3.3 item 6 — admin istalgan payt bitta tugma bilan butun orchestrator'ni
  // pauza qiladi. Faqat `scope:'global'` hujjatida ma'noga ega.
  paused: { type: Boolean, default: false },
  pausedAt: { type: Date, default: null },
  pausedReason: { type: String, default: '' }, // masalan 'cost_cap_exceeded' yoki 'admin_manual'
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  updatedAt: { type: Date, default: Date.now },
});
AutomationPolicySchema.index({ scope: 1, bookId: 1 }, { unique: true });

export const AutomationPolicy = mongoose.models.AutomationPolicy || mongoose.model('AutomationPolicy', AutomationPolicySchema);

// §4.2 — avtonom (AI o'zi qabul qilgan) qarorlar jurnali. Mavjud
// `AdminAuditLog`dan ATAYLAB alohida: bu yerga har mayda avto-qabul ham
// yoziladi (bitta kitobda yuzlab bo'lishi mumkin), `AdminAuditLog`ni
// shishirmaslik uchun. Admin panelda "AI faoliyati jurnali" sifatida va
// `/admin/audit-log`dagi "Aktyor: AI agent" filtrida ko'rsatiladi.
const AgentActionSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentBook', default: null },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest', default: null },
  reviewItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReviewItem', default: null },
  action: {
    type: String,
    enum: [
      'auto_accept',
      'self_heal',
      'auto_publish',
      'auto_mock_create',
      'content_gap_detected',
      'autopilot_paused_cost_cap',
      'audio_boundary_auto_confirmed',
    ],
    required: true,
  },
  reasoning: { type: String, default: '' },
  beforeConfidence: { type: Number, default: null },
  afterConfidence: { type: Number, default: null },
  costUsd: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
AgentActionSchema.index({ createdAt: -1 });
AgentActionSchema.index({ bookId: 1, action: 1 });

export const AgentAction = mongoose.models.AgentAction || mongoose.model('AgentAction', AgentActionSchema);

// ============================================================================
// TCH-01/02 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md — "Teacher role yo'q",
// "Classroom/assignment modeli yo'q") — MVP qatlami. To'liq spec
// (VOCABLY_TZ_FINAL...2026-09-20.md §18/§53) multi-tenancy (Organization),
// RBAC/ABAC, AI copilot (feedback qoralamasi) va chuqur class analytics'ni
// ham nazarda tutadi — bu ATAYLAB QILINMAGAN (ko'p haftalik alohida ish,
// §19 P1/P2'da rejalashtirilgan). Bu yerda faqat load-bearing MVP qism:
// teacher o'z classroom'ini yaratadi, studentlarni TO'G'RIDAN-TO'G'RI User
// id orqali qo'shadi (alohida Organization qatlamisiz), MAVJUD nashr
// qilingan ExamTest'lardan assignment beradi (yangi kontent-yaratish YO'Q)
// va har student natijasini (holat + band) ko'radi.
// ============================================================================

const ClassroomSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  studentIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  createdAt: { type: Date, default: Date.now },
});
// src/app/api/teacher/classrooms (GET) — "faqat o'z classroom'lari" so'rovi
// shu bo'yicha filtrlaydi.
ClassroomSchema.index({ teacherId: 1 });

export const Classroom = mongoose.models.Classroom || mongoose.model('Classroom', ClassroomSchema);

// Assignment MAVJUD (allaqachon nashr qilingan) ExamTest'ga ishora qiladi —
// teacher uchun alohida kontent-mualliflik oqimi YO'Q (buyurtma ataylab shu
// qismni qamrab olmaydi). `sectionKey:'mock'` — butun test (barcha bo'lim),
// boshqa qiymatlar bitta bo'limgina tayinlash uchun.
const AssignmentSchema = new mongoose.Schema({
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest', required: true },
  sectionKey: { type: String, enum: ['listening', 'reading', 'writing', 'speaking', 'mock'], required: true },
  dueAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
// src/app/api/teacher/classrooms/[id]/assignments (GET) — bitta classroom'ning
// barcha assignment'lari.
AssignmentSchema.index({ classroomId: 1 });

export const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);

// ============================================================================
// ADMIN AI CHAT (kontent agenti) — 2026-09-24, foydalanuvchi so'rovi:
// "admin paneldagi AI qism chat ko'rinishida bo'lsin... unga turli xil
// kitoblar yuklanishi mumkin, u kitobni ko'rib chiqib qaysi biriga (reading/
// listening/writing/speaking) mosligini aniqlab o'zi joylashtirsin".
//
// Bu — mavjud `ContentBook` + `IngestJob` (worker) pipeline'iga MUQOBIL,
// WORKER'SIZ yo'l va u ATAYLAB shunday: worker Redis (`REDIS_URL`) + R2
// (`R2_*`) + alohida Docker protsessini talab qiladi, ularning hech biri
// hozircha sozlanmagan, admin esa kontentni BUGUN yuklashi kerak. Shuning
// uchun chat oqimi faqat MongoDB'ga tayanadi: fayl baytlari GridFS'da
// (audio — `examAudio`, rasm — `examImages`), matn shu hujjatlarda, natija
// esa to'g'ridan-to'g'ri `ExamTest` qoralamasi sifatida yoziladi.
// Worker ulanganda ikkala yo'l ham yonma-yon ishlayveradi (bir xil
// `ExamTest` hujjatiga boradi).
// ============================================================================

// Bitta suhbat. Xabarlar ATAYLAB shu hujjat ichida (alohida kolleksiya emas):
// bitta admin suhbati qisqa (o'nlab xabar), har doim BUTUNLIGICHA o'qiladi va
// hech qachon boshqa suhbat bilan birga so'ralmaydi — alohida kolleksiya
// faqat qo'shimcha join bo'lardi.
const AgentMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, default: '' },
    // Chat pufakchasi ostida ko'rsatiladigan tuzilmali qism: taklif
    // kartalari (`proposals`), savol variantlari (`options`), natija
    // havolalari (`results`). Sahifa yangilanganda ham qayta chiziladi —
    // shuning uchun klient state'ida emas, shu yerda saqlanadi.
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    attachmentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AgentAttachment' }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const AgentThreadSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'Yangi suhbat' },
  messages: { type: [AgentMessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now, index: true },
});

export const AgentThread = mongoose.models.AgentThread || mongoose.model('AgentThread', AgentThreadSchema);

// Chatga tashlangan bitta fayl. `text` — AUDIO transkripti (hujjat matni
// `pages` ichida, ikki nusxada saqlanmaydi: bitta kitob matni 1-3MB bo'lishi
// mumkin, MongoDB hujjati esa 16MB bilan cheklangan).
const AgentAttachmentSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentThread', default: null, index: true },
  kind: { type: String, enum: ['document', 'audio', 'image', 'text', 'unsupported'], required: true },
  filename: { type: String, default: '' },
  mimeType: { type: String, default: '' },
  bytes: { type: Number, default: 0 },

  // Hujjat/matn uchun — ajratilgan matn va psevdo-sahifalar (AI xarita
  // chiqarishi uchun kerak; `pages` bo'lmasa bo'lim kesish ham bo'lmaydi).
  text: { type: String, default: '' },
  pages: { type: mongoose.Schema.Types.Mixed, default: null }, // [{n, text}]
  pageCount: { type: Number, default: 0 },
  hasTextLayer: { type: Boolean, default: true },

  // Audio/rasm uchun — GridFS fayl id'lari (`@/lib/exam/audioStorage`,
  // `@/lib/exam/imageStorage`). Audio shu zahoti `examAudio` bucket'iga
  // tushadi, ya'ni Listening part'iga biriktirilganda FAYLNI KO'CHIRISH
  // shart emas — faqat `audioUrl` yoziladi.
  audioFileId: { type: String, default: null },
  imageFileId: { type: String, default: null },
  durationSec: { type: Number, default: null },

  // AI tahlili natijasi: hujjat uchun {tests:[...]}, audio uchun mos
  // keladigan Listening part nomzodlari va tekshiruv xulosasi.
  analysis: { type: mongoose.Schema.Types.Mixed, default: null },
  status: { type: String, enum: ['uploaded', 'analyzed', 'applied', 'failed'], default: 'uploaded' },
  error: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
AgentAttachmentSchema.index({ adminId: 1, createdAt: -1 });

export const AgentAttachment = mongoose.models.AgentAttachment || mongoose.model('AgentAttachment', AgentAttachmentSchema);

// Bo'lak-bo'lak yuklash uchun vaqtinchalik ombor. Vercel serverless so'rov
// tanasi ~4.5MB bilan cheklangan (kitob PDF'i esa o'nlab MB) — shuning uchun
// klient faylni ~3MB bo'laklarga bo'lib yuboradi, bu yerda yig'iladi va
// yig'ilgach o'chiriladi. TTL indeksi — yarim yo'lda tashlab ketilgan
// yuklashlar 1 soatdan keyin o'zi yo'qoladi.
const AgentUploadChunkSchema = new mongoose.Schema({
  uploadId: { type: String, required: true },
  index: { type: Number, required: true },
  data: { type: Buffer, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});
AgentUploadChunkSchema.index({ uploadId: 1, index: 1 }, { unique: true });

export const AgentUploadChunk = mongoose.models.AgentUploadChunk || mongoose.model('AgentUploadChunk', AgentUploadChunkSchema);
