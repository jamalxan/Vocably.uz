# Vocabulary Engine — implementation guide

Implements `Vocably_Gamified_Vocabulary_Engine_TZ.md`. This file maps the TZ to code, lists flags/env, and records
what is intentionally **not** done yet.

## Architecture

| Layer | Path | Notes |
|---|---|---|
| Pure domain logic (no I/O, fully unit-tested) | `src/lib/vocab/*.ts` | mastery, SRS-aware weakness, XP/levels, streak+freeze, games (question generation), answer validation, selection, anti-cheat, quests, achievements, daily plan, recommendations, AI prompts/validators, diagnostic, search |
| Server services (Mongo) | `src/lib/vocab/server/*.js` | session lifecycle, XP ledger, quests, profile, analytics, skill signals, AI service |
| API routes | `src/app/api/{games,gamification,vocabulary,admin/vocab-analytics}` | all behind `requireVocabUser` (auth + feature flag) |
| UI | `src/components/games/*`, `src/app/app/(main)/oyinlar`, `lugat/zaif-sozlar`, `src/components/dashboard/GamesCard.jsx`, `src/components/admin/AdminVocabAnalytics.jsx` | |

Key guarantees

* **Server-authoritative**: the client never receives answers (except the memory-pairs map, which is the puzzle itself);
  answers are validated server-side, batched and idempotent per `(qid, attempt)`.
* **Idempotent rewards**: completion is finalized once (`finalize` flags); XP goes through the `XpEvent` ledger with a unique
  `idempotencyKey`; quest progress is keyed by `appliedSources`.
* **Anti-cheat**: minimum plausible response time, elapsed-vs-reported mismatch, bot-like variance; daily game XP cap (4000);
  flagged sessions earn reduced/zero XP and show up in admin analytics.
* **Mastery** (`mastery_algorithm_v1`): per-skill evidence (recall/listening/spelling/context/synonym/writing/speaking) +
  speed + repeated success + SRS retention; format-variety caps prevent "mastering" a word with one game type.

## TZ coverage

| TZ area | Status | Where |
|---|---|---|
| Mastery model, statuses, weak-word analysis | Done | `mastery.ts`, `weakness.ts`, `/api/vocabulary/weak` |
| SRS integration (lapses, leech, due) | Done | `srs.ts`, `server/words.js` |
| Games (14: word match, memory, MC, listen-choose, listen-type, word drop, fill-gap, sentence builder, definition, synonym/antonym, speed, boss, image→word, word→image) | Done. Rasm o'yinlari so'zning `enrichment.imageUrl` yoki nashr qilingan kutubxona yozuvidagi `imageUrl` (admin formasida kiritiladi) bilan ishlaydi; kamida 4 ta rasmli so'z kerak | `games.ts`, `/api/games/*`, `components/games` |
| XP, levels (20), ledger, daily cap | Done | `xp.ts`, `config.ts`, `server/ledger.js` |
| Streak + freezes | Done | `streak.ts`; hooked into `/api/words/review` and game completion |
| Daily/weekly quests, achievements | Done | `quests.ts`, `achievements.ts`, `server/questService.js` |
| Leaderboard (week/month/all, own rank) | Done | `/api/gamification/leaderboard` |
| Daily plan & personalization | Done | `dailyPlan.ts`, `/api/vocabulary/plan` |
| Skill integrations | Done: Writing, Speaking (matndagi so'zlar), Reading, Listening (to'g'ri javob berilgan savoldagi so'zlar — faqat ijobiy signal), Mock (`recommendFromMock` + `POST /api/vocabulary/signal`) | `signalService.js` (`recordTextUsage`, `recordAttemptUsage`), `recommendations.ts`. Reading/Listening natija ekranida (imtihon davomida emas) interaktiv so'z-popup: `WordSelectionCatcher` + `WordPopupCard`, `GET /api/vocabulary/reading-index` (belgilash uchun yengil lug'at), `GET /api/vocabulary/lookup` (kutubxona), `wordForms.ts` (shakllar). Lug'at so'zlari CSS Custom Highlight bilan belgilanadi (zaiflari alohida) |
| AI: coach (rule-based), story, exercises | Done | `ai.ts`, `server/aiService.js`, `/api/vocabulary/{coach,story,exercises}` — story/exercises are Premium, rate-limited, daily quota 30, always `AI_GENERATED` |
| Onboarding diagnostic | Done (A2–C1 bank, 24 words) | `diagnostic.ts`, `/api/vocabulary/diagnostic`, `DiagnosticCard` |
| Search & filters | Done for the user's own words | `search.ts`, `/api/vocabulary/search` |
| Admin analytics | Done | `/api/admin/vocab-analytics`, `/admin/vocab` |
| Analytics events, privacy (aggregate only, TTL 180d) | Done | `events.ts`, `VocabEvent` |
| Feature flag / rollout, tier gating | Done | `access.ts` |
| Accessibility | Done in new UI (roles, focus, `aria-*`, 44px targets, `motion-safe`) | |
| Global vocabulary library, admin CRUD, CSV import/export, review workflow (DRAFT/AI_GENERATED→UNDER_REVIEW→APPROVED→PUBLISHED→ARCHIVED), versioning | Done | `library.ts` (sof mantiq + testlar), `server/libraryService.js`, model `VocabularyEntry`, `/api/admin/vocab-library/*` (+audit log), `/api/vocabulary/library` (nashr qilinganlarni qidirish + o'z lug'atiga qo'shish), UI: `/admin/vocab-library`, `/app/lugat/kutubxona`. AI kontent `verifiedByAdmin` bo'lmaguncha PUBLISHED bo'lmaydi; tahrir versiyani oshiradi (oxirgi 20 snapshot); nashr qilingan yozuvni o'chirib bo'lmaydi (avval arxivlash) |
| Content-factory (TZ §29) | Done | `factory.ts` (bo'laklash, nomzod tanlash, AI chiqishini qat'iy tekshirish), `server/factoryService.js`, model `VocabIngestJob`, `/api/admin/vocab-factory/*`, UI `/admin/vocab-factory`. PDF/DOCX/TXT (4 MB gacha) yoki matn -> bo'laklar (~3500 belgi, maks 120) -> har bo'lakda nomzodlar -> AI (`generateJsonWithMeta` zanjiri) -> tekshiruv (so'z nomzodlarda va matnda bor, misolda so'zning o'zi, CEFR to'g'ri) -> `AI_GENERATED` yozuvlar (`verifiedByAdmin=false`, `sourceType='book'`). Navbat bo'laklar holatida (atomik band qilish, 3 urinish, qotib qolganini qayta olish) — Redis/worker shart emas, sahifa yopilsa davom ettiriladi; AI xarajati: `run` daqiqasiga 30 ta, ish 120 bo'lak bilan cheklangan. Skanerlangan PDF (OCR) qo'llab-quvvatlanmaydi |
| Reminders (TZ §55) | Done | `reminders.ts` (qaror mantiqi), `server/reminderService.js`, cron `GET /api/internal/vocab/reminders` (vercel.json, soatiga `0 * * * *`: har foydalanuvchiga o'z mahalliy soatida (8–21, standart 20:00) yuboriladi, `CRON_SECRET`), `GET/PATCH /api/vocabulary/reminders`, UI: `ReminderSettings` (O'yinlar sahifasi). Ilova ichidagi bildirishnoma + web push; kuniga ≤1 ta, bugun o'qigan/o'chirgan foydalanuvchiga yuborilmaydi, chastota: har kuni / 2 kunda / haftada. Telegram kunlik mini-test alohida (`/api/internal/telegram/daily`) |
| CEFR path (TZ §46) | Done | `buildCefrPath` (`recommendations.ts`), profilda `cefrPath`/`ieltsPath`, UI `CefrPathCard` — CEFR va IELTS band alohida ko'rsatiladi |
| Offline/reconnect (TZ §38) | Done (to'liq offline mode emas) | `answerQueue.js` (sessionStorage navbat, idempotent qayta yuborish), `/api/games/[key]/active` sessiyani tiklaydi |
| Monitoring alertlari (TZ §62) | Done (cheklangan) | `health.ts` + cron `/api/internal/vocab/health` (har 6 soat): past tugatish ulushi, shubhali sessiyalar, XP anomaliyasi -> `[vocab-alert]` log. AI xato ulushi, API latency, sekin so'rovlar alertlari yo'q — APM/log drain kerak |

## Configuration

| Env var | Default | Meaning |
|---|---|---|
| `VOCAB_ENGINE_ENABLED` | `true` | kill switch (`false` disables all engine routes for non-admins) |
| `VOCAB_ENGINE_ROLLOUT_PERCENT` | `100` | deterministic per-user bucket rollout |
| `VOCAB_ENGINE_ALLOWLIST` | empty | comma-separated user IDs always enabled |

Tier limits live in `TIER_VOCAB_LIMITS` (`config.ts`): free = 6 game sessions/day, standard = 40, premium = unlimited + AI.

## Rollout plan

1. Deploy with `VOCAB_ENGINE_ENABLED=true`, `VOCAB_ENGINE_ROLLOUT_PERCENT=0`, `VOCAB_ENGINE_ALLOWLIST=<admin ids>`.
2. Verify in `/admin/vocab` (completion/abandon rates, flagged sessions).
3. Raise percent 10 → 50 → 100. Roll back instantly by lowering the percent.
4. Existing users need **no migration**: new `WordStats` fields are optional; mastery is seeded lazily from legacy
   `level/correct/wrong` the first time a word is answered in a game.

## Testing

```
npx vitest run src/lib/vocab            # unit + (if mongod available) DB integration
SKIP_DB_INTEGRATION=1 npx vitest run    # skip the mongodb-memory-server suite
```

`sessions.integration.test.ts` uses `mongodb-memory-server` (downloads a mongod binary on first run) and exercises the real
flow: start → answers (idempotent) → complete → XP ledger → quests → streak/freeze → achievements.

## Acceptance Criteria tekshiruvi (TZ §59)

"Test" — avtomatik test bor; "kod" — faqat kod o'qib tasdiqlangan (avtomatik testi yo'q); "—" — tasdiqlanmagan.

| Band | Holat | Dalil |
|---|---|---|
| User vocabulary state saved | Test | `sessions.integration` "so'z statistikasi yangilanadi: skills, mastery, SRS" |
| SRS due queue works | Kod | `/api/vocabulary/due`, `selection.ts` (`isDue`) |
| Weak words detected | Test | `weakness.test.ts` |
| Mastery updates correctly | Test | `mastery.test.ts`, `sessions.integration` |
| Review history preserved | Kod | `ReviewEvent` (`wordReview.js`) + `GameSession.answers` |
| All P0 games on desktop/mobile | Qisman | E2E: 14 o'yindan 13 tasi desktopda (faqat `vocabulary_boss` yo'q), `multiple_choice` mobilda |
| Game state survives refresh | Test | `sessions.integration` "faol sessiyani qayta tiklash" |
| Answers validated server-side | Test | "klientning 'isCorrect'/'xp' maydonlari e'tiborsiz" |
| Duplicate submissions rejected safely | Test | "takroriy yuborish...", "parallel takroriy yuborish..." |
| XP server-calculated / idempotent | Test | `idempotencyKey` testlari, "complete ikki marta chaqirilsa" |
| Level / streak update | Test | `xp.test.ts`, `streak.test.ts`, "ketma-ket kunlar streak" |
| Achievements unlock once | Test | `engine.test.ts` "faqat yangi yutuqlar" |
| Leaderboard not manipulable | Kod | faqat `XpEvent` ledger'idan agregatsiya (`leaderboard/route.js`) |
| AI content reviewable by admin | Test | `library.integration`, `factory.integration` (AI -> AI_GENERATED, `verifiedByAdmin`) |
| AI endpoints rate-limited | Kod | `aiService.js` (`checkAndIncrementAiRateLimit`, `AI_DAILY_QUOTA`) |
| AI failure fallback | Kod/Test | `aiService.js` `fallback`, `ai.test.ts` |
| AI content has source/version/status | Test | `VocabularyEntry.sourceType/status/contentVersion` |
| Skill signals (Reading/Listening/Writing/Speaking/Mock) | Kod/Test | `signalService.js`, `engine.test.ts` (`recommendFromMock`) |
| No per-question excessive requests | Kod | javoblar batch (`answerQueue.js`, ko'pi bilan 60 ta/so'rov) |
| Heavy jobs async | Kod | factory bo'laklari, reminder/health cron |
| Main dashboard responsive | Qisman (server) | `dashboard.perf.integration.test.ts`: 5k so'zda profil ~195 ms + o'qish ~133 ms, katalog ~57 ms; 10k so'zda ~225/231/100 ms (lokal, mongodb-memory-server; test byudjeti 4 s / 6 s — to'liq suit yuki uchun keng). Brauzerdagi render, tarmoq va ko'p foydalanuvchili yuklama o'lchanmagan |

## Third-party repository evaluation (TZ §56–57)

No code was copied from external projects (Vocamon, WordSoul, WordDrop, LexiLearn, WordForge, ISTS). Their licenses were **not
verified** in this environment, so the engine was implemented from scratch following the TZ. If reuse is considered later,
check each repo's license first (MIT/Apache-2.0 allow reuse with attribution; GPL/AGPL/no-license do not fit a closed SaaS).

## Known gaps / next steps

* **Hajm chegarasi (arxitektura):** foydalanuvchi so'zlari `User` hujjati ichida (`categories[].words[]`). O'lchandi: 20 000 boyitilgan so'z = 17.3 MB > MongoDB 16 MB chegarasi (yozib bo'lmadi); chegara ~19k boyitilgan so'zda (~865 bayt/so'z). Oddiy foydalanuvchida yuzlab so'z — xavf yo'q, lekin ommaviy import/AI fabrika bilan ulkan lug'at yig'adigan foydalanuvchida `User` yozuvi to'satdan xato beradi. **Yumshatildi:** qattiq tavan `MAX_WORDS_PER_USER = 8000` (`wordCap.ts`, chegaradan ~2.4x past) — `POST /api/words/add`, AI `confirm-add`, kutubxonadan qo'shish (`addEntriesToUser`) sig'masa 409 `word_limit` (hammasi yoki hech narsa); imtihon xatosidan avtomatik qo'shish sig'maganini jimgina tashlaydi. Tekshirish-keyin-yozish atomik emas (poyga ~bir necha so'zga oshishi mumkin — zaxira buni qoplaydi). Frontend 409 xabarini ko'rsatishi sinalmagan; `src/app/api` va `src` ichida `$push`/`words.push` qidiruvida boshqa qo'shish yo'li topilmadi (to'liq tekshiruv emas — yangi yo'l qo'shilsa `checkWordRoom` chaqirilishi shart). To'liq yechim hamon so'zlarni alohida kolleksiyaga ko'chirish.

* Content-factory: skanerlangan PDF uchun OCR; 4 MB dan katta fayllar uchun bo'lak-bo'lak yuklash (hozir bo'limlarga bo'lib yuklanadi); fabrika (`vocab_factory_v2`) endi so'z ajratish bilan birga izoh (`detailedDefinition`), ishlatish qaydi, tipik xatolar va register'ni ham yaratadi; mashq generatsiyasi alohida `ai.ts` orqali (admin ko'rib chiqadi), fabrika pipeline'iga hali ulanmagan.
* Reminder: Telegram kanali qo'shildi (opt-in `vocabReminders.telegram`, bot ulangan foydalanuvchiga; bot bloklangan bo'lsa avtomatik o'chadi; Sozlamalar kartasida switch). Haqiqiy Telegram API bilan jonli yuborish sinalmagan (testlarda `sendTelegram` almashtirilgan). Yuborish soati foydalanuvchi vaqt mintaqasida (`vocabReminders.sendHour`, 8–21; cron soatiga ishlaydi, kechiksa 22:59 gacha "yetib oladi"). Eslatma: har soatlik sweep barcha yoqilgan foydalanuvchilarni skanerlaydi (bugun tekshirilganlar og'ir hisobsiz o'tkaziladi); foydalanuvchilar ko'payganda `timezone` bo'yicha prefiltr kerak bo'lishi mumkin. Vercel tarifi soatlik cron'ni qo'llab-quvvatlashi kerak (health cron allaqachon 6 soatda).
* Reading popup: imtihon davomida ataylab o'chirilgan; faqat natija ko'rish ekranida.
* E2E (TZ §58): Playwright qo'shildi (`npm run test:e2e`, `e2e/`): o'yinlar markazi, `multiple_choice` to'liq sessiya, sahifani yangilab sessiyani tiklash — desktop va mobil (Pixel 7). Alohida bo'sh baza kerak: `E2E_MONGODB_URI=mongodb://127.0.0.1:27017/vocably_e2e`. `e2e/all-games.spec.ts` (desktop): `fill_gap`, `listen_type`, `sentence_builder`, `word_match`, `definition_challenge`, `synonym_antonym`, `speed_challenge` to'liq sessiya + free foydalanuvchida pullik o'yin qulfi. Testlar ketma-ket yuradi (`workers: 1`, umumiy test foydalanuvchi). Desktopda 13 o'yin (`memory`, `word_drop`, `listen_choose`, rasm o'yinlari ham). Qoplanmagan: `vocabulary_boss`; mobilda faqat `multiple_choice`; javoblar ataylab ixtiyoriy — XP/mastery to'g'riligi E2E'da emas (integratsiya testlarida); admin sahifalari va reading popup E2E'da yo'q. Bu yugurish topgan xato: hub'da mavjud bo'lmagan `Images` ikonkasi (tuzatildi).
* Rasm o'yinlari: rasm yuklash/saqlash yo'q — faqat tashqi URL; rasmli so'zlar kutubxonasi admin tomonidan to'ldirilishi kerak.
* Jonli (brauzer) sinov: popup, belgilash va admin sahifalari avtomatik testlarda emas, qo'lda tekshirilishi kerak.

