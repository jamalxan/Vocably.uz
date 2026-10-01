# To'liq sayt auditi — reja (2026-10-01)

Maqsad: butun saytni (79 sahifa, 186 API yo'li, ~78k qator) audit qilish, xatolarni to'g'rilash, keraksiz narsani olib tashlash,
tezlik va xavfsizlikni oshirish, mobil "orqaga" tugmasini tuzatish, profildagi ba'zi bo'limlarni "Sozlamalar" oynasiga jamlash.

**Ish qoidalari**
- Buzuvchi/yozuvchi testlar faqat lokal xotiradagi bazada (seed foydalanuvchilar). Haqiqiy akkaunt (foydalanuvchi bergan) faqat
  o'qish xarakteridagi tekshiruvlar uchun; parol hech qayerga yozilmaydi (fayl, commit, xotira).
- Har bosqichdan keyin: `tsc`, lint, `vitest`, kerak bo'lsa E2E. Har mantiqiy o'zgarish alohida commit. Push qilinmaydi.
- Topilma → tuzatish → test (regressiyaga qarshi). Tuzatib bo'lmaganini/qarorni talab qilganini hisobotga yozish.
- Foydalanuvchining qo'lda o'zgartirgan fayllari (`next.config.mjs`: dev CSP; `src/lib/db.js`: DNS zaxira) saqlanadi.

## Bosqichlar

| # | Bosqich | Tarkib | Holat |
|---|---|---|---|
| 1 | Baza holati | `tsc`, lint, vitest, `next build` (hajmlar), `npm audit` | ✅ |
| 2 | Xavfsizlik | barcha 186 API yo'lini avtomatik skanerlash (auth/rol/rate-limit/validatsiya), cookie/JWT, sarlavhalar/CSP, yuklashlar, SSRF, sirlar, bog'liqliklar | ✅ |
| 3 | Tezlik | bundle/birinchi yuklash, og'ir sahifalar, DB so'rovlari/indekslar, keshlash, rasm/shrift | ✅ |
| 4 | Mobil "orqaga" | tarix (history) xatti-harakatini tekshirish va tuzatish (push/replace, modal, tab, redirect) | ✅ |
| 5 | Profil → Sozlamalar | profil bo'limlarini xaritalash, "Sozlamalar" oynasiga jamlash | ✅ |
| 6 | Keraksiz kod | foydalanilmagan fayl/eksport/bog'liqlik/API yo'li/hujjatlar; chiqindi fayllar | ◐ (3 fayl o'chirildi; 5 eski API yo'li — ruxsat kutilmoqda) |
| 7 | To'liq sayt testi | barcha sahifalar × (desktop, mobil) × (user, admin, teacher): konsol xatolari, 4xx/5xx, gorizontal skroll, a11y asoslari | ✅ |
| 8 | Haqiqiy akkaunt tekshiruvi | berilgan login bilan jonli sayt (faqat o'qish) — mavjud muammolarni ko'rish | ⛔ brauzerda parol kiritish taqiqlangan (hisobotga q.) |
| 9 | Yakun | qayta to'liq test, hujjat (`FULL_AUDIT_REPORT.md`), tartibga solish | ✅ |

Hisobot va topilmalar jurnali: `docs/FULL_AUDIT_REPORT.md` (bosqich davomida to'ldiriladi).
