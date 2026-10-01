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
| Games (12: word match, memory, MC, listen-choose, listen-type, word drop, fill-gap, sentence builder, definition, synonym/antonym, speed, boss) | Done | `games.ts`, `/api/games/*`, `components/games` |
| XP, levels (20), ledger, daily cap | Done | `xp.ts`, `config.ts`, `server/ledger.js` |
| Streak + freezes | Done | `streak.ts`; hooked into `/api/words/review` and game completion |
| Daily/weekly quests, achievements | Done | `quests.ts`, `achievements.ts`, `server/questService.js` |
| Leaderboard (week/month/all, own rank) | Done | `/api/gamification/leaderboard` |
| Daily plan & personalization | Done | `dailyPlan.ts`, `/api/vocabulary/plan` |
| Skill integrations | Done: Writing, Speaking (matndagi so'zlar), Reading, Listening (to'g'ri javob berilgan savoldagi so'zlar — faqat ijobiy signal), Mock (`recommendFromMock` + `POST /api/vocabulary/signal`) | `signalService.js` (`recordTextUsage`, `recordAttemptUsage`), `recommendations.ts`. Reading matnidagi interaktiv so'z-popup UI hali yo'q |
| AI: coach (rule-based), story, exercises | Done | `ai.ts`, `server/aiService.js`, `/api/vocabulary/{coach,story,exercises}` — story/exercises are Premium, rate-limited, daily quota 30, always `AI_GENERATED` |
| Onboarding diagnostic | Done (A2–C1 bank, 24 words) | `diagnostic.ts`, `/api/vocabulary/diagnostic`, `DiagnosticCard` |
| Search & filters | Done for the user's own words | `search.ts`, `/api/vocabulary/search` |
| Admin analytics | Done | `/api/admin/vocab-analytics`, `/admin/vocab` |
| Analytics events, privacy (aggregate only, TTL 180d) | Done | `events.ts`, `VocabEvent` |
| Feature flag / rollout, tier gating | Done | `access.ts` |
| Accessibility | Done in new UI (roles, focus, `aria-*`, 44px targets, `motion-safe`) | |
| Global vocabulary library, admin CRUD, CSV import/export, review workflow (DRAFT/AI_GENERATED→UNDER_REVIEW→APPROVED→PUBLISHED→ARCHIVED), versioning | Done | `library.ts` (sof mantiq + testlar), `server/libraryService.js`, model `VocabularyEntry`, `/api/admin/vocab-library/*` (+audit log), `/api/vocabulary/library` (nashr qilinganlarni qidirish + o'z lug'atiga qo'shish), UI: `/admin/vocab-library`, `/app/lugat/kutubxona`. AI kontent `verifiedByAdmin` bo'lmaguncha PUBLISHED bo'lmaydi; tahrir versiyani oshiradi (oxirgi 20 snapshot); nashr qilingan yozuvni o'chirib bo'lmaydi (avval arxivlash) |
| Content-factory (PDF/DOCX → AI extraction → review) | **Not done** | Mavjud book pipeline'dan `importEntries({items}, adminId, {aiGenerated:true})` orqali `AI_GENERATED` holatida kutubxonaga kiritish mumkin |
| Reminders (TZ §55) | Done | `reminders.ts` (qaror mantiqi), `server/reminderService.js`, cron `GET /api/internal/vocab/reminders` (vercel.json, 15:00 UTC = 20:00 Toshkent, `CRON_SECRET`), `GET/PATCH /api/vocabulary/reminders`, UI: `ReminderSettings` (O'yinlar sahifasi). Ilova ichidagi bildirishnoma + web push; kuniga ≤1 ta, bugun o'qigan/o'chirgan foydalanuvchiga yuborilmaydi, chastota: har kuni / 2 kunda / haftada. Telegram kunlik mini-test alohida (`/api/internal/telegram/daily`) |
| Structured monitoring dashboards | Partial | errors go through `serverError`; events in `VocabEvent` |

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

## Third-party repository evaluation (TZ §56–57)

No code was copied from external projects (Vocamon, WordSoul, WordDrop, LexiLearn, WordForge, ISTS). Their licenses were **not
verified** in this environment, so the engine was implemented from scratch following the TZ. If reuse is considered later,
check each repo's license first (MIT/Apache-2.0 allow reuse with attribution; GPL/AGPL/no-license do not fit a closed SaaS).

## Known gaps / next steps

* Reading matnida interaktiv so'z (bosilganda ta'rif/qo'shish) UI — `word_added_from_reading` hodisasi va signal API tayyor.
* Content-factory: PDF/DOCX → AI → `AI_GENERATED` yozuvlar (kutubxona import API tayyor).
