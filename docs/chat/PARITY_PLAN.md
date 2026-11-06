# Chat parity, wave 1: implementation plan

Branch `feat/chat-parity-calls`. Calls are specified in detail in [`CALLS_SPEC.md`](./CALLS_SPEC.md); this plan references its sections as `CS §n` and does not repeat them. Line references point at commit `c53732b`; re-check before editing.

## 0. Order and dependencies

```
WP1 RealtimeProvider ──┬──► WP4 client calls ──► WP9 E2E (calls)
WP2 realtime-server ───┤
WP3 Next API + models ─┘
WP2 emit-event + WP3 after() ──► WP5 multi-forward, WP6 drafts, WP7 reactions ──► WP9 E2E (parity)
WP8 UX polish: independent; the header part lives in WP4, the inline-meta row is shared with WP7 chips (do WP8.1 before WP7 UI)
```

Ship order: WP2 + WP1 (with the VPS deploy at `ws.vocably.uz`; fixes the current production degradation), WP3, WP4, then WP5-WP7 in any order, WP8 in parallel, WP9 continuously (each WP lists its own tests; WP9 holds the shared infrastructure and the cross-feature specs). One commit (or a small series) per WP.

## 1. Shared conventions (every WP)

- **Next 16**: before touching route handlers, viewport or `after`, read the matching guide in `node_modules/next/dist/docs/` (`01-app/03-api-reference/04-functions/after.md`, `.../generate-viewport.md`, route handler conventions). Route handlers use `const params = await props.params`. `after` is imported from `next/server`.
- **Comments in Uzbek**, like the codebase (identifiers stay English). Keep the existing comment style: explain why, reference the file/issue.
- **i18n for every visible string**: components use `const { t, ts } = useT()`. Every new key goes into `src/lib/i18n/messages/en.js` AND `uz.js` with identical key sets and placeholders (`src/lib/i18n/i18n.test.ts` enforces this), and into the new `src/lib/i18n/messages/ru.js`. `ru.js` is a partial dictionary written now for the coming ru launch: it is imported into `MESSAGES` but NOT added to `LOCALES` (the test `normalizeLocale('ru') === 'en'` must stay green); add a test in `i18n.test.ts` asserting every `ru` key exists in `en` with the same placeholders. Server-side strings stay Uzbek and get an English mapping in `src/lib/i18n/serverTextEn.js` (`serverText.test.ts` enforces coverage). Plurals: `{n#word|words}` in en only.
- **data-testid** on every new interactive element (names given per WP). Never rename existing testids or the aria-label texts used by E2E: `composer`, `reply-banner`, `attachment-tray`, `send-button`, `conversation-view`, `selection-bar`, `drop-zone`, `album`, `upload-overlay`, `voice-bubble`, `file-bubble`, `forwarded-label`, `media-viewer`, `forward-modal`, `delete-conversation-modal`, `chat-list`, `chat-row`, `row-draft`, `chat-menu`, `chat-selection-bar`, `archive-folder`, `archive-back`, attributes `data-msg-id`, `data-chat-media`; labels `Xabar matni|Message text`, `Xabar amallari|Message actions`, `Chat amallari|Chat actions`, `Javob berish|Reply`, `^Yuborish$|^Forward$`, `Tanlash|Select`.
- **UI**: Tailwind tokens only (`bg-surface`, `bg-surface-2`, `bg-accent`, `text-on-accent`, `text-muted`, `bg-accent-soft`, `text-danger`, ...), no raw hex; 44 px targets below `md`; `focus-visible:ring-2 focus-visible:ring-accent`; animations under `motion-safe:`; `aria-label` on icon buttons, `aria-pressed` on toggles; no new `window.alert` (WP8.14 removes the existing ones).
- **API**: `requireChatUser`, `connectToDatabase`, `checkRateLimit(userId, key, limit)` (new keys: `call-invite` 10, `ice-servers` 20, `chat-forward` 10, `chat-draft` 60, `chat-react` 60; `socket-ticket` raised to 60), `serverError(err, 'context')`, errors `{ error: <Uzbek>, code: <stable> }`, socket payloads carry `id` next to `_id`. Notification and realtime deliveries run inside `after(async () => { await Promise.allSettled([...]) })` (WP3).
- **Realtime**: new server-to-client events go through `POST /internal/emit-event` (allowlist, CS §5.1) via `emitEvent(userIds, event, payload)` in `src/lib/realtime.js`; client handlers subscribe with `useRealtime().on(event, fn)` and unsubscribe in the effect cleanup.
- **Tests**: vitest files sit next to the module (`foo.js` -> `foo.test.js`); DB tests are `*.integration.test.js` on MongoMemoryServer following `src/lib/duel/server.integration.test.js` (skippable with `SKIP_DB_INTEGRATION=1`); realtime-server tests live in `realtime-server/*.test.js` and are run by the root vitest, loading CommonJS with `createRequire(import.meta.url)`. E2E specs in `e2e/`, desktop project unless stated, never fixed sleeps (`expect.poll`).
- **Quality gates per WP**: `npm run lint`, `npm run type-check`, `npx vitest run`, the WP's E2E spec(s) with `--project=desktop --output=test-results/<wp>`.
- **No new dependencies** in either `package.json`. `realtime-server` gets a `package-lock.json` for its existing dependencies (`npm install` once, then `npm ci`).
- `AGENTS.md`: the block `next dev` re-adds is committed with the work (do not strip it from diffs).

## 2. Decisions applied and interpretations

Fixed decisions are listed in CS §0. Where the brief left room, this plan applies:

1. **Who gets call notifications**: the participant who did not act. Missed/busy/cancelled -> callee (push + Telegram); declined -> caller (Telegram only; the caller watched the decline live, so no push). CS §7.4.
2. **Chat header**: Phone + Video + `⋮` on every breakpoint; the four toggles (notify-online, Telegram notify, mute, block) and Profile move into the `⋮` menu (sheet below `lg`, popover on `lg`). This is the UX P1 header item; it supersedes the "hide below md" variant.
3. **Incoming call** is full-screen on desktop too (base call design); a desktop banner variant is wave 2.
4. **Reactions**: one reaction per user per message (Telegram non-premium); in a 1:1 chat a message has at most two. Chips show `emoji count` (`❤️ 2`).
5. **Own-device echo**: `message:new` is also emitted to the sender's own room (multi-device parity, gap audit item 4); `ChatContext` dedupes by `id` or `clientMessageId`.
6. **Drafts** use tombstones (empty draft with `updatedAt`) so a draft cleared on one device never resurrects from another device's cache; local dirty edits win until flushed (no client-clock comparison).
7. **Call list previews** are viewer-neutral strings (`📞 Javobsiz qo'ng'iroq` for missed/busy/cancelled), because `lastMessagePreview` is shared by both participants; the bubbles are viewer-specific.

---

## WP1. RealtimeProvider, socket re-auth, app-wide presence, unread badge, toast

Goal: one socket for the whole `(main)` zone that survives navigation and reconnects with fresh tickets; unread total in the nav and the tab title; in-app new-message toast on any `/app` page.

Depends on: nothing (the `conversation:read` self-event arrives with WP3; the handler is added here).

### Files

Create:
- `src/context/RealtimeContext.jsx` (provider + `useRealtime`)
- `src/lib/realtime/clientState.js` (pure helpers: `nextBackoffMs(attempt)`, `applyUnreadOnMessage(state, ctx)`, `titleWithBadge(title, n)`, `shouldToast(ctx)`)
- `src/lib/realtime/clientState.test.js`
- `src/lib/chat/unread.js` (server: `countUnread(userId)` and `unreadByConversation(userId, convos)` extracted from `conversations/route.js:70-83`)
- `src/app/api/chat/unread/route.js`
- `src/app/api/chat/unread/unread.integration.test.js`
- `src/components/layout/NavBadge.jsx`

Modify:
- `src/lib/socketClient.js` (CS §3.3: `connectChatSocket(fetchTicket)`)
- `src/app/app/(main)/layout.jsx` (`<RealtimeProvider><CallProvider><AppShell>{children}</AppShell><CallOverlay/><GlobalMessageToast/></CallProvider></RealtimeProvider>`; `CallProvider`/`CallOverlay` land in WP4, until then render only the realtime parts)
- `src/context/ChatContext.jsx` (drop the socket effect 1322-1473, `socketRef`, local `socketConnected`/`livePresence` state and `newMessageToast`; consume `useRealtime()`)
- `src/components/chat-friends/DoStlarPanel.jsx` (remove the `NewMessageToast` mount at 120-127)
- `src/components/chat-friends/NewMessageToast.jsx` (props unchanged; becomes the renderer used by `GlobalMessageToast`, defined in the same file; mobile placement at the top: `top-[calc(0.5rem+env(safe-area-inset-top))] inset-x-3 md:top-auto md:bottom-5`)
- `src/components/layout/navConfig.js` (`badge: 'chatUnread'` on both `dostlar` items)
- `src/components/layout/AppShell.jsx` (render `<NavBadge>` for items with `badge`, in the sidebar, rail and bottom bar)
- `src/app/api/chat/conversations/route.js` (use `src/lib/chat/unread.js`)
- `src/app/api/chat/socket-ticket/route.js` (limit 30 -> 60)
- `src/app/api/chat/conversations/[id]/messages/route.js` (the `pushNewMessage` payload gains `sender` and `silent`, see contracts; the `after()` move is WP3)
- `src/lib/i18n/messages/{en,uz,ru}.js`

### Contracts

`useRealtime()`:

```js
{
  configured,                 // !!process.env.NEXT_PUBLIC_REALTIME_URL
  socket, connected,          // Socket | null, boolean
  livePresence,               // { [userId]: boolean }  (presence:update + queryPresence results)
  queryPresence,              // (ids: string[]) => Promise<Record<string, boolean>>  (presence:query ack, 5 s timeout)
  emit,                       // (event, payload, ack?) => boolean   (false when disconnected)
  on,                         // (event, handler) => off
  unread,                     // { total, mutedTotal, chats }
  refreshUnread,              // () => Promise<void>   (GET /api/chat/unread, debounced 500 ms)
  setUnreadFromConversations, // (list) => void   (ChatProvider calls it after every list load/patch)
  activeConversationId, setActiveConversationId, // the open chat (ChatProvider keeps it in sync), null elsewhere
  toast, dismissToast,        // { conversationId, username, senderLabel, preview } | null
}
```

Connection lifecycle (inside the provider, effect keyed on `[chatAccess, chatUserId]`):
- `fetchTicket = () => fetch('/api/chat/socket-ticket', { method:'POST' })`: 200 -> `ticket`; 401/403 -> mark `stopped`, reject; other -> reject (the socket.io attempt fails and retries).
- `connect` -> `connected=true`, reset backoff, `queryPresence(knownIds)`, `refreshUnread()`, and the handlers registered via `on('connect')` (ChatProvider resync) run.
- `connect_error` with `err.message === 'unauthorized'` and `!socket.active` -> `setTimeout(() => socket.connect(), nextBackoffMs(attempt++))` with 2 s, 4 s, 8 s, 16 s, 30 s cap; skipped when `stopped`.
- `visibilitychange` to visible while disconnected and `stopped` -> clear `stopped`, try once.
- `disconnect` -> `connected=false`. Unmount (logout, leaving `(main)` for an exam) -> `socket.disconnect()`.
- E2E hook: `window.__vocablyRealtime = { socket }` only when `NEXT_PUBLIC_E2E_HOOKS === '1'`.

`message:new` payload (messages POST, extended): `{ conversationId, message, sender: { id, username, label }, silent }`, where `label` = the recipient's nickname for the sender (`convo.nicknames.get(String(otherId))`) or `@username`, and `silent = isConversationMuted(convo, otherId)`. Call rows from the realtime server carry no `sender` and are never toasted.

`GET /api/chat/unread` (requireChatUser, no rate limit, `Cache-Control: no-store`) -> `200 { total, mutedTotal, chats }`: unread incoming messages (`senderId != me`, `readAt: null`, not `deletedFor` me, not silently deleted, after my `clearedAt`) in my conversations that are not hidden and not archived for me; `total` excludes muted conversations, `mutedTotal` counts only muted ones, `chats` = number of non-muted conversations with unread > 0. Same aggregate as `conversations/route.js:70-83`, shared through `src/lib/chat/unread.js`.

Unread state in the provider:
- `refreshUnread()` on connect, on `visibilitychange` to visible, after `conversation:read` (self-event, WP3), and every 60 s only while `!connected && document.visibilityState === 'visible'`.
- `message:new`: `applyUnreadOnMessage` increments `total` (or `mutedTotal` when `silent`) when `message.senderId !== me`, `!message.readAt`, and the message is not in the active, visible conversation.
- `setUnreadFromConversations(list)` recomputes from `unreadCount`/`muted`/`archived` whenever ChatProvider has the list (authoritative while on `/app/friends`).

Toast (`shouldToast`): `message:new` with `senderId !== me`, `message.type !== 'call'`, `!silent`, and not (`conversationId === activeConversationId && !document.hidden`). Shows 5 s; click -> `router.push('/app/friends/' + username)`; `playMessageBlip()` (CS §9.4) when audio is unlocked and the tab is visible. Inside `/app/friends` the same toast is used (ChatProvider no longer has its own).

Tab title: effect on `unread.total` sets `document.title = titleWithBadge(document.title, total)` (`(3) Vocably`; strips an existing `^\(\d+\) ` prefix; 0 -> no prefix; `99+` cap), plus a `MutationObserver` on `document.head` that re-applies the prefix when Next updates `<title>` on navigation.

Nav badge (`NavBadge({ count, mutedOnly })`): `count > 0` -> `min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-on-accent text-[10px] font-semibold leading-[18px] text-center` with `99+` cap; only muted unread -> `w-2 h-2 rounded-full bg-muted`; `aria-hidden` on the pill plus `<span className="sr-only">{t('nav.unreadAria', { n })}</span>`; `data-testid="nav-unread-badge"`, `data-count`. Sidebar: right of the label; rail and bottom bar: `absolute -top-1 -right-1` on the icon.

ChatContext after the refactor:
- `const { socket, connected, livePresence, queryPresence, emit, on, setActiveConversationId, setUnreadFromConversations } = useRealtime()`.
- One effect subscribes `connect` (resync: `loadConversations`, silent `loadMessages`, `flushOfflineQueue`; also run once at mount when already connected), `message:new`, `message:read`, `message:edited`, `message:deleted`, `typing`, `conversation:read` (zero that row's `unreadCount`; the realtime provider refreshes the total) and returns all `off()`s.
- `message:new`: append when the conversation is active (dedupe by `id` OR `clientMessageId`: if a bubble with the same `clientMessageId` exists, replace it with the server copy), `markRead` when visible, `touchList(conversationId, { preview: previewForMessage(message), createdAt, incoming: String(message.senderId) !== myId && !message.readAt })`. No toast logic.
- `queryPresenceForKnownUsers` -> `queryPresence(ids)`; `sendTyping` -> `emit('typing', ...)`.
- Provider value keeps `socketConnected: connected` and `livePresence` (consumers `ConversationList.jsx:215`, `ConversationView.jsx:184`, `MessageBubble` ticks unchanged).
- Polling fallback (1478-1503) unchanged, keyed on `connected`.
- `setActiveConversationId(activeConversation?.id ?? null)` in an effect, `null` on unmount.
- `setUnreadFromConversations(conversations)` in an effect on `conversations`.

### i18n

| key | uz | en | ru |
|---|---|---|---|
| nav.unreadAria | {n} ta o'qilmagan xabar | {n} unread {n#message\|messages} | {n} непрочитанных |

### Acceptance

- Navigating `/app` -> `/app/friends` -> `/app/games` keeps ONE socket (no `disconnect` in between; check the Network tab or `window.__vocablyRealtime.socket.id` stays the same).
- A network drop longer than 60 s reconnects without reload; a revoked session (401 on ticket) stops retrying, with at most 1 ticket request per backoff step.
- With a new message from the friend: on `/app/games` a toast appears with the nickname/@username and the translated preview; clicking it opens the chat. No toast for muted chats, own messages, call rows, or the chat that is open and visible.
- The Friends nav item shows the unread count on desktop sidebar, rail and mobile bottom bar; the tab title reads `(n) <title>` and survives client navigation; both drop to 0 after reading the chat on another device (with WP3's self-event) or this one.
- Exam pages (`(exam)` group) have no socket.
- `npm run lint`, existing chat E2E (`chat-telegram`, `chat-media`) green.

### Tests

- `src/lib/realtime/clientState.test.js`: backoff sequence and cap; `applyUnreadOnMessage` (own message, muted, active visible chat, active hidden chat, read message); `titleWithBadge` (0, 3, 120 -> `(99+)`, existing prefix replaced); `shouldToast` matrix.
- `src/app/api/chat/unread/unread.integration.test.js`: counts only incoming unread, excludes archived/hidden/cleared/deletedFor, splits muted into `mutedTotal`.
- E2E in `e2e/chat-parity.spec.ts` (WP9): badge + title + toast on `/app` with a local realtime server.

---

## WP2. realtime-server: calls.js, emit-event primitive, coturn, Docker/compose

Goal: the sidecar runs the call state machine, persists outcomes, offers a generic emit-event primitive, and is deployable on the VPS behind Caddy at `ws.vocably.uz` with coturn beside it.

Depends on: nothing (call-event route from WP3 is needed for history; without it `persist` logs failures and calls still work).

### Files

Create:
- `realtime-server/server.js` (`createRealtimeServer`, CS §5.1)
- `realtime-server/calls.js` (`createCallManager`, CS §4, §5.2)
- `realtime-server/persist.js` (CS §5.3)
- `realtime-server/calls.test.js`, `realtime-server/persist.test.js`, `realtime-server/server.integration.test.js` (skips when `realtime-server/node_modules/socket.io` is absent)
- `realtime-server/package-lock.json` (from `npm install` of the existing deps)
- `realtime-server/coturn/turnserver.conf` (CS §8.2)
- `realtime-server/Caddyfile.snippet` (CS §8.3)

Modify:
- `realtime-server/index.js` -> bootstrap only (dotenv, `createRealtimeServer().listen(PORT)`, `SIGTERM`/`SIGINT` -> `shutdown()` then exit)
- `realtime-server/Dockerfile` (`COPY package.json package-lock.json ./`, `RUN npm ci --omit=dev`, `COPY *.js ./`)
- `realtime-server/docker-compose.yml` (CS §8.3: `realtime` + `coturn`, external network `socialauto_default`, no minio, no ports on realtime)
- `realtime-server/.env.example` (remove `JWT_SECRET`; add `REALTIME_ALLOWED_ORIGINS`, `TURN_SECRET`, `CALL_RING_TIMEOUT_MS`, `CALL_CONNECT_TIMEOUT_MS`, `CALL_GRACE_MS`; `NEXTJS_INTERNAL_URL` marked required for call history)

Delete: `realtime-server/nginx-realtime.conf`, `realtime-server/nginx-media.conf`.

### Contracts

- All socket events: CS §3. State machine and timers: CS §4. Module APIs: CS §5.2-5.3.
- `POST /internal/emit-event` `{ userIds: string[1..10], event, payload }` -> `200 {ok:true}`; 400 `{error}` for a non-allowlisted event, bad ids, or a non-object payload; 401 bad secret. Allowlist: `message:new`, `message:reacted`, `draft:update`, `conversation:read`.
- `POST /internal/call-end` `{ userId, peerId?, reason:'blocked'|'banned'|'admin' }` -> `{ok:true, ended}`.
- `GET /internal/calls/:userId` -> `{inCall, callId?, state?}`; `GET /health` -> `{ok:true, calls, online}`.
- Behaviour of existing endpoints and events is unchanged (`/internal/emit`, `emit-edited`, `emit-deleted`, `read`, `presence/:userId`, `presence:query`, `typing`, `presence:update`).
- Production startup fails without `REALTIME_ALLOWED_ORIGINS`.

### Deploy steps (ops, same WP)

1. DNS A `ws` and `turn` -> 185.237.97.126 (ahost.uz zone editor).
2. `/home/vocably-realtime/` <- the `realtime-server/` files; `.env` (chmod 600) per CS §1.3.
3. `docker compose up -d --build`; `ufw allow 3478/udp 3478/tcp 49160:49360/udp`.
4. Append `Caddyfile.snippet` to `/home/socialauto/Caddyfile`; `docker exec socialauto-caddy-1 caddy reload --config /etc/caddy/Caddyfile`.
5. Verify: `curl https://ws.vocably.uz/health`; `docker logs vocably-realtime` has no `unauthorized` storms; `docker logs vocably-coturn` shows the listener on 3478 with the realm.
6. Vercel (dashboard): `REALTIME_INTERNAL_URL` and `NEXT_PUBLIC_REALTIME_URL` = `https://ws.vocably.uz`, `TURN_SECRET` (same value as the VPS `.env`, `openssl rand -hex 32`), `TURN_URLS`, `STUN_URLS`, `TURN_TTL_SEC=3600`; redeploy (build-time CSP + public env).

### Acceptance

- `node realtime-server/index.js` with the old env behaves as before for presence/typing/emit endpoints (existing clients unaffected).
- Every row of CS §3 and §4.3 is covered by `calls.test.js` and passes.
- `docker compose config` is valid; the image builds from the lockfile.
- After deploy: production chat sends no longer wait on a dead realtime host; the browser shows a `wss://ws.vocably.uz` 101.

### Tests

`realtime-server/calls.test.js` and `persist.test.js` exactly as CS §15.1. `realtime-server/server.integration.test.js`: boot `createRealtimeServer` on port 0 with a stub HTTP server as `NEXTJS_INTERNAL_URL`; connect two users with `socket.io-client` (root dependency) using tickets signed by the test secret; one invite -> accept -> sdp relay -> connected -> end round trip and one `emit-event` delivery; `emit-event` rejects a non-allowlisted event with 400.

---

## WP3. Next API and models: call type, grant, ice-servers, call-event, after() deliveries, call notifications

Goal: everything server-side in Next.js that calls need, plus moving all chat deliveries into `after()`, the own-device echo and the `conversation:read` self-event.

Depends on: WP2 (`emit-event`, `call-end` endpoints) for the realtime parts; the routes work without the sidecar (helpers are silent no-ops).

### Files

Create:
- `src/app/api/chat/conversations/[id]/calls/route.js` (CS §6.1)
- `src/app/api/chat/ice-servers/route.js` (CS §6.2)
- `src/app/api/internal/call-event/route.js` (CS §6.3)
- `src/lib/turn.js` + `src/lib/turn.test.js` (CS §8.1)
- `src/lib/chatNotify.js` (CS §7.4: moved `notifyRecipientViaTelegram`, `escapeHtml`; new `notifyCallViaTelegram`)
- `src/lib/chat/conversationAccess.js` (`loadConversationForUser(conversationId, userId)`, `findBlockBetween(aId, bId)`)
- `src/lib/chat/photoVisibility.js` (`visiblePhotoId(owner, viewerId)`) if no equivalent helper exists
- integration tests: `src/app/api/internal/call-event/callEvent.integration.test.js`, `src/app/api/chat/conversations/[id]/calls/calls.integration.test.js`, `src/app/api/chat/conversations/[id]/messages/messages.calls.integration.test.js`

Modify:
- `src/lib/models.js` (CS §7.1: `CallInfoSchema`, enum, `call`, partial unique index, `tgCallNotifiedAt`)
- `src/lib/chatConstants.js` (CS §7.2: `CALL_OUTCOMES`, `PREVIEW_BY_TYPE.call`, `REPLY_TYPE_LABEL.call`, `formatCallDuration`, `callPreview`, `previewForMessage`)
- `src/lib/i18n/serverTextEn.js` (CS §7.2 strings)
- `src/lib/realtime.js` (add `emitEvent(userIds, event, payload)` and `forceEndCall(userId, reason, peerId)`, both via `postInternal`)
- `src/lib/webPush.js` (extra payload fields) and `public/sw.js` (`tag`, `renotify`, `requireInteraction`, `actions`; `callback` action)
- `src/lib/auth.js:66-70` (reject any scoped token)
- `src/lib/chatRead.js` (after marking read: `emitEvent([readerId], 'conversation:read', { conversationId, readAt })` besides the existing `pushMessagesRead(otherId)`)
- `src/app/api/chat/conversations/[id]/messages/route.js` (reject `type:'call'`; `resolveForward` rejects call rows; replyTo ignores call rows; `previewForMessage`; Telegram helpers from `chatNotify.js`; `loadConversationForUser` from the shared helper; deliveries in `after()`; own-device echo)
- `src/app/api/chat/conversations/[id]/messages/[messageId]/route.js` (`previewForMessage`; `pushMessageEdited` / `pushMessageDeleted` inside `after()`)
- `src/app/api/chat/conversations/[id]/messages/[messageId]/pin/route.js` (reject call rows)
- `src/app/api/chat/conversations/[id]/read/route.js` and the GET messages read side effect (keep fire-and-forget semantics but wrap `markConversationRead`'s pushes in `after()`)
- `src/app/api/chat/block/route.js` (`after(() => forceEndCall(user._id, 'blocked', targetId))`)
- `src/app/api/admin/chat/users/[id]/route.js` (`after(() => forceEndCall(id, 'banned'))` when `chatBanned` becomes true)
- `src/components/admin/ConversationViewer.jsx` (call row rendering, CS §6.5)
- `.env.example` (`TURN_SECRET=`, `TURN_URLS=turn:turn.vocably.uz:3478?transport=udp,turn:turn.vocably.uz:3478?transport=tcp`, `STUN_URLS=stun:turn.vocably.uz:3478`, `TURN_TTL_SEC=3600`, `NEXT_PUBLIC_CALL_FORCE_RELAY=`, `NEXT_PUBLIC_E2E_HOOKS=` next to the `REALTIME_*` block; `NEXT_PUBLIC_REALTIME_URL=https://ws.vocably.uz`)
- `docs/DB_SCHEMA.md` (type enum, `call`, `tgCallNotifiedAt`, WP6 `drafts`, WP7 `reactions`), `docs/API_INVENTORY.md` (new routes, internal endpoints, socket events)

### Contracts

- Grant, ICE servers, call-event, force-end: CS §6.1-6.4. Data: CS §7. Notifications: CS §7.4.
- `after()` pattern for every chat route that delivers:

```js
import { after } from 'next/server';
// ... after the DB writes:
after(async () => {
  // Javob qaytgandan keyin yuboriladi: Vercel funksiyani bu callback tugaguncha (maxDuration doirasida) tirik saqlaydi,
  // shuning uchun avvalgi "await Promise.allSettled" kafolati saqlanadi, lekin yuboruvchi kutib qolmaydi.
  await Promise.allSettled(deliveries.map((d) => d()));
});
return NextResponse.json({ message });
```

  Deliveries are thunks created inside the callback (nothing starts before the response). The comment at `messages/route.js:261-266` is replaced accordingly. Applies to: messages POST (realtime + push + Telegram), `[messageId]` PATCH/DELETE, read, block, admin ban, call-event, and the WP5-WP7 routes.
- Own-device echo in messages POST: besides `pushNewMessage(otherId, ...)`, `emitEvent([user._id], 'message:new', { conversationId, message: payload, self: true })` (no `sender`/`silent`; ChatContext dedupes by `clientMessageId` and never toasts own messages).
- `emitEvent(userIds, event, payload)`: `postInternal('/internal/emit-event', { userIds: userIds.map(String), event, payload })`, 3 s abort, no-op without env, never throws.

### Acceptance

- `POST .../calls` returns a verifiable grant and ICE servers for a legitimate pair; 403/404/429/503 per CS §6.1.
- `POST /api/internal/call-event` is idempotent (two identical calls -> one document) and updates the conversation preview; missed calls trigger exactly one push and one Telegram message to the callee (when opted in, not muted), declined calls one Telegram message to the caller (when opted in).
- A client can no longer create, forward, pin or reply to `type:'call'` messages.
- Sending a message returns before push/Telegram finish (measure: response time no longer includes the realtime 3 s timeout when the sidecar is down); recipients still get all deliveries.
- Sender's second tab receives its own message live without a reload and without a duplicate bubble.
- Reading a chat on one device clears its row badge and the nav total on the other device.
- `serverText.test.ts` and `i18n.test.ts` green.

### Tests

CS §15.1 (`turn.test.js`, chatConstants additions in `chatLib.test.js`) and CS §15.2 integration suites, plus: messages POST integration asserts `after` was used (mock `next/server` `after` to collect callbacks; the response resolves before callbacks run) and that the own-device echo targets the sender.

---

## WP4. Client calls: lib/call, CallContext, overlay screens, CallBubble, header, i18n

Goal: the full call UX per CS §9-12.

Depends on: WP1 (realtime context), WP2 (signaling), WP3 (routes, `type:'call'`).

### Files

Create:
- `src/lib/call/callMachine.js` + `callMachine.test.js` (CS §9.1)
- `src/lib/call/peer.js` + `peer.test.js` (CS §9.2)
- `src/lib/call/devices.js` (CS §9.3)
- `src/lib/call/sounds.js` (CS §9.4)
- `src/lib/call/callLabels.js` + `callLabels.test.js` (CS §9.5)
- `src/context/CallContext.jsx` (CS §9.6)
- `src/components/call/CallOverlay.jsx`, `IncomingCallScreen.jsx`, `InCallScreen.jsx`, `CallControls.jsx`, `CallBackground.jsx`, `MinimizedCall.jsx`, `ElsewhereBanner.jsx`, `CallErrorSheet.jsx` (CS §10.1-10.7)
- `src/components/chat-friends/CallBubble.jsx` (CS §10.8)
- `src/components/chat-friends/ActionSheet.jsx` (generalised `ChatMenu`: props `{ open, title?, items: [{ key, label, icon, onSelect, pressed?, danger?, testid? }], onClose, anchorRef?, testid }`; renders a bottom sheet below `lg` and an anchored popover on `lg` via `useIsPointer` from WP8.9; Escape, outside click, focus restore, `role="dialog"`/`menu`)
- `src/components/chat-friends/CallbackSheet.jsx` (CS §10.9)
- `src/lib/chat/mediaControl.js` (move `pauseOtherMedia` out of `MessageBubble.jsx:295-299`; export `PAUSE_MEDIA_EVENT = 'vocably:pause-media'`)

Modify:
- `src/app/app/(main)/layout.jsx` (mount `CallProvider` and `CallOverlay`)
- `src/components/chat-friends/ConversationView.jsx` (header per CS §10.9: Phone, Video, `⋮` with the four toggles + Profile in `ActionSheet` `data-testid="chat-more-menu"`; name `text-[15px] font-semibold`, status `text-xs`; `CallbackSheet` from `pendingCallback`; selection-bar Forward disabled when a selected message is `type:'call'`; replace the header `alert(ts(res.error))` with the WP8.14 toast)
- `src/components/chat-friends/MessageBubble.jsx` (CallBubble branch in the type switch 697-710; call rows: actions Select + Delete only, no swipe, no ticks; listen to `PAUSE_MEDIA_EVENT`; import `pauseOtherMedia` from `mediaControl.js`)
- `src/components/chat-friends/UserProfileModal.jsx` (call pills under the title 356-362)
- `src/components/chat-friends/VoiceRecorder.jsx`, `VideoRecorder.jsx` (disabled with `call.busyToast` while `call.status !== 'idle'`)
- `src/lib/i18n/messages/{en,uz,ru}.js` (all keys of CS §11)

### Contracts

`useCall()` API: CS §9.6. Component props:
- `CallOverlay()` (no props, reads `useCall()`).
- `IncomingCallScreen({ call, onAccept(videoOff), onDecline, onMinimize })`.
- `InCallScreen({ call, localStream, remoteStream, onEnd, onMinimize, controls })`.
- `CallControls({ call, onToggleMic, onToggleCamera, onFlip, onSelectOutput, onEnd, canFlip, canChooseOutput })`.
- `MinimizedCall({ call, remoteStream, onRestore, onAccept, onDecline })`.
- `CallBubble({ message, isMine })` (gets `startCall`/`canCall` from `useCall()` and the peer from `useChat().activeConversation`).
- testids: CS §10 (`call-audio-button`, `call-video-button`, `chat-more-button`, `chat-more-menu`, `incoming-call`, `call-accept`, `call-accept-audio-only`, `call-decline`, `call-accept-mini`, `call-decline-mini`, `call-overlay`, `call-status`, `call-minimize`, `call-pip`, `remote-video`, `local-video`, `remote-audio`, `call-peer-muted`, `call-peer-camera-off`, `call-mute`, `call-camera`, `call-flip`, `call-output`, `call-end`, `call-enable-sound`, `call-minimized`, `call-pip-card`, `call-elsewhere`, `call-error-sheet`, `call-retry`, `call-message`, `call-callback-sheet`, `call-callback-audio`, `call-callback-video`, `profile-call-audio`, `profile-call-video`).

### Acceptance

- Every flow of CS §2 works between two browsers (manual) and in E2E (CS §15.3 cases 1-11).
- The call survives navigation between any `(main)` pages (strip/PiP card), Android back minimises, Escape never declines or hangs up.
- No `window.alert` in call code; media errors show `CallErrorSheet` with `mediaErrorMessage` text.
- Header fits 320 px without truncating the name below ~120 px; desktop DOM keeps the labels used by `chat-telegram.spec.ts` (the toggles are now inside `chat-more-menu`, no spec clicks them today).
- uz/en/ru keys complete; `i18n.test.ts` green.

### Tests

CS §15.1 client unit suites; CS §15.3 E2E (`e2e/chat-call.spec.ts`, infra in WP9).

---

## WP5. Multi-forward (batch, hide author, per-target results)

Goal: forward one or many selected messages to up to 10 chats in one request, optionally without the "Forwarded from" header.

Depends on: WP3 (`after()` pattern, `chatNotify.js`, `loadConversationForUser`, call-row guard).

### Files

Create:
- `src/lib/chat/forward.js` (extracted from `messages/route.js` `resolveForward`: `buildForwardCopies({ sources, targetConvo, sender, hideAuthor, clientBatchId })` returns message docs ready for `insertMany`; pure parts unit-tested)
- `src/lib/chat/forward.test.js`
- `src/app/api/chat/messages/forward/route.js`
- `src/app/api/chat/messages/forward/forward.integration.test.js`

Modify:
- `src/app/api/chat/conversations/[id]/messages/route.js` (single forward keeps working through `forward.js`; no behaviour change)
- `src/components/chat-friends/ForwardMessageModal.jsx` (multi-select)
- `src/context/ChatContext.jsx` (`forwardMessages(list, targetIds, { hideAuthor })`)
- `src/components/chat-friends/ConversationView.jsx` (selection bar + row "Forward" call the new API)
- `src/components/chat-friends/MessageBubble.jsx` (`forwarded-label` hidden when `forwardedFrom.hidden`)
- `src/lib/models.js` (`forwardedFrom.hidden: Boolean` default false)
- `e2e/chat-telegram.spec.ts` line 76 (pick a chat, then press `forward-send`)
- `src/lib/i18n/messages/{en,uz,ru}.js`

### Contracts

`POST /api/chat/messages/forward`, `requireChatUser`, rate limit `chat-forward` 10/min (one hit per batch):

```json
{
  "sourceConversationId": "<id>",
  "messageIds": ["<id>", "..."],           // 1..50, order preserved by createdAt
  "targetConversationIds": ["<id>", "..."], // 1..10, unique
  "hideAuthor": false,
  "clientBatchId": "<uuid>"
}
```

- Validation: `400 code:'bad_request'` for empty/oversized arrays or non-ObjectIds; `messageIds.length * targetConversationIds.length > 100` -> `400 code:'too_many'`; source must be loadable for the user (`404 code:'not_found'`).
- Source messages: must belong to the source conversation, not `deletedFor` me, not deleted for everyone; `type:'call'` rows are skipped and returned in `skipped: [{ id, reason:'call' }]`; missing ones `reason:'not_found'`.
- Per target (sequential, independent): conversation membership, not blocked either way (`code:'blocked'`), target user not `chatBanned` (`code:'unavailable'`). Failures are per-target, never fail the batch.
- Copies: `clientMessageId = \`${clientBatchId}:${sourceId}:${targetId}\`` (unique index on `{conversationId, senderId, clientMessageId}` makes retries idempotent; on duplicate key return the existing docs); albums get a fresh `albumId` per target; `forwardedFrom = { userId, username, messageId, hidden: hideAuthor }` (when the source is already a forward, keep the original author); `hideAuthor` keeps media and captions (comment and caption stripping are wave 2).
- Conversation preview/`lastMessageAt`/unhide per target exactly as single sends.
- Deliveries in `after()`: per successful target one `message:new` per copy to the recipient (WP1 payload with `sender`/`silent`), own-device echo, ONE push and ONE Telegram notification per target (preview = last copy).
- Response `200`:

```json
{
  "results": [
    { "conversationId": "<id>", "ok": true, "messages": [ { "...": "serialized message" } ] },
    { "conversationId": "<id>", "ok": false, "error": "<Uzbek>", "code": "blocked" }
  ],
  "skipped": [ { "id": "<id>", "reason": "call" } ]
}
```

Client:
- `ForwardMessageModal` props `{ open, messages, onClose, onSent }`; list rows are checkboxes (`data-testid="forward-target"`, `aria-checked`), cap 10 (further rows disabled with `ch.forwardLimit`); search field kept; footer: "Hide sender name" switch (`forward-hide-author`, only shown when at least one message has an author other than me or is a forward), Send button (`forward-send`, label `ch.forwardSend` with count). `testid="forward-modal"` preserved.
- `forwardMessages` posts once; on success appends copies into the active conversation if it is a target; result summary through the WP8.14 toast: all ok -> `ch.forwardDone {n}`; partial -> `ch.forwardPartial {ok} {total}` listing failed usernames; none -> server error text via `ts()`.
- Single-chat pick closes and navigates to that chat (Telegram behaviour); multiple targets stay on the current chat.

### i18n

| key | uz | en | ru |
|---|---|---|---|
| ch.forwardSend | Yuborish ({n}) | Send ({n}) | Отправить ({n}) |
| ch.forwardHideAuthor | Yuboruvchi nomini yashirish | Hide sender name | Скрыть имя отправителя |
| ch.forwardLimit | Ko'pi bilan 10 ta chat | Up to 10 chats | Не более 10 чатов |
| ch.forwardDone | {n} ta chatga yuborildi | Sent to {n} {n#chat\|chats} | Отправлено в чатов: {n} |
| ch.forwardPartial | {total} tadan {ok} tasiga yuborildi | Sent to {ok} of {total} | Отправлено: {ok} из {total} |
| ch.forwardSkippedCalls | Qo'ng'iroqlar uzatilmaydi | Calls can't be forwarded | Звонки нельзя переслать |

Server strings (`serverTextEn`): `Juda ko'p xabar tanlandi`, `Bu chatga yuborib bo'lmaydi`, `Foydalanuvchi mavjud emas`.

### Acceptance

- Selecting 3 messages (one an album) and 2 targets produces 3 bubbles (album intact) in each target, in source order, live on both recipients' screens; each recipient gets one push/Telegram notification.
- Retrying the same request (same `clientBatchId`) creates no duplicates.
- Blocked target -> that row reports failure, the other target succeeds.
- `hideAuthor` copies show no `forwarded-label` for the recipient.
- Call rows are not selectable for forwarding (WP4) and are skipped server-side.

### Tests

`forward.test.js` (clientMessageId scheme, album regrouping, original author kept, hidden flag); `forward.integration.test.js` (happy path, idempotent retry, blocked target partial, call skipped, 100-copy cap, rate limit). E2E in `chat-parity.spec.ts` (WP9): forward 2 messages to 2 chats, assert both receivers.

---

## WP6. Server-synced drafts

Goal: a draft typed on one device appears in the chat list and composer on the other; localStorage stays as the instant cache and offline fallback.

Depends on: WP2 `emit-event` (`draft:update`), WP3 `after()`.

### Files

Create:
- `src/app/api/chat/conversations/[id]/draft/route.js` (GET, PUT)
- `src/app/api/chat/conversations/[id]/draft/draft.integration.test.js`
- `src/lib/chat/draftSync.js` (client: `createDraftSync({ fetchImpl, now, debounceMs: 1500 })` with `schedule(conversationId, draft)`, `flush()`, `merge(local, remote)`)
- `src/lib/chat/draftSync.test.js`

Modify:
- `src/lib/models.js` (`Conversation.drafts: Map<String, DraftSchema>`; `DraftSchema = { text: String (max 4000), replyTo: ObjectId|null, updatedAt: Date }`, `_id:false`)
- `src/app/api/chat/conversations/route.js` (GET and POST shapes add `draft: { text, replyTo, updatedAt } | null` for the viewer)
- `src/app/api/chat/conversations/[id]/messages/route.js` (on successful send: set the sender's draft to a tombstone `{ text:'', replyTo:null, updatedAt: now }` in the same update as `lastMessageAt`, and emit `draft:update` to the sender in `after()`)
- `src/lib/drafts.js` (stored value gains `updatedAt`; old string values read as `{ text, updatedAt: 0 }`)
- `src/context/ChatContext.jsx` (merge server drafts on list load; `draft:update` handler; `saveDraft` -> local + `draftSync.schedule`; `pagehide`/`visibilitychange:hidden` -> `draftSync.flush()` with `keepalive: true`)
- `src/components/chat-friends/Composer.jsx` (apply an incoming remote draft only when the textarea is not focused and the local text is not dirty)
- `src/components/chat-friends/ConversationList.jsx` (`row-draft` reads the merged draft)

### Contracts

- `GET /api/chat/conversations/[id]/draft` -> `200 { draft: { text, replyTo, updatedAt } | null }`.
- `PUT /api/chat/conversations/[id]/draft` body `{ text (0..4000), replyTo: id|null, deviceId: string(1..64) }`, rate limit `chat-draft` 60/min -> `200 { draft }`. The server sets `updatedAt = now` (server clock only). `text.trim()===''` and `replyTo===null` stores a tombstone. `replyTo` must be a message in this conversation, else stored as null. Then `after(() => emitEvent([user._id], 'draft:update', { conversationId, draft, deviceId }))`.
- Socket `draft:update` (self only) `{ conversationId, draft, deviceId }`; the client ignores events carrying its own `deviceId` (random id in `sessionStorage` key `vocably:deviceId`).
- Merge rule (`merge(local, remote)`): if the local entry is dirty (edited and not yet acknowledged by a PUT), local wins; otherwise the newer `updatedAt` wins (both server-issued after the first sync; legacy local values have `updatedAt: 0`). A tombstone wins like any draft, so a cleared draft does not reappear.
- `draftSync` debounces 1500 ms per conversation, coalesces, retries once on network error, and gives up silently (localStorage still holds it).

### Acceptance

- Type "salom" in chat A on device 1, wait 2 s: device 2's chat list shows the draft row for A; opening A shows "salom" in the composer.
- Sending from device 2 clears the draft on device 1's list (tombstone + `draft:update`).
- Typing on device 1 while device 2 is focused in the same composer does not overwrite device 2's text.
- Offline typing persists locally and syncs on the next successful PUT.

### Tests

`draftSync.test.js` (debounce/coalesce, flush, merge matrix incl. tombstone and legacy string values); `draft.integration.test.js` (GET/PUT, tombstone, replyTo validation, rate limit, cleared on send, other participant cannot read it). E2E two contexts in `chat-parity.spec.ts`.

---

## WP7. Reactions

Goal: Telegram-style reactions with 6 quick emoji plus the full picker, chips in the bubble's bottom row, live sync.

Depends on: WP2 `emit-event` (`message:reacted`), WP3 `after()`, WP8.1 (inline meta row) for the chip layout.

### Files

Create:
- `src/app/api/chat/conversations/[id]/messages/[messageId]/reactions/route.js` (POST, DELETE)
- `src/app/api/chat/conversations/[id]/messages/[messageId]/reactions/reactions.integration.test.js`
- `src/components/chat-friends/ReactionBar.jsx` (quick row in the message action menu/long-press sheet)
- `src/components/chat-friends/ReactionChips.jsx`
- `src/lib/chat/reactions.js` + `reactions.test.js` (`QUICK_REACTIONS = ['👍','❤️','😂','😮','😢','🔥']`, `isAllowedEmoji(e)` (single grapheme, emoji property, max 16 bytes), `groupReactions(reactions, myId)` -> `[{ emoji, count, mine }]` ordered by first `at`, `applyReaction(list, { userId, emoji|null, at })`)

Modify:
- `src/lib/models.js` (`ReactionSchema = { emoji: String, userId: ObjectId, at: Date }`, `_id:false`; `Message.reactions: [ReactionSchema]` default `[]`)
- message serializers (messages GET/POST payloads) include `reactions`
- `src/context/ChatContext.jsx` (`reactToMessage(messageId, emoji|null)` optimistic with rollback; `message:reacted` handler)
- `src/components/chat-friends/MessageBubble.jsx` (chips in the bottom row before the time; double-tap/double-click on text and sticker bubbles toggles ❤️; ReactionBar at the top of the action menu)
- `src/components/chat-friends/EmojiPicker.jsx` (reuse as the "+" picker, `mode="reaction"` closes on pick)
- `src/lib/chatConstants.js` (`reactionPreview(emoji, count)` -> `❤️ 2`, used only by the bubble aria label)
- `src/lib/i18n/messages/{en,uz,ru}.js`

### Contracts

- `POST .../reactions` `{ emoji }`, rate limit `chat-react` 60/min. Checks: conversation member; message in this conversation, not deleted for everyone, not `deletedFor` me, `type !== 'call'` (`400 code:'not_reactable'`); no block either way (`403 code:'blocked'`); `isAllowedEmoji` (`400 code:'bad_emoji'`). Replaces my previous reaction (one per user). Atomic: `updateOne({ _id }, [{ $set: { reactions: { $concatArrays: [ { $filter: { input:'$reactions', cond: { $ne: ['$$this.userId', me] } } }, [ { emoji, userId: me, at: now } ] ] } } }])`. -> `200 { reactions }`.
- `DELETE .../reactions` -> removes mine -> `200 { reactions }` (idempotent).
- Both: `after(() => emitEvent([me, otherId], 'message:reacted', { conversationId, messageId, reactions }))`. Full-array payloads, so clients replace instead of applying deltas. No push/Telegram (wave 2), and reactions never change `lastMessagePreview` or unread counts.
- Client:
  - `ReactionBar({ onPick(emoji), onMore, mine })`: `data-testid="reaction-bar"`, buttons `reaction-option` with `data-emoji` and `aria-pressed` (mine highlighted `bg-accent-soft ring-1 ring-accent`), "+" `reaction-more`.
  - `ReactionChips({ reactions, myId, onToggle(emoji) })`: `reaction-chip` with `data-emoji`, `data-mine`, `aria-pressed`, text `{emoji} {count}`, the count always shown (`❤️ 1`, `❤️ 2`), own chip `bg-accent text-on-accent` on incoming bubbles and `bg-on-accent/20` on outgoing; tapping my chip removes it, tapping the other's emoji sets mine to it.
  - Long-press on mobile opens the existing action sheet with ReactionBar on top; desktop hover menu shows the bar in its popover (WP8.9).

### i18n

| key | uz | en | ru |
|---|---|---|---|
| mb.react | Reaksiya | React | Реакция |
| mb.reactMore | Boshqa reaksiyalar | More reactions | Другие реакции |
| mb.reactRemove | Reaksiyani olib tashlash | Remove reaction | Убрать реакцию |
| mb.reactionAria | {emoji} reaksiya, {n} ta | {emoji} reaction, {n} | Реакция {emoji}: {n} |
| mb.reactFailed | Reaksiya qo'yilmadi | Couldn't add the reaction | Не удалось поставить реакцию |

Server strings: `Bu xabarga reaksiya qo'yib bo'lmaydi`, `Noto'g'ri emoji`.

### Acceptance

- Quick ❤️ on a friend's message shows `❤️ 1` highlighted for me and unhighlighted for the friend within a second; the friend adding ❤️ makes it `❤️ 2` on both.
- Picking 👍 replaces my ❤️; tapping my chip removes it; double-tap toggles ❤️.
- A reaction from the "+" picker with any emoji works; text like `ab` is rejected server-side.
- Call rows and deleted messages show no reaction affordances.
- Reloading shows the same chips (persisted).

### Tests

`reactions.test.js` (grouping, ordering, replace semantics, emoji validation incl. ZWJ sequences and flags); `reactions.integration.test.js` (set, replace, remove, blocked, call row, other conversation's message, concurrent set from both users keeps two entries). E2E in `chat-parity.spec.ts`.

---

## WP8. UX polish, priorities 1-2

Goal: the P1-P2 items of the UX review. Each item is a small independent commit. The P1 header item is in WP4 and the call message type in WP3/WP4.

| # | Pri | Item | Files | Acceptance |
|---|---|---|---|---|
| 8.1 | P1 | Inline meta: time + ticks + "edited" float at the end of the last text line (Telegram), wrapping to their own line only when needed; reserved space via an invisible spacer span | `MessageBubble.jsx` | Short messages are one line high; long lines never overlap the meta; chips (WP7) sit before the time in the same row |
| 8.2 | P1 | Grouping: consecutive messages from the same sender within 5 min share a group; tail only on the last bubble, 2 px gap inside a group, 8 px between groups; avatar column not used in 1:1 | `MessageList.jsx` (or the list part of `ConversationView.jsx`), `src/lib/chat/grouping.js` + test | `groupMessages(list)` unit-tested (day boundary, call rows break groups, deleted rows) |
| 8.3 | P1 | Hide the mobile bottom tab bar while a chat is open (`chatOpen` in `AppShell.jsx:48` already exists; extend to the bottom bar) and put the toast at the top on mobile | `AppShell.jsx`, `NewMessageToast.jsx` (WP1) | In `/app/friends/<user>` below `md` no bottom nav; composer sits on the safe area |
| 8.4 | P1 | Dark theme `--color-on-accent: 20 9 13` (contrast on the light accent in dark mode) | `src/app/globals.css` | Send button and own bubble text reach WCAG AA (4.5:1) in dark mode |
| 8.5 | P2 | Edge-to-edge media: photos/videos without caption fill the bubble with no padding, meta over a translucent pill | `MessageBubble.jsx`, album component | No inner padding on caption-less media |
| 8.6 | P2 | Keyboard handling: `interactiveWidget: 'resizes-content'` in the viewport export plus a `visualViewport` fallback that sets `--vvh` | `src/app/layout.jsx` (viewport, read `generate-viewport.md`), `ConversationView.jsx` | On Android Chrome and iOS Safari the composer stays above the keyboard and the last message stays visible |
| 8.7 | P2 | Mobile: hide the per-bubble `…` button below `md` (long-press only) and set `-webkit-touch-callout: none` + `select-none` on bubbles while not in text-select mode | `MessageBubble.jsx` | Long-press opens our sheet, never the iOS callout; desktop keeps the `Xabar amallari` button |
| 8.8 | P2 | List: chevron removed, online dot + avatar ring for unread; 72 px rows, 54 px avatars on mobile | `ConversationList.jsx` | `chat-row` structure and testids unchanged |
| 8.9 | P2 | Desktop popovers: action menu, chat menu and attach menu anchored popovers on pointer devices (`useIsPointer` = `matchMedia('(hover: hover) and (pointer: fine)')`), sheets on touch | `src/lib/hooks/useIsPointer.js`, `ActionSheet.jsx` (WP4), `MessageBubble.jsx`, `ChatMenu` | Escape/outside click close, focus returns to the trigger |
| 8.10 | P2 | List time formatting `formatListTime(date, now, locale)`: today `HH:mm`, yesterday label, within 7 days weekday, else `dd.MM.yy`; desktop list pane 360 -> 400 px | `src/lib/chat/formatListTime.js` + test, `ConversationList.jsx`, friends layout | Test covers midnight and locale |
| 8.11 | P2 | Composer quote banners: reply/edit banners with accent bar, sender name, one-line preview and `ReplyThumb` for media | `Composer.jsx`, `src/components/chat-friends/ReplyThumb.jsx` | `reply-banner` testid kept |
| 8.12 | P2 | Unread divider `cv.unread` at the first unread message on open, sticky day headers, spinner while loading older messages, `pb-3` under the last bubble | message list in `ConversationView.jsx` | Divider disappears after leaving the chat; no layout jump when older pages load (scroll anchored) |
| 8.13 | P2 | Swipe-to-reply spring (`motion-safe:` transition, 64 px threshold, rubber-band beyond) and `navigator.vibrate?.(10)` on threshold | `MessageBubble.jsx` | No vibration when unsupported; reduced motion disables the spring |
| 8.14 | P2 | `ChatToast`: a small in-chat toast (`role="status"`, 3 s) replacing every `window.alert` in chat code | `src/components/chat-friends/ChatToast.jsx`, `ChatContext.jsx` (`notify(text, tone)`), all `alert(` call sites under `src/components/chat-friends/` | `grep -rn "alert(" src/components/chat-friends` returns nothing; testid `chat-toast` |
| 8.15 | P2 | Typing and online status line: `typing…` replaces the status text with an animated three-dot indicator | `ConversationView.jsx` header | aria-live polite, no layout shift |

### i18n

| key | uz | en | ru |
|---|---|---|---|
| cv.unread | O'qilmagan xabarlar | Unread messages | Непрочитанные сообщения |
| cv.loadingOlder | Oldingi xabarlar yuklanmoqda | Loading earlier messages | Загрузка предыдущих сообщений |
| ch.yesterday | Kecha | Yesterday | Вчера |
| ch.toastClose | Yopish | Dismiss | Закрыть |

(Weekday names come from `Intl.DateTimeFormat(locale, { weekday:'short' })`, no keys.)

### Tests

Unit: `grouping.test.js`, `formatListTime.test.js`. Visual/behaviour: the existing `chat-telegram.spec.ts` and `chat-media.spec.ts` stay green on desktop and mobile projects; add mobile assertions in `chat-parity.spec.ts` (no bottom nav in an open chat, long-press opens the sheet, no `…` button).

---

## WP9. Test infrastructure and cross-feature E2E

Goal: E2E runs that include the realtime server, two or three signed-in users and fake media.

### Files

Create:
- `e2e/realtime-local.mjs` (starts `createRealtimeServer` on `127.0.0.1:4001` with `REALTIME_SHARED_SECRET`/`INTERNAL_SECRET` from the E2E env, `NEXTJS_INTERNAL_URL=http://127.0.0.1:3000`, short timers via `CALL_RING_TIMEOUT_MS=8000`, `CALL_CONNECT_TIMEOUT_MS=8000`, `CALL_GRACE_MS=4000`)
- `e2e/chat-call.spec.ts` (CS §15.3, 12 cases)
- `e2e/chat-parity.spec.ts` (WP1 badge/title/toast, WP5 forward, WP6 drafts, WP7 reactions, WP8 mobile checks)
- `e2e/helpers/twoUsers.ts` (`openPair(browser)` -> two contexts signed in as `e2ehero` and `e2efriend`, conversation id; `openThird`)

Modify:
- `playwright.config.ts`:
  - `webServer` becomes an array: the Next server (env adds `NEXT_PUBLIC_REALTIME_URL=http://127.0.0.1:4001`, `REALTIME_INTERNAL_URL=http://127.0.0.1:4001`, `NEXT_PUBLIC_E2E_HOOKS=1`, `TURN_SECRET=e2e-turn-secret`, `STUN_URLS=`, `TURN_URLS=`) and `node e2e/realtime-local.mjs` (url `http://127.0.0.1:4001/health`, `reuseExistingServer` honouring `E2E_REUSE_SERVER`).
  - Chromium launch args for the call spec: `--use-fake-ui-for-media-stream`, `--use-fake-device-for-media-stream`; `permissions: ['camera','microphone']`.
- `e2e/global-setup.ts` (third user `e2ethird`, phone `+998901234571`, chat access granted, friend of `e2ehero`; conversations seeded for forward targets)
- `package.json` scripts: `"e2e:chat": "playwright test e2e/chat-call.spec.ts e2e/chat-parity.spec.ts --project=desktop"`

### Rules

- Real WebRTC between two Chromium contexts on one machine works with host candidates; ICE servers are empty in E2E. Assert media through `window.__vocablyCall` (connection state, `remoteStream` track count) rather than pixels.
- Never sleep; poll `window.__vocablyCall.state()` and DOM. Timer cases use the shortened env timers.
- Each spec cleans up its call/messages through the E2E DB helper (`e2e/helpers/db.ts` from `92f2c6d`), so specs are order-independent.
- Mobile project runs `chat-parity.spec.ts` only (calls are desktop-only in CI; the manual matrix in CS §15.4 covers phones).

### Acceptance

- `npm run e2e:chat` passes locally twice in a row with `E2E_REUSE_SERVER=1` and from a cold start.
- The full existing E2E suite stays green with the realtime server present (presence/typing now live instead of polling).

---

## Wave 2 backlog

Not in this wave. Gap-audit `recommendedOrder` items not covered above, in their order (numbers refer to that list), then the items deferred from this wave.

From the gap audit:
- (7) Search in chat: server text search plus an `around=` cursor for jump-to-result. The cursor is reused by 13 and 25.
- (10) Block/report: unblock, a blocked list, a composer Unblock bar, and report-user.
- (11) Read receipts: drop the presence-based "delivered" tick or make it a real delivery ack.
- (12) Pin: cycle through pins, a pinned list, and a realtime pin push.
- (13) Scroll-to-unread: load around the first unread message. The divider itself ships in WP8.12.
- (14) Link previews: a server OG fetcher with an SSRF guard, plus a bubble card.
- (15) Video compression/transcoding: a WebCodecs/ffmpeg.wasm path behind a flag, to lift the 60 MB rejection.
- (16) Voice notes: a hold/lock/slide-to-cancel recorder, 2x speed, drag scrubbing, and preview before send.
- (17) Files: raise the 25 MB cap (presigned PUT up to ~100 MB, multipart beyond) and add document previews.
- (18) Edit: caption PATCH and ↑-to-edit.
- (19) Online/last seen: scope `presence:update` to contacts and honour `lastSeenVisibility` at the socket layer. This is more urgent now that presence is app-wide after WP1.
- (20) Stickers/GIF/emoji: a GIF panel (needs a Tenor/Klipy key) and animated stickers.
- (21) Text formatting: strikethrough/mono/spoiler/links, Ctrl+B/I, and clean previews.
- (22) Keyboard shortcuts: ↑ edit, Ctrl+F, chat switching, Esc back.
- (23) Accessibility sweep: an aria-live log for incoming messages, keyboard waveform seek, and label fixes. WP8.14 removes the alerts.
- (24) Mobile gestures: swipe actions on chat rows, edge swipe back, pinch zoom.
- (25) Jump-to-date: a calendar on the sticky day pill, built on `around=`.
- (26) Copy: copy image, copy with headers, and a "Copied" toast.
- (27) Message scheduling: needs a job runner and a scheduled queue.

Deferred from this wave:
- Forward with a comment and a "hide captions" option.
- Ring a closed app through Web Push. This needs a service-worker call screen.
- TURNS on 443/TCP for networks that block 3478. This needs a TLS cert for coturn and SNI routing beside Caddy.
- Group calls and screen sharing. The SFU choice (LiveKit or mediasoup) is still open.
- Desktop incoming-call banner variant.
- Call quality indicator from `getStats`.
- Russian launch: complete `ru.js`, add `'ru'` to `LOCALES`, add server-string translations, and update the `normalizeLocale('ru')` test.
- UX review priorities 3-4.
- Reaction notifications (throttled push/Telegram).
- Typing relay membership check in the realtime server.
