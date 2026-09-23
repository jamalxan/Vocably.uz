# Vocably.uz — Xavfsizlik auditi

Sana: 2026-09-17. To'liq metodologiya va doira uchun `AUDIT_REPORT.md`ga qarang. Bu hujjat faqat xavfsizlikka oid topilmalarni batafsil (ID/Severity/Location/Root cause/Impact/Fix/Acceptance criteria) formatida beradi.

---

### SEC-01 — Hisob mavjudligini aniqlash (account enumeration) + tezlik cheklovi yo'q edi
- **Severity**: MEDIUM
- **Location**: `src/app/api/auth/register-init/route.js:26-29`, `src/app/api/auth/reset-init/route.js:22-25`
- **Problem**: `register-init` "Bu telefon raqam bilan hisob allaqachon mavjud" javobini, `reset-init` esa "Bu raqam bilan hisob topilmadi" javobini har qanday so'rov sonida cheklovsiz qaytarardi.
- **Root cause**: Endpointlar pre-auth (foydalanuvchi hali autentifikatsiya qilinmagan) bo'lgani uchun mavjud `checkRateLimit(userId, ...)` infratuzilmasi bu yerga ulanmagan edi.
- **Impact**: Tajovuzkor ro'yxatdan o'tgan telefon raqamlarni ommaviy skanerlab bilishi mumkin (keyingi ijtimoiy muhandislik/SIM-swap hujumlari uchun foydali ma'lumot); cheklovsiz `OtpSession` yaratish orqali arzon DB-spam.
- **Fix (bajarildi)**: Ikkala endpointga ham `checkRateLimit(phone, 'register-init'|'reset-init', 5)` — telefon raqam bo'yicha 60 soniyada 5 tagacha urinish.
- **Acceptance criteria**: Bir xil telefon raqam bilan 60 soniya ichida 6-chi so'rov `429` qaytarishi kerak. ✅ Kod darajasida tasdiqlangan (mavjud `checkRateLimit` funksiyasi allaqachon boshqa endpointlarda sinovdan o'tgan, `RateLimitHit` TTL-indeks bilan).
- **Qoldiq xavf**: Xabar matnlari o'zgartirilmadi (bu UX/mahsulot qarori) — enumeration texnik jihatdan hali mumkin, lekin endi sekin (5/min).

### SEC-02 — `admin/bootstrap` doimiy ochiq imtiyoz-eskalatsiya yo'li
- **Severity**: MEDIUM
- **Location**: `src/app/api/admin/bootstrap/route.js`
- **Problem**: `ADMIN_SETUP_SECRET` bilan himoyalangan, lekin birinchi admin yaratilgandan keyin ham hech qachon o'zini o'chirmaydi yoki cheklamaydi. Sirni bilgan har qanday kishi istalgan vaqtda istalgan mavjud telefon raqamini adminga aylantira oladi.
- **Root cause**: "Bir martalik" deb mo'ljallangan endpoint, lekin buni majburlaydigan kod yo'q (faqat komentariyada "bir martalik" deyilgan, DB holatiga qarab tekshirilmaydi).
- **Impact**: Agar `ADMIN_SETUP_SECRET` biror joyda sizib chiqsa (log, noto'g'ri commit, xodim almashinuvi), butun tizim uzoq muddat kompromissiya qilingan bo'lib qoladi — sirni almashtirmasdan.
- **Fix (qisman bajarildi)**: IP bo'yicha `checkRateLimit(ip, 'admin-bootstrap', 5)` qo'shildi — brute-force bilan sirni taxmin qilishni qiyinlashtiradi.
- **Acceptance criteria**: Sirni taxmin qilishga urinish 60s/5 urinish bilan cheklanadi. ✅
- **Qoldiq tavsiya (bajarilmadi — mahsulot qarori kerak)**: Birinchi admin yaratilgandan so'ng endpointni butunlay o'chirish yoki `ADMIN_SETUP_SECRET`ni Vercel'dan olib tashlashni jarayonga kiritish. Bu sessiyada bajarilmadi, chunki foydalanuvchidan avval tasdiq olinishi kerak (kelajakda yana admin qo'shish ehtiyoji bilan to'qnashishi mumkin).

### SEC-03 — JWT `localStorage`da saqlanadi (XSS orqali token o'g'irlash)
- **Severity**: HIGH → **FIXED (kod darajasida), CANNOT_VERIFY (productionda jonli)**
- **Location**: `src/context/AppContext.jsx` va ilova bo'ylab ~90 ta `fetch` chaqiruvi (40 fayl)
- **Problem**: Token `localStorage`da saqlanardi — har qanday XSS zaifligi (hatto kelajakda tasodifan kiritilgan) tokenni to'liq o'qib, hisobni butunlay egallab olishga imkon berardi.
- **Root cause**: Tarixiy — loyiha boshida faqat header-based JWT bilan qurilgan.
- **Impact**: XSS + token o'g'irlash = to'liq hisob egallab olish, parolni bilmasdan.
- **Fix (bajarildi, alohida sessiyada)**: To'liq migratsiya — batafsil `AUTH_MIGRATION_MAP.md`/`AUTH_MIGRATION_REPORT.md`. Qisqacha: `localStorage`dan JWT olib tashlandi (faqat sezgir-bo'lmagan `vocably_authed` bayrog'i + displey uchun `username`/`phone` qoldi); barcha ~90 fetch chaqiruvidan `Authorization` header olib tashlandi (cookie avtomatik yuboriladi); Do'stlar bo'limining "o'z ID"si endi `/api/chat/me`dan (server javobi) keladi, client-side JWT decode emas; realtime-server (alohida, cross-origin xizmat, cookie'ga ega bo'la olmaydi) uchun yangi 60 soniyalik bir martalik "socket ticket" endpointi qo'shildi (`/api/chat/socket-ticket`) — bu yagona joy hali haqiqiy (lekin juda qisqa umrli) tokenga muhtoj, hech qachon `localStorage`ga yozilmaydi.
- **Tasdiqlangan**: `npm run lint`/`type-check`/`test` (183/183)/`build` — barchasi toza.
- **CANNOT_VERIFY (productionga deploy qilinmagani uchun)**: haqiqiy brauzerda login→dashboard→logout round-trip, realtime-server socket-ticket oqimining jonli ishlashi, admin panelning to'liq jonli sinovi. Tavsiya: alohida Vercel preview orqali deploy qilib, qo'lda sinash — keyin master'ga merge qilish.
- **Acceptance criteria**: ✅ kod darajasida barchasi bajarildi (`AUTH_MIGRATION_REPORT.md#Acceptance-Criteria`ga qarang); productionda jonli tasdiqlash hali kutilmoqda.

### SEC-04 — `admin/ai/playground`da tezlik cheklovi yo'q edi (narx nazorati gap'i)
- **Severity**: LOW (admin-only surface, lekin AI xarajatini nazoratsiz oshirishi mumkin edi)
- **Location**: `src/app/api/admin/ai/playground/route.js`
- **Problem**: Boshqa AI-chaqiruvchi endpointlar (`ai/chat`, `words/enrich`) tezlik cheklovi bilan himoyalangan, lekin bu — yo'q edi.
- **Impact**: Kompromissiya qilingan yoki xatolik qiluvchi admin hisobi (yoki frontendda cheksiz tsikl bug'i) cheksiz AI-xarajat keltirib chiqarishi mumkin edi.
- **Fix (bajarildi)**: `checkRateLimit(user._id, 'admin-ai-playground', 30)` qo'shildi (30/60s).
- **Acceptance criteria**: ✅ Kod darajasida tasdiqlangan.

### SEC-05 — IDOR/BOLA tekshiruvi (topilma: himoya to'g'ri ishlaydi)
- **Severity**: — (ijobiy topilma, muammo emas)
- **Location**: `src/lib/exam/attemptServer.ts` (`getOwnedAttempt`), `src/app/api/chat/upload/presign/route.js:27-30`
- **Natija**: Har bir exam-attempt route egalikni `getOwnedAttempt(id, userId)` orqali tekshiradi (topilmasa 404). Chat fayl yuklash `Conversation.participantIds`da foydalanuvchi borligini tekshiradi. **Boshqa foydalanuvchining ID'sini almashtirib ko'rish kod darajasida bloklangan.** Jonli ikki-hisobli sinov bu sessiyada CANNOT_VERIFY (faqat bitta hisobga kirish mavjud edi).

### SEC-06 — Fayl yuklash validatsiyasi (topilma: to'g'ri)
- **Severity**: — (ijobiy topilma)
- **Location**: `src/lib/s3.js` (`validateUpload`, `buildObjectKey`)
- **Natija**: MIME turi va hajm serverda tekshiriladi; obyekt kaliti serverda generatsiya qilinadi (foydalanuvchi fayl nomi hech qachon saqlash yo'liga ta'sir qilmaydi — path traversal xavfi yo'q). Presigned URL 5 daqiqa amal qiladi.

### SEC-07 — Xato xabarlari ichki tafsilotlarni oshkor qilmaydi (topilma: to'g'ri)
- **Severity**: — (ijobiy topilma)
- **Location**: `src/lib/apiError.js`
- **Natija**: `serverError()` har doim umumiy "Server xatoligi" xabarini qaytaradi, haqiqiy xato faqat server logiga yoziladi. Bu ilgari (eski loyiha tarixida) muammo bo'lgan, hozir to'g'ri tuzatilgan holatda.

### SEC-08 — XSS: chat xabarlarida `dangerouslySetInnerHTML` ataylab ishlatilmagan (topilma: to'g'ri)
- **Severity**: — (ijobiy topilma)
- **Location**: `src/components/chat-friends/MessageBubble.jsx:101-106`
- **Natija**: Havolalarni bosiladigan qilish uchun regex-asoslangan yondashuv qo'llanilgan, xom HTML in'ektsiyasi yo'q. Kod komentariyasi buni ataylab qilingan xavfsizlik qarori sifatida tushuntiradi.

### SEC-09 — Sirlar/kalitlar kod bazasida yo'q (topilma: to'g'ri)
- **Severity**: — (ijobiy topilma)
- **Natija**: `.env`/`.env.local`/`.env*.local` `.gitignore`da; `git ls-files` faqat placeholder `.env.example`ni ko'rsatadi. `src/`da hech qanday hardcoded API-kalit namunasi (`sk-`, `AIza`, va h.k.) topilmadi.

### SEC-10 — To'lov tizimi yo'q (audit doirasidan tashqari)
- **Natija**: `/narxlar` — "tez orada" placeholder, kodda Stripe/Click/Payme integratsiyasi yo'q. To'lov xavfsizligi bo'yicha topilma yo'q, chunki hali qurilmagan.

### SEC-12 — Hech qanday xavfsizlik headeri sozlanmagan edi (CSP/HSTS/X-Frame-Options yo'q)
- **Severity**: MEDIUM (SEC-03ning haqiqiy ta'sirini kuchaytiruvchi omil)
- **Location**: `next.config.mjs` (butunlay bo'sh konfiguratsiya edi: `const nextConfig = {};`)
- **Problem**: Ilova hech qanday `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy` yoki `Permissions-Policy` headerisiz ishlab kelgan. Bu o'zi alohida ekspluatatsiya qilinadigan zaiflik emas, lekin: (a) agar qachondir XSS zaifligi topilsa (hozircha topilmagan — SEC-08), hech narsa tajovuzkor skriptining tashqi domenga ma'lumot (masalan SEC-03'dagi `localStorage` token) yuborishiga to'sqinlik qilmaydi; (b) sayt istalgan boshqa domenning `<iframe>`iga joylashtirilib, clickjacking uchun ishlatilishi mumkin edi.
- **Fix (bajarildi)**: `next.config.mjs`ga `headers()` orqali to'liq xavfsizlik header to'plami qo'shildi:
  - `Content-Security-Policy` — `connect-src`/`img-src`/`media-src` ataylab faqat `'self'` + haqiqiy `NEXT_PUBLIC_REALTIME_URL`/`S3_ENDPOINT` originlariga cheklangan (env-var'dan build vaqtida dinamik o'qiladi — qattiq kodlangan domen yo'q, noto'g'ri/placeholder qiymat build'ni buzmasligi uchun try/catch bilan himoyalangan). Bu **XSS bo'lgan taqdirda ham token/ma'lumotning tashqi serverga oqib chiqishini bloklaydi** — SEC-03'ning eng xavfli oqibatiga qarshi haqiqiy himoya qatlami.
  - `frame-ancestors 'none'` + `X-Frame-Options: DENY` — clickjacking himoyasi.
  - `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` (HSTS, `preload` bilan — sayt allaqachon Vercel orqali faqat HTTPS).
  - `Permissions-Policy: microphone=(self), camera=(), geolocation=()` — Speaking bo'limi mikrofonni o'z origin'idan ishlatishi kerak (bloklanmagan), kamera/geolokatsiya hech qayerda ishlatilmaydi (bloklangan).
- **Muhim cheklov (halol qayd)**: `script-src`/`style-src` `'unsafe-inline'` bilan qoldirilgan — Next.js App Router o'zi hydration ma'lumotini va bu loyihaning mavzu-init skriptini (`src/app/layout.jsx:107`) inline `<script>` sifatida yozadi; buni to'liq bloklash nonce-based CSP talab qiladi, bu esa middleware qo'shishni va build jarayonini o'zgartirishni talab qiladigan alohida, kattaroq ish (bu sessiyada qilinmadi). Demak, **bu tuzatish XSS'ning o'zini oldini olmaydi** (SEC-08'da hozircha topilgan XSS yo'q), balki XSS yuz bergan taqdirda uning **ta'sir doirasini** (ma'lumot exfiltratsiyasi, clickjacking) sezilarli qisqartiradi.
- **Acceptance criteria**: Deploy qilingandan keyin `curl -I https://vocably.uz` javobida yuqoridagi headerlar ko'rinishi kerak. ⚠️ **Bu sessiyada faqat lokal `next build`/`lint`/`type-check` orqali tasdiqlandi (barchasi toza o'tdi) — headerlarning haqiqiy ishlashi faqat productionga deploydan keyin tekshiriladi** (headers() funksiyasi runtime serverda ishlaydi, lokal build buni sinamaydi).

### SEC-11 — Markazlashgan admin middleware yo'q
- **Severity**: LOW
- **Location**: repo ildizida `src/middleware.js` mavjud emas
- **Problem**: Har bir `/api/admin/*` route o'z-o'zidan `requireAdminUser()` chaqirishga tayanadi (bugun 33/34 to'g'ri qiladi). Markaziy "so'nggi chiziq" yo'q.
- **Impact**: Kelajakda yozilgan yangi admin route tasodifan bu chaqiruvni o'tkazib yuborishi mumkin — bugun muammo yo'q, lekin regressiya xavfi doimiy ochiq.
- **Fix**: Bajarilmadi (arxitektura o'zgarishi, kengroq muhokama talab qiladi). Tavsiya: `middleware.js`da `/api/admin/:path*` uchun asosiy "token bormi" tekshiruvini qo'shish (to'liq `role` tekshiruvi baribir har bir route'da qolishi kerak).

---

### Qayta tekshirilgan eski topilmalar (2026-08-09 audit, joriy kodga nisbatan)

- **B15 (focus-trap)** — **HALI HAM OCHIQ, tasdiqlandi**. `src/components/ConfirmModal.jsx` (to'liq o'qildi): Escape-to-close va boshlang'ich fokus mavjud (yaxshi), lekin haqiqiy focus-trap yo'q — Tab tugmasi fokusni modal ortidagi elementlarga olib chiqishi mumkin.
- **B16 (`alert()`)** — **HALI HAM OCHIQ, va ro'yxat kengaydi**. Eski audit 6 ta lug'at-rejimida (`FlashcardMode`, `MatchGame`, `TestMode`, `ListeningMode`, `WritingTest`, `SpeedQuiz`) topgan edi — barchasi hali ham `alert()` ishlatadi. Bundan tashqari, endi `alert()` yana 13 ta yangi faylda ham topildi (`src/components/chat-friends/*` — VideoRecorder, VoiceRecorder, UserSearchBar, DoStlarPanel, ConversationList, Composer, UserProfileModal, MessageBubble; `src/components/admin/UsersTable.jsx`; `src/context/AppContext.jsx`), ya'ni Do'stlar chat va admin panel ham xuddi shu naqshni meros qilib olgan. Bularning barchasini tuzatish (native `alert()`ni ilovaning o'z toast/modal komponentiga almashtirish) — 19 ta faylni qamrab oluvchi, individual sinovni talab qiladigan alohida ish, bu sessiyada bajarilmadi (vaqt/xavf muvozanati — har birini alohida ko'rib chiqish kerak, ba'zilari destruktiv tasdiq (`confirm()`o'rniga), ba'zilari oddiy xabar).

## Umumiy xulosa

Kod bazasi xavfsizlik nuqtai nazaridan **kutilganidan yaxshi holatda** — deliberativ qarorlar (chat XSS himoyasi, IDOR himoyasi, verbose-error yopilishi, fayl yuklash validatsiyasi) izchil qo'llanilgan va kod komentariylarida hujjatlashtirilgan. Eng katta ochiq xavf — SEC-03 (JWT/localStorage) — bu **yangi topilma emas**, loyihaning o'zi buni "BUG-030" sifatida kuzatib boradi va qasddan bosqichma-bosqich yopilmoqda (server tayyor, client hali emas). Bu sessiyada uni yopish uchun jonli login-sinovi zarur bo'lgani sababli qilinmadi — bu to'g'ri qaror, chunki noto'g'ri qilingan JWT-migratsiya butun ilovani login qila olmaydigan holga keltirishi mumkin edi.
