'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, Paperclip, X, Send, Mic } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ChatMessage from './chat/ChatMessage';

// Bu til FAQAT mikrofon (SpeechRecognition, ovozli kiritish) uchun — matn yozishga ta'sir
// qilmaydi, tanlagich faqat mikrofon yoqilganda ko'rinadi.
const RECOGNITION_LANGS = [
  { code: 'en-US', label: 'EN', name: 'Ingliz tili' },
  { code: 'uz-UZ', label: 'UZ', name: "O'zbek tili" },
  { code: 'ru-RU', label: 'RU', name: 'Rus tili' },
];
const DEFAULT_RECOGNITION_LANG = 'en-US';
const MAX_ATTACHED_IMAGES = 10;
// VOCABLY-TZ.md §12.2 — "Tez amallar (chat ostida chip'lar)". Bo'sh holatda
// ko'rsatiladi, bosilsa handleSend(overrideText) orqali darhol yuboriladi.
const QUICK_ACTIONS = [
  "Bu so'zni tushuntir",
  'Misol jumla ber',
  "Mnemonika o'ylab top",
  'Test tuz',
];
const RECOGNITION_LANG_KEY = 'vocably.recognitionLang';
// Textarea 1 qatordan boshlanadi va ~6 qatorgacha o'sadi, keyin ichida scroll paydo bo'ladi.
const MAX_TEXTAREA_HEIGHT = 142;

const PENDING_MARK_START = '\n[[PENDING_ADD_WORDS]]';
const PENDING_MARK_END = '[[/PENDING_ADD_WORDS]]';

// SpeechRecognition xatolari getUserMedia'dan farqli ismlar ishlatadi (masalan
// "not-allowed", DOMException.name emas) — shuning uchun lib/mediaError.js dagi
// mapping bu yerga to'g'ri kelmaydi, alohida xabar kerak.
function recognitionErrorMessage(errorCode) {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return (
        'Mikrofonga ruxsat berilmagan. Manzil satridagi qulf (🔒) belgisini bosib, ' +
        'saytga mikrofon ruxsatini "Ruxsat berish"ga o\'zgartiring, so\'ng sahifani yangilang. ' +
        'Agar u yerda ruxsat berilgan ko\'rinsa — bu operatsion tizim darajasidagi cheklov bo\'lishi mumkin ' +
        '(Windows: Sozlamalar → Maxfiylik va xavfsizlik → Mikrofon → "Ilovalarga ruxsat berish" yoqilganini tekshiring).'
      );
    case 'audio-capture':
      return 'Mikrofon topilmadi. Qurilmangizda mikrofon ulanganligini tekshiring.';
    case 'no-speech':
      return "Ovoz eshitilmadi — qayta urinib ko'ring.";
    case 'network':
      return "Internet aloqasida muammo — ovozli kiritish xizmatiga ulanib bo'lmadi.";
    default:
      return "Ovozli kiritishni ishga tushirib bo'lmadi.";
  }
}

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

// `contextHint` — VOCABLY-TZ.md §12.1: qaysi sahifadan ochilgani haqida qisqa,
// tabiiy tildagi jumla (masalan "Reading (Oqish) bo'limida"). AiPanel.jsx
// (global sirg'aluvchi panel) usePathname() orqali hisoblab beradi; /app/ai
// to'liq sahifasi bu propni bermaydi (umumiy, kontekstsiz suhbat).
export default function AiChat({ contextHint } = {}) {
  // Suhbatlar ro'yxati alohida panelda (AiChatSessionsPanel) — bu yerda faqat joriy
  // suhbat xabarlari boshqariladi.
  const {
    token,
    displayName,
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
  const [micError, setMicError] = useState('');

  const chatEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const langMenuRef = useRef(null);
  const recognitionRef = useRef(null);

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
    return () => recognitionRef.current?.stop();
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

  const activeLang = RECOGNITION_LANGS.find((l) => l.code === recognitionLang) || RECOGNITION_LANGS[0];

  // Tanlangan til localStorage'da saqlanadi, keyingi safar eslab qolinadi.
  const changeRecognitionLang = (code) => {
    setRecognitionLang(code);
    localStorage.setItem(RECOGNITION_LANG_KEY, code);
    setLangMenuOpen(false);
    if (micListening) recognitionRef.current?.stop();
  };

  // Ovozli kiritish: gapirilgan matn to'g'ridan-to'g'ri xabar maydoniga yoziladi —
  // foydalanuvchi ko'rib, kerak bo'lsa tahrirlab, keyin oddiy tugma bilan yuboradi.
  const toggleMic = () => {
    if (micListening) {
      recognitionRef.current?.stop();
      return;
    }
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;

    setMicError('');
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
    recognition.onerror = (e) => {
      // "aborted" — foydalanuvchi tugmani bosib o'zi to'xtatganda chiqadi, xato emas.
      if (e.error !== 'aborted') setMicError(recognitionErrorMessage(e.error));
      setMicListening(false);
    };
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
        body: JSON.stringify({ sessionId: currentSessionId, message: text, imagesBase64: imagesToSend, context: contextHint }),
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
  // Hali matni kelmagan model-placeholder (streaming boshlanishida qo'shiladi, handleSend)
  // pastdagi maxsus "javob yozmoqda..." pufakchasi bilan bir vaqtda ko'rsatilmasin — aks holda
  // ikkita bo'sh pufakcha ustma-ust chiqadi. Matn kela boshlashi bilan (isTyping false bo'ladi)
  // xabar oddiy ro'yxatga qaytadi.
  const visibleMessages = isTyping ? messages.slice(0, -1) : messages;
  const firstName = (displayName || '').trim().split(/\s+/)[0] || '';

  return (
    <div className="relative flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Vocably AI — o'ziga xos brendlangan sarlavha (Gemini-uslubidagi generik
            "yordamchi" yozuvi emas), ortiqcha boshqaruvlarsiz (mute/tezlik/live — pastga q.). */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-border flex items-center gap-3 bg-gradient-to-r from-primary via-primary to-primary-hover flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-glow flex-shrink-0">
            <Sparkles size={18} className="text-on-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold font-luxury text-on-primary leading-tight">Vocably AI</p>
            <p className="text-[11px] text-on-primary/55 leading-tight">Har doim yordamga tayyor</p>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4"
        >
          {isEmpty && (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-glow">
                <Sparkles className="text-on-accent" size={24} />
              </div>
              <p className="text-base font-semibold text-primary font-display">
                Assalomu alaykum{firstName ? `, ${firstName}` : ''}!
              </p>
              <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto">
                Men sizning Vocably yordamchingizman. Bugun sizga qanday yordam bera olaman?
              </p>
              <p className="text-[10px] text-muted/70 mt-2">
                Masalan: "arise" so'zini bir nechta gapda ishlatib ko'rsat, yoki rasm yuboring
              </p>
              {/* Tez amallar (VOCABLY-TZ.md §12.2) — bosilsa darhol yuboriladi. */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-5 max-w-sm mx-auto">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa}
                    onClick={() => handleSend(qa)}
                    className="px-3 py-1.5 bg-surface border border-border hover:border-accent/40 hover:text-accent rounded-full text-xs text-muted transition-colors"
                  >
                    {qa}
                  </button>
                ))}
              </div>
            </div>
          )}
          {sessionLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-accent" size={20} />
            </div>
          )}
          {visibleMessages.map((msg, i) => (
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
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-primary text-on-accent flex items-center justify-center flex-shrink-0 shadow-glow">
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
          {!voiceSupported && (
            <p className="text-[10px] text-muted mb-2">
              Brauzeringiz ovozli kiritishni qo'llab-quvvatlamaydi — matn rejimida davom eting.
            </p>
          )}
          {micError && (
            <p className="flex items-start gap-1.5 text-[11px] text-red-600 mb-2">
              <span className="flex-1">{micError}</span>
              <button
                type="button"
                onClick={() => setMicError('')}
                aria-label="Xatoni yopish"
                className="flex-shrink-0 text-red-600/70 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </p>
          )}
          {/* Yagona "quti" — matn, rasm oldindan ko'rish va tugmalar (rasm/ovoz/yuborish)
              HAMMASI shu bitta chegara ichida (2026-09-10 so'rovi: "yozadigan qism to'liq
              chapga-o'ngga borsin, tugmalar ichida tursin"). Stiker/emoji ATAYLAB yo'q. */}
          <form
            onSubmit={handleFormSubmit}
            className="w-full border border-border rounded-2xl bg-surface focus-within:border-accent transition-colors overflow-hidden"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileInputChange}
            />
            {attachedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pt-3">
                {attachedImages.map((img, i) => (
                  <div key={i} className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="Yuklanadigan rasm" className="h-16 rounded-lg border border-border" />
                    <button
                      onClick={() => removeAttachedImage(i)}
                      aria-label="Rasmni olib tashlash"
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
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Xabaringizni yozing... (Shift+Enter — yangi qator)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={handleTextareaKeyDown}
              className="w-full px-4 pt-3 pb-1 bg-transparent text-sm leading-5 outline-none resize-none"
            />
            <div className="flex items-center justify-between gap-2 px-2 pb-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachedImages.length >= MAX_ATTACHED_IMAGES}
                  className="p-2.5 text-muted hover:text-accent hover:bg-accent-soft rounded-xl transition-colors disabled:opacity-30"
                  title={`Rasm biriktirish (${attachedImages.length}/${MAX_ATTACHED_IMAGES})`}
                  aria-label={`Rasm biriktirish (${attachedImages.length}/${MAX_ATTACHED_IMAGES})`}
                >
                  <Paperclip size={18} />
                </button>
                {voiceSupported && (
                  <div ref={langMenuRef} className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`p-2.5 rounded-xl transition-colors ${
                        micListening
                          ? 'text-accent bg-accent-soft animate-pulse'
                          : 'text-muted hover:text-accent hover:bg-accent-soft'
                      }`}
                      title="Ovozli kiritish"
                      aria-label={micListening ? "Ovozli kiritishni to'xtatish" : 'Ovozli kiritishni boshlash'}
                    >
                      <Mic size={18} />
                    </button>

                    {/* Nutq tili faqat mikrofon yoqilganda ko'rinadi */}
                    {micListening && (
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
              </div>
              <button
                type="submit"
                disabled={chatLoading || (!chatInput.trim() && attachedImages.length === 0)}
                aria-label="Xabarni yuborish"
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
