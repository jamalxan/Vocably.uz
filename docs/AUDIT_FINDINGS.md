# FAZA 0 — Audit Findings

Date: 2026-08-09. Scope: read-only codebase audit against `docs/VOCABLY_REDESIGN_SPEC.md`. No code was changed while producing this document. See also `docs/API_INVENTORY.md` and `docs/DB_SCHEMA.md`.

## 0. Executive summary — read this before starting any later phase

The spec was written from the outside (login page + screenshots) and says so itself. Three of its foundational assumptions don't match the real code, and each one changes how a later phase should be planned:

1. **The database is MongoDB/Mongoose, not Postgres/SQL.** §6.1's `CREATE TABLE user_word_state / review_events / study_sessions / daily_stats / user_settings` statements do not apply. There are no separate tables — everything (categories, words, per-word stats, chat) is nested inside one `User` document. FAZA 4 needs a from-scratch Mongo data-modeling decision (new top-level collections vs. restructured embedded arrays), or a conscious decision to migrate to Postgres first. This is the single biggest planning fork in the whole project — see open question §7.3 below.
2. **There is exactly one app route.** `src/app/` contains only `page.jsx` (`/`, handles login+register+forgot-password as one component with internal `mode`/`step` state) and `dashboard/page.jsx` (`/dashboard`). Every "mode" in §4.1's route table (`/study/flashcards`, `/review`, `/words`, `/stats`, `/ai`, `/settings`, `/admin/*`, ...) is currently a `view` string toggled client-side inside the single `/dashboard` page, with all 9 mode components mounted simultaneously (`hidden` via CSS, not conditionally rendered). FAZA 2's route restructuring is a bigger lift than "add pages" — it's introducing real routing where none exists, and revisiting the "mount everything, hide with CSS" pattern.
3. **The SRS algorithm is not SM-2.** It's a flat 6-level lookup table (`REVIEW_INTERVAL_DAYS = [0,1,3,7,14,30]`), no ease factor, no lapses/leech tracking, no learning steps. §6.2's SM-2 variant is new work, not a port. See `docs/DB_SCHEMA.md` for the exact current shape.

Two more structural gaps affect the phase-end checklist itself (spec §0 rule 8 and §14): there is **no `type-check` npm script** (no TypeScript anywhere in the repo — everything is `.jsx`/`.js`) and **no test runner is configured** (spec §6.2 asks for `srs.ts` "unit test bilan qoplangan" — that needs a test framework added first). Flagging now so phase planning accounts for it rather than discovering it mid-FAZA-4.

Everything else in this document is either a confirmation/refinement of the spec's own A1–A15 list, or a new finding.

---

## 1. Technical inventory (spec §2.1)

| Area | Actual |
|---|---|
| Framework | Next.js 14.2 (`^14.2.5`), **App Router** (`src/app/`), React 18.2. |
| Router | App Router only — 2 routes total (`/`, `/dashboard`), see executive summary. |
| Styling | Tailwind CSS 3.4, utility classes only. **No raw hex in any `src/components` file** (`grep -r "#[0-9a-fA-F]{6}" src/components` → empty) — colors are already expressed via Tailwind's named palette (`bg-indigo-600`, `text-slate-400`, etc.), not CSS custom properties. `tailwind.config.js` extends only `fontFamily` (two font-family CSS vars) and one custom shadow (`shadow-premium`) — no color tokens, no spacing/radius scale beyond Tailwind defaults. |
| State | React Context only (`src/context/AppContext.jsx`) — no Redux, Zustand, or React Query. All server data is fetched with plain `fetch` inside context callbacks; no client-side cache/dedup/revalidation layer. |
| Backend | Next.js API routes (`src/app/api/**/route.js`), all serverless functions. Full inventory: `docs/API_INVENTORY.md`. |
| DB | MongoDB via Mongoose 8.1, single connection cached on `global.mongoose`. Full schema: `docs/DB_SCHEMA.md`. |
| Auth | JWT (`jsonwebtoken`), 30-day expiry, signed with `JWT_SECRET`. **Stored in `localStorage`** (`page.jsx`, `AppContext.jsx`) — confirms the spec's own concern; this is XSS-exploitable (any injected script can read `localStorage.getItem('token')` and exfiltrate it). No httpOnly cookie anywhere. Login is phone+password; phone verification is one-time, via a Telegram bot (see below), not SMS. |
| AI | **Not "Gemini AI asosida ishlaydi" as the login page footer claims** (`page.jsx:478`). Actual provider chain in `src/app/api/ai/chat/route.js`: text → Groq (`llama-3.3-70b-versatile`) → OpenRouter (`llama-3.3-70b-instruct:free`) → Gemini (`gemini-3.6-flash`) as last resort; vision (image messages) → OpenRouter vision model → Gemini. Prompts live inline as a JS template string constant (`SYSTEM_INSTRUCTION` in `chat/route.js`), not in a DB table — matches spec's request in §8.2 that prompts be admin-editable, which they currently are not. No rate limiting anywhere, no token/cost tracking anywhere (`docs/API_INVENTORY.md` confirms). Tool-calling (`list_categories`/`create_category`/`add_words`) implemented per-provider in `src/lib/aiTools.js`. |
| TTS/audio | Pure browser `Web Speech API` (`window.speechSynthesis`), `src/lib/speech.js`. No external TTS API, no stored audio files. Free but voice quality/availability depends entirely on the user's browser/OS. |
| Deploy | Vercel, confirmed live at `vocably.uz` (redirects to `www.vocably.uz`). Deploys on push to `master` via GitHub (`github.com/jamolxon6706/Learn_Vocabulary`, per a prior session — GitHub reports this now redirects to `github.com/jamalxan/Learn_Vocabulary`). Env vars managed in Vercel's dashboard; the repo's own `.env` still has placeholder values (confirmed in a prior session) — the real values only exist in Vercel. |

## 2. Page-component map (spec §2.2)

| Route | Component | APIs used | Key children |
|---|---|---|---|
| `/` | `src/app/page.jsx` (`AuthPage`) | `POST /api/auth/login`, `POST /api/auth/register-init`, `POST /api/auth/reset-init`, `POST /api/auth/verify-code`, `POST /api/auth/reset-password`, `GET /api/auth/session-status` (polled) | None — self-contained, inline `Field`/`PasswordInput`/`SubmitButton` helpers in the same file. |
| `/dashboard` | `src/app/dashboard/page.jsx` (`DashboardContent`, wrapped in `AppProvider`) | Indirectly, via `AppContext`: `GET/POST/DELETE /api/words`, `PATCH/DELETE /api/categories`, `POST /api/words/add`, `PATCH /api/words/review`, `GET/DELETE /api/ai/sessions`, `PATCH/DELETE /api/ai/sessions/[id]` | `Sidebar`, and 9 simultaneously-mounted (CSS-`hidden`-toggled) mode panels: `FlashcardMode`, `WritingTest`, `MatchGame`, `TestMode`, `SpeedQuiz`, `ListeningMode`, `SpacedRepetition`, `WordTable`, `AiChat`. `AiChat` further renders `ChatMessage` → `PendingAddWordsCard`, and `Sidebar` renders `SidebarChatSessions` → `AllChatSessionsModal`. `WordTable` and category deletion flows use the shared `ConfirmModal`/`UndoToast`. |

No `/study/*`, `/review`, `/words`, `/words/:id`, `/categories`, `/stats`, `/ai`, `/settings`, or `/admin/*` routes exist — all are `view` values inside `/dashboard`'s single `useState('cards')`.

## 3. Quick quality checks (spec §2.3)

| Check | Result |
|---|---|
| Lighthouse (mobile) | **Not run.** This audit session has no connected browser (Claude-in-Chrome extension unavailable in this environment). Needs a follow-up session with browser access, or numbers pasted in by the team, before FAZA 9 sign-off. |
| Bundle size | From `npm run build` (current `master`, includes the SpeedQuiz mode added in a prior session): `/dashboard` route 64.7 kB own + 152 kB First Load JS; shared chunks 87.3 kB. No individual chunk near the 250 KB gzip warning threshold. The whole app ships as one bundle for one route — there is currently nothing *to* code-split (see executive summary point 2); this number will need re-baselining once FAZA 2 introduces real routes. |
| Console errors | **Not checked** — needs a live browser session. |
| Network / N+1 | Verified from code, not network trace: `GET /api/words` is one call that returns the entire categories/words/chat tree (good — not N+1). But `POST /api/words` (used for *every* add-word and add-category action) **overwrites the entire `categories` array** on each call (`User.findByIdAndUpdate(userId, { categories })` in `src/app/api/words/route.js`) — not N+1, but a related risk: two concurrent writes (e.g. two open tabs) will silently clobber each other since there's no per-item update or optimistic-concurrency check. Flagging as a correctness issue, not just a performance one. |
| 375px reflow | **Not checked live.** Code review shows consistent use of Tailwind responsive prefixes (`sm:`, stacking flex/grid) throughout; no obviously-fixed-width element was found that would force horizontal scroll, but this needs live device verification before sign-off, not just a code read. |
| Keyboard | **Not checked live**, but one concrete gap found in code: `ConfirmModal` (`src/components/ConfirmModal.jsx`) auto-focuses its confirm button and closes on Escape (good), but does **not** implement a focus trap — Tab can move focus to elements behind the modal while it's open. Same for `AllChatSessionsModal` (no trap) and the category "manage" popover in `Sidebar`. Needs fixing per spec §11.1. |
| Contrast | Confirmed low-contrast text beyond A10 (below): `text-slate-300` (≈1.5:1 on white) is used for placeholder-ish hint text in both `FlashcardMode.jsx` and `SpacedRepetition.jsx` ("Ko'rish uchun bosing" / "KO'RISH UCHUN BOSING"). Broader `text-slate-400` usage (very common throughout — labels, hints, timestamps) sits around 4.4–4.6:1 depending on exact background, i.e. borderline at the 4.5:1 AA threshold and should be spot-checked per-instance during FAZA 3, not assumed safe. Full page-by-page contrast audit needs a live tool (axe, Lighthouse) — not done here. |

## 4. A1–A15 — verified against code

| # | Spec's claim | Verdict | Evidence |
|---|---|---|---|
| A1 | `maximum-scale=1` blocks pinch-zoom | **Confirmed exactly.** | `src/app/layout.jsx:23-27` — `export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 1 }`. |
| A2 | Category management split across 3 elements | **Confirmed exactly.** | `src/components/Sidebar.jsx`: native `<select>` (131-141) + "Kategoriyalarni boshqarish" toggle→inline list (143-201) + separate "Yangi kategoriya" button/form (203-240). Three independent UI pieces, as described. |
| A3 | Dropdown text truncates, no tooltip | **Confirmed — structural, not a bug to "fix," a native-`<select>` limitation.** | Same `<select>` (Sidebar.jsx:136-140) renders `{c.name} ({c.words.length})` with no `title` attribute and no custom truncation/tooltip handling; a native `<select>`'s own rendering is what truncates. Moving to a custom combobox (spec §4.2) is the right fix, not a patch. |
| A4 | Unlabeled, unexplained red delete icon in a risky spot | **Partially confirmed — refine before fixing.** | `src/app/dashboard/page.jsx:56-63` — the button *does* have `title="Kategoriyani o'chirish"`, and clicking it calls `handleDeleteCategory`, which shows a native `confirm()` dialog naming the word count (`AppContext.jsx:249-267`). So it isn't silent/unconfirmed — but it *is* icon-only in a header with no visible text label, and it uses the browser's native `confirm()` instead of the app's own `ConfirmModal` component (which `WordTable` and chat-session deletion already use consistently). The real issues are placement + inconsistent confirmation UI, not "no confirmation at all." |
| A5 | "Jami so'zlar: 29" and "Navbatda: 97" shown together, contradictory | **Confirmed exactly, root cause identified.** | Header (`dashboard/page.jsx:52`): `Jami so'zlar: {activeCategory.words?.length} ta` — always visible regardless of active tab. `SpacedRepetition.jsx:76`: `Navbatda: {dueWords.length}` — and `dueWords` (line 11-21) is computed **across all categories**, not the active one. So when a user is on "Bugungi takrorlash," they see the active category's total next to a due-count that spans every category — the exact contradiction described. |
| A6 | Stat cards lack context/trend | **Confirmed.** | `SpacedRepetition.jsx:49-65` — 3 cards (today-reviewed / streak / mastered), raw numbers only, no comparison to a prior period. |
| A7 | Centered narrow column wastes space at 1440px | **Confirmed.** | `dashboard/page.jsx:67` — `max-w-4xl` (896px) centered container regardless of viewport width. |
| A8 | Flashcard is a big empty box with small text | **Confirmed as a visual-balance issue.** | `FlashcardMode.jsx:100` — `h-64 sm:h-72` (256–288px tall) card; before "show answer" is clicked it contains only the word (`text-2xl sm:text-3xl`) and a small hint line — a lot of vertical empty space relative to content. |
| A9 | 9 flat, ungrouped sidebar items | **Confirmed exactly — and now literally 9.** | `Sidebar.jsx` `navItems` (25-34): cards, write, match, test, **speed** (added in a prior session), listening, review, table, ai — 9 entries, single flat `<nav>`, no section headers. |
| A10 | "KO'RISH UCHUN BOSING" uppercase, low contrast | **Confirmed, worse than described.** | Two locations, not one: `FlashcardMode.jsx:121-123` and `SpacedRepetition.jsx:101` both use `text-xs text-slate-300 uppercase tracking-wider` — `slate-300` on white is roughly **1.5:1**, nowhere near the 4.5:1 minimum. |
| A11 | Login is dark, app is light — brand mismatch | **Confirmed, with a nuance worth designing around.** | Login (`page.jsx:220`) is `bg-slate-950` with glassmorphism cards. The dashboard main area is light (`bg-slate-50`/white), **but `Sidebar.jsx` is already dark** (`bg-slate-900`, line 102) — so the app isn't uniformly light today; it's a light canvas with a permanent dark sidebar, next to a fully-dark login screen. FAZA 1's token system (spec §3.2) should treat "make login and app match" as reconciling *three* surfaces (login, sidebar, canvas), not two. |
| A12 | No keyboard shortcuts (Space, 1-4) | **Confirmed absent everywhere** — no mode has a `Space`/digit-key handler; only native Enter-via-`<form onSubmit>` exists in a few modes. |
| A13 | No in-session progress indicator | **Partially confirmed — mode-by-mode, not universal.** | Already present: `FlashcardMode` (`{cardIndex+1} / {words.length}`), `ListeningMode` (`{idx+1} / {queue.length}`), `WritingTest` (`{writeCurIdx+1} / {writeWords.length}`). Missing: `TestMode` (open-ended — no fixed session length, so there's no "total" to show), `MatchGame` (shows no index/progress at all, only "Oraliqni o'zgartirish"), `SpacedRepetition` (shows "Navbatda: N" — remaining count, not "X / Total", and it's global across categories per A5). Fix is per-mode, and `TestMode`/`SpeedQuiz` need a defined session length before a progress bar makes sense. |
| A14 | No category/word search | **Partially confirmed.** | Word-level search **already exists**: `WordTable.jsx:124-133`, live-filters by word or translation. What's genuinely missing: category search (`Sidebar`'s category switcher is a plain `<select>`, no filter) and any global cross-cutting search (no `Cmd/Ctrl+K` of any kind). |
| A15 | Empty/error states unknown | **Assessed — mixed, with specific gaps.** | Empty states exist in some places (`WordTable`: "Bu kategoriyada hali so'z yo'q."; `FlashcardMode`: "...Jadval bo'limidan qo'shing."). Pre-session validation ("no words in range," "category has < 4 words," etc.) is **still native `alert()`** in all six study modes (`FlashcardMode`, `MatchGame`, `TestMode`, `ListeningMode`, `WritingTest`, `SpeedQuiz`) — session-*end* alerts were already replaced with a styled `SessionCompleteCard` in a prior session, but the *start*-gate validation alerts were not. Mutation error handling is inconsistent: `AiChat` shows a proper inline error bubble on failure; `AppContext`'s `syncData`/`deleteWords`/`handleRenameCategory`/`handleDeleteCategory` all swallow fetch failures into `console.error` only — a failed save currently has **no user-facing indication at all**. No loading skeletons exist anywhere (only a single full-page spinner on initial load); list/card content simply pops in once data arrives. |

## 5. Additional findings (beyond A1–A15)

| ID | Finding | File(s) | Type | Severity |
|---|---|---|---|---|
| B1 | Login footer claims "Gemini AI asosida ishlaydi" but Groq/OpenRouter are tried first; Gemini is the last-resort fallback. Misleading copy. | `src/app/page.jsx:478` | ux/copy | Past |
| B2 | JWT kept in `localStorage`, readable by any injected script (XSS → full account takeover, no httpOnly cookie anywhere). | `src/app/page.jsx`, `src/context/AppContext.jsx`, `src/components/AiChat.jsx`, `src/components/chat/PendingAddWordsCard.jsx` | xavfsizlik | Yuqori |
| B3 | `POST /api/words` blind-overwrites the entire `categories` array on every add-word/add-category action — no targeted update, no optimistic-concurrency guard. Two concurrent writes (two tabs, a slow request racing a fast one) can silently drop data. | `src/app/api/words/route.js`, `src/context/AppContext.jsx` (`syncData`) | bug/texnik qarz | Yuqori |
| B4 | `POST /api/categories` (create) is dead code — no frontend caller uses it (`grep` confirms only `PATCH`/`DELETE` are called, from `AppContext.jsx:240,260`). Category creation instead goes through the full-array `POST /api/words` path. | `src/app/api/categories/route.js` | texnik qarz | Past |
| B5 | Category deletion uses the browser's native `confirm()` (`AppContext.handleDeleteCategory`) while word deletion and chat-session deletion already use the app's own styled `ConfirmModal`. Inconsistent, and the native dialog can't show the "type the name to confirm" pattern spec §4.3 asks for. | `src/context/AppContext.jsx:249-267` | ux/dizayn | O'rta |
| B6 | Chat images are stored as base64 data URLs **inline inside MongoDB chat-message documents** (up to 10 per message), not uploaded to object storage. Inflates document size, no CDN caching, no lazy loading possible. | `src/lib/models.js` (`ChatSessionMessage.imageUrls`), `src/app/api/ai/chat/route.js` | performance/texnik qarz | O'rta |
| B7 | AI `create_category` tool commits to the DB immediately (mid-conversation, no user confirmation step), while `add_words` requires explicit confirmation via a card UI. A prior session already fixed the worst symptom (duplicate categories from provider-fallback retries, stale category list in the confirm card) but the underlying asymmetry — one AI action is silent, the other isn't — is still there by design. Worth a product decision, not just a bug fix. | `src/lib/aiTools.js`, `src/app/api/ai/chat/route.js` | ux | O'rta |
| B8 | `README.md` is stale: describes an `ai/ocr/route.js` endpoint that does not exist, and undersells the current Groq/OpenRouter/Gemini fallback chain as "Gemini asosida." Don't use the README as a source of truth for routing — this audit is. | `README.md` | texnik qarz | Past |
| B9 | No `role` field on `User` at all (spec's admin panel, §9.1, needs `user \| moderator \| admin`) — this is 100% greenfield, not an extension of an existing permission system. | `src/lib/models.js` | texnik qarz | Tekshir (kutilgan) |
| B10 | No `timezone`/`user_settings`-equivalent document exists. Streak day-boundary is computed as plain UTC (`new Date().toISOString().slice(0,10)` in `src/app/api/words/review/route.js`), not user-local, and there's no 04:00 cutoff. Matches the exact gap spec §5.4 calls out as "muhim texnik talab." | `src/app/api/words/review/route.js` | bug | Yuqori (foydalanuvchi Toshkentda bo'lmasa yoki kechqurun/tunda mashq qilsa streak noto'g'ri hisoblanadi) |
| B11 | No `/api/stats/*` or `/api/dashboard` aggregate endpoints exist. All "stats" currently shown (`SpacedRepetition`'s 3 cards, `Sidebar`'s per-category word counts) are computed **client-side** by iterating the full in-memory `categories` payload — fine at today's scale (one user's own words), but doesn't extend to the cross-user aggregates the spec's admin panel (§9.2) needs, and won't stay fast once a user has thousands of words. | `src/components/SpacedRepetition.jsx`, `src/components/Sidebar.jsx` | texnik qarz | O'rta |
| B12 | No test runner configured anywhere in `package.json` (no Jest/Vitest, no `test` script, no `__tests__` directories). Spec §6.2 asks for `srs.ts` to be "unit test bilan qoplangan" — a framework needs to be added before FAZA 4 can satisfy that. | `package.json` | texnik qarz | O'rta |
| B13 | No TypeScript in the repo (`.jsx`/`.js` only) and no `type-check` npm script. Spec's own phase-end routine (§14) says "npm run build && npm run lint && npm run type-check" every phase — that third command doesn't exist today. Needs a decision: introduce TS (matches spec's `srs.ts` file naming), or drop "type-check" from the phase routine. | `package.json`, whole repo | texnik qarz | O'rta |
| B14 | Dashboard mounts all 9 mode components simultaneously on every load (`className={view === 'x' ? '' : 'hidden'}` in `dashboard/page.jsx`), rather than conditionally rendering only the active one. Keeps state across tab switches (arguably intentional/desirable today) but means every mode's effects/subscriptions run regardless of which tab is visible, and nothing is route-based code-split (there's only one route to split from). Relevant to spec §11.3's code-splitting goal once FAZA 2 introduces real routes. | `src/app/dashboard/page.jsx` | performance | Past |
| B15 | No `ConfirmModal`/`AllChatSessionsModal`/Sidebar popover implements a focus trap (see quality-check table above) — keyboard users can Tab out of an open modal into the page behind it. | `src/components/ConfirmModal.jsx`, `src/components/chat/AllChatSessionsModal.jsx`, `src/components/Sidebar.jsx` | a11y | O'rta |
| B16 | Native `alert()` still used for pre-session validation (not just the session-end alerts already fixed in a prior session) in all six study modes. | `FlashcardMode.jsx`, `MatchGame.jsx`, `TestMode.jsx`, `ListeningMode.jsx`, `WritingTest.jsx`, `SpeedQuiz.jsx` | a11y/ux | O'rta |
| B17 | Registration/password-reset OTP delivery depends entirely on the user having Telegram installed and completing a bot interaction — not a bug, but a real product-dependency worth the team's awareness going into any FAZA touching auth (no SMS fallback exists, and it's not in scope of this spec to add one). | `src/app/api/telegram/*`, `src/app/page.jsx` | texnik qarz (izoh) | Past |

## 6. Backlog table (spec §12 format)

```
| ID  | Muammo                                          | Joyi                                    | Tur          | Jiddiylik | Faza | Holat  |
|-----|--------------------------------------------------|------------------------------------------|--------------|-----------|------|--------|
| A1  | maximum-scale=1 bloklaydi pinch-zoom              | src/app/layout.jsx:23-27                 | a11y         | Yuqori    | 1    | Bajarildi |
| A2  | Kategoriya boshqaruvi 3 elementga bo'lingan       | src/components/Sidebar.jsx:131-240       | ux           | Yuqori    | 4    | Ochiq  |
| A3  | Dropdown matni kesiladi, tooltip yo'q             | src/components/Sidebar.jsx:136-140       | ux           | O'rta     | 4    | Ochiq  |
| A4  | Xavfli o'chirish tugmasi, ishonchsiz tasdiq        | dashboard/page.jsx:56-63, AppContext.jsx | ux/xavf      | Yuqori    | 4    | Bajarildi |
| A5  | "Jami" va "Navbatda" ziddiyatli ko'rsatiladi       | dashboard/page.jsx:52, SpacedRepetition.jsx:76 | ux     | Yuqori    | 1,3  | Bajarildi (1-faza qismi; to'liq API-darajadagi yechim 3-fazada) |
| A6  | Statistik kartalar kontekstsiz                    | SpacedRepetition.jsx:49-65               | ux           | O'rta     | 3    | Ochiq  |
| A7  | 1440px'da bo'sh joy                                | dashboard/page.jsx:67                    | layout       | O'rta     | 3    | Ochiq  |
| A8  | Flashcard vizual muvozanatsiz                      | FlashcardMode.jsx:100                    | dizayn       | Yuqori    | 5    | Ochiq  |
| A9  | Sidebar guruhlanmagan (9 element)                  | Sidebar.jsx:25-34                        | IA           | O'rta     | 4    | Ochiq  |
| A10 | Past kontrastli uppercase matn (2 joyda)           | FlashcardMode.jsx:121, SpacedRepetition.jsx:101 | a11y  | O'rta     | 1,5  | Bajarildi |
| A11 | Login/ilova brendi mos emas (3 sirt)               | page.jsx:220, Sidebar.jsx:102, dashboard | dizayn       | O'rta     | 1    | Ochiq (to'liq token tizimi kerak — 3-fazaga ko'chirildi) |
| A12 | Klaviatura shortcut'lari yo'q                      | barcha study rejimlari                   | ux           | O'rta     | 5    | Ochiq  |
| A13 | Progress indikatori ba'zi rejimlarda yo'q          | TestMode.jsx, MatchGame.jsx, SpacedRepetition.jsx | ux  | Yuqori    | 5    | Bajarildi (MatchGame, SpacedRepetition); TestMode — sessiya uzunligi belgilanmagani uchun qasddan o'zgartirilmadi, savol raqami+aniqlik allaqachon ko'rsatiladi |
| A14 | Kategoriya qidiruvi yo'q (so'z qidiruvi bor)       | Sidebar.jsx                              | ux           | O'rta     | 4    | Ochiq  |
| A15 | Bo'sh/xato holatlar aralash-quralash                | 6 ta study rejimi, AppContext.jsx        | ux           | O'rta     | 9    | Ochiq  |
| B1  | Login "Gemini asosida" degan matn noto'g'ri        | page.jsx:478                             | ux           | Past      | 1    | Bajarildi |
| B2  | JWT localStorage'da (XSS xavfi)                    | page.jsx, AppContext.jsx, AiChat.jsx     | xavfsizlik   | Yuqori    | -    | Ochiq (foydalanuvchidan qaror kerak) |
| B3  | To'liq massiv almashtirish — poyga holati (race)    | words/route.js, AppContext.jsx           | bug          | Yuqori    | 4    | Ochiq  |
| B4  | POST /api/categories o'lik kod                     | api/categories/route.js                  | texnik qarz  | Past      | 4    | Ochiq  |
| B5  | Kategoriya o'chirish native confirm() ishlatadi     | AppContext.jsx:249-267                   | ux/dizayn    | O'rta     | 4    | Ochiq  |
| B6  | Chat rasmlari base64 DB ichida saqlanadi            | models.js, ai/chat/route.js              | performance  | O'rta     | 6    | Ochiq  |
| B7  | create_category tasdiqsiz, add_words tasdiqli      | aiTools.js, ai/chat/route.js             | ux           | O'rta     | 6    | Ochiq  |
| B8  | README eskirgan (ai/ocr yo'q endi)                 | README.md                                | texnik qarz  | Past      | -    | Ochiq  |
| B9  | User.role maydoni yo'q (admin panel uchun)         | models.js                                | texnik qarz  | Kutilgan  | 10   | Ochiq  |
| B10 | Streak UTC bo'yicha, timezone/04:00 chegarasi yo'q | words/review/route.js                    | bug          | Yuqori    | 4    | Ochiq  |
| B11 | /api/stats/* va /api/dashboard yo'q                | -                                        | texnik qarz  | O'rta     | 3    | Ochiq  |
| B12 | Test runner sozlanmagan                            | package.json                             | texnik qarz  | O'rta     | 4    | Ochiq  |
| B13 | TypeScript yo'q, type-check skripti yo'q           | package.json                             | texnik qarz  | O'rta     | -    | Ochiq (foydalanuvchidan qaror kerak) |
| B14 | Barcha 9 rejim doim mount qilingan                 | dashboard/page.jsx                       | performance  | Past      | 2    | Ochiq  |
| B15 | Modallarda focus-trap yo'q                          | ConfirmModal.jsx va boshq.               | a11y         | O'rta     | 9    | Ochiq  |
| B16 | Sessiya boshlashda hali ham alert()                | 6 ta study rejimi                        | a11y/ux      | O'rta     | 9    | Ochiq  |
| B17 | OTP faqat Telegram orqali (SMS yo'q)               | api/telegram/*, page.jsx                 | texnik qarz  | Izoh      | -    | Ochiq (izoh, tuzatish talab qilinmaydi) |
```

## 7. Open questions (spec §15) — restated, need answers before FAZA 2+

The spec explicitly says "taxmin qilma, so'ra" (don't guess, ask). Restating its 6 questions plus 2 the audit surfaced:

1. Foydalanuvchilar o'z so'zlarini qo'shadimi yoki faqat tayyor to'plamlardan foydalanadimi (yoki ikkalasi)? *(Currently: 100% user-added, no shared/global word bank exists — confirms this is greenfield if "tayyor to'plamlar" is wanted.)*
2. Monetizatsiya rejasi bormi (bepul/premium)?
3. Hozircha nechta faol foydalanuvchi bor? *(Migration strategy for FAZA 4's data-model change depends heavily on this — a handful of users vs. thousands changes whether a live migration script is even necessary.)*
4. AI xarajati uchun oylik byudjet qancha?
5. Dark rejim default bo'lsinmi yoki light? *(See A11 — there are three surfaces to reconcile, not two.)*
6. Telegram bot allaqachon bormi yoki noldan qurish kerakmi? *(Answered by this audit: it already exists and is the **only** OTP delivery mechanism today — B17. Any redesign work must not break it.)*
7. **(New, from B3)** Is the current "overwrite the whole categories array on every write" pattern (`POST /api/words`) acceptable to keep as-is for now, or should FAZA 4's data-model work also fix it? It's a real (if currently low-probability) data-loss risk.
8. **(New, from B13)** Should TypeScript be introduced as part of this project (matches the spec's own `srs.ts` file references and "type-check" phase-end step), or should that step be dropped from the phase routine? This blocks how FAZA 4 is scaffolded.

---

**Status: FAZA 0 complete.** No source files were modified. Next step per spec §14 is FAZA 1 (kritik tuzatishlar: A1, A4, A5, A13) — recommend resolving open questions 7 and 8 above first since they change how even small FAZA-1 fixes should be written (e.g., a real FAZA-4 fix to B3 would change how A5's data flows, so A5's FAZA-1 fix should stay presentation-only and not attempt to fix the underlying query pattern yet).

## 8. Decisions (recorded after FAZA 0 report-back)

- **DB**: stay on MongoDB. FAZA 4's `user_word_state`/`review_events`-equivalent work will be new Mongo collections (or a restructured embedded shape), not a Postgres migration. §6.1's SQL DDL is directional only — see open question 7 above (B3, the full-array-overwrite race) as something FAZA 4 should also address while touching this layer.
- **TypeScript**: introduce it. New files (starting with `src/lib/srs.ts` when FAZA 4 arrives) are written in TS; existing `.jsx`/`.js` files migrate gradually, not all at once. `tsconfig.json` uses `allowJs: true` / `checkJs: false` so the phase-end `type-check` step is meaningful without forcing an immediate full-repo conversion.
- **Dark mode default**: system-preference-based (`prefers-color-scheme`), user-overridable from Settings once that page exists. Both palettes in spec §3.2 get built out fully, not just one.
- Product questions 1–5 (own-word-only vs. shared word banks, monetization, current user count, AI budget) remain **open** — not blocking for FAZA 1's small fixes, but need answers before FAZA 3 (dashboard), FAZA 6 (AI cost controls), or FAZA 7 (admin panel) start.

## 9. FAZA 1 report-back

**Status: FAZA 1 complete** on `feat/phase-1-critical-fixes`. Fixed: A1, A4, A5 (presentation-only, per §8's decision), A10, A13 (SpacedRepetition + MatchGame), B1. TestMode's A13 was deliberately left as-is — it's open-ended by design (no fixed session length), so an "X/Total" bar isn't meaningful there yet; it already shows question number + running accuracy.

Also closed spec §0 rule 8's own gap (noted in §0 above): `next lint` had never been run in this repo (no ESLint config existed, `eslint`/`eslint-config-next` weren't installed). Added `.eslintrc.json` (`next/core-web-vitals`) and pinned `eslint@^8` + `eslint-config-next@14.2.5` to match the installed Next 14.2 (the newest `eslint-config-next` pulls in ESLint 9 flat-config, which is incompatible with Next 14's `next lint`). Turned off `react/no-unescaped-entities` — Uzbek Latin text uses `'` constantly (`o'zbek`, `bo'lim`, ...) and the rule would otherwise force-escape apostrophes across nearly every JSX string in the app for no real benefit. `npm run build && npm run lint && npm run type-check` all pass clean.
