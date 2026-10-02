# B2 (offline takrorlash) va B1 (ruscha interfeys) — amalga oshirish rejasi

Kodni o'qib tuzilgan reja (2026-10-02). Ikkalasi ham bir necha kunlik emas, haftalik ish — shuning uchun avtonom bir yo'la emas, bosqichma-bosqich.

## Holat (2026-10-02)

- **B2 — TAYYOR.** `POST /api/words/review/batch`, IndexedDB navbati, "Offline takrorlash" kartasi (Mashq sahifasi). Qaror: offline javoblar XP bermaydi.
- **B1 — karkas va birinchi yuzalar tayyor.** `src/lib/i18n` (uz asos + ru), `LocaleProvider`, til tanlash (Sozlamalar va kirish sahifasi).
  Tarjima qilingan: kirish/ro'yxat/parol tiklash, Mashq, Offline karta, AI hikoya kartasi, Sozlamalar. Ruscha matnlar AI tomonidan yozilgan (vaqtincha, vaqt o'tib ona tilida so'zlashuvchi ko'rib chiqsin).
- **Keyingi bosqich (hali qilinmagan): o'yinlar markazi, dashboard, lug'at, imtihon, landing.** Asosiy to'siq — **serverdan keladigan matnlar**
  (daraja nomlari, o'yin/vazifa/yutuq sarlavhalari va tavsiflari, kunlik reja sabablari, murabbiy xabarlari, API xato xabarlari): ular konfiguratsiya fayllarida o'zbekcha.
  To'g'ri yo'l: (1) har bir server matniga barqaror **kalit** berish (`games.multiple_choice.title`), API kalitni (+ o'zgaruvchilarni) qaytaradi yoki mijoz `key` bo'yicha `t()` qiladi;
  (2) raqamli shablonlar (`"{n} ta so'z"`) uchun ruscha ko'plik shakllari (`Intl.PluralRules('ru')`) — hozirgi oddiy `{n}` almashtirish yetarli emas;
  (3) API xato xabarlarini `code` + mijozda tarjima. Tavsiya: avval `/api/games` va `/api/gamification/profile` kalitlarga o'tkaziladi (eng ko'p ko'rinadigan), keyin qolganlari.
  Shu vaqtgacha `t()` ishlatilmagan joylar o'zbekcha qoladi (aralash til; Sozlamalarda ogohlantirish bor: `lang.hint`).

## B2. Offline-first takrorlash

**Hozirgi holat.** `public/sw.js` faqat app-shell keshlaydi (HTML network-first, `/_next/static` cache-first); `/api/*` ataylab SW'dan o'tmaydi.
`src/lib/offlineQueue.js` bor, lekin faqat o'yin javoblari (`GamePlayer.jsx`) va chat uchun. Takrorlash (`POST /api/words/review`) offline ishlamaydi.

**Xavf (nega shoshilmaslik kerak).** Offline javoblar keyin yuboriladi → server vaqt/tartibga ishonolmaydi. `words/review` hozir XP suiiste'moliga qarshi
(`REVIEW_XP_COOLDOWN_MS=20 s`, `REVIEW_XP_DAILY_CAP=400`, 90/daq limit) himoyalangan. Offline navbat bu himoyani aylanib o'tmasligi shart.

**Bosqichlar.**
1. *Navbatni oldindan yuklash:* `GET /api/vocabulary/due?limit=50` → IndexedDB (`dueQueue`), foydalanuvchi ID bilan kalitlanadi, logout'da tozalanadi (`AppContext.logout` allaqachon `caches` tozalaydi — IndexedDB ham qo'shiladi).
2. *Offline takrorlash UI:* faqat "so'zni ko'rsat → bilaman/bilmayman" (o'yin emas); natija lokal `pendingReviews[]` ga `{wordId, correct, clientTs, clientSeq}`.
3. *Sinxron:* yangi `POST /api/words/review/batch` — har yozuv uchun serverda mavjud cheklar; **offline javoblar XP bermaydi** (faqat SRS holatini yangilaydi) — suiiste'mol yuzasi yo'q; `clientTs` faqat tartib uchun, server vaqtiga ishonmaydi; batch ≤ 100, idempotency kaliti `userId:wordId:clientSeq`.
4. *Background Sync:* `sync` hodisasi (Chromium) + `online` hodisasida zaxira (Safari'da Background Sync yo'q).
5. *Testlar:* `fake-indexeddb` bilan birlik; Playwright `context.setOffline(true)` bilan E2E; batch route uchun integratsiya (idempotentlik, limit, begona wordId).

**Hajm:** ~1–2 hafta. **Ochiq savol (mahsulot):** offline takrorlash XP berishi kerakmi? Tavsiya: yo'q (yuqoridagi sabab).

## B1. Ruscha interfeys

**Hozirgi holat.** Barcha matnlar JSX ichida o'zbekcha satrlar (markaziy i18n yo'q); ma'lumot modelida `translationRu` bor.

**Bosqichlar.**
1. *i18n qatlami:* yengil `t(key)` + `useLocale` (cookie `vocably_lang`), kutubxonasiz (bundle'ni o'stirmaydi); o'zbekcha asos til.
2. *Matnlarni ajratish:* eng ko'p ko'riladigan yuzalar birinchi — landing, auth, `/app` qobig'i, o'yinlar markazi, profil/Sozlamalar (~400–600 satr). Qolganlari `uz` ga zaxira bo'ladi (aralash til bo'lmasligi uchun sahifa-sahifa yoqiladi).
3. *Tarjima sifati:* **ona tilida so'zlovchi ko'rib chiqishi shart** (mashina tarjimasi IELTS atamalari/ohang uchun yetarli emas). Men qoralama bera olaman, lekin tasdiqlash sizda.
4. *Til tanlash:* Sozlamalar → "Til"; `<html lang>` va metadata mos o'zgaradi; SEO sahifalar (`/lugat`, `/ielts`, `/blog`) alohida qaror (hreflang).
5. *So'z kartalarida* `translationRu` ni tanlangan tilga qarab ko'rsatish.
6. *Test:* kalit to'liqligi (har `uz` kalitning `ru` si bor), E2E til almashtirish.

**Hajm:** ~2–3 hafta (kodning o'zi 1 hafta; qolgani tarjima ko'rib chiqish).
