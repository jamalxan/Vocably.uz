# Vocably.uz — To'liq texnik audit hisoboti

Sana: 2026-09-17. Repo: `jamalxan/Vocably.uz` (lokal working directory: `sinonimlar-ai-app`). Live: `https://vocably.uz`.

## Metodologiya va doira (muhim — avval o'qing)

Bu audit ikki manbadan quriladi:

1. **Statik kod tahlili** — butun `src/app/api/**` (105+ route), `src/app/**` sahifalar, `src/lib/**`, `src/features/exam/**`, `docs/**` va `.env`/gitignore konfiguratsiyasi o'qildi/grep qilindi.
2. **Jonli brauzer tekshiruvi** — Chrome kengaytmasi orqali. Bu sessiyada brauzerda **allaqachon haqiqiy foydalanuvchi sessiyasi ochiq edi** (`Jamolxon`, real hisob) — bu login qila olmaslik holatini chetlab o'tdi va public sahifalar + authenticated `/app/*` bo'limlarining katta qismini **real productionda, real ma'lumot bilan** tekshirish imkonini berdi. **Hech qanday parol/login taxmin qilinmadi** (§27/§32 qoidasi) — mavjud sessiyadan foydalanildi.
3. **Destructive harakatlar qilinmadi**: haqiqiy Mock imtihon boshlanmadi (2.5 soatlik real urinish yaratardi), so'z/kategoriya o'chirilmadi, real AI-ga qimmat so'rov yuborilmadi.

**Bu FAQAT UI audit emas** — quyida backend/DB/auth/AI pipeline/xavfsizlik ham qamrab olingan, lekin **105 ta API endpoint va 50+ sahifaning HAR BIRI qatma-qat qo'lda bosib chiqilgani yo'q** (bu haqiqiy hajm — bir necha kunlik ish). Buning o'rniga: (a) arxitektura to'liq xaritalandi, (b) xavfsizlik-kritik yo'llar (auth, admin, to'lov, fayl yuklash, IDOR, AI kontent validatsiyasi) chuqur tekshirildi, (c) topilgan **har bir muammo uchun aniq fayl:qator** ko'rsatilgan — taxmin yo'q.

**CANNOT_VERIFY (ushbu sessiyada tekshirib bo'lmadi):**
- Haqiqiy IELTS test topshirish (Reading/Listening/Writing/Speaking to'liq oxirigacha) — boshlash real attempt yaratadi va vaqtni ishga tushiradi, foydalanuvchining real hisobida buni qilish noo'rin.
- AI kontent generatsiya (`/admin/content/*` orqali real AI chaqiruvi) — `docs/`dagi loyiha xotirasiga ko'ra OpenRouter balansi $0, chaqiruvlar 402 bilan qaytadi (bu allaqachon ma'lum, kod muammosi emas).
- Haqiqiy mobil qurilmada (fizik telefon) responsive/klaviatura xatti-harakati.
- Screen-reader (NVDA/VoiceOver) bilan to'liq a11y tekshiruvi.

---

## 1. Loyiha arxitekturasi (haqiqiy holat)

| Qatlam | Texnologiya |
|---|---|
| Frontend | Next.js 14.2 App Router, React 18, Tailwind CSS. `src/app/` da 3 marshrut guruhi: public sahifalar (`/`, `/kirish`, `/royxat`, `/narxlar`, `/lugat`, `/blog`), `src/app/app/(main)` — asosiy ilova (lug'at/SRS, Do'stlar chat, gamifikatsiya, profil), `src/app/app/(exam)` — IELTS imtihon dvigateli (Reading/Listening/Writing/Speaking/Mock). |
| Admin panel | `src/app/admin/**` — foydalanuvchilar, chat moderatsiyasi, e'lonlar, IELTS-test CRUD, "Kontent studiyasi" (AI orqali kitob→test pipeline), Autopilot siyosat qatlami. Himoya: har bir `/api/admin/*` route o'z ichida `requireAdminUser()` chaqiradi (client tomonda `AdminGate` faqat UX uchun, haqiqiy tekshiruv server API'da). |
| Backend | Next.js Route Handlers (`route.js`), Vercel serverless funksiyalar. |
| Ma'lumotlar bazasi | MongoDB (Mongoose 8). Asosiy kolleksiyalar: `User` (categories/words/chatSessions ichki hujjat sifatida + `role`/`chatAccess` maydonlari), `OtpSession`, `ReviewEvent`, `Conversation`/`Message` (Do'stlar chat), `ExamTest`/`ExamAttempt` (IELTS dvigateli), `ContentBook`/`ReviewItem`/`AiCall` (AI kontent quvuri), `AdminAuditLog`, `RateLimitHit`. |
| Auth | JWT (`jsonwebtoken`), 30 kun. **Ikki tomonlama**: `Authorization: Bearer` header (asosiy, ~100 joyda ishlatiladi) VA yangi httpOnly+Secure+SameSite=Lax cookie (`src/lib/auth.js`) — ikkalasi ham qabul qilinadi. Parol — bcrypt. OTP yetkazish — **faqat Telegram bot orqali**, SMS yo'q. |
| AI | 4 bosqichli fallback zanjiri: Groq → Cerebras → OpenRouter → Gemini (`src/app/api/ai/chat/route.js`, `src/lib/aiJson.js`). Kontent-ingestion quvuri alohida OpenRouter router (`src/lib/contentAgent/aiRouter.js`). |
| Fayl saqlash | Do'stlar chat media — S3/MinIO (presigned URL, hech qachon to'g'ridan-to'g'ri public URL emas). AI kontent kitoblari — Cloudflare R2. IELTS audio — statik fayllar (`public/audio/exam/`, offline TTS bilan yaratilgan). |
| Deploy | Vercel, `master`ga push avtomatik deploy qiladi. |

To'liq API inventarizatsiyasi va DB sxemasi allaqachon `docs/API_INVENTORY.md` va `docs/DB_SCHEMA.md`da bor edi, **lekin ular 2026-08-09 sanasidagi, IELTS imtihon dvigateli, admin panel va AI kontent quvuridan OLDINGI holatni tasvirlaydi** — o'sha ikki hujjatni joriy holat uchun ishonchli manba deb hisoblamang, bu hisobot ustuvor.

## 2. Joriy funksionallik (xulosa)

- **So'z boyligi/SRS**: kategoriyalar, so'zlar, ko'p rejimli mashqlar (kartochka, test, moslashtirish, tezkor o'yin, tinglab yozish, mnemonika, kollokatsiya, jumla qurish, so'z oilasi), haqiqiy SM-2-variant SRS (`src/lib/srs.ts`).
- **IELTS imtihon dvigateli**: Reading/Listening/Writing/Speaking + to'liq Mock (random tanlangan test, bo'lim ketma-ketligi bo'yicha), server-authoritative timer, sanitizatsiya (javob kalitlari clientga hech qachon chiqmaydi), AI baholash (Writing/Speaking).
- **Do'stlar (ijtimoiy chat)**: 1:1 suhbat, media, bloklash, shikoyat, admin moderatsiyasi.
- **Gamifikatsiya**: XP, daraja, reyting jadvali, "alanga" (streak).
- **Admin panel**: foydalanuvchi boshqaruvi, chat moderatsiyasi, IELTS-test CRUD (JSON/DSL/AI-generate), AI kontent quvuri (kitob yuklash→AI parse→tekshiruv navbati→nashr), "Avtopilot" siyosat qatlami (M7, hali real quvursiz — pastda ko'ring).

## 3. Public sayt auditi

Jonli tekshirildi: Bosh sahifa, `/kirish`, `/royxat`, `/narxlar`, `/lugat`, `/blog`.

| Sahifa | Holat | Izoh |
|---|---|---|
| `/` (bosh sahifa) | ✅ Toza | Konsolda xatolik yo'q, CTA tugmalari (Bepul boshlash / Ro'yxatdan o'tmasdan sinash) ko'rinadi. |
| `/kirish`, `/royxat` | ✅ Ishlaydi | (Sessiya allaqachon ochiq bo'lgani uchun avtomatik `/app`ga yo'naltirdi — bu **to'g'ri xatti-harakat**, allaqachon login qilgan foydalanuvchi login sahifasini qayta ko'rmasligi kerak.) |
| `/narxlar` | ✅ To'g'ri | "Tariflar tez orada" — ataylab qo'yilgan placeholder, haqiqiy to'lov integratsiyasi yo'q (Stripe/Click/Payme kodda topilmadi). To'lov xavfsizligi auditi shu sababli **kerak emas** — hozircha to'lov yo'q. |
| `/lugat` | ✅ Ishlaydi | Ommaviy so'zlar ro'yxati (SEO uchun), tarjima+talaffuz bilan. |
| `/blog` | ✅ Ishlaydi | 3 ta maqola, sarlavha/sana/o'qish vaqti ko'rsatilgan. |

**C1 — Sovuq start kechikishi (MEDIUM, UX)**: `/app`, `/app/oqish`, `/app/mock` kabi sahifalarga birinchi kirishda progress-bar yoki skeleton'siz, faqat aylanuvchi spinner bilan **5-10+ soniya** kutish kuzatildi (bir marta CDP screenshot hatto 30s taymout bilan ishlamay qoldi, keyingi urinishda normal yuklandi). Sabab kodda aniq izohlangan (`src/lib/chatAuth.js` komentariga qarang — Mongoose sovuq ulanish/"buffering timed out"). Bu funksional xato emas (barcha keyingi so'rovlar 200 qaytardi, konsolda xato yo'q) — lekin real foydalanuvchiga "ilova osilib qoldi" taassurotini beradi, ayniqsa imtihon boshlash ekranida. **Tavsiya**: birinchi og'ir sahifalarga (`/app`, `/app/oqish`, `/app/mock`, `/app/tinglash`) skeleton-loader yoki "Yuklanmoqda..." dan keyin 5s dan so'ng "Internet aloqasini tekshiring / Qayta urinish" tugmasi qo'shish — hozir muvaffaqiyatsiz bo'lib qolsa foydalanuvchiga hech qanday chiqish yo'li ko'rsatilmaydi (E22ga qarang).

Broken link/route qidiruvi (statik): barcha `<Link href=` va `router.push(` chaqiruvlari mos sahifa fayllari bilan tekshirildi, mosliksizlik topilmadi.

## 4. Autentifikatsiya auditi

Login/parol — telefon+parol, ro'yxatdan o'tish/parolni tiklash — Telegram bot orqali bir martalik kod bilan tasdiqlanadi (SMS yo'q).

**F1 — Hisob mavjudligini aniqlash (account enumeration) + tezlik cheklovi yo'q edi (MEDIUM→FIXED bu sessiyada)**
- Fayl: `src/app/api/auth/register-init/route.js`, `src/app/api/auth/reset-init/route.js`
- Muammo: `register-init` "Bu telefon raqam bilan hisob allaqachon mavjud" deb, `reset-init` esa "Bu raqam bilan hisob topilmadi" deb **hech qanday tezlik cheklovisiz** javob berardi — tajovuzkor telefon raqamlar ro'yxatini (masalan, ketma-ket generatsiya qilib) ommaviy tekshirib, qaysi raqamlar ro'yxatdan o'tganini bilib olishi mumkin edi. Bundan tashqari, cheklovsiz chaqiruv har safar yangi `OtpSession` hujjati yaratardi (arzon DoS/spam).
- **Tuzatildi**: ikkala endpointga ham telefon raqam bo'yicha 60 soniyalik oynada 5 tagacha urinish cheklovi qo'shildi (`checkRateLimit`, mavjud infratuzilma — `src/lib/chatAuth.js`). Xabar matnlari (UX qarori bo'lgani uchun) o'zgartirilmadi — asosiy xavf endi tezlik cheklovi bilan yopilgan.
- Qoldiq tavsiya: agar enumeration'ni butunlay yo'q qilish kerak bo'lsa, ikkala endpoint ham har doim bir xil umumiy javob qaytarishi kerak ("Agar bu raqam ro'yxatdan o'tgan bo'lsa, Telegram orqali kod yuboriladi") — bu mahsulot/UX qarori, shuning uchun bu yerda matn o'zgartirilmadi.

**F2 — `admin/bootstrap` doimiy ochiq eskalatsiya yo'li (MEDIUM→qisman FIXED)**
- Fayl: `src/app/api/admin/bootstrap/route.js`
- Muammo: `ADMIN_SETUP_SECRET` bilan himoyalangan, lekin **birinchi admin tayinlangandan keyin ham o'chmaydi** — agar bu maxfiy kalit qachondir sizib chiqsa (log, `.env` faylini noto'g'ri commit qilish va h.k.), tajovuzkor istalgan vaqtda istalgan telefon raqamini adminga aylantira oladi, cheksiz.
- **Tuzatildi**: IP bo'yicha 5/60s tezlik cheklovi qo'shildi (brute-force'ni qiyinlashtiradi).
- Qoldiq tavsiya (bu sessiyada qilinmadi — mahsulot qarori kerak): birinchi admin yaratilgandan so'ng, ushbu endpointni butunlay o'chirib qo'yish (masalan, `User.countDocuments({role:'admin'}) > 0` bo'lsa 403 qaytarish) — lekin buni amalga oshirishdan oldin foydalanuvchidan tasdiq so'rash kerak, chunki agar kelajakda yana admin qo'shish kerak bo'lsa (masalan, yangi jamoa a'zosi), bu yo'l endi ishlamaydi va admin panel ichidan qo'lda `role` o'zgartirish kerak bo'ladi.

**F3 — JWT hali ham `localStorage`da (HIGH, ochiq, oldindan ma'lum)**
- Fayl: `src/context/AppContext.jsx`, ~100 ta fetch chaqiruvi.
- Kod ichidagi izoh (`src/lib/auth.js:1-16`) buni to'g'ri tasvirlaydi: server allaqachon httpOnly cookie'ni ham qo'llab-quvvatlaydi, lekin client hali ham `localStorage`dan token o'qib, `Authorization` header orqali yuboradi. XSS bo'lsa, token o'g'irlanishi mumkin. To'liq tuzatish — clientni faqat cookie'ga o'tkazish — ~100 chaqiruv joyini o'zgartirishni talab qiladi va **jonli login oqimini sinovdan o'tkazmasdan qilish xavfli** (login butunlay buzilib qolishi mumkin). Bu sessiyada bajarilmadi — katta, alohida, brauzerda bosqichma-bosqich sinaladigan ish sifatida qoldirildi.

**F4 — Parol/OTP xavfsizligi (tekshirildi, muammo topilmadi)**: bcrypt hash (`bcryptjs`, cost 10), OTP sessiyasi 15 daqiqada TTL bilan avtomatik o'chadi, urinishlar 5 taga cheklangan (`verify-code` route). Parol kamida 6 belgi talab qilinadi (zaif chegara, lekin OTP orqali ikkinchi faktor mavjudligi buni qisman kompensatsiya qiladi).

## 5. Foydalanuvchi paneli (jonli tekshirildi)

`/app` (Bosh sahifa), `/app/lugat`, `/app/profil`, `/app/dostlar` — barchasi jonli, real hisob ma'lumotlari bilan tekshirildi:
- Bosh sahifa: "Bugungi ish" (55 so'z takrorlashga tayyor, 160 yangi), "Alanga" streak-kartasi (3 kun, haftalik grid), to'g'ri render qilindi.
- `/app/lugat`: kategoriya selektori + 10 ta mashq rejimi kartochkalari to'g'ri ko'rsatildi.
- `/app/profil`: ism, daraja (Elementar A2, 377 XP), mavzu tanlash (Yorug'/Tungi/Tizim), Chiqish tugmasi — barchasi ishlaydi.
- `/app/dostlar`: qidiruv maydoni + suhbatlar ro'yxati yuklandi (spinner qisqa muddat ko'rindi, keyin normal render bo'ldi).

Konsolda hech qanday xatolik yoki ogohlantirish topilmadi bu tur bo'ylab.

## 6-9. IELTS Reading/Listening/Writing/Speaking va Test Engine

**Statik kod tahlili orqali tasdiqlangan** (loyihaning oldingi sessiyalarida qurilgan, `TZ-vocably-v2.md`dagi to'liq spetsifikatsiyaga muvofiq — bu audit ularni qayta yozmadi, faqat tekshirdi):

- Har bir savol turi (TFNG/YNG, ko'p tanlovli bir/ko'p javobli, moslashtirish, bo'sh joy to'ldirish guruhlari, diagramma yorlig'i) uchun alohida renderer mavjud (`src/features/exam/questions/types/*`).
- **Server-authoritative**: `GET /api/exam/attempts/[id]` javob kalitlarini HECH QACHON qaytarmaydi (`sanitizedTestFor`, `src/app/api/exam/attempts/[id]/route.js:8-12`) — faqat `/result` endpointi (holat `graded` bo'lgandan keyin) to'liq ma'lumot beradi.
- **IDOR himoyasi tasdiqlandi**: har bir attempt-route `getOwnedAttempt(id, userId)` orqali egalikni tekshiradi — boshqa foydalanuvchining attempt/result ID'sini almashtirib ko'rish 404 bilan qaytariladi (kod darajasida tasdiqlandi, jonli sinov CANNOT_VERIFY — buning uchun 2 ta alohida hisob kerak).
- **Submit idempotent**: `submitAttempt` atomik shartli yangilanish orqali — ikki marta bosish yoki tarmoq qayta yuborishi natijani ikki marta hisoblamaydi (`src/app/api/exam/attempts/[id]/submit/route.js:7-9` izohi + `attemptServer.ts`).
- **Scoring**: band konvertatsiyasi server tomonida (`src/lib/exam/scoring.ts`), frontendga faqat natija yuboriladi — frontend hech qanday baholashni o'zi hisoblamaydi.
- **Audio**: statik fayllar (`public/audio/exam/`), GridFS emas — bu M7 rejasidan chetga chiqish, lekin sabab hujjatlashtirilgan (loyiha xotirasi: sandbox tarmoq cheklovi bois GridFS o'rniga statik fayl tanlandi).
- Jonli tekshirilgan: `/app/mock` intro ekrani (Listening 30daq/40 savol, Reading 60daq/40 savol, Writing 60daq/2 task, jami 2soat 30daq) — to'g'ri ko'rsatildi, "Imtihonni boshlash" tugmasi ishlaydigan ko'rinadi (bosilmadi — real 2.5 soatlik urinish yaratardi). `/app/oqish` test-tanlash ekrani 4 ta "Vocably Practice Test" bilan to'g'ri yuklandi (birinchi navigatsiyada sovuq-start kechikishi kuzatildi, C1ga qarang).

**CANNOT_VERIFY**: to'liq savol javoblash → submit → natija ko'rish oqimi (real attempt yaratmaslik uchun ataylab bajarilmadi).

## 10. Baholash (Scoring) auditi

Yuqoridagi §6-9ga qarang — **band frontendda emas, serverda hisoblanadi** (`src/lib/exam/scoring.ts`), bu TZning aynan talab qilgan narsasi. Muammo topilmadi.

## 11. Admin panel auditi

`requireAdminUser()` qo'llanilishi bo'yicha **34 ta admin route faylining 33 tasi** to'g'ri himoyalangan holat topildi; qolgan 1 tasi (`admin/bootstrap`) alohida maxfiy-kalit mexanizmi bilan himoyalangan (§4, F2ga qarang — endi tezlik cheklovi bilan kuchaytirildi). Boshqa muammo topilmadi:
- Har bir admin mutatsiyasi `writeAuditLog()` orqali `AdminAuditLog`ga yoziladi (IP, user-agent, diff bilan) — buyruq zanjiri to'g'ri.
- Client tomonidagi `AdminGate` (`src/components/admin/AdminGate.jsx`) faqat UX uchun (spinner→ruxsat berilmagan ekran) — haqiqiy xavfsizlik server API darajasida, bu to'g'ri arxitektura (client-side gate hech qachon yagona himoya bo'lmasligi kerak, va shunday emas).

**G1 — Markazlashgan middleware yo'q (LOW, arxitektura, kelajak uchun tavsiya)**: `src/middleware.js` mavjud emas — har bir yangi `/api/admin/*` route o'zi qo'lda `requireAdminUser()` chaqirishni "eslab qolishi" kerak. Bugungi kunda barcha routelar to'g'ri qiladi, lekin bu naqsh **kelajakda bitta yangi route uni unutib qo'yishi mumkinligini** anglatadi — hech qanday markaziy "so'nggi chiziq" yo'q. Tavsiya: `middleware.js`da `/api/admin/*` yo'liga (bootstrap'dan tashqari) asosiy JWT-mavjudlik tekshiruvini qo'shish (to'liq role-tekshiruv baribir har bir route'da qolishi kerak, chunki `role` DB so'rovi kerak — middleware faqat "token umuman yo'q" holatini erta ushlaydi).

## 12. AI kontent boshqaruvi auditi

TZning §12 talabiga ko'ra tekshirildi: AI generatsiya to'g'ridan-to'g'ri DBga yozilmasligi, schema validatsiyasi, noto'g'ri bo'limga tushmasligi.

- `src/lib/exam/contentValidator.ts` (admin `/admin/exam-tests` va AI-generate yo'llarining ikkalasi ham shu orqali o'tadi) — majburiy: bo'lim bo'yicha ketma-ket 1..N raqamlash, har bir savolda kamida 1 ta qabul qilinadigan javob, `matching_headings` uchun bank to'ldirilgan, rasm uchun `imageAlt` majburiy, listening uchun `audioUrl` majburiy. Bu validatsiya **client tomonda darhol VA server tomonda create/publish paytida qayta** ishga tushadi — clientga hech qachon ishonilmaydi.
- AI-generatsiya qilingan Reading kontenti ham xuddi shu `Passage[]` shaklini ishlab chiqaradi (JSON import/DSL bilan bir xil review bosqichidan o'tadi) — "noto'g'ri bo'limga tushish" xavfi yo'q, chunki har bir import yo'li section-maydonini validator orqali tekshiradi.
- Admin review workflow mavjud (`/admin/content/review`, `ReviewItem` modeli) — AI hallucination xavfi uchun inson tasdig'i talab qilinadi, avtomatik nashr yo'q (Autopilot M7 hali "hech narsa avtomatlashtirmaydi" holatida, pastga qarang).

**H1 — Avtopilot (M7) hali inert kod (INFO, muammo emas)**: `docs/ai-content-agent-tz-avtopilot.md` talab qilgan S12.5-S16 bosqichlari (o'z-o'zini davolash, avtomatik nashr, mock rejalashtiruvchi) **hali qurilmagan** — sabab: ular real quvur (M2-M6, kitob→matn ajratish→AI parse→sifat tekshiruvi) ustiga qurilishi kerak, u esa hali yo'q (loyiha xotirasi: OpenRouter hisobida $0 balans haqiqiy to'siq). UI panellari buni halol ko'rsatadi ("hali hech narsa yo'q"), soxta faollik ko'rsatilmaydi. Bu **band muammo emas**, faqat auditning "hozircha nima qurilmagan" ro'yxati uchun.

## 13. Ma'lumotlar bazasi auditi

`docs/DB_SCHEMA.md` (2026-08-09) asosiy `User`/`Category`/`Word` sxemasini to'g'ri tasvirlaydi, lekin IELTS/chat/AI-kontent kolleksiyalarini o'z ichiga olmaydi (ular keyinroq qo'shilgan — qisman `docs/DB_SCHEMA.md`ning "Do'stlar" bo'limida bor). Tekshirilgan:
- `ReviewEvent`, `Conversation`/`Message`, `ExamTest`/`ExamAttempt` — barchasi to'g'ri indekslangan (`userId`+`createdAt`/`reviewedAt` kompozit indekslar).
- `RateLimitHit` — TTL indeks bilan o'zi tozalanadi (infratuzilmasiz tezlik cheklash uchun to'g'ri naqsh).
- Eski muammo (B3, `docs/AUDIT_FINDINGS.md`dan) — `POST /api/words` butun `categories` massivini almashtiradi (poyga holati xavfi) — **hali ham ochiq**, bu audit uni qayta tasdiqladi (`src/app/api/words/route.js`), lekin past-ehtimollik (bitta foydalanuvchi, bir nechta yorliq/tab ochiq bo'lmasa kamdan-kam yuzaga keladi) va tuzatish katta refaktoring talab qiladi — TZning "kerak bo'lmagan katta o'zgarish qilmang" qoidasiga ko'ra bu safar qo'l tegizilmadi, faqat qayd etildi.

## 14. Backend/API auditi

Umumiy naqsh **yaxshi**: barcha route'lar `serverError()` orqali xatolarni umumiy xabar bilan qaytaradi (`src/lib/apiError.js`) — ichki tafsilotlar (Mongo host, stack) hech qachon clientga chiqmaydi, faqat server logiga yoziladi. Bu ilgari (eski audit, B-band emas) muammo bo'lgan, hozir **to'g'ri tuzatilgan holatda topildi**.

Rate-limiting qamrovi tekshirildi: `ai/chat`, `words/enrich`, `chat/upload/presign`, `chat/report`, `auth/login` — bor edi. `register-init`/`reset-init`/`admin/ai/playground`/`admin/bootstrap` — yo'q edi, bu sessiyada qo'shildi (§4ga qarang).

## 15. Xavfsizlik auditi — xulosa jadvali

Batafsili: `SECURITY_AUDIT.md`.

| Tekshiruv | Natija |
|---|---|
| XSS | Chat xabarlarida `dangerouslySetInnerHTML` ATAYLAB ishlatilmagan (kod komentariyasi buni tasdiqlaydi, `MessageBubble.jsx:102`) — havolalar regex orqali xavfsiz React elementiga aylantiriladi. Boshqa 19 ta `dangerouslySetInnerHTML` ishlatilgan joy (asosan exam-engine gap-fill HTML parser, admin-authored kontent) — admin-only yoki serverda sanitizatsiya qilingan kontent, xavf past. |
| CSRF | `SameSite=Lax` cookie + asosiy auth yo'li hali header-based Bearer token (CSRF'ga tabiiy immunitet, chunki cross-site so'rov header qo'sha olmaydi). |
| SQL/NoSQL injection | Mongoose ORM barcha joyda, xom query yo'q — muammo topilmadi. |
| IDOR/BOLA | Exam attempts va chat upload'da tasdiqlangan himoya (`getOwnedAttempt`, conversation a'zolik tekshiruvi). |
| Fayl yuklash xavfsizligi | `chat/upload/presign` — MIME/hajm validatsiyasi + a'zolik tekshiruvi + tezlik cheklovi (20/60s) bor. |
| Sirlar kodda | Topilmadi — `.env`/`.env.local` `.gitignore`da, `git ls-files` faqat `.env.example`ni ko'rsatadi. |
| Verbose xatolar | Yo'q — `serverError()` umumiy xabar qaytaradi. |
| Rate limiting/enumeration | F1/F2 — bu sessiyada tuzatildi. |
| Admin route himoyasi | 33/34 to'g'ri, 1 ta (`bootstrap`) alohida mexanizm bilan. |
| JWT saqlash | F3 — hali ochiq, katta refaktoring kerak. |

## 16. Fayl yuklash xavfsizligi

§15ga qarang — `validateUpload()` (`src/lib/s3.js`) MIME va hajm chegaralarini tekshiradi, obyekt kaliti server tomonida generatsiya qilinadi (foydalanuvchi kiritgan fayl nomi hech qachon to'g'ridan-to'g'ri saqlash kalitiga ishlatilmaydi — path traversal xavfi yo'q).

## 17-19. Responsive/Mobil, UX/UI, Accessibility

**Statik kod tahlili**: Tailwind responsive prefikslari (`sm:`, `md:`, `lg:`) izchil ishlatilgan, exam-engine mobil rejimi alohida qurilgan (`SplitPane.tsx` `<768px`da `MobileTabs.tsx`ga almashadi — loyiha xotirasida tasdiqlangan). **Fizik mobil qurilmada CANNOT_VERIFY**. Desktop brauzerda (1253×863) barcha tekshirilgan sahifalar to'g'ri render bo'ldi, layout buzilishi kuzatilmadi.

A11y: fokus-trap holati, `alert()` ishlatilishi va boshqa aniq topilmalar — eski `docs/AUDIT_FINDINGS.md`dagi B15/B16 hali ham asosiy lug'at-rejimlarida (Faza 9 sifatida "Ochiq" belgilangan) dolzarb bo'lishi mumkin, lekin bu audit ularni exam-engine yoki admin panelda qayta tasdiqlamadi (vaqt cheklovi) — **eski topilmalar hali tuzatilmagan deb hisoblang, qayta tekshirish tavsiya etiladi**.

## 20-21. Performance, SEO

`robots.ts` va `sitemap.ts` mavjud (yaxshi — TZ §21 talabi bajarilgan). Bosh sahifa bundle hajmi `next build` chiqishida oqilona ko'rinadi (asosiy sahifalar 90-150 kB First Load JS oralig'ida, `/app/mock` 246 kB — eng og'iri, sababi recharts+exam-engine bitta sahifada, lekin `next/dynamic` orqali qisman ajratilgan). Chuqur Lighthouse/Core-Web-Vitals auditi bu sessiyada o'tkazilmadi (bu alohida vosita talab qiladi).

## 22. Xato holatlari

C1 (sovuq-start spinner, hech qanday xato/qayta-urinish holatisiz) — yagona bu sessiyada yangi topilgan aniq gap. Boshqa xato holatlari (API down, tarmoq uzilishi) kod darajasida `serverError()` va har bir fetch'ning `.catch()` bloklari orqali qoplangan ko'rinadi, lekin real tarmoq uzilishini simulyatsiya qilib sinash bu sessiyada bajarilmadi.

## 23-24. Kod sifati, Dependency audit

`npm run lint`, `npm run type-check`, `npm run test` (183 test, 14 fayl), `npm run build` — **barchasi toza o'tdi** (quyidagi §Tekshiruv natijalariga qarang). Eskirgan/zaif paketlar uchun `npm audit` bu muhitda internet kirishisiz to'liq ishlamasligi mumkin — agar CI/CD muhitida ishlaydigan bo'lsa, muntazam `npm audit` yoki Dependabot yoqishni tavsiya qilaman.

## 25. Testlash

Mavjud: 14 test fayli, 183 test (Vitest) — asosan `srs.ts`, `scoring.ts`, `sanitize.ts`, `contentValidator.ts`, `autopilotGuards.js`, `analytics.ts` kabi sof mantiq funksiyalari uchun. **E2E test yo'q** (Playwright yoki shunga o'xshash o'rnatilmagan — bu ilgari ham qayd etilgan, tarmoqsiz muhitda `npm install` qila olmaslik sababli). To'liq reja: `TEST_PLAN.md`.

---

## Tekshiruv natijalari (ushbu sessiya oxirida)

```
npm run lint        → ✔ No ESLint warnings or errors
npm run type-check  → ✔ toza (chiqish yo'q)
npm run test        → ✔ 14 fayl, 183 test — barchasi o'tdi
npm run build       → ✔ barcha sahifa/route muvaffaqiyatli kompilatsiya qilindi
```

## Yakuniy ro'yxat

### Critical
Yo'q — bu audit davomida darhol xavfsizlik buzilishiga olib keladigan (masalan, autentifikatsiyasiz admin kirish, ochiq sirlar, ishlaydigan SQL/NoSQL injection) hech narsa topilmadi.

### High
- F3 — JWT `localStorage`da (XSS orqali token o'g'irlash xavfi). **FIXED (kod darajasida, alohida sessiyada)** — to'liq migratsiya bajarildi, batafsil `AUTH_MIGRATION_REPORT.md`. Productionda jonli sinov hali CANNOT_VERIFY (deploy qilinmagan).

### Medium
- F1 — Hisob enumeration + tezlik cheklovi (**FIXED**).
- F2 — `admin/bootstrap` doimiy ochiq (qisman **FIXED** — tezlik cheklovi qo'shildi, to'liq "bir martalik" qilish mahsulot qarori kerak).
- SEC-12 — Xavfsizlik headerlari (CSP/HSTS/X-Frame-Options) yo'q edi (**FIXED**, deploydan keyin tasdiqlash kerak).
- C1 — Sovuq-start spinner, xato/qayta-urinish holatisiz. Ochiq.
- B3 (eski, `docs/AUDIT_FINDINGS.md`) — `POST /api/words` to'liq massiv almashtirish poyga holati. Hali ochiq.
- B16 (eski, qayta tasdiqlangan) — `alert()` 19 ta faylda (6 eski + 13 yangi topilgan: Do'stlar chat, admin panel). Ochiq.

### Low
- G1 — Markazlashgan admin middleware yo'q (bugun muammo emas, kelajak uchun himoya qatlami).
- B15 (eski, qayta tasdiqlangan) — `ConfirmModal.jsx`da focus-trap yo'q. Ochiq.

### Fixed (ushbu sessiyada)
- `register-init`/`reset-init` — telefon bo'yicha tezlik cheklovi qo'shildi.
- `admin/bootstrap` — IP bo'yicha tezlik cheklovi qo'shildi.
- `admin/ai/playground` — admin bo'yicha tezlik cheklovi qo'shildi (narx nazorati gap'i).
- **SEC-12 — Xavfsizlik headerlari** (`next.config.mjs`): CSP (connect-src/img-src ataylab `'self'` + haqiqiy real-time/S3 originlariga cheklangan — bu SEC-03 XSS-orqali-token-o'g'irlash xavfining exfiltratsiya qismini yopadi), `frame-ancestors 'none'` + `X-Frame-Options: DENY` (clickjacking), HSTS, `Referrer-Policy`, `Permissions-Policy` (mikrofon faqat `self`, kamera/geolokatsiya bloklangan). Batafsil: `SECURITY_AUDIT.md#SEC-12`. **Faqat lokal build bilan tasdiqlangan — productionga deploydan keyin qayta tekshirish kerak.**
- **F3 — JWT/localStorage to'liq migratsiyasi** (alohida sessiya, batafsil `AUTH_MIGRATION_REPORT.md`): 59 fayl o'zgartirildi, 1 yangi API route (`/api/chat/socket-ticket`), 1 fayl o'chirildi (`jwtClient.js`). Kod darajasida to'liq, `lint`/`type-check`/183 test/`build` toza. Productionda jonli sinov (login/logout, realtime-server) hali CANNOT_VERIFY — deploy qilinmagan.
- **Eski B15/B16 qayta tekshirildi** (taxmin emas, joriy kodga nisbatan tasdiqlandi): B15 (focus-trap) hali ochiq; B16 (`alert()`) hali ochiq VA endi 19 ta faylni qamraydi (6 tasi eski, 13 tasi Do'stlar chat/admin panelda yangi topilgan). Ikkalasi ham TUZATILMADI (individual, ko'p-faylli UI ishi, xavf/vaqt muvozanati) — lekin endi "eski, tasdiqlanmagan" emas, "joriy kodda tasdiqlangan ochiq topilma" holatiga o'tkazildi.

### Not Fixed (sabab bilan)
- B3 (words full-array overwrite) — katta refaktoring, past ehtimollik, TZning "keraksiz katta o'zgarish qilmang" qoidasiga ko'ra qoldirildi.
- Eski B15/B16, A-band topilmalar — qayta tasdiqlash/tuzatish uchun alohida fokuslangan sessiya tavsiya etiladi (bu audit ularni "hali ochiq" deb meros qildi, lekin qayta tekshirmadi).

### Cannot Verify
- To'liq IELTS attempt oqimi (boshlash→javob→submit→natija) — real hisobda destructive bo'lardi.
- AI kontent generatsiyasining real ishlashi — OpenRouter balansi $0 (ma'lum, oldindan kod muammosi emas).
- Fizik mobil qurilma, screen-reader.

## Tavsiya etilgan keyingi qadamlar

1. F3 (JWT/localStorage) uchun alohida sessiya rejalashtiring — brauzerda haqiqiy login/logout sinovi bilan, bosqichma-bosqich (login→cookie-only→localStorage olib tashlash→har bir sahifada sinov).
2. `admin/bootstrap`ni "birinchi admindan keyin o'chirilsinmi" degan savolga javob bering (mahsulot qarori).
3. C1 uchun skeleton-loader/timeout-retry qo'shish — kichik, xavfsiz UI o'zgarishi.
4. Eski `docs/AUDIT_FINDINGS.md`dagi ochiq A/B-band topilmalarni (fokus-trap, `alert()`, kategoriya qidiruvi) joriy exam-engine/admin-panel kodiga nisbatan qayta tekshirish — ular 2026-08-09da faqat eski lug'at-ilovasi uchun yozilgan edi.
5. Real IELTS attempt oqimini (yoki test hisobda, yoki foydalanuvchi o'zi) qo'lda bir marta oxirigacha bosib chiqish — bu audit buni ataylab qilmadi.
