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
| 4 | Writing word upgrades → SRS in one click (exam grader) | 6.6.1 | ⏳ |
| 5 | SRS review session: Recognition / Production / Mixed modes | 6.3.3 | ⏳ |
| 6 | Flagship games without login: Vocably Run (3-lane runner), Gapir yoki yiqil | 7 | ⏳ |
| 7 | 9:16 result card (download/share) | 7 | ⏳ |
| 8 | Streak: ≥1 plan task = streak, 1 free freeze per week | 6.8.2 | ⏳ |
| 9 | Telegram Login Widget + reminder at a user-chosen time, max 2 messages per day | 6.10 | ⏳ |
| 10 | 7-day trial (setting), 14-day refund request, 3-month plan | 10 | ⏳ |
| 11 | Admin: landing→onboarding→signup→payment funnel | 6.12.3 | ⏳ |

## Notes on what's done
- Step 3: `src/lib/todayPlan.js` (rules) + `src/lib/plan/server.js` (storage, signals, XP) + `DailyPlan` model,
  `GET /api/plan/today`, `POST /api/plan/tasks/:key/complete`. The old `studyPlan.js` was removed (one engine).
  The plan is built at the start of the local day (00:00) on the first read, so no cron is needed. XP is paid once per task (XpEvent idempotency).
  Not done yet: the weekly report (TZ §6.2.4, Premium) and the band forecast in the plan card.

## Should/Could (after the MVP)
Voice tutor, R/L hint mode, pause map, leagues/duel, SEO tools (CEFR converter, topic generators, university requirements, vocab test),
Telegram Mini App, guarantee, referral/creator codes, per-plan AI limits (open question: AI cost), Google/SMS login.

## Open questions (from the TZ)
- AI provider costs → finalize the per-plan limits.
- Passwordless login: the current phone+password+Telegram verification stays for now; Telegram Login Widget is added alongside it.
