# 3D word games for vocably.uz — design

Date: 2026-11-06 · Branch: `worktree-feat-3d-word-games` (worktree, based on master 4072b9c)
Status: design approved by the operator's brief (autonomous session); builder-reviewed before implementation.

## 1. Intent and why

The operator researched 30+ open-source 3D games and concluded (research brief, 2026-11-06) that
four repos are usable as *mechanics/visual references* (cooltypinggame — Apache-2.0, cuberun — MIT,
pmndrs/racing-game — MIT, pmndrs/ecctrl — MIT) and that no open-source "3D vocabulary game" exists.
Vocably should fill that gap with games that are **server-graded, cheap on low-end Android, and
viral-shareable**, in this order: So'z tunneli → Word Defense → Word Runner → (later) So'z shahri hub.

What already exists in the repo (verified in code, not assumed):

| Need | Already in repo | Consequence for this design |
| --- | --- | --- |
| Server-authoritative sessions, per-answer grading, XP, SRS, anti-cheat | `src/lib/vocab/server/sessionService.js`, `antiCheat.ts`, `xp.ts`, `/api/games/*` | New games are **catalog entries + generators**; no new backend. |
| Typed "meaning → English word" question | `genSpellDrop` (`spell_drop`, inputType `typed`, `accepted = acceptedForWord(word)`) | Reused for both new games; one new kind for definition prompts. |
| 3D flagship game pattern (guest + user, R3F, 2D fallback, share card) | `src/components/flagship/VocablyRun.jsx` + `RunScene3D.jsx` | New games follow the same controller shape; shared pieces are extracted into a hook. |
| "Word Runner" mechanic (3 lanes, one right word per gate) | `vocably_run` = Vocably Run | **Word Runner is already shipped.** The cuberun work becomes a visual upgrade of `RunScene3D`, not a new game. |
| 3D hub | `/app/vocabulary-world` (`GameClient.jsx`, StarterIsland3D) | Out of scope (research: do it last, after metrics). |

## 2. Goals, non-goals, anti-goals

Goals
- Two new playable 3D games, both reachable as public guest pages (`/games/tunnel`, `/games/defense`)
  and as signed-in catalog games (`/app/games/word_tunnel`, `/app/games/word_defense`).
- Every signed-in answer is graded on the server from the raw typed text; the client never receives
  the answer, the accepted forms, `word`, `wordId` or `explanation` before grading.
- Each 3D game has a 2D fallback that is the *same game* (same model/controller, DOM renderer).
- Cuberun-inspired synthwave visual upgrade for Vocably Run, keeping its tested behaviour.
- Licence obligations recorded in `THIRD_PARTY_NOTICES.md`.
- Unit, integration (mongodb-memory-server) and Playwright coverage; lint/type/build green.

Non-goals
- No new backend session API, no new Mongo collections, no new state manager (zustand is present but
  the flagship pattern uses refs; we keep that pattern).
- No 3D asset pipeline (GLB/Draco/KTX2): everything is procedural geometry + canvas textures.
- No postprocessing (bloom/SSAO) — too expensive for the target devices.
- No "So'z shahri" hub / ecctrl / racing-game port.

Anti-goals (would make this a failure even if it "works")
- Shipping an answer, answer length on hard/expert, or accepted list to the client.
- Unmounting an R3F `<Canvas>` from inside a frame callback (the 2026-10-21 `removeChild` crash).
- A game that only runs well on desktop GPUs. The majority of users are on cheap Android phones.
- Copying assets (fonts, music, textures, models) from the reference repos — none are needed.
- Breaking `vocably_run` E2E behaviour or its DOM contract (lanes `aria-label`, HUD texts).

## 3. Constraints (verified)

- Stack: Next 16.4 (App Router, `await props.params`), React 19.3, three 0.180, R3F 9.8, drei 10.7,
  Tailwind 3, Mongoose. ESLint 9 with React Compiler rules (`refs`, `purity`, `immutability` are
  errors; self-referencing rAF callbacks need a ref declared **before** the callback).
- CSP (`next.config.mjs`): `script-src 'self' 'unsafe-inline' https://telegram.org` (no
  `wasm-unsafe-eval`, no `worker-src`), `connect-src 'self' …`. Therefore: no Draco/meshopt/KTX2
  decoders, no blob-URL workers (troika/drei `Text` is avoided — text is drawn into canvas textures,
  the pattern already used by `RunScene3D`), no `detect-gpu` (it fetches a benchmark JSON from a CDN).
- i18n: flagship components use `const COPY = { uz, en }` + `useCopy`; server-side Uzbek strings
  (catalog title/description/availability reasons) must have English entries in
  `src/lib/i18n/serverTextEn.js` (enforced by `serverText.test.ts`).
- `games.test.ts` runs every catalog key through `buildGameSession` + `toClientQuestion`
  leak checks; new keys must build from `SAMPLE_WORDS`.
- Anti-cheat `minResponseMs.typed = 900 ms` + 6 ms/prompt char; session TTL 4 h; 60 sessions/day.
- Default locale of the landing/guest pages is Uzbek; E2E contexts start with `vocably_lang=uz`.

## 4. Architecture

```
src/lib/vocab/games.ts            + 'word_tunnel', 'word_defense' GameKeys, catalog entries,
                                    genTypedMeaning (reuses kind spell_drop) + genTypedDefinition
                                    (new kind 'type_definition'), answerLength hint (easy/medium only)
src/lib/i18n/serverTextEn.js      + English for the new titles/descriptions/reasons
src/lib/flagship/typing.js        pure: normalizeTyped, gradeGuest, guestTypedQuestions(bank),
                                    typingScore helpers shared by both games
src/lib/flagship/tunnel.js        pure rules: TUNNEL constants, initialTunnel, resolveWord, summary
src/lib/flagship/defense.js       pure rules: DEFENSE constants, spawn schedule, speed curve,
                                    resolveKill/resolveBreach, summary
src/lib/flagship/gpu.js           client: renderTier() heuristic + createFpsWatchdog()
src/lib/flagship/shareCard.js     + 'tunnel' and 'defense' card models
src/components/flagship/useFlagshipRound.js   hook: audience detection, startGame with practice
                                    fallback, answer queue + grading, complete, guest save/claim
src/components/flagship/TypingInput.jsx       visible text field + submit button + key routing
src/components/flagship/WordTunnel.jsx        controller + HUD + result (So'z tunneli)
src/components/flagship/TunnelScene3D.jsx     R3F scene (dynamic, ssr:false)
src/components/flagship/TunnelScene2D.jsx     DOM fallback
src/components/flagship/WordDefense.jsx       controller + HUD + result
src/components/flagship/DefenseScene3D.jsx    R3F scene
src/components/flagship/DefenseScene2D.jsx    DOM fallback
src/components/flagship/RunScene3D.jsx        visual upgrade (grid floor, sun, stars, arches)
src/app/games/tunnel/page.jsx, src/app/games/defense/page.jsx   public pages (+ sitemap)
src/app/app/(main)/games/[game]/page.jsx      route word_tunnel/word_defense to the new screens
src/components/games/GamesHub.jsx             ICONS += Keyboard, Crosshair
src/components/games/GamePlayer.jsx           KNOWN_KINDS += type_definition (+ i18n label)
THIRD_PARTY_NOTICES.md
```

Data flow (signed in) is the existing one: `POST /api/games/:key/start` → questions without answers
→ `POST /api/games/sessions/:id/answer` (batched, idempotent by `qid#attempt`, `responseMs`)
→ `POST …/complete` (XP once, anti-cheat assessment, mistakes). Guests: questions from `RUN_BANK`,
graded on the device with the same normalisation, **no XP**, missed words kept in
`localStorage` (`vocably.run.guest.v1`) and claimed after sign-up through the existing
`/api/flagship/run/claim` (bank words only).

Rendering contract (both games): the controller owns the game loop in a `ref` (`g.current`) driven
by its own `requestAnimationFrame`; React state carries only the HUD (≤ 4 updates/s). The scene
reads `sceneRef.current` every frame and never calls back into React. `frameloop` is `'always'`
while playing and `'demand'`/`'never'` when paused/finished; the Canvas is **never unmounted**
while a round is live. The 2D renderer reads the same `sceneRef`.

Performance policy (`src/lib/flagship/gpu.js`):
- `renderTier()` runs once on mount: no WebGL or `prefers-reduced-motion` → `'none'` (2D from the
  start); SwiftShader/llvmpipe renderer string, `hardwareConcurrency ≤ 2` or `deviceMemory ≤ 2` →
  `'low'` (DPR 1, fewer rings/particles); otherwise `'high'` (DPR ≤ 1.5).
- `createFpsWatchdog({ onLow })`: the controller's rAF samples frame times; if the 3 s average drops
  under 24 fps twice, `onLow` fires **from the controller loop** (not R3F): the Canvas is paused
  (`frameloop='never'`, `visibility:hidden`) and the 2D renderer is shown. One-way, per round.
- Budget: each game is its own `next/dynamic` chunk; three/R3F are shared chunks. Target ≤ 1.5 MB
  gzip per game route (measured in the verification step; expected ≈ 350 KB).

## 5. Game 1 — So'z tunneli (`word_tunnel`)

Adapted from Boom123bam/cooltypinggame (Apache-2.0): the idea that *every typed character becomes a
ring of that glyph in a tunnel the camera flies through*. Nothing is copied verbatim; the ring
layout (8 glyph copies per ring, twist per index, hue by depth, camera lead + FOV widening with
speed) is re-implemented with canvas-texture glyph quads and a mesh pool.

Mechanics
- Round: 60 s. Server session: 12/15/18/20 questions (easy/medium/hard/expert, `auto` by default).
  The round ends at 0 s or when the last word is answered (early finish gives a time bonus).
- Prompt: Uzbek meaning(s) (`spell_drop`); hard/expert mix in English definitions
  (`type_definition`) when the word has one — same 50/50 rule as Vocably Run.
- Hints: easy → first letter + length (existing `firstLetterHint`), medium → `answerLength` only,
  hard/expert → none. `answerLength` is a new optional client-visible number on `GameQuestion`.
- Typing: a visible text field (mobile keyboards need a real input; `autocapitalize=off`,
  `autocorrect=off`, `spellcheck=false`, `enterkeyhint=go`). Every character typed appends a ring to
  the tunnel (correct or not — the client does not know the answer). Backspace removes the last ring
  of the current word. **Enter** (or the on-screen "Yubor" button) submits; Space inserts a space
  (phrasal answers). "O'tkazib yuborish" submits an empty answer (counted wrong, SRS lapse).
- Grading: signed in → answer queue → server; the next prompt appears immediately, and when the
  verdict arrives the word's rings turn green (correct) or red and dissolve (wrong) and the correct
  word is announced. Guest → device grading (`normalizeForCompare`, same as server).
- Scoring (display only; XP is server-side): per correct word
  `100 × comboMultiplier (≤ ×2) × speedBonus` where speedBonus = 1.5 if answered ≤ 3 s, linear to 1.0
  at ≥ 8 s. Wrong resets combo. Finish-early bonus: 10 points per remaining second. Stats on the
  result screen and share card: score, correct, accuracy, best combo, chars/min.
- Anti-cheat: `responseMs` = prompt shown → Enter. Typical 2–6 s ≫ 900 ms floor.

Scene (`TunnelScene3D`)
- Camera at the tunnel axis looking down −Z; target z = −(ringsTyped × 0.9) + lead; lerped; FOV
  48 → up to 85 with speed. Rings: 8 glyph quads on a radius-0.95 circle facing the axis, twist
  0.075 rad × index, colour HSL(hue by index, 0.85, 0.65); current word's rings brighter, graded
  words tinted green/red, wrong words fade out over 400 ms. Pool of 48 rings (384 quads) reused in
  place; glyph textures cached per character (white glyph, transparent background, tinted by
  material colour). Background `#0b1020`, fog, one long wireframe cylinder rotating slowly.
- `TunnelScene2D`: a CSS-perspective strip of the last 12 typed glyphs shrinking toward a vanishing
  point, plus the same colour semantics. No WebGL.

## 6. Game 2 — Word Defense (`word_defense`)

Original design (idea credit: pshenok/server-survival for "educational tower-defence works";
typeblaster/ZType for "typing shooter" pacing). No code or assets from either.

Mechanics
- Base HP 5 (`lives: 5`). Server session: 20/24/28/30 enemies. Round cap 150 s.
- Enemies carry a prompt (Uzbek meaning; hard/expert mix definitions) and advance from the far end
  (z = −40) to the base (z = 0). Travel time starts at 14 s and shortens 6 % every 5 kills (floor
  7 s). Spawn interval 3.5 s → 2.2 s over the round; at most 4 alive.
- Target: the front-most living enemy is targeted by default (reticle + bright label). Tab, ↑/↓, or
  tapping an enemy switches the target. Enter submits the typed word **for the targeted enemy's
  qid**. Correct → turret shot, enemy destroyed. Wrong → red flash, combo reset, enemy keeps coming
  (one wrong attempt per enemy counts; further tries on the same enemy use `attempt: 2…` and are not
  counted, but still cost time — this matches the engine's first-attempt-only rule).
- Breach: an enemy reaching the base costs 1 HP and submits an empty answer for its qid (counted
  wrong → SRS lapse) with `responseMs` = its visible time.
- End: HP 0, all enemies resolved, or 150 s. Signed in → `complete` → XP, mistakes.
- Scoring (display): kill = `100 × comboMultiplier (≤ ×2) × (1 + 0.5 × remainingDistance)`; breach
  = 0 and combo reset. Result/share card: score, kills, accuracy, best combo, waves (enemies
  resolved).
- Anti-cheat: `responseMs` = enemy spawned → Enter (floor 900 ms + prompt reading time).

Scene (`DefenseScene3D`)
- Camera behind/above the turret looking down the lane. Ground: moving neon grid (GLSL plane
  shader, 2 colours), horizon glow. Enemies: emissive icosahedron orb + canvas-texture label sign
  (prompt, auto-fit up to 2 lines) hovering above; target enemy has a torus reticle and a brighter
  sign. Turret: cylinder base + barrel that yaws toward the target. Shot: a small sphere flies
  turret → enemy in 220 ms; hit = scale-up/fade + 6 cube shards. Breach: the base plane flashes red,
  camera shakes 150 ms. Pools: 6 enemies, 4 projectiles, 24 shards.
- `DefenseScene2D`: enemies are DOM chips in a lane descending toward a base line (transform from
  `progress`), target chip highlighted, breach flashes the line.

## 7. Vocably Run visual upgrade (cuberun-inspired)

Keep `VocablyRun.jsx` untouched; change only `RunScene3D.jsx` internals, preserving the
`sceneRef` contract (`lane, progress, options, feedback, speed, running, locked`) and the
`running` → `frameloop` behaviour:
- Synthwave floor: GLSL grid plane scrolling toward the camera at `speed`; grid colour shifts
  through a palette every 10 correct answers (cuberun's level colours idea).
- Horizon: large emissive disc "sun" with a horizontal gradient band mask; drei `<Stars>` (points
  shader, no textures) above the horizon.
- Gate: a neon torus arch frames the three signs; the runner stays.
- Still no postprocessing; DPR capped by tier.

## 8. Licensing

`THIRD_PARTY_NOTICES.md` (new, repo root) lists: cooltypinggame (Apache-2.0, Boom123bam — concept
and tunnel/ring layout adapted, no verbatim code; full licence text + NOTICE statement + "modified"
note), cuberun (MIT, © 2023 Adam Karlsten — synthwave visual concept; MIT text + copyright),
server-survival (MIT, © 2025 Kostyantyn Pshenychnyy — idea only, no code; listed for transparency),
three.js / @react-three/fiber / @react-three/drei (MIT, already dependencies). No fonts, music,
textures or models are taken from any reference repo.

## 9. Testing

- Unit (vitest): `tunnel.test.js`, `defense.test.js`, `typing.test.js`, `gpu.test.js` (heuristics with
  fake navigator), `shareCard.test.js` additions, `games.test.ts` additions (new keys build; no leak
  of `accepted`/`word`; `answerLength` only on easy/medium; `type_definition` only hard/expert and
  only with a definition), `serverText.test.ts` passes with the new strings.
- Integration (mongodb-memory-server): `sessions.integration.test.ts` — `word_tunnel` and
  `word_defense` play fully (typed answers graded, spelling stats, XP once), empty answer counts as
  wrong, second attempt on the same qid not counted.
- E2E (Playwright, new `e2e/v2-typing-games.spec.ts`): guest tunnel round (type, Enter, verdict,
  pause), guest defense round (target label visible, type, verdict, HP), signed-in start has no
  answer fields in the session JSON and answers are graded by the server, API-level complete.
  Existing `v2-games.spec.ts` must still pass after the Run visual change.
- Verification: `npm run lint`, `npm run type-check`, `npx vitest run` (unit + integration),
  `npx next build` (chunk sizes for the two routes), Playwright on a production build.

## 10. Decisions made for the builder (my calls — change only with a reason)

1. Word Runner = existing Vocably Run; cuberun becomes a visual upgrade. Rationale: the mechanic is
   identical ("3 translations on arches, fly through the right one") and already server-graded.
2. Guest mode mirrors Vocably Run (device-graded, no XP, bank words only, claim after sign-up).
3. Enter submits; Space is a character. One visible input per game, always focused while playing.
4. `answerLength` hint on easy/medium only; never on hard/expert. `word`/`accepted` never sent.
5. No `detect-gpu`, no troika text, no decoders — CSP and device constraints (see §3).
6. Scores shown to the player are client-side display values (as in Vocably Run); XP is server-only.
7. Both new games are `minTier: 'free'`, `priority: 'P0'`, `skill: 'spelling'`, `secondarySkill: 'recall'`.
8. Enemy targeting is explicit (front enemy by default, switchable) so every submission carries a
   `qid` and the existing engine grades it; "type any visible word" targeting would need the server
   to match against all live enemies — a new API — and is deferred.

## 11. Left to the builder

Exact colours/geometry parameters, HUD layout within the existing design tokens (`bg-surface`,
`text-ink`, `bg-accent`…), Uzbek/English copy wording (must stay shape-identical per `useCopy`),
pool sizes, particle counts, easing curves, and how the 2D fallbacks animate — as long as §4's
rendering contract and §2's anti-goals hold.

## 12. Builder check and critique outcomes (2026-11-06)

Four independent critics read this document against the code: a builder check, a pre-mortem, an
anti-cheat review and an R3F/mobile performance review. Their findings change the build as follows.
Each line is my call unless it is marked as the operator's.

Timing and grading (all from the anti-cheat and builder reviews)
- **Defense responseMs (blocker)**: a counted answer reports `now − max(enemy appeared, previous
  counted answer)` in wall-clock time, pauses included. These intervals never overlap, so their sum
  stays ≤ the session time. A breach reports `minPlausibleMs(prompt) + 400 ms` and does not move the
  partition. Unit-tested against `assessSession`.
- **Pauses** stop only the round clock, never the answer clock. The pause overlay hides the prompt,
  and paste/drop are blocked in the input, so looking a word up never earns an "easy" SRS rating.
- **Verdict delivery**: `gradeTyped` re-flushes the queue until its own `qid#attempt` comes back
  (bounded). `completeRound` drains the queue before `complete`, and never completes over answers
  still pending. Revised by the review fixes in §14: an 8 s request limit (`createAnswerQueue`'s
  optional `requestTimeoutMs`), retries, a spinner budget with a background save, and a settle wait
  before the summary.
- **One question per word** in `word_tunnel`/`word_defense`. Every verdict reveals `correctDisplay`,
  so a repeated word would be answered by copying. minWords: Tunnel 5, Defense 8.
- **Empty submissions**: Enter on an empty field does nothing, and a second submit within 300 ms is
  ignored. Only the explicit Skip control sends an empty answer, and it unlocks after
  `minPlausibleMs(prompt)`. Unanswered prompts at time-up / HP 0 are left unanswered, not sent.
- **Typed accepted forms** for the new games: hyphen / space / no-space variants, a leading "to ",
  "(sb)/(sth)" parentheticals and "a / b" alternatives are accepted. Idioms are excluded, and so
  are headwords whose primary typed form has more than 3 words or does not fit the 40-character
  input, and headwords whose raw text is over 60 characters (§14). Near misses (1 edit) stay wrong, the same as `word_drop` today.
- **Server hardening**: typed answers longer than 200 characters are wrong without grading, and
  Levenshtein runs only when the lengths differ by ≤ 1 (a 3 MB answer used to cost ~10 s of CPU).
- **Cyrillic input** (common keyboard layout in Uzbekistan) blocks submit and shows "switch the
  keyboard to Latin".

Word Defense rules
- **Pending state**: on Enter the enemy freezes behind a shield and cannot breach. The next front
  enemy becomes the target. The verdict either kills the enemy, or releases it showing the revealed
  word, which the player can type for a correction kill (graded on the device, never sent — the
  server only grades attempts 1–5 and never counts retries). No verdict within 4 s = removed without
  score or HP loss. Two misses in a row → auto-pause "no connection".
- **Target lock**: the target is locked at the first typed character. If the locked enemy is
  resolved, the input is cleared and nothing is sent. A manual switch (Tab / ↑ / ↓ / target chips)
  also clears the input.
- **Pacing by kills, not by time** (the pre-mortem simulation showed median phone players losing
  in < 45 s): travel 18 s, −5 % every 4 kills, floor 9 s; spawn every `max(2.6 s, 5 s − 0.12 s × kills)`;
  at most 2 alive below 4 kills, 3 below 10, then 4. Encoded as a deterministic simulation test:
  a 4.5 s / 75 % player survives ≥ 60 s.
- **Readability**: the targeted prompt and its kind label are DOM text next to the input
  (aria-live), and every live enemy is a chip button. The 3D signs are secondary, short labels.

Tunnel
- Round 90 s; questions 12/12/14/15 (easy/medium/hard/expert), so the server's 80 % "completed" bar
  needs ≥ 7.5 s per word.

Layout and input (phones)
- While playing, the stage is a fixed overlay sized to `visualViewport` (above the AppShell /
  LandingHeader and the on-screen keyboard). The same element toggles classes, and the Canvas is
  never re-parented. HUD → prompt → scene → input. Every in-round control and the scene wrapper
  call `preventDefault` on pointerdown, so the input keeps focus.
- Rings and slots are a pure function of `input.value` (diffed on every input event): no
  keydown-driven text, so Android IME composition, glide typing and autocorrect work.
  keydown handles only Enter/Tab/arrows/Escape and ignores `isComposing`.
- A 3-2-1 countdown mounts and warms up the Canvas before the round clock starts. The scene chunk
  is prefetched on the intro screen. The stage stays mounted (hidden, `frameloop="never"`) across
  result and Play again.

Rendering
- three r180 needs **WebGL2**: the probe requires `webgl2`. Software rasterisers (SwiftShader,
  llvmpipe) start in 2D. Mobile non-Apple GPUs with ≤ 4 GB RAM, or known entry-level GPUs, use
  'low' (DPR 1, 30 rings × 6 glyphs). Every Scene3D sits in an error boundary whose fallback is that
  game's 2D renderer, and `webglcontextlost` is treated like a low-fps signal.
- Watchdog: samples only while playing and visible. A delta > 250 ms restarts the window, and 2 s
  of warm-up follow start/resume/resize. Two slow windows step high → low → 2D. The 2D result is
  persisted per device (`localStorage`), and the intro offers "try 3D again". `?render=2d|low|high`
  overrides it for QA and E2E.
- Tunnel glyphs: one InstancedMesh over one canvas atlas (whitelisted glyphs, everything else → "?").
  System font, so there is no font-load race. Uniforms are written through the owned material, and
  animation uses accumulators / `performance.now()`, not `clock.elapsedTime` (reset on frameloop
  changes).

Scope
- **Deferred: the Vocably Run re-skin (§7).** It is the riskiest and least valuable part: it adds
  GPU cost to the only existing 3D game, which has no watchdog, and it must keep Run's E2E contract.
  "Word Runner" is therefore **not built as a new game**: the operator should confirm whether Vocably
  Run counts as Word Runner or re-scope it (operator's decision).
- **Free tier** (operator's decision): free users get 6 sessions/day across all games, not 60
  (`TIER_VOCAB_LIMITS.free.dailySessions`). Default chosen: on `daily_limit`, play a practice round
  from the public bank (no XP, nothing saved) with a /pricing link. Raising the limit for the
  flagship games is the operator's call.
- Bundle: Next 16 `next build` no longer prints sizes. Measure the gzip size of the scene chunks
  directly and check that controller chunks contain no three.js.
- E2E fails on any CSP violation or `pageerror` while a round runs on the production build.

## 13. Settled while building (2026-11-06)

- **Counted-answer timing** (`scheduleCounted` + `createSendHold`, typing.js, shared by both
  games): a counted answer is held until `minPlausibleMs(prompt) + 150 ms` past the start of its
  interval. The interval runs from the later of (its prompt or enemy appeared, the previous counted
  send), so intervals never overlap. In Defense the enemy stays frozen (pending) meanwhile. In the
  tunnel (signed in only; guest rounds are graded on the device) the next word is already on screen
  and only the verdict waits. Ending a round releases whatever is still held, so it is queued before
  the session completes; leaving the page cancels it. Without the hold the tunnel sent a quick answer
  at once, and one under-floor answer in a short round (or a third of them in a long one) flagged the
  round as `impossible_response_time`, with no XP. The signed-in E2E caught it. Unit- and
  integration-tested against `assessSession`.
- **Pause key**: Escape only. P is a letter in a typing game. `visibilitychange` also pauses.
- **Defense keys**: Tab / Shift+Tab / ↑ / ↓ cycle targets inside the input, so Tab does not leave
  the field while a round runs. The enemy chips are the pointer and screen-reader way to switch.
- **Tunnel**: the next prompt appears as soon as Enter is pressed; the verdict for the previous word
  arrives while the next one is typed. A verdict is also announced in a polite live region, which
  outlasts the 1.8 s visual pill.
- **Stopping early**: ending a round before any word was sent abandons the server session and
  returns to the intro (no empty result screen). `tier` errors start a practice round, like `daily_limit`.
- **Missed words** show what was typed ("Siz yozdingiz: …") for guests too, not only signed in.
- **Measured bundle** (production build, Turbopack): three.js + R3F are one lazy chunk shared by
  both games, 226 KB gzip. TunnelScene3D is 4.2 KB and DefenseScene3D 4.6 KB. The controllers are
  15 KB (Tunnel) and 17 KB (Defense). No three.js in either page's initial chunks, so each game
  costs ≈ 230 KB gzip of 3D code, well under the 1.5 MB budget.
- **Answer clock and pauses**: a pause stops only the round clock. `shownAt` and `lastCountedAt`
  keep running in wall-clock time, which is what the server measures (§12): a pause must never make
  a looked-up word look fast. The earlier shift-on-resume was removed from both games.
- **Typed forms** (`typedForms.ts`, used by the server and by Defense corrections via
  `matchesRevealed`): for a headword the server accepts the bracket-free form ("look after (sb)" →
  "look after"), forms with the bracketed part kept, placeholders dropped (sb, sth, smb, smth,
  sb's, sth's), slash alternatives when every side is a word ("colour / color"; "24/7" stays
  literal), hyphen, space and no-space spellings, the form without a leading "to ", and always the
  literal headword. At most 48 forms.
- **One question per answer**: a typing round never asks two questions whose accepted forms overlap
  (duplicate headwords, "look after" next to "look after (sb)").
- **How a Defense round ends**: `cleared` when every word was killed or corrected, `held` when the
  enemies ran out with the base still standing ("Dushmanlar tugadi — baza saqlandi").
- **Share card**: a stopped or expired round gets a neutral "stopped" badge, never "Base held".
- **Licence page**: THIRD_PARTY_NOTICES.md is served as `/third-party-notices.txt` (static route)
  and linked from the So'z tunneli start screen next to the cooltypinggame credit.
- **Open Graph**: `pageOpenGraph()` (lib/seo/site.js) builds the whole OG block for each game page,
  because a page's `openGraph` replaces the root one entirely. Run and Speak use it too.
- **Phone layout**: below 440 px of visible height (keyboard open) the prompt or target card
  compacts, the input row (and Defense's chips) stick to the bottom of the stage, and the pause
  overlay covers the whole stage.
- **Focus**: tapping the scene or a card keeps the keyboard up (`keepTypingFocus`). The pause dialog
  traps Tab and focuses Resume. The result heading takes focus and reads the reason and the score.
  "Play again" focuses the input.
- **E2E under CPU rendering**: the Word Defense tests run at `deviceScaleFactor: 1`. Headless
  Chromium composites on the CPU, and at the Pixel 7's 2.625× a keystroke took seconds, so the
  targeted enemy reached the base mid-word. Real devices with a software renderer get 2D from
  detection; only the forced `?render=low` QA path runs 3D on SwiftShader.

## 14. Review fixes before merge (PR #30, 2026-11-06)

An independent review found eight problems, each confirmed by a second agent before it was fixed.

- **Saving a signed-in round** (`useFlagshipRound.js`):
  - Every request of the round (each answer flush, complete) is aborted after 8 s, using
    AbortController. An aborted request is an ordinary non-fatal failure, and its answers stay
    queued.
  - The drain tries a failed flush 3 times per stall, 600 ms and then 1200 ms apart, as
    GamePlayer does. A fatal reply (404, 409 or 410) ends the drain.
  - Answers still pending after those tries are never completed over: a completed session
    refuses every later answer with 409, so they would be lost for good. Instead the result
    screen says the result has not reached the server and offers "Qayta yuborish" (send again).
  - The server's complete is idempotent: a second call returns the finalized result. So it is
    retried once after a dropped connection or a 5xx.
  - One save runs per round (`round.sync`). "Send again" joins a save that is still running.
- **Finishing spinner budget**: the spinner stays up at most 8 s from the moment `finish()`
  starts, counting the settle wait below, and the save always gets at least 2 s. After that the
  result shows without XP and with the send-again notice, and the save carries on in the
  background. Its outcome is merged into the result when it lands, if that result is still the one
  shown.
- **Ending a round settles first**:
  - On every ending, `finish()` waits for verdicts still held or in flight before it makes the
    summary. The wait is bounded by `gradeTimeoutMs + 500 ms`, the same as the time-up wait.
  - Meanwhile a verdict changes only the score; `s.closed` then marks the summary as final.
  - So pressing "End" right after a shot counts that shot in the score, accuracy, missed list,
    share card and the guest's saved words.
- **WebGL context loss** is handled like the watchdog's last step: the round moves to 2D, shows a
  notice ("3D grafika to'xtadi — 2D rejimda davom etamiz."), and the intro and result screens offer
  "Try 3D again". Unlike that step, the stored render preference is left alone, because a context
  loss can be transient.
- **No prompt shows another question's answer**:
  - Once a typing round's questions are final, every other question's headword and accepted forms
    are masked in each `type_definition` prompt (`maskOtherAnswers`).
  - A prompt left with fewer than 6 letters is asked by its meaning instead, or dropped.
  - This runs before the session is stored, so the stored prompt and the client's prompt are the
    same string. The server's plausibility floor and the client's hold therefore agree.
  - `maskWordIn` turns curly apostrophes (’ ‘ ʼ ʻ and the backtick) into a straight one in both the
    text and the word first. Enriched definitions use curly apostrophes ("o’clock"), and without
    this an answer such as "o'clock" stayed visible.
- **Typed forms, revised** (`typedForms.ts`; this extends the §13 list):
  - **Cost**: brackets are found with one linear scan. A headword over 80 characters is accepted
    only as written, without parsing. `typeableWord` refuses a raw headword over 60 characters
    before any parsing. It then asks only for a primary typed form of at most 3 words that fits the
    40-character answer input. A typing round works out forms only for words it can ask. Before
    this, a 100 KB bracketed headword took a typing-game start 32 s.
  - **Optional letters**: a bracket that touches a letter on both sides is part of the word. Both
    spellings are accepted, the bracket-free one first: "colo(u)r" → "color", "colour";
    "judg(e)ment" → "judgment", "judgement".
  - A bracket that touches a letter on one side only gets the joined reading first, then the spaced
    one: "(un)able" → "able", "unable", "un able"; "interested(in)" → "interestedin",
    "interested in".
  - A word bracket with a slash picks one part: "organi(s/z)e" → "organise", "organize".
  - A bracket holding a placeholder, or a space, is always read as whole words: "look after(sb)"
    reads like "look after (sb)".
  - **Labels**: "[…]" is dropped ("ascertain [formal]" → "ascertain").
  - **Phrase alternatives**: a bare slash splits whole phrases only when the phrases are parallel.
    Every side must have 2 or more typed words, and all sides must share their first word or their
    last word: "deal with/cope with", "kind of/sort of", "look after/look for". Any other slash is
    read word by word, so "get on/along with" → "get on with", "get along with", and never
    "get on" alone.
  - **Known gaps**:
    - Phrase pairs that share no word ("come across/run into") keep the word-by-word reading, and
      only the headword exactly as written is right for them.
    - "in spite of/despite" accepts only "in spite of", and the headword as written.
