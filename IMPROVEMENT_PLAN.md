# Vocably.uz — Takomillashtirish rejasi

Manba: `AUDIT_REPORT.md` va `SECURITY_AUDIT.md`dagi topilmalar. Prioritet TZning §28 sxemasi bo'yicha (P0-P4).

## P0 — Xavfsizlik / data loss / buzilgan asosiy funksionallik

Bu auditda P0 darajasidagi (darhol, ilova buzilgan yoki faol ekspluatatsiya qilinayotgan) muammo **topilmadi**. Eng yaqin nomzodlar (JWT/localStorage, words full-array overwrite) P1ga joylashtirilgan, chunki ular real, lekin **shart** (XSS yoki ikki-tab poyga holati) bajarilishini talab qiladi, hozirda faol ekspluatatsiya belgisi yo'q.

## P1 — Autentifikatsiya / test dvigateli / admin / baholash

| ID | Ish | Fayl | Holat |
|---|---|---|---|
| SEC-01 | Register/reset-init tezlik cheklovi | `auth/register-init`, `auth/reset-init` | ✅ Bajarildi (bu sessiya) |
| SEC-02 | `admin/bootstrap` brute-force himoyasi | `admin/bootstrap/route.js` | ✅ Qisman bajarildi (tezlik cheklovi); to'liq "bir martalik" qilish — mahsulot qarori kutilmoqda |
| SEC-03 | JWT'ni `localStorage`dan olib tashlash, faqat httpOnly cookie | `src/context/AppContext.jsx` + ~100 fetch joyi | ❌ Ochiq — alohida, brauzerda bosqichma-bosqich sinaladigan sessiya kerak |
| B3 (eski) | `POST /api/words` to'liq massiv almashtirish poyga holati | `src/app/api/words/route.js` | ❌ Ochiq — kategoriya/so'z CRUD'ini targeted-update'ga o'tkazish kerak |

**B3 uchun tavsiya etilgan yondashuv** (implementatsiya qilinmadi, faqat reja): `POST /api/words`ni ikkiga bo'lish — `POST /api/categories` (yangi kategoriya, allaqachon mavjud, hozir ishlatilmayapti) va so'z qo'shish uchun mavjud `POST /api/words/add` ($push)ni asosiy yo'l qilish. `AppContext.jsx#syncData`ni ikkala aniq chaqiruvga almashtirish. Risk: `handleAddCategory`/`handleAddWord` chaqiruvchilarini diqqat bilan tekshirish kerak — ozgina joy o'zgaradi, lekin fayl ko'p joydan chaqiriladi.

## P2 — Katta UX/UI, responsive, performance

| ID | Ish | Fayl | Holat |
|---|---|---|---|
| C1 | Sovuq-start spinner uchun skeleton/timeout+retry | `/app`, `/app/oqish`, `/app/mock`, `/app/tinglash` sahifalari | ❌ Ochiq |
| — | Eski `docs/AUDIT_FINDINGS.md`dagi A7/A8/A9/A14 (layout bo'sh joy, flashcard muvozanati, sidebar guruhlanishi, kategoriya qidiruvi) | turli lug'at komponentlari | ❌ Ochiq (eski audit, qayta tasdiqlanmagan) |

**C1 uchun tavsiya etilgan yondashuv**: Har bir og'ir sahifa (`/app/oqish`, `/app/tinglash`, `/app/mock`, `/app/yozish`, `/app/gapirish` va asosiy `/app`) uchun `loading.jsx` (Next.js App Router konventsiyasi) qo'shish — hozir umumiy spinner ko'rinadi, lekin 5 soniyadan keyin "Internet aloqasini tekshiring" + qayta urinish tugmasi ko'rsatadigan mantiq yo'q. Bu kichik, izolyatsiyalangan, xavfsiz o'zgarish — mavjud sahifa mantig'iga tegmaydi, faqat kutish holatini yaxshilaydi.

## P3 — SEO, accessibility, kod sifati

| ID | Ish | Holat |
|---|---|---|
| Eski B15 | Modallarda focus-trap yo'q (`ConfirmModal.jsx`, `AllChatSessionsModal.jsx`) | ❌ Ochiq, qayta tasdiqlanmagan |
| Eski B16 | Sessiya boshlashda hali `alert()` (6 ta lug'at rejimi) | ❌ Ochiq, qayta tasdiqlanmagan |
| G1 | Markazlashgan admin middleware | ❌ Ochiq — arxitektura tavsiyasi |
| — | Lighthouse/Core-Web-Vitals to'liq auditi | ❌ Bajarilmadi (alohida vosita kerak) |

## P4 — Nice-to-have

- `npm audit` yoki Dependabot'ni CI/CD pipeline'ga ulash (bu sessiyada internet cheklovi tufayli to'liq ishlatilmadi).
- E2E test infratuzilmasi (Playwright) — `TEST_PLAN.md`ga qarang.
- Admin `bootstrap` endpointini "birinchi admindan keyin avtomatik o'chirish" qarorini qabul qilish.

---

## Amalga oshirish tartibi (tavsiya)

1. **Darhol** (bu audit allaqachon bajardi): SEC-01, SEC-02 (qisman), SEC-04 — barchasi kichik, izolyatsiyalangan, mavjud `checkRateLimit` infratuzilmasidan foydalanadi, regressiya xavfi minimal (lint/typecheck/test/build barchasi toza o'tdi).
2. **Keyingi sessiya, alohida rejalashtirilgan**: SEC-03 (JWT/localStorage) — bosqichma-bosqich, real brauzer bilan har bir qadamdan keyin login/logout/himoyalangan-sahifa sinovi.
3. **Kichik, xavfsiz UI ishi**: C1 (loading skeleton/retry).
4. **O'rta hajmli refaktoring, alohida sessiya**: B3 (words route).
5. **Mahsulot qarori kerak, keyin implementatsiya**: `admin/bootstrap`ni bir martalikka aylantirish.
6. **Qayta-audit**: eski `docs/AUDIT_FINDINGS.md`dagi ochiq A/B topilmalarni joriy kodga nisbatan qayta tekshirish (ular 2026-08-09da yozilgan, kod o'shandan beri sezilarli o'zgargan).
