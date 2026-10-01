# Reja: foydalanuvchi so'zlarini `User` hujjatidan alohida kolleksiyaga ko'chirish

**Holat:** REJA — hech narsa bajarilmagan. Production ma'lumotiga tegadi, shuning uchun har bosqich tasdiq talab qiladi.
**Sabab:** so'zlar `User.categories[].words[]` ichida. O'lchandi (`dashboard.perf.integration.test.ts`): boyitilgan so'z ≈ 865 bayt,
20 000 so'z = 17.3 MB > MongoDB 16 MB hujjat chegarasi (yozib bo'lmadi). Hozirgi yumshatish: `MAX_WORDS_PER_USER = 8000`
(`src/lib/vocab/wordCap.ts`). Qo'shimcha muammolar: har so'z o'zgarishi katta hujjatni qayta yozadi; parallel yozuvlar
bir hujjatda raqobatlashadi; hub har so'rovda butun hujjatni yuklaydi.

## 1. Joriy holat (kod o'lchovi)

- `categories`/`words` ga tegadigan joylar: **60 fayl, ~125 murojaat** (`.words` va `categories…words` naqshlari bo'yicha qidiruv).
- Pozitsion operator bilan **yozadigan** 7 fayl (eng xavfli): `server/libraryService.js`, `api/words/add`, `server/words.js`
  (statistika: `categories.$[c].words.$[w].stats.*`), `server/signalService.js`, `api/words/route.js` (o'chirish),
  `api/admin/learning-analytics`, `api/categories`.
- Hujjat-darajasida o'qiydigan/yozadigan: `api/ai/sessions/[id]/confirm-add` (`user.save()`), `lib/exam/attemptServer.ts`
  (`autoAddErrorVocabulary`), `lib/telegramQuiz.js`, `lib/reviewChain.js`, `AppContext.jsx` (klient butun `categories` ni kutadi).
- Tavan va hisoblash: `server/wordCap.js` (`$size` aggregatsiyasi) — ko'chirgach `countDocuments` bo'ladi.
- Mavjud himoya: 1314 test (jumladan so'z/SRS/game/XP integratsiya testlari) — regressiyani ushlaydi, lekin ko'pchiligi
  embedded sxemaga yozilgan; repository qatlami kiritilgach ular ikkala backend'da ham yurishi kerak.

## 2. Maqsadli sxema

Yangi kolleksiya `UserWord` (so'z = alohida hujjat, ~1 KB):

```
{ _id (ESKI word._id saqlanadi!), userId, categoryId, word, syns[], pronunciation, enrichment{…}, stats{…}, createdAt, updatedAt }
indexlar: {userId:1, categoryId:1}, {userId:1, 'stats.nextReview':1}, {userId:1, word:1}
```

- `User.categories[]` **qoladi** (faqat `_id`, `name`) — kategoriya API'si va klient shakli o'zgarmaydi.
- `word._id` ni **qayta ishlatish** shart: `/lugat/soz/[wordId]` havolalari, `ReviewEvent`, `VocabEvent`, mistake notebook
  shu id'larga tayanadi.
- Tavan (`MAX_WORDS_PER_USER`) hujjat o'lchamidan emas, mahsulot/narx qaroridan keladi (8 000 dan oshirish mumkin).

## 3. Bosqichlar (expand → migrate → contract). Har biri alohida deploy va qaytariladigan

**Bosqich 0 — Repository qatlami (xulq o'zgarmaydi).** `server/userWords.js`: `listWords(userId, {categoryId})`,
`addWords`, `deleteWords`, `updateStats(wordId, set)`, `countWords`, `findByIds`. Hozircha embedded'ni o'qiydi/yozadi.
60 fayl shu qatlamga o'tkaziladi. Tekshiruv: mavjud test suiti o'zgarishsiz yashil. *Qaytarish:* oddiy revert.

**Bosqich 1 — Ikki tomonlama yozish (flag: `WORDS_DUAL_WRITE`).** Har yozuv ikkala joyga; o'qish embedded'dan.
Embedded — haqiqat manbai. Yozuv xatosi `UserWord` ga bo'lsa log + metrika (foydalanuvchiga ko'rinmaydi).
*Qaytarish:* flag o'chiriladi.

**Bosqich 2 — Backfill (idempotent skript, `scripts/migrate-user-words.mts`).** Foydalanuvchilarni `_id` kursori bilan
partiyalab: har so'zni `updateOne({_id: word._id}, {$setOnInsert/$set}, {upsert:true})`. Dry-run rejimi birinchi.
Har foydalanuvchi uchun tekshiruv: so'zlar soni va ttarkib xeshi embedded bilan teng. Mos kelmaganlar ro'yxatga olinadi.
*Qaytarish:* `UserWord` ni o'chirish mumkin (embedded daxlsiz).

**Bosqich 3 — O'qishni almashtirish (flag foydalanuvchi/ulush bo'yicha: `WORDS_READ_FROM_COLLECTION`).**
Avval admin/test akkauntlar, so'ng 5% → 25% → 100%. **Parity monitor:** tanlangan so'rovlarda ikkala manbani solishtirish
(soni, `stats` xeshi) va farqni log qilish. *Qaytarish:* flag.

**Bosqich 4 — Embedded yozishni to'xtatish.** Dual-write o'chadi; `User.categories[].words` endi yangilanmaydi.
Bu nuqtadan keyin qaytarish murakkablashadi (embedded eskiradi) — shuning uchun avval kamida 2 hafta 100% va nol parity farq.

**Bosqich 5 — Contract.** `categories[].words` ni `$unset` (zaxira nusxadan keyin), sxemadan olib tashlash, tavan
hisoblashini `countDocuments` ga o'tkazish, `wordCap.ts` ni qayta ko'rib chiqish.

## 4. Xavflar va ularning yechimi

| Xavf | Yechim |
|---|---|
| `word._id` o'zgarsa havolalar/tarix uziladi | backfill'da ESKI `_id` saqlanadi; parity testi `_id` to'plamini ham solishtiradi |
| Atomik `$push`/pozitsion yozuvlar xulqi o'zgaradi | repository metodlari bitta so'zga `updateOne` (hatto atomikroq); ko'p so'zli qo'shish `insertMany` — qisman muvaffaqiyat uchun hammasi-yoki-hech narsa mantig'i (`word_limit` kabi) saqlanadi |
| SRS statistikasi yozuvlari (`server/words.js`) poyga | `updateOne({_id, userId}, {$set: …})` — hujjat bloki yo'qoladi, poyga kamayadi |
| Klient `categories[].words` shaklini kutadi | API javoblari bosqich 3 gacha bir xil shaklda yig'iladi (repository `categories` ni so'zlar bilan to'ldirib beradi) |
| Backfill vaqtida yozuvlar | dual-write (bosqich 1) backfill'dan **oldin** yoqiladi; backfill upsert bo'lgani uchun takrorlash xavfsiz |
| Katta foydalanuvchilar backfill'ni sekinlashtiradi | partiyalash + budget; qayta ishga tushirish mumkin (kursor) |
| Analitika (`learning-analytics`, `AdminVocabAnalytics`) embedded'ga bog'liq | agregatsiyalar `UserWord` ga ko'chiriladi (`$group` oson va tezroq) |

## 5. Tekshirish rejasi

1. Bosqich 0: mavjud 1314 test yashil + repository uchun birlik testlar.
2. Test suitini **ikkala backend'da** yurgizish (env bilan almashtiriladigan repository) — integratsiya testlari.
3. Parity testi: tasodifiy sintetik foydalanuvchilar (1, 100, 8 000 so'z) — backfill'dan keyin barcha o'qishlar teng.
4. Yuklama o'lchovi: `dashboard.perf` testi 20 000 so'zda ham ishlashi (hozir sig'maydi) — bu migratsiyaning asosiy yutug'i.
5. E2E (`npm run test:e2e`) har bosqichdan keyin.

## 6. Qarorlar (siz belgilaysiz)

1. **Boshlashmi?** Bu bir necha kunlik ish (taxminiy baho, aniq emas: repository qatlami + 60 faylni o'tkazish ~2–3 kun,
   backfill/parity/monitor ~1–2 kun, kuzatuv oynasi esa kalendar vaqti).
2. **Zaxira siyosati:** bosqich 2 va 5 dan oldin `users` kolleksiyasining to'liq nusxasi (mongodump / Atlas snapshot) — kim va qayerga oladi?
3. **Yangi tavan:** migratsiyadan keyin so'z limiti nechaga ko'tariladi (yoki tarif bo'yicha)?
4. **Maintenance oynasi** kerakmi yoki to'liq onlayn (tavsiya: onlayn, dual-write bilan)?

## 7. Men nima qila olaman / qila olmayman

- Qila olaman: bosqich 0 (xulq o'zgarmaydigan refaktor, testlar bilan), bosqich 1, backfill skripti (dry-run bilan), parity monitor.
- Qila olmayman: production bazasiga ulanish, snapshot olish, flag'larni production'da yoqish va 100% ga ko'tarish — bular sizning
  muhitingizda sizning nazoratingizda bajariladi.
