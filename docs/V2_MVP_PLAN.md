# Vocably 2.0: gap analysis and MVP plan

Source: `docs/ai-prompts/Vocably.uz 2.0 — Texnik topshiriq (TZ).md` (Nov 4, 2026).
The stack stays the same (Next.js 16 + MongoDB). The FastAPI/Postgres in TZ §9 is only a recommendation, and the TZ itself says "if the stack is different, only the layer changes".

## What already exists (no work needed)
SM-2 SRS with 4 ratings, offline review sync, mock UI (highlight, flag, server timer, autosave, 16 question types),
4-criteria Writing/Speaking grading, filler/WPM, mistakes notebook → SRS, XP and badges, streak and streak freeze, 14 games,
Payme/Click, Free/Standard/Premium pricing, teacher panel, AI content approval queue, a 5-word quiz in the Telegram bot, the band calculator.

## MVP (Must) gaps, in work order
| # | Item | TZ | Status |
|---|---|---|---|
| 1 | Game → SRS: correct and <3 s = Easy, correct = Good, slow = Hard, wrong = Again | 7, 6.3.4 | ✅ |
| 2 | Onboarding wizard (7 steps, resumable) + result screen (X days / Y min / Z words + prices) | 6.1 | ✅ |
| 3 | "Today's plan": one engine, plan stored in the DB, task marking, 50% carry-over, XP per task, progress ring | 6.2 | ✅ |
| 4 | Writing word upgrades → SRS in one click (exam grader) | 6.6.1 | ✅ |
| 5 | SRS review session: Recognition / Production / Mixed modes | 6.3.3 | ✅ |
| 6 | Flagship games without login: Vocably Run (3-lane runner), Gapir yoki yiqil | 7 | ✅ |
| 7 | 9:16 result card (download/share) | 7 | ✅ |
| 8 | Streak: ≥1 plan task = streak, 1 free freeze per week | 6.8.2 | ✅ |
| 9 | Telegram Login Widget + reminder at a user-chosen time, max 2 messages per day | 6.10 | ✅ |
| 10 | 7-day trial (setting), 14-day refund request, 3-month plan | 10 | ✅ |
| 11 | Admin: landing→onboarding→signup→payment funnel | 6.12.3 | ✅ |

## Notes on what's done
- Step 3: `src/lib/todayPlan.js` (rules) + `src/lib/plan/server.js` (storage, signals, XP) + `DailyPlan` model,
  `GET /api/plan/today`, `POST /api/plan/tasks/:key/complete`. The old `studyPlan.js` was removed (one engine).
  The plan is built at the start of the local day (00:00) on the first read, so no cron is needed. XP is paid once per task (XpEvent idempotency).
  Not done yet: the weekly report (TZ §6.2.4, Premium) and the band forecast in the plan card.
- Step 4: the exam Writing grader (v1.1) returns `vocabularyUpgrades`; the result card has a "+SRS" button per item and
  "Add all to SRS" (`POST /api/words/upgrades`, system deck "Writing: kuchliroq so'zlar", dedup, word cap).
  The band 7.5 model answer (`improvedVersion`) was generated but not shown before — it is shown now.
- Step 5: `/app/vocabulary/review` has a Recognise / Type / Mixed switcher (`src/lib/reviewModes.js`). Type mode:
  meaning + example with the word blanked → typed answer is checked automatically (one typo on a long word = Hard),
  the result goes into SRS as `mode: typing` (spelling skill). The mode is remembered in localStorage.
- Step 6: `/games/run` and `/games/speak` (public, in the sitemap). Vocably Run: signed in → `vocably_run` in the game catalog,
  questions from the user's own words, every gate graded on the server and written to SRS (by response time), XP/plan like any game;
  guest → 60-word public bank (`src/lib/flagship/runBank.js`), graded on the device, missed words saved after sign-up
  (`POST /api/flagship/run/claim`, bank words only, deck "Vocably Run: xatolar"). 3D: R3F, signs are canvas textures; no WebGL / reduced motion → 2D.
  Gapir yoki yiqil: microphone level on the device (Web Audio VAD), allowed pause 12/8/5/3 s, pause map; fillers via browser
  SpeechRecognition (opt-out; in Chrome this goes to Google — the intro says so). Speaking has no words → no SRS write.
  Also fixed: game questions sent `word`/`explanation`/`wordId` to the client before answering — the answer itself in choice games.
  Not done: a dedicated weekly Run leaderboard (game XP goes into the existing XP leaderboard), the share card (step 7).
- Step 7: `src/lib/flagship/shareCard.js` (pure `cardModel` + canvas `drawCard`, 1080×1920 PNG made in the browser, no upload)
  and `ShareCard.jsx` on both result screens: preview, Download, Share (native share sheet with the image file; on desktop "copy link").
  The card has only the game result and the game URL, no user name. Not done: a video card for "Gapir yoki yiqil" (TZ mentions video) — image for now.
- Step 8: the streak counts "Bugungi reja" tasks (`settleStreak` in `src/lib/plan/server.js`, once per day,
  conditional update). Reviews/games/Telegram quiz no longer bump the streak directly — they call `touchPlan`, which only
  re-evaluates the plan until today is settled. The streak day starts at 00:00 (like the plan). Every ISO week the user
  gets 1 free freeze (`User.freezeWeek`); the old "earn a freeze every 7 days" is gone. The game task is now always in
  the plan, so there is always a quick task. Trade-off: an offline review done on an earlier day no longer back-fills that day.
- Step 9: Telegram Login Widget on /login and /register (`TelegramLoginButton.jsx` → `POST /api/auth/telegram`, JSON only,
  HMAC check in `src/lib/telegramLogin.js`, data older than 1 h refused, IP rate limit). A Telegram id that phone sign-up already
  linked (`telegramChatId`) opens that account; otherwise a new account with phone `tg:<id>` and an unusable password.
  CSP allows `https://telegram.org` scripts and `https://oauth.telegram.org` frames. **Needs @BotFather `/setdomain` → www.vocably.uz**,
  otherwise the widget shows "Bot domain invalid".
  Reminders: two slots a day — the daily plan at the chosen hour (`kind: plan` for users active in the last 7 days, otherwise
  due/streak as before) and a 21:00 streak-at-risk nudge (`decideRiskNudge`). Every proactive bot message (both slots + the daily
  mini-test, now one message instead of two) takes a slot in `src/lib/telegramCap.js` → never more than 2 a day. Every reminder in
  Telegram has a one-tap "🔕 Eslatmalarni o'chirish" (`rm:off`, also stops the mini-test).
  **Hourly trigger:** Vercel Hobby cron is daily only, so `.github/workflows/hourly-reminders.yml` calls the sweep hourly —
  needs the repo secret `CRON_SECRET` (same as on Vercel). Not done: the Sunday weekly report message.
- Step 10: 3-month term (`priceQuarterly`: Standard 176 000, Premium 329 000 = −15%) on /pricing, checkout, Payme/Click/manual
  (`PaymentRequest.months` 1/3/12, labels via `src/lib/billingTerms.js`). Welcome trial can now be in days (3/7/14) — admin
  /admin/settings or bot `/admin trial premium 7d`. **Default is now 7 days Premium (user decision 2026-11-05, was 1 month);
  a setting already saved in /admin/settings still wins over the default.** Refund: "Pulni qaytarish" under a paid request in /app/billing,
  14 days from confirmation, once per account (`src/lib/payments/refund.js`, `POST /api/billing/refunds`); admin "Qaytarish" tab in
  /admin/payments → "Qaytarildi" after sending the money back by hand (Payme/Click have no merchant refund API we can call),
  which takes the paid term off the subscription (nothing left → Free).
- Step 11: "Sotuv voronkasi" on /admin (`SalesFunnel.jsx`, `GET /api/admin/funnel?days=7|30|90`). Landing (/, /start, /pricing,
  /games/run, /games/speak) and onboarding start/finish are anonymous beacons (`FunnelBeacon`, random id in localStorage, no cookie,
  no IP stored; `FunnelHit` one row per day/stage/visitor, 400-day TTL; signed-in visitors and crawlers skipped). Signups come from
  `User.createdAt`, payment = first confirmed payment per account in the period; revenue and refunds shown beside it.
  Period flow, not a per-person cohort (anonymous visitors aren't linked to accounts). Not done: D30 and per-game conversion (TZ §6.12.3).
- E2E: the dev server flakes on first compile; the reliable check is `next build` + `next start -p 3100` + `E2E_REUSE_SERVER=1`.

## Should/Could (after the MVP)
Voice tutor, R/L hint mode, pause map, leagues/duel, SEO tools (CEFR converter, topic generators, university requirements, vocab test),
Telegram Mini App, guarantee, referral/creator codes, per-plan AI limits (open question: AI cost), Google/SMS login.

## Open questions (from the TZ)
- AI provider costs → finalize the per-plan limits.
- Passwordless login: the current phone+password+Telegram verification stays for now; Telegram Login Widget is added alongside it.
