'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { connectChatSocket } from '@/lib/socketClient';

const ChatContext = createContext(null);

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
  const [socketConnected, setSocketConnected] = useState(false);
  // Composer'da "tahrirlash rejimi" — xabar matni inputga qaytariladi, yuborish
  // o'rniga saqlash (PATCH) chaqiriladi. Faqat o'z matnli xabarlariga tegishli.
  const [editingMessage, setEditingMessage] = useState(null); // { id, text }
  // Composer'da "javob berish rejimi" — keyingi yuboriladigan xabar (matn yoki
  // media, farqi yo'q) shu xabarga iqtibos sifatida bog'lanadi (server snapshot oladi).
  const [replyingTo, setReplyingTo] = useState(null); // { id, senderId, type, text }
  // realtime-server'dan kelgan ANIQ onlayn holat: { [userId]: true|false } — mavjud
  // bo'lsa src/lib/presence.js'dagi lastActiveAt-taxminidan ustuvor (docs/ shu faylning
  // pastidagi queryPresenceForKnownUsers izohiga qarang).
  const [livePresence, setLivePresence] = useState({});
  // Qaysi suhbatda hozir "yozmoqda..." holati faol: { [conversationId]: true } —
  // har bir yozuv 3s'dan keyin o'zi tozalanadi (pastdagi socket 'typing' handler'i).
  const [typingByConversation, setTypingByConversation] = useState({});

  const socketRef = useRef(null);
  const pollRef = useRef(null);
  // Har bir suhbat uchun oxirgi ko'rilgan xabarlar ro'yxatini eslab qoladi —
  // ikkita suhbat orasida oldinga-orqaga o'tilganda (masalan ikki do'st bilan
  // navbatma-navbat yozishganda) HAR SAFAR bo'sh ekrandan spinner ko'rsatib
  // qayta yuklamaslik uchun: keshdagi xabar darhol ko'rsatiladi, so'ngra fon
  // rejimida (silent) yangilanadi — aks holda har almashtirishda butun ro'yxat
  // bir lahzaga yo'qolib "sahifa qayta yuklanyapti" taassurotini berardi.
  const messagesCacheRef = useRef(new Map());
  const activeIdRef = useRef(null);
  activeIdRef.current = activeConversation?.id || null;
  const activeConversationRef = useRef(null);
  activeConversationRef.current = activeConversation;
  const conversationsRef = useRef([]);
  conversationsRef.current = conversations;
  const replyingToRef = useRef(null);
  replyingToRef.current = replyingTo;
  const myIdRef = useRef(null);
  myIdRef.current = myUserId;
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

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations || []);
        setConversationsError(false);
      } else {
        setConversationsError(true);
      }
    } catch {
      setConversationsError(true);
    } finally {
      setLoadingConversations(false);
    }
  }, [authHeaders]);

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
          setMessages(list);
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
    if (!activeConversation || messages.length === 0 || !hasMoreOlderRef.current) return;
    const conversationId = activeConversation.id;
    try {
      const before = messages[0].createdAt;
      const res = await fetch(
        `/api/chat/conversations/${conversationId}/messages?before=${encodeURIComponent(before)}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (String(activeIdRef.current) !== String(conversationId)) return;
      if (res.ok) {
        const older = data.messages || [];
        if (older.length < 50) hasMoreOlderRef.current = false;
        if (older.length) setMessages((prev) => [...older, ...prev]);
      }
    } catch {
      // jimgina
    }
  }, [activeConversation, messages, authHeaders]);

  // Keshda bo'lsa — darhol shuni ko'rsatadi (spinnersiz) va fonda yangilaydi;
  // bo'lmasa (bu suhbat birinchi marta ochilyapti) oddiy spinner bilan yuklaydi.
  const loadMessagesWithCache = useCallback(
    (conversationId) => {
      const cached = messagesCacheRef.current.get(String(conversationId));
      hasMoreOlderRef.current = true;
      if (cached) {
        setMessages(cached);
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

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => (prev.some((m) => String(m.id || m._id) === String(msg.id || msg._id)) ? prev : [...prev, msg]));
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

  const sendMessage = useCallback(
    async (payload) => {
      if (!activeConversation) return { error: 'Suhbat tanlanmagan' };
      const replyId = replyingToRef.current?.id;
      const conversationId = activeConversation.id;
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(replyId ? { ...payload, replyTo: replyId } : payload),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error || "Xabar yuborilmadi" };
        // Yuklash davomida boshqa suhbatga o'tilgan bo'lsa, xabar u yerga qo'shilmasin.
        if (String(activeIdRef.current) === String(conversationId)) appendMessage(data.message);
        loadConversations();
        if (replyId) setReplyingTo(null);
        return { message: data.message };
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [activeConversation, authHeaders, appendMessage, loadConversations]
  );

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
        if (forEveryone && !data.silently) {
          setMessages((prev) =>
            prev.map((m) =>
              String(m.id || m._id) === String(messageId)
                ? { ...m, deletedForEveryone: true, text: '', media: null, stickerId: null }
                : m
            )
          );
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

  const uploadAndSend = useCallback(
    async (file, type, caption) => {
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
          media: { key: presignData.key, mimeType: file.type, size: file.size },
          ...(caption ? { text: caption } : {}),
        });
      } catch {
        return { error: 'Tarmoq xatoligi' };
      }
    },
    [activeConversation, authHeaders, sendMessage]
  );

  const searchUsername = useCallback(
    async (q) => {
      try {
        const res = await fetch(`/api/chat/search?username=${encodeURIComponent(q)}`, { headers: authHeaders() });
        const data = await res.json();
        return res.ok ? data.result : null;
      } catch {
        return null;
      }
    },
    [authHeaders]
  );

  const reportTarget = useCallback(
    async (targetType, targetId, reason) => {
      try {
        const res = await fetch('/api/chat/report', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ targetType, targetId, reason }),
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
  const toggleMuteConversation = useCallback(
    async (conversationId, mute) => {
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/mute`, {
          method: mute ? 'POST' : 'DELETE',
          headers: authHeaders(),
        });
        if (!res.ok) return { error: "Bajarilmadi" };
        setConversations((prev) => prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, muted: mute } : c)));
        setActiveConversation((prev) => (prev && String(prev.id) === String(conversationId) ? { ...prev, muted: mute } : prev));
        return { success: true };
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

  // Hozir bilingan barcha "boshqa foydalanuvchi"lar (suhbatlar ro'yxati + ochiq
  // suhbat) uchun realtime-server'dan ANIQ onlayn holatni so'raydi (ack orqali) —
  // presence:update hodisasini kutib o'tirmasdan darhol to'g'ri ko'rsatish uchun
  // (masalan sahifa yangi ochilganda yoki yangi suhbat qo'shilganda).
  const queryPresenceForKnownUsers = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    const ids = new Set();
    conversationsRef.current.forEach((c) => {
      if (c.otherUser?.id) ids.add(String(c.otherUser.id));
    });
    const activeOtherId = activeConversationRef.current?.otherUser?.id;
    if (activeOtherId) ids.add(String(activeOtherId));
    if (ids.size === 0) return;
    socket.emit('presence:query', Array.from(ids), (result) => {
      if (result && typeof result === 'object') {
        setLivePresence((prev) => ({ ...prev, ...result }));
      }
    });
  }, []);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const socket = socketRef.current;
    const convo = activeConversationRef.current;
    if (!socket || !socket.connected || !convo?.otherUser?.id) return;
    const key = convo.id;
    const now = Date.now();
    if (lastTypingEmitRef.current[key] && now - lastTypingEmitRef.current[key] < 2000) return;
    lastTypingEmitRef.current[key] = now;
    socket.emit('typing', { recipientId: convo.otherUser.id, conversationId: convo.id, kind });
  }, []);

  // Realtime: mavjud bo'lsa socket orqali jonli push, aks holda (yoki uzilganda)
  // ochiq suhbatni har 5s'da qayta so'raymiz — chat hech qachon socket'ga qattiq
  // bog'liq bo'lmasligi kerak (docs/ chat plani §2).
  //
  // AUTH_MIGRATION_MAP.md — realtime-server/ alohida (cross-origin) xizmat
  // bo'lgani va Next.js'ning httpOnly cookie'siga ega bo'lmagani uchun socket
  // ulanishi HAQIQIY tokenga muhtoj. Uni endi har ulanishda cookie orqali
  // autentifikatsiya qilingan `/api/chat/socket-ticket`dan olamiz — 60
  // soniyalik umr bilan, hech qachon localStorage'ga yozilmaydi (faqat shu
  // effekt closure'ida, xotirada).
  useEffect(() => {
    let cancelled = false;
    let socket = null;

    fetch('/api/chat/socket-ticket', { method: 'POST' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(({ ticket }) => {
        if (cancelled) return;
        socket = connectChatSocket(ticket);
        socketRef.current = socket;
        if (!socket) return;
        attachSocketHandlers(socket);
      })
      .catch(() => {
        // Chipta olinmadi (masalan tarmoq xatosi) — chat REST orqali
        // ishlayveradi (docs/ chat plani §2, "socket butunlay o'chib qolsa ham").
      });

    // Socket hodisa handlerlari alohida funksiyaga chiqarildi — chipta
    // so'ralib bo'lingandan keyin, yuqoridagi .then() ichida chaqiriladi.
    function attachSocketHandlers(socket) {
      socket.on('connect', () => {
        setSocketConnected(true);
        queryPresenceForKnownUsers();
      });
      socket.on('disconnect', () => setSocketConnected(false));
      socket.on('message:new', ({ conversationId, message }) => {
        if (String(conversationId) === String(activeIdRef.current)) {
          appendMessage(message);
          // Suhbat hozir ochiq turibdi — kelgan zahoti "o'qildi" deb belgilaymiz
          // (Telegram uslubi: chat ochiq bo'lsa yangi xabar darhol o'qilgan hisoblanadi),
          // LEKIN faqat tab/oyna haqiqatan ham ko'rinib turgan bo'lsa (foydalanuvchi
          // boshqa tabda yoki oynani kichraytirgan bo'lsa, xabar tab qayta fokusga
          // qaytmaguncha "o'qilmagan" holida qoladi — pastdagi visibilitychange
          // effekti o'sha paytda orqada qolganini tutib oladi, avvalgi xato manbai:
          // yashirin tabda ham xabar darhol "o'qilgan" deb ko'rsatilardi).
          if (!document.hidden) markRead(conversationId);
        }
        loadConversations();
      });
      // Men yuborgan xabar(lar) boshqa tomonda o'qilganda kelib, bitta ptichkani
      // ikkitaga aylantiradi — faqat hozir ochiq suhbatga tegishli bo'lsa.
      socket.on('message:read', ({ conversationId, readAt } = {}) => {
        if (!conversationId || String(conversationId) !== String(activeIdRef.current)) return;
        // Faqat MEN yuborgan (hali readAt'siz) xabarlarni belgilaydi — boshqa
        // tomonning o'zi yuborgan xabarlariga tegmaydi (ular UI'da tick ko'rsatmaydi,
        // lekin noto'g'ri lokal holat qoldirmaslik uchun aniq cheklaymiz).
        setMessages((prev) =>
          prev.map((m) =>
            m.readAt || String(m.senderId) !== String(myIdRef.current) ? m : { ...m, readAt }
          )
        );
      });
      socket.on('presence:update', ({ userId, online }) => {
        setLivePresence((prev) => ({ ...prev, [String(userId)]: online }));
      });
      // Boshqa tomon yozayotganini (yoki ovozli/video xabar yozib turganini)
      // bildiradi — 3s ichida yana kelmasa "yozmoqda..." o'zi tozalanadi (aniq
      // "to'xtatdi" hodisasi yo'q, bu soddaroq va uzilishlarga chidamli). Uzun
      // yozuvlarda (voice/video) jo'natuvchi shu 3s oynasidan tez-tez (2s'da bir)
      // qayta yuboradi, shuning uchun butun yozuv davomida ko'rinib turadi.
      socket.on('typing', ({ conversationId, kind } = {}) => {
        if (!conversationId) return;
        clearTimeout(typingTimersRef.current[conversationId]);
        setTypingByConversation((prev) => ({ ...prev, [conversationId]: kind || 'text' }));
        typingTimersRef.current[conversationId] = setTimeout(() => {
          setTypingByConversation((prev) => {
            if (!prev[conversationId]) return prev;
            const next = { ...prev };
            delete next[conversationId];
            return next;
          });
        }, 3000);
      });
    }

    return () => {
      cancelled = true;
      socket?.disconnect();
      Object.values(typingTimersRef.current).forEach(clearTimeout);
      typingTimersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (activeConversation && !socketConnected) {
      pollRef.current = setInterval(async () => {
        // `noRead: true` — bu shunchaki fon rejimidagi qayta tekshirish, tab
        // yashirin bo'lsa ham ishlaydi (setInterval brauzerda davom etaveradi),
        // shuning uchun server tarafda avtomatik "o'qildi" belgilanmaydi. Tab
        // haqiqatan ham ko'rinib turgan bo'lsagina alohida (yengil) /read
        // so'rovi bilan o'qilgan deb belgilaymiz.
        await loadMessages(activeConversation.id, { silent: true, noRead: true });
        if (!document.hidden) markRead(activeConversation.id);
      }, 5000);
    }
    return () => clearInterval(pollRef.current);
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
    editMessage,
    deleteMessage,
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
    setNickname,
    deleteConversation,
    livePresence,
    typingByConversation,
    sendTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
