# AUTH_E2E_VERIFICATION_REPORT.md — Real Browser / Preview Deployment Verification

Sana: 2026-09-17/18. Oldingi statik audit: `AUTH_MIGRATION_REPORT.md` (CANNOT_VERIFY deb belgilangan bandlar). Bu hujjat o'sha bandlarni **real preview deployment + real browser** orqali yopadi.

## Environment

- Preview deployment: Vercel CLI orqali local working tree'dan to'g'ridan-to'g'ri deploy qilindi (git commit/push YO'Q, `vercel deploy`, non-git filesystem upload).
- Final preview URL: `https://learn-vocabulary-9tpbk2ndj.vercel.app` (bu sessiyada 3 marta deploy qilindi — 2 marta E2E paytida topilgan bug'lar tufayli qayta deploy).
- Auth: Vercel Deployment Protection (SSO) yoqilgan edi — brauzer orqali loyihaning Google hisobi bilan kirib bypass qilindi (project sozlamalari o'zgartirilmadi).
- Login: `jamolxonyoldashaliyev3-3957` (loyiha egasi hisobi).

### Preview env-var audit (`vercel env ls`, faqat SET/MISSING, qiymatlar ko'rilmadi)

| Var | Holat |
|---|---|
| MONGODB_URI | SET |
| JWT_SECRET | SET |
| S3_ENDPOINT / REGION / BUCKET / ACCESS_KEY / SECRET_KEY | SET |
| REALTIME_INTERNAL_URL / NEXT_PUBLIC_REALTIME_URL / REALTIME_SHARED_SECRET | SET |
| VAPID_PUBLIC_KEY / PRIVATE_KEY / SUBJECT / NEXT_PUBLIC_VAPID_PUBLIC_KEY | SET |
| GROQ_API_KEY / OPENROUTER_API_KEY / GEMINI_API_KEY | SET |
| ADMIN_SETUP_SECRET | SET |
| TELEGRAM_BOT_TOKEN / USERNAME / WEBHOOK_SECRET | SET |
| APP_URL | SET |
| **CEREBRAS_API_KEY** | **MISSING** (Groq/Cerebras/Gemini/OpenRouter fallback zanjiridagi 4-provayder — Preview/Production'da yo'q, faqat local `.env`da bor) |

**Muhim kuzatuv**: Preview va Production bir xil `MONGODB_URI`ni ishlatadi (real production ma'lumotlar bazasi) — test paytida haqiqiy foydalanuvchi hisobi (`+998931606706`, keyinchalik admin ekanligi aniqlandi) bilan ishlashga to'g'ri keldi, alohida "fresh test account" yarata olmadik, chunki registratsiya Telegram bot orqali REAL telefon-egasi tasdiqlashini talab qiladi (soxta/random raqam bilan sinab bo'lmaydi).

---

## Registration

**CANNOT VERIFY** (fresh account sifatida). Berilgan test raqami (`+998931606706`) allaqachon ro'yxatdan o'tgan edi ("Bu telefon raqam bilan hisob allaqachon mavjud" — bu javobning o'zi to'g'ri ishlaganini ko'rsatadi: enumeration-himoyasi va duplicate-tekshiruv ishlayapti). Yangi raqam berilmadi, shuning uchun to'liq register→Telegram→verify-code→dashboard oqimi ushbu sessiyada oxirigacha sinalmadi (faqat `register-init`ning duplicate-rad javobi sinaldi — PASS).

## Login

**PASS**. Real brauzerda: `Parolni unutdingizmi?` → Telegram bot orqali (foydalanuvchining o'zi tasdiqladi) parol tiklandi → `+998931606706` + yangi parol bilan `/kirish`dan **haqiqiy login PASS**, `/app` dashboardga muvaffaqiyatli redirect, real ma'lumotlar (55 so'z, streak 3 kun va h.k.) ko'rsatildi.

- Network: login so'rovi `POST /api/auth/login` → 200, keyingi barcha so'rovlar (`/api/chat/me`, `/api/dashboard`, `/api/words`, `/api/notifications`, `/api/ai/sessions`) hech qanday `Authorization` header'siz, faqat cookie orqali 200 qaytardi.
- `localStorage`/`sessionStorage`: faqat `{username, phone, vocably_authed:'1'}` — JWT yoki boshqa token **YO'Q** (JS orqali tekshirildi).
- `document.cookie` (JS'dan): **bo'sh** — `vocably_session` cookie'si JS'ga ko'rinmaydi → **HttpOnly tasdiqlandi**.
- `secure`/`sameSite`: kod orqali tasdiqlandi (`src/lib/auth.js` — `secure: NODE_ENV==='production'`, Vercel'da har doim shunday; `sameSite:'lax'`) — brauzer DevTools orqali raw `Set-Cookie` satri alohida o'qilmadi (vositalar cheklovi), lekin amaliy natija (cookie ishlayapti, JS'dan yashirin) kod bilan mos.

## Invalid Login

**PASS** (qisman, real sinov). Noto'g'ri parol bilan: `"Parol noto'g'ri"` xatoligi to'g'ri qaytdi, cookie o'rnatilmadi, dashboardga redirect bo'lmadi. Bo'sh/nomavjud raqam va bo'sh parol holatlari kod orqali (required-validatsiya, `User.findOne` → `400`) tasdiqlangan, lekin har birining alohida real-browser skrinshoti olinmadi — **PASS (asosiy holat sinaldi, qolganlari kod+partial browser bilan)**.

## Refresh

**PASS**. `/app`ga hard-reload/qayta-navigate qilinganda, sessiya saqlanib qoldi (localStorage'da hech qanday JWT bo'lmasa ham) — cookie orqali avtomatik autentifikatsiya.

## New Tab

**PASS**. Yangi tab ochilib `/app`ga o'tilganda, alohida login talab qilinmadi — bir xil httpOnly cookie ikkala tabda ham ishladi.

## Logout

**PASS**. Profil paneldagi logout tugmasi bosilganda: `/kirish`ga redirect, keyin `fetch('/api/chat/me')` → **401** (`"Ruxsat berilmagan"`) — cookie tozalangan. Brauzer **back tugmasi** bosilganda `/app` sahifasi cache'dan ko'rsatilmadi, avtomatik `/kirish`ga qaytarildi — **bfcache orqali himoyalangan sahifa ko'rinmadi**.

## User Dashboard

**PASS**. `/app` (Bugun), sidebar barcha bo'limlar (Lug'at, Oqish, Tinglash, Gapirish, Yozish, Mock imtihon, Reyting, Do'stlar, Profil) auth-xatosiz yuklandi.

## Reading

**PASS — to'liq oqim sinaldi**: Login → Oqish → test tanlash (4 ta test ro'yxati ko'rindi) → attempt yaratildi (`createAttempt` API, cookie orqali) → savol javoblandi (dropdown select) → "Next" bilan navigatsiya (javob saqlanib qoldi) → "Finish" bosildi → natija sahifasi (`READING NATIJASI 1.0, 1/40 to'g'ri`) muvaffaqiyatli ko'rsatildi, jadval/grafik bilan.

**KRITIK BUG TOPILDI VA TUZATILDI** — pastga qarang.

## Listening

**PASS (qisman)**: test-tanlash sahifasi (`Tinglash — testni tanlang`) to'g'ri yuklandi, 4 ta test ro'yxati (muddati o'tgan/tugallangan belgilar bilan) ko'rindi. To'liq audio+javob+submit oqimi vaqt tufayli alohida sinalmadi (Reading bilan bir xil kod yo'lidan foydalanadi, bir xil bug tuzatildi).

## Writing

**PASS (qisman)**: test-tanlash sahifasi to'g'ri yuklandi. To'liq yozish+submit+feedback oqimi vaqt tufayli alohida sinalmadi (bir xil kod yo'li, bir xil bug tuzatildi).

## Speaking / Mock

**CANNOT VERIFY (live)** — kod darajasida bir xil bug tuzatildi (pastga qarang), lekin mikrofon/audio talab qiladigan Speaking va Mock imtihon to'liq oqimlari bu sessiyada sinalmadi.

## Admin

**PASS**. Test qilingan real hisob (`+998931606706`) allaqachon **admin** rolida ekanligi aniqlandi (ilgari boshqa sessiyada tayinlangan). Real admin panel:
- `/admin` (Statistika) — real raqamlar (12 foydalanuvchi, 5 admin-chat-ruxsat, 1 admin) ko'rsatildi.
- `/admin/users` (Foydalanuvchilar) — real foydalanuvchilar jadvali, rol/holat boshqaruvi.
- `/admin/exam-tests` (IELTS testlar) — 4 ta test ro'yxati, JSON import formasi.

Boshqa admin sahifalar (Faollik, O'quv analitikasi, Suhbatlar, Reportlar, E'lonlar, Kontent studiyasi) navigatsiya paytida xatosiz ko'rindi (screenshot orqali tasdiqlangan sahifalar yuqorida sanaldi; qolganlari ro'yxatda ko'rindi, ichiga kirilmadi — vaqt tufayli).

## User → Admin Security

**CANNOT VERIFY (live)** — bu sessiyada faqat admin-rolli hisob mavjud edi, oddiy (`role:'user'`) hisob bilan `/admin`ga kirishga urinish sinalmadi. **Kod darajasida tasdiqlangan**: `src/lib/chatAuth.js#requireAdminUser` — `user.role !== 'admin'` bo'lsa server **403** qaytaradi (barcha `/api/admin/*` route'lar shu funksiyani chaqiradi) — bu server-side tekshiruv, frontend-only emas.

## IDOR

**PASS (kod + qisman live)**. Admin hisobi orqali boshqa foydalanuvchilarning ID'lari (`abbos`, va h.k.) olindi. `getOwnedAttempt(attemptId, userId)` (`src/lib/exam/attemptServer.ts:51`) — Mongo so'rovi `{_id: attemptId, userId}` shaklida, mos kelmasa **404** (boshqa foydalanuvchi ma'lumoti hech qachon qaytmaydi) — **kod darajasida tasdiqlangan**. Real cross-account (ikkinchi haqiqiy, boshqa parolga ega hisob) bilan jonli IDOR sinovi bu sessiyada test-ma'lumotlar yetishmasligi tufayli o'tkazilmadi (mavjud suhbatlarning barchasida test-hisob ishtirokchi edi) — **CANNOT VERIFY (live cross-account)**.

## Chat (Do'stlar)

**PASS — to'liq oqim**: `/app/dostlar` → suhbatlar ro'yxati yuklandi (real WebSocket ulanish, yashil signal belgisi) → suhbat ochildi (`@abbos`) → xabar yozildi va **yuborildi** (real vaqtda ro'yxatda "E2E test message" ko'rindi, checkmark bilan) → console'da xato yo'q.

## Socket Ticket

**PASS (tuzatilgandan keyin)**. `POST /api/chat/socket-ticket` — cookie orqali autentifikatsiya, 60s'lik JWT chiqaradi, hech qachon `localStorage`/`sessionStorage`/IndexedDB'ga yozilmaydi (JS orqali tekshirildi — bo'sh). WebSocket handshake muvaffaqiyatli (real xabar yuborish/qabul qilish orqali tasdiqlangan).

## Socket-Ticket Abuse Test — **KRITIK ZAIFLIK TOPILDI VA TUZATILDI**

**Topilma (tuzatishdan OLDIN)**: real brauzerda `fetch('/api/chat/socket-ticket', {method:'POST'})` orqali olingan 60 soniyalik "chipta" `Authorization: Bearer <ticket>` header sifatida **oddiy REST API'larga** yuborilganda:
- `GET /api/chat/me` → **200**, to'liq user ma'lumoti qaytardi.
- `GET /api/admin/stats` → **200**, **admin-only** statistika qaytardi (test hisobi admin bo'lgani uchun).

**Sabab**: chipta xuddi 30-kunlik sessiya tokeni bilan bir xil `jwt.sign({userId}, JWT_SECRET)` formatida yaratilgan edi, `src/lib/auth.js#getUserIdFromRequest` esa `Authorization` header orqali kelgan HAR QANDAY yaroqli JWT'ni qabul qilardi (orqaga moslik uchun ataylab qoldirilgan yo'l) — bu chiptani ham "to'liq sessiya" sifatida qabul qilishga olib kelgan. Bu §18'dagi talabni ("Ticket faqat o'zining realtime maqsadi uchun ishlashi kerak") buzgan — **TZ talabiga zid, xavfsizlik zaifligi**.

**Tuzatish** (bu sessiyada amalga oshirildi, minimal va xavfsiz):
1. `src/app/api/chat/socket-ticket/route.js` — chiptaga `scope: 'realtime'` maydoni qo'shildi.
2. `src/lib/auth.js#getUserIdFromRequest` — `decoded.scope === 'realtime'` bo'lsa `null` qaytaradi (rad etiladi).
3. `realtime-server/index.js` o'zgartirilmadi — u alohida, xom `jwt.verify()` ishlatadi, qo'shimcha `scope` maydonini e'tiborsiz qoldiradi, shuning uchun WebSocket handshake **buzilmadi**.

**Qayta sinov (tuzatishdan KEYIN, yangi preview deploy'da)**:
- Chipta bilan `GET /api/chat/me` → **401** (`"Ruxsat berilmagan"`).
- Chipta bilan `GET /api/admin/stats` → **401**.
- Real WebSocket ulanish va xabar yuborish/qabul qilish — hamon **ishlayapti** (regressiya yo'q).

## Browser Storage Audit

**PASS**. Login qilingandan keyin `localStorage`/`sessionStorage`/IndexedDB to'liq tekshirildi (JS orqali) — `token`, `jwt`, `accessToken`, `refreshToken` so'zlaridan hech biri topilmadi. Faqat `username`, `phone`, `vocably_authed` (sezgir bo'lmagan).

## Network Audit

**PASS**. Login/dashboard/reading/chat davomida kuzatilgan barcha `/api/*` so'rovlari (~15 ta) `Authorization: Bearer` header'siz, faqat cookie orqali ishladi (brauzer Network monitoring vositasi orqali tasdiqlangan).

## Console Audit

**PASS**. Reading, Chat, Admin sahifalarida console monitoring yoqilgan holda hech qanday JS xatosi, CSP buzilishi, CORS xatosi yoki WebSocket xatosi qayd etilmadi.

## CSP

**PASS (kod + bilvosita live)**. `next.config.mjs` — `connect-src`ga `NEXT_PUBLIC_REALTIME_URL` va `S3_ENDPOINT` originlari (https+wss/ws variantlari bilan) qo'shilgan, `img-src`/`media-src`ga S3 origin qo'shilgan. Real brauzerda Chat (WebSocket) va admin panel ishlatilganda **hech qanday CSP-blocked xatosi console'da chiqmadi** — bu amaliy tasdiqlash. Raw `Content-Security-Policy` header qiymati DevTools orqali alohida o'qilmadi (vosita cheklovi — `vercel curl` beta buyrug'i barqaror ishlamadi), shuning uchun header'ning aniq matni emas, balki **amaldagi natijasi** tasdiqlangan.

## Mobile

**CANNOT VERIFY** — brauzer avtomatlashtirish vositasining `resize_window` chaqiruvi ishlamadi (`window.innerWidth` o'zgarmadi, real oyna o'lchami sinovda 1536×720'da qoldi). Vosita cheklovi tufayli 390×844/375×812 skrinshotlari olinmadi.

## Performance

**Bilvosita kuzatildi, alohida o'lchanmadi**: login→dashboard oqimida ortiqcha/takrorlanuvchi `/api/chat/me` chaqiruvlari sezilmadi (har sahifa yuklanishida bittadan). Batafsil so'rov-soni/vaqt profili olinmadi — **CANNOT VERIFY (batafsil)**.

## Security (yig'ma)

- HttpOnly: **PASS** (JS'dan yashirin, tasdiqlangan).
- Secure/SameSite: **kod bilan tasdiqlangan** (Vercel HTTPS, `NODE_ENV=production`).
- CORS: alohida sinalmadi (same-origin arxitektura, cross-origin so'rov yo'q — faqat realtime-server alohida origin, u CSP orqali ruxsat etilgan).
- CSRF: `SameSite=Lax` — o'zgarmagan, kod bilan tasdiqlangan.
- Rate limiting: `checkRateLimit` funksiyasi login/register/reset uchun kodda mavjud (8/5/5 urinish), live brute-force sinovi o'tkazilmadi.
- IDOR: yuqoriga qarang.
- **Socket-ticket privilege escalation**: TOPILDI VA TUZATILDI (yuqoriga qarang) — bu sessiyaning eng muhim topilmasi.

---

# VERIFIED (real brauzerda ishladi)

- Login (real hisob, parol tiklashdan keyin)
- Refresh, New Tab, Logout (+ back-button himoyasi)
- Reading — to'liq oqim (start→answer→next→submit→result)
- Listening, Writing — test-tanlash sahifalari
- Chat — suhbat ochish, xabar yuborish, real WebSocket
- Socket-ticket — olish, saqlanmasligi, ishlashi
- Admin panel — Statistika, Foydalanuvchilar, IELTS testlar
- Browser storage — JWT yo'qligi
- Network — Authorization header yo'qligi
- Console — xatolarsiz
- Invalid login (noto'g'ri parol)
- **Socket-ticket abuse zaifligi — TOPILDI, TUZATILDI, QAYTA TASDIQLANDI**

# FAILED (aniqlangan va TUZATILGAN bu sessiyada)

1. **Reading/Listening/Writing/Speaking/Mock — butunlay ishlamas edi**: 9 ta sahifa (`oqish`, `oqish/[attemptId]`, `tinglash`, `tinglash/[attemptId]`, `yozish`, `yozish/[attemptId]`, `gapirish`, `gapirish/[attemptId]`, `mock`) `useApp()`dan endi mavjud bo'lmagan `token` maydonini o'qib, doim "Avval tizimga kiring" ko'rsatardi — **barcha foydalanuvchilar uchun, doim**. Sabab: migratsiya `AppContext`ni `token`dan `isAuthed`ga o'zgartirgan, lekin bu 9 ta sahifa yangilanmagan edi. **TUZATILDI**: barcha 9 faylda `token` → `isAuthed`.
2. **Socket-ticket privilege escalation**: yuqoriga qarang. **TUZATILDI**.

# CANNOT VERIFY

- To'liq Registration oqimi (fresh raqam berilmadi)
- User→Admin 403 (faqat admin hisobi mavjud edi)
- Cross-account IDOR (ikkinchi mos test-ma'lumot yo'q)
- Speaking/Mock to'liq oqimlari (mikrofon/vaqt)
- Mobile 390×844/375×812 (vosita cheklovi)
- Raw CSP/Set-Cookie header matni (curl vositasi beqaror)
- Batafsil performance profili

# REMAINING

- `CEREBRAS_API_KEY` Vercel Preview/Production env'da yo'q (local'da bor) — AI fallback zanjiridagi 4-provayder ishlamaydi productionda.
- Yuqoridagi CANNOT VERIFY bandlari — productionga deploy qilishdan oldin, ayniqsa fresh-register va user→admin, alohida tekshirilishi tavsiya etiladi (yangi, hech qachon ishlatilmagan telefon raqami va ikkinchi oddiy-rolli hisob bilan).
- `Authorization` header umuman backward-compat sifatida hali ham qabul qilinadi (`src/lib/auth.js`) — endi socket-ticket uchun yopildi, lekin umumiy header-yo'li hali mavjud (kelajakda butunlay olib tashlash mumkin, mobil ilova bo'lmasa).

---

## Final Commands

```
npm run lint        → ✔ No ESLint warnings or errors
npx tsc --noEmit     → ✔ toza (chiqish yo'q)
npx vitest run       → ✔ 14 fayl, 183 test — barchasi o'tdi (ikkala tuzatishdan keyin ham)
vercel deploy (build) → ✔ barcha 140 sahifa/route muvaffaqiyatli kompilatsiya qilindi
```

## Deploy holati

- **Productionga (`vocably.uz`) HECH NARSA deploy QILINMADI** — barcha ishlar faqat Preview deployment'larda (`vercel deploy`, git commit/push YO'Q).
- Working tree'dagi o'zgarishlar (auth migratsiyasi + bu sessiyadagi 2 ta tuzatish) hali **commit qilinmagan** — foydalanuvchi talabiga ko'ra.
- Uchta preview deploy qilindi: dastlabki (bug bilan) → bug tuzatilgandan keyin → socket-ticket zaiflik tuzatilgandan keyin (oxirgisi: `learn-vocabulary-9tpbk2ndj.vercel.app`).
