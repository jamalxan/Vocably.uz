'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { connectChatSocket } from '@/lib/socketClient';

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

  const socketRef = useRef(null);
  const pollRef = useRef(null);
  const activeIdRef = useRef(null);
  activeIdRef.current = activeConversation?.id || null;

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

  const loadMessages = useCallback(
    async (conversationId) => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (res.ok) setMessages(data.messages || []);
      } catch {
        // jimgina
      } finally {
        setLoadingMessages(false);
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
      await loadMessages(data.conversation.id);
      loadConversations();
      return { conversation: data.conversation };
    },
    [authHeaders, loadMessages, loadConversations]
  );

  const selectConversation = useCallback(
    (conv) => {
      setActiveConversation(conv);
      setEditingMessage(null);
      loadMessages(conv.id);
    },
    [loadMessages]
  );

  const closeConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
    setEditingMessage(null);
  }, []);

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => (prev.some((m) => String(m.id || m._id) === String(msg.id || msg._id)) ? prev : [...prev, msg]));
  }, []);

  const sendMessage = useCallback(
    async (payload) => {
      if (!activeConversation) return { error: 'Suhbat tanlanmagan' };
      try {
        const res = await fetch(`/api/chat/conversations/${activeConversation.id}/messages`, {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error || "Xabar yuborilmadi" };
        appendMessage(data.message);
        loadConversations();
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
  }, []);
  const cancelEditMessage = useCallback(() => setEditingMessage(null), []);

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
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { error: data.error || "O'chirilmadi" };
        }
        if (forEveryone) {
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
    async (file, type) => {
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

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime: mavjud bo'lsa socket orqali jonli push, aks holda (yoki uzilganda)
  // ochiq suhbatni har 5s'da qayta so'raymiz — chat hech qachon socket'ga qattiq
  // bog'liq bo'lmasligi kerak (docs/ chat plani §2).
  useEffect(() => {
    const socket = connectChatSocket(token);
    socketRef.current = socket;
    if (!socket) return undefined;

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('message:new', ({ conversationId, message }) => {
      if (String(conversationId) === String(activeIdRef.current)) appendMessage(message);
      loadConversations();
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (activeConversation && !socketConnected) {
      pollRef.current = setInterval(() => loadMessages(activeConversation.id), 5000);
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
    uploadAndSend,
    loadOlderMessages,
    searchUsername,
    reportTarget,
    blockUser,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
