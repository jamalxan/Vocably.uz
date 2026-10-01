# To'liq sayt auditi — hisobot (2026-10-01)

Reja: `docs/FULL_AUDIT_PLAN.md`. Takliflar: `docs/PRODUCT_SUGGESTIONS.md`. Kod 79 sahifa, 186 API yo'li, ~78 000 qator.
Hamma tuzatish alohida commit'larda; `tsc` 0 xato, lint toza, `vitest` 92 fayl / 1351 test, E2E (desktop + mobil) yashil.

## 1. Natija qisqacha

| Bosqich | Holat | Asosiy natija |
|---|---|---|
| 1 Baza holati | ✅ | `tsc`/lint/build toza; `npm audit` 12 → 6 zaiflik (qolgani faqat Next 16 ga majburiy yangilanish) |
| 2 Xavfsizlik | ✅ | 2 jiddiy zaiflik (OTP parallel taxmin, NoSQL operator inyeksiyasi) va 8 ta mustahkamlash tuzatildi |
| 3 Tezlik | ✅ | Imtihon sahifalari ~110 kB yengillashdi; eslatma/hub o'lchovlari |
| 4 Mobil "orqaga" | ✅ | Tarix qoidalari, overlay'lar, kirish tuzoqlari tuzatildi (6 E2E test) |
| 5 Profil → Sozlamalar | ✅ | 4 bo'lim "Sozlamalar" oynasiga ko'chdi, lazy-load |
| 6 Keraksiz kod | ◐ | 3 fayl o'chirildi; 5 eski API yo'li **o'chirilmadi** (ruxsat rad etildi, pastga q.) |
| 7 To'liq sayt testi | ✅ | 67 sahifa × 2 viewport × 4 rol: 0 jiddiy xato |
| 8 Haqiqiy akkaunt bilan jonli tekshiruv | ⛔ bajarilmadi | Brauzerda parol kiritish xavfsizlik qoidalarim bilan taqiqlangan |

## 2. Xavfsizlik topilmalari

### Tuzatilgan (commit `98f40a0`, `…`)
| # | Jiddiylik | Topilma | Tuzatish |
|---|---|---|---|
| S1 | **Yuqori** | `verify-code`: urinishlar hisoblagichi atomik emas edi (o'qib → `+= 1` → `save`). Parallel so'rovlar hammasi `attempts = 0` ni ko'rib, 5 urinish chegarasini aylanib o'tardi → 6 xonali OTP ni batch bilan taxmin qilish mumkin edi | `findOneAndUpdate` bilan atomik "sarflash", qat'iy format (6 raqam), kod/imzo `timingSafeEqual`, sessiya bir martalik; IP bo'yicha 30/daq |
| S2 | **Yuqori** | `reset-password` / `verify-code`: `sessionToken` JSON tanadan to'g'ridan-to'g'ri Mongoose filtriga tushardi → `{"$ne":""}` bilan ixtiyoriy OTP sessiyani tanlash; `reset-password` da bu begona foydalanuvchining tasdiqlangan sessiyasi bilan parolini o'zgartirishgacha borardi (hujum oynasi: parolni tiklayotgan har qanday foydalanuvchi) | Qat'iy format tekshiruvi + `Request.json()` darajasida **umumiy** operator tozalagich (`safeRequest.js`: `$`-kalitli obyekt xavfsiz matnga almashtiriladi; prototype-pollution kalitlari tashlanadi) — 186 yo'lning hammasini qoplaydi |
| S3 | O'rta | Sirlar `===`/`!==` bilan solishtirilardi (cron, webhook, bootstrap, Payme, Click, realtime) — vaqt bo'yicha yon kanal | `safeEqual`/`bearerMatches` (SHA-256 + `timingSafeEqual`), sir sozlanmagan bo'lsa fail-closed |
| S4 | O'rta | `jwt.verify` algoritm cheklovisiz | `algorithms: ['HS256']` |
| S5 | O'rta | Realtime server: istalgan 30 kunlik sessiya tokeni bilan ulanish, `cors origin '*'`, cheksiz `presence:query`, ixtiyoriy matnli `typing` | Faqat 60 soniyalik `scope: realtime` tiket, `REALTIME_ALLOWED_ORIGINS`, kiritish cheklari |
| S6 | O'rta | Login faqat raqam bo'yicha cheklangan (bitta IP dan ko'p raqamni navbat bilan taxmin qilish — credential stuffing) | IP bo'yicha qo'shimcha chegara (login 40/daq, register/reset 20/daq) |
| S7 | Past | Parol uzunligi yuqori chegarasiz; telefon uzunligi chegarasiz | parol ≤128, telefon ≤15 raqam (E.164) |
| S8 | Past | JSON-LD `JSON.stringify` (`<` ekranlanmagan) — hozir statik, lekin kelajakda XSS yo'li | `serializeJsonLd` (5 joy) |
| S9 | Past | Telegram HTML-rejimda foydalanuvchi matni ekranlanmagan (admin xabari, chek xabari, kunlik mini-test) — `<`/`&` bo'lsa xabar jim yo'qolardi | `escapeTelegramHtml` |
| S10 | Past | Chat media kaliti: `.`/`..`/bo'sh segmentlar | rad etiladi |
| S11 | Past | Yaroqsiz ID (`CastError`) 500 + xato logi | 400 (`serverError`) |

Tekshirilgan va **to'g'ri** topilganlar: barcha 186 yo'lda himoya xaritasi (faqat 7 ta ochiq yo'l — hammasi auth oqimi); `/api/admin/*` va `/api/teacher/*` rol tekshiruvi to'liq; to'lovlar atomik (`pending→approved`); chek yuklash (magic-bytes, hajm, egasi/admin); avatar maxfiyligi; chat mediada a'zolik tekshiruvi; server `fetch`lari faqat qat'iy hostlarga (SSRF yo'q); `dangerouslySetInnerHTML` ma'lumotlari importda ekranlanadi (`sanitize.ts`); cookie `httpOnly`/`SameSite=Lax`/prod'da `Secure`; CSP, HSTS, X-Frame-Options.

### Ochiq qoldirilgan (qaror/hajm kerak)
1. **Next.js 14.2.35 zaifliklari** (`npm audit`: 1 critical + 5 high). Tuzatish faqat Next 15.5.24+/16 da. Ta'sir tahlili: ilova **server actions, `next/image`, middleware, rewrites, i18n** ishlatmaydi va Vercel'da (Linux) joylashgan — advisories'ning ko'pchiligi (RCE Windows'da, Image Optimizer, Server Actions SSRF, rewrites) bu holatda qo'llanmaydi; qolgani RSC so'rovlarida DoS. Yangilash katta: `@react-three/fiber` v8 / `drei` v9 React 18 ga bog'liq (Next 15 App Router React 19). **Tavsiya:** alohida filialda Next 15.5.x + React 19 + fiber v9 ga o'tish (taxminan 1–2 hafta, E2E bilan).
2. **JWT bekor qilinmaydi:** parol tiklangandan keyin eski sessiya tokenlari 30 kun amal qiladi, "hamma qurilmadan chiqish" yo'q. Tuzatish: `User.tokenVersion` + har so'rovda tekshirish (hozir `getUserIdFromRequest` sinxron, DB'siz — katta refaktor). Qisqa muddat + yangilash tokeni ham variant.
3. `admin/bootstrap` birinchi admin tayinlangandan keyin ham ochiq (sir + IP limit bilan himoyalangan). Tavsiya: admin mavjud bo'lsa o'chirish yoki env bayrog'i.
4. O'qituvchi istalgan `username` ni sinfga **roziligisiz** qo'sha oladi (mahsulot qarori: taklif/qabul qilish).
5. Telegram `setup` yo'li sirni URL query'da qabul qiladi (loglarga tushadi) — tavsiya: header yoki POST.

## 3. Tezlik

- **Imtihon sahifalari:** `recharts` (~100 kB) faqat yakuniy natija ekranida kerak edi, lekin statik import qilinardi. `next/dynamic` ga o'tkazildi: `/app/mock` **270 → 161 kB**, tinglash urinishi **255 → 146 kB**, o'qish urinishi **244 → 136 kB** (First Load JS; o'lchandi: `next build` oldin/keyin).
- Profil sahifasi: 2 ta so'rov kamaydi (Sozlamalar faqat ochilganda yuklaydi).
- Vokabulyar hub: 5 000 so'zda profil ~195 ms, katalog ~57 ms; 10 000 so'zda ~225/100 ms (lokal). 8 000 so'z tavani joriy.
- DB indekslari: 61 sxemadan `userId`/`conversationId` bilan so'raladiganlarning hammasida indeks bor — o'zgartirish kerak emas.
- Ma'lum cheklov: `GET /api/words` butun kategoriyalarni (so'zlari bilan) qaytaradi; 5 000 so'zli foydalanuvchida ~4 MB (gzipsiz). Yechim — `docs/VOCAB_WORDS_MIGRATION_PLAN.md` (kategoriya bo'yicha yuklash).
- Build: 215 sahifa; shared JS 87.8 kB.

## 4. Mobil "orqaga" (qurilma tugmasi)

Qayta ishlab chiqarilgan sabablar (Playwright, Pixel 7):
1. Kirishdan keyin tarix `/app ← /app ← blank` (login `push` + `/kirish` qayta yo'naltirish): birinchi "orqaga" hech narsa o'zgartirmasdi.
2. Pastki tablar har safar `push` — Profil'dan "orqaga" tasodifiy oldingi tabga (AI/Mashq) tushardi.
3. Modal/panel ochiq paytda "orqaga" sahifadan chiqib ketardi.
4. Himoya yo'naltirishlari (`/kirish`ga) `push` — orqaga tuzoq.

Tuzatish: `tabHistory.js` (Bosh→tab `push`, tab→tab `replace`, tab→Bosh mavjud yozuvga qaytish), `useBackClose` (13 ta modal/panel), kirish/yo'naltirishlar `replace`. 6 E2E test + 9 birlik test.

## 5. Profil → Sozlamalar

Sahifada: foydalanuvchi, daraja/XP/nishonlar, statistika, Chiqish. **Sozlamalar** oynasida (mobilda to'liq ekran varag'i): IELTS tayyorgarlik, Telegram kunlik mashq, Ko'rinish (mavzu), Maxfiylik (Do'stlar). Oyna "orqaga" bilan yopiladi.

## 6. Keraksiz kod

- O'chirildi: `Tooltip.jsx`, `TestPicker.jsx`, `RandomSectionStart.jsx` (hech qayerdan import qilinmagan; import grafi bo'yicha 768 fayldan faqat 3 ta).
- **Qoldirilgan (sizdan ruxsat kerak):** 5 ta eski API yo'li — `api/reading/**`, `api/listening/**`, `api/speaking/generate-prompt` — 10-sentabrdan beri hech narsa chaqirmaydi (imtihon dvigateli almashtirgan), AI kvotasini sarflaydi, ulardagi `ReadingAttempt`/`ListeningAttempt` modellari faqat shu yo'llarda ishlatiladi. Katalogni rekursiv o'chirish buyrug'i ruxsat tizimi tomonidan rad etildi (qaytarib bo'lmaydigan o'chirish); git'da saqlangan, istalgan vaqt tiklanadi. O'chirish: `git rm -r src/app/api/reading src/app/api/listening src/app/api/speaking/generate-prompt`.
- Tashqi chaqiruvchisi bo'lishi mumkin bo'lgan, kodda havolasiz yo'llar (qoldirildi): `admin/bootstrap`, cron/webhook yo'llari, `vocabulary/{due,exercises,search,story}`, `gamification/{quests,achievements}`, `admin/review/bulk-accept` (UI kutilmoqda — `PRODUCT_SUGGESTIONS.md` A1).

## 7. To'liq sayt testi (`e2e/site-crawl.spec.ts`)

Barcha statik sahifalar fayl daraxtidan avtomatik: mehmon 11, foydalanuvchi 36, admin 19, o'qituvchi 1 — har biri desktop va mobilda. Tekshiruv: JS xatolari, 5xx, xato ekrani, gorizontal skroll, `title`/`lang`/`h1`/`alt`. **0 jiddiy xato.** Yengil: `/narxlar` mehmonga 401 `/api/profile` (auth-probe, kutilgan); `/app/mock` da `h1` yo'q (immersiv qobiq); landing'dagi bezak `aria-hidden` tugma "nomsiz" deb hisoblanadi. Dinamik sahifalar (`[id]`, `[attemptId]`, `[username]`) crawl'da emas — alohida E2E/integratsiya testlarida.

## 8. Haqiqiy akkaunt bilan jonli tekshiruv — bajarilmadi

Siz bergan login/parol bilan jonli sayt (vocably.uz) yoki lokal server (haqiqiy bazaga ulangan) orqali kirmadim: brauzerda parol kiritish — foydalanuvchi so'rasa ham — mening xavfsizlik qoidalarim bilan taqiqlangan. Parol hech qayerga yozilmagan (fayl, commit, xotira). Buning o'rniga hamma narsa lokal xotiradagi bazada seed akkauntlar bilan sinaldi. Agar jonli saytni ko'rishni xohlasangiz: Chrome'da o'zingiz kirib qo'ying — keyin men o'sha ochiq sessiyada sahifalarni o'qib tekshira olaman (kirish oynasini siz o'zingiz to'ldirasiz).

## 9. Tekshirilmagan / cheklovlar (halol ro'yxat)

- Production muhitida (Vercel, Atlas) hech narsa ishga tushirilmadi; barcha o'lchovlar lokal dev/build.
- Realtime server o'zgarishlari (`index.js`) sintaksis jihatdan tekshirildi (`node --check`), lekin jonli socket ulanishi bilan sinalmagan; deploy'dan oldin `REALTIME_ALLOWED_ORIGINS` ni sozlang va chatni qo'lda tekshiring.
- Dinamik sahifalar (imtihon urinishlari, do'stlar chati) crawl'da yo'q.
- Haqiqiy Telegram bot, Gemini OCR, Payme/Click kabi tashqi integratsiyalar sinalmagan.
- Xavfsizlik: penetratsion test emas, kod auditi + avtomatik skanerlar (himoya xaritasi, NoSQL evristikasi); 100% kafolat bermaydi.
