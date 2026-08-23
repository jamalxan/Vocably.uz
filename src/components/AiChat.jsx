'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Loader2, Paperclip, X, Send, Mic, Radio, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ChatMessage from './chat/ChatMessage';

// Bu til FAQAT mikrofon (SpeechRecognition) uchun — matn yozishga ta'sir qilmaydi,
// shuning uchun tanlagich faqat mikrofon yoki Live rejim yoqilganda ko'rsatiladi.
const RECOGNITION_LANGS = [
  { code: 'en-US', label: 'EN', name: 'Ingliz tili' },
  { code: 'uz-UZ', label: 'UZ', name: "O'zbek tili" },
  { code: 'ru-RU', label: 'RU', name: 'Rus tili' },
];
const DEFAULT_RECOGNITION_LANG = 'en-US';
const MAX_ATTACHED_IMAGES = 10;
const RECOGNITION_LANG_KEY = 'vocably.recognitionLang';
const SILENCE_MS = 1500;
// Textarea 1 qatordan boshlanadi va ~6 qatorgacha o'sadi, keyin ichida scroll paydo bo'ladi.
const MAX_TEXTAREA_HEIGHT = 142;

const ASSISTANT_MODES = [
  { key: 'writing', label: '✍️ Writing', text: 'Writing mashqini boshlaylik' },
  { key: 'reading', label: '📖 Reading', text: 'Reading mashqini boshlaylik' },
  { key: 'speaking', label: '🗣️ Speaking', text: 'Speaking mashqini boshlaylik' },
  { key: 'listening', label: '🎧 Listening', text: 'Listening mashqini boshlaylik' },
];

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
  // Suhbatlar ro'yxati sidebar'da — bu yerda faqat joriy suhbat xabarlari boshqariladi.
  const {
    token,
    categories,
    refreshCategories,
    currentSessionId,
    setCurrentSessionId,
    sessionOpenNonce,
    loadChatSessions,
  } = useApp();

  const [messages, setMessages] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [attachedImages, setAttachedImages] = useState([]);

  const [voiceSupported, setVoiceSupported] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState(DEFAULT_RECOGNITION_LANG);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [micListening, setMicListening] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [liveListening, setLiveListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsRate, setTtsRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  const chatEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const langMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const liveModeRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const handleSendRef = useRef(null);

  useEffect(() => {
    setVoiceSupported(typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition));
    const saved = localStorage.getItem(RECOGNITION_LANG_KEY);
    if (saved && RECOGNITION_LANGS.some((l) => l.code === saved)) setRecognitionLang(saved);
  }, []);

  // Til tanlagichi tashqariga bosilganda yopilsin.
  useEffect(() => {
    if (!langMenuOpen) return;
    const onDocClick = (e) => {
      if (!langMenuRef.current?.contains(e.target)) setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [langMenuOpen]);

  useEffect(() => {
    liveModeRef.current = liveMode;
  }, [liveMode]);

  // Matn o'zgarganda textarea balandligini moslaymiz; xabar yuborilib input tozalangach
  // balandlik o'z-o'zidan 1 qatorga qaytadi.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';

    // Dashboard barcha bo'limlarni bir vaqtda render qiladi va ko'rinmaydiganini `hidden`
    // (display:none) qilib qo'yadi. Bunday elementda scrollHeight = 0 bo'ladi — o'shanda
    // balandlikni hisoblamaymiz, aks holda textarea 0px bo'lib qolib matn kesilib ketadi.
    if (!el.scrollHeight) return;

    // box-sizing: border-box, scrollHeight esa ramkani hisobga olmaydi — qo'shib qo'yamiz.
    const border = el.offsetHeight - el.clientHeight;
    const needed = el.scrollHeight + border;
    el.style.height = `${Math.min(needed, MAX_TEXTAREA_HEIGHT)}px`;
    el.style.overflowY = needed > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  }, [chatInput]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    };
  }, []);

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

  // Sidebar'dan suhbat tanlanganda (yoki "Yangi suhbat" bosilganda) nonce oshadi va
  // shu suhbat xabarlari yuklanadi.
  useEffect(() => {
    if (sessionOpenNonce === 0) return;
    if (!currentSessionId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setSessionLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/ai/sessions/${currentSessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && res.ok) setMessages(data.session.messages || []);
      } catch {
        // suhbatni ochib bo'lmadi
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionOpenNonce]);

  const readFileAsDataUrl = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  // Bir nechta faylni qo'shadi, lekin umumiy soni MAX_ATTACHED_IMAGES dan oshmaydi.
  const attachImageFiles = async (files) => {
    const imageFiles = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const dataUrls = await Promise.all(imageFiles.map(readFileAsDataUrl));
    setAttachedImages((prev) => {
      const remaining = MAX_ATTACHED_IMAGES - prev.length;
      if (remaining <= 0) return prev;
      return [...prev, ...dataUrls.slice(0, remaining)];
    });
  };

  const removeAttachedImage = (idx) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFileInputChange = (e) => {
    attachImageFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    attachImageFiles(e.dataTransfer.files);
  };

  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData?.items || []).filter((it) => it.type.startsWith('image/'));
    const files = items.map((it) => it.getAsFile()).filter(Boolean);
    if (files.length > 0) attachImageFiles(files);
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

  const speak = useCallback(
    (text) =>
      new Promise((resolve) => {
        if (!ttsEnabled || !text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
          resolve();
          return;
        }
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        utter.rate = ttsRate;
        utter.onend = () => {
          setSpeaking(false);
          resolve();
        };
        utter.onerror = () => {
          setSpeaking(false);
          resolve();
        };
        setSpeaking(true);
        window.speechSynthesis.speak(utter);
      }),
    [ttsEnabled, ttsRate]
  );

  const startLiveListening = useCallback(() => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR || !liveModeRef.current) return;

    const recognition = new SR();
    recognition.lang = recognitionLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalText = '';

    recognition.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        const text = finalText.trim();
        finalText = '';
        recognition.stop();
        if (text) handleSendRef.current?.(text);
      }, SILENCE_MS);
    };
    recognition.onerror = () => setLiveListening(false);
    recognition.onend = () => setLiveListening(false);

    recognitionRef.current = recognition;
    setLiveListening(true);
    recognition.start();
  }, [recognitionLang]);

  const stopLiveMode = () => {
    liveModeRef.current = false;
    setLiveMode(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    setLiveListening(false);
    setSpeaking(false);
  };

  const toggleLiveMode = () => {
    if (liveMode) {
      stopLiveMode();
    } else {
      setLiveMode(true);
      liveModeRef.current = true;
      startLiveListening();
    }
  };

  const activeLang =
    RECOGNITION_LANGS.find((l) => l.code === recognitionLang) || RECOGNITION_LANGS[0];

  // Tanlangan til localStorage'da saqlanadi, keyingi safar eslab qolinadi.
  const changeRecognitionLang = (code) => {
    setRecognitionLang(code);
    localStorage.setItem(RECOGNITION_LANG_KEY, code);
    setLangMenuOpen(false);
    // Tinglash davom etayotgan bo'lsa to'xtatamiz — yangi til keyingi ishga tushishda qo'llanadi.
    if (micListening || liveListening) recognitionRef.current?.stop();
  };

  const toggleMic = () => {
    if (micListening) {
      recognitionRef.current?.stop();
      return;
    }
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = recognitionLang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setChatInput(text);
    };
    recognition.onend = () => setMicListening(false);
    recognition.onerror = () => setMicListening(false);
    recognitionRef.current = recognition;
    setMicListening(true);
    recognition.start();
  };

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? chatInput).trim();
    if ((!text && attachedImages.length === 0) || chatLoading) return;

    const userMsg = {
      role: 'user',
      parts: [{ text: text || '(rasm yuborildi)' }],
      imageUrls: attachedImages,
    };
    const modelPlaceholder = { role: 'model', parts: [{ text: '' }], _streaming: true };

    setMessages((prev) => [...prev, userMsg, modelPlaceholder]);
    setChatInput('');
    const imagesToSend = attachedImages;
    setAttachedImages([]);
    setChatLoading(true);
    stickToBottomRef.current = true;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId: currentSessionId, message: text, imagesBase64: imagesToSend }),
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

      // AI shu javob davomida yangi kategoriya yaratgan bo'lishi mumkin (create_category darhol
      // saqlanadi) — tasdiqlash kartasi ko'rsatilishidan oldin kategoriyalar ro'yxatini yangilab
      // olamiz, aks holda yangi kategoriya hali eskirgan ro'yxatda yo'q bo'lib, tanlab bo'lmay qoladi.
      if (pendingAction) await refreshCategories();

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'model',
          parts: [{ text: visibleText }],
          pendingAction: pendingAction || null,
        };
        return updated;
      });

      // Sidebar'dagi ro'yxat yangilansin (sarlavha/tartib o'zgargan bo'lishi mumkin).
      loadChatSessions();

      if (liveModeRef.current) {
        await speak(visibleText);
        if (liveModeRef.current) startLiveListening();
      }
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

  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  // Enter — yuborish, Shift+Enter — yangi qator.
  // IME (koreys/xitoy/yapon klaviaturasi) kompozitsiyasi paytida Enter xabarni yubormasligi kerak.
  const handleTextareaKeyDown = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    handleSend();
  };

  const isEmpty = messages.length === 0 && !sessionLoading;
  const lastMsg = messages[messages.length - 1];
  const isTyping = chatLoading && lastMsg?.role === 'model' && !lastMsg.parts[0].text;

  return (
    <div className="relative flex h-[calc(100vh-11rem)] sm:h-[calc(100vh-13rem)] lg:h-[calc(100vh-14rem)] bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-3 sm:p-4 bg-gradient-to-r from-accent-soft to-bg border-b border-border flex items-center gap-2 text-xs text-muted">
          <span className="font-semibold text-accent flex items-center gap-1.5">
            <Sparkles size={14} /> Ingliz tili AI yordamchisi
          </span>
          <span className="hidden sm:inline">Til, tarjima va lug'atga so'z qo'shish</span>
          {voiceSupported && (
            <button
              onClick={() => setTtsEnabled((v) => !v)}
              className="ml-auto p-1.5 hover:bg-surface/60 rounded-lg text-muted hover:text-accent transition-colors flex-shrink-0"
              title={ttsEnabled ? 'AI ovozini o\'chirish' : 'AI ovozini yoqish'}
            >
              {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          )}
        </div>

        <div className="flex gap-1.5 px-3 sm:px-4 py-2 border-b border-border overflow-x-auto flex-shrink-0">
          {ASSISTANT_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => handleSend(m.text)}
              disabled={chatLoading}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-bg hover:bg-accent-soft hover:text-accent text-muted border border-border transition-colors whitespace-nowrap disabled:opacity-40"
            >
              {m.label}
            </button>
          ))}
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4"
        >
          {isEmpty && (
            <div className="text-center py-12 text-muted">
              <Sparkles className="mx-auto mb-3 text-accent" size={32} />
              <p className="text-sm">Assalomu alaykum! Ingliz tili yoki tarjima bo'yicha savolingiz bormi?</p>
              <p className="text-[10px] text-muted mt-1">
                Masalan: "arise" so'zini bir nechta gapda ishlatib ko'rsat, yoki rasm yuboring
              </p>
            </div>
          )}
          {sessionLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-accent" size={20} />
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
              <div className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
                <Sparkles size={13} />
              </div>
              <div className="bg-bg border border-border rounded-2xl rounded-bl-none px-4 py-2.5 text-sm text-muted flex items-center gap-1.5">
                <Loader2 className="animate-spin" size={13} /> javob yozmoqda...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 sm:p-4 border-t border-border">
          {voiceSupported ? (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <button
                onClick={toggleLiveMode}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
                  liveMode
                    ? 'bg-accent-soft border-accent/25 text-accent'
                    : 'bg-surface border-border text-muted hover:border-accent/30'
                }`}
                title="Uzluksiz ovozli suhbat"
              >
                <span className="relative flex h-2 w-2">
                  {liveMode && (liveListening || speaking) && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${liveMode ? 'bg-accent-soft0' : 'bg-muted/40'}`} />
                </span>
                <Radio size={12} /> Live rejim
              </button>

              {liveMode && (
                <span className="text-[10px] text-muted">
                  {speaking ? 'AI gapirmoqda...' : liveListening ? 'Tinglanmoqda...' : 'Kutilmoqda...'}
                </span>
              )}

              <div className="flex items-center gap-1 ml-auto text-[10px] text-muted">
                <span>Tezlik</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={ttsRate}
                  onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                  className="w-16 accent-indigo-500"
                />
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-muted mb-2">
              Brauzeringiz ovozli kiritish/chiqishni to'liq qo'llab-quvvatlamaydi — matn rejimida davom eting.
            </p>
          )}
          {attachedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachedImages.map((img, i) => (
                <div key={i} className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="Yuklanadigan rasm" className="h-16 rounded-lg border border-border" />
                  <button
                    onClick={() => removeAttachedImage(i)}
                    className="absolute -top-1.5 -right-1.5 bg-primary-hover text-white rounded-full p-0.5"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              <span className="self-center text-[10px] text-muted">
                {attachedImages.length}/{MAX_ATTACHED_IMAGES}
              </span>
            </div>
          )}
          <form onSubmit={handleFormSubmit} className="flex gap-2 items-end">
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileInputChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachedImages.length >= MAX_ATTACHED_IMAGES}
              className="p-2.5 text-muted hover:text-accent hover:bg-accent-soft rounded-xl transition-colors flex-shrink-0 disabled:opacity-30"
              title={`Rasm biriktirish (${attachedImages.length}/${MAX_ATTACHED_IMAGES})`}
            >
              <Paperclip size={18} />
            </button>
            {voiceSupported && (
              <div ref={langMenuRef} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={liveMode}
                  className={`p-2.5 rounded-xl transition-colors disabled:opacity-30 ${
                    micListening
                      ? 'text-accent bg-accent-soft animate-pulse'
                      : 'text-muted hover:text-accent hover:bg-accent-soft'
                  }`}
                  title="Ovozli kiritish"
                >
                  <Mic size={18} />
                </button>

                {/* Nutq tili faqat mikrofon yoki Live rejim yoqilganda ko'rinadi */}
                {(micListening || liveMode) && (
                  <button
                    type="button"
                    onClick={() => setLangMenuOpen((v) => !v)}
                    className="absolute -top-1 -right-1 px-1 py-px rounded bg-accent hover:bg-accent-hover text-white text-[9px] font-bold leading-tight shadow"
                    title="Mikrofon tili"
                  >
                    {activeLang.label}
                  </button>
                )}

                {langMenuOpen && (
                  <div className="absolute bottom-full mb-2 left-0 z-30 w-40 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                    <p className="px-3 py-1.5 text-[9px] font-semibold text-muted uppercase tracking-wider bg-bg">
                      Mikrofon tili
                    </p>
                    {RECOGNITION_LANGS.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => changeRecognitionLang(l.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                          recognitionLang === l.code
                            ? 'bg-accent-soft text-accent font-semibold'
                            : 'text-muted hover:bg-bg'
                        }`}
                      >
                        <span className="w-6 font-bold">{l.label}</span>
                        <span className="text-[11px] text-muted">{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Xabaringizni yozing... (Shift+Enter — yangi qator)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={handleTextareaKeyDown}
              className="flex-1 min-w-0 px-4 py-2.5 border border-border rounded-xl text-sm leading-5 outline-none focus:border-accent resize-none"
            />
            <button
              type="submit"
              disabled={chatLoading || (!chatInput.trim() && attachedImages.length === 0)}
              className="px-4 sm:px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
