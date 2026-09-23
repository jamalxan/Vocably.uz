# AUTH_MIGRATION_REPORT.md — JWT/localStorage → HttpOnly Cookie

Sana: 2026-09-17. To'liq inventarizatsiya va dizayn qarorlari: `AUTH_MIGRATION_MAP.md`. Xavfsizlik topilmalari konteksti: `SECURITY_AUDIT.md` (SEC-03).

## Before

- JWT `localStorage`da 3 ta kalit ostida saqlanardi (`token`, `username`, `phone`).
- ~90 ta fetch chaqiruvi (40 ta faylda) har birida qo'lda `Authorization: Bearer ${token}` header biriktirardi.
- Do'stlar bo'limi "o'z ID"sini JWT'ni client-side (imzosiz) decode qilib olardi (`src/lib/jwtClient.js`).
- Realtime-server (alohida xizmat) socket ulanishida xuddi shu 30-kunlik JWT'ni ishlatardi.
- Server (`getUserIdFromRequest`) allaqachon HAM header, HAM httpOnly cookie'ni qabul qilardi (oldingi sessiyada tayyorlangan, ishlatilmagan zaxira yo'l) — bu migratsiyani ancha kichraytirdi, chunki **backend contract o'zgarmadi**.

## After

- `localStorage`da endi na JWT, na uning o'rnini bosuvchi maxfiy qiymat bor — faqat ikkita sezgir-bo'lmagan yordamchi qiymat qoladi: `vocably_authed` ('1' — faqat tezkor "login sahifasidan qaytarish" signali) va `username`/`phone` (displey uchun, hech qanday hisobga kirish huquqi bermaydi).
- Barcha ~90 fetch chaqiruvi endi `Authorization` header yubormaydi — server httpOnly `vocably_session` cookie'sini (brauzer avtomatik yuboradi) tekshiradi.
- Login/register (`AuthForm.jsx`) endi `data.token`ni saqlamaydi — cookie serverning o'zi (`setAuthCookie`, o'zgarishsiz) o'rnatadi.
- Do'stlar bo'limi "o'z ID"sini endi `GET /api/chat/me`ning yangi `id` maydonidan oladi (server, cookie orqali tasdiqlangan) — client-side JWT decode butunlay olib tashlandi (`jwtClient.js` o'chirildi).
- Realtime-server (WebSocket) ulanishi — **yagona joy** bu yerda haqiqiy token hali kerak (boshqa, cross-origin xizmat, cookie'ga ega emas): yangi `POST /api/chat/socket-ticket` endpointi (cookie orqali autentifikatsiya, 60 soniyalik JWT chiqaradi) har ulanishda chaqiriladi, natija HECH QACHON `localStorage`ga yozilmaydi (faqat effekt closure'ida, xotirada).
- `next.config.mjs`dagi CSP (SEC-12, oldingi sessiya) `NEXT_PUBLIC_REALTIME_URL` originini `connect-src`ga qo'shgani uchun yangi socket-ticket oqimi bilan mos — qo'shimcha o'zgarish shart bo'lmadi.

## Files Changed

**Backend (3 ta yangi/o'zgargan, 0 ta buzuvchi o'zgarish):**
- `src/app/api/chat/me/route.js` — javobga `id` maydoni qo'shildi (qo'shimcha, eskisi o'zgarmadi).
- `src/app/api/chat/socket-ticket/route.js` — **yangi**, realtime-server uchun 60s'lik chipta.
- `src/lib/auth.js` — faqat komentariy yangilandi, `getUserIdFromRequest`/`setAuthCookie`/`clearAuthCookie` mantig'i **o'zgarishsiz** (hali ham header+cookie ikkalasini qabul qiladi — orqaga moslik uchun ataylab saqlangan).

**Frontend (56 ta fayl):**
- Markaziy kontekstlar: `AppContext.jsx` (token→isAuthed+chatUserId), `AdminContext.jsx`, `ChatContext.jsx` (authHeaders no-op'ga, socket-ticket oqimi).
- Login/register: `AuthForm.jsx`.
- Admin panel: 12 ta `page.jsx` wrapper + 18 ta komponent (`UsersTable`, `ReportsQueue`, `AdminStats`, `AdminActivity`, `AdminLearningAnalytics`, `AnnouncementsPanel`, `AuditLogTable`, `ConversationViewer`, `ReviewQueuePanel`, `ContentBooksPanel`, `NewBookWizard`, `AiSettingsPanel`, `AiPlaygroundChat`, `AutopilotPanel`, `ExamTestsPanel`, `NewTestForm`, `TestStats`).
- Do'stlar chat: `DoStlarPanel`, `ConversationView`, `Composer`, `MessageBubble`, `UserProfileModal`, `PendingAddWordsCard`.
- Exam-engine: `attemptsApi.ts`, `examStore.ts`, `useAutosave.ts`, `TestPicker.jsx`, `AddWordModal.tsx` (markazlashgan `authedFetch` orqali — kam fayl, kam xavf).
- Boshqa: `NotificationBell.jsx` (+ `AppShell.jsx`, `pushClient.js`), `AiChat.jsx`, `DashboardHome.jsx`, `profil/page.jsx`, `reyting/page.jsx`, `useAuthedMedia.js`.
- O'chirildi: `src/lib/jwtClient.js` (endi hech qayerda chaqirilmaydi).

To'liq ro'yxat: `git status` (59 fayl o'zgartirilgan, 1 o'chirilgan, 1 yangi route).

## Security Improvements

1. **JWT endi client JS'dan o'qib bo'lmaydi** — `localStorage`da yo'q, `Authorization` header sifatida hech qayerda yuborilmaydi. XSS bo'lgan taqdirda (hozircha bunday zaiflik topilmagan, SEC-08) tajovuzkor 30 kunlik sessiya tokenini o'g'irlay olmaydi.
2. **Realtime-server uchun xavf sirasi qisqardi**: 30 kunlik uzoq muddatli token o'rniga 60 soniyalik, faqat-shu-maqsad uchun chipta — hatto XSS uni ushlab qolsa ham, amal qilish muddati juda qisqa va faqat socket ulanishi uchun ishlatiladi (boshqa hech qanday endpoint uni qabul qilmaydi).
3. **CSRF**: o'zgarmadi (allaqachon `SameSite=Lax`, yetarli) — bu migratsiya bilan yangi CSRF xavfi kiritilmadi (barcha state-changing so'rovlar hamon shu cookie siyosati bilan himoyalangan).
4. **Backend contract o'zgarmadi** — `getUserIdFromRequest` hali ham ikkalasini qabul qiladi, shuning uchun bu migratsiya **faqat hujum yuzasini qisqartiradi** (client endi zaif yo'lni ishlatmaydi), hech qanday yangi backend xavf-xatar kiritmaydi.

## Tests Passed

```
npm run lint        → ✔ No ESLint warnings or errors
npm run type-check  → ✔ toza (chiqish yo'q)
npm run test        → ✔ 14 fayl, 183 test — barchasi o'tdi
npm run build       → ✔ barcha sahifa/route muvaffaqiyatli kompilatsiya qilindi (exit code 0)
```

Qo'shimcha qo'lda tekshiruvlar (statik, kod o'qish orqali):
- Har bir o'zgartirilgan faylda qolgan `token`/`Authorization`/`localStorage.*Item('token')` iboralari uchun to'liq qayta-grep — faqat nomuvofiq (auth bilan bog'liq bo'lmagan: dizayn tokenlari, LLM token-hisoblagichi, OTP session-token) natijalar qoldi.
- `getStoredAuthToken`/`getJwtUserId` chaqiruvlarining hech biri qolmagani tasdiqlandi.

## Cannot Verify

TZning §27 o'zi talab qilganidek, quyidagilar **PASS deb yozilmadi** — CANNOT_VERIFY:

1. **Haqiqiy brauzerda login→dashboard→logout oqimi** — bu o'zgarishlar hali productionga deploy qilinmagan (faqat lokal working tree'da). Productiondagi `vocably.uz` hali ESKI kodni ishlatadi. Haqiqiy sinov uchun: (a) alohida branch/PR orqali Vercel preview deploy qilish, (b) o'sha preview'da qo'lda login/register/logout/himoyalangan-sahifa/admin-panel sinash kerak — bu sessiyada production hisobingizga real xavf tug'dirmasdan bajarib bo'lmadi.
2. **Realtime-server socket-ticket oqimi** — `POST /api/chat/socket-ticket` va `connectChatSocket(ticket)`ning haqiqiy ishlashi (WebSocket handshake, presence/typing indikatorlari) faqat kod darajasida tasdiqlangan. Bu eng ko'p e'tibor talab qiladigan qism — realtime-server alohida deploy qilinadigan xizmat, uni bu sessiyada ishga tushirib sinab bo'lmadi.
3. **E2E test (Playwright)** — TZ §27'ning o'zi aytganidek: sandbox/internetsiz o'rnatib bo'lmaydi (bu sessiyada ham qayta tasdiqlandi — `registry.npmjs.org`ga DNS so'rovi ishlamadi). CANNOT_VERIFY, PASS emas.
4. **Concurrent tabs / boshqa tabda logout** — mantiqiy jihatdan to'g'ri bo'lishi kerak (har bir tab mustaqil `fetchUserData()` chaqiradi, cookie tozalansa hammasi 401 oladi), lekin real ikki-tabli sinov qilinmadi.
5. **Network Inspection (§23)** — `Set-Cookie` header'ining haqiqiy ko'rinishi, `token` maydonining javob JSON'ida ko'rinmasligi (u ATAYLAB hali ham qaytadi, backend o'zgarmagani uchun — §"Qoldirilgan..." bo'limiga qarang) — faqat kod o'qish orqali tasdiqlangan, brauzer DevTools'da emas.

## Remaining Issues

- **Login/verify-code javobi hali `token`ni JSON body'da qaytaradi** (backend, ataylab o'zgartirilmadi — boshqa integratsiyalarni buzmaslik uchun). Frontend endi bu maydonni o'qimaydi/ishlatmaydi, lekin xohlasangiz, keyingi (yanada kichik) bosqichda backend javobidan bu maydonni butunlay olib tashlash mumkin — bu backend contract o'zgarishi, alohida diqqat talab qiladi.
- **`Authorization` header qabul qilish serverda hali ham mavjud** (orqaga moslik uchun ataylab qoldirildi). Agar kelajakda bu yo'lni ham butunlay yopish kerak bo'lsa (masalan mobil ilova yo'qligiga ishonch hosil qilingandan keyin), `src/lib/auth.js#getUserIdFromRequest`dan header-tekshiruvini olib tashlash mumkin.
- **Realtime-server socket-ticket oqimi jonli tekshirilmagan** (yuqoriga qarang) — birinchi navbatda tekshirilishi kerak.
- SEC-03 endi **FIXED** deb belgilanishi mumkin, lekin yuqoridagi CANNOT_VERIFY bandlari yopilmaguncha "productionda tasdiqlangan" emas, faqat "kod darajasida to'liq".

## Rollback

Agar deploydan keyin login/chat buzilgani aniqlansa:

1. **Eng tez**: `git revert` ushbu migratsiyaning commit(lar)i uchun — backend hech qanday o'zgarishsiz qolgani sababli (`getUserIdFromRequest` ikkalasini ham hali qabul qiladi), faqat client-side commit(lar)ni revert qilish YETARLI — eski client kodi yana `localStorage`+header'ga qaytadi va serverda hech qanday moslik kerak bo'lmaydi (server hech qachon faqat-cookie rejimiga "qulflab qo'yilmagan").
2. **Database o'zgarishi yo'q** — bu migratsiya hech qanday Mongo sxemasiga tegmadi, rollback uchun DB migratsiyasi kerak emas.
3. **Env o'zgarishi yo'q** — yangi env-var talab qilinmadi (`socket-ticket` mavjud `JWT_SECRET`dan foydalanadi).
4. **Qisman rollback** (agar faqat Do'stlar/realtime buzilsa, qolgani ishlasa): faqat `ChatContext.jsx`, `DoStlarPanel.jsx`, `ConversationView.jsx`, `Composer.jsx`, `src/app/api/chat/socket-ticket/route.js`, `src/app/api/chat/me/route.js`ni revert qilish yetarli — qolgan qismlar (admin panel, asosiy ilova, exam-engine) mustaqil ishlaydi.

## Acceptance Criteria (TZ §32) — holat

- [x] JWT `localStorage`da yo'q
- [x] refreshToken `localStorage`da yo'q (loyihada umuman refresh-token mexanizmi yo'q edi — 30 kunlik bitta token, o'zgarmadi)
- [x] auth token `sessionStorage`da yo'q (hech qachon ishlatilmagan)
- [x] HttpOnly cookie ishlaydi (kod darajasida — server allaqachon shunday, bu sessiyada o'zgartirilmadi)
- [ ] Secure productionda ishlaydi — **CANNOT_VERIFY** (deploy qilinmagan)
- [x] SameSite to'g'ri (`Lax`, o'zgarishsiz)
- [ ] Login/Register/Logout/Dashboard/Reading/Listening/Writing/Results/Admin ishlaydi — **CANNOT_VERIFY** (jonli sinov kerak)
- [x] User admin endpointga kira olmaydi (o'zgarishsiz, server-side tekshiruv o'zgarmadi)
- [x] IDOR himoyalangan (o'zgarishsiz)
- [ ] CSP ishlaydi — **CANNOT_VERIFY** (deploydan keyin `curl -I` bilan tekshirish kerak, SEC-12'da qayd etilgan)
- [ ] Speaking/microphone ishlaydi — **CANNOT_VERIFY** (fizik mikrofon/brauzer kerak)
- [x] build PASS
- [x] lint PASS
- [x] typecheck PASS
- [x] tests PASS (183/183) — E2E esa aniq CANNOT_VERIFY sababi bilan qayd etilgan

**Xulosa**: kod darajasidagi migratsiya to'liq va izchil bajarildi, barcha statik tekshiruvlar (lint/typecheck/183 test/build) toza o'tdi. **Productionga deploy qilishdan oldin — ayniqsa Do'stlar/realtime-server qismini — jonli sinovdan o'tkazish tavsiya etiladi**, chunki bu sessiyada bunday sinov imkoniyati yo'q edi (deploy qilinmagan, ishonchli test-hisob yo'q).
