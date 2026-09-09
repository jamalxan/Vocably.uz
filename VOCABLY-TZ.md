# VOCABLY 2.0 — TO'LIQ TEXNIK TOPSHIRIQ (TZ)

**Loyiha:** vocably.uz — ingliz tili o'rganish platformasi
**Versiya:** 2.0 (to'liq redesign + skill modullari + mock tizimi)
**Sana:** 2026-09-09
**Maqsad hujjat:** Claude Code uchun bajariladigan yagona spetsifikatsiya
**Mavjud stack:** Next.js (App Router) + Tailwind + MongoDB + Vercel

---

## 0. QISQA XULOSA (TL;DR)

Vocably hozir **yaxshi qurilgan, lekin tor** mahsulot: u "so'z yodlash ilovasi". Sizning maqsadingiz — "ingliz tilini o'rganish uchun eng qulay saytlardan biri". Bu ikkisi orasida uchta katta bo'shliq bor:

| # | Bo'shliq | Hozir | Bo'lishi kerak |
|---|----------|-------|----------------|
| 1 | **Ma'lumot modeli juda yupqa** | `so'z + tarjima` (2 ta ustun) | 14 maydonli leksik yozuv: POS, IPA, audio, 2 ta misol, kollokatsiya, so'z oilasi, CEFR, rasm, antonim, register |
| 2 | **Faqat vocabulary** | 8 ta rejim, hammasi so'z ustida | 4 ta ko'nikma (R/L/S/W) + vocabulary + to'liq mock |
| 3 | **Kirish yo'q** | Landing page yo'q, faqat login | Marketing landing + SEO + bepul demo + PWA |

Va yana 3 ta jiddiy UX muammosi: har bir rejim bir xil "Dan/Gacha" formasi bilan boshlanadi (friksiya), AI Chat ochilganda butun navigatsiya yo'qoladi, admin panel faqat moderatsiya — kontent boshqaruvi umuman yo'q.

Bu TZ shularning hammasini yopadi va **6 fazaga** bo'ladi.

---

## 1. AUDIT — NIMA TOPILDI

### 1.1 Dizayn va vizual

**Yaxshi tomonlari (saqlash kerak):**
- Deep merlot palitrasi (#4A1226 / #B8394A / #F3EDE6) — premium va o'ziga xos, O'zbekiston bozorida hech kimda yo'q
- Playfair Display (sarlavha) + Inter (matn) juftligi — kuchli, klassik-zamonaviy kontrast
- Dashboard ma'lumot arxitekturasi mantiqiy: Bugungi ish → Alanga → Statistika → Faollik → O'zlashtirish → Kelgusi yuk

**Muammolar:**

| # | Muammo | Isbot | Ta'sir |
|---|--------|-------|--------|
| D1 | **Bo'sh maydon halokati** | Kartochka/Test/Tinglab yozish rejimlarida ekranning ~70% bo'sh; kartochka 1372px ekranda 240px balandlikda o'rtada suzadi | Premium emas, "prototip" hissi |
| D2 | **Vizual ierarxiya yo'q** | Dashboard'dagi 4 ta stat karta bir xil og'irlikda; qaysi biri muhimligi ko'rinmaydi | Foydalanuvchi qayerga qarashni bilmaydi |
| D3 | **Bitta rang, bitta shakl** | Hamma karta `bg #FAF6F2 + radius + soft shadow`. Depth yo'q, tekstura yo'q, urg'u yo'q | Monoton, 10 daqiqada zerikadi |
| D4 | **Ikonkalar bir xil vaznda** | Sidebar'dagi 11 ta ikonka bir xil stroke, bir xil rang — skanerlash qiyin | Navigatsiya sekin |
| D5 | **Animatsiya yo'q** | Rejim almashganda hech qanday o'tish yo'q, kartochka aylanmaydi, progress to'lmaydi | "Jonli" emas |
| D6 | **Dark mode yo'q** | `<html>` da theme atributi yo'q | Kechqurun o'qiydiganlar uchun og'riq |
| D7 | **Bo'sh holatlar ishlanmagan** | Yangi kategoriyada nima ko'rinadi — noma'lum | Birinchi taassurot buziladi |

### 1.2 UX va oqim

| # | Muammo | Tafsilot |
|---|--------|----------|
| U1 | **"Dan/Gacha" devori** | Kartochka, Test, Tinglab yozish, Yozish testi — **hammasi** bir xil `Dan: 1 / Gacha: 10 / Boshlash` formasi bilan boshlanadi. Foydalanuvchi har safar raqam kiritishi kerak. Bu SRS mantig'iga ziddir: tizim qaysi so'zlarni takrorlash kerakligini **o'zi biladi**. |
| U2 | **Kartochkada baholash yo'q** | Karta faqat `Oldingi / Keyingi`. "Bildim / Bilmadim / Qiyin edi" tugmalari yo'q → SRS kartochkadan signal olmaydi. Bu eng katta metodologik xato. |
| U3 | **AI Chat navigatsiyani yutadi** | AI Chat'ga kirilganda sidebar suhbatlar ro'yxatiga almashadi. Rejimlarga qaytish uchun kichkina `←` tugmasi. Ikki xil sidebar = ikki xil ilova hissi. |
| U4 | **Rejimlar URL'ga bog'lanmagan** | Hamma rejim `/dashboard` ichida state. Bookmark qilib bo'lmaydi, orqaga tugmasi ishlamaydi, ulashish mumkin emas. |
| U5 | **Kategoriya dropdown + boshqaruv ajratilgan** | Ikki xil joyda, ikki xil harakat |
| U6 | **Sessiya oxiri yo'q** | 10 ta so'zdan keyin nima bo'ladi? Natija ekrani, XP, keyingi qadam tavsiyasi ko'rinmadi |
| U7 | **Progress mavhum** | "O'zlashtirilgan 5 / 215" — lekin "o'zlashtirilgan" nima degani? Mezon ko'rsatilmagan |

### 1.3 Responsive

Tekshirildi: 390px (telefon), 768px (planshet), 1372px (desktop).

| # | Muammo |
|---|--------|
| R1 | **Planshet layout yo'q.** 768px'da sidebar yashiriladi va mobil layout ko'rsatiladi — 768px'da sidebar uchun joy yetarli. Natijada planshetda ~40% ekran isrof |
| R2 | **Mobilda pastki navigatsiya yo'q.** Hamma narsa hamburger ichida. Kundalik odat ilovasi uchun bu jiddiy xato — asosiy 4 ta amal barmoq zonasida bo'lishi kerak |
| R3 | **Tipografika mobilda o'lchamini o'zgartirmaydi.** Desktop o'lchamlari 390px'ga ko'chirilgan |
| R4 | **Swipe gesture yo'q.** Kartochkada chapga/o'ngga surish — mobil flashcard uchun standart |
| R5 | **Jadval (table) mobilda.** 4 ustunli jadval 390px'da siqiladi; card-list ko'rinishiga o'tishi kerak |
| R6 | **Safe-area.** `viewport-fit=cover` bor, lekin `env(safe-area-inset-bottom)` ishlatilgani tasdiqlanmadi — iPhone'da pastki tugmalar home indicator ostida qolishi mumkin |

### 1.4 Texnik

Diagnostika natijalari (`performance` API va DOM tekshiruvi):

```
TTFB: 136ms          → yaxshi
DOMContentLoaded: 558ms → yaxshi
load: 635ms          → yaxshi
resources: 26        → yengil
manifest: NONE       → PWA yo'q
serviceWorker: none  → offline yo'q
lang: "uz"           → to'g'ri
aria-label'siz tugmalar: 72 ta → a11y muammosi
h1: 1 ta             → to'g'ri
```

| # | Muammo |
|---|--------|
| T1 | **PWA yo'q.** Manifest ham, service worker ham yo'q → telefonga o'rnatib bo'lmaydi, offline ishlamaydi. So'z yodlash ilovasi uchun offline — asosiy talab (metro, transport, internet yo'q joy) |
| T2 | **72 ta belgilanmagan tugma.** Ikonka-tugmalarda `aria-label` yo'q → skrinriderlar uchun yopiq, Lighthouse a11y ballini tushiradi |
| T3 | **Landing page yo'q.** `vocably.uz` → to'g'ridan-to'g'ri login. SEO trafigi 0, organik o'sish 0, ulashish mumkin emas |
| T4 | **Ovoz TTS orqali.** Brauzer TTS sifati past va qurilmaga qarab o'zgaradi; yodlash uchun barqaror, sifatli audio kerak |

### 1.5 Admin panel

Hozir: `Statistika / Faollik / Foydalanuvchilar / Suhbatlar / Reportlar / E'lonlar / Audit log`.

Bu **moderatsiya paneli**, kontent paneli emas. Yo'q narsalar:
- So'z va kategoriya boshqaruvi (CRUD, ommaviy import CSV/XLSX)
- Reading passage / Listening audio / Mock test yaratish
- O'quv analitikasi (qaysi so'z eng qiyin, qaysi rejim eng samarali, retention egri chizig'i)
- Kontent sifat nazorati (AI yaratgan materialni tasdiqlash oqimi)
- To'lov / obuna boshqaruvi

---

## 2. RAQOBAT TAHLILI VA POZITSIYA

### 2.1 goprep.gg (avvalgi ielts.gg)

| Xususiyat | goprep.gg | Vocably'ga olish |
|-----------|-----------|-------------------|
| Cheksiz mock testlar (4 bo'lim) | ✅ | ✅ Faza 4 |
| AI writing grader (mezon bo'yicha) | ✅ | ✅ Faza 3 |
| AI speaking feedback | ✅ | ✅ Faza 3 |
| **"Har bir javobga izoh"** | ✅ asosiy USP | ✅ **majburiy** — bu ularning eng kuchli tomoni |
| Shaxsiy o'quv rejasi | ✅ | ✅ Faza 5 |
| Vocabulary trainer | ✅ (zaif) | ✅ **bu sizning kuchli tomoningiz** |
| Arcade (o'yin bo'limi) | ✅ | ✅ Faza 5 |
| Ball kafolati / pul qaytarish | ✅ | ⚠️ marketing qarori |
| Dizayn | Qorong'i navy #0f172a, minimalist | ❌ **nusxa olmang** — merlot sizni ajratadi |

**Xulosa:** goprep — "IELTS mashinasi, vocabulary qo'shimcha". Vocably teskari bo'lishi kerak: **"vocabulary dvigateli, IELTS ustiga qurilgan"**. Bu farqlanish nuqtasi.

### 2.2 Pozitsiya bayonoti

> **Vocably — o'zbek tilida so'zlashuvchilar uchun ingliz tili platformasi: so'z boyligini ilmiy asoslangan takrorlash tizimi bilan quradi va shu so'zlarni Reading, Listening, Speaking, Writing mashqlarida darhol ishlatishga majbur qiladi. Yakuniy nuqta — haqiqiy mock imtihon.**

Uchta raqobat afzalligi:
1. **O'zbek tili birinchi** — tarjima, izoh, AI, interfeys hammasi o'zbekcha. goprep bunga kirmaydi.
2. **So'z → ko'nikma zanjiri** — o'rgangan so'z 24 soat ichida reading matnida, listening'da va speaking savolida qaytadi. Hech bir raqobatchida bu yo'q.
3. **Dizayn** — merlot premium identiteti. Bozorda hamma ko'k/yashil.

---

## 3. MAHSULOT ARXITEKTURASI

### 3.1 Yangi axborot arxitekturasi (IA)

```
vocably.uz
├── / ................................. Landing (ochiq, SEO)
├── /narxlar .......................... Tariflar
├── /blog/[slug] ...................... SEO kontent
├── /demo ............................. Ro'yxatdan o'tmasdan 10 ta so'z
├── /kirish, /royxat .................. Auth
│
└── /app .............................. Himoyalangan zona
    ├── /app .......................... 🏠 Bugun (dashboard)
    ├── /app/lugat .................... 📚 LUG'AT
    │   ├── /kutubxona ................ kategoriyalar, so'z bazasi
    │   ├── /takrorlash ............... SRS navbati (asosiy oqim)
    │   ├── /rejim/[mode] ............. 14 ta o'yin rejimi
    │   └── /soz/[id] ................. so'z sahifasi (deep dive)
    ├── /app/oqish .................... 📖 READING
    │   ├── /mashq/[id] ............... 9 ta task turi
    │   └── /kutubxona ................ matnlar (CEFR bo'yicha)
    ├── /app/tinglash ................. 🎧 LISTENING
    │   ├── /mashq/[id] ............... 8 ta task turi
    │   └── /shadowing ................ shadowing studiya
    ├── /app/gapirish ................. 🗣 SPEAKING
    │   ├── /talaffuz ................. fonema darajasida baholash
    │   ├── /part1 /part2 /part3 ...... IELTS format
    │   └── /erkin .................... AI bilan erkin suhbat
    ├── /app/yozish ................... ✍️ WRITING
    │   ├── /task1 /task2
    │   └── /mikro .................... jumla darajasidagi mashqlar
    ├── /app/mock ..................... 🎯 MOCK IMTIHON
    │   ├── /toliq .................... 4 bo'limli to'liq mock
    │   ├── /bolim/[section] .......... alohida bo'lim mashqi
    │   └── /natija/[id] .............. tahlil
    ├── /app/ai ....................... 🤖 AI Tutor
    ├── /app/reyting .................. 🏆 Leaderboard / do'stlar
    └── /app/profil ................... ⚙️ Sozlamalar
```

**Muhim qoida:** har bir rejim **o'z URL'iga** ega bo'lishi shart. Bookmark, orqaga tugmasi, ulashish — hammasi ishlaydi.

### 3.2 Navigatsiya modeli

**Desktop (≥1280px):** Chap sidebar, 2 darajali. Yuqorida 6 ta asosiy bo'lim (Bugun, Lug'at, Oqish, Tinglash, Gapirish, Yozish, Mock), tanlanganda ichki rejimlar ochiladi. AI Tutor — **o'ng tomonda sirg'aluvchi panel**, alohida sahifa emas (U3 muammosini hal qiladi).

**Planshet (768–1279px):** Ikonkali qisqargan sidebar (72px), hover'da kengayadi. **Sidebar yashirilmaydi.**

**Mobil (<768px):** Pastki tab bar — 5 ta element: `Bugun · Lug'at · Mashq · AI · Profil`. Qolgani "Mashq" ichidagi to'liq ekranli menyudan. Hamburger olib tashlanadi.

---

## 4. MA'LUMOT MODELI (MongoDB)

> Bu bo'lim eng muhimi. Hozirgi `{word, translation}` modeli 14 ta yangi rejimning hech birini qo'llab-quvvatlay olmaydi.

### 4.1 `words` — leksik yozuv (kengaytirilgan)

```js
{
  _id: ObjectId,
  headword: "resilient",           // asosiy shakl
  lemma: "resilient",
  pos: "adjective",                 // noun|verb|adjective|adverb|phrase|idiom|phrasal_verb
  ipa: "/rɪˈzɪliənt/",
  audio: {
    uk: "https://cdn.../resilient-uk.mp3",
    us: "https://cdn.../resilient-us.mp3"
  },
  translations: {
    uz: ["bardoshli", "chidamli", "tez tiklanadigan"],
    ru: ["устойчивый", "жизнестойкий"]
  },
  definition_en: "able to recover quickly from difficult conditions",
  definition_uz: "qiyinchilikdan tez qayta tiklana oladigan",
  examples: [                       // KAMIDA 2 ta — kontekstsiz so'z yodlanmaydi
    { en: "Children are remarkably resilient.", uz: "Bolalar hayratlanarli darajada bardoshli." },
    { en: "The economy proved resilient to the shock.", uz: "Iqtisodiyot zarbaga bardoshli chiqdi." }
  ],
  collocations: ["highly resilient", "resilient economy", "prove resilient"],
  word_family: [                    // so'z oilasi — bitta yozuvda 4 ta so'z o'rganiladi
    { form: "resilience", pos: "noun" },
    { form: "resiliently", pos: "adverb" }
  ],
  synonyms: ["tough", "durable", "hardy"],
  antonyms: ["fragile", "vulnerable"],
  cefr: "B2",                       // A1..C2
  frequency_rank: 4820,             // COCA/BNC reytingi — o'qitish tartibi uchun
  register: "neutral",              // formal|neutral|informal|academic
  topics: ["psychology", "economy"],
  image_url: "https://cdn.../resilient.webp",  // dual coding uchun
  mnemonic_uz: "RE-SILIENT — 'RE' qayta + 'SILIENT' sakramoq → qayta sakraydigan",
  common_mistakes: ["resilient FROM ❌ → resilient TO ✅"],
  source: "destination_b2_u24",
  created_by: ObjectId,
  ai_generated: true,
  verified: false,                  // admin tasdig'i
  createdAt, updatedAt
}
```

**Indekslar:** `{headword: 1}`, `{cefr: 1, frequency_rank: 1}`, `{topics: 1}`, text index `{headword, definition_en}`.

### 4.2 `cards` — SRS holati (foydalanuvchi × so'z × yo'nalish)

```js
{
  _id, user_id, word_id,
  direction: "en_uz",     // en_uz | uz_en | listen_en | spell_en  → 4 ta alohida karta
  // FSRS-6 holati
  stability: 12.4,        // kunlarda
  difficulty: 5.2,        // 1..10
  state: "review",        // new | learning | review | relearning
  due: ISODate,
  last_review: ISODate,
  reps: 7,
  lapses: 1,
  elapsed_days: 3,
  scheduled_days: 12,
  // analitika
  avg_response_ms: 2340,
  history: [{ ts, rating: 3, ms: 2100, mode: "flashcard" }],  // oxirgi 30 ta
  leech: false            // lapses >= 8 → alohida ishlov
}
```

**Indekslar:** `{user_id: 1, due: 1}` (asosiy navbat so'rovi), `{user_id: 1, state: 1}`, unique `{user_id, word_id, direction}`.

### 4.3 Qolgan kolleksiyalar

```js
// decks — kategoriyalar (Destination B2, synonyms, words1...)
{ _id, owner_id, title, description, cefr, word_ids[], is_public, cover, stats: {...} }

// study_sessions — har bir mashq sessiyasi
{ _id, user_id, mode, deck_id, started_at, ended_at, items: [{word_id, rating, ms, correct}],
  xp_earned, accuracy, source: "web"|"pwa" }

// passages — Reading materiallari
{ _id, title, body, word_count, cefr, topic, source, questions: [...],
  target_words: [word_id],   // shu matnda o'rganilayotgan so'zlar — ZANJIR MEXANIZMI
  audio_url,                 // ixtiyoriy — listening sifatida ham ishlatiladi
  ai_generated, verified }

// listening_items
{ _id, title, audio_url, transcript, transcript_timed: [{start, end, text}],
  accent: "uk"|"us"|"aus", speed: 1.0, cefr, questions: [...], target_words: [] }

// speaking_prompts
{ _id, part: 1|2|3, topic, question, cue_card: {...}, band_descriptors, target_words: [] }

// speaking_attempts
{ _id, user_id, prompt_id, audio_url, transcript,
  pronunciation: { accuracy, fluency, completeness, prosody, phonemes: [...] },
  ai_feedback: { fluency_coherence, lexical_resource, grammatical_range, pronunciation, band, notes_uz } }

// writing_attempts
{ _id, user_id, task: 1|2, prompt, text, word_count, time_spent,
  ai_feedback: { task_achievement, coherence_cohesion, lexical_resource, grammar, band,
                 inline_corrections: [{start, end, original, suggestion, reason_uz}] } }

// exam_sessions — mock (Everest-Mock modelidan, o'zgarishsiz)
{ _id, user_id, mock_id, exam_type, status, created_at,
  sections: { listening: {started_at, ends_at, locked, duration}, ... },
  answers: {}, essays: {}, audio: {}, result: {} }

// mocks — mock kontenti (server-side javoblar bilan)
{ _id, title, exam_type, sections: {...}, durations, published }

// user_stats — kunlik agregat (dashboard tez ishlashi uchun)
{ user_id, date, reviews, new_words, accuracy, minutes, xp, modes: {...} }

// streaks
{ user_id, current, longest, last_active_date, freeze_tokens: 2 }

---

## 5. TAKRORLASH DVIGATELI (SRS) — FSRS-6

### 5.1 Nega FSRS?

Hozirgi tizim qanday ishlayotgani noma'lum, lekin "Yangi / O'rganilmoqda / Mustahkam / O'zlashtirilgan" bosqichlari Leitner qutilariga o'xshaydi. Bu 1970-yillar texnologiyasi.

**FSRS (Free Spaced Repetition Scheduler)** — har bir karta uchun uchta o'zgaruvchini modellaydi:
- **R** (Retrievability) — hozir eslab qolish ehtimoli
- **S** (Stability) — R 90% dan 90%-desired ga tushguncha necha kun
- **D** (Difficulty) — kartaning ichki qiyinligi (1–10)

Amaliy foyda: bir xil bilim darajasiga **~25–30% kam takrorlash** bilan yetiladi. 200 ta so'zli foydalanuvchi uchun bu kuniga 15 daqiqa vaqt tejash.

### 5.2 Implementatsiya

```ts
// lib/srs/fsrs.ts
import { fsrs, generatorParameters, Rating, State } from 'ts-fsrs';

export const params = generatorParameters({
  request_retention: 0.90,      // maqsad: 90% eslab qolish
  maximum_interval: 365,
  enable_fuzz: true,            // bir kunga hamma karta to'planib qolmasligi uchun
});

export const scheduler = fsrs(params);

// Baholash: 4 daraja
// Rating.Again (1) — bilmadim
// Rating.Hard  (2) — qiynaldim
// Rating.Good  (3) — bildim
// Rating.Easy  (4) — juda oson
```

**Reyting qanday olinadi (rejimga qarab):**

| Rejim | Rating manbai |
|-------|---------------|
| Kartochka | Foydalanuvchi 4 ta tugmadan birini bosadi (**majburiy qo'shiladi**) |
| Test (MCQ) | To'g'ri + <3s → Easy · To'g'ri + <8s → Good · To'g'ri + >8s → Hard · Xato → Again |
| Yozish testi | Xatosiz → Good/Easy (vaqtga qarab) · 1 harf xato → Hard · Boshqa → Again |
| Tinglab yozish | Xuddi shunday |
| Juftlikni topish | To'g'ri birinchi urinishda → Good · Xato bo'lgan → Again |
| Speaking'da ishlatilgan | Bonus: `stability × 1.15` |
| Reading'da tanilgan | Bonus: `stability × 1.10` |

### 5.3 Navbat generatori (kunlik ish)

```
GET /api/queue/today?limit=40

Algoritm:
1. due <= now bo'lgan review kartalar   → maks 60% navbat
2. learning/relearning kartalar         → hammasi (ular kunni buzmaydi)
3. leech kartalar (lapses >= 8)          → alohida "qiyin so'zlar" bloki, maks 5 ta
4. yangi kartalar                        → kunlik limit (default 10, sozlanadi)
   Tanlash tartibi: frequency_rank ASC (eng ko'p ishlatiladigan so'z birinchi)
5. Interleaving: bir xil deck'dan ketma-ket 3 tadan ko'p bermaslik
6. Aralashtirish: har 5 ta kartadan keyin rejim almashadi (kartochka→test→yozish)
```

**Muhim:** foydalanuvchi hech qachon "Dan/Gacha" kiritmaydi. U faqat **"Takrorlashni boshlash"** ni bosadi. (U1 muammosi hal bo'ladi.)

### 5.4 Kunlik yuk boshqaruvi

- `daily_new_limit` — default 10, profil sozlamasida 5/10/15/20/30
- `daily_review_cap` — default 100. Oshib ketsa: eng muhim (eng past R) kartalar birinchi
- **Yuk prognozi** — dashboard'da 7 kunlik ("Kelgusi yuk" karta allaqachon bor, uni FSRS bilan real qilish)
- **Alanga muzlatgichi (streak freeze)** — oyiga 2 ta bepul token, bir kun o'tkazib yuborilsa avtomatik ishlatiladi

---

## 6. VOCABULARY REJIMLARI

### 6.1 Mavjudlarni kuchaytirish

#### 6.1.1 Kartochka (Flashcard) — **to'liq qayta yozish**

**Hozir:** so'z + "Ko'rish uchun bosing" + Oldingi/Keyingi. Baholash yo'q.

**Bo'lishi kerak:**

```
┌─────────────────────────────────────────┐
│  [progress bar: 7/24]        [⚙] [✕]   │
│                                          │
│              ┌──────────┐               │
│              │  rasm     │  ← image_url  │
│              └──────────┘               │
│                                          │
│            resilient                     │
│          /rɪˈzɪliənt/  🔊               │
│             adjective · B2               │
│                                          │
│    ─────── karta aylanadi (3D flip) ──── │
│                                          │
│            bardoshli, chidamli           │
│                                          │
│  "Children are remarkably resilient."    │
│  "Bolalar hayratlanarli bardoshli."      │
│                                          │
│  Kollokatsiya: highly resilient,         │
│                resilient economy         │
│  Oila: resilience (n), resiliently (adv) │
│                                          │
│ ┌────────┬────────┬────────┬──────────┐ │
│ │Bilmadim│Qiynaldm│ Bildim │Juda oson │ │
│ │  <10m  │   1k    │  4k    │   10k    │ │  ← keyingi interval ko'rsatiladi
│ └────────┴────────┴────────┴──────────┘ │
└─────────────────────────────────────────┘
```

Talablar:
- **3D flip animatsiyasi** (`rotateY`, 400ms, `cubic-bezier(.2,.8,.2,1)`)
- **Klaviatura:** `Space` = aylantirish, `1/2/3/4` = baholash, `←` = orqaga, `Esc` = chiqish
- **Mobil:** yuqoriga surish = aylantirish, chapga = Bilmadim, o'ngga = Bildim, tepaga uzun = Juda oson
- **Keyingi interval ko'rsatiladi** har bir tugmada (FSRS'dan hisoblanadi) — bu foydalanuvchiga tizim ishlayotganini his qildiradi
- **Audio avtomatik** — karta ochilganda UK talaffuzi (sozlamada o'chirish mumkin)
- **"Bilmadim" bosilganda** — so'z darhol navbat oxiriga qo'shiladi (shu sessiya ichida qaytadi)

#### 6.1.2 Test (MCQ) — **distraktorlarni aqlli qilish**

Hozirgi muammo (taxmin): variantlar tasodifiy tanlanadi → juda oson.

Yangi qoida — chalg'ituvchi javoblar shu tartibda tanlanadi:
1. Bir xil `pos` va bir xil `cefr` dagi so'zlar (60%)
2. `synonyms` ro'yxatidagi yaqin ma'noli so'zlar (20%) — eng qiyin va eng foydali
3. Shakli o'xshash so'zlar (Levenshtein distance ≤ 3) (20%)

Va: **4 ta yo'nalish** aylanma tarzda — `EN→UZ`, `UZ→EN`, `ta'rif→so'z`, `misol jumlada bo'sh joy→so'z`.

#### 6.1.3 Yozish testi — **qisman kredit**

- Hozir: to'g'ri/noto'g'ri. Yangi: Levenshtein masofasi bo'yicha:
  - 0 xato → Good/Easy
  - 1 harf → "Deyarli! `recieve` → `receive`" + Hard
  - ≥2 → Again
- **Talaffuzdan yozish rejimi** — audio yangraydi, foydalanuvchi yozadi (spelling + listening birga)
- Har bir harf kiritilganda mikro-feedback (yashil/qizil belgilash)

#### 6.1.4 Juftlikni topish — **kengaytirilgan juftliklar**

Hozir: so'z ↔ tarjima. Qo'shish:
- so'z ↔ ta'rif (inglizcha)
- so'z ↔ kollokatsiya
- so'z ↔ antonim
- audio ↔ so'z

Vizual: 4×4 grid, tanlanganda pulse animatsiya, to'g'ri juftlik yashil chaqnash + yo'qoladi, xato — qizil silkinish (shake).

#### 6.1.5 Tezkor o'yin — **haqiqiy o'yin qilish**

- 60 soniya, kombo tizimi (3 ta ketma-ket to'g'ri = 2× ball)
- Jonlar: 3 ta yurak
- Tezlik oshib boradi
- Yakunda: shaxsiy rekord, kunlik reyting, do'stlar bilan taqqoslash
- **Muhim:** tezkor o'yin FSRS'ga `Again` yuborishi mumkin, lekin `Easy` yubormaydi (tezlik ≠ chuqur bilim)

#### 6.1.6 Tinglab yozish — **darajali**

- Daraja 1: audio → yozish (so'z)
- Daraja 2: audio → yozish (butun jumla)
- Daraja 3: tezlashtirilgan audio (1.25×)
- Daraja 4: shovqin fonida (IELTS listening'ga tayyorgarlik)

### 6.2 YANGI REJIMLAR (8 ta)

| # | Rejim | Mexanika | Ilmiy asos |
|---|-------|----------|-----------|
| V1 | **Kontekstda tanish (Cloze)** | Haqiqiy jumladan so'z olib tashlanadi, foydalanuvchi to'ldiradi | Kontekstli o'rganish izolyatsiyalangandan 2× samarali |
| V2 | **Kollokatsiya quruvchi** | "highly ___", "___ economy" — to'g'ri sherik so'zni tanlash | Lexical chunking — nutq ravonligining asosi |
| V3 | **So'z oilasi daraxti** | `resilient → resilience → resiliently` — barcha shakllarni to'g'ri joyga qo'yish | Bitta o'zakdan 3–4 so'z |
| V4 | **Sinonim gradusi** | `good < great < outstanding < exceptional` — kuchi bo'yicha tartiblash | Nuance — B2→C1 o'tishning kaliti |
| V5 | **Jumla quruvchi** | Berilgan so'zlardan to'g'ri jumla yig'ish (drag & drop) | Produktiv bilim (recognition ≠ production) |
| V6 | **Mnemonika ustaxonasi** | AI so'z uchun o'zbekcha mnemonika taklif qiladi; foydalanuvchi o'zinikini yozadi va saqlaydi | Elaborative encoding — eng kuchli yodlash usuli |
| V7 | **Rasm ↔ so'z** | Rasmdan so'zni topish (tarjimasiz) | Dual coding — tarjima "ko'prigini" olib tashlaydi |
| V8 | **Antonim jangi** | So'z beriladi, qarama-qarshisini 5 soniyada topish | Semantik tarmoqni mustahkamlaydi |

### 6.3 ZANJIR MEXANIZMI (asosiy farqlanish nuqtasi)

> Bu Vocably'ni raqobatchilardan ajratadigan asosiy g'oya. Alohida e'tibor bering.

Foydalanuvchi bugun `resilient`, `mitigate`, `unprecedented` so'zlarini o'rgandi. Keyin:

```
T+0     Kartochka / Test rejimi
T+1 soat  → Reading: shu 3 ta so'z ishlatilgan 200 so'zli matn (AI generatsiya)
T+1 kun   → Listening: shu so'zlar bor 90 soniyalik dialog
T+2 kun   → Speaking: "Describe a time you had to be resilient" — cue card
T+3 kun   → Writing mikro-mashq: shu so'zlar bilan 3 ta jumla yozish
T+7 kun   → Mock reading passage'da tabiiy ravishda uchraydi
```

Implementatsiya:
- `passages.target_words`, `listening_items.target_words`, `speaking_prompts.target_words` maydonlari
- Kunlik cron (`/api/cron/chain`): har bir foydalanuvchi uchun oxirgi 7 kunda o'rganilgan so'zlarni oladi → mos kontent topadi yoki AI orqali yaratadi → `/app` dagi "Bugungi zanjir" blokiga qo'yadi
- Dashboard'da alohida karta: **"Bugungi zanjir — 3 ta so'zingiz sizni kutmoqda"**

---

## 7. READING MODULI

### 7.1 Task turlari (IELTS + umumiy)

| # | Task | Tavsif |
|---|------|--------|
| R1 | Multiple choice | 1 to'g'ri / bir nechta to'g'ri |
| R2 | True / False / Not Given | Eng qiyin IELTS turi — alohida trening kerak |
| R3 | Yes / No / Not Given | Muallif fikri bo'yicha |
| R4 | Matching headings | Paragrafga sarlavha |
| R5 | Matching information | Qaysi paragrafda aytilgan |
| R6 | Matching features | Kim nima degan |
| R7 | Sentence completion | Matndan so'z bilan to'ldirish |
| R8 | Summary / note / table / flow-chart completion | |
| R9 | Diagram label completion | |
| R10 | Short answer questions | |

### 7.2 Trening rejimlari (imtihondan tashqari)

| Rejim | Maqsad |
|-------|--------|
| **Skimming trenajyori** | 60 soniyada matn beriladi, keyin yopiladi va asosiy g'oya so'raladi |
| **Scanning trenajyori** | "Qaysi yilda?" — vaqt bilan aniq ma'lumot topish |
| **Tezlik o'lchagich** | WPM (so'z/daqiqa) o'lchanadi va tushunish testi bilan tekshiriladi. Maqsad: 200+ WPM |
| **Bosqichma-bosqich o'qish** | Har paragrafdan keyin 1 ta savol — chuqur tushunish |
| **Noma'lum so'zlarni belgilash** | O'qish paytida so'zni bosish → tarjima chiqadi → **avtomatik shaxsiy lug'atga qo'shiladi** (bu Reading'ni vocabulary manbaiga aylantiradi) |
| **Paraphrase detektori** | Savoldagi so'z matnda boshqacha aytilgan — topish. IELTS Reading'ning 80% shu ko'nikma |

### 7.3 Reading UI talablari

- **Split view** (desktop): chapda matn, o'ngda savollar, o'rtada surilishi mumkin bo'lgan ajratgich
- **Mobil:** tab (Matn / Savollar) + savolni bosganda tegishli paragrafga avtomatik scroll
- **Highlight** — matnni belgilash va sariq bilan bo'yash (imtihonda ruxsat etilgan usul)
- **Har bir javobga izoh** (goprep USP'si): javobdan keyin **matnning aynan qaysi qismidan** kelib chiqqani ajratib ko'rsatiladi + o'zbekcha tushuntirish
- Shrift o'lchamini o'zgartirish, serif/sans almashtirish, qatorlar orasi
- **Reading ruler** — hozirgi qator ajratib turadigan chiziq (disleksiya va konsentratsiya uchun)

---

## 8. LISTENING MODULI

### 8.1 Task turlari

IELTS bilan bir xil: form/note/table/flow-chart completion, MCQ, matching, plan/map/diagram labelling, sentence completion, short answer.

### 8.2 Trening rejimlari — **bu yerda katta imkoniyat bor**

| Rejim | Mexanika | Nega ishlaydi |
|-------|----------|---------------|
| **Shadowing studiya** | Audio ijro etiladi → foydalanuvchi 0.5s kechikish bilan takrorlaydi → yozib olinadi → to'lqin shakllari ustma-ust taqqoslanadi | Talaffuz + ritm + intonatsiya bir vaqtda. Yaponiyada standart usul |
| **Dictogloss** | 3 marta tinglanadi → xotiradan matnni tiklash → asl matn bilan farq ko'rsatiladi (diff) | Grammatika + listening + writing birga |
| **Bo'shliqli transkript** | Har 7-so'z olib tashlangan transkript bilan tinglash | Faol tinglash |
| **Tezlik mashqi** | 0.75× → 1× → 1.25× → 1.5× bosqichma-bosqich | Real nutqqa tayyorgarlik |
| **Aksent laboratoriyasi** | Bir xil matn UK / US / AUS / IND aksentlarida | IELTS'da 4 xil aksent uchraydi |
| **Raqam va sana trenajyori** | Faqat raqamlar: telefon, sana, narx, manzil | IELTS Listening 1-qismidagi eng ko'p xato |
| **Minimal juftliklar** | `ship/sheep`, `bad/bed` — qaysi biri aytildi | Fonematik eshitish |
| **Faol tinglash bloki** | 30s audio → 3 ta savol → darhol izoh | Mikro-sessiya, mobil uchun ideal |

### 8.3 Texnik

- **Vaqtli transkript** (`transcript_timed`) — audio ijro etilayotganda so'z ajratib turiladi (karaoke usuli)
- Transkriptdagi har qanday so'zni bosish → ta'rif + shaxsiy lug'atga qo'shish
- **A-B loop** — qiyin qismni belgilab, takror-takror tinglash
- Audio kesh (Service Worker) — offline tinglash
- **Waveform vizualizatsiyasi** — `wavesurfer.js`

---

## 9. SPEAKING MODULI

> Eng texnik murakkab, lekin eng qadrli modul. O'zbekistonda speaking'ni haqiqiy baholaydigan platforma yo'q.

### 9.1 Arxitektura

```
Foydalanuvchi ovozi (MediaRecorder, webm/opus)
        │
        ├──→ Azure Speech Pronunciation Assessment
        │      → accuracy, fluency, completeness, prosody
        │      → fonema darajasidagi ballar
        │
        ├──→ Whisper (transkripsiya)
        │      → matn + so'z-daraja vaqt belgilari
        │
        └──→ LLM (Claude) — IELTS Speaking baholovchi
               → Fluency & Coherence
               → Lexical Resource
               → Grammatical Range & Accuracy
               → Pronunciation
               → Band (0–9) + o'zbekcha izoh + aniq tuzatishlar
```

### 9.2 Rejimlar

| Rejim | Tafsilot |
|-------|----------|
| **Talaffuz laboratoriyasi** | So'z/jumla beriladi → o'qiladi → **fonema darajasida** qizil/sariq/yashil bo'yaladi. "`th` tovushi 42% — tilingizni tishlar orasiga qo'ying" |
| **Part 1 simulyator** | 4–5 savol, 30s javob, ketma-ket |
| **Part 2 (Cue card)** | 1 daqiqa tayyorgarlik (taymer + qog'oz), 2 daqiqa gapirish |
| **Part 3 chuqur suhbat** | AI follow-up savollar beradi — real imtihonchi kabi |
| **Erkin suhbat (AI bilan)** | Mavzu tanlanadi, AI real vaqtda gaplashadi (voice-to-voice), keyin tahlil |
| **Ravonlik mashqi** | 1 daqiqa to'xtamasdan gapirish. Pauza va "uhm" soni sanaladi |
| **Zanjirdan speaking** | Bu hafta o'rgangan so'zlarni ishlatishga majburlovchi savol. Ishlatilgan so'zlar yashil belgilanadi |

### 9.3 Feedback formati (majburiy)

```
┌───────────────────────────────────────────┐
│  Band: 6.5                                 │
│  ┌─────────┬─────────┬─────────┬────────┐ │
│  │ FC 6.5  │ LR 6.0  │ GRA 7.0 │ P 6.5  │ │
│  └─────────┴─────────┴─────────┴────────┘ │
│                                            │
│  ✅ Kuchli tomonlar                        │
│  • Javob strukturasi aniq (sabab + misol)  │
│  • "unprecedented" so'zini to'g'ri ishlatdingiz │
│                                            │
│  ⚠️ Tuzatish kerak                          │
│  • 0:34 — "I am agree" → "I agree"         │
│  • 0:51 — 4 soniyalik pauza                │
│  • /θ/ tovushi ("think") — 41% aniqlik     │
│                                            │
│  📈 7.0 ga chiqish uchun                    │
│  • Har bir javobni 2 gapdan 4 gapga uzaytiring │
│  • Bog'lovchilar: "that being said", "on top of that" │
│                                            │
│  [🔊 Yozuvni tinglash]  [📝 Transkript]    │
└───────────────────────────────────────────┘
```

---

## 10. WRITING MODULI

### 10.1 Rejimlar

| Rejim | Tafsilot |
|-------|----------|
| **Task 1 (Academic)** | Grafik/jadval/diagramma/xarita/jarayon tavsifi. 20 daq, 150+ so'z |
| **Task 1 (General)** | Xat (rasmiy/yarim rasmiy/norasmiy) |
| **Task 2 Essay** | 5 tur: opinion, discussion, problem-solution, advantage-disadvantage, two-part |
| **Mikro-mashqlar** | Bitta jumla darajasida: "Bu jumlani murakkab qiling", "Passiv shaklga o'tkazing", "Sinonim bilan almashtiring" |
| **Paragraf ustaxonasi** | Faqat bitta paragraf: topic sentence + supporting + example + link |
| **Zanjirdan writing** | Bu hafta o'rgangan 5 ta so'zni ishlatib paragraf yozish |
| **Tuzatish rejimi** | Xatolar bilan matn beriladi, foydalanuvchi topadi va tuzatadi |

### 10.2 AI Grader (Everest-Mock'dagidan kuchaytirilgan)

Chiqish formati — **inline korreksiya bilan**:

```json
{
  "band": 6.5,
  "criteria": {
    "task_achievement": { "band": 6.0, "note_uz": "..." },
    "coherence_cohesion": { "band": 7.0, "note_uz": "..." },
    "lexical_resource":   { "band": 6.0, "note_uz": "..." },
    "grammatical_range":  { "band": 6.5, "note_uz": "..." }
  },
  "inline_corrections": [
    { "start": 142, "end": 156, "original": "there is many",
      "suggestion": "there are many", "type": "grammar",
      "reason_uz": "'many' ko'plik — 'are' kerak" }
  ],
  "vocabulary_upgrades": [
    { "original": "good", "better": ["beneficial", "advantageous"], "band_impact": "+0.5 LR" }
  ],
  "structure_map": ["intro", "body1", "body2", "conclusion"],
  "next_steps_uz": ["...", "..."]
}
```

UI: matn ustida to'lqinsimon chiziqlar, bosilganda tuzatish chiqadi (Grammarly usuli), "Hammasini qabul qilish" tugmasi.

**Muhim:** AI ball qo'yishi bandlarga **kalibrlangan** bo'lishi kerak — 20 ta real IELTS namunasini (ma'lum band bilan) test to'plami sifatida saqlang va har prompt o'zgarganda tekshiring. Aks holda ball ishonchsiz bo'ladi.

---

## 11. MOCK IMTIHON MODULI (Everest-Mock integratsiyasi)

### 11.1 Nima ko'chiriladi

`github.com/jamalxan/Everest-Mock` da **eng qimmatli qism — `backend/exam.py`**. Bu server-authoritative imtihon dvigateli va u to'g'ri yozilgan. Uning kafolatlari:

1. Taymer **serverda** hisoblanadi (`ends_at - now`) — brauzer vaqtni hal qilmaydi
2. Sahifa yangilansa yoki internet uzilsa — vaqt tiklanmaydi, javoblar yo'qolmaydi
3. Har bir javob avtomatik saqlanadi (autosave upsert)
4. Listening audio **bir marta** ijro etiladi — refresh qilinsa aynan o'sha joydan davom etadi, qaytadan boshlanmaydi
5. Submit **idempotent** (atomik shartli update) — ikki marta yuborilmaydi
6. Vaqt tugasa avtomatik topshiriladi
7. Raw → band konversiyasi `scoring.py` da (Listening/Reading jadvallari)

**Bu mantiqni qayta yozmang.** Uni TypeScript'ga porting qiling yoki FastAPI mikroservis sifatida saqlang.

### 11.2 Integratsiya varianti (tavsiya: A)

| Variant | Tafsilot | Baho |
|---------|----------|------|
| **A. TS'ga port** | `exam.py` mantig'ini Next.js API route'lariga ko'chirish. MongoDB allaqachon bor. | ✅ **Tavsiya** — bitta stack, bitta deploy, bitta auth |
| B. FastAPI mikroservis | Everest backend'ni alohida saqlab, Vocably'dan chaqirish | Ikki deploy, ikki auth, CORS — ortiqcha murakkablik |

**Port qilish rejasi (`lib/exam/engine.ts`):**

```ts
// Aynan shu funksiyalar ko'chiriladi:
sectionRemaining(sec)      // ends_at - now, serverda
applyExpiry(doc)           // vaqti o'tgan bo'limni qulflash
shouldAutosubmit(doc)      // global ceiling: created_at + sum(durations) + 30 daq
publicState(doc)           // clientga javoblarsiz holat
score(doc)                 // answer_key bilan solishtirish
finalize(sessionId, reason)// findOneAndUpdate atomik
```

**Kritik qoida:** `correct` javoblari **hech qachon** clientga yuborilmaydi. `publicMock()` ularni olib tashlaydi. Bu Everest'da to'g'ri qilingan — saqlang.

### 11.3 Ikki xil rejim

| Rejim | Tavsif |
|-------|--------|
| **To'liq mock** | 4 bo'lim ketma-ket, real vaqt (L 30 + R 60 + W 60 + S 14 daq), pauza yo'q, natija oxirida |
| **Alohida mashq (Practice)** | Bitta bo'lim, pauza mumkin, har savoldan keyin izoh, taymer ixtiyoriy |

> Siz aynan shuni so'radingiz: "mock uchun ham alohida alohida shug'ullanish uchun moslash kerak". `mode: "exam" | "practice"` maydoni bilan hal qilinadi. `practice` da: `applyExpiry` o'chiriladi, `correct` javob har savoldan keyin yuboriladi, audio qayta ijro etiladi.

### 11.4 Exam UI talablari

- **Focus mode** — sidebar butunlay yashiriladi, faqat imtihon interfeysi
- Yuqorida: bo'lim nomi · taymer (oxirgi 5 daqiqada qizil pulse) · savol navigatori
- **Savol navigatori** — 40 ta nuqta: bo'sh / to'ldirilgan / belgilangan (flag)
- Chiqishga urinilsa `beforeunload` ogohlantirish
- Har 10 soniyada `PATCH /answer` autosave + "Saqlandi ✓" indikatori
- Yakunda: to'liq tahlil — band, bo'limlar, **har bir savol bo'yicha nima uchun xato** izohi

### 11.5 Natija sahifasi

```
Overall Band 6.5  (animatsiyali count-up)
├── Listening 7.0  — 30/40    [band chart]
├── Reading   6.5  — 27/40
├── Writing   6.0  — AI tahlil
└── Speaking  6.5  — AI tahlil

📊 Savol turlari bo'yicha zaifliklar:
   True/False/Not Given ....... 3/8  ⚠️ eng zaif
   Matching headings .......... 5/6
   Sentence completion ........ 7/8

🎯 Tavsiya qilingan mashqlar:
   [TFNG trenajyori] [Paraphrase detektori]

📚 Bilmagan so'zlaringiz (12 ta) → [Lug'atga qo'shish]
```

Oxirgi qator muhim: **mock → vocabulary zanjirini yopadi.** Mock'da tushunmagan so'zlar avtomatik SRS'ga tushadi.

---

## 12. AI QATLAMI

### 12.1 AI Tutor (chat) — qayta ishlash

**Muammo (U3):** hozir AI Chat butun navigatsiyani almashtiradi.

**Yechim:** AI — **o'ng tomondan sirg'ab chiqadigan panel** (desktop: 420px, mobil: to'liq ekran modal). Istalgan sahifadan `⌘K` yoki suzuvchi tugma bilan ochiladi va **kontekstni biladi**:

| Foydalanuvchi qayerda | AI nimani biladi |
|----------------------|------------------|
| Kartochkada | Hozirgi so'z, uning misollari, foydalanuvchining shu so'zdagi tarixi |
| Reading'da | Matn, savol, belgilangan qism |
| Mock natijasida | Ballari, xato qilgan savollari |
| Dashboard'da | Umumiy statistikasi |

### 12.2 Chat UI yaxshilanishlari

- **Markdown rendering** (hozir uzun matnlar bir blok bo'lib chiqmoqda — o'qib bo'lmaydi)
- Kod/misol bloklari, ro'yxatlar, jadvallar to'g'ri render
- **Streaming** javob (token-by-token)
- **Tez amallar** (chat ostida chip'lar): `Bu so'zni tushuntir` · `Misol jumla ber` · `Mnemonika o'ylab top` · `Test tuz`
- **Emoji/stiker tanlagich** (siz so'ragan) — `emoji-picker-react`, so'nggi ishlatilganlar, qidiruv o'zbekcha
- Xabarni nusxalash, qayta generatsiya, ulashish
- **Ovozli kiritish** (mikrofon tugmasi allaqachon bor — Whisper'ga ulash)

### 12.3 AI kontent generatsiya quvuri (pipeline)

Bu **admin uchun** — kontentni qo'lda yozish mumkin emas.

```
Admin: "B2 daraja, 'texnologiya' mavzusi, 250 so'zlik reading passage,
        quyidagi so'zlarni ishlat: [resilient, mitigate, unprecedented]"
   ↓
LLM → passage + 8 ta savol (turli turlarda) + javob kaliti + izohlar
   ↓
Avtomatik tekshiruv:
   • CEFR darajasi mos keladimi (readability: Flesch-Kincaid + so'z chastotasi)
   • Target so'zlar ishlatilganmi
   • Savollar matndan javob topiladigan xilmi
   • TFNG savollarida "Not Given" mantiqan to'g'rimi
   ↓
Admin ko'rib chiqadi → tasdiqlaydi (verified: true) → nashr
```

**Qoida:** `verified: false` bo'lgan kontent foydalanuvchiga ko'rsatilmaydi. Bu sifat nazorati.

### 12.4 Xarajat nazorati

| Amal | Model | Kesh |
|------|-------|------|
| Chat | tez model | — |
| Writing grading | kuchli model | attempt hash bo'yicha |
| Speaking grading | kuchli model | — |
| Kontent generatsiya | kuchli model | ✅ passage qayta ishlatiladi |
| Mnemonika / misol jumla | tez model | ✅ **so'z bo'yicha — bir marta yaratiladi, hammaga ishlaydi** |

Oxirgi qator muhim: so'z darajasidagi AI kontenti (misol, mnemonika, distraktor) **`words` kolleksiyasiga yoziladi** va barcha foydalanuvchilarga xizmat qiladi. Har foydalanuvchi uchun qaytadan generatsiya qilinmaydi.

Har foydalanuvchiga kunlik AI limiti (tarifga qarab) + `ai_usage` logi.

---

## 13. MOTIVATSIYA VA GAMIFIKATSIYA

| Element | Mexanika |
|---------|----------|
| **Alanga (streak)** | Bor. Qo'shish: muzlatgich tokenlari (oyiga 2), 7/30/100/365 kunlik bosqichlar, alanga vizual o'sadi |
| **XP va daraja** | Har amal XP beradi: takrorlash 1, to'g'ri javob 2, yangi so'z 5, mock 100. Daraja: A1→C2 nomlari bilan |
| **Kunlik maqsad** | Bor (0/20). Qo'shish: moslashuvchan — tizim o'rtacha tezlikni bilib, real maqsad qo'yadi |
| **Yutuqlar (badges)** | "Birinchi 100 so'z", "7 kun alanga", "Mock 7.0", "Kechqurun boyqushi", "Mukammal sessiya" |
| **Leaderboard** | Haftalik XP bo'yicha; do'stlar orasida va umumiy. Liga tizimi (Bronza→Olmos) |
| **Do'stlar** | Bor (chat). Qo'shish: **duel** — 60 soniyalik so'z bahsi, natija chatga yuboriladi |
| **Sertifikat** | 500/1000/2000 so'z o'zlashtirilganda ulashiladigan rasm (Instagram uchun) |
| **Kunlik topshiriq** | "Bugun 3 ta yangi kollokatsiya o'rgan" — har kuni yangi |

**Ehtiyot bo'ling:** gamifikatsiya o'rganishni o'rnini bosmasligi kerak. Tezkor o'yin XP beradi, lekin `Easy` reyting bermaydi (5.2-bo'limga qarang).

---

## 14. DIZAYN TIZIMI

### 14.1 Rang (Deep Merlot — kengaytirilgan)

```css
:root {
  /* Neytral fon */
  --bg:            #F3EDE6;   /* asosiy fon — issiq qog'oz */
  --bg-sunken:     #EBE3DA;   /* chuqurroq zona */
  --surface:       #FAF6F2;   /* karta */
  --surface-2:     #FFFFFF;   /* ko'tarilgan karta / modal */

  /* Brend */
  --primary:       #4A1226;   /* deep merlot — sidebar, sarlavha */
  --primary-600:   #5C1A31;
  --primary-300:   #8B4A5E;
  --accent:        #B8394A;   /* CTA, urg'u */
  --accent-hover:  #A02F3F;
  --accent-soft:   #F5E1E4;   /* accent fon (badge, chip) */

  /* Matn */
  --text:          #2A0F18;
  --text-muted:    #6B5B54;
  --text-faint:    #9C8B84;
  --on-primary:    #FBF7F4;

  /* Semantik — merlot bilan uyg'un, neon emas */
  --success:       #2E7D5B;   --success-soft: #E3F0E9;
  --warning:       #B8802A;   --warning-soft: #F7EDD9;
  --danger:        #C0392B;   --danger-soft:  #F9E4E1;
  --info:          #3B6E8F;   --info-soft:    #E3EDF3;

  /* SRS holatlari — ma'noli ranglar */
  --srs-new:       #9C8B84;
  --srs-learning:  #B8802A;
  --srs-review:    #3B6E8F;
  --srs-mastered:  #2E7D5B;

  /* Chegara va soya */
  --border:        #E4D9CF;
  --border-strong: #D3C4B8;
  --shadow-sm:  0 1px 2px rgba(74,18,38,.06);
  --shadow-md:  0 4px 16px rgba(74,18,38,.08);
  --shadow-lg:  0 12px 40px rgba(74,18,38,.12);
  --shadow-glow: 0 0 0 4px rgba(184,57,74,.14);   /* focus ring */
}

[data-theme="dark"] {
  --bg:           #17090E;
  --bg-sunken:    #120609;
  --surface:      #210F16;
  --surface-2:    #2C151E;
  --primary:      #F0DCE1;
  --accent:       #E05A6D;    /* qorong'ida kontrast uchun yorug'roq */
  --accent-soft:  #3A1620;
  --text:         #F5E9EC;
  --text-muted:   #B8A3A9;
  --border:       #3A222B;
}
```

**60-30-10 qoidasi:**
- 60% — `--bg` / `--surface` (issiq neytral)
- 30% — `--primary` (sidebar, sarlavhalar, ikonkalar)
- 10% — `--accent` (faqat CTA va muhim urg'u). **Sahifada 2 tadan ko'p accent tugma bo'lmasin.**

**Kontrast tekshiruvi (WCAG AA):** hamma matn juftligi ≥4.5:1, katta matn ≥3:1. `--text-faint` faqat dekorativ matnda.

### 14.2 Tipografika

```
Display / H1:  Playfair Display 700 · clamp(32px, 5vw, 56px) · lh 1.1  · ls -0.02em
H2:            Playfair Display 600 · clamp(24px, 3.5vw, 36px) · lh 1.2
H3:            Inter 600 · 20–24px · lh 1.3
Body:          Inter 400 · 16px (mobil 15px) · lh 1.6
Small / meta:  Inter 500 · 13px · lh 1.4 · ls 0.02em · UPPERCASE (label uchun)
Mono:          JetBrains Mono · IPA, raqamlar, taymer
Word display:  Playfair Display 600 · clamp(36px, 8vw, 72px)  ← kartochkadagi so'z
```

Qoidalar:
- Bir ekranda **2 tadan ko'p shrift oilasi yo'q**
- Matn qatori 65–75 belgidan uzun bo'lmasin (`max-width: 68ch`)
- Raqamlar uchun `font-variant-numeric: tabular-nums` (statistika sakramasligi uchun)

### 14.3 Spacing va radius

```
Space scale (4px baza): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96
Radius: sm 8px · md 12px · lg 16px · xl 24px · full 999px
Karta: radius-lg + border 1px + shadow-sm; hover → shadow-md + translateY(-2px)
```

### 14.4 Komponent kutubxonasi (qurish kerak)

```
components/
├── ui/           Button, Input, Select, Checkbox, Radio, Switch, Slider,
│                 Badge, Chip, Tooltip, Popover, Dialog, Sheet, Drawer,
│                 Tabs, Accordion, Progress, Skeleton, Toast, Avatar
├── learn/        FlashCard, RatingBar, ChoiceGrid, TypeInput, MatchGrid,
│                 ClozeText, AudioPlayer, WaveformPlayer, RecordButton,
│                 SessionHeader, SessionSummary, StreakFlame, XPBurst
├── data/         StatCard, ActivityChart, MasteryDonut, ForecastBars,
│                 BandMeter, HeatmapCalendar, LeaderRow
├── reading/      PassagePane, QuestionPane, HighlightLayer, WordPopover
├── exam/         ExamShell, ExamTimer, QuestionNavigator, SubmitDialog
└── layout/       AppShell, Sidebar, BottomNav, TopBar, AIPanel, EmptyState
```

### 14.5 Motion tizimi

```
Duration: instant 100ms · fast 180ms · base 260ms · slow 400ms · page 500ms
Easing:   standard cubic-bezier(.2,.8,.2,1)
          enter    cubic-bezier(0,.8,.2,1)
          exit     cubic-bezier(.4,0,1,1)
          spring   (framer-motion: stiffness 260, damping 26)
```

Majburiy animatsiyalar:
| Element | Animatsiya |
|---------|-----------|
| Kartochka aylanishi | `rotateY 180deg`, 400ms, perspective 1200px |
| To'g'ri javob | Yashil pulse + XP raqami tepaga uchadi + engil haptic (mobil) |
| Xato javob | Gorizontal shake 3× 6px, 300ms |
| Progress bar | `width` transition 600ms |
| Sahifa o'tishi | Fade + 8px translateY, 260ms |
| Streak alanga | Pastadir SVG animatsiya (1.6s), kun oshsa "burst" |
| Sessiya yakuni | Konfetti (faqat rekord yoki 100% aniqlikda — har safar emas) |
| Sonlar | `count-up` 800ms (band, XP, statistika) |

**`prefers-reduced-motion: reduce`** — hamma harakat `opacity` ga tushadi. Bu majburiy.

### 14.6 Dizayn yo'nalishi (siz so'ragan premium his)

Sizning uslub afzalligingiz — maksimalizm, scroll-animatsiya, 3D, kutilmagan ranglar. Buni **landing sahifasida** to'liq oching, **ilova ichida** esa jilovlab qo'ying:

| Zona | Yondashuv |
|------|-----------|
| **Landing** | To'liq maksimalizm: scroll-driven parallax, 3D so'z buluti (`react-three-fiber`), katta Playfair tipografika, merlot gradient meshlar, tekstura (noise overlay), magnit kursor |
| **Dashboard** | O'rtacha: yumshoq gradientlar, jonli statistika, mikro-animatsiya |
| **O'quv rejimlar** | **Minimal.** Mashq paytida hech narsa chalg'itmasligi kerak. Faqat karta, faqat matn |
| **Natija ekranlari** | Yana bayramona: count-up, konfetti, ulashiladigan grafika |

Bu qoida muhim: **o'rganish paytida dizayn ko'rinmasligi kerak.**

---

## 15. RESPONSIVE SPETSIFIKATSIYA

### 15.1 Breakpoint'lar

```
xs   0–479     telefon (portret)
sm   480–767   katta telefon / kichik planshet
md   768–1023  planshet (portret)      ← HOZIR BUZUQ
lg   1024–1279 planshet (landshaft) / kichik noutbuk
xl   1280–1535 desktop
2xl  1536+     katta ekran
```

### 15.2 Layout matritsasi

| Zona | xs–sm | md | lg | xl+ |
|------|-------|----|----|-----|
| Navigatsiya | Pastki tab bar (5) | Ikonkali rail 72px | Rail 72px, hover'da 260px | To'liq sidebar 260px |
| Dashboard grid | 1 ustun | 2 ustun | 3 ustun | 4 ustun (12-col grid) |
| Kartochka | To'liq ekran, swipe | 560px markazda | 640px | 720px + yon panelda statistika |
| Reading | Tab (Matn/Savol) | Tab | Split 50/50 | Split 60/40 + o'ng panelda lug'at |
| Jadval (so'zlar) | Karta ro'yxati | 2 ustunli karta | Jadval | Jadval + inline tahrir |
| Mock | To'liq ekran, savol navigatori pastda | Xuddi shunday | Split | Split + navigator yon tomonda |
| AI panel | To'liq ekran modal | To'liq ekran modal | Sheet 400px | Yon panel 420px |

### 15.3 Mobil talablari (majburiy)

- **Pastki tab bar:** `Bugun · Lug'at · Mashq · AI · Profil`, `position: fixed`, `padding-bottom: env(safe-area-inset-bottom)`
- **Tegish nishoni:** minimal 44×44px (Apple HIG), tugmalar orasi ≥8px
- **Barmoq zonasi:** asosiy amal tugmalari ekranning pastki 1/3 qismida
- **Swipe:** kartochkada chap/o'ng/tepa; sahifalar orasida gorizontal swipe
- **Haptic:** `navigator.vibrate(10)` to'g'ri javobda, `[30,50,30]` xatoda
- **Klaviatura ochilganda:** input `scrollIntoView`, layout sakramasin (`interactive-widget=resizes-content`)
- **Pull-to-refresh** o'chirilsin o'quv rejimlarida (`overscroll-behavior: none`)
- **Shrift:** input'larda ≥16px (iOS avtomatik zoom qilmasligi uchun)
- **Landshaft rejimi:** telefon yon holatda — kartochka gorizontal layout

### 15.4 PWA (majburiy — T1 muammosi)

```json
// public/manifest.json
{
  "name": "Vocably — Ingliz tili",
  "short_name": "Vocably",
  "start_url": "/app",
  "display": "standalone",
  "background_color": "#F3EDE6",
  "theme_color": "#4A1226",
  "orientation": "portrait-primary",
  "icons": [ /* 192, 384, 512, maskable */ ],
  "shortcuts": [
    { "name": "Takrorlash", "url": "/app/lugat/takrorlash" },
    { "name": "Tezkor o'yin", "url": "/app/lugat/rejim/tezkor" }
  ]
}
```

**Service Worker strategiyasi:**
| Resurs | Strategiya |
|--------|-----------|
| App shell (HTML/JS/CSS) | Stale-while-revalidate |
| Audio (so'z talaffuzi) | Cache-first, 90 kun |
| So'z ma'lumotlari (bugungi navbat) | IndexedDB'ga oldindan yuklash |
| Javoblar (offline) | Background Sync queue → internet kelganda yuborish |

**Offline rejimda ishlashi shart:** kartochka, test, yozish testi, juftlikni topish (bugungi navbat oldindan yuklanadi). Ishlamaydi: AI, speaking, mock.

---

## 16. ADMIN PANEL 2.0

Hozirgi bo'limlar saqlanadi, **kontent boshqaruvi qo'shiladi**.

```
Vocably Admin Suite
├── 📊 Dashboard          DAU/WAU/MAU, retention (D1/D7/D30), sessiya davomiyligi,
│                         eng faol rejimlar, tushib ketish nuqtalari (funnel)
├── 📚 KONTENT (YANGI)
│   ├── So'zlar           CRUD, ommaviy import (CSV/XLSX/Anki .apkg),
│   │                     AI boyitish ("bo'sh maydonlarni to'ldir"), sifat filtri
│   ├── Kategoriyalar     deck yaratish, tartiblash, ommaviy/shaxsiy
│   ├── Reading           passage editor, savol quruvchi, AI generatsiya, CEFR tekshiruv
│   ├── Listening         audio yuklash, transkript (Whisper avtomatik), vaqt belgilash
│   ├── Speaking          prompt bank, cue card'lar
│   ├── Writing           task bank, namunaviy javoblar (band bilan)
│   └── Mock              to'liq test yig'ish, javob kaliti, nashr/qoralama
├── 🎓 O'QUV ANALITIKASI (YANGI)
│   ├── Qiyin so'zlar     eng ko'p lapse bo'lgan 100 so'z → kontentni tuzatish signali
│   ├── Rejim samaradorligi  qaysi rejim retention'ni eng ko'p oshiradi
│   ├── Retention egri chizig'i  FSRS bashorati vs haqiqiy natija
│   └── Kontent sifati    savollar bo'yicha to'g'ri javob %, juda oson/qiyinlarni belgilash
├── 👥 Foydalanuvchilar   bor + obuna holati, o'quv tarixi, admin sifatida "kirish"
├── 💳 To'lovlar (YANGI)  tariflar, tranzaksiyalar, promo kodlar, qaytarishlar
├── 💬 Suhbatlar          bor
├── 🚩 Reportlar          bor
├── 📢 E'lonlar           bor + segmentlash (kimga ko'rsatish), push notification
└── 🔍 Audit log          bor
```

**Kontent workflow:** `qoralama → AI tekshiruvi → admin ko'rib chiqishi → nashr`. Har bir o'zgarish audit logga tushadi.

---

## 17. SIFAT TALABLARI

### 17.1 Accessibility (WCAG 2.2 AA)

- **T2 muammosi:** 72 ta ikonka-tugmaga `aria-label` qo'shilsin
- Klaviatura bilan to'liq boshqarish; `:focus-visible` — 2px `--accent` ring + 2px offset
- Modal'da focus trap, `Esc` bilan yopish
- Har bir mashq rejimi uchun klaviatura yorliqlari (`?` tugmasi ro'yxatni ochadi)
- `aria-live="polite"` — javob to'g'ri/xatoligi haqida skrinriderga xabar
- Rang yolg'iz ma'no tashimasin (to'g'ri/xato uchun ikonka ham bo'lsin)
- Audio kontentga transkript majburiy
- `prefers-reduced-motion` va `prefers-contrast` qo'llab-quvvatlansin

### 17.2 Performance byudjeti

| Metrika | Maqsad |
|---------|--------|
| LCP | < 2.0s (4G) |
| INP | < 200ms |
| CLS | < 0.05 |
| Boshlang'ich JS | < 180KB gzip |
| Kartochka almashish kechikishi | < 50ms |
| Lighthouse (Performance / A11y / Best Practices / SEO) | ≥ 90 / ≥ 95 / ≥ 95 / ≥ 95 |

Usullar: RSC (server components) maksimal, `next/dynamic` og'ir modullar uchun (three.js, wavesurfer, chart), `next/font` (allaqachon), rasm `next/image` + AVIF/WebP, audio CDN + `preload="none"`.

### 17.3 SEO (T3 muammosi)

- Landing, narxlar, blog — **statik generatsiya**
- Har so'z uchun ochiq sahifa: `/lugat/resilient` — "resilient tarjimasi, talaffuzi, misollar" → uzun dumli qidiruv trafigi
- `sitemap.xml`, `robots.txt`, OG rasmlar (dinamik `@vercel/og`)
- Schema.org: `Course`, `EducationalOccupationalProgram`, `FAQPage`
- O'zbekcha kalit so'zlar: "ingliz tili so'zlarini yodlash", "IELTS mock test online", "ingliz tili darslari onlayn"
- Blog: haftada 1 maqola (AI yordamida, admin tahriri bilan)

---

## 18. API SPETSIFIKATSIYASI (asosiylari)

```
AUTH
POST   /api/auth/register            {phone, password, name}
POST   /api/auth/login
POST   /api/auth/otp/send | /verify

LUG'AT
GET    /api/decks                                → kategoriyalar + progress
POST   /api/decks
GET    /api/decks/:id/words?page=&q=
POST   /api/words                                → bitta so'z
POST   /api/words/bulk                           → CSV/XLSX import
POST   /api/words/:id/enrich                     → AI bilan bo'sh maydonlarni to'ldirish

SRS
GET    /api/queue/today?limit=40                 → aralashtirilgan navbat
POST   /api/review          {card_id, rating, ms, mode}
GET    /api/forecast?days=7                      → kelgusi yuk
GET    /api/stats/summary                        → dashboard uchun bitta so'rov

MASHQ SESSIYALARI
POST   /api/sessions/start   {mode, deck_id?, size?}
POST   /api/sessions/:id/answer
POST   /api/sessions/:id/finish                  → XP, aniqlik, keyingi tavsiya

READING / LISTENING
GET    /api/reading/passages?cefr=&topic=&type=
POST   /api/reading/:id/submit                   → ball + har savolga izoh
GET    /api/listening/items?cefr=&accent=
POST   /api/listening/:id/submit

SPEAKING
POST   /api/speaking/upload      (multipart audio)
GET    /api/speaking/:id/feedback                → pronunciation + band + izoh

WRITING
POST   /api/writing/submit   {task, prompt_id, text}
GET    /api/writing/:id/feedback

MOCK (Everest-Mock'dan port)
POST   /api/exam/start       {mock_id, mode: "exam"|"practice"}
GET    /api/exam/:id/state                       → server taymeri (authoritative)
POST   /api/exam/:id/section/start
POST   /api/exam/:id/answer
POST   /api/exam/:id/essay
POST   /api/exam/:id/audio/start                 → play-once
POST   /api/exam/:id/submit                      → idempotent

AI
POST   /api/ai/chat          (streaming SSE)
POST   /api/ai/generate/passage   (admin)
POST   /api/ai/generate/questions (admin)

ADMIN
GET    /api/admin/analytics/learning
GET    /api/admin/content/quality
POST   /api/admin/content/:type/:id/publish
```

---

## 19. FAZALAR VA QABUL MEZONLARI

### FAZA 0 — Poydevor (1–2 hafta)
- [ ] Design token'lar → `globals.css` + `tailwind.config.ts`
- [ ] `components/ui/*` — 20 ta bazaviy komponent, Storybook yoki `/dev/ui` sahifasi
- [ ] Dark mode (`next-themes`)
- [ ] AppShell: sidebar (desktop) / rail (planshet) / bottom nav (mobil)
- [ ] Barcha rejimlarni **URL'ga ko'chirish** (U4)
- [ ] `aria-label` auditi (T2)
- [ ] PWA: manifest + service worker (T1)

**Qabul:** Lighthouse A11y ≥95; 390/768/1280/1600px da hech qayerda gorizontal scroll yo'q; dark mode barcha ekranlarda ishlaydi.

### FAZA 1 — Ma'lumot modeli va SRS (2 hafta)
- [ ] `words` sxemasini kengaytirish + mavjud so'zlarni migratsiya qilish
- [ ] `POST /api/words/:id/enrich` — mavjud 215+ so'zni AI bilan boyitish (IPA, misol, kollokatsiya, CEFR)
- [ ] `cards` kolleksiyasi + `ts-fsrs` integratsiyasi
- [ ] Eski progress ma'lumotini FSRS holatiga ko'chirish (state → stability boshlang'ich qiymati)
- [ ] `/api/queue/today` — aralash navbat
- [ ] "Dan/Gacha" formalarini o'chirish (U1)

**Qabul:** Foydalanuvchi bitta tugma bosib takrorlashni boshlaydi; navbatda review+new to'g'ri nisbatda; 7 kunlik prognoz haqiqiy raqamlarni ko'rsatadi.

### FAZA 2 — Vocabulary rejimlarini qayta qurish (2–3 hafta)
- [ ] Kartochka: flip animatsiya + 4 ta baholash tugmasi + interval ko'rsatish + swipe
- [ ] Test: aqlli distraktorlar + 4 ta yo'nalish
- [ ] Yozish testi: qisman kredit + audio rejim
- [ ] Juftlikni topish: 5 xil juftlik turi
- [ ] Tezkor o'yin: kombo, jonlar, reyting
- [ ] Tinglab yozish: 4 daraja
- [ ] **Yangi:** Cloze, Kollokatsiya, So'z oilasi, Sinonim gradusi, Jumla quruvchi, Mnemonika, Rasm↔so'z, Antonim jangi
- [ ] Sessiya yakuni ekrani (U6)

**Qabul:** 14 ta rejim ishlaydi; har biri FSRS'ga to'g'ri reyting yuboradi; mobilda swipe bilan boshqariladi.

### FAZA 3 — Ko'nikma modullari (3–4 hafta)
- [ ] Reading: 10 ta task turi + 6 ta trening rejimi + split view + highlight + so'z popover
- [ ] Listening: task turlari + shadowing + dictogloss + vaqtli transkript + waveform
- [ ] Speaking: Azure pronunciation assessment + Whisper + AI band feedback
- [ ] Writing: AI grader + inline korreksiya
- [ ] **Zanjir mexanizmi** (6.3-bo'lim) — cron + dashboard bloki

**Qabul:** Har bir bo'limda kamida 20 ta tasdiqlangan material; har javobga izoh beriladi; speaking fonema darajasida ball qaytaradi.

### FAZA 4 — Mock imtihon (2 hafta)
- [ ] `exam.py` → `lib/exam/engine.ts` port
- [ ] Server taymeri, autosave, play-once audio, idempotent submit
- [ ] `mode: exam | practice`
- [ ] Exam shell UI + savol navigatori
- [ ] Natija sahifasi + savol turlari bo'yicha zaiflik tahlili
- [ ] Mock'dagi noma'lum so'zlarni lug'atga qo'shish

**Qabul:** Imtihon o'rtasida sahifa yangilansa vaqt va javoblar saqlanadi; listening audio qayta boshlanmaydi; ikki marta submit bir xil natija qaytaradi.

### FAZA 5 — Admin, AI, gamifikatsiya (2 hafta)
- [ ] Admin kontent CMS (16-bo'lim)
- [ ] AI kontent generatsiya quvuri + sifat tekshiruvi
- [ ] AI panel (sirg'aluvchi, kontekstli) + markdown + streaming + emoji picker
- [ ] XP, darajalar, badge'lar, leaderboard, duel
- [ ] O'quv analitikasi

**Qabul:** Admin kod yozmasdan to'liq mock test yarata oladi; AI panel istalgan sahifadan ochiladi va kontekstni biladi.

### FAZA 6 — Landing, SEO, monetizatsiya (2 hafta)
- [ ] Marketing landing (maksimalist dizayn, 3D, scroll-animatsiya)
- [ ] `/lugat/[word]` ochiq so'z sahifalari (SEO)
- [ ] Blog + sitemap + OG
- [ ] Tariflar + to'lov (Payme/Click) + bepul limit
- [ ] Demo rejim (ro'yxatdan o'tmasdan)

**Qabul:** Lighthouse SEO ≥95; landing 3G'da <3s LCP; to'lov oqimi uchdan uchgacha ishlaydi.

---

## 20. RISKLAR VA QARORLAR

| Risk | Ta'sir | Yechim |
|------|--------|--------|
| **Kontent yetishmasligi** | Yuqori — 4 ta modul uchun material kerak | AI generatsiya + admin tasdiq oqimi (12.3). Ochilishga: 50 passage, 40 listening, 100 speaking prompt, 5 to'liq mock |
| **AI xarajati** | O'rta | So'z darajasidagi keshlash (12.4) + tarif limitlari + arzon model routing |
| **Speaking API narxi** | O'rta | Azure pronunciation faqat premium tarifda; bepul tarifda Whisper + LLM (fonemasiz) |
| **FSRS migratsiyasi** | O'rta | Eski progressni yo'qotmaslik: `state` → boshlang'ich `stability` mapping jadvali; migratsiyadan oldin backup |
| **Ko'lam kattaligi** | Yuqori | Fazalar qat'iy; Faza 0–2 alohida ham qiymat beradi (mavjud foydalanuvchilar darhol yaxshilanishni sezadi) |
| **Mobil offline murakkabligi** | O'rta | Faqat vocabulary rejimlari offline; qolgani onlayn talab qiladi (ochiq aytiladi) |

---

## 21. BIRINCHI QADAMLAR (Claude Code uchun buyruq)

Ushbu tartibda boshlang:

1. **Design token'lar** — `app/globals.css` va `tailwind.config.ts` ni 14.1–14.3 bo'limlaridagi qiymatlar bilan yangilang. Dark mode qo'shing.
2. **AppShell** — `components/layout/AppShell.tsx`: desktop sidebar / planshet rail / mobil bottom nav. Mavjud sidebar'ni almashtiring.
3. **Routing** — barcha rejimlarni `/app/...` URL'lariga ko'chiring (3.1-bo'lim IA).
4. **`words` sxemasi** — 4.1 bo'yicha kengaytiring, migratsiya skripti yozing, `enrich` endpoint bilan mavjud so'zlarni boyiting.
5. **FSRS** — `ts-fsrs` o'rnating, `cards` kolleksiyasi, `/api/queue/today`, `/api/review`.
6. **Kartochka** — 6.1.1 bo'yicha to'liq qayta yozing (flip + 4 baho + swipe + interval).

Har qadamdan keyin: 390 / 768 / 1280 px da tekshiring, Lighthouse ishga tushiring, `prefers-reduced-motion` bilan sinang.

---

*Hujjat oxiri. Savol yoki o'zgartirish kerak bo'lsa — qaysi bo'lim raqamini ayting.*
