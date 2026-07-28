'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Loader2, Paperclip, X, PanelLeftOpen, Send } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ChatSessionsPanel from './chat/ChatSessionsPanel';
import ChatMessage from './chat/ChatMessage';

const PENDING_MARK_START = '\n[[PENDING_ADD_WORDS]]';
const PENDING_MARK_END = '[[/PENDING_ADD_WORDS]]';

function extractPendingAction(fullText) {
  const startIdx = fullText.indexOf(PENDING_MARK_START);
  if (startIdx === -1) return { visibleText: fullText, pendingAction: null };
  const endIdx = fullText.indexOf(PENDING_MARK_END, startIdx);
  if (endIdx === -1) return { visibleText: fullText.slice(0, startIdx), pendingAction: null };
  const jsonStr = fullText.slice(startIdx + PENDING_MARK_START.length, endIdx);
  try {
    const pendingAction = JSON.parse(jsonStr);
    return { visibleText: fullText.slice(0, startIdx).trim(), pendingAction };
  } catch {
    return { visibleText: fullText.slice(0, startIdx), pendingAction: null };
  }
}

export default function AiChat() {
  const { token, categories, refreshCategories } = useApp();

  const [panelOpen, setPanelOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);

  const chatEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const fileInputRef = useRef(null);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/sessions', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setSessions(data.sessions || []);
    } catch {
      // jimgina e'tiborsiz qoldiramiz — sessiyalar paneli bo'sh ko'rinadi
    }
  }, [token]);

  useEffect(() => {
    if (token) loadSessions();
  }, [token, loadSessions]);

  const scrollToBottom = () => {
    if (stickToBottomRef.current && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(scrollToBottom, [messages]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 80;
  };

  const openSession = async (id) => {
    setPanelOpen(false);
    setSessionLoading(true);
    try {
      const res = await fetch(`/api/ai/sessions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setCurrentSessionId(id);
        setMessages(data.session.messages || []);
      }
    } catch {
      // suhbatni ochib bo'lmadi
    } finally {
      setSessionLoading(false);
    }
  };

  const startNewSession = () => {
    setPanelOpen(false);
    setCurrentSessionId(null);
    setMessages([]);
  };

  const renameSession = async (id, title) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
    try {
      await fetch(`/api/ai/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      });
    } catch {
      loadSessions();
    }
  };

  const deleteSession = async (id) => {
    if (!confirm("Bu suhbatni o'chirmoqchimisiz?")) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
    }
    try {
      await fetch(`/api/ai/sessions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      loadSessions();
    }
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  const attachImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await readFileAsDataUrl(file);
    setAttachedImage(dataUrl);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) attachImageFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) attachImageFile(file);
  };

  const handlePaste = (e) => {
    const item = Array.from(e.clipboardData?.items || []).find((it) => it.type.startsWith('image/'));
    if (item) {
      const file = item.getAsFile();
      if (file) attachImageFile(file);
    }
  };

  const handleEditMessage = (text) => {
    setChatInput(text);
  };

  const handleResolvedAdd = (messageIndex, data) => {
    setMessages((prev) => {
      const updated = prev.map((m, i) => (i === messageIndex ? { ...m, pendingAction: null } : m));
      updated.push({ role: 'model', parts: [{ text: data.message }] });
      return updated;
    });
    refreshCategories();
  };

  const handleSend = async () => {
    const text = chatInput.trim();
    if ((!text && !attachedImage) || chatLoading) return;

    const userMsg = { role: 'user', parts: [{ text: text || '(rasm yuborildi)' }], imageUrl: attachedImage || null };
    const modelPlaceholder = { role: 'model', parts: [{ text: '' }], _streaming: true };

    setMessages((prev) => [...prev, userMsg, modelPlaceholder]);
    setChatInput('');
    const imageToSend = attachedImage;
    setAttachedImage(null);
    setChatLoading(true);
    stickToBottomRef.current = true;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId: currentSessionId, message: text, imageBase64: imageToSend }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Xatolik yuz berdi');
      }

      const newSessionId = res.headers.get('X-Session-Id');
      if (newSessionId && newSessionId !== currentSessionId) {
        setCurrentSessionId(newSessionId);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        const { visibleText } = extractPendingAction(fullText);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], parts: [{ text: visibleText }] };
          return updated;
        });
      }

      const { visibleText, pendingAction } = extractPendingAction(fullText);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'model',
          parts: [{ text: visibleText }],
          pendingAction: pendingAction || null,
        };
        return updated;
      });

      loadSessions();
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'model', parts: [{ text: `⚠️ Xatolik: ${err.message}` }] };
        return updated;
      });
    } finally {
      setChatLoading(false);
    }
  };

  const isEmpty = messages.length === 0 && !sessionLoading;
  const lastMsg = messages[messages.length - 1];
  const isTyping = chatLoading && lastMsg?.role === 'model' && !lastMsg.parts[0].text;

  return (
    <div className="relative flex h-[calc(100vh-11rem)] sm:h-[calc(100vh-13rem)] lg:h-[calc(100vh-14rem)] bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <ChatSessionsPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={openSession}
        onNewSession={startNewSession}
        onRenameSession={renameSession}
        onDeleteSession={deleteSession}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="p-1.5 -ml-1 hover:bg-white/60 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
            title="Suhbatlar tarixi"
          >
            <PanelLeftOpen size={16} className={`transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
          </button>
          <span className="font-semibold text-indigo-600 flex items-center gap-1.5">
            <Sparkles size={14} /> Ingliz tili AI yordamchisi
          </span>
          <span className="hidden sm:inline ml-auto">Til, tarjima va lug'atga so'z qo'shish</span>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4"
        >
          {isEmpty && (
            <div className="text-center py-12 text-slate-400">
              <Sparkles className="mx-auto mb-3 text-indigo-400" size={32} />
              <p className="text-sm">Assalomu alaykum! Ingliz tili yoki tarjima bo'yicha savolingiz bormi?</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Masalan: "arise" so'zini bir nechta gapda ishlatib ko'rsat, yoki rasm yuboring
              </p>
            </div>
          )}
          {sessionLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-indigo-400" size={20} />
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              msg={msg}
              index={i}
              categories={categories}
              sessionId={currentSessionId}
              onResolvedAdd={handleResolvedAdd}
              onEdit={msg.role === 'user' ? handleEditMessage : null}
            />
          ))}
          {isTyping && (
            <div className="flex justify-start gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Sparkles size={13} />
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 text-sm text-slate-400 flex items-center gap-1.5">
                <Loader2 className="animate-spin" size={13} /> javob yozmoqda...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 sm:p-4 border-t border-slate-100">
          {attachedImage && (
            <div className="relative inline-block mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachedImage} alt="Yuklanadigan rasm" className="h-16 rounded-lg border border-slate-200" />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white rounded-full p-0.5"
              >
                <X size={11} />
              </button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileInputChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex-shrink-0"
              title="Rasm biriktirish"
            >
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              placeholder="Xabaringizni yozing yoki rasm joylashtiring (Ctrl+V)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 min-w-0 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={chatLoading || (!chatInput.trim() && !attachedImage)}
              className="px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
