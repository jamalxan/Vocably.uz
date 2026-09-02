'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { connectChatSocket } from '@/lib/socketClient';
import { getJwtUserId } from '@/lib/jwtClient';

const ChatContext = createContext(null);

// Do'stlar bo'limiga xos holat — global AppContext'ga qo'shilmaydi, chunki bu
// hidden/gated funksiya: faqat chatAccess bo'lgan userlarda, va faqat "Do'stlar"
// bo'limi ochilganda mount qilinadi (docs/ chat plani).
export function ChatProvider({ token, children }) {
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null); // { id, otherUser }
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
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
  myIdRef.current = getJwtUserId(token);
  const typingTimersRef = useRef({});
  const lastTypingEmitRef = useRef({});

  const authHeaders = useCallback(
    (extra = {}) => ({ Authorization: `Bearer ${token}`, ...extra }),
    [token]
  );

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setConversations(data.conversations || []);
    } catch {
      // jimgina — ro'yxat bo'sh ko'rinadi
    } finally {
      setLoadingConversations(false);
    }
  }, [authHeaders]);

  // `silent` — fon rejimidagi qayta yuklash (masalan pastdagi 5s poll, socket
  // ulanmaganda) uchun: spinner ko'rsatmaydi, aks holda suhbat ochiq turganda ham
  // har 5 soniyada butun ro'yxat bir lahzaga yo'qolib, "sahifa qayta yuklanyapti"
  // taassurotini berardi (avvalgi xato manbai).
  const loadMessages = useCallback(
    async (conversationId, { silent = false } = {}) => {
      if (!silent) setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (res.ok) setMessages(data.messages || []);
      } catch {
        // jimgina
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [authHeaders]
  );

  const loadOlderMessages = useCallback(async () => {
    if (!activeConversation || messages.length === 0) return;
    try {
      const before = messages[0].createdAt;
      const res = await fetch(
        `/api/chat/conversations/${activeConversation.id}/messages?before=${encodeURIComponent(before)}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (res.ok && data.messages?.length) {
        setMessages((prev) => [...data.messages, ...prev]);
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
      if (cached) {
        setMessages(cached);
        loadMessages(conversationId, { silent: true });
      } else {
        loadMessages(conversationId);
      }
    },
    [loadMessages]
  );

  const openConversationByUsername = useCallback(
    async (username) => {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Xatolik yuz berdi' };

      setActiveConversation(data.conversation);
      loadMessagesWithCache(data.conversation.id);
      loadConversations();
      return { conversation: data.conversation };
    },
    [authHeaders, loadMessagesWithCache, loadConversations]
  );

  const selectConversation = useCallback(
    (conv) => {
      setActiveConversation(conv);
      setEditingMessage(null);
      setReplyingTo(null);
      loadMessagesWithCache(conv.id);
    },
    [loadMessagesWithCache]
  );

  const closeConversation = useCallback(() => {
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
      try {
        const res = await fetch(`/api/chat/conversations/${activeConversation.id}/messages`, {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(replyId ? { ...payload, replyTo: replyId } : payload),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error || "Xabar yuborilmadi" };
        appendMessage(data.message);
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
      const res = await fetch(`/api/chat/search?username=${encodeURIComponent(q)}`, { headers: authHeaders() });
      const data = await res.json();
      return res.ok ? data.result : null;
    },
    [authHeaders]
  );

  const reportTarget = useCallback(
    async (targetType, targetId, reason) => {
      const res = await fetch('/api/chat/report', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ targetType, targetId, reason }),
      });
      return res.ok;
    },
    [authHeaders]
  );

  const blockUser = useCallback(
    async (userId) => {
      await fetch('/api/chat/block', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ userId }),
      });
      closeConversation();
      loadConversations();
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
  useEffect(() => {
    if (activeConversation) {
      messagesCacheRef.current.set(String(activeConversation.id), messages);
    }
  }, [messages, activeConversation]);

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
  useEffect(() => {
    const socket = connectChatSocket(token);
    socketRef.current = socket;
    if (!socket) return undefined;

    socket.on('connect', () => {
      setSocketConnected(true);
      queryPresenceForKnownUsers();
    });
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('message:new', ({ conversationId, message }) => {
      if (String(conversationId) === String(activeIdRef.current)) {
        appendMessage(message);
        // Suhbat hozir ochiq turibdi — kelgan zahoti "o'qildi" deb belgilaymiz
        // (Telegram uslubi: chat ochiq bo'lsa yangi xabar darhol o'qilgan hisoblanadi).
        markRead(conversationId);
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

    return () => {
      socket.disconnect();
      Object.values(typingTimersRef.current).forEach(clearTimeout);
      typingTimersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (activeConversation && !socketConnected) {
      pollRef.current = setInterval(() => loadMessages(activeConversation.id, { silent: true }), 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeConversation, socketConnected, loadMessages]);

  const value = {
    conversations,
    loadingConversations,
    activeConversation,
    messages,
    loadingMessages,
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
