# API Inventory — Vocably

Generated during FAZA 0 audit (2026-08-09) by reading every file under `src/app/api/`. This is the ground truth — `README.md` in the repo root lists an `ai/ocr/route.js` endpoint that **does not exist** in the current code; do not trust the README for routing info (see `AUDIT_FINDINGS.md`).

All endpoints are Next.js App Router route handlers (`route.js`), running as Vercel serverless functions. Auth (except where noted) is via `Authorization: Bearer <JWT>` header, checked with `getUserIdFromRequest()` (`src/lib/auth.js`), which verifies against `JWT_SECRET`.

## Auth (`src/app/api/auth/`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | none | Phone + password login. Returns `{ token, name, phone }`. |
| POST | `/api/auth/register-init` | none | Starts registration: creates an `OtpSession` (`purpose: 'register'`), returns a Telegram deep link the user must open to verify their phone. |
| POST | `/api/auth/reset-init` | none | Starts password reset: creates an `OtpSession` (`purpose: 'reset'`) for an existing user, returns a Telegram deep link. |
| POST | `/api/auth/verify-code` | none | Verifies the 6-digit code sent via Telegram. On success for `register`: creates the `User` (seeded with a default "Words 1" category) and returns a JWT. On success for `reset`: marks the session `verified` so `reset-password` can be called. |
| POST | `/api/auth/reset-password` | none (gated by a verified `sessionToken`) | Sets a new bcrypt-hashed password for the user tied to a `verified` reset `OtpSession`. |
| GET | `/api/auth/session-status?token=` | none | Polled by the frontend (every 2.5s) while waiting for the user to confirm in Telegram. Returns `{ status }` (`awaiting_telegram` \| `code_sent` \| `expired`). |

## Telegram (`src/app/api/telegram/`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/telegram/webhook` | `X-Telegram-Bot-Api-Secret-Token` header must match `TELEGRAM_WEBHOOK_SECRET` | Receives all Telegram bot updates. Handles `/start <sessionToken>` (asks for contact) and contact-share messages (matches phone, sends the 6-digit code). This **is** the OTP delivery mechanism — there is no SMS provider. |
| GET | `/api/telegram/setup?secret=` | `secret` query param must match `ADMIN_SETUP_SECRET` | One-time/manual endpoint to register the Telegram webhook URL with Telegram's servers. Not used at runtime by the app itself. |

## Categories (`src/app/api/categories/`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/categories` | JWT | Creates a new empty category (`{ name, words: [] }`), pushed directly, **no duplicate-name check**. **Appears unused by the current frontend** — `AppContext.handleAddCategory` creates categories via the `POST /api/words` full-array-replace endpoint instead (see below). Confirm before deleting in a later phase. |
| PATCH | `/api/categories` | JWT | Renames a category by `categoryId` via a targeted `$set`. |
| DELETE | `/api/categories` | JWT | Deletes a category by `categoryId` via `user.categories.pull()`. Refuses if it's the user's last category. |

## Words / categories bulk (`src/app/api/words/`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/words` | JWT | Main "load everything" endpoint, called once on app boot (`AppContext.fetchUserData`) and again after most mutations (`refreshCategories`). Returns `{ categories, chatHistory, chatSessions, reviewStreak, lastReviewDate }` — the **entire** categories tree (all words, all stats) in one payload. Also runs a one-time lazy migration (`migrateChatHistoryIfNeeded`). |
| POST | `/api/words` | JWT | **Overwrites the entire `categories` array** (`User.findByIdAndUpdate(userId, { categories })`) — no per-item diffing, no optimistic-concurrency check. Used by `AppContext.syncData`, which is called from `handleAddCategory` and `handleAddWord`. This is the actual category-creation path the UI uses (not `POST /api/categories`). See `AUDIT_FINDINGS.md` for the correctness/race-condition risk this creates. |
| DELETE | `/api/words` | JWT | Targeted delete: `$pull`s specific `wordIds` out of one category's `words` array. Used by `WordTable`'s bulk/single delete. |
| POST | `/api/words/add` | JWT | Targeted `$push` of new words into one category (`$each`). Used by `AppContext.restoreWords` (the "undo delete" flow) — **not** used for normal word-adding, which goes through the full-array `POST /api/words` instead. |
| PATCH | `/api/words/review` | JWT | Records one review outcome for a single word: bumps `stats.level`/`correct`/`wrong`/`nextReview` using a fixed interval table (`[0,1,3,7,14,30]` days by level), and updates the user's daily `reviewStreak` (UTC-date based, see `AUDIT_FINDINGS.md`). This **is** the entire SRS write path today — there is no `user_word_state`/`review_events`/`ease` model as the spec's FAZA 4 assumes. |

## AI chat (`src/app/api/ai/`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/ai/chat` | JWT | Main chat endpoint. Streams plain text (not SSE — a raw `ReadableStream` of UTF-8 chunks) to the client. Runs a provider fallback chain: **Groq → OpenRouter (text) → Gemini** for text, or **OpenRouter (vision) → Gemini** when images are attached (Groq has no free vision model). Supports tool-calling (`list_categories`, `create_category`, `add_words` — see `src/lib/aiTools.js`) so the model can create categories and stage word-adds. A pending word-add is embedded in the stream via a `[[PENDING_ADD_WORDS]]...[[/PENDING_ADD_WORDS]]` sentinel and requires explicit user confirmation through `confirm-add` below. |
| GET | `/api/ai/sessions` | JWT | Lists the user's chat sessions (id, title, updatedAt, message count) for the sidebar. |
| DELETE | `/api/ai/sessions` | JWT | Deletes **all** chat sessions for the user. |
| GET | `/api/ai/sessions/[id]` | JWT | Loads one session's full message history. |
| PATCH | `/api/ai/sessions/[id]` | JWT | Renames a session (`title`). |
| DELETE | `/api/ai/sessions/[id]` | JWT | Deletes one session. |
| POST | `/api/ai/sessions/[id]/confirm-add` | JWT | The only place that actually writes AI-staged words into `category.words` — requires the category to already exist (created via the `create_category` tool call, which commits immediately, unlike `add_words`). |

**No** `/api/ai/ocr` route exists despite the README describing one; image-based word extraction is handled inline by `/api/ai/chat` (the model is instructed to list words/translations found in uploaded images as part of a normal chat turn, not a dedicated OCR endpoint).

## Not present at all (relevant to the redesign spec)

- No `/api/stats/*` endpoints (overview, activity, mastery, leeches, forecast, by-category) — FAZA 3's dashboard has nothing to call yet.
- No `/api/dashboard` aggregate endpoint.
- No `/api/admin/*` — no admin panel exists in any form.
- No `role` field on `User` at all — there is no concept of admin/moderator today.
- No rate limiting, no token/cost tracking for AI usage anywhere.
- No CSV/import endpoints, no OCR-specific endpoint, no Quizlet import.
