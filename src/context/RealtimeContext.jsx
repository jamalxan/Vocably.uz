'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { connectChatSocket } from '@/lib/socketClient';
import {
  EMPTY_UNREAD,
  applyUnreadOnMessage,
  nextBackoffMs,
  sameUnread,
  shouldToast,
  titleWithBadge,
  unreadFromConversations,
} from '@/lib/realtime/clientState';
import { PRESENCE_SETTINGS_EVENT, isMutedNow, previewForMessage } from '@/lib/chatConstants';
import { installAudioUnlock, isAudioUnlocked, playMessageBlip } from '@/lib/call/sounds';

// docs/chat/PARITY_PLAN.md WP1 — butun (main) zona uchun YAGONA socket. Avval socket ChatProvider
// ichida edi (faqat /app/friends'da mount bo'lardi): boshqa sahifaga o'tilsa uzilardi, birinchi
// chipta 60 s'da eskirgach har reconnect 'unauthorized' bilan rad etilardi va nav/sarlavhada
// o'qilmaganlar soni ham, ilova ichidagi toast ham yo'q edi. Endi:
//   - har ulanish urinishida yangi chipta (socketClient.js, CALLS_SPEC §3.3);
//   - 'unauthorized'dan keyin qo'lda backoff 2/4/8/16/30 s; chipta 401/403 bo'lsa to'xtaydi va
//     faqat tab yana ko'ringanda (visibilitychange) bir marta qayta urinadi;
//   - presence, unread (nav belgisi + tab sarlavhasi) va toast shu yerda — har qanday /app sahifada.
// ChatProvider va CallProvider hodisalarga `on(event, fn)` orqali obuna bo'ladi.

const RealtimeContext = createContext(null);

const NOOP_OFF = () => {};
// Provider tashqarisida (masalan testlar yoki (main)dan tashqaridagi sahifa) — xavfsiz "realtime yo'q".
const FALLBACK = Object.freeze({
  configured: false,
  socket: null,
  connected: false,
  livePresence: {},
  queryPresence: () => Promise.resolve({}),
  emit: () => false,
  on: () => NOOP_OFF,
  unread: EMPTY_UNREAD,
  refreshUnread: () => Promise.resolve(),
  setUnreadFromConversations: () => {},
  activeConversationId: null,
  setActiveConversationId: () => {},
  toast: null,
  dismissToast: () => {},
  myId: null,
});

const PRESENCE_TIMEOUT_MS = 5000;
const UNREAD_DEBOUNCE_MS = 500;
const OFFLINE_UNREAD_POLL_MS = 60_000;
const TOAST_MS = 5000;

export function RealtimeProvider({ children }) {
  const { chatAccess, chatUserId } = useApp();
  const configured = !!process.env.NEXT_PUBLIC_REALTIME_URL;

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [livePresence, setLivePresence] = useState({});
  const [unread, setUnread] = useState(EMPTY_UNREAD);
  const [activeConversationId, setActiveConversationIdState] = useState(null);
  const [toast, setToast] = useState(null);

  const socketRef = useRef(null);
  const myIdRef = useRef(chatUserId);
  useEffect(() => { myIdRef.current = chatUserId; });
  const activeIdRef = useRef(null);
  // Tashqi obunachilar: event -> Set(handler). Socket almashsa (boshqa user) ham saqlanadi.
  const handlersRef = useRef(new Map());
  const attachedRef = useRef(new Set()); // joriy socket'ga ulangan dispatcher event nomlari
  // Suhbat haqida yengil ma'lumot (toast yorlig'i, mute): ChatProvider ro'yxatidan yoki zaxira fetch'dan.
  const metaRef = useRef(new Map()); // conversationId -> { username, label, muted, unreadCount }
  const metaFetchRef = useRef(null);
  const unreadTimerRef = useRef(null);
  const unreadInFlightRef = useRef(false);

  // ---------------------------------------------------------------- unread
  const fetchUnreadNow = useCallback(async () => {
    if (unreadInFlightRef.current) return;
    unreadInFlightRef.current = true;
    try {
      const res = await fetch('/api/chat/unread', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const next = { total: Number(data.total) || 0, mutedTotal: Number(data.mutedTotal) || 0, chats: Number(data.chats) || 0 };
      setUnread((prev) => (sameUnread(prev, next) ? prev : next));
    } catch {
      // tarmoq xatosi — keyingi safar
    } finally {
      unreadInFlightRef.current = false;
    }
  }, []);

  const refreshUnread = useCallback(
    () =>
      new Promise((resolve) => {
        clearTimeout(unreadTimerRef.current);
        unreadTimerRef.current = setTimeout(() => fetchUnreadNow().finally(resolve), UNREAD_DEBOUNCE_MS);
      }),
    [fetchUnreadNow]
  );

  const setUnreadFromConversations = useCallback((list) => {
    const meta = new Map();
    (list || []).forEach((c) => {
      const u = c.otherUser || {};
      meta.set(String(c.id), {
        username: u.username || null,
        label: u.nickname || (u.username ? `@${u.username}` : u.name || ''),
        muted: isMutedNow(c),
        unreadCount: Number(c.unreadCount) || 0,
        archived: !!c.archived,
        otherUserId: u.id ? String(u.id) : null,
      });
    });
    metaRef.current = meta;
    const next = unreadFromConversations(list);
    setUnread((prev) => (sameUnread(prev, next) ? prev : next));
  }, []);

  // Toast uchun meta topilmasa (ChatProvider mount bo'lmagan sahifa) — ro'yxatni bir marta so'raymiz.
  const ensureMeta = useCallback(async (conversationId) => {
    const id = String(conversationId);
    if (metaRef.current.has(id)) return metaRef.current.get(id);
    if (!metaFetchRef.current) {
      metaFetchRef.current = fetch('/api/chat/conversations')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data?.conversations) return;
          const meta = new Map(metaRef.current);
          data.conversations.forEach((c) => {
            const u = c.otherUser || {};
            meta.set(String(c.id), {
              username: u.username || null,
              label: u.nickname || (u.username ? `@${u.username}` : u.name || ''),
              muted: isMutedNow(c),
              unreadCount: Number(c.unreadCount) || 0,
              otherUserId: u.id ? String(u.id) : null,
            });
          });
          metaRef.current = meta;
        })
        .catch(() => {})
        .finally(() => {
          metaFetchRef.current = null;
        });
    }
    await metaFetchRef.current;
    return metaRef.current.get(id) || null;
  }, []);

  // ---------------------------------------------------------------- active chat
  const setActiveConversationId = useCallback((id) => {
    const v = id ? String(id) : null;
    activeIdRef.current = v;
    setActiveConversationIdState(v);
  }, []);

  // ---------------------------------------------------------------- subscriptions
  const dispatch = useCallback((event, args) => {
    const set = handlersRef.current.get(event);
    if (!set) return;
    [...set].forEach((fn) => {
      try {
        fn(...args);
      } catch (err) {
        console.error(`[realtime] ${event} handler xatosi`, err);
      }
    });
  }, []);

  const attach = useCallback(
    (s, event) => {
      if (!s || attachedRef.current.has(event)) return;
      attachedRef.current.add(event);
      s.on(event, (...args) => dispatch(event, args));
    },
    [dispatch]
  );

  const on = useCallback(
    (event, handler) => {
      if (!event || typeof handler !== 'function') return NOOP_OFF;
      let set = handlersRef.current.get(event);
      if (!set) {
        set = new Set();
        handlersRef.current.set(event, set);
      }
      set.add(handler);
      attach(socketRef.current, event);
      return () => {
        handlersRef.current.get(event)?.delete(handler);
      };
    },
    [attach]
  );

  const emit = useCallback((event, payload, ack) => {
    const s = socketRef.current;
    if (!s || !s.connected) return false;
    if (typeof ack === 'function') s.emit(event, payload, ack);
    else s.emit(event, payload);
    return true;
  }, []);

  const queryPresence = useCallback((ids) => {
    const s = socketRef.current;
    const list = [...new Set((ids || []).filter(Boolean).map(String))];
    if (!s || !s.connected || !list.length) return Promise.resolve({});
    return new Promise((resolve) => {
      s.timeout(PRESENCE_TIMEOUT_MS).emit('presence:query', list, (err, result) => {
        if (err || !result || typeof result !== 'object') return resolve({});
        setLivePresence((prev) => ({ ...prev, ...result }));
        resolve(result);
      });
    });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // ---------------------------------------------------------------- connection lifecycle
  useEffect(() => {
    if (!configured || !chatAccess || !chatUserId) return undefined;
    let disposed = false;
    let stopped = false;
    let attempt = 0;
    let retryTimer = null;

    const fetchTicket = async () => {
      const res = await fetch('/api/chat/socket-ticket', { method: 'POST' });
      if (res.status === 401 || res.status === 403) {
        // Sessiya tugagan yoki chat ruxsati olingan — tab yana ko'rinmaguncha urinmaymiz.
        stopped = true;
        throw new Error('ticket_denied');
      }
      if (!res.ok) throw new Error('ticket_failed');
      const data = await res.json();
      return data.ticket || '';
    };

    const s = connectChatSocket(fetchTicket);
    if (!s) return undefined;
    socketRef.current = s;
    attachedRef.current = new Set();
    setSocket(s);
    if (process.env.NEXT_PUBLIC_E2E_HOOKS === '1') window.__vocablyRealtime = { socket: s };

    s.on('connect', () => {
      attempt = 0;
      clearTimeout(retryTimer);
      setConnected(true);
      const ids = [...metaRef.current.values()].map((m) => m.otherUserId).filter(Boolean);
      if (ids.length) queryPresence(ids);
      refreshUnread();
    });
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', (err) => {
      setConnected(false);
      // Transport xatosi (server o'chiq) — socket.io o'zi qayta urinadi (socket.active === true).
      if (s.active || disposed) return;
      if (stopped) {
        s.disconnect();
        return;
      }
      if (err?.message !== 'unauthorized') return;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => {
        if (!disposed && !stopped && !s.connected) s.connect();
      }, nextBackoffMs(attempt++));
    });
    s.on('presence:update', ({ userId, online } = {}) => {
      if (!userId) return;
      setLivePresence((prev) => (prev[String(userId)] === online ? prev : { ...prev, [String(userId)]: online }));
    });
    // "Yozmoqda" faqat ulangan socket'dan keladi — demak yozayotgan odam hozir onlayn. Server
    // presence:update'ni kechiktirib yuborishi mumkin (offline grace) — bu yerda darhol ko'rsatamiz.
    s.on('typing', ({ userId } = {}) => {
      if (!userId || String(userId) === String(myIdRef.current)) return;
      setLivePresence((prev) => (prev[String(userId)] === true ? prev : { ...prev, [String(userId)]: true }));
    });
    // Boshqa qurilmamda suhbat o'qildi (WP3 self-event) — umumiy sonni server'dan qayta olamiz.
    s.on('conversation:read', () => refreshUnread());
    s.on('message:new', (payload = {}) => {
      const { conversationId, message, sender } = payload;
      if (!conversationId || !message || message._event) return;
      const myId = myIdRef.current;
      const hidden = typeof document !== 'undefined' ? document.hidden : false;
      const id = String(conversationId);
      const known = metaRef.current.get(id);
      const silent = typeof payload.silent === 'boolean' ? payload.silent : !!known?.muted;
      const ctx = { conversationId: id, message, silent, myId, activeConversationId: activeIdRef.current, hidden };
      setUnread((prev) => applyUnreadOnMessage(prev, { ...ctx, wasUnread: (known?.unreadCount || 0) > 0, archived: !!known?.archived }));
      if (known && String(message.senderId) !== String(myId) && !message.readAt) {
        metaRef.current.set(id, { ...known, unreadCount: known.unreadCount + 1 });
      }
      if (!shouldToast(ctx)) return;
      const show = (meta) => {
        if (disposed) return;
        // Meta yuklanganda suhbat ovozsiz bo'lib chiqsa (payload'da `silent` yo'q edi) — ko'rsatmaymiz.
        if (typeof payload.silent !== 'boolean' && meta?.muted) return;
        const username = sender?.username || meta?.username || null;
        setToast({
          key: `${id}:${message.id || message._id || message.createdAt}`,
          conversationId: id,
          username,
          senderLabel: sender?.label || meta?.label || (username ? `@${username}` : ''),
          preview: previewForMessage(message),
        });
        if (!document.hidden && isAudioUnlocked()) playMessageBlip();
      };
      if (sender?.username) show(known);
      else ensureMeta(id).then(show);
    });

    // Bir martalik obunachilar ham shu socket'ga ulanadi.
    handlersRef.current.forEach((_, event) => attach(s, event));

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      refreshUnread();
      if (stopped && !s.connected) {
        stopped = false;
        attempt = 0;
        s.connect();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    // "Oxirgi marta ko'rilgan" maxfiyligi o'zgardi (ProfileSettings) — chipta shu sozlamani olib
    // yuradi (`hp`), shuning uchun yangi chipta bilan qayta ulanamiz.
    const onPresenceSettings = () => {
      if (disposed || stopped) return;
      if (s.connected) s.disconnect();
      s.connect();
    };
    window.addEventListener(PRESENCE_SETTINGS_EVENT, onPresenceSettings);

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener(PRESENCE_SETTINGS_EVENT, onPresenceSettings);
      s.removeAllListeners();
      s.disconnect();
      if (socketRef.current === s) socketRef.current = null;
      attachedRef.current = new Set();
      if (process.env.NEXT_PUBLIC_E2E_HOOKS === '1' && window.__vocablyRealtime?.socket === s) delete window.__vocablyRealtime;
      setSocket(null);
      setConnected(false);
    };
  }, [configured, chatAccess, chatUserId, attach, queryPresence, refreshUnread, ensureMeta]);

  // Birinchi yuklanish: socket bo'lmasa ham (realtime sozlanmagan) nav belgisi to'g'ri bo'lsin.
  useEffect(() => {
    if (!chatAccess || !chatUserId) return undefined;
    fetchUnreadNow();
    return undefined;
  }, [chatAccess, chatUserId, fetchUnreadNow]);

  // Socket yo'q/uzilgan va tab ko'rinib turgan paytda — har 60 s'da (badge eskirib qolmasin).
  useEffect(() => {
    if (!chatAccess || !chatUserId || connected) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') fetchUnreadNow();
    }, OFFLINE_UNREAD_POLL_MS);
    return () => clearInterval(timer);
  }, [chatAccess, chatUserId, connected, fetchUnreadNow]);

  // Logout / chat ruxsati olinsa — eski holat qolmasin.
  const [prevUser, setPrevUser] = useState(chatAccess ? chatUserId : null);
  const currentUser = chatAccess ? chatUserId : null;
  if (prevUser !== currentUser) {
    setPrevUser(currentUser);
    setUnread(EMPTY_UNREAD);
    setToast(null);
    setLivePresence({});
  }

  // Toast 5 s'dan keyin yopiladi (NewMessageToast ham o'z taymerini tutadi — bu zaxira).
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast((cur) => (cur === toast ? null : cur)), TOAST_MS + 500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Tovush: (main) zonadagi birinchi bosish/tugma AudioContext'ni ochadi (CALLS_SPEC §9.4).
  useEffect(() => {
    installAudioUnlock();
  }, []);

  // Tab sarlavhasi: `(3) Vocably`. Next navigatsiyada <title>ni almashtiradi — MutationObserver
  // prefiksni qayta qo'yadi (o'zgarmagan bo'lsa yozmaydi, aks holda cheksiz sikl bo'lardi).
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const total = unread.total;
    const apply = () => {
      const want = titleWithBadge(document.title, total);
      if (document.title !== want) document.title = want;
    };
    apply();
    const Observer = window.MutationObserver;
    if (!Observer) return undefined;
    const obs = new Observer(apply);
    obs.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      obs.disconnect();
      // Komponent yo'qolganda (logout) prefiks qolib ketmasin.
      const plain = titleWithBadge(document.title, 0);
      if (document.title !== plain) document.title = plain;
    };
  }, [unread.total]);

  const value = useMemo(
    () => ({
      configured,
      socket,
      connected,
      livePresence,
      queryPresence,
      emit,
      on,
      unread,
      refreshUnread,
      setUnreadFromConversations,
      activeConversationId,
      setActiveConversationId,
      toast,
      dismissToast,
      myId: chatUserId,
    }),
    [configured, socket, connected, livePresence, queryPresence, emit, on, unread, refreshUnread, setUnreadFromConversations, activeConversationId, setActiveConversationId, toast, dismissToast, chatUserId]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext) || FALLBACK;
}
