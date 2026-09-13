# TZ — Vocably AI Content Ingestion Agent: Avtopilot qo'shimchasi

**Loyiha:** Vocably (vocably.uz)
**Modul:** Admin → Kontent studiyasi (AI avtopilot qatlami)
**Bazaviy hujjat:** `docs/ai-content-agent-tz.md` (v1.0, 12.09.2026)
**Versiya:** 1.1 — qo'shimcha (delta) TZ
**Sana:** 13.09.2026
**Muallif:** Jamolxon + Claude (admin panelni jonli audit qilib yozildi)

---

## 0. Bu hujjat nima va nega kerak

v1.0 TZ juda to'g'ri qurilgan, lekin uni diqqat bilan o'qisang, ko'p joyda pipeline **AI ishlaydi → admin tugma bosadi → keyingi bosqich ishlaydi** tarzida yozilgan. Ya'ni AI faqat *tahlil qiladi*, qaror va davom ettirishni esa **admin qo'lda** qiladi:

- "Admin *Aralash mock yaratish* tugmasini bosadi → tizim tanlaydi" (9.3-bo'lim)
- "Admin *Yangi Reading passage generatsiya qil* bosadi → mavzu, qiyinlik, savol turlarini tanlaydi" (17-bo'lim)
- Tekshiruv navbatida **har bir** past-ishonchli savol guruhini admin `A`/`E` bilan qo'lda ko'rib chiqadi — hatto `confidence: 0.89` bo'lsa ham.
- Test tayyor bo'lgach nashr qilish alohida qo'lda bosiladigan tugma.
- Audio chegaralari avtomatik kesiladi, lekin admin baribir waveform'ni ochib tasdiqlashi kerak degan taassurot qoldiradi.

Sen aynan shu narsani o'zgartirishni so'rayapsan: **"mockga qo'sh" kabi qarorlarni admin aytmasin — AI o'zi ko'rib, o'zi moslab, o'zi qo'shsin.** Ya'ni admin rolini *operator* dan *nazoratchi/istisno hal qiluvchi* (exception handler) ga tushirish kerak. Bu hujjat aynan shu — **Avtopilot qatlami** — TZsi.

Avval joriy holatni jonli tekshirdim (quyida), keyin nima avtomatlashishi kerakligini aniq belgilab, arxitektura va TZ yozdim.

---

## 1. Jonli audit — 13.09.2026, admin panel

v1.0 TZning 1-bo'limi ("Hozirgi holat") yozilgandan beri kod qisman ilgarilagan. Admin panelda haqiqatda mavjud bo'lganini tekshirdim:

| Sahifa | URL | Holat |
|---|---|---|
| Kontent studiyasi → Kutubxona | `/admin/content/books` | Bor, lekin bo'sh ("Hozircha kitob yuklanmagan") |
| Yangi kitob (4 qadamli sehrgar) | `/admin/content/books/new` | Bor — 4 qadam ko'rinadi (Fayllar / Ma'lumot / Sozlamalar / Tasdiqlash), 1-qadamda PDF va audio yuklash maydoni ishlaydi |
| Tekshiruv navbati | `/admin/content/review` | Bor, UI tayyor (0 blocker / 0 warning, status filtrlari: open/fixed/accepted/rejected, J/K/A/E klaviatura eslatmasi bor), lekin ma'lumot yo'q |
| AI sozlamalari → Sinov chat | `/admin/content/ai` | Bor, ishlaydi — `taskKey` tanlash (`book.segment` va h.k.), erkin chat |
| AI sozlamalari → Sozlamalar | `/admin/content/ai` (tab) | Bor — 11 ta `taskKey` uchun (book.segment, section.split, reading.parse, listening.parse, writing.parse, speaking.parse, answerkey.parse, image.classify, qa.validate, writing.grade, speaking.grade) alohida karta: temp, maxTokens, costCap, "Saqlash". Xarajat hisoblagichi bor ("$0.00, so'nggi 30 kunda") |
| Mock konstruktor | `/admin/content/mocks` | **404 — hali qurilmagan** |
| Ishlov jarayoni (jobs) | `/admin/content/jobs` | **404 — hali qurilmagan** |
| Media | `/admin/content/media` | **404 — hali qurilmagan** |
| IELTS testlar (eski, hali "Kontent studiyasi" ichiga ko'chirilmagan) | `/admin/exam-tests` | Bor, ishlaydi: 4 ta nashr qilingan test, import usullari — **JSON import / DSL (Reading) / AI yordamchi (Reading)**. Faqat Reading uchun AI bor, tahrirlash oynasi yo'q |

**Xulosa:** M1 milestone (poydevor — R2 tuzilma taxmin qilinadi, kolleksiyalar, AI router, AI sozlamalari UI, kitob yuklash sehrgari, tekshiruv navbati UI) **katta qismi qurilgan yoki skeleton holatda tayyor**. Lekin haqiqiy pipeline (S1–S12), job monitoring, mock generatori, media ekrani — **hali ishlamaydi**. Demak hozir eng to'g'ri payt: pipeline'ni birinchi martadan **avtopilot mantiqi bilan** qurish — keyin "avval qo'lda, keyin avtomatlashtiramiz" qilib ikki marta ishlamaslik kerak.

---

## 2. Prinsip: "Admin tugma bosmaydi, AI harakat qiladi"

v1.0 dagi har bir "admin bosadi" nuqtasini shu jadvalda **avtomatik harakatga** aylantiraman. Bu — hujjatning markazi.

| # | v1.0 dagi holat (qo'lda) | v1.1 avtopilot holati (AI o'zi) |
|---|---|---|
| 1 | Admin "Ishlov berishni boshlash" bosadi | **Qoladi** — fayl yuklashning o'zi ixtiyoriy inson harakati (kontent tanlash). Lekin yuklangandan 10 soniya o'tib hech kim bosmasa ham, agar avtopilot yoqilgan bo'lsa, tizim **o'zi boshlaydi** (10.1-bo'limga qarang) |
| 2 | Har bir tekshiruv elementini admin `A`/`E` bilan ko'radi | AI `confidence ≥ autoAcceptThreshold` (default 0.93) bo'lgan **hamma** elementni **o'zi qabul qiladi** (`status: accepted, fixedBy: 'ai-agent'`). Faqat haqiqiy `blocker` yoki past ishonchli qoladi — bu ≤ 5% maqsadga mos |
| 3 | `qa.validate` farq topsa → `review_items` ga tashlanadi, admin tuzatadi | Yangi **S12.5 `self_heal`** bosqichi: AI farqni ko'rib, o'zi tuzatilgan versiyani generatsiya qiladi, uni yana `qa.validate` orqali o'tkazadi. 2 marta muvaffaqiyatsiz bo'lsagina odamga chiqadi |
| 4 | Test tayyor bo'lgach admin "Nashr qilish" bosadi | `qa.score ≥ autoPublishThreshold` (default 0.95) **va** `blockers = 0` bo'lsa, AI **o'zi nashr qiladi** (`POST /publish`, `publishedBy: 'ai-agent'`). Aks holda "Tekshiruv navbati" ga tushadi, admin ko'radi |
| 5 | Audio: "Admin UI'da waveform ochib, 4 marker'ni qo'lda drag qiladi" | AI kesgan chegaralar `silencedetect` + audioscript alignment bilan ikki marta o'zaro tekshiriladi (10.2-bo'lim). Ikkalasi ±0.5 s ichida mos kelsa — **avtomatik qabul**. Faqat farq bo'lganda admin'ga chiqadi, "qo'lda tuzatish" default emas, istisno |
| 6 | Rasm ↔ savol bog'lash: "bog'lanmaganlari qizil, admin bog'laydi" | `image.classify` ishonchi past bo'lgan rasmlar uchun AI ikkinchi urinish qiladi (sahifadagi qo'shni matn/raqamlarni qayta o'qib) — faqat ikkala urinish ham past bo'lsa odamga chiqadi |
| 7 | "Admin *Aralash mock yaratish* tugmasini bosadi" | **Yo'q qilinadi (majburiy emas).** Yangi `mock-scheduler` fon jarayoni: har safar test `published` bo'lganda yoki har N soatda, mavjud qoidalar (9.2/9.3) bo'yicha AI **o'zi** kerakli sondagi single + mixed mocklarni yaratadi. Admin faqat natijani ko'radi, xohlasa qo'lda ham qo'shimcha yaratishi mumkin (tugma qoladi, lekin endi ixtiyoriy) |
| 8 | 17-bo'lim: "Admin mavzu/qiyinlik/savol turini tanlab generatsiya qiladi" | Yangi **Kontent kalendari (content-gap scanner)**: AI har kuni mavjud testlar to'plamini tahlil qiladi — qaysi mavzular, qiyinlik darajalari, savol turlari yetishmayapti — va **o'zi** navbatga qo'shib generatsiya qiladi. Admin buni ham qo'lda ishga tushira oladi, lekin bo'sh joyni admin emas, AI topadi |
| 9 | Model tanlash — admin AI sozlamalarida dropdown orqali | **Qoladi, o'zgarmaydi.** Bu — admin nazorati bo'lishi shart bo'lgan yagona joy (xarajat va sifat tumbleri odam qo'lida qolishi kerak) |
| 10 | Litsenziya / nashr doirasi (`licence`, `publishScope`) | **Qoladi, o'zgarmaydi.** Bu huquqiy qaror — AI hech qachon o'zi `public` qilib qo'ymasligi kerak (16-bo'lim, o'zgarmas qoida) |

**Umumiy qoida:** AI *sifat/aniqlik* bilan bog'liq qarorlarni (matn to'g'rimi, savol turi to'g'ri aniqlandimi, audio chegarasi to'g'rimi, mockka qaysi testlar kirsin) o'zi qabul qiladi va faqat **haqiqiy noaniqlik** yoki **huquqiy/moliyaviy** qarorlarda odamga murojaat qiladi. Bu farq keyingi bo'limda kod darajasida qat'iylashtiriladi.

---

## 3. Avtopilot arxitekturasi

### 3.1 Yangi komponent: Orchestrator

v1.0 da har bosqich alohida BullMQ job, lekin ularni **kim navbatga qo'yadi** aniq emas edi (asosan admin API chaqiruvi orqali). Endi bittasi tugagach keyingisini **avtomatik** navbatga qo'yadigan markaziy komponent kerak:

```
worker/orchestrator/
├── stateMachine.ts     — bosqichlar orasidagi o'tish jadvali (extract → segment → … → assemble → qa → mock-check → publish-check)
├── policy.ts           — automation_policies'ni o'qiydi, "bu qadamni AI o'zi bossinmi?" degan savolga javob beradi
├── triggers.ts         — hodisa asosida ishga tushirish: book.uploaded, stage.succeeded, test.assembled, book.published
└── actions/
    ├── autoAccept.ts
    ├── selfHeal.ts
    ├── autoPublish.ts
    ├── mockScheduler.ts
    └── contentGapScanner.ts
```

**Qoida:** hech qanday bosqich endi faqat admin HTTP so'rovi bilan ishga tushmaydi. Har bir `ingest_jobs.stage` muvaffaqiyatli tugaganda (`status: succeeded`), orchestrator `stateMachine.ts` jadvaliga qarab **keyingi bosqichni o'zi** navbatga qo'yadi — agar policy shunga ruxsat bersa. Admin API endi faqat: (a) pipeline'ni **to'xtatish/qayta ishga tushirish**, (b) bosqichlar orasidagi **policy'ni o'zgartirish** uchun kerak.

### 3.2 Policy engine — nimani avtomatlashtirish darajasi

Har bir kitob va har bir avtomatlashtiruv turi uchun moslashuvchan bo'lishi kerak (masalan yangi admin birinchi kitobda hammasini qo'lda ko'rishni xohlashi mumkin). Shuning uchun **daraja** tushunchasi kiritiladi, global default + kitob darajasida override:

```ts
type AutomationLevel = 'manual' | 'assisted' | 'autopilot';

interface AutomationPolicy {
  scope: 'global' | { bookId: string };
  level: AutomationLevel;

  // 'assisted' va 'autopilot' rejimida ishlaydigan qoidalar:
  autoAcceptConfidence: number;      // default 0.93
  autoPublishMinQaScore: number;     // default 0.95
  autoPublishRequireZeroBlockers: true;  // o'zgarmas
  autoSelfHealMaxAttempts: number;   // default 2
  autoMockGeneration: boolean;       // default true (faqat autopilot'da)
  autoContentGapScan: boolean;       // default false (admin ongli ravishda yoqadi — xarajat sababli)
  maxAutonomousCostUsdPerDay: number; // default $15 — bu limitdan oshsa avtopilot to'xtaydi, admin xabardor qilinadi
}
```

- **`manual`** — v1.0 dagi asl xatti-harakat (hammasi admin tasdig'i bilan). Yangi/ishonchsiz kitob turlari uchun.
- **`assisted`** (**yangi default**) — AI yuqoridagi 2–8 nuqtalarni o'zi bajaradi, lekin **nashr qilishdan oldin** (4-band) admin'ga bitta umumiy "Bu tayyor, ko'rib chiq" bildirishnomasi yuboradi va 24 soat kutadi; javob bo'lmasa policy `autoPublish...` true bo'lsagina nashr qiladi.
- **`autopilot`** — hammasi (jumladan nashr) odam aralashuvisiz, faqat blocker yoki cost-cap to'xtatadi.

Bu daraja `AI sozlamalari` sahifasiga yangi tumbler sifatida qo'shiladi (11.5-bo'limga qo'shimcha, pastda).

### 3.3 Nega bu xavfsiz — qat'iy chegaralar (hech qachon buzilmaydi)

Avtopilot kuchli bo'lgani bilan, quyidagilar **kod darajasida hech qanday policy bilan aylanib o'tilmaydi** (v1.0 13-bo'limidagi B01–B13 kabi qat'iy):

1. `blockers > 0` bo'lgan test **hech qachon** avtomatik nashr qilinmaydi — level qanday bo'lishidan qat'i nazar.
2. `licence: 'third_party_copyright'` + `publishScope: 'public'` kombinatsiyasi — hamon 403 (16-bo'lim, o'zgarmaydi).
3. `maxAutonomousCostUsdPerDay` yoki kitob darajasidagi `maxCostUsd` oshsa — orchestrator **darhol** to'xtaydi, hech qanday keyingi bosqich navbatga qo'yilmaydi, admin'ga push/email boradi.
4. Model tanlovini AI o'zi o'zgartira olmaydi — faqat admin `AI sozlamalari`da.
5. Har bir avtonom qaror **audit log**ga yoziladi (quyida 4-bo'lim) — "kim qildi" degan savolga har doim javob bo'lishi kerak.
6. Admin istalgan payt bitta tugma bilan (`Avtopilotni to'xtatish`) butun orchestrator'ni pauza qilishi mumkin; pauza qilinganda joriy ishlayotgan job tugaydi, lekin **keyingi bosqich navbatga qo'yilmaydi**.

---

## 4. Ma'lumot modeliga qo'shimchalar

### 4.1 `automation_policies` (YANGI)

3.2-bo'limdagi sxema shu kolleksiyada saqlanadi. `scope: 'global'` — bitta hujjat; `scope: {bookId}` — kerak bo'lgandagina yaratiladi (topilmasa global qo'llanadi).

### 4.2 `agent_actions` (YANGI — avtonom qarorlar audit logi)

Mavjud `audit_log` (inson harakatlari uchun) dan ajratilgan, chunki hajmi va tuzilishi boshqacha (har bir mayda avto-qabul yozib borilsa `audit_log` shishib ketadi):

```ts
{
  _id, bookId, testId?, reviewItemId?,
  action: 'auto_accept' | 'self_heal' | 'auto_publish' | 'auto_mock_create'
        | 'content_gap_detected' | 'autopilot_paused_cost_cap' | 'audio_boundary_auto_confirmed',
  reasoning: string,          // AI'ning qisqa izohi — "confidence 0.96, ikkala model rozi"
  beforeConfidence?: number,
  afterConfidence?: number,   // self_heal uchun
  costUsd: number,
  createdAt: Date
}
```

Admin panelda bu **"AI faoliyati jurnali"** sifatida ko'rinadi — `Audit log` sahifasiga yangi filtr: `Aktyor: Admin / AI agent`.

### 4.3 `content_gaps` (YANGI — 17-bo'lim uchun avtomatlashtirilgan kirish)

```ts
{
  _id,
  dimension: 'topic' | 'difficulty' | 'questionType' | 'module',
  value: string,                    // "Environment" | "Passage 3 (hard)" | "flowchart_completion"
  currentCount: number,
  targetCount: number,
  priority: number,                 // 1–5, qanchalik kam ta'minlangan
  status: 'open' | 'queued' | 'generated' | 'dismissed',
  generatedTestId?: ObjectId,
  detectedAt: Date
}
```

`contentGapScanner.ts` har kuni (yoki admin "hozir skanerla" bossa) `exam_tests` va `review_items` statistikasini yig'ib shu kolleksiyani yangilaydi, `priority ≥ 4` bo'lganlarni avtomatik `queued` qilib 17-bo'limdagi generatsiya oqimini ishga tushiradi (agar `autoContentGapScan: true`).

### 4.4 `exam_tests` / `content_books` ga qo'shimcha maydonlar

```ts
// content_books
automationLevel?: 'manual' | 'assisted' | 'autopilot';  // override, bo'lmasa global

// exam_tests
publishedBy: 'admin' | 'ai-agent',
autoPublishedAt?: Date,
reviewSummary: { autoAccepted: number, humanReviewed: number, selfHealed: number }
```

---

## 5. Yangilangan pipeline — qo'shilgan bosqichlar

v1.0 dagi 12 bosqich (7-bo'lim) saqlanadi, ularning orasiga/oxiriga quyidagilar qo'shiladi:

### S12.5 — `self_heal` (AI: qayta ishlatiladi, `qa.validate` dan keyin, YANGI)

- Kirish: `qa.validate` natijasidagi har bir `diff`.
- AI (parse qilgan **xuddi shu** taskKey modeli, masalan `reading.parse`) diff'ni ko'rib, tuzatilgan `questionGroup` yoki maydonni qayta generatsiya qiladi — **faqat shikoyat qilingan maydonni**, butun guruhni emas (narx tejash).
- Tuzatilgan versiya yana `qa.validate` (boshqa oila modeli) orqali o'tadi.
- `automationPolicy.autoSelfHealMaxAttempts` (default 2) dan oshsa — `review_items` ga `reason: 'self_heal_exhausted'` bilan tushadi, admin ko'radi.
- Har urinish `agent_actions` ga `action: 'self_heal'` bilan yoziladi, `beforeConfidence` → `afterConfidence`.

### S13 — `auto_review_sweep` (AI'siz, kod, YANGI)

`validate` va `self_heal`dan keyin ishlaydi. `review_items` ichidagi hamma `status: open` elementlarni ko'rib chiqadi:

- `severity: 'blocker'` → o'zgarmaydi, admin kutadi (bu — yagona majburiy inson nuqtasi).
- `severity: 'warning'` va `confidence ≥ autoAcceptConfidence` → `status: 'accepted', fixedBy: 'ai-agent'`, `agent_actions`ga yoziladi.
- `severity: 'warning'` va `confidence < autoAcceptConfidence` → ochiq qoladi, admin ko'radi (bu — maqsadli ≤5%).

### S14 — `auto_publish_gate` (AI'siz, kod, YANGI)

`assemble` va `auto_review_sweep`dan keyin: `blockers === 0 && qa.score ≥ autoPublishMinQaScore` bo'lsa va policy `assisted`/`autopilot` bo'lsa → `POST /api/admin/exam-tests/:id/publish` ichki chaqiriladi, `publishedBy: 'ai-agent'`. `assisted` rejimida bundan oldin 24 soatlik bildirishnoma oynasi kutiladi (3.2-bo'lim).

### S15 — `mock_scheduler` (fon jarayoni, davriy + hodisaga bog'liq, YANGI)

Trigger: har safar test `published` bo'lganda YOKI har 6 soatda cron bilan.

1. Nashr qilingan, hali hech qaysi mockka kirmagan `single_test` mocklarni avtomatik yaratadi (har test uchun — bu deterministik, AI kerak emas).
2. `autoMockGeneration: true` bo'lsa, 9.3-bo'limdagi qoidalar bo'yicha (bir xil kitob-test ikki marta ishlatilmaydi, `user_seen_sections` chetlab o'tiladi, difficulty balanslanadi) **mixed** mocklarni ham o'zi yaratadi — maqsad: har doim kamida 3 ta "yangi" mixed mock **tayyor va kutib turishi** kerak (havzachani to'ldirib turish strategiyasi, foydalanuvchi so'raganda kutib qolmasin).
3. Har yaratilgan mock `agent_actions`ga `action: 'auto_mock_create'` bilan yoziladi.

### S16 — `content_gap_scan` (AI: `book.segment` darajasidagi arzon model, davriy, YANGI, ixtiyoriy — default off)

4.3-bo'limda tavsiflangan. Faqat `autoContentGapScan: true` bo'lganda ishlaydi (xarajat nazorati uchun default o'chiq — admin ongli ravishda yoqadi).

---

## 6. API qo'shimchalari

```
# Policy
GET    /api/admin/automation/policy?bookId=        → joriy policy (global yoki override)
PATCH  /api/admin/automation/policy                 → { scope, level, ...qoidalar }
POST   /api/admin/automation/pause                  → butun orchestrator'ni pauza qiladi
POST   /api/admin/automation/resume

# AI harakatlar jurnali
GET    /api/admin/agent-actions?bookId=&action=&from=&to=

# Content gap
GET    /api/admin/content-gaps?status=open
POST   /api/admin/content-gaps/:id/queue            → qo'lda navbatga qo'yish (odatda AI o'zi qiladi)
POST   /api/admin/content-gaps/scan-now             → darhol skanerlashni ishga tushirish

# Mock scheduler holatini ko'rish
GET    /api/admin/mocks/pool-status                 → { readyMixedMocks: 3, target: 3, lastGeneratedAt }
```

Mavjud `POST /api/admin/exam-tests/:id/publish` endpointi o'zgarmaydi, faqat endi ichki chaqiriladigan bo'ladi (`callerRole: 'ai-agent' | 'admin'` bilan belgilanadi, `publishedBy` shundan to'ldiriladi).

---

## 7. Admin UI o'zgarishlari

### 7.1 "AI sozlamalari" sahifasiga yangi uchinchi tab: **"Avtopilot"**

```
Sinov chat | Sozlamalar | Avtopilot
```

Ichida:
- Global daraja tumbleri: **Qo'lda / Yordamchi (tavsiya) / To'liq avtopilot**
- Har bir kitob uchun override ro'yxati (kerak bo'lsa)
- Chegaralar: `autoAcceptConfidence`, `autoPublishMinQaScore`, `autoSelfHealMaxAttempts`, `maxAutonomousCostUsdPerDay` — slider/input
- "Bugungi AI faoliyati" mini-panel: `X ta avtomatik qabul qilindi, Y ta o'zi tuzatildi, Z ta test o'zi nashr qilindi, N ta mock o'zi yaratildi`
- **Katta qizil tugma:** "Avtopilotni to'xtatish" — bosilsa darhol butun orchestrator pauza

### 7.2 "Kontent studiyasi" bosh sahifasiga status paneli

Hozirgi bo'sh "Kutubxona" ustiga, kitoblar ro'yxatidan oldin:

```
┌─────────────────────────────────────────────────────────┐
│  Avtopilot: YOQILGAN (Yordamchi)          [Boshqarish]  │
│  Bugun: 14 ta savol o'zi qabul qilindi · 2 ta o'zi       │
│  tuzatildi · 1 ta test nashrga tayyor (24s kutmoqda)     │
│  Tayyor mixed mocklar: 3/3                                │
└─────────────────────────────────────────────────────────┘
```

### 7.3 Tekshiruv navbati sahifasi — filtr qo'shiladi

Hozirgi `open/fixed/accepted/rejected` filtriga **"AI tomonidan hal qilindi"** yorlig'i qo'shiladi (`fixedBy: 'ai-agent'` bo'lganlar ko'k rangda, admin qilganlari yashil) — shunda admin nimani AI qilganini, nimani o'zi qilganini vizual ajrata oladi va ishonchni tekshirib borishi mumkin (ayniqsa boshida).

### 7.4 Audit log sahifasi — aktyor filtri

`Aktyor: Hammasi / Admin / AI agent` dropdown qo'shiladi.

---

## 8. Xavfsizlik va ishonch — qo'shimcha talablar

| Talab | Yechim |
|---|---|
| AI "sokin" xato qilib, sifat pasaymasligi kerak | Har hafta tasodifiy 10 ta AI-avtoqabul qilingan savol guruhi avtomatik ravishda admin'ga "tasdiqlash uchun namuna" sifatida ko'rsatiladi (push emas, Kontent studiyasi bosh sahifasida "Haftalik AI sifat namunasi" kartasi) — bu **kalibrlash** mexanizmi, agar admin ko'p marta rad qilsa, `autoAcceptConfidence` avtomatik oshiriladi (yoki tavsiya beriladi) |
| Avtopilot "jim" ishlab, admin bexabar qolib ketmasligi kerak | Har `auto_publish` va `auto_mock_create` hodisasi mavjud bildirishnoma tizimi (E'lonlar/push) orqali qisqa xabar yuboradi, lekin **spam qilmaydi** — kuniga bitta jamlangan xulosa (`Bugun AI 3 ta test nashr qildi, 2 ta mock yaratdi`) |
| Xarajat nazoratdan chiqmasligi | `maxAutonomousCostUsdPerDay` — bu global cost cap'dan **tashqari, qo'shimcha** limit, faqat autonom (admin bosmagan) harakatlar uchun hisoblanadi. Oshsa faqat avtopilot to'xtaydi, admin qo'lda davom ettira oladi |
| Litsenziya xatosi | O'zgarmaydi — 16-bo'limdagi qoida avtopilotda ham 100% amal qiladi, buni policy o'zgartira olmaydi (kodda hardcoded tekshiruv, policy'dan mustaqil) |
| Rollback | Har `auto_publish` qilingan test bitta bosishda `unpublish` qilinishi mumkin (mavjud funksionallik), qo'shimcha: `auto_mock_create` bilan yaratilgan mocklar ham bir bosishda o'chiriladi |

---

## 9. Ishlab chiqish bosqichi — M7 (v1.0 dagi M1–M6 dan keyin)

**M7 — Avtopilot qatlami (1–2 hafta), M2–M6 asosiy pipeline tayyor bo'lgach boshlanadi:**

1. `automation_policies` kolleksiyasi + `PATCH /api/admin/automation/policy`
2. `worker/orchestrator/stateMachine.ts` + `triggers.ts` — hodisaga asoslangan navbatga qo'yish (hozirgi admin-chaqiruvli tuzilmani almashtiradi, orqaga moslik uchun admin hali ham qo'lda "retry"/"qayta ishga tushirish" qila oladi)
3. S12.5 `self_heal`, S13 `auto_review_sweep`, S14 `auto_publish_gate`
4. S15 `mock_scheduler` — `/admin/content/mocks` sahifasi shu bilan birga to'liq quriladi (hozir 404)
5. `agent_actions` kolleksiyasi + `/admin/audit-log` ga aktyor filtri
6. AI sozlamalari → "Avtopilot" tab
7. Kontent studiyasi bosh sahifa status paneli
8. S16 `content_gap_scan` (ixtiyoriy, off-by-default) — vaqt qolsa shu sprintda, aks holda M8

**Qabul mezonlari (M7):**

1. `assisted` rejimida yuklangan kitobdan admin **bitta ham** tugma bosmasdan (faqat yuklashdan tashqari) 24 soat ichida nashrga tayyor testlar chiqadi va bildirishnoma keladi.
2. `autopilot` rejimida xuddi shu jarayon **hech qanday** admin aralashuvisiz, blocker bo'lmasa, oxirigacha (nashr + mock yaratishgacha) o'zi boradi.
3. Tekshiruv navbatida admin ko'radigan elementlar soni ≤ savollarning 5% (v1.0 dagi maqsad endi haqiqatda amalga oshadi, chunki 95%+ AI tomonidan avto-hal qilinadi).
4. `maxAutonomousCostUsdPerDay` sun'iy pasaytirilib sinalganda, limit oshgach orchestrator **darhol** to'xtaydi va admin bildirishnoma oladi (haqiqiy testda tekshiriladi).
5. Har bir avtonom qaror `agent_actions`da izi bilan ko'rinadi — tasodifiy 10 ta yozuv tanlab, "nega bu qaror qabul qilindi" savoliga `reasoning` maydoni orqali tushunarli javob berilishi tekshiriladi.
6. `licence: third_party_copyright` + `autopilot` rejimi kombinatsiyasida ham test hech qachon `publishScope: public` bilan nashr qilinmasligi — avtomatlashtirilgan test bilan tasdiqlanadi.

---

## 10. Claude Code uchun boshlang'ich prompt (M7)

> Vocably loyihasida `docs/ai-content-agent-tz.md` (v1.0) asosida Kontent studiyasi qurilmoqda — M1 (poydevor: R2, kolleksiyalar, AI sozlamalari UI, kitob yuklash sehrgari, tekshiruv navbati UI) katta qismi allaqachon tayyor (`/admin/content/books`, `/admin/content/books/new`, `/admin/content/review`, `/admin/content/ai` sahifalari ishlaydi). `/admin/content/mocks`, `/admin/content/jobs`, `/admin/content/media` hali 404.
>
> Endi `docs/ai-content-agent-tz-avtopilot.md` (v1.1, shu hujjat) asosida **Avtopilot qatlamini** qo'shamiz — maqsad: admin pipeline'ning har bosqichida qo'lda tugma bosmasin, AI o'zi qaror qabul qilib davom etsin (faqat haqiqiy blocker yoki xarajat limiti to'xtatsin).
>
> **M7 vazifasi:**
> 1. `automation_policies` kolleksiyasi va `worker/orchestrator/` (stateMachine, triggers, policy) — hodisaga asoslangan bosqichlar orasidagi avtomatik o'tish.
> 2. S12.5 `self_heal`, S13 `auto_review_sweep`, S14 `auto_publish_gate` bosqichlari — TZning 5-bo'limidagi mantiq bilan.
> 3. S15 `mock_scheduler` fon jarayoni + `/admin/content/mocks` sahifasini shu bilan birga quring (hozir 404).
> 4. `agent_actions` kolleksiyasi va uni yozadigan barcha auto-* action'lar.
> 5. `/admin/content/ai` sahifasiga "Avtopilot" tab (7.1-bo'lim) va Kontent studiyasi bosh sahifasiga status paneli (7.2-bo'lim).
> 6. Xavfsizlik: `licence`/`publishScope` va blocker-gate tekshiruvlari policy'dan **mustaqil**, hardcoded qolishi shart — buni alohida unit test bilan tasdiqlang.
>
> Kod yozishdan oldin ikkala hujjatni (`docs/ai-content-agent-tz.md` va `docs/ai-content-agent-tz-avtopilot.md`) o'qing va M7 uchun fayl ro'yxatini ko'rsating.

---

## 11. Ochiq savol

Yagona hal qilinishi kerak bo'lgan narsa: **`assisted` rejimidagi 24 soatlik kutish** kerakmi, yoki boshidanoq to'g'ridan-to'g'ri `autopilot` (kutishsiz) bilan boshlash kerakmi? Tavsiyam — birinchi 2–3 kitobni `assisted` bilan o'tkazib, AI qarorlariga ishonch hosil qilingach `autopilot`ga o'tish (8-bo'limdagi haftalik kalibrlash namunasi ham shu ishonchni tezroq qozonishga yordam beradi).