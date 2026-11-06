'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRealtime } from '@/context/RealtimeContext';
import { mergePolledMessages, applyDeletedForEveryone } from '@/lib/chatMerge';
import { enqueueOffline, dequeueOffline, mergeQueuedIntoMessages } from '@/lib/offlineQueue';
import { previewForMessage } from '@/lib/chatConstants';
import { STICKER_PACKS as STATIC_STICKER_PACKS } from '@/lib/stickers';
import { createUploadManager } from '@/lib/chat/uploadManager';
import { xhrPut } from '@/lib/chat/xhrUpload';
import { prepareImage, probeVideo } from '@/lib/chat/compressImage';
import { albumGroups, defaultId } from '@/lib/chat/attachments';
import { readDrafts, writeDrafts, setDraft as setDraftInMap } from '@/lib/chat/drafts';
import { ackDraft, createDraftSync, getDeviceId, mergeDraftMap } from '@/lib/chat/draftSync';
import { applyNewMessageToList, applyBulkAction } from '@/lib/chat/chatList';
import { applyReaction } from '@/lib/chat/reactions';

function buildStickerCatalog({ packs = [], extra = [] }) {
  const byId = new Map();
  packs.forEach((p) => p.stickers.forEach((s) => byId.set(String(s.id), s)));
  extra.forEach((s) => byId.set(String(s.id), s));
  return { packs, byId };
}

const ChatContext = createContext(null);

// F (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 F — "internet uzilsa xabar local'da
// turadi") — sahifa qayta yuklansa ham navbat yo'qolmasin deb localStorage'da saqlanadi
// (foydalanuvchiga bog'liq kalit — bir brauzerda bir nechta hisob almashtirilsa
// navbatlar aralashib ketmasin). Faqat o'qish/yozish shu ikki funksiyada — qolgan
// hamma joy oddiy JS massiv (offlineQueueRef.current) bilan ishlaydi.
function readPersistedOfflineQueue(userId) {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = window.localStorage.getItem(`vocably_chat_offline_queue_${userId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Do'stlar bo'limiga xos holat — global AppContext'ga qo'shilmaydi, chunki bu
// hidden/gated funksiya: faqat chatAccess bo'lgan userlarda, va faqat "Do'stlar"
// bo'limi ochilganda mount qilinadi (docs/ chat plani).
//
// AUTH_MIGRATION_MAP.md — `token` prop endi yo'q (REST so'rovlar httpOnly
// cookie orqali ishlaydi). O'rniga `myUserId` (AppContext#chatUserId, real
// `/api/chat/me` javobidan) — faqat "bu xabar meniki emasmi" kabi UI
// taqqoslashlar uchun, xavfsizlik qarori uchun EMAS. realtime-server/ esa
// alohida, cross-origin xizmat bo'lgani va cookie'ga ega bo'lmagani uchun
// haqiqiy (lekin 60 soniyalik, faqat shu maqsad uchun) tokenga muhtoj —
// buni har ulanishda `/api/chat/socket-ticket`dan (cookie orqali) olamiz,
// hech qachon localStorage'ga yozmaymiz.
export function ChatProvider({ myUserId, children }) {
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  // Ro'yxat yuklanmasa "suhbat yo'q" emas, xato + "Qayta yuklash" ko'rsatiladi.
  const [conversationsError, setConversationsError] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null); // { id, otherUser }
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  // TZ-vocably-v2.md §E3 — xabarlar yuklanmasa avval jimgina yutilib ketardi
  // (foydalanuvchi doim "Hali xabar yo'q" deb o'ylardi, hatto tarmoq xatosi bo'lsa
  // ham). Endi xato holati saqlanadi, ConversationView "Qayta yuklash" ko'rsatadi.
  const [messagesError, setMessagesError] = useState(false);
  // PARITY_PLAN WP1 — socket endi (main) layout'dagi RealtimeProvider'da (sahifalar orasida uzilmaydi);
  // bu yerda faqat unga obuna bo'lamiz. `socketConnected`/`livePresence` qiymatlari o'zgarmagan
  // nomlar bilan qayta eksport qilinadi (ConversationList/ConversationView/MessageBubble).
  const {
    connected: socketConnected,
    livePresence,
    queryPresence,
    emit,
    on,
    setActiveConversationId,
    setUnreadFromConversations,
  } = useRealtime();
  // Composer'da "tahrirlash rejimi" — xabar matni inputga qaytariladi, yuborish
  // o'rniga saqlash (PATCH) chaqiriladi. Faqat o'z matnli xabarlariga tegishli.
  const [editingMessage, setEditingMessage] = useState(null); // { id, text }
  // Composer'da "javob berish rejimi" — keyingi yuboriladigan xabar (matn yoki
  // media, farqi yo'q) shu xabarga iqtibos sifatida bog'lanadi (server snapshot oladi).
  const [replyingTo, setReplyingTo] = useState(null); // { id, senderId, type, text }
  // Qaysi suhbatda hozir "yozmoqda..." holati faol: { [conversationId]: true } —
  // har bir yozuv 3s'dan keyin o'zi tozalanadi (pastdagi socket 'typing' handler'i).
  const [typingByConversation, setTypingByConversation] = useState({});
  // G-2 in-app toast endi RealtimeProvider'da (har qanday /app sahifada ko'rinadi, PARITY_PLAN WP1).
  // Stiker katalogi (/api/chat/stickers): `packs` — tanlash oynasi uchun, `byId` —
  // xabar pufakchasida stikerni topish uchun (o'chirilganlari ham, eski xabarlar
  // uchun). Server javob bermaguncha statik "Standart" to'plam bilan boshlanadi.
  const [stickerCatalog, setStickerCatalog] = useState(() => buildStickerCatalog({ packs: STATIC_STICKER_PACKS }));
  // Telegram parity: drafts per conversation (text + reply target) survive leaving the chat.
  const [drafts, setDrafts] = useState(() => readDrafts(myUserId));
  // PARITY_PLAN WP6 — qoralamalar server bilan sinxron: `draftsRef` doim eng so'nggi xarita (yon ta'sirlar
  // setState updater ichida emas, shu ref orqali), `draftSyncRef` — 600 ms debounce'li PUT navbati.
  const draftsRef = useRef(drafts);
  const draftSyncRef = useRef(null);
  const deviceIdRef = useRef(null);
  const mergeRemoteDraftsRef = useRef(null); // loadConversations (yuqorida) shu orqali chaqiradi
  // Files dropped on the conversation (ConversationView drop zone) → picked up by the Composer tray.
  const [stagedFiles, setStagedFiles] = useState(null);
  // Qisqa holat xabari (masalan "3 ta chatga yuborildi", PARITY_PLAN WP5) — ConversationView pastda ko'rsatadi.
  const [chatNotice, setChatNotice] = useState(null); // { id, text } | null
  const chatNoticeTimer = useRef(null);
  const showChatNotice = useCallback((text) => {
    clearTimeout(chatNoticeTimer.current);
    if (!text) return setChatNotice(null);
    setChatNotice({ id: Date.now(), text });
    chatNoticeTimer.current = setTimeout(() => setChatNotice(null), 3500);
  }, []);
  useEffect(() => () => clearTimeout(chatNoticeTimer.current), []);

  const pollRef = useRef(null);
  const listReloadRef = useRef(null);
  const messagesRef = useRef([]);
  useEffect(() => { messagesRef.current = messages; });
  // Uploads: one parallel manager for the whole chat; bubbles of conversations that are not open
  // live in `pendingMediaRef` (same shape as the offline queue) until their message is stored.
  const uploadsRef = useRef(null);
  const pendingMediaRef = useRef([]);
  const localFilesRef = useRef(new Map()); // clientMessageId → { file, type, name, conversationId, albumId, caption, replyTo, extra }
  // F (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 F) — offline xabar navbati: har
  // yozuv { clientMessageId, conversationId, body (POST payload), message (optimistik
  // pufakcha) }. Alohida React state EMAS — o'zgarishi UI'ni to'g'ridan-to'g'ri
  // qayta chizishi shart emas (pufakchaning o'zi `messages` state orqali ko'rinadi),
  // faqat localStorage bilan sinxron oddiy ref (src/lib/offlineQueue.js — sof funksiyalar).
  const offlineQueueRef = useRef(null);
  if (offlineQueueRef.current === null) offlineQueueRef.current = readPersistedOfflineQueue(myUserId);
  // Har bir suhbat uchun oxirgi ko'rilgan xabarlar ro'yxatini eslab qoladi —
  // ikkita suhbat orasida oldinga-orqaga o'tilganda (masalan ikki do'st bilan
  // navbatma-navbat yozishganda) HAR SAFAR bo'sh ekrandan spinner ko'rsatib
  // qayta yuklamaslik uchun: keshdagi xabar darhol ko'rsatiladi, so'ngra fon
  // rejimida (silent) yangilanadi — aks holda har almashtirishda butun ro'yxat
  // bir lahzaga yo'qolib "sahifa qayta yuklanyapti" taassurotini berardi.
  const messagesCacheRef = useRef(new Map());
  const activeIdRef = useRef(null);
  useEffect(() => { activeIdRef.current = activeConversation?.id || null; });
  const activeConversationRef = useRef(null);
  useEffect(() => { activeConversationRef.current = activeConversation; });
  const conversationsRef = useRef([]);
  useEffect(() => { conversationsRef.current = conversations; });
  const replyingToRef = useRef(null);
  useEffect(() => { replyingToRef.current = replyingTo; });
  const myIdRef = useRef(null);
  useEffect(() => { myIdRef.current = myUserId; });
  const typingTimersRef = useRef({});
  // Server bir sahifada 50 ta xabar qaytaradi — kamroq kelsa, eskisi qolmagan.
  const hasMoreOlderRef = useRef(true);
  const lastTypingEmitRef = useRef({});

  // AUTH_MIGRATION_MAP.md — bu funksiya ilgari Authorization header qo'shardi.
  // Endi cookie orqali autentifikatsiya qilingani uchun faqat berilgan qo'shimcha
  // header'larni (masalan Content-Type) o'zgarishsiz qaytaradi — pastdagi barcha
  // chaqiruvchi joylarni (25+ fetch) birma-bir tahrirlamaslik uchun ataylab
  // saqlab qolingan, xatti-harakati esa endi to'g'ri (hech qanday header
  // qo'lda biriktirilmaydi).
  const authHeaders = useCallback((extra = {}) => extra, []);

  // F — navbat o'zgargan har safar (qo'shildi/olib tashlandi) localStorage'ga yoziladi.
  const persistOfflineQueue = useCallback(() => {
    if (typeof window === 'undefined' || !myIdRef.current) return;
    try {
      window.localStorage.setItem(
        `vocably_chat_offline_queue_${myIdRef.current}`,
        JSON.stringify(offlineQueueRef.current)
      );
    } catch {
      // localStorage yo'q/to'lgan — navbat shunchaki shu sessiyada (xotirada) qoladi.
    }
  }, []);

  // Promise zanjiri: effekt tanasida chaqirilganda kompilyator `catch` ichidagi setState'ni sinxron deb hisoblaydi.
  const loadConversations = useCallback(
    () =>
      fetch('/api/chat/conversations', { headers: authHeaders() })
        .then((res) =>
          res.json().then((data) => {
            if (res.ok) {
              setConversations(data.conversations || []);
              setConversationsError(false);
              // WP6: serverdagi qoralamalar (boshqa qurilmada yozilgani) mahalliy kesh bilan yarashtiriladi.
              mergeRemoteDraftsRef.current?.((data.conversations || []).filter((c) => 'draft' in c).map((c) => [c.id, c.draft]));
            } else {
              setConversationsError(true);
            }
          })
        )
        .catch(() => setConversationsError(true))
        .finally(() => setLoadingConversations(false)),
    [authHeaders]
  );

  // `silent` — fon rejimidagi qayta yuklash (masalan pastdagi 5s poll, socket
  // ulanmaganda) uchun: spinner ko'rsatmaydi, aks holda suhbat ochiq turganda ham
  // har 5 soniyada butun ro'yxat bir lahzaga yo'qolib, "sahifa qayta yuklanyapti"
  // taassurotini berardi (avvalgi xato manbai).
  // `noRead` — server tarafda avtomatik "o'qildi" belgilashni o'chiradi (pastdagi
  // 5s poll shuni ishlatadi — tab/oyna fokusda bo'lmasa ham xabar "o'qilgan"
  // ko'rsatilib qolmasligi uchun; haqiqiy o'qilgan holatini alohida, tab ko'rinib
  // turganini tekshirgandan keyin belgilaymiz).
  const loadMessages = useCallback(
    async (conversationId, { silent = false, noRead = false } = {}) => {
      // Javob kelguncha boshqa suhbatga o'tilgan bo'lsa — eski javob yangi suhbatga yozilmasin.
      const isCurrent = () => String(activeIdRef.current) === String(conversationId);
      if (!silent) {
        setLoadingMessages(true);
        setMessagesError(false);
      }
      try {
        const url = `/api/chat/conversations/${conversationId}/messages${noRead ? '?noRead=1' : ''}`;
        const res = await fetch(url, { headers: authHeaders() });
        const data = await res.json();
        if (!isCurrent()) return;
        if (res.ok) {
          const list = data.messages || [];
          hasMoreOlderRef.current = list.length >= 50;
          // F — serverda hali yo'q, lekin offline navbatda kutayotgan xabarlar
          // (masalan sahifa qayta yuklangan, ulanish hali tiklanmagan) ro'yxat
          // oxiriga "yuborilmoqda" pufakchasi sifatida qo'shiladi.
          // Silent refresh (poll) merges instead of replacing — see src/lib/chatMerge.js.
          setMessages((prev) =>
            mergeQueuedIntoMessages(silent ? mergePolledMessages(prev, list) : list, [...offlineQueueRef.current, ...pendingMediaRef.current], conversationId)
          );
          if (!silent) setMessagesError(false);
        } else if (!silent) {
          setMessagesError(true);
        }
      } catch {
        if (!silent && isCurrent()) setMessagesError(true);
      } finally {
        if (!silent && isCurrent()) setLoadingMessages(false);
      }
    },
    [authHeaders]
  );

  // ConversationView'dagi "Qayta yuklash" tugmasi — keshni chetlab, joriy suhbatni
  // qaytadan (spinner bilan) yuklaydi.
  const retryLoadMessages = useCallback(() => {
    if (activeIdRef.current) loadMessages(activeIdRef.current);
  }, [loadMessages]);

  const loadOlderMessages = useCallback(async () => {
    const conversationId = activeIdRef.current;
    const current = messagesRef.current.filter((m) => !m._status);
    if (!conversationId || current.length === 0 || !hasMoreOlderRef.current) return [];
    try {
      const before = current[0].createdAt;
      const res = await fetch(
        `/api/chat/conversations/${conversationId}/messages?before=${encodeURIComponent(before)}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (String(activeIdRef.current) !== String(conversationId)) return [];
      if (res.ok) {
        const older = data.messages || [];
        if (older.length < 50) hasMoreOlderRef.current = false;
        if (older.length) {
          setMessages((prev) => [...older, ...prev]);
          messagesRef.current = [...older, ...messagesRef.current];
        }
        return older;
      }
    } catch {
      // jimgina
    }
    return [];
  }, [authHeaders]);

  // Reply quote tapped on a message that is not loaded yet (Telegram loads around it): page back
  // until it shows up, a few pages at most. Resolves true when the message is in the list.
  const ensureMessageLoaded = useCallback(
    async (messageId) => {
      const has = () => messagesRef.current.some((m) => String(m.id || m._id) === String(messageId));
      for (let i = 0; i < 8 && !has(); i++) {
        const older = await loadOlderMessages();
        if (!older.length) break;
      }
      return has();
    },
    [loadOlderMessages]
  );

  // Keshda bo'lsa — darhol shuni ko'rsatadi (spinnersiz) va fonda yangilaydi;
  // bo'lmasa (bu suhbat birinchi marta ochilyapti) oddiy spinner bilan yuklaydi.
  const loadMessagesWithCache = useCallback(
    (conversationId) => {
      const cached = messagesCacheRef.current.get(String(conversationId));
      hasMoreOlderRef.current = true;
      if (cached) {
        setMessages(mergeQueuedIntoMessages(cached, [...offlineQueueRef.current, ...pendingMediaRef.current], conversationId));
        // Oldingi (boshqa suhbatning) yuklanish/xato holati bu suhbatga o'tmasin.
        setLoadingMessages(false);
        setMessagesError(false);
        loadMessages(conversationId, { silent: true });
      } else {
        // Eski suhbat xabarlari yangi suhbat ostida ko'rinmasin va keshga yozilmasin.
        setMessages([]);
        loadMessages(conversationId);
      }
    },
    [loadMessages]
  );

  // F — navbatdagi xabarlarni KETMA-KET (bittadan, tartib bilan — "internet o'chirib
  // 3 ta xabar yozish -> ulanganda tartib bilan yuboriladi" TZ talabi), xuddi shu
  // idempotent (`clientMessageId`) yo'l bilan yuboradi. `window.addEventListener('online')`
  // va socket'ning har bir 'connect' (shu jumladan reconnect) hodisasida chaqiriladi.
  const flushOfflineQueue = useCallback(async () => {
     
    while (true) {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return; // yana uzilib qoldi
      const item = offlineQueueRef.current[0];
      if (!item) return;
      try {
        const res = await fetch(`/api/chat/conversations/${item.conversationId}/messages`, {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(item.body),
        });
        const data = await res.json().catch(() => ({}));
        offlineQueueRef.current = dequeueOffline(offlineQueueRef.current, item.clientMessageId);
        persistOfflineQueue();

        if (!res.ok) {
          // Server chindan rad etdi (masalan shu orada bloklangan) — qayta urinish
          // ma'nosiz, pufakchani "failed"ga o'tkazib keyingi navbatdagiga o'tamiz.
          if (String(activeIdRef.current) === String(item.conversationId)) {
            setMessages((prev) =>
              prev.map((m) => (String(m.clientMessageId) === String(item.clientMessageId) ? { ...m, _status: 'failed' } : m))
            );
          }
          continue;
        }

        if (String(activeIdRef.current) === String(item.conversationId)) {
          const finalMsg = { ...data.message, clientMessageId: item.clientMessageId, _status: 'sent' };
          setMessages((prev) => {
            const idx = prev.findIndex((m) => String(m.clientMessageId) === String(item.clientMessageId));
            if (idx === -1) {
              return prev.some((m) => String(m.id || m._id) === String(finalMsg.id || finalMsg._id)) ? prev : [...prev, finalMsg];
            }
            const next = [...prev];
            next[idx] = finalMsg;
            return next;
          });
        }
        loadConversations();
      } catch {
        // Tarmoq hali beqaror (masalan 'online' hodisasi biroz erta yuborildi) —
        // navbatni SAQLAB qoldiramiz, keyingi 'online'/socket 'connect' kutiladi.
        return;
      }
    }
  }, [authHeaders, persistOfflineQueue, loadConversations]);

  const openConversationByUsername = useCallback(
    async (username) => {
      let res;
      let data;
      try {
        res = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ username }),
        });
        data = await res.json().catch(() => ({}));
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
      if (!res.ok) return { error: data.error || 'Xatolik yuz berdi' };

      // activeIdRef darhol yangilanadi — loadMessages javobi "eski" deb tashlab yuborilmasin.
      activeIdRef.current = data.conversation.id;
      setActiveConversation(data.conversation);
      setEditingMessage(null);
      setReplyingTo(null);
      loadMessagesWithCache(data.conversation.id);
      loadConversations();
      return { conversation: data.conversation };
    },
    [authHeaders, loadMessagesWithCache, loadConversations]
  );

  const selectConversation = useCallback(
    (conv) => {
      activeIdRef.current = conv.id;
      setActiveConversation(conv);
      setEditingMessage(null);
      setReplyingTo(null);
      loadMessagesWithCache(conv.id);
    },
    [loadMessagesWithCache]
  );

  const closeConversation = useCallback(() => {
    activeIdRef.current = null;
    setActiveConversation(null);
    setMessages([]);
    setEditingMessage(null);
    setReplyingTo(null);
  }, []);

  // Telegram parity: a message updates its row at once (no list reload per message); the full
  // list is re-fetched shortly after, debounced, as reconciliation.
  const reloadListSoon = useCallback(() => {
    clearTimeout(listReloadRef.current);
    listReloadRef.current = setTimeout(() => loadConversations(), 1500);
  }, [loadConversations]);
  const touchList = useCallback(
    (conversationId, { preview, createdAt, incoming }) => {
      setConversations((prev) => applyNewMessageToList(prev, { conversationId, preview, createdAt, incoming }));
      reloadListSoon();
    },
    [reloadListSoon]
  );
  // Jonli kelgan xabar: id YOKI clientMessageId bo'yicha dublikat tekshiriladi — xabar endi
  // yuboruvchining o'z boshqa qurilmalariga ham keladi (PARITY_PLAN §2.5), shu qurilmada esa
  // optimistik pufakcha allaqachon bor: uni server nusxasi bilan almashtiramiz (mahalliy preview saqlanadi).
  const upsertLiveMessage = useCallback((msg) => {
    setMessages((prev) => {
      const id = String(msg.id || msg._id);
      if (prev.some((m) => String(m.id || m._id) === id)) return prev;
      const cmid = msg.clientMessageId ? String(msg.clientMessageId) : null;
      const idx = cmid ? prev.findIndex((m) => String(m.clientMessageId) === cmid) : -1;
      if (idx === -1) return [...prev, msg];
      const next = [...prev];
      next[idx] = { ...msg, clientMessageId: cmid, _status: 'sent', _localUrl: prev[idx]._localUrl || null };
      return next;
    });
  }, []);

  // Suhbat ochiq turganda jonli (socket) xabar kelganda chaqiriladi — GET /messages
  // har safar qayta so'ralmaydi (socket ulangan bo'lsa poll o'chiq), shuning uchun
  // "o'qildi" belgisini shu yengil so'rov bilan darhol qo'yamiz (src/lib/chatRead.js).
  const markRead = useCallback(
    async (conversationId) => {
      try {
        await fetch(`/api/chat/conversations/${conversationId}/read`, {
          method: 'PATCH',
          headers: authHeaders(),
        });
      } catch {
        // jimgina — keyingi safar suhbat qayta ochilganda/yuklanganda baribir belgilanadi
      }
    },
    [authHeaders]
  );

  // C-16 — xabar yuborishning to'liq holat zanjiri: "yuborilmoqda" (soat) -> "yuborildi"
  // (✓) -> "o'qildi" (✓✓, rangli). Chaqiruvchi (Composer.jsx) haqiqiy so'rov tugashini
  // kutmasdan, matn/media darhol pufakcha sifatida ro'yxatga qo'shiladi (`_status:
  // 'sending'`, vaqtinchalik `clientMessageId` bilan) — server javob bergach xuddi shu
  // pufakcha (id bo'yicha topilib) haqiqiy hujjat bilan almashtiriladi (`_status: 'sent'`).
  // Tarmoq xatosi bo'lsa pufakcha o'chmaydi, `_status: 'failed'`ga o'tadi — foydalanuvchi
  // MessageBubble'dagi "Qayta yuborish" bosishi bilan xuddi shu clientMessageId bilan
  // qayta yuboradi (server tarafda shu id allaqachon saqlangan bo'lsa — dublikat
  // yaratilmaydi, src/app/api/chat/conversations/[id]/messages POST'dagi izohga qarang).
  const genClientMessageId = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `c${Date.now()}${Math.random().toString(16).slice(2)}`;

  // Telegram-like sending: the composer never waits for the server — each
  // message is shown at once and the network requests go out one after
  // another through this chain, so rapid messages keep their order.
  const sendChainRef = useRef(Promise.resolve());

  const sendMessage = useCallback(
    async (payload, existingClientId, opts = {}) => {
      // Uploads finish after the user may have switched chats: the target conversation is explicit.
      const conversationId = opts.conversationId || activeConversation?.id;
      if (!conversationId) return { error: 'Suhbat tanlanmagan' };
      const isActive = String(activeIdRef.current) === String(conversationId);
      const reply = opts.replyTo !== undefined ? opts.replyTo : isActive ? replyingToRef.current : null;
      const replyId = reply?.id;
      const clientMessageId = existingClientId || genClientMessageId();
      // F — offline navbatga ham, muvaffaqiyatli bo'lsa serverga ham AYNAN shu tana
      // yuboriladi (src/lib/offlineQueue.js) — ikkalasi mos kelmay qolmasin.
      const body = { ...(replyId ? { ...payload, replyTo: replyId } : payload), clientMessageId };
      // Sahifa qayta yuklanganda/suhbat almashtirilganda pufakchani tiklash uchun ham
      // kerak (mergeQueuedIntoMessages), shuning uchun har doim hisoblanadi (offline
      // navbatga tushmasa ham hech narsa yo'qotmaydi).
      const optimisticMsg = {
        id: clientMessageId,
        clientMessageId,
        conversationId,
        senderId: myIdRef.current,
        type: payload.type,
        text: payload.text || '',
        media: payload.media || null,
        stickerId: payload.stickerId || null,
        // Server javobidagi shaklga mos: `messageId` (`id` emas) — MessageBubble'dagi
        // ReplyQuote shu maydonga qarab asl xabarga sakraydi (jumpToMessage).
        replyTo: replyId
          ? {
              messageId: replyId,
              senderId: reply.senderId,
              type: reply.type,
              text: reply.text,
              mediaKey: reply.mediaKey || null,
            }
          : null,
        albumId: payload.albumId || null,
        createdAt: new Date().toISOString(),
        _status: 'sending',
      };

      // Qayta urinish (retry) bo'lmasa — darhol "yuborilmoqda" optimistik pufakchasini qo'shamiz.
      if (!existingClientId && isActive) {
        setMessages((prev) => [...prev, optimisticMsg]);
        // The reply quote belongs to this message only — clear it now, not after
        // the server answers, or the next message would quote the same one.
        if (replyId && opts.replyTo === undefined) setReplyingTo(null);
      } else if (existingClientId) {
        setMessages((prev) => prev.map((m) => (String(m.clientMessageId) === String(clientMessageId) ? { ...m, _status: 'sending' } : m)));
      }

      // F (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 F — "internet uzilsa xabar
      // local'da turadi, ulanganda yuboriladi") — internet uzilgan bo'lsa tarmoq
      // so'rovini umuman urinib ko'rmaymiz (baribir muvaffaqiyatsiz tugaydi): xabar
      // "sending" holatida (yuqorida qo'shilgan pufakcha) navbatga qo'yiladi, ulanish
      // qaytganda (window 'online' yoki socket 'connect' — flushOfflineQueue) tartib
      // bilan, bittadan yuboriladi.
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        offlineQueueRef.current = enqueueOffline(offlineQueueRef.current, {
          clientMessageId,
          conversationId,
          body,
          message: optimisticMsg,
        });
        persistOfflineQueue();
        return { queued: true };
      }

      const post = () =>
        fetch(`/api/chat/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(body),
        });
      const queued = sendChainRef.current.then(post, post);
      sendChainRef.current = queued.catch(() => {});

      try {
        const res = await queued;
        const data = await res.json();
        if (!res.ok) {
          setMessages((prev) => prev.map((m) => (String(m.clientMessageId) === String(clientMessageId) ? { ...m, _status: 'failed' } : m)));
          return { error: data.error || "Xabar yuborilmadi" };
        }
        // Yuklash davomida boshqa suhbatga o'tilgan bo'lsa, xabar u yerga qo'shilmasin.
        if (String(activeIdRef.current) === String(conversationId)) {
          setMessages((prev) => {
            const idx = prev.findIndex((m) => String(m.clientMessageId) === String(clientMessageId));
            // Keep the local preview so a just-sent photo does not flash while its signed URL loads.
            const finalMsg = { ...data.message, clientMessageId, _status: 'sent', _localUrl: idx === -1 ? null : prev[idx]._localUrl || null };
            if (idx === -1) return prev.some((m) => String(m.id || m._id) === String(finalMsg.id || finalMsg._id)) ? prev : [...prev, finalMsg];
            const next = [...prev];
            next[idx] = finalMsg;
            return next;
          });
        }
        touchList(conversationId, { preview: previewForMessage(payload), createdAt: data.message?.createdAt || new Date().toISOString(), incoming: false });
        return { message: data.message };
      } catch {
        setMessages((prev) => prev.map((m) => (String(m.clientMessageId) === String(clientMessageId) ? { ...m, _status: 'failed' } : m)));
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [activeConversation, authHeaders, touchList, persistOfflineQueue]
  );

  // ------------------------------------------------------------------ uploads (Telegram parity)
  const getUploader = () => {
    if (!uploadsRef.current) {
      uploadsRef.current = createUploadManager({
        presign: async (item) => {
          const r = await fetch('/api/chat/upload/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: item.conversationId, type: item.type, mimeType: item.mimeType, size: item.file.size }),
          });
          const d = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(d.error || "Yuklab bo'lmadi");
          return d;
        },
        put: xhrPut,
      });
    }
    return uploadsRef.current;
  };

  /** Updates one optimistic bubble wherever it lives (open chat and/or the pending store). */
  const patchBubble = useCallback((conversationId, clientMessageId, patch) => {
    const apply = (m) => (String(m.clientMessageId) === String(clientMessageId) ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m);
    if (String(activeIdRef.current) === String(conversationId)) setMessages((prev) => prev.map(apply));
    pendingMediaRef.current = pendingMediaRef.current.map((p) => (p.clientMessageId === clientMessageId ? { ...p, message: apply(p.message) } : p));
  }, []);

  const removeBubble = useCallback((conversationId, clientMessageId) => {
    if (String(activeIdRef.current) === String(conversationId)) {
      setMessages((prev) => prev.filter((m) => String(m.clientMessageId) !== String(clientMessageId)));
    }
    pendingMediaRef.current = pendingMediaRef.current.filter((p) => p.clientMessageId !== clientMessageId);
    const job = localFilesRef.current.get(clientMessageId);
    if (job?.localUrl) URL.revokeObjectURL(job.localUrl);
    localFilesRef.current.delete(clientMessageId);
  }, []);

  const runUpload = useCallback(
    (clientMessageId) => {
      const job = localFilesRef.current.get(clientMessageId);
      if (!job) return;
      job.cancelled = false;
      patchBubble(job.conversationId, clientMessageId, { _status: 'uploading', _upload: { progress: 0 } });
      (async () => {
        let file = job.file;
        let meta = { ...(job.extra || {}) };
        if (job.type === 'image' && !job.asFile) {
          const p = await prepareImage(file);
          file = p.file;
          meta = { ...meta, width: p.width, height: p.height };
        } else if (job.type === 'video') {
          const p = await probeVideo(file);
          meta = { ...meta, width: p.width, height: p.height, ...(meta.durationSec ? {} : p.durationSec ? { durationSec: p.durationSec } : {}) };
        }
        if (job.cancelled) return removeBubble(job.conversationId, clientMessageId);
        const mimeType = file.type || 'application/octet-stream';
        patchBubble(job.conversationId, clientMessageId, (m) => ({ media: { ...m.media, ...meta, size: file.size, mimeType } }));
        job.managerId = `${clientMessageId}:${Date.now()}`;
        const res = await getUploader().enqueue({
          id: job.managerId,
          file,
          mimeType,
          type: job.type,
          conversationId: job.conversationId,
          onChange: (it) => {
            if (it.status === 'uploading') patchBubble(job.conversationId, clientMessageId, { _upload: { progress: it.progress } });
          },
        });
        if (!res) return removeBubble(job.conversationId, clientMessageId); // cancelled
        const payload = {
          type: job.type,
          media: { key: res.key, mimeType, size: file.size, ...meta, ...(job.type === 'file' ? { name: job.name } : {}) },
          ...(job.caption ? { text: job.caption } : {}),
          ...(job.albumId ? { albumId: job.albumId } : {}),
        };
        const out = await sendMessage(payload, clientMessageId, { conversationId: job.conversationId, replyTo: job.replyTo || null });
        if (!out?.error) {
          pendingMediaRef.current = pendingMediaRef.current.filter((p) => p.clientMessageId !== clientMessageId);
          localFilesRef.current.delete(clientMessageId);
        }
      })().catch(() => patchBubble(job.conversationId, clientMessageId, { _status: 'failed', _upload: null }));
    },
    [patchBubble, removeBubble, sendMessage]
  );

  /**
   * Sends picked files the Telegram way: every file becomes its own bubble right now (local preview,
   * progress ring, cancel), uploads run in parallel, photos/videos sent together form an album, the
   * caption goes with the first item. Typing is never blocked. Works for the open chat only.
   */
  const sendAttachments = useCallback(
    (attachments, { caption = '', replyTo = null, asFile = false } = {}) => {
      const conversationId = activeIdRef.current;
      if (!conversationId) return { error: 'Suhbat tanlanmagan' };
      const { albums, singles } = albumGroups(attachments);
      const jobs = [];
      albums.forEach((group) => {
        const albumId = defaultId();
        group.forEach((att, i) => jobs.push({ att, albumId, first: i === 0 && jobs.length === 0 }));
      });
      singles.forEach((att) => jobs.push({ att, albumId: null, first: jobs.length === 0 }));
      const now = Date.now();
      jobs.forEach(({ att, albumId, first }, i) => {
        const clientMessageId = genClientMessageId();
        const localUrl = att.type !== 'file' ? URL.createObjectURL(att.file) : null;
        const text = first ? caption : '';
        const reply = first ? replyTo : null;
        const optimistic = {
          id: clientMessageId,
          clientMessageId,
          conversationId,
          senderId: myIdRef.current,
          type: att.type,
          text,
          media: { key: null, mimeType: att.file.type || 'application/octet-stream', size: att.file.size, name: att.name || '', width: null, height: null, ...(att.extra || {}) },
          albumId,
          replyTo: reply ? { messageId: reply.id, senderId: reply.senderId, type: reply.type, text: reply.text, mediaKey: reply.mediaKey || null } : null,
          createdAt: new Date(now + i).toISOString(),
          _status: 'uploading',
          _upload: { progress: 0 },
          _localUrl: localUrl,
        };
        localFilesRef.current.set(clientMessageId, { file: att.file, type: att.type, name: att.name || '', conversationId, albumId, caption: text, replyTo: reply, extra: att.extra || null, asFile, localUrl });
        pendingMediaRef.current = [...pendingMediaRef.current, { clientMessageId, conversationId, message: optimistic }];
        if (String(activeIdRef.current) === String(conversationId)) setMessages((prev) => [...prev, optimistic]);
        runUpload(clientMessageId);
      });
      if (replyTo) setReplyingTo(null);
      return { ok: true, count: jobs.length };
    },
    [runUpload]
  );

  // Cancel while preparing (flag) or while uploading (abort the XHR); the bubble goes away at once.
  const cancelUpload = useCallback(
    (clientMessageId) => {
      const job = localFilesRef.current.get(clientMessageId);
      if (job) job.cancelled = true;
      if (job?.managerId) uploadsRef.current?.cancel(job.managerId);
      removeBubble(job?.conversationId ?? activeIdRef.current, clientMessageId);
    },
    [removeBubble]
  );

  // MessageBubble'dagi "Qayta yuborish" — xuddi shu clientMessageId bilan qayta
  // yuboradi (server allaqachon saqlagan bo'lsa dublikat yaratmaydi). Media that failed
  // while uploading is uploaded again from the file kept in memory.
  const retryMessage = useCallback(
    (failedMessage) => {
      const clientMessageId = failedMessage.clientMessageId;
      if (!clientMessageId) return;
      if (localFilesRef.current.has(clientMessageId) && !failedMessage.media?.key) return runUpload(clientMessageId);
      const payload = { type: failedMessage.type };
      if (failedMessage.type === 'text') payload.text = failedMessage.text;
      else if (failedMessage.type === 'sticker') payload.stickerId = failedMessage.stickerId;
      else if (failedMessage.media) payload.media = failedMessage.media;
      if (failedMessage.text && failedMessage.type !== 'text') payload.text = failedMessage.text;
      sendMessage(payload, clientMessageId);
    },
    [sendMessage, runUpload]
  );

  // Drafts (Telegram parity) — the Composer calls this on every change (debounced).
  // WP6: localStorage darhol (kesh), server esa draftSync orqali (600 ms debounce). Mazmun
  // o'zgarmagan bo'lsa (masalan chat ochilganda) hech narsa yozilmaydi va PUT ketmaydi.
  const commitDrafts = useCallback((next) => {
    if (next === draftsRef.current) return;
    draftsRef.current = next;
    setDrafts(next);
    writeDrafts(myIdRef.current, next);
  }, []);
  const saveDraft = useCallback(
    (conversationId, draft) => {
      const prev = draftsRef.current;
      const next = setDraftInMap(prev, conversationId, draft);
      if (next === prev) return;
      commitDrafts(next);
      const entry = next[String(conversationId)];
      if (entry?.dirty) draftSyncRef.current?.schedule(conversationId, entry);
    },
    [commitDrafts]
  );
  // Xabar yuborildi: qoralama mahalliy "toza tombstone" bo'ladi; serverdagini messages POST o'zi tozalaydi
  // (shu sabab alohida PUT yuborilmaydi — draftSync faqat yo'lda qolgan eski PUT'dan keyin tombstone yuboradi).
  const clearDraftAfterSend = useCallback(
    (conversationId) => {
      commitDrafts(setDraftInMap(draftsRef.current, conversationId, { text: '', replyTo: null }, Date.now(), { dirty: false }));
      draftSyncRef.current?.clearAfterSend(conversationId);
    },
    [commitDrafts]
  );
  // Server qiymatlari (ro'yxat yuklanishi yoki `draft:update`) — src/lib/chat/draftSync.js#mergeDraft qoidasi.
  const mergeRemoteDrafts = useCallback(
    (entries) => {
      if (entries?.length) commitDrafts(mergeDraftMap(draftsRef.current, entries));
    },
    [commitDrafts]
  );
  useEffect(() => {
    mergeRemoteDraftsRef.current = mergeRemoteDrafts;
  });
  // Oflayn yozilgan (yoki eski versiyadan qolgan) va hali serverga yetmagan qoralamalar — ulanishda yuboriladi.
  const syncDirtyDrafts = useCallback(() => {
    const sync = draftSyncRef.current;
    if (!sync) return;
    for (const [id, entry] of Object.entries(draftsRef.current)) {
      if (entry?.dirty && !sync.isPending(id)) sync.schedule(id, entry);
    }
  }, []);
  useEffect(() => {
    deviceIdRef.current = getDeviceId();
    const sync = createDraftSync({
      deviceId: deviceIdRef.current,
      onAck: (conversationId, sent, serverDraft) => commitDrafts(ackDraft(draftsRef.current, conversationId, sent, serverDraft)),
    });
    draftSyncRef.current = sync;
    syncDirtyDrafts();
    // Sahifa yopilayotganda/yashirilganda kutayotgan PUT'lar darhol (keepalive — javobsiz ham yetadi).
    const flush = () => sync.flush({ keepalive: true });
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
      sync.flush({ keepalive: true });
      sync.dispose();
      draftSyncRef.current = null;
    };
  }, [commitDrafts, syncDirtyDrafts]);

  // Files dropped onto the conversation → the Composer tray.
  const stageExternalFiles = useCallback((files) => setStagedFiles(files && files.length ? files : null), []);

  const editMessage = useCallback(
    async (messageId, text) => {
      if (!activeConversation) return { error: 'Suhbat tanlanmagan' };
      try {
        const res = await fetch(`/api/chat/conversations/${activeConversation.id}/messages/${messageId}`, {
          method: 'PATCH',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ text }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error || 'Tahrirlanmadi' };
        setMessages((prev) => prev.map((m) => (String(m.id || m._id) === String(messageId) ? data.message : m)));
        loadConversations();
        setEditingMessage(null);
        return { message: data.message };
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [activeConversation, authHeaders, loadConversations]
  );

  const startEditMessage = useCallback((message) => {
    setEditingMessage({ id: message.id || message._id, text: message.text || '' });
    setReplyingTo(null);
  }, []);
  const cancelEditMessage = useCallback(() => setEditingMessage(null), []);

  const startReply = useCallback((message) => {
    setReplyingTo({
      id: message.id || message._id,
      senderId: message.senderId,
      type: message.type,
      text: message.type === 'text' ? message.text || '' : '',
    });
    setEditingMessage(null);
  }, []);
  const cancelReply = useCallback(() => setReplyingTo(null), []);

  // `forEveryone` bo'lmasa — faqat shu ro'yxatdan (mahalliy holatdan) olib tashlaymiz,
  // chunki server ham xuddi shunday: boshqa tomon hali ko'raveradi. `forEveryone`da esa
  // server "deletedForEveryone" bilan belgilaydi — mahalliyda ham shu holatga o'tkazamiz
  // (butunlay olib tashlamaymiz, "xabar o'chirildi" ko'rinishi saqlanadi).
  const deleteMessage = useCallback(
    async (messageId, forEveryone) => {
      if (!activeConversation) return { error: 'Suhbat tanlanmagan' };
      try {
        const res = await fetch(`/api/chat/conversations/${activeConversation.id}/messages/${messageId}`, {
          method: 'DELETE',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ forEveryone: !!forEveryone }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return { error: data.error || "O'chirilmadi" };
        }
        // Admin o'z xabarini "hamma uchun" o'chirsa server `silently: true` qaytaradi —
        // tombstone qoldirilmaydi, xabar ro'yxatdan butunlay olib tashlanadi (server
        // GET query'si ham buni tasdiqlaydi, src/lib/models.js'dagi izohga qarang).
        if (forEveryone) {
          setMessages((prev) => applyDeletedForEveryone(prev, messageId, data.silently));
        } else {
          setMessages((prev) => prev.filter((m) => String(m.id || m._id) !== String(messageId)));
        }
        loadConversations();
        return { success: true };
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [activeConversation, authHeaders, loadConversations]
  );

  // Reaksiya (PARITY_PLAN WP7): `emoji` — qo'yish/almashtirish, `null` — olib tashlash. Optimistik:
  // pufakcha darhol yangilanadi, server javobi (to'liq massiv) bilan moslashtiriladi, xatoda esa
  // oldingi holatga qaytariladi. Tez-tez bosilsa faqat ENG OXIRGI so'rov javobi qo'llanadi
  // (`reactSeqRef`) — eski javob yangi optimistik holatni bosib ketmasin. Boshqa tomon va mening
  // boshqa tablarim `message:reacted` orqali oladi (pastdagi socket handler).
  const reactSeqRef = useRef(new Map());
  const setMessageReactions = useCallback((conversationId, messageId, reactions) => {
    const apply = (list) => {
      let changed = false;
      const next = list.map((m) => {
        if (String(m.id || m._id) !== String(messageId)) return m;
        changed = true;
        return { ...m, reactions };
      });
      return changed ? next : list;
    };
    if (String(activeIdRef.current) === String(conversationId)) setMessages(apply);
    const cached = messagesCacheRef.current.get(String(conversationId));
    if (cached) messagesCacheRef.current.set(String(conversationId), apply(cached));
  }, []);
  const reactToMessage = useCallback(
    async (messageId, emoji) => {
      const conversationId = activeIdRef.current;
      if (!conversationId) return { error: 'Suhbat tanlanmagan' };
      const id = String(messageId);
      const target = messagesRef.current.find((m) => String(m.id || m._id) === id);
      if (!target) return { error: 'Xabar topilmadi' };
      const before = target.reactions || [];
      const seq = (reactSeqRef.current.get(id) || 0) + 1;
      reactSeqRef.current.set(id, seq);
      const isLatest = () => reactSeqRef.current.get(id) === seq;
      setMessageReactions(conversationId, id, applyReaction(before, { userId: myIdRef.current, emoji: emoji || null, at: new Date().toISOString() }));
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages/${id}/reactions`, {
          method: emoji ? 'POST' : 'DELETE',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: emoji ? JSON.stringify({ emoji }) : undefined,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (isLatest()) setMessageReactions(conversationId, id, before);
          return { error: data.error || "Reaksiya qo'yib bo'lmadi" };
        }
        if (isLatest()) setMessageReactions(conversationId, id, data.reactions || []);
        return { reactions: data.reactions || [] };
      } catch {
        if (isLatest()) setMessageReactions(conversationId, id, before);
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [authHeaders, setMessageReactions]
  );

  const uploadAndSend = useCallback(
    async (file, type, caption, mediaExtra) => {
      if (!activeConversation) return { error: 'Suhbat tanlanmagan' };
      try {
        const presignRes = await fetch('/api/chat/upload/presign', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            conversationId: activeConversation.id,
            type,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
          }),
        });
        const presignData = await presignRes.json();
        if (!presignRes.ok) return { error: presignData.error || 'Yuklab bo\'lmadi' };

        const putRes = await fetch(presignData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!putRes.ok) return { error: 'Faylni yuklashda xatolik' };

        return sendMessage({
          type,
          media: { key: presignData.key, mimeType: file.type, size: file.size, ...(mediaExtra || {}) },
          ...(caption ? { text: caption } : {}),
        });
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [activeConversation, authHeaders, sendMessage]
  );

  // C-08 — endi bitta natija emas, prefix mos keladigan BARCHA foydalanuvchilar
  // ro'yxati (src/app/api/chat/search/route.js).
  const searchUsername = useCallback(
    async (q) => {
      try {
        const res = await fetch(`/api/chat/search?username=${encodeURIComponent(q)}`, { headers: authHeaders() });
        const data = await res.json();
        return res.ok ? data.results || [] : [];
      } catch {
        return [];
      }
    },
    [authHeaders]
  );

  // H-2 — `category` endi asosiy signal (src/lib/chatConstants.js#REPORT_REASON_CATEGORIES,
  // ReportReasonModal.jsx select'i), `reason` ixtiyoriy qo'shimcha izoh.
  const reportTarget = useCallback(
    async (targetType, targetId, category, reason) => {
      try {
        const res = await fetch('/api/chat/report', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ targetType, targetId, category, reason }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [authHeaders]
  );

  const blockUser = useCallback(
    async (userId) => {
      try {
        const res = await fetch('/api/chat/block', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { error: data.error || 'Bloklanmadi' };
        }
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
      closeConversation();
      loadConversations();
      return { success: true };
    },
    [authHeaders, closeConversation, loadConversations]
  );

  // Do'stlar ro'yxatidan suhbatni o'chiradi (src/app/api/chat/conversations/[id]
  // DELETE) — `forEveryone` bo'lmasa faqat mening ro'yxatimdan/tarixim uchun,
  // bo'lsa ikkala tomon uchun ham. Hujjat o'zi o'chmaydi: keyin qidiruvdan topib
  // qayta yozsa yoki boshqa tomon yozsa, suhbat ro'yxatga qaytadi.
  const deleteConversation = useCallback(
    async (conversationId, forEveryone) => {
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}`, {
          method: 'DELETE',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ forEveryone: !!forEveryone }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { error: data.error || "O'chirilmadi" };
        }
        setConversations((prev) => prev.filter((c) => String(c.id) !== String(conversationId)));
        messagesCacheRef.current.delete(String(conversationId));
        if (String(activeIdRef.current) === String(conversationId)) {
          activeIdRef.current = null;
          setActiveConversation(null);
          setMessages([]);
          setEditingMessage(null);
        }
        return { success: true };
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [authHeaders]
  );

  // C-10 — xabarni yuqoriga qadaydi/yechadi (Conversation.pinnedMessageIds, ikkala
  // tomon uchun umumiy — src/app/api/chat/conversations/[id]/messages/[messageId]/pin).
  // Har ikkalasi ham natijadagi TO'LIQ ro'yxatni qaytaradi (server hisoblagan,
  // cheklov — ko'pi bilan 5 ta) — shu bilan aktiv suhbat va ro'yxatdagi mos yozuvni
  // yangilaymiz (mute/notifyOnline'dagi bilan bir xil naqsh).
  const pinMessage = useCallback(
    async (messageId) => {
      if (!activeConversation) return { error: 'Suhbat tanlanmagan' };
      const conversationId = activeConversation.id;
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages/${messageId}/pin`, {
          method: 'POST',
          headers: authHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: data.error || "Qadalmadi" };
        setActiveConversation((prev) =>
          prev && String(prev.id) === String(conversationId) ? { ...prev, pinnedMessageIds: data.pinnedMessageIds } : prev
        );
        setConversations((prev) =>
          prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, pinnedMessageIds: data.pinnedMessageIds } : c))
        );
        return { success: true };
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [activeConversation, authHeaders]
  );

  const unpinMessage = useCallback(
    async (messageId) => {
      if (!activeConversation) return { error: 'Suhbat tanlanmagan' };
      const conversationId = activeConversation.id;
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages/${messageId}/pin`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: data.error || "Yechilmadi" };
        setActiveConversation((prev) =>
          prev && String(prev.id) === String(conversationId) ? { ...prev, pinnedMessageIds: data.pinnedMessageIds } : prev
        );
        setConversations((prev) =>
          prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, pinnedMessageIds: data.pinnedMessageIds } : c))
        );
        return { success: true };
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [activeConversation, authHeaders]
  );

  // Forward (Telegram parity, PARITY_PLAN WP5): bir yoki bir nechta xabarni 10 tagacha chatga BITTA
  // so'rov bilan (POST /api/chat/messages/forward). Media server tomonda bucket ichida nusxalanadi.
  // Natija nishonma-nishon: { results, okCount, total, failed: [{ conversationId, error, code }], skipped }.
  // Muvaffaqiyatli nishonlar ro'yxatda darhol yuqoriga chiqadi; ochiq suhbat nishon bo'lsa nusxalar
  // shu zahoti qo'shiladi (jonli echo kelganda id bo'yicha dublikat bo'lmaydi).
  const forwardMessages = useCallback(
    async (list, targets, { hideAuthor = false, comment = '' } = {}) => {
      const targetConversationIds = (Array.isArray(targets) ? targets : [targets]).filter(Boolean).map(String);
      const items = (list || []).filter((m) => m && m.type !== 'call' && (m.id || m._id) && !m._status);
      if (!items.length || !targetConversationIds.length) return { error: 'Xabar topilmadi' };
      const sourceConversationId = String(items[0].conversationId || activeIdRef.current);
      let res;
      try {
        res = await fetch('/api/chat/messages/forward', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            sourceConversationId,
            messageIds: items.map((m) => String(m.id || m._id)),
            targetConversationIds,
            hideAuthor: !!hideAuthor,
            ...(comment && comment.trim() ? { comment: comment.trim() } : {}),
            clientBatchId: genClientMessageId(),
          }),
        });
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: data.error || 'Yuborilmadi', code: data.code, skipped: data.skipped || [] };
      const results = Array.isArray(data.results) ? data.results : [];
      for (const r of results) {
        if (!r.ok || !r.messages?.length) continue;
        const last = r.messages[r.messages.length - 1];
        touchList(r.conversationId, { preview: previewForMessage(last), createdAt: last.createdAt, incoming: false });
        if (String(activeIdRef.current) === String(r.conversationId)) r.messages.forEach((m) => upsertLiveMessage(m));
      }
      const failed = results.filter((r) => !r.ok).map((r) => ({ conversationId: r.conversationId, error: r.error, code: r.code }));
      return { success: failed.length === 0, results, okCount: results.length - failed.length, total: results.length, failed, skipped: data.skipped || [] };
    },
    [authHeaders, touchList, upsertLiveMessage]
  );

  const forwardMessage = useCallback(
    (message, targetConversationId, options) => forwardMessages([message], [targetConversationId], options),
    [forwardMessages]
  );

  // Per-user chat flags (archive / pin) — PATCH /state; the list updates in place.
  const setConversationFlags = useCallback(async (conversationId, flags) => {
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/state`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(flags) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: data.error || 'Bajarilmadi' };
      setConversations((prev) => prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, archived: data.archived, pinned: data.pinned } : c)));
      return { success: true, ...data };
    } catch {
      return { error: 'Tarmoq xatoligi' };
    }
  }, []);

  // Multi-select actions on the chat list (delete / archive / read / mute / pin), one request.
  const bulkConversations = useCallback(
    async (ids, action, { forEveryone = false } = {}) => {
      try {
        const res = await fetch('/api/chat/conversations/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, action, forEveryone }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: data.error || 'Bajarilmadi' };
        const done = data.done || [];
        setConversations((prev) => applyBulkAction(prev, done, action));
        if (action === 'delete') {
          done.forEach((id) => messagesCacheRef.current.delete(String(id)));
          if (done.includes(String(activeIdRef.current))) closeConversation();
        }
        return { success: true, done };
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [closeConversation]
  );

  // Boshqa foydalanuvchiga men (faqat men) uchun ko'rinadigan taxallus qo'yadi —
  // UserProfileModal.jsx'dagi "Saqlash" tugmasi chaqiradi (bo'sh string — o'chirish).
  const setNickname = useCallback(
    async (conversationId, nickname) => {
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/nickname`, {
          method: 'PATCH',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ nickname }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: data.error || 'Saqlanmadi' };
        setConversations((prev) =>
          prev.map((c) =>
            String(c.id) === String(conversationId) ? { ...c, otherUser: { ...c.otherUser, nickname: data.nickname } } : c
          )
        );
        setActiveConversation((prev) =>
          prev && String(prev.id) === String(conversationId)
            ? { ...prev, otherUser: { ...prev.otherUser, nickname: data.nickname } }
            : prev
        );
        return { success: true, nickname: data.nickname };
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [authHeaders]
  );

  // Faqat menda (bu userda) shu suhbatning push/bell bildirishnomasini o'chiradi —
  // boshqa tomon buni bilmaydi, xabarlar odatdagidek yetib boraveradi.
  // G-3 — `durationMs` berilsa (MuteDurationModal.jsx tanlovi) muddatli mute, aks
  // holda (mute=true, durationMs yo'q — "Doimiy") doimiy. Unmute (`mute=false`)da
  // durationMs e'tiborga olinmaydi.
  const toggleMuteConversation = useCallback(
    async (conversationId, mute, durationMs) => {
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/mute`, {
          method: mute ? 'POST' : 'DELETE',
          headers: mute ? authHeaders({ 'Content-Type': 'application/json' }) : authHeaders(),
          ...(mute ? { body: JSON.stringify({ durationMs: durationMs || null }) } : {}),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: "Bajarilmadi" };
        const mutedUntil = mute ? data.mutedUntil || null : null;
        setConversations((prev) =>
          prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, muted: mute, mutedUntil } : c))
        );
        setActiveConversation((prev) =>
          prev && String(prev.id) === String(conversationId) ? { ...prev, muted: mute, mutedUntil } : prev
        );
        return { success: true, mutedUntil };
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [authHeaders]
  );

  // Faqat menda (bu userda) — shu suhbatning ikkinchi tomoni ONLAYNGA o'tganda
  // menga Telegram bot orqali xabar kelishini yoqadi/o'chiradi (boshqa tomon
  // buni bilmaydi). Haqiqiy yuborish realtime-server -> src/app/api/internal/
  // presence-online orqali bo'ladi, bu yerda faqat so'rovni yozib qo'yamiz.
  const toggleNotifyOnline = useCallback(
    async (conversationId, notify) => {
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/notify-online`, {
          method: notify ? 'POST' : 'DELETE',
          headers: authHeaders(),
        });
        if (!res.ok) return { error: "Bajarilmadi" };
        setConversations((prev) =>
          prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, notifyOnline: notify } : c))
        );
        setActiveConversation((prev) =>
          prev && String(prev.id) === String(conversationId) ? { ...prev, notifyOnline: notify } : prev
        );
        return { success: true };
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [authHeaders]
  );

  // Faqat menda — shu suhbatga yangi xabar kelganda menga Telegram bot orqali xabar
  // kelishini yoqadi/o'chiradi. Bu tanlov admin menga bergan umumiy sozlamadan ustun
  // (src/app/api/chat/conversations/[id]/message-notify).
  const toggleTgMessageNotify = useCallback(
    async (conversationId, enabled) => {
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/message-notify`, {
          method: enabled ? 'POST' : 'DELETE',
          headers: authHeaders(),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { error: data.error || 'Bajarilmadi' };
        }
        setConversations((prev) =>
          prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, tgMessageNotify: enabled } : c))
        );
        setActiveConversation((prev) =>
          prev && String(prev.id) === String(conversationId) ? { ...prev, tgMessageNotify: enabled } : prev
        );
        return { success: true };
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [authHeaders]
  );

  // Hozir bilingan barcha "boshqa foydalanuvchi"lar (suhbatlar ro'yxati + ochiq
  // suhbat) uchun realtime-server'dan ANIQ onlayn holatni so'raydi (ack orqali) —
  // presence:update hodisasini kutib o'tirmasdan darhol to'g'ri ko'rsatish uchun
  // (masalan sahifa yangi ochilganda yoki yangi suhbat qo'shilganda).
  const queryPresenceForKnownUsers = useCallback(() => {
    const ids = new Set();
    conversationsRef.current.forEach((c) => {
      if (c.otherUser?.id) ids.add(String(c.otherUser.id));
    });
    const activeOtherId = activeConversationRef.current?.otherUser?.id;
    if (activeOtherId) ids.add(String(activeOtherId));
    if (ids.size === 0) return;
    // Socket ulanmagan bo'lsa queryPresence jimgina {} qaytaradi.
    queryPresence(Array.from(ids));
  }, [queryPresence]);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStickers = useCallback(
    () =>
      fetch('/api/chat/stickers')
        .then((res) => (res.ok ? res.json().then((json) => setStickerCatalog(buildStickerCatalog(json))) : undefined))
        .catch(() => {
          // tarmoq xatosi — statik to'plam bilan qolinadi
        }),
    []
  );

  useEffect(() => {
    loadStickers();
  }, [loadStickers]);

  // F — sahifa qayta yuklanganda (yoki komponent birinchi mount bo'lganda) oflayn
  // paytda to'plangan navbat bo'lishi mumkin (localStorage'dan o'qilgan, yuqoridagi
  // offlineQueueRef lazy-init) — hozir onlayn bo'lsak darhol bo'shatishga urinamiz.
  useEffect(() => {
    if (typeof navigator === 'undefined' || navigator.onLine !== false) flushOfflineQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // F — brauzer "internet qaytdi" deb bildirganda (window 'online') navbatni
  // bo'shatishga urinamiz — socket ulanmagan/REST orqali ishlayotgan holatlarda ham
  // ishlaydi (socket 'connect' hodisasidan mustaqil).
  useEffect(() => {
    const onOnline = () => flushOfflineQueue();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [flushOfflineQueue]);

  // Faol suhbatning xabarlar ro'yxati o'zgargan sayin (yuklandi, yangi xabar
  // keldi, tahrirlandi/o'chirildi) keshni ham yangilab boradi — shu suhbatga
  // keyinroq qaytilganda (loadMessagesWithCache) yuklashni kutmasdan darhol
  // eng oxirgi holat ko'rsatiladi.
  // Yuklanayotgan yoki xato bilan tugagan holat keshga yozilmaydi (bo'sh/eskirgan ro'yxat).
  useEffect(() => {
    if (activeConversation && !loadingMessages && !messagesError) {
      messagesCacheRef.current.set(String(activeConversation.id), messages);
    }
  }, [messages, activeConversation, loadingMessages, messagesError]);

  // Ro'yxat yangilanganda (masalan yangi suhbat qidiruvdan ochilganda) ham yangi
  // paydo bo'lgan foydalanuvchilar uchun onlayn holatni so'raymiz.
  useEffect(() => {
    queryPresenceForKnownUsers();
  }, [conversations, activeConversation, queryPresenceForKnownUsers]);

  // Composer matn kiritganda (kind='text', standart) yoki ovozli/video xabar
  // yozib turilganda (VoiceRecorder/VideoRecorder — 2s'da bir marta "heartbeat"
  // sifatida) chaqiradi (throttled — bitta suhbat uchun 2s'da bir marta ko'proq
  // emas) — boshqa tomonga "yozmoqda.../ovoz yubormoqda.../video yubormoqda..."
  // signalini yuboradi.
  const sendTyping = useCallback((kind = 'text') => {
    const convo = activeConversationRef.current;
    if (!socketConnected || !convo?.otherUser?.id) return;
    const key = convo.id;
    const now = Date.now();
    if (lastTypingEmitRef.current[key] && now - lastTypingEmitRef.current[key] < 2000) return;
    lastTypingEmitRef.current[key] = now;
    emit('typing', { recipientId: convo.otherUser.id, conversationId: convo.id, kind });
  }, [socketConnected, emit]);

  // Realtime: mavjud bo'lsa socket orqali jonli push, aks holda (yoki uzilganda)
  // ochiq suhbatni qayta so'raymiz — chat hech qachon socket'ga qattiq bog'liq
  // bo'lmasligi kerak (docs/ chat plani §2).
  //
  // PARITY_PLAN WP1 — socket va chipta RealtimeProvider'da; bu yerda faqat `on(event, fn)` bilan
  // obuna bo'lamiz va unmount'da hammasini `off()` qilamiz (socket o'zi uzilmaydi — boshqa
  // sahifada ham ishlayveradi). Handlerlar har renderda yangilanadigan ref orqali chaqiriladi, shuning
  // uchun obuna faqat bir marta (mount'da) qilinadi.
  const liveRef = useRef(null);
  useEffect(() => {
    liveRef.current = { loadConversations, loadMessages, flushOfflineQueue, upsertLiveMessage, markRead, touchList, mergeRemoteDrafts, syncDirtyDrafts, setMessageReactions };
  });
  useEffect(() => {
    const live = () => liveRef.current;
    // C-11 — boshqa tomon xabarni tahrirlaganda real-vaqtda yangi matnni ko'rsatamiz.
    const onMessageEdited = ({ conversationId, message } = {}) => {
      if (!conversationId || !message) return;
      if (String(conversationId) === String(activeIdRef.current)) {
        setMessages((prev) =>
          prev.map((m) =>
            String(m.id || m._id) === String(message.id)
              ? { ...m, text: message.text, edited: true, editedAt: message.editedAt }
              : m
          )
        );
      }
      live().loadConversations();
    };
    // C-11 — "hamma uchun" o'chirilganda tombstone (yoki `silently` bo'lsa butunlay olib tashlash).
    const onMessageDeleted = ({ conversationId, messageId, silently } = {}) => {
      if (!conversationId || !messageId) return;
      if (String(conversationId) === String(activeIdRef.current)) {
        setMessages((prev) => applyDeletedForEveryone(prev, messageId, silently));
      }
      live().loadConversations();
    };
    const typingTimers = typingTimersRef;
    const offs = [
      // F — reconnect sync ("Reconnect'da o'tkazib yuborilgan xabarlarni sync qilish"): HAR bir
      // 'connect'da (dastlabki va qayta ulanishlarda) ro'yxat, ochiq suhbat va offline navbat.
      // Provider mount bo'lganda socket allaqachon ulangan bo'lsa 'connect' kelmaydi — o'sha holatda
      // xuddi shu qadamlarni pastdagi mount effektlari (loadConversations + flushOfflineQueue)
      // bajaradi; ochiq suhbat esa mount paytida hali yo'q (ikki marta so'ramaslik uchun).
      on('connect', () => {
        const l = live();
        l.loadConversations();
        if (activeIdRef.current) l.loadMessages(activeIdRef.current, { silent: true });
        l.flushOfflineQueue();
        l.syncDirtyDrafts();
      }),
      // WP6: shu userning boshqa tab/qurilmasida qoralama o'zgardi (yoki xabar yuborilib tozalandi).
      // O'zimiz yuborgan PUT'ning aks-sadosi (`deviceId` bir xil) e'tiborsiz qoldiriladi.
      on('draft:update', ({ conversationId, draft, deviceId } = {}) => {
        if (!conversationId || !draft) return;
        if (deviceId && deviceId === deviceIdRef.current) return;
        live().mergeRemoteDrafts([[conversationId, draft]]);
      }),
      on('message:new', ({ conversationId, message } = {}) => {
        // Eski realtime-server (emit-edited/emit-deleted endpointlarisiz) uchun fallback:
        // tahrir/o'chirish shu kanal orqali `_event` bilan keladi (src/lib/realtime.js).
        if (message?._event === 'deleted') {
          onMessageDeleted({ conversationId, messageId: message.id, silently: message.silently });
          return;
        }
        if (message?._event === 'edited') {
          onMessageEdited({ conversationId, message });
          return;
        }
        if (!conversationId || !message) return;
        const l = live();
        const mine = String(message.senderId) === String(myIdRef.current);
        const isActive = String(conversationId) === String(activeIdRef.current);
        const visible = typeof document !== 'undefined' && !document.hidden;
        if (isActive) {
          l.upsertLiveMessage(message);
          // Telegram uslubi: suhbat ochiq va tab ko'rinib turgan bo'lsa kelgan zahoti "o'qildi";
          // yashirin tabda — tab qayta ko'ringanda (pastdagi visibilitychange effekti).
          if (visible && !mine) l.markRead(conversationId);
        }
        // Toast endi RealtimeProvider'da (bu yerda emas).
        l.touchList(conversationId, {
          preview: previewForMessage(message),
          createdAt: message.createdAt,
          incoming: !mine && !message.readAt && !(isActive && visible),
        });
      }),
      // Men yuborgan xabar(lar) boshqa tomonda o'qilganda — bitta ptichka ikkitaga aylanadi.
      on('message:read', ({ conversationId, readAt } = {}) => {
        if (!conversationId || String(conversationId) !== String(activeIdRef.current)) return;
        setMessages((prev) =>
          prev.map((m) => (m.readAt || String(m.senderId) !== String(myIdRef.current) ? m : { ...m, readAt }))
        );
      }),
      // Reaksiya o'zgardi (PARITY_PLAN WP7) — to'liq massiv keladi, almashtiramiz (delta emas).
      // Ro'yxat preview'i va o'qilmaganlar soniga tegmaydi. O'z so'rovim hali kutilayotgan bo'lsa,
      // bu hodisa uning natijasi yoki undan oldingisi — javob baribir oxirida moslashtiradi.
      on('message:reacted', ({ conversationId, messageId, reactions } = {}) => {
        if (!conversationId || !messageId || !Array.isArray(reactions)) return;
        live().setMessageReactions(conversationId, messageId, reactions);
      }),
      on('message:edited', onMessageEdited),
      on('message:deleted', onMessageDeleted),
      // Boshqa qurilmamda suhbat o'qildi (WP3 self-event) — shu qatordagi hisoblagich nolga.
      on('conversation:read', ({ conversationId } = {}) => {
        if (!conversationId) return;
        setConversations((prev) =>
          prev.map((c) => (String(c.id) === String(conversationId) && c.unreadCount ? { ...c, unreadCount: 0 } : c))
        );
      }),
      // "yozmoqda..." — 3s ichida yana kelmasa o'zi tozalanadi (aniq "to'xtatdi" hodisasi yo'q).
      on('typing', ({ conversationId, kind } = {}) => {
        if (!conversationId) return;
        clearTimeout(typingTimers.current[conversationId]);
        setTypingByConversation((prev) => ({ ...prev, [conversationId]: kind || 'text' }));
        typingTimers.current[conversationId] = setTimeout(() => {
          setTypingByConversation((prev) => {
            if (!prev[conversationId]) return prev;
            const next = { ...prev };
            delete next[conversationId];
            return next;
          });
        }, 3000);
      }),
    ];
    return () => {
      offs.forEach((off) => off());
      Object.values(typingTimers.current).forEach(clearTimeout);
      typingTimers.current = {};
    };
  }, [on]);

  // RealtimeProvider ochiq suhbatni biladi: unga kelgan xabar toast/badge'ga tushmaydi.
  useEffect(() => {
    setActiveConversationId(activeConversation?.id ?? null);
  }, [activeConversation?.id, setActiveConversationId]);
  useEffect(() => () => setActiveConversationId(null), [setActiveConversationId]);

  // Ro'yxat yuklangan bo'lsa — nav belgisi va tab sarlavhasi shu (eng aniq) manbadan hisoblanadi.
  useEffect(() => {
    if (loadingConversations || conversationsError) return;
    setUnreadFromConversations(conversations);
  }, [conversations, loadingConversations, conversationsError, setUnreadFromConversations]);

  // Fallback when the realtime socket is down or not configured: poll the open
  // conversation — every 2s while the tab is visible (close to live), every
  // 15s in the background, and at once when the tab comes back.
  useEffect(() => {
    clearTimeout(pollRef.current);
    if (!activeConversation || socketConnected) return undefined;
    let stopped = false;
    const tick = async () => {
      // `noRead: true` — bu shunchaki fon rejimidagi qayta tekshirish, shuning
      // uchun server tarafda avtomatik "o'qildi" belgilanmaydi. Tab haqiqatan
      // ham ko'rinib turgan bo'lsagina alohida (yengil) /read so'rovi bilan
      // o'qilgan deb belgilaymiz.
      await loadMessages(activeConversation.id, { silent: true, noRead: true }).catch(() => {});
      if (!document.hidden) markRead(activeConversation.id);
      if (!stopped) pollRef.current = setTimeout(tick, document.hidden ? 15000 : 2000);
    };
    pollRef.current = setTimeout(tick, 2000);
    const onVisible = () => {
      if (document.hidden || stopped) return;
      clearTimeout(pollRef.current);
      tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      clearTimeout(pollRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [activeConversation, socketConnected, loadMessages, markRead]);

  // Foydalanuvchi tabga qaytganda (masalan boshqa tabda edi yoki oynani
  // kichraytirgan edi) — shu vaqt ichida "o'qilmagan" holida qolgan xabarlarni
  // (yuqoridagi ikkita joy ataylab tab yashirin bo'lganda belgilamagan) endi
  // tutib olamiz.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden && activeConversationRef.current) {
        markRead(activeConversationRef.current.id);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [markRead]);

  const value = {
    conversations,
    loadingConversations,
    conversationsError,
    activeConversation,
    messages,
    loadingMessages,
    messagesError,
    retryLoadMessages,
    socketConnected,
    loadConversations,
    selectConversation,
    closeConversation,
    openConversationByUsername,
    sendMessage,
    retryMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    editingMessage,
    startEditMessage,
    cancelEditMessage,
    replyingTo,
    startReply,
    cancelReply,
    uploadAndSend,
    loadOlderMessages,
    searchUsername,
    reportTarget,
    blockUser,
    toggleMuteConversation,
    toggleNotifyOnline,
    toggleTgMessageNotify,
    setNickname,
    deleteConversation,
    pinMessage,
    unpinMessage,
    forwardMessage,
    forwardMessages,
    chatNotice,
    showChatNotice,
    sendAttachments,
    cancelUpload,
    ensureMessageLoaded,
    drafts,
    saveDraft,
    clearDraftAfterSend,
    stagedFiles,
    stageExternalFiles,
    setConversationFlags,
    bulkConversations,
    livePresence,
    typingByConversation,
    sendTyping,
    stickerPacks: stickerCatalog.packs,
    stickerById: stickerCatalog.byId,
    loadStickers,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
