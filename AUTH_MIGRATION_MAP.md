# AUTH_MIGRATION_MAP.md — JWT/localStorage → HttpOnly Cookie migratsiyasi

Sana: 2026-09-17. Bu hujjat TZning §29 "PHASE 1 AUTH INVENTORY" va "PHASE 2 TARGET DESIGN" bosqichlarining natijasi — implementatsiyadan oldin yozilgan, taxmin qilinmagan (har bir qator o'qilgan).

## 1. Hozirgi auth oqimi (kod bo'yicha, taxminsiz)

```
REGISTER (AuthForm.jsx handleRegisterInit)
  → POST /api/auth/register-init (rate-limited, telefon+parol, OtpSession yaratadi)
  → Telegram bot orqali kod
  → POST /api/auth/verify-code (auth/verify-code/route.js:58-89)
      → User.create()
      → jwt.sign({userId}, JWT_SECRET, {expiresIn:'30d'})
      → setAuthCookie() — httpOnly cookie O'RNATILADI (src/lib/auth.js:45-54)
      → javob: { done:true, token, name, phone }  ← token JSON body'da HAM qaytadi
  → AuthForm.jsx:150-153 — localStorage.setItem('token'/'username'/'phone'), router.push('/app')

LOGIN (AuthForm.jsx handleLogin)
  → POST /api/auth/login (auth/login/route.js)
      → bcrypt.compare, jwt.sign, setAuthCookie()
      → javob: { token, name, phone }
  → AuthForm.jsx:204-207 — xuddi shu localStorage yozuvi, router.push('/app')

TOKEN STORAGE
  → localStorage'da 3 ta alohida kalit: 'token', 'username', 'phone'
  → HAM ParALEL ravishda httpOnly cookie 'vocably_session' (server tomonidan, client buni ko'ra olmaydi — bu allaqachon xavfsiz qism)

API REQUEST (deyarli barcha authenticated so'rovlar)
  → client: fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  → token localStorage'dan yoki React context state'dan olinadi

AUTHORIZATION (server, src/lib/auth.js:22-39 — getUserIdFromRequest)
  → 1) Authorization header'ni tekshiradi
  → 2) topilmasa, httpOnly cookie'ni tekshiradi (ALLAQACHON MAVJUD FALLBACK)
  → ikkalasi ham yo'q/noto'g'ri bo'lsa null → chaqiruvchi route 401 qaytaradi

LOGOUT (AppContext.jsx logout(), :47-58)
  → localStorage.removeItem (3 ta kalit)
  → fetch('/api/auth/logout', {method:'POST'}) → clearAuthCookie() (server, allaqachon ishlaydi)
  → router.push('/kirish')
```

**Muhim topilma**: backend allaqachon TO'LIQ tayyor (§29 PHASE 3 allaqachon bajarilgan edi, oldingi sessiyada). `getUserIdFromRequest` header YOKI cookie'ni qabul qiladi — bu degani, agar client Authorization header yuborishni to'xtatsa va faqat cookie yuborsa (brauzer buni avtomatik qiladi, chunki barcha so'rovlar `vocably.uz`ning o'zidan `vocably.uz`ga — same-origin), **server tomonida HECH QANDAY o'zgarish shart emas**. Bu migratsiyani sezilarli darajada kichraytiradi va xavfsizroq qiladi — faqat CLIENT o'zgaradi, backend contract bir xil qoladi.

## 2. To'liq inventarizatsiya (fayl + qator + maqsad)

### 2.1 Auth-yaratuvchi/o'chiruvchi joylar (localStorage yoziladi/o'chiriladi)

| Fayl:qator | Kod | Maqsad |
|---|---|---|
| `src/components/auth/AuthForm.jsx:41` | `localStorage.getItem('token')` | Mount paytida "allaqachon login qilinganmi" tekshiruvi → `/app`ga yo'naltirish |
| `src/components/auth/AuthForm.jsx:150-152` | `localStorage.setItem('token'/'username'/'phone')` | Register (verify-code) muvaffaqiyatidan keyin |
| `src/components/auth/AuthForm.jsx:204-206` | xuddi shu | Login muvaffaqiyatidan keyin |
| `src/context/AppContext.jsx:48-50` | `localStorage.removeItem` (3 ta) | `logout()` ichida |
| `src/context/AppContext.jsx:230-232` | `localStorage.getItem('token'/'username'/'phone')` | Ilova mount — token bo'lmasa `/kirish`ga, bo'lsa `fetchUserData`/`fetchChatAccess` chaqiradi |
| `src/context/AdminContext.jsx:18` | `localStorage.getItem('token')` | Admin panel mount — token bo'lmasa `/kirish`ga |
| `src/features/exam/state/examStore.ts:45-52` | `getStoredAuthToken()` — `localStorage.getItem('token')` ni o'raydi | Exam-engine'ning YAGONA token manbai (`attemptsApi.ts` va `examStore.ts#patchAnswers` shundan foydalanadi) |

### 2.2 API-chaqiruvchi joylar (`Authorization: Bearer <token>` yuboradi)

**Markazlashgan (yaxshi yangilik — allaqachon bitta joyda):**
- `src/features/exam/state/attemptsApi.ts:15-25` — `authedFetch()` — IELTS exam-engine'ning BARCHA so'rovlari (`fetchAttempt`, `submitAttempt`, `sendHeartbeat`, `gradeWriting`, `gradeSpeaking`, `fetchAttemptHistory`, highlight funksiyalari va h.k. — 14 ta eksport funksiya) shu bitta funksiya orqali o'tadi.
- `src/features/exam/state/attemptsApi.ts:206-221` — `uploadSpeakingRecording()` — FormData bo'lgani uchun `authedFetch`dan alohida, lekin token manbai bir xil (`getStoredAuthToken()`).
- `src/features/exam/state/examStore.ts:59-80` — `patchAnswers()` — autosave uchun alohida, xuddi shu token manbai.
- `src/features/exam/state/useAutosave.ts:64` — o'zining alohida `Authorization` headeri (attemptsApi'dan mustaqil, lekin token manbai bir xil).

**Markazlashmagan (har fayl o'zi):**

| Fayl | Qatorlar soni | Token manbai |
|---|---|---|
| `src/context/AppContext.jsx` | ~20 joy (28,64,82,116,159,189,207,222,252,288,327,350,380,397,415,442,478) | context state `token` |
| `src/context/AdminContext.jsx` | 1 (boot) | local `t` o'zgaruvchisi |
| `src/context/ChatContext.jsx` | 1 (helper funksiya, :59) | `token` prop/parametr |
| `src/features/exam/shell/TestPicker.jsx` | 1 (:41) | `getStoredAuthToken()` (examStore'dan import) |
| `src/features/exam/review/AddWordModal.tsx` | 1 (:20) | prop sifatida keladi |
| `src/lib/useAuthedMedia.js` | 2 (:25, :54) | hook parametri `token` |
| `src/lib/pushClient.js` | 2 (:56, :74) | funksiya parametri |
| `src/components/NotificationBell.jsx` | 3 (:32,99,105) | `useApp()`dan `token` |
| `src/components/AiChat.jsx` | 2 (:251,370) | `useApp()`dan `token` |
| `src/components/chat/PendingAddWordsCard.jsx` | 1 (:58) | to'g'ridan-to'g'ri `localStorage.getItem('token')` (context orqali emas!) |
| `src/components/chat-friends/UserProfileModal.jsx` | 2 (:42,57) | prop `token` |
| `src/app/app/(main)/profil/page.jsx` | 1 (:31) | `useApp()`dan `token` |
| `src/app/app/(main)/reyting/page.jsx` | 1 (:26) | `useApp()`dan `token` |
| `src/components/dashboard/DashboardHome.jsx` | 1 (:33) | prop/`useApp()` |
| `src/app/admin/content/ai/page.jsx` | 1 (:23) | `useAdmin()`dan `token` |
| `src/components/admin/AdminLearningAnalytics.jsx` | 1 (:36) | `useAdmin()`dan `token` |
| `src/components/admin/AdminActivity.jsx` | 1 (:47) | `useAdmin()`dan `token` |
| `src/components/admin/AdminStats.jsx` | 1 (:33) | `useAdmin()`dan `token` |
| `src/components/admin/AnnouncementsPanel.jsx` | 2 (:16,40) | `useAdmin()`dan `token` |
| `src/components/admin/UsersTable.jsx` | 3 (:18,36,58) | `useAdmin()`dan `token` |
| `src/components/admin/AuditLogTable.jsx` | 2 (:23,43) | `useAdmin()`dan `token` |
| `src/components/admin/ConversationViewer.jsx` | 6 (:77,91,108,122,135,158) | `useAdmin()`dan `token` |
| `src/components/admin/ReportsQueue.jsx` | 3 (:24,42,55) | `useAdmin()`dan `token` |
| `src/components/admin/content/ReviewQueuePanel.jsx` | 2 (:32,58) | `useAdmin()`dan `token` |
| `src/components/admin/content/ContentBooksPanel.jsx` | 4 (:18,19,67,83) | `useAdmin()`dan `token` |
| `src/components/admin/content/NewBookWizard.jsx` | 1 (:80) | `useAdmin()`dan `token` |
| `src/components/admin/content/AiSettingsPanel.jsx` | 3 (:25,26,54) | `useAdmin()`dan `token` |
| `src/components/admin/content/AiPlaygroundChat.jsx` | 1 (:53) | `useAdmin()`dan `token` |
| `src/components/admin/content/AutopilotPanel.jsx` | 4 (:37,38,61,89) | `useAdmin()`dan `token` |
| `src/components/admin/exam/ExamTestsPanel.jsx` | 4 (:26,43,61,75) | `useAdmin()`dan `token` |
| `src/components/admin/exam/NewTestForm.jsx` | 2 (:71,113) | `useAdmin()`dan `token` |
| `src/components/admin/exam/TestStats.jsx` | 1 (:14) | `useAdmin()`dan `token` |

**Auth bilan bog'liq EMAS (o'zgarmaydi)** — chalkashmaslik uchun: `src/lib/providers/openaiCompatible.js`, `src/lib/transcribe.js`, `src/lib/contentAgent/aiRouter.js` — bularda `Authorization: Bearer` **tashqi AI provayder API kalitlariga** ishlatiladi (Groq/OpenRouter/va h.k.), foydalanuvchi sessiyasiga aloqasi yo'q. **Tegilmaydi.**

### 2.3 Cookie/middleware/protected-route infratuzilmasi (allaqachon mavjud)

- `src/lib/auth.js` — `getUserIdFromRequest` (header+cookie), `setAuthCookie`, `clearAuthCookie`. **O'zgarmaydi.**
- `src/lib/chatAuth.js` — `requireChatUser`, `requireAdminUser` — ikkalasi ham `getUserIdFromRequest` orqali ishlaydi, demak cookie bilan avtomatik ishlaydi. **O'zgarmaydi.**
- `src/middleware.js` — **mavjud emas** (SECURITY_AUDIT.md SEC-11'da qayd etilgan, alohida masala, bu migratsiya doirasidan tashqari).
- `/api/auth/logout` — `clearAuthCookie()`ni chaqiradi. **O'zgarmaydi.**

## 3. Maqsadli arxitektura (TZ §4 bo'yicha, shu loyihaga moslashtirilgan)

```
LOGIN/REGISTER (verify-code)
  ↓
BACKEND VALIDATES USER (o'zgarishsiz)
  ↓
setAuthCookie() — HttpOnly+Secure+SameSite=Lax (o'zgarishsiz, allaqachon shunday)
  ↓
Javob JSON: { name, phone } — "token" MAYDONI OLIB TASHLANADI (frontend endi undan foydalanmaydi)
  ↓
BROWSER STORES COOKIE (avtomatik, brauzer o'zi)
  ↓
Frontend: localStorage'ga HECH NARSA yozilmaydi. Faqat non-sensitive "loggedIn" holatini
UI uchun eslab qolish uchun bitta bo'lak state (pastga qarang, §4.2)
  ↓
API REQUEST — Authorization header YO'Q, fetch() cookie'ni SAME-ORIGIN default bilan
avtomatik yuboradi (credentials qo'shimcha sozlash shart emas, lekin aniqlik uchun
`credentials: 'include'` qo'shiladi — kelajakda subdomain o'zgarsa ham ishlayveradi)
  ↓
SERVER VALIDATES (getUserIdFromRequest — cookie orqali, o'zgarishsiz)
  ↓
USER AUTHORIZED
```

### 3.1 Nega yangi backend endpoint SHART EMAS

`getUserIdFromRequest` allaqachon cookie'ni header bilan TENG ishonchli manba sifatida qabul qiladi. Demak, "frontend cookie orqali autentifikatsiya qilinganmi" tekshirish uchun alohida `/api/auth/me` yozish shart emas — **istalgan mavjud authenticated endpoint** (masalan `/api/words`, `/api/chat/me`) buni allaqachon to'g'ri qiladi: cookie yaroqli bo'lsa 200, bo'lmasa 401 qaytaradi. Bu aynan `AppContext.jsx#fetchUserData`ning hozirgi xatoni ushlash mantig'i (`catch { logout(); }`) — **token parametrsiz ham ishlayveradi**, faqat header qo'shish qismi olib tashlanadi.

### 3.2 Boot-time "loggedIn" holati — nima uchun va qanday

Muammo: hozir `AppContext`/`AdminContext`/`AuthForm` react qiladi "localStorage'da token bormi" degan SODDA, tarmoqsiz tekshiruvga (masalan, `AuthForm.jsx:41` — login sahifasida turgan foydalanuvchi allaqachon login qilingan bo'lsa, darhol `/app`ga o'tkazadi, hech qanday tarmoq so'rovisiz). HttpOnly cookie JavaScript'dan umuman o'qilmaydi — shuning uchun bu "tezkor tekshiruv" imkoniyati yo'qoladi.

**Qaror**: `localStorage.setItem('token', ...)` o'rniga, login/register muvaffaqiyatidan keyin **faqat bitta, sezgir-bo'lmagan bayroq** yoziladi: `localStorage.setItem('vocably_authed', '1')`. Bu — HAQIQIY token EMAS, faqat "foydalanuvchi oxirgi marta muvaffaqiyatli login qilgan" degan UI-maslahat (hint). Haqiqiy autentifikatsiya HAR DOIM serverda, cookie orqali tekshiriladi — bu bayroq faqat quyidagi ikki holatda foydalaniladi:
1. `AuthForm.jsx` mount — bayroq bo'lsa, foydalanuvchini `/app`ga yo'naltiradi (agar cookie muddati o'tgan bo'lsa, `/app` o'zi keyin `fetchUserData` 401 orqali qaytadan `/kirish`ga qaytaradi — xato holat yo'qolmaydi, faqat bir zumlik noto'g'ri yo'naltirish bo'lishi mumkin, real xavfsizlik oqibati yo'q).
2. Yo'q — `AppContext`/`AdminContext` ENDI bu bayroqqa umuman qaramaydi, har doim to'g'ridan-to'g'ri `fetchUserData()`/`/api/chat/me`ni chaqiradi va NATIJADAN kelib chiqib qaror qiladi (401 → `/kirish`). Bu haqiqiy xavfsizlik chegarasi — bayroq faqat AuthForm'ning "allaqachon login qilingan" tezkor yo'nalishi uchun, xolos.

`logout()` bu bayroqni ham tozalaydi.

**Bu TZning 16-bandiga mos**: "JWT/accessToken/refreshToken localStorage'da qolmasligi kerak" — `vocably_authed` haqiqiy token EMAS, XSS uni o'qisa ham hech narsaga foyda bermaydi (faqat "true/false", hech qanday hisobga kirish imkonini bermaydi).

### 3.3 CSRF (§6)

Cookie `SameSite=Lax` (allaqachon shunday, `src/lib/auth.js:49`) — bu cross-site POST/PUT/PATCH/DELETE so'rovlarida cookie yuborilishining OLDINI OLADI (faqat oddiy GET-navigatsiya cookie'ni olib boradi). Bu zamonaviy brauzerlarda CSRF'ning eng xavfli holatini (state-changing so'rovlar) alohida CSRF-token sxemasisiz ham to'sadi. **Qo'shimcha CSRF-token infratuzilmasi kerak emas** — bu loyihaning hajmi/xavf profiliga mos, standart tavsiya qilingan yechim (OWASP ham SameSite=Lax/Strict'ni CSRF'ning birlamchi himoyasi sifatida tan oladi).

## 4. Amalga oshirish rejasi (TZ §29 fazalariga moslashtirilgan)

| Faza | Ish | Xavf | Fayllar soni |
|---|---|---|---|
| 3 (Backend) | Yo'q — allaqachon tayyor | — | 0 |
| 4 (Login/Register) | `AuthForm.jsx` — `localStorage.setItem('token'...)` → `vocably_authed` bayrog'iga | Past | 1 |
| 5 (API client) | `attemptsApi.ts`/`examStore.ts`/`useAutosave.ts` — markazlashgan, Authorization olib tashlanadi | Past (markazlashgan) | 3 |
| 6 (Protected user routes) | `AppContext.jsx` (~20 joy) + tarqoq fayllar (`NotificationBell`, `AiChat`, `useAuthedMedia`, `pushClient`, `ChatContext`, `PendingAddWordsCard`, `profil`, `reyting`, `dashboard`, `UserProfileModal`, `TestPicker`, `AddWordModal`) | O'rta (ko'p fayl, lekin bir xil naqsh) | ~15 |
| 7 (Admin auth) | `AdminContext.jsx` + 15 ta admin komponenti | O'rta (ko'p fayl, bir xil naqsh, lekin admin-only — oddiy foydalanuvchiga ta'sir qilmaydi) | 16 |
| 8 (Logout/expiration) | `AppContext.jsx#logout` — `vocably_authed`ni tozalash | Past | 1 (allaqachon 6-fazada) |
| 9 (Cleanup) | Qolgan `localStorage.getItem/setItem('token')` qidiruvi — bo'sh natija tasdiqlanadi | Past | — |
| 10 (Security tests) | Pastga qarang | — | — |
| 11 (Build/lint/typecheck) | Har fazadan keyin | — | — |
| 12 (Final audit) | `AUTH_MIGRATION_REPORT.md` | — | — |

**Qoldirilgan mavjud xatti-harakat (o'zgartirilmaydi)**: login/verify-code javobi hali ham `token`ni JSON body'da qaytaradi (backend o'zgarmaydi — boshqa hech kim buzilmasligi uchun). Frontend endi bu maydonni **o'qimaydi/ishlatmaydi**, lekin backend contract'ni o'zgartirish bu migratsiya doirasidan tashqari (backendni o'zgartirish yangi risk kiritadi, foyda kam — token JSON body'da qaytishi xavfsizlik muammosi emas, faqat CLIENT uni saqlamasligi muhim).

---

Keyingi hujjat: implementatsiya davomida topilgan har qanday kutilmagan holat shu faylga qo'shiladi. Yakuniy hisobot — `AUTH_MIGRATION_REPORT.md`.
