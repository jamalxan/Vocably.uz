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
  const [attachedImage, setAttachedImage] = useState(null);

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
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
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
    <div className="relative flex h-[calc(100vh-11rem)] sm:h-[calc(100vh-13rem)] lg:h-[calc(100vh-14rem)] bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-indigo-600 flex items-center gap-1.5">
            <Sparkles size={14} /> Ingliz tili AI yordamchisi
          </span>
          <span className="hidden sm:inline">Til, tarjima va lug'atga so'z qo'shish</span>
          {voiceSupported && (
            <button
              onClick={() => setTtsEnabled((v) => !v)}
              className="ml-auto p-1.5 hover:bg-white/60 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors flex-shrink-0"
              title={ttsEnabled ? 'AI ovozini o\'chirish' : 'AI ovozini yoqish'}
            >
              {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          )}
        </div>

        <div className="flex gap-1.5 px-3 sm:px-4 py-2 border-b border-slate-100 overflow-x-auto flex-shrink-0">
          {ASSISTANT_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => handleSend(m.text)}
              disabled={chatLoading}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 border border-slate-100 transition-colors whitespace-nowrap disabled:opacity-40"
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
          {voiceSupported ? (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <button
                onClick={toggleLiveMode}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
                  liveMode
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                }`}
                title="Uzluksiz ovozli suhbat"
              >
                <span className="relative flex h-2 w-2">
                  {liveMode && (liveListening || speaking) && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${liveMode ? 'bg-red-500' : 'bg-slate-300'}`} />
                </span>
                <Radio size={12} /> Live rejim
              </button>

              {liveMode && (
                <span className="text-[10px] text-slate-400">
                  {speaking ? 'AI gapirmoqda...' : liveListening ? 'Tinglanmoqda...' : 'Kutilmoqda...'}
                </span>
              )}

              <div className="flex items-center gap-1 ml-auto text-[10px] text-slate-400">
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
            <p className="text-[10px] text-slate-400 mb-2">
              Brauzeringiz ovozli kiritish/chiqishni to'liq qo'llab-quvvatlamaydi — matn rejimida davom eting.
            </p>
          )}
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
          <form onSubmit={handleFormSubmit} className="flex gap-2 items-end">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileInputChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex-shrink-0"
              title="Rasm biriktirish"
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
                      ? 'text-red-500 bg-red-50 animate-pulse'
                      : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
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
                    className="absolute -top-1 -right-1 px-1 py-px rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold leading-tight shadow"
                    title="Mikrofon tili"
                  >
                    {activeLang.label}
                  </button>
                )}

                {langMenuOpen && (
                  <div className="absolute bottom-full mb-2 left-0 z-30 w-40 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    <p className="px-3 py-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                      Mikrofon tili
                    </p>
                    {RECOGNITION_LANGS.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => changeRecognitionLang(l.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                          recognitionLang === l.code
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-6 font-bold">{l.label}</span>
                        <span className="text-[11px] text-slate-400">{l.name}</span>
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
              className="flex-1 min-w-0 px-4 py-2.5 border border-slate-200 rounded-xl text-sm leading-5 outline-none focus:border-indigo-500 resize-none"
            />
            <button
              type="submit"
              disabled={chatLoading || (!chatInput.trim() && !attachedImage)}
              className="px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
