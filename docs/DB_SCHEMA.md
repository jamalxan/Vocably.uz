# DB Schema — Vocably (actual, as of FAZA 0 audit, 2026-08-09)

**This is the single most important audit finding: the database is MongoDB (via Mongoose), not the relational/Postgres schema the redesign spec assumes in section 6.1.** There are no separate tables for words, categories, reviews, or sessions — everything is nested inside one `User` document. `docs/VOCABLY_REDESIGN_SPEC.md` §6.1's `CREATE TABLE` statements do not apply as written; FAZA 4 needs a rewrite (Mongo migration/collection strategy, or a decision to move to Postgres — see open question in `AUDIT_FINDINGS.md`).

Source: `src/lib/models.js` (only place schemas are defined), plus `src/lib/db.js` (connection).

## Connection

- Single Mongoose connection, cached on `global.mongoose` to survive serverless hot-reloads (`src/lib/db.js`).
- `MONGODB_URI` env var. In this environment it is still the literal placeholder from `.env.example` (`<username>:<password>@cluster0.xxxxx.mongodb.net`) — the real value only exists in Vercel's project environment variables, confirmed by the user during a prior session.

## `User` collection

One document per user. **Everything else (categories, words, chat, OTP-adjacent fields) lives nested inside this one document** — there is no `words` collection, no `categories` collection.

```
User {
  _id: ObjectId
  phone: String        (required, unique, indexed, trimmed)
  name: String          (default '')
  password: String       (required — bcrypt hash)
  telegramChatId: Number (default null)

  categories: [Category]     // embedded array, see below
  chatHistory: [ChatMessage] // legacy, pre-multi-session chat; migrated lazily into chatSessions
  chatSessions: [ChatSession] // current multi-conversation AI chat storage

  reviewStreak: Number   (default 0)
  lastReviewDate: String (default null — 'YYYY-MM-DD', UTC-based, see AUDIT_FINDINGS.md)

  createdAt: Date (default now)
}
```

No `role` field. No `timezone` field. No `theme`/settings field. No soft-delete (`deleted_at`) anywhere.

### `Category` (embedded subdocument, own `_id`)

```
Category {
  _id: ObjectId   (auto, Mongoose subdocument id — used as the "categoryId" everywhere in the API)
  name: String (required, trimmed)
  words: [Word]  // embedded array
}
```

No `archived`/`deleted_at` flag. No ordering/position field (categories are always in array-insertion order). No unique-name constraint (duplicate category names are allowed at the schema level — the AI tool-calling path added its own case-insensitive dedupe in application code; the plain `POST /api/categories` and the array-replace `POST /api/words` paths have no such guard).

### `Word` (embedded subdocument, own `_id`)

```
Word {
  _id: ObjectId
  word: String (required, trimmed)
  syns: [String] (trimmed)   // translations/synonyms — the "answer" side of a flashcard
  stats: WordStats (default {})
}
```

No part-of-speech, no IPA/transcription field, no example sentence, no audio URL, no `direction` (en→uz vs uz→en) field — none of the richer word metadata the spec's flashcard redesign (§7.2) or cloze mode (§7.4-A) assumes exists today.

### `WordStats` (embedded, no own `_id`)

```
WordStats {
  correct: Number (default 0)
  wrong: Number (default 0)
  lastReviewed: Date (default null)
  level: Number (default 0, min 0, max 5)   // NOT an SM-2 "ease" value — see below
  nextReview: Date (default now)
}
```

This is the **entire** SRS state. Compare against the spec's `user_word_state` (§6.1): there is no `ease`, no `interval_days`, no `reps`, no `lapses`, no `is_leech`, no `is_suspended`, no `state` (new/learning/review/relearning) enum, no `learning_step`. The actual algorithm (`src/app/api/words/review/route.js`) is a flat lookup table, not SM-2:

```
REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]   // indexed by `level`, 0-5
correct → level = min(5, level + 1); nextReview = now + REVIEW_INTERVAL_DAYS[level] days
wrong   → level = 0;                  nextReview = now + 10 minutes
```

No ease factor, no fuzz, no leech detection, no per-mode rating (1-4) — every mode reports a boolean `correct` only.

### `ChatSession` (embedded, own `_id`)

```
ChatSession {
  _id: ObjectId
  title: String (default 'Yangi suhbat', trimmed)
  messages: [ChatSessionMessage]
  createdAt: Date (default now)
  updatedAt: Date (default now)
}

ChatSessionMessage {                 // { _id: false } — no own id
  role: 'user' | 'model'             // normalized on write, see src/lib/chatRoles.js
  parts: [{ text: String (required) }]
  imageUrl: String (default null)    // legacy single-image field
  imageUrls: [String]                // current multi-image field (up to 10, base64 data URLs stored inline)
  timestamp: Date (default now)
}
```

**Images are stored as base64 data URLs directly inside the message document**, not uploaded to object storage — this means chat history documents can get large (a single message can carry up to 10 embedded images) and there's no CDN/caching benefit. Worth flagging for FAZA 6 (AI chat redesign) and FAZA 9 (performance).

### `ChatMessage` (legacy, embedded, `{ _id: false }`)

Same shape as `ChatSessionMessage` minus the multi-image field. Only read by `migrateChatHistoryIfNeeded()` (`src/lib/chatMigration.js`), which copies it into a single `chatSessions` entry titled "Eski suhbat" the first time `GET /api/words` runs for a user who still has old-format history, then leaves it in place afterward (not deleted, but no longer written to).

## `OtpSession` collection

Separate top-level collection (not embedded in `User`), used only during registration/password-reset.

```
OtpSession {
  _id: ObjectId
  sessionToken: String (required, unique, indexed)
  purpose: 'register' | 'reset' (required)
  phone: String (required)
  name: String (default '')           // register only
  passwordHash: String (default null) // register only — pre-hashed before Telegram confirmation
  userId: ObjectId ref User (default null) // reset only
  telegramChatId: Number (default null)
  code: String (default null)
  status: 'awaiting_telegram' | 'code_sent' | 'verified' | 'mismatch' (default 'awaiting_telegram')
  attempts: Number (default 0)        // capped at 5 in verify-code route, then session is deleted
  createdAt: Date (default now, TTL index: expires: 900) // MongoDB auto-deletes after 15 minutes
}
```

## Indexes

Only two indexes are explicitly declared:
- `User.phone` — `unique: true, index: true`.
- `OtpSession.sessionToken` — `unique: true, index: true`.
- `OtpSession.createdAt` — TTL index (`expires: 900`), auto-purges abandoned auth flows after 15 minutes.

No index on anything used for the spec's proposed due-date/streak queries (there's nothing to index yet since `nextReview` lives inside a deeply nested array — Mongo cannot efficiently index or query "words across all users where `stats.nextReview <= now`" the way the spec's flat `user_word_state` table could). This is a real scaling constraint worth calling out for FAZA 4 planning: as currently modeled, computing global due-counts, leech lists, or activity heatmaps requires loading each user's *entire* categories/words tree into the Node process and filtering in application code (see `SpacedRepetition.jsx`, `AppContext.jsx` — this is exactly what they already do, client-side, over the full `categories` payload from `GET /api/words`).

## Do'stlar (foydalanuvchilararo chat) — yangi top-level kolleksiyalar

Qo'shildi (2026-08-23), `docs/` chat plani asosida. `ReviewEvent`dagi kabi, `User`
hujjatiga embed qilinmagan — cross-user so'rovlar (qidiruv, admin nazorati) kerak.

- **`User`** ga qo'shilgan maydonlar: `role` (`user`/`admin`), `username` (unique, sparse — faqat
  chat ruxsati berilganlarda bo'ladi), `chatAccess` (bool, Do'stlar bo'limi ko'rinishini boshqaradi),
  `chatBanned` (bool).
- **`Conversation`** — ikki foydalanuvchi orasidagi doimiy 1:1 suhbat. `participantIds` saralangan
  juftlik, unique compound indeks (bir juftlik = bitta hujjat).
- **`Message`** — `conversationId` + `createdAt` bo'yicha indekslangan. `type`:
  text/image/video/voice/file/sticker. Media S3/MinIO obyekt kaliti sifatida saqlanadi (`media.key`),
  hech qachon to'g'ridan-to'g'ri URL emas.
- **`Block`**, **`Report`**, **`AdminAuditLog`** — bloklash, shikoyat va admin audit jurnali.
- **`RateLimitHit`** — Redis'siz oddiy tezlik cheklash uchun, TTL indeks bilan avtomatik tozalanadi.

To'liq kontekst: `docs/` ichidagi chat rejasi (session tarixida), `src/lib/chatAuth.js`,
`src/app/api/chat/*`, `src/app/api/admin/*`.

## ER diagram (text form)

```
User (1)
 ├── categories[] (embedded, N)
 │     └── words[] (embedded, N)
 │           └── stats (embedded, 1:1)
 ├── chatSessions[] (embedded, N)
 │     └── messages[] (embedded, N)
 └── chatHistory[] (embedded, N — legacy, pre-migration only)

OtpSession (standalone collection, referenced by phone/sessionToken/userId — no hard FK, no cascade)
```

No relational foreign keys exist because there are no separate collections to reference — the entire "schema" is expressed as nested-document shape via Mongoose subdocument schemas.
