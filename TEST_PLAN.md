# Vocably.uz — Test rejasi

## Joriy holat

- **Vitest**: 14 fayl, 183 test — sof mantiq (SRS, scoring, sanitize, contentValidator, autopilotGuards, analytics, wordCount, dsl-parser). `npm run test` bilan ishga tushadi, 4s ichida tugaydi.
- **E2E**: yo'q. Playwright yoki shunga o'xshash o'rnatilmagan (tarmoq cheklovi tufayli oldingi sessiyalarda qo'shib bo'lmagan).
- **Lint/type-check/build**: barchasi CI-ga tayyor (`npm run lint`, `npm run type-check`, `npm run build`), bu sessiyada barchasi toza o'tdi.

## Eng muhim E2E oqimlar (TZning §25 talabi bo'yicha, hali qurilmagan)

Quyidagi ikkita oqim eng yuqori prioritet — mavjud emas, lekin qurilishi kerak (Playwright tavsiya etiladi, chunki Next.js App Router bilan yaxshi ishlaydi):

### 1. Foydalanuvchi oqimi
```
REGISTER (telefon+parol kiritish, Telegram deep-link ko'rsatilishi)
→ [Telegram mock/stub kerak — real botga bog'lanmasdan sinash uchun]
→ LOGIN
→ DASHBOARD (bosh sahifa yuklanishi, XP/streak ko'rinishi)
→ START READING (test tanlash, attempt yaratish)
→ ANSWER (kamida 3-4 xil savol turi bilan)
→ SUBMIT
→ RESULT (band ko'rsatilishi, server-hisoblangan ekanligi)
```
**Blokator**: Telegram OTP oqimi real botga bog'liq — E2E uchun `OtpSession`ni to'g'ridan-to'g'ri DB orqali yaratib/tasdiqlab, Telegram qadamini aylanib o'tish kerak (test-only backdoor, faqat `NODE_ENV=test`da faol).

### 2. Admin oqimi
```
ADMIN LOGIN
→ CREATE MATERIAL (JSON/DSL orqali Reading testi yaratish)
→ VALIDATE (contentValidator xatolarni to'g'ri ushlashini tekshirish — masalan qasddan noto'g'ri raqamlash bilan)
→ SAVE (draft sifatida)
→ PUBLISH (validatsiyadan qayta o'tishi)
→ USER SEES MATERIAL (yangi test `/app/oqish` test-tanlash ro'yxatida ko'rinishi)
```

## Qo'shimcha kerakli test qamrovi

| Soha | Nima yetishmayapti |
|---|---|
| Auth | `register-init`/`reset-init` uchun yangi tezlik-cheklov mantig'ining integratsion testi yo'q (hozir faqat qo'lda tasdiqlangan — `checkRateLimit` o'zi boshqa joyda test qilingan, lekin bu ikki route uchun maxsus test yo'q). |
| IDOR | Ikki-hisobli test: hisob A hisob B'ning exam-attempt ID'sini so'rasa 404 qaytarishini tasdiqlaydigan integratsion test yo'q (kod darajasida to'g'ri, lekin regressiyaga qarshi test yo'q). |
| Admin | `requireAdminUser()`siz chaqirilgan `/api/admin/*` route 403/401 qaytarishini tekshiruvchi "har bir admin route himoyalangan" umumiy smoke-test yo'q — kelajakda yangi route qo'shilganda buni avtomatik ushlaydi. |
| Scoring | Server va (agar mavjud bo'lsa) frontend hisob-kitobi orasidagi moslik testi — hozir faqat server tomoni test qilingan (frontend hech qanday hisob-kitob qilmasligi tasdiqlangan kod-o'qish orqali, test bilan emas). |

## Tavsiya etilgan qadamlar

1. Playwright'ni qo'shish (`npm install -D @playwright/test`) — internet mavjud muhitda.
2. Test-only OTP backdoor qo'shish (`NODE_ENV==='test'` gated, productionda hech qachon faol bo'lmaydi) — Telegram-bog'liqlikni E2E'dan chiqarish uchun.
3. Yuqoridagi ikkita asosiy oqimni yozish, CI'da (agar CI mavjud bo'lsa) har bir PR'da ishga tushirish.
4. "Har bir admin route himoyalangan" smoke-testini qo'shish — bu arzon (barcha `route.js` fayllarini glob qilib, `requireAdminUser`ni import qilishini statik tekshirish mumkin, hatto to'liq E2E bo'lmasa ham) va G1 (markazlashgan middleware yo'qligi) xavfini kompensatsiya qiladi.
5. Ikki-hisobli IDOR regressiya testini qo'shish (exam attempts uchun).
