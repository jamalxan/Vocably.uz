# VOCABLY.UZ — LIVE AUDIT NATIJASI VA KEYINGI TZ (v2)

**Sana:** 22.09.2026
**Asos:** `VOCABLY_TZ_FINAL_WITH_ALL_AGREED_REQUIREMENTS_2026-09-20.md` (keyingi o'rinlarda — "20.09 TZ")
**Tekshiruv usuli:** production sayt (www.vocably.uz) admin akkaunt bilan brauzerda: sahifalar, admin panel, `/api/*` javoblari, published testlar kontenti, attempt natijalari, HTTP headerlar.
**Maqsad:** 20.09 TZ dagi ishlar qanchalik bajarilganini tasdiqlash, yangi topilgan xatolarni qayd etish va developer uchun aniq backlog berish.

---

## 0. QISQA XULOSA

Production'da 20.09 TZ dagi **P0 bandlarining deyarli hech biri yopilmagan**. Bundan tashqari, **yangi regressiya** bor: Reading, Listening va Writing sahifalari login qilingan foydalanuvchiga ham "Avval tizimga kiring." deb chiqyapti, ya'ni IELTS practice qismining 3/4 qismi ishlamayapti. Speaking'da esa bitta ham test yo'q.

| Ko'rsatkich | Natija |
|---|---|
| 20.09 TZ P0 bandlari (EX-01…05, AI-01, LEGAL-01) | 0 ta to'liq yopilgan, 1 ta qisman (LEGAL-01) |
| Yangi topilgan P0 xatolar | 6 ta |
| Ishlamayotgan asosiy student sahifalari | `/app/oqish`, `/app/tinglash`, `/app/yozish` (bo'sh ekran), `/app/gapirish` (test yo'q) |
| 20.09 TZ da so'ralgan yangi sahifalar | Birortasi ham yo'q (hammasi 404) |
| Konsol xatolari | Topilmadi |
| Do'stlar chati | Asosiy funksiyalar ishlaydi, lekin 1 ta P0 (suhbatlar ro'yxatdan yo'qolishi) + Telegram darajasiga yetish uchun katta bo'shliq — §9 |

**Birinchi navbatdagi vazifa — yangi xususiyat qo'shish emas, N-01…N-06 ni tuzatish.**

---

## 1. NIMA ISHLAYAPTI (tasdiqlandi)

- Landing, `/blog`, `/lugat`, `/demo`, sitemap (25 URL), robots.txt, meta description, OG image, canonical.
- `/app` dashboard: vocabulary statistikasi, streak, SRS navbati, kategoriya progressi.
- `/app/lug'at`: 14 rejim ochiladi, kategoriya tanlash ishlaydi.
- `/app/reyting`: "Bu hafta" / "Umumiy" tablari ishlaydi.
- `/app/mock`: boshlash kartasi chiqadi, faol mock tekshiriladi (`/api/exam/attempts/active-mock`).
- Admin: Statistika, Foydalanuvchilar, Suhbatlar, Reportlar, Audit log, O'quv analitikasi, IELTS testlar, Kontent studiyasi, Tekshiruv navbati, AI sozlamalari — hammasi ochiladi.
- 4 ta published test: Reading 3 passage / 40 savol, raqamlar 1–40; Listening 4 part × 10 savol, transcript bor; Writing 2 task, Task 1 da `imageAlt` bor.
- Server-side `endsAt` / `remainingSec` attempt API'da qaytadi.
- Admin'da per-question statistika (`/stats`) va validator (`/validate`) endpointlari bor.
- AI yordamchi (Reading) formasida kontent huquqi tanlovi (sourceType + publishScope) qo'shilgan.

---

## 2. 20.09 TZ BANDLARI — HOLAT JADVALI

Belgilar: ✅ bajarilgan · 🟡 qisman · ❌ bajarilmagan · ❔ tashqaridan tekshirib bo'lmadi (developer source'da tasdiqlashi kerak)

| ID | Band | Holat | Dalil (22.09 production) |
|---|---|---|---|
| EX-01 | AI import barcha question type | ❔ | Admin'da "AI yordamchi (Reading)" bor, lekin 0 ta kitob yuklangan, AI xarajati $0.00 — pipeline ishlatilmagan |
| EX-02 | Speaking pronunciation score | ❌/❔ | Speaking kontenti yo'q, `speaking.grade` bo'yicha 0 ta job |
| EX-03 | GT Reading <15 clamp | ❔ | Barcha testlar Academic, `bandTable: null` |
| EX-04 | Partial overall band | ❌ | Faqat Reading section attempt natijasida `"overall": 0` qaytyapti |
| EX-05 | Immutable ExamTestVersion | ❌ | Attempt'da faqat `testId`, `testVersionId` yo'q; `/api/admin/exam-tests/{id}/versions` → 404 |
| EX-06 | Blocking validator | ❌ | Validator hali ham eski qoidalar: "Passage 550 so'z (IELTS normasi 650-1000)", "Umumiy audio 10 daqiqa (IELTS normasi 25-35 daqiqa)", `blockers: false` |
| AI-01 | Worker/orchestrator | ❌ | Admin UI'ning o'zi yozadi: "orchestrator … hali qurilmagan" |
| AI-02 | Admin AI UX soddalashtirish | ❌ | Default ekran — `book.segment` taskKey'li sinov chat; Sozlamalar'da model/temp/maxTokens/costCap hamma adminga ochiq |
| AI-03 | Self-heal executor | ❌ | Faqat sozlama maydoni bor, executor yo'q |
| AI-04 | Answer-key/media alignment | ❔ | 0 kitob — ishlatilmagan |
| EDU-01 | Diagnostic → study plan | ❌ | `/app/diagnostic`, `/app/study-plan` → 404; profilda target band/exam date yo'q |
| EDU-02 | IELTS vocabulary linkage | ❌ | Lug'at kategoriyalari faqat foydalanuvchi yaratganlari; taxonomy/band/skill yo'q; `/app/lugat/ielts` → 404 |
| EDU-03 | Error-driven curriculum | ❌ | `/app/xatolar` → 404 |
| TCH-01/02 | Teacher role, classroom | ❌ | Rol tanlovi faqat `user/admin`; `/teacher` → 404 |
| BILL-01/02 | Entitlement, narxlar | ❌ | `/narxlar` — "Tariflar tez orada" |
| PERF-01/02 | Autosave/heartbeat patch | ❔ | Tashqaridan ko'rinmaydi |
| PERF-03 | Audio CDN/derivative | ❌ | Listening `/public/audio/exam/*.wav`, 4.2–7.6 MB har part, `audio/wave` |
| UX-02 | Til izchilligi | ❌ | Admin'da inglizcha: `open/fixed/accepted/rejected/all`, `speed`, `book.segment` |
| LEGAL-01 | Rights provenance | 🟡 | Yangi AI formada tanlov bor, lekin mavjud 4 testning API javobida `sourceType/licence/publishScope` maydonlari umuman yo'q |
| §49 | Writing 4 kriteriy | 🟡 | 4 kriteriy bor, lekin Task 2 ham `taskAchievement` deb saqlanyapti (`taskResponse` bo'lishi kerak); `graderModel/rubricVersion/confidence` yo'q |
| §52 | Mock rejimlari (Practice/Exam/Secure) | ❌ | Bitta rejim, test tanlab bo'lmaydi, device check yo'q, Speaking mock yo'q |
| §26/§31 | Yangi admin IA sahifalari | ❌ | `/admin/content/upload`, `/processing`, `/media`, `/admin/exams`, `/mocks`, `/teachers`, `/classes`, `/billing`, `/ai/activity` — hammasi 404 |
| §50.2 | Ko'p format upload | ❌ | Faqat `application/pdf` (bitta fayl) + `audio/*`; DOCX/ZIP/EPUB/image yo'q; 4 bosqichli wizard |

---

## 3. YANGI TOPILGAN XATOLAR — P0 (darhol)

### N-01 — Reading / Listening / Writing sahifalari login qilgan userga ham ochilmaydi (REGRESSIYA)

**Qayta hosil qilish:** login → sidebar'dan "Oqish" (yoki `/app/tinglash`, `/app/yozish`) → ekranda faqat `Avval tizimga kiring.` yozuvi chiqadi, sidebar ham yo'q.
**Sabab (production bundle'dan):** sahifa komponenti `const { isAuthed } = useApp()` qiladi va `!isAuthed` bo'lsa shu matnni qaytaradi. AppContext provider qiymatida `isAuthed` kaliti **yo'q** → har doim `undefined` → hamma userga shu ekran chiqadi. `/app/gapirish` va `/app/mock` bu tekshiruvni ishlatmaydi, shuning uchun ular ochiladi.
**Tuzatish:**
1. AppContext'ga `isAuthed` (va `authLoading`) ni qo'shish yoki sahifalarda mavjud auth holatidan foydalanish.
2. Auth yuklanayotganda skeleton ko'rsatish, login yo'q bo'lsa `/kirish?next=…` ga redirect qilish (quruq matn emas).
3. Bu sahifalar app shell (sidebar/header) ichida render bo'lishi kerak.
**Qabul mezoni:** Playwright E2E — login → `/app/oqish`, `/app/tinglash`, `/app/yozish`, `/app/gapirish` ning har biri test ro'yxatini ko'rsatadi. Bu test CI'da majburiy bo'lsin.

### N-02 — Server vaqti tugagan attempt'ni ham qabul qilib, baholayapti

**Dalil:**
- Reading attempt: `endsAt` 12.09 09:41, topshirilgan 12.09 11:53, status `graded`, `timeSpentSec: 11523` (60 daqiqalik bo'lim uchun 3.2 soat).
- Writing attempt: `endsAt` 12.09 13:18, topshirilgan **19.09**, status `graded`, `timeSpentSec: 592063` (~6.8 kun).

**Xavf:** "server-authoritative timer" faqat UI'da. Foydalanuvchi vaqtni cheksiz cho'zib, keyin topshira oladi — mock natijasi ma'nosiz bo'ladi.
**Tuzatish:**
1. `answers`, `essays`, `submit` endpointlarida: `now > endsAt + grace (30 s)` bo'lsa yozishni rad etish.
2. Muddati o'tgan attempt'ni avtomatik yakunlash: `endsAt` gacha saqlangan javoblar bilan baholash, status `expired` (yoki `auto_submitted`).
3. `timeSpentSec = min(submittedAt, endsAt) − startedAt`.
4. Cron/lazy job: ochiq qolgan, `endsAt` o'tgan attempt'larni yopish.
**Qabul mezoni:** integration test — `endsAt` dan keyin PATCH/submit → 409; natijada `timeSpentSec ≤ durationSec + grace`.

### N-03 — Bo'sh essay AI grader'ga yuborilyapti

**Dalil:** Writing attempt'da ikkala task `wordCount: 0`, lekin AI baholagan: feedback matni va `improvedVersion` generatsiya qilingan.
**Tuzatish:** `wordCount < 20` bo'lsa AI chaqirilmaydi, deterministik `band 0` + "Javob yozilmagan" xabari qaytadi. Shunda keraksiz token xarajati bo'lmaydi.

### N-04 — Speaking'da bitta ham test yo'q

**Dalil:** `/app/gapirish` → "Hozircha testlar yo'q". 4 ta testning hammasida faqat `reading, listening, writing` bo'limlari bor. Admin ro'yxatida faqat R/L/W belgisi.
**Tuzatish:** har bir published test uchun Speaking bo'limi (Part 1 savollar, Part 2 cue card 60/120 s, Part 3 savollar). Admin ro'yxatida `S` belgisi; admin'da speaking qo'shish/tahrirlash imkoni.
**Qabul mezoni:** kamida 4 ta speaking set; student yozib, yuklab, 4 kriteriyli (pronunciation bilan) taxminiy baho oladi.

### N-05 — Mock ekranidagi vaqt noto'g'ri ko'rsatilgan

**Dalil:** `/app/mock` — "Listening 30 daq · Jami 2 soat 30 daqiqa". Haqiqiy listening `durationSec`: 489 / 523 / 600 / 702 s (8–12 daqiqa). Matn hardcode qilingan.
**Tuzatish:** vaqt va savol sonini tanlangan test ma'lumotidan olish. Mock boshlashdan oldin test tanlash (yoki server tanlaganini aniq ko'rsatish).

### N-06 — Published testlar rasmiy formatga to'g'ri kelmaydi, validator esa to'xtatmaydi

| Test | Reading so'z soni (norma 2150–2750) | Listening audio (norma ~30 daq) |
|---|---|---|
| Practice Test 1 | 1765 | 6.2 daq |
| Practice Test 2 | 1952 | 6.7 daq |
| Practice Test 3 | 1538 | 8.0 daq |
| Practice Test 4 | 1856 | 9.7 daq |

(Listening ustunida — partlar audio uzunligi yig'indisi; bo'lim `durationSec` oraliq pauzalar bilan 8–12 daqiqa.)

Qo'shimcha: Test 4 Listening'da `multiple_choice_multi` 10 ta alohida guruh sifatida kiritilgan (validator ham ogohlantiradi).

**Qaror kerak (biznes):** bu testlar "Full Mock" emas, **"Mini practice test"** deb belgilansin yoki kontent to'ldirilsin. Mock engine faqat format-compliant testlarni tanlasin.
**Texnik tuzatish:** EX-06 (20.09 TZ §4) — validator'ni blocking qilish: Academic Reading jami 2150–2750 so'z, 3 passage, 40 savol; Listening 4 part × 10 savol, audio mavjud. Mock uchun `isMockEligible` flag faqat blocker = 0 bo'lganda.

---

## 4. YANGI TOPILGAN XATOLAR — P1

### N-07 — HTML sahifalarda security header'lar yo'q
**Dalil:** `/`, `/kirish` javoblarida `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, `Referrer-Policy`, `X-Content-Type-Options` yo'q (API javoblarida HSTS bor). `/kirish` da `Access-Control-Allow-Origin: *`.
**Tuzatish:** `next.config` `headers()` yoki `vercel.json` orqali **barcha** route'larga (ayniqsa `/admin/*`, `/kirish`) header qo'shish; HTML'dan `ACAO: *` ni olib tashlash. `curl -I` bilan tekshirish.

### N-08 — Audit log shovqin bilan to'lib ketgan
**Dalil:** 15 daqiqada ~50 ta yozuv — asosan bitta suhbat uchun takroriy `chat.conversation.view` va `chat.media.view` (polling har ~30–60 s da log yozyapti). Video fayl kaliti `.xmatrosk` kengaytmasi bilan saqlangan (`video/x-matroska` MIME noto'g'ri parse qilingan; `.mkv` bo'lishi kerak).
**Tuzatish:** view event'larni sessiya bo'yicha dedupe qilish (masalan 10 daqiqada 1 marta); MIME → extension map'ni tuzatish; audit log'da filtr (action turi, user, sana).

### N-09 — Reportlar 4 haftadan beri ochiq, kontekst ko'rinmaydi
**Dalil:** 3 ta report 26.08.2026 dan beri "Ochiq". Kartochkada xabar matni o'rniga faqat `message: <ObjectId>`.
**Tuzatish:** report kartasida xabar preview'i (matn/media thumbnail), yuboruvchi, "suhbatni ochish" tugmasi; 48 soatdan eski reportga SLA badge; dashboardda ogohlantirish.

### N-10 — Review queue validator ogohlantirishlarini ko'rmaydi
**Dalil:** Har bir published testda 5–6 ta validator warning bor, lekin Tekshiruv navbati: `0 blocker · 0 warning`.
**Tuzatish:** publish va har tahrirda validator natijasi `ReviewItem` sifatida saqlansin; published testlar uchun bir martalik backfill.

### N-11 — "To'liq avtopilot" rejimi odam tasdig'isiz nashr qilishga ruxsat beradi
**Dalil:** AI sozlamalari → Avtopilot: "Hammasi (nashr ham) odam aralashuvisiz".
**Muammo:** 20.09 TZ §50.1 (boshlanishda human-in-the-loop) va §14/§17 (copyright'ni AI hal qilmaydi) ga zid.
**Tuzatish:** bu rejim o'chirilsin yoki "Expert + feature flag" ortiga yashirilsin; `third_party_copyright + public = BLOCK` qoidasi avtopilotdan ustun bo'lsin (server-side).

### N-12 — Mavjud testlarda rights metadata yo'q
**Dalil:** 4 ta testning admin API javobida `sourceType`, `licence`, `publishScope`, `rightsVerifiedBy` maydonlari yo'q.
**Tuzatish:** migratsiya — mavjud testlarga maydon qo'shish (default `needs_review`); publish gate `rightsApproved = true` bo'lmaguncha public qilmasin; admin ro'yxatida rights badge.

### N-13 — Writing natija modeli to'liq emas
**Dalil:** `result.writing.task2` da ham `taskAchievement` kaliti; `graderModel`, `graderVersion`, `rubricVersion`, `confidence` yo'q.
**Tuzatish:** Task 2 uchun `taskResponse`; metadata maydonlarini qo'shish (20.09 TZ §8); UI'da "Taxminiy baho (rasmiy IELTS emas)" belgisi.

### N-14 — Reyting: 12 userdan 10 tasi 0 XP, 0 XP userga bronza medal
**Dalil:** "Umumiy" tab: 2 userda XP bor, qolgan 10 tasida 0 XP; 3-o'rindagi 0 XP userga bronza belgi berilgan. "Bu hafta" tabida faqat joriy user ko'rinadi.
**Tuzatish:** XP'ni `ReviewEvent`/attempt tarixidan backfill qilish (eski userlar XP maydonidan oldin mashq qilgan bo'lishi mumkin); 0 XP userga medal bermaslik; haftalik ro'yxatda 0 XP bo'lganlarni "Bu hafta faol emas" deb ajratish.

### N-15 — Har sahifada butun lug'at yuklanadi
**Dalil:** `/app/mock`, `/app/gapirish`, `/app/oqish` da ham `/api/words` so'raladi (global AppContext).
**Tuzatish:** vocabulary ma'lumotini faqat `/app/lugat` va dashboard'da yuklash (20.09 TZ §23.9).

---

## 5. P2 — UX / POLISH

| ID | Muammo | Tuzatish |
|---|---|---|
| U-01 | Admin'da inglizcha / ichki kalitlar: `open/fixed/accepted/rejected/all`, `speed`, `book.segment`, "Kontent huquqi (LEGAL-01)" | Localization; ichki kodlarni UI'dan olib tashlash |
| U-02 | O'quv analitikasida "Test/Tezkor/Yangi rejimlar" birlashtirilgan, `speed` alohida | Har rejim uchun alohida nom |
| U-03 | O'quv analitikasi faqat vocabulary — IELTS bo'limlari (L/R/W/S) bo'yicha analitika yo'q | Question type accuracy, o'rtacha band, attempt soni |
| U-04 | Admin audit log'da xom JSON (`{"messageCount":50}`) | Odam o'qiydigan format |
| U-05 | Profilda target band, imtihon sanasi, imtihon turi yo'q | Onboarding (20.09 TZ §11) |
| U-06 | Dashboard faqat vocabulary — IELTS progress yo'q | "Target / Current estimate / Days left / Today" bloki |
| U-07 | Mock ekranida chiqish/orqaga tugmasi yo'q (sidebar ham yo'q) | "Orqaga" havolasi, boshlashdan oldin |

---

## 6. ISH TARTIBI (SPRINT REJASI)

### Sprint 0 — Hotfix (1–3 kun)
1. N-01 — Reading/Listening/Writing auth regressiyasi + E2E test.
2. N-02 — Server-side deadline enforcement.
3. N-03 — Bo'sh essay short-circuit.
4. N-05 — Mock vaqtini dinamik qilish.
5. N-07 — Security header'lar.
6. C-01 — Chat suhbatlari ro'yxatdan yo'qolishi (§9).

### Sprint 1 — Exam engine integrity (1–2 hafta)
1. EX-04 — Overall faqat 4 komponent bo'lganda; section attempt'da `overall` qaytmasin.
2. EX-05 — `ExamTestVersion` + `attempt.testVersionId`, review snapshot'dan.
3. EX-06 / N-06 — Blocking validator + `isMockEligible`; mavjud testlar holatini qayta ko'rish.
4. N-10 — Validator → review queue.
5. N-12 + LEGAL-01 — Rights metadata migratsiya + publish gate.
6. N-13 — Writing natija modeli.

### Sprint 2 — Speaking + Mock v2 (2 hafta)
1. N-04 — Speaking kontent + admin tahrirlash.
2. EX-02 — 4 kriteriyli speaking (pronunciation audio asosida).
3. Mock: test tanlash, Practice/Exam rejimlari, device check, Speaking Mock alohida, final 4-skill report.
4. PERF-03 — Audio derivative (Opus/AAC) + CDN.

### Sprint 3 — AI Content Factory (2–3 hafta)
1. AI-01 — Worker + orchestrator (queue).
2. AI-02 — Single-screen upload, texnik sozlamalar faqat Expert rejimda; N-11.
3. §50.2 — PDF/DOCX/ZIP/image/audio upload.
4. EX-01, AI-03, AI-04 — to'liq question type, self-heal, alignment.

### Sprint 4+ — 20.09 TZ Phase 3–5
Diagnostic/study plan → IELTS vocabulary → Teacher → Entitlement/Billing (20.09 TZ §39 tartibida).

### Parallel (kichik ishlar)
N-08, N-09, N-14, N-15, U-01…U-07.

---

## 7. QABUL QILISH CHECKLISTI (keyingi tekshiruvda)

Keyingi deploy'dan keyin quyidagilar production'da tekshiriladi:

- [ ] Login qilgan user `/app/oqish`, `/app/tinglash`, `/app/yozish`, `/app/gapirish` da test ro'yxatini ko'radi.
- [ ] `endsAt` dan keyingi submit → rad etiladi; `timeSpentSec` bo'lim vaqtidan oshmaydi.
- [ ] Bo'sh essay → AI chaqirilmaydi (AI sozlamalarida `writing.grade` job soni oshmaydi).
- [ ] Section attempt natijasida `overall` yo'q yoki `pending`.
- [ ] Attempt'da `testVersionId` bor; testni tahrirlash eski attempt review'ini o'zgartirmaydi.
- [ ] Format talablariga javob bermaydigan test mock'ga tushmaydi; validator `blockers: true` qaytaradi.
- [ ] Kamida 4 ta speaking set bor; natijada 4 kriteriy, shu jumladan Pronunciation.
- [ ] Mock ekranidagi vaqtlar tanlangan testga mos.
- [ ] `curl -I https://www.vocably.uz/admin` — `X-Frame-Options`, `CSP`, `HSTS` bor.
- [ ] Review queue'da mavjud testlarning validator ogohlantirishlari ko'rinadi.
- [ ] Barcha testlarda rights metadata bor; `third_party_copyright + public` publish bloklanadi.
- [ ] "To'liq avtopilot" oddiy admin uchun mavjud emas.
- [ ] Admin UI'da inglizcha va ichki kalitlar yo'q.

---

## 8. TEKSHIRUV QAMROVI VA CHEKLOVLAR

Quyidagilar bu auditda **tekshirilmadi** — keyingi bosqichda alohida sinash kerak:

- **Mobil/planshet responsive** — brauzer oynasi o'lchami o'zgartirilmadi.
- **Full mock'ni boshlash** — 2.5 soatlik to'xtatib bo'lmaydigan attempt yaratmaslik uchun boshlanmadi; mock ichidagi UI (highlight, navigator, audio once-only) sinalmadi.
- **Kitob yuklash / AI pipeline** — test fayl yuklanmadi (production ma'lumotini o'zgartirmaslik uchun).
- **AI chat (`/app/ai`), Speaking yozib olish** — chuqur sinalmadi. (Do'stlar chati §9 da alohida tekshirildi.)
- **Source-level bandlar** (PERF-01/02, DATA-01, native `alert()`, prompt-injection himoyasi) — tashqaridan ko'rinmaydi, developer kod ichida tasdiqlashi kerak.

Tavsiya: Sprint 0 dan keyin **staging** muhitida test akkaunt bilan to'liq E2E ssenariy (register → mock → natija → admin upload) yurgizilsin va shu checklist bo'yicha qayta audit qilinsin.

---

# 9. DO'STLAR CHATI — TELEGRAM DARAJASIGA OLIB CHIQISH

**Maqsad:** `/app/dostlar` — Telegram'ga o'xshash, tez, ishonchli, real-time chat. Foydalanuvchi uchun "Vocably ichidagi Telegram" tajribasi.
**Tekshiruv (22.09, 23:15–23:30):** @abbos bilan real suhbat — matn yuborish, emoji, tahrirlash, profil paneli, qidiruv, tema, bildirishnomalar. @abbos'ga 1 ta test xabar yuborildi va tahrirlandi.

## 9.1. Hozirgi holat — nima bor

| Funksiya | Holat |
|---|---|
| Real-time (socket.io, `realtime.vocably.uz`) | ✅ bor. Eventlar: `message:new`, `message:read`, `presence:update`, `typing` |
| Matn yuborish, Enter bilan | ✅ |
| Emoji tanlagich (qidiruv, kategoriya, "Yaqinda ishlatilgan") | ✅ |
| Javob berish (reply, iqtibos bilan) | ✅ |
| O'z xabarini tahrirlash, "tahrirlangan" belgisi | ✅ |
| O'chirish, shikoyat (report) | ✅ |
| Rasm/video/fayl, ovozli va video xabar tugmalari | ✅ (media alohida `media.vocably.uz` domenidan signed URL orqali — to'g'ri) |
| O'qildi belgisi (✓ / ✓✓) | ✅ |
| Profil paneli: taxallus, Rasmlar/Videolar/Ovozli tablari | 🟡 (rasm thumbnail chiqmaydi — C-09) |
| Mute, bloklash, "onlayn bo'lganda Telegram orqali xabar" | ✅ |
| Yorug'/Tungi mavzu — ikkalasida o'qiladi | ✅ |
| Brauzer bildirishnomasini yoqish | ✅ |

## 9.2. Topilgan xatolar

| ID | Prioritet | Muammo | Dalil / qayta hosil qilish | Kutilgan natija |
|---|---|---|---|---|
| C-01 | **P0** | Suhbatlar ro'yxatdan yo'qolib qoladi | Tekshiruv boshida ro'yxatda 4 ta suhbat (diyora, jafar, abbos, nazarbek). Bir necha daqiqadan keyin, sahifa yangilanganda ham, `/api/chat/conversations` faqat 2 tasini qaytaradi. Diyora suhbatida bugun yozishma bo'lgan, ikkala userda chat ruxsati yoqilgan, qidiruvda `diyora` "Yozish" tugmasi bilan chiqadi. Sababi aniqlanmadi | Suhbat faqat user o'zi o'chirsa/arxivlasa yo'qoladi. Bloklangan bo'lsa ham ro'yxatda "bloklangan" holati bilan qoladi. Server log'da shu vaqtdagi `deletedFor`/block/filtr o'zgarishini tekshirish, regression test |
| C-02 | P1 | Ro'yxatdagi preview eskirib qoladi | @abbos: preview "E2E test message" (17.09), lekin suhbatdagi oxirgi ko'rinadigan xabar 16.09 dagi "haa" — xabar o'chirilgan, `lastMessagePreview` yangilanmagan | O'chirish/tahrirlashda `lastMessagePreview` va `lastMessageAt` qayta hisoblansin |
| C-03 | P1 | Suhbatni ochish butun ilovani qayta yuklaydi | Suhbat bosilganda 3–5 soniya to'liq qora ekran + spinner, sidebar yo'qoladi; `/api/words` (1.5 s) qayta so'raladi, `/api/chat/conversations` 3 marta so'raladi | Client-side navigatsiya (layout saqlanadi), suhbat < 300 ms da ochiladi, ro'yxat 1 marta yuklanadi va cache'lanadi |
| C-04 | P1 | Suhbat oxirgi xabarda ochilmaydi | Ochilganda eng yangi xabar ekrandan pastda qoladi, ↓ tugmasini bosish kerak | Birinchi o'qilmagan xabarda ("Yangi xabarlar" ajratgich bilan) yoki eng pastda ochilsin |
| C-05 | P2 | ↓ tugmasi oxirgi xabar ustini yopadi | Suzuvchi tugma "haa" bubble'ining ustida | Tugma xabar ustiga tushmasin; o'qilmagan xabarlar soni badge bilan |
| C-06 | P2 | Vaqt formati izchil emas, kun ajratgichlari yo'q | Eski xabarlar `2026-09-15 23:27`, yangisi `23:20` | Bubble ichida faqat `HH:mm`; kunlar orasida "Bugun / Kecha / 15-sentyabr" ajratgichi |
| C-07 | P2 | Header'dagi status tushunarsiz | Username ostida faqat `2026-09-16` | "onlayn" / "yozmoqda…" / "oxirgi marta bugun 00:27 da" |
| C-08 | P1 | Qidiruv faqat to'liq username bilan ishlaydi | `diy` → "Foydalanuvchi topilmadi", `diyora` → topildi | Prefix + ism bo'yicha qidiruv (min 2 belgi), debounce 250 ms |
| C-09 | P2 | Media galereyada rasm preview yo'q | Profil → Rasmlar: thumbnail o'rnida faqat sana matni | Thumbnail grid, bosilganda lightbox |
| C-10 | P1 | Xabar amallari juda kam | Kelgan xabar: javob/o'chirish/shikoyat. O'ziniki: javob/tahrir/o'chirish. Context menyu yo'q | §9.3 dagi to'liq menyu |
| C-11 | P1 | Tahrir va o'chirish real-time emas | Socket'da faqat 4 ta event bor, `message:edited`/`message:deleted` yo'q | Tahrir, o'chirish, reaksiya, pin — hammasi ikkala tomonda darhol ko'rinsin |
| C-12 | P2 | Media oldindan yuklanadi | Suhbat ochilishi bilan barcha voice/image fayllar so'raladi | Lazy load (viewport'ga kirganda), voice — play bosilganda |
| C-13 | P1 | Ro'yxatdagi 🗑 (suhbatni o'chirish) tugmasi | Hover'da chiqadi, tasdiqlash oynasi bor-yo'qligi tekshirilmadi | Tasdiqlash modali: "Faqat men uchun / Ikkala tomon uchun" |
| C-14 | P1 | Xavfsizlik: `.html/.htm/.json` yuklash mumkin | File input `accept` ro'yxatida bor | Media domen bo'lsa ham: `Content-Disposition: attachment`, `X-Content-Type-Options: nosniff`, magic-byte tekshiruvi; HTML'ni ro'yxatdan olib tashlash tavsiya |
| C-15 | P2 | Stiker paneli topilmadi | Admin statistikasida 2 ta stiker bor, lekin tanlagichda faqat emoji | Emoji / Stiker / GIF tablari |
| C-16 | P2 | Xabar holatlari to'liq emas | Faqat ✓ va ✓✓. "Yuborilmoqda" (soat) va "Yuborilmadi — qayta urinish" ko'rinmadi | Telegram kabi 4 holat + offline navbat |

## 9.3. Telegram darajasi uchun talablar (TZ)

### A. Suhbatlar ro'yxati
- Barcha suhbatlar oxirgi xabar vaqti bo'yicha tartiblanadi, hech qachon o'z-o'zidan yo'qolmaydi (C-01).
- O'qilmagan xabarlar soni (badge) + qalin shrift; sidebar'dagi "Do'stlar" ikonkasida va brauzer tab sarlavhasida umumiy son: `(3) Vocably`.
- Preview: "Siz: …" prefiksi, media turi ("📷 Rasm", "🎤 Ovozli xabar 0:12"), "yozmoqda…" holati, qoralama (Draft) belgisi.
- Pin (yuqoriga qadash, 5 tagacha), Arxiv, Mute belgisi 🔕.
- Kontekst menyu: Pin, Mute, O'qilgan deb belgilash, Arxivlash, Tozalash, O'chirish (tasdiq bilan).
- Qidiruv: userlar (prefix + ism) va **xabarlar bo'yicha global qidiruv**.
- "Yangi suhbat" tugmasi → do'stlar / kontaktlar ro'yxati.

### B. Suhbat oynasi
- SPA navigatsiya, har suhbatning scroll holati saqlanadi (C-03).
- Birinchi o'qilmagan xabarda ochiladi, "Yangi xabarlar" ajratgichi (C-04).
- Kun ajratgichlari, bubble ichida `HH:mm`, ketma-ket xabarlar guruhlanadi (C-06).
- Yuqoriga scroll qilganda cheksiz pagination (API'da `nextCursor` bor — UI'da ishlatilsin), virtualized list (1000+ xabarda ham silliq).
- Header: avatar, ism, status "onlayn / yozmoqda… / oxirgi marta …" (C-07); suhbat ichida qidiruv 🔍; sanaga o'tish.
- ↓ tugmasi o'qilmaganlar soni bilan, bubble'ni yopmaydi (C-05).
- Pin qilingan xabar paneli (header ostida).

### C. Xabar amallari (o'ng tugma / long-press / hover)
- Javob berish (asl xabarga bosilganda o'sha joyga o'tib, uni highlight qilish)
- Nusxa olish, Forward (boshqa suhbatga), Pin, Tanlash (bir nechta xabar → forward/o'chirish)
- Reaksiyalar (👍 ❤️ 😂 😮 😢 🔥 + to'liq emoji), ikkala tomonda real-time
- Tahrirlash (48 soat ichida), "tahrirlangan" + vaqt
- O'chirish: "Faqat men uchun" / "Ikkala tomon uchun" (o'ziniki uchun)
- Shikoyat (sabab kategoriyalari bilan), matndagi havolani nusxalash

### D. Yozish maydoni (composer)
- Shift+Enter — yangi qator, avtomatik balandlik, har suhbat uchun qoralama saqlanadi.
- Formatlash: **qalin**, _kursiv_, `kod`, ||spoiler||, havola; Markdown shortcutlari.
- Havola preview'i (OG title/rasm) — server-side, SSRF himoyasi bilan.
- Clipboard'dan rasm qo'yish (Ctrl+V), drag & drop.
- Yuborishdan oldin media preview (izoh/caption bilan), bir nechta rasm → albom.
- Yuklash progress bar + bekor qilish; katta video/rasmni client'da siqish.
- Emoji / Stiker / GIF paneli (C-15).
- Reply/tahrir rejimida composer ustida banner (hozir tahrir uchun bor — reply uchun ham xuddi shunday).

### E. Media
- Rasm/video lightbox: zoom, swipe, yuklab olish, albom bo'ylab o'tish.
- Ovozli xabar: waveform, seek, 1x / 1.5x / 2x tezlik, keyingi ovozli xabarga avto o'tish, yozishda "bekor qilish uchun suring" / qulflash.
- Dumaloq video xabar (bor) — preview, qayta yozish.
- Fayl: ikonka, nom, hajm, yuklab olish holati.
- Profil galereyasi: Rasmlar / Videolar / Fayllar / Havolalar / Ovozli tablari, thumbnail grid (C-09).

### F. Real-time va ishonchlilik
- Socket eventlari: `message:new`, `message:edited`, `message:deleted`, `message:reaction`, `message:pinned`, `message:read`, `message:delivered`, `typing`, `presence:update`, `conversation:updated` (C-11).
- Xabar holatlari: 🕓 yuborilmoqda → ✓ yuborildi → ✓✓ yetkazildi → ✓✓ (rangli) o'qildi; xato bo'lsa ❗ "Qayta yuborish" (C-16).
- Offline navbat: internet uzilsa xabar local'da turadi, ulanganda yuboriladi; `clientMessageId` bilan idempotent (dublikat bo'lmaydi).
- Reconnect'da o'tkazib yuborilgan xabarlarni sync qilish (`since=lastEventId`).
- Bir nechta tab / qurilma sinxron: o'qilganlik, qoralama, yangi xabarlar.

### G. Bildirishnomalar
- Web Push (service worker orqali) — tab yopiq bo'lsa ham; xabar preview'ini yashirish sozlamasi.
- Tab ochiq, lekin boshqa suhbatda bo'lsa — in-app toast + ovoz (o'chirish mumkin).
- Mute: 1 soat / 8 soat / 1 kun / doimiy.
- Mavjud "onlayn bo'lganda Telegram orqali xabar" funksiyasi saqlansin.

### H. Maxfiylik va xavfsizlik
- Sozlamalar: "Oxirgi marta ko'rilgan" va "onlayn" holatini kim ko'radi (Hamma / Do'stlar / Hech kim); o'qildi belgisini o'chirish.
- Bloklash: bloklangan user yozolmaydi, onlaynni ko'rmaydi; ro'yxatda holat ko'rinadi.
- Upload: magic-byte tekshiruvi, hajm limiti, `Content-Disposition` (C-14), rate-limit (spam).
- Report: sabab kategoriyasi + xabar konteksti admin'ga boradi (N-09 bilan bog'liq).
- Audit log'ga admin'ning har bir ko'rishini emas, sessiyani yozish (N-08).

### I. Mobil (Telegram tajribasi asosan telefonda)
- Telefonda ro'yxat va suhbat alohida to'liq ekran; "← orqaga" tugmasi va brauzer "back" ishlaydi.
- Swipe-to-reply, long-press menyu, haptic (qo'llab-quvvatlansa).
- Klaviatura ochilganda composer ko'rinib turadi (`visualViewport`, safe-area).
- PWA: o'rnatish, ikonka badge'i, push.
- *Eslatma: bu auditda mobil ko'rinish sinalmadi — brauzer oynasi o'lchami o'zgarmadi. Real telefonda alohida tekshirilsin.*

### J. Guruhlar (keyingi bosqich — Teacher bilan bog'lanadi)
- Guruh chatlari (sinf / study group): admin, a'zolar, mention `@username`, guruhda reply/reaksiya.
- Teacher o'z sinfi uchun guruh yaratadi (20.09 TZ §18, §53 bilan).

### K. Performance
- `/api/words` chat sahifasida yuklanmasin (N-15), ro'yxat 1 marta so'ralsin (C-03).
- Media lazy load (C-12), thumbnail'lar kichik o'lchamda (webp/avif).
- Maqsad: suhbat ochish < 300 ms (cache'dan), xabar yetkazish < 500 ms.

## 9.4. Chat bo'yicha sprint rejasi

**Chat Sprint 1 (xatolar, 3–5 kun):** C-01, C-02, C-03, C-04, C-08, C-11, C-13, C-14.
**Chat Sprint 2 (Telegram asoslari, 1–2 hafta):** A (badge, pin, arxiv, preview), B (ajratgichlar, pagination, header status), C (to'liq menyu, reaksiya, forward, nusxa), F (holatlar, offline navbat, reconnect sync).
**Chat Sprint 3 (media va bildirishnoma, 1–2 hafta):** D (formatlash, paste, preview, albom), E (lightbox, voice waveform/tezlik, galereya), G (Web Push), C-15 stikerlar.
**Chat Sprint 4:** H (maxfiylik sozlamalari), I (mobil polish), J (guruhlar).

## 9.5. Chat qabul qilish checklisti

- [ ] 2 ta akkaunt bilan: xabar, tahrir, o'chirish, reaksiya, pin — ikkinchi tomonda 1 soniya ichida ko'rinadi.
- [ ] Suhbatlar ro'yxati sahifa yangilanganda, xabar yuborilganda va 24 soatdan keyin ham to'liq.
- [ ] O'chirilgan oxirgi xabardan keyin preview to'g'ri.
- [ ] Suhbat ochilishi — qora ekransiz, birinchi o'qilmagan xabarda.
- [ ] `diy` qidiruvi → @diyora topiladi.
- [ ] Internetni o'chirib 3 ta xabar yozish → ulanganda tartib bilan, dublikatsiz yuboriladi.
- [ ] Tab yopiq holatda Web Push keladi; tab sarlavhasida o'qilmaganlar soni.
- [ ] Telefonda (iOS Safari + Android Chrome): to'liq ekran suhbat, back, swipe-to-reply, klaviatura composer'ni yopmaydi.
- [ ] `.html` fayl yuklab bo'lmaydi yoki faqat `attachment` sifatida yuklab olinadi.
- [ ] Playwright E2E: 2 ta brauzer konteksti bilan chat ssenariysi CI'da.
