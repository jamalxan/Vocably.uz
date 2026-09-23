'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, Paperclip, X, Send, Mic, BookMarked, PanelLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ChatMessage from './chat/ChatMessage';
import WordPicker, { toWordContext } from './ai/WordPicker';
import IconButton from './ui/IconButton';

// Bu til FAQAT mikrofon (SpeechRecognition, ovozli kiritish) uchun — matn yozishga ta'sir
// qilmaydi, tanlagich faqat mikrofon yoqilganda ko'rinadi.
const RECOGNITION_LANGS = [
  { code: 'en-US', label: 'EN', name: 'Ingliz tili' },
  { code: 'uz-UZ', label: 'UZ', name: "O'zbek tili" },
  { code: 'ru-RU', label: 'RU', name: 'Rus tili' },
];
const DEFAULT_RECOGNITION_LANG = 'en-US';
const MAX_ATTACHED_IMAGES = 10;
// Katta telefon rasmlari yuborishdan oldin kichraytiriladi (JSON body va state hajmi uchun).
const MAX_IMAGE_DIM = 1600;
const DOWNSCALE_MIN_BYTES = 1024 * 1024;

const readFileAsDataUrl = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result || null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

async function prepareImage(file) {
  const original = await readFileAsDataUrl(file);
  if (!original || file.type === 'image/gif' || file.size < DOWNSCALE_MIN_BYTES) return original;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const resized = canvas.toDataURL('image/jpeg', 0.85);
    return resized.length < original.length ? resized : original;
  } catch {
    return original;
  }
}
// TZ-vocably-v2.md §D2.3 — avval bu tugmalar so'z tanlanmagan holda oddiy matn yuborar,
// AI esa "qaysi so'zni nazarda tutyapsiz, yozib yuboring" deb javob berardi (BUG-007).
// Endi har biri avval Word Picker'ni (min/max cheklov bilan) ochadi, so'ng tanlangan
// so'zlar asosida xabar avtomatik tuziladi va to'liq kontekst bilan yuboriladi.
const QUICK_ACTIONS = [
  {
    label: "Bu so'zni tushuntir",
    minSelect: 1,
    maxSelect: 1,
    buildMessage: (words) => `"${words[0].word}" so'zini tushuntirib ber.`,
  },
  {
    label: 'Misol jumla ber',
    minSelect: 1,
    maxSelect: 5,
    buildMessage: (words) => `${words.map((w) => w.word).join(', ')} so'z(lar)i uchun har biriga 3 tadan gap tuzib ber.`,
  },
  {
    label: "Mnemonika o'ylab top",
    minSelect: 1,
    maxSelect: 10,
    buildMessage: (words) => `${words.map((w) => w.word).join(', ')} so'z(lar)i uchun o'zbekcha assotsiatsiya (mnemonika) o'ylab top.`,
  },
  {
    label: 'Test tuz',
    minSelect: 5,
    maxSelect: 30,
    buildMessage: (words) => `${words.map((w) => w.word).join(', ')} so'zlari asosida interaktiv test tuz.`,
  },
];
const RECOGNITION_LANG_KEY = 'vocably.recognitionLang';
// Textarea 1 qatordan boshlanadi va ~6 qatorgacha o'sadi, keyin ichida scroll paydo bo'ladi.
const MAX_TEXTAREA_HEIGHT = 142;

const PENDING_MARK_START = '\n[[PENDING_ADD_WORDS]]';
const PENDING_MARK_END = '[[/PENDING_ADD_WORDS]]';

// TZ-vocably-v2.md §D1.5/H3 — server barcha provayderlar tugagach shu markerni oqimga
// qo'shadi (src/app/api/ai/chat/route.js). Avval xato matni oddiy proza sifatida kelib,
// AI javobidan farqlanmas edi; endi strukturali JSON (o'zbekcha xabar + requestId) —
// shu yerda ajratib olinadi va ChatMessage'da alohida "Qayta urinish" kartasi sifatida
// ko'rsatiladi (xom AI matni bilan aralashmaydi).
const AI_ERROR_MARK_START = '\n[[AI_ERROR]]';
const AI_ERROR_MARK_END = '[[/AI_ERROR]]';

function extractAiError(fullText) {
  const startIdx = fullText.indexOf(AI_ERROR_MARK_START);
  if (startIdx === -1) return { visibleText: fullText, aiError: null };
  const endIdx = fullText.indexOf(AI_ERROR_MARK_END, startIdx);
  if (endIdx === -1) return { visibleText: fullText.slice(0, startIdx), aiError: null };
  const jsonStr = fullText.slice(startIdx + AI_ERROR_MARK_START.length, endIdx);
  try {
    return { visibleText: fullText.slice(0, startIdx), aiError: JSON.parse(jsonStr) };
  } catch {
    return { visibleText: fullText.slice(0, startIdx), aiError: null };
  }
}

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

// TZ-vocably-v2.md §D3 (BUG-011) — generate_quiz tool natijasi (src/app/api/ai/chat/route.js
// QUIZ_MARK_START/END) shu yerda ajratib olinadi, ChatMessage QuizCard render qiladi.
const QUIZ_MARK_START = '\n[[QUIZ]]';
const QUIZ_MARK_END = '[[/QUIZ]]';

function extractQuizAction(fullText) {
  const startIdx = fullText.indexOf(QUIZ_MARK_START);
  if (startIdx === -1) return { visibleText: fullText, quizAction: null };
  const endIdx = fullText.indexOf(QUIZ_MARK_END, startIdx);
  if (endIdx === -1) return { visibleText: fullText.slice(0, startIdx), quizAction: null };
  const jsonStr = fullText.slice(startIdx + QUIZ_MARK_START.length, endIdx);
  try {
    const quizAction = JSON.parse(jsonStr);
    return { visibleText: fullText.slice(0, startIdx).trim(), quizAction };
  } catch {
    return { visibleText: fullText.slice(0, startIdx), quizAction: null };
  }
}

// `contextHint` — VOCABLY-TZ.md §12.1: qaysi sahifadan ochilgani haqida qisqa,
// tabiiy tildagi jumla (masalan "Reading (Oqish) bo'limida"). AiPanel.jsx
// (global sirg'aluvchi panel) usePathname() orqali hisoblab beradi; /app/ai
// to'liq sahifasi bu propni bermaydi (umumiy, kontekstsiz suhbat).
// `onOpenSessions` — /app/ai sahifasi mobilda suhbatlar drawer'ini shu sarlavhadan ochadi.
export default function AiChat({ contextHint, onOpenSessions } = {}) {
  // Suhbatlar ro'yxati alohida panelda (AiChatSessionsPanel) — bu yerda faqat joriy
  // suhbat xabarlari boshqariladi.
  const {
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

  // TZ-vocably-v2.md §D2.1/D2.3 — Word Picker holati. `pickerConfig.pendingQuickAction`
  // bo'lsa (tez-tugma bosilganda) tanlov tugagach xabar avtomatik tuziladi va yuboriladi;
  // aks holda (asosiy "📚 Lug'atdan tanlash" tugmasi) tanlangan so'zlar chip sifatida
  // inputga qo'shiladi, foydalanuvchi o'z xabarini yozib, keyin birga yuboradi.
  const [pickerConfig, setPickerConfig] = useState(null); // { minSelect, maxSelect, title, pendingQuickAction? }
  const [selectedWordChips, setSelectedWordChips] = useState([]);

  // TZ-vocably-v2.md §D2.2 — `@` mention: input ichida "@" dan keyin yozilgan matn
  // aktiv kategoriyadagi so'zlarni real vaqtda taklif qiladi.
  const [mentionQuery, setMentionQuery] = useState(null); // { text, start, end } yoki null

  // null — hali aniqlanmagan (SSR/birinchi render), shunda ogohlantirish miltillamaydi.
  const [voiceSupported, setVoiceSupported] = useState(null);
  // Sensorli ekranda Enter yangi qator qo'shadi, yuborish — faqat tugma orqali.
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
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
  // Har bir AI so'rovining tartib raqami — suhbat almashtirilsa eski oqim e'tiborsiz qoldiriladi.
  const requestSeqRef = useRef(0);

  useEffect(() => {
    setVoiceSupported(typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition));
    setIsCoarsePointer(!!window.matchMedia?.('(pointer: coarse)').matches);
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
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      chatEndRef.current.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'end' });
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
    // Oqim davom etayotgan bo'lsa, uning qolgan qismi yangi suhbatga yozilmasin.
    requestSeqRef.current += 1;
    setChatLoading(false);
    if (!currentSessionId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setSessionLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/ai/sessions/${currentSessionId}`);
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

  // Bir nechta faylni qo'shadi, lekin umumiy soni MAX_ATTACHED_IMAGES dan oshmaydi.
  const attachImageFiles = async (files) => {
    const imageFiles = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const dataUrls = (await Promise.all(imageFiles.map(prepareImage))).filter(Boolean);
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

  // So'nggi so'ralgan xabar — "Qayta urinish" bosilganda foydalanuvchi xabarini
  // takrorlamasdan, faqat so'rovni qaytadan yuborish uchun (TZ-vocably-v2.md §D1.5).
  const lastRequestRef = useRef(null);

  const runAiRequest = async (text, imagesToSend, wordContextToSend) => {
    const seq = ++requestSeqRef.current;
    const isStale = () => requestSeqRef.current !== seq;
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: text,
          imagesBase64: imagesToSend,
          context: contextHint,
          wordContext: wordContextToSend,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw Object.assign(new Error(data.error || 'Xatolik yuz berdi'), { requestId: data.requestId || null });
      }

      const newSessionId = res.headers.get('X-Session-Id');
      if (!isStale() && newSessionId && newSessionId !== currentSessionId) {
        setCurrentSessionId(newSessionId);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        if (isStale()) continue;
        const { visibleText: afterQuiz } = extractQuizAction(fullText);
        const { visibleText: afterPending } = extractPendingAction(afterQuiz);
        const { visibleText } = extractAiError(afterPending);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], parts: [{ text: visibleText }] };
          return updated;
        });
      }

      if (isStale()) {
        loadChatSessions();
        return;
      }

      const { visibleText: afterQuiz, quizAction } = extractQuizAction(fullText);
      const { visibleText: afterPending, pendingAction } = extractPendingAction(afterQuiz);
      const { visibleText, aiError } = extractAiError(afterPending);

      // AI shu javob davomida yangi kategoriya yaratgan bo'lishi mumkin (create_category darhol
      // saqlanadi) — tasdiqlash kartasi ko'rsatilishidan oldin kategoriyalar ro'yxatini yangilab
      // olamiz, aks holda yangi kategoriya hali eskirgan ro'yxatda yo'q bo'lib, tanlab bo'lmay qoladi.
      if (pendingAction) await refreshCategories();

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = aiError
          ? { role: 'model', parts: [{ text: visibleText }], aiError }
          : { role: 'model', parts: [{ text: visibleText }], pendingAction: pendingAction || null, quizAction: quizAction || null };
        return updated;
      });

      // Sidebar'dagi ro'yxat yangilansin (sarlavha/tartib o'zgargan bo'lishi mumkin).
      loadChatSessions();
    } catch (err) {
      if (isStale()) return;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'model',
          parts: [{ text: '' }],
          aiError: { message: err.message, requestId: err.requestId || null },
        };
        return updated;
      });
    } finally {
      if (!isStale()) setChatLoading(false);
    }
  };

  const handleSend = async (overrideText, overrideWordContext) => {
    const text = (overrideText ?? chatInput).trim();
    const wordContextToSend = overrideWordContext ?? selectedWordChips;
    if ((!text && attachedImages.length === 0) || chatLoading) return;

    const userMsg = {
      role: 'user',
      parts: [{ text: text || '(rasm yuborildi)' }],
      imageUrls: attachedImages,
      wordChips: wordContextToSend.length > 0 ? wordContextToSend : undefined,
    };
    const modelPlaceholder = { role: 'model', parts: [{ text: '' }], _streaming: true };

    setMessages((prev) => [...prev, userMsg, modelPlaceholder]);
    setChatInput('');
    const imagesToSend = attachedImages;
    setAttachedImages([]);
    setSelectedWordChips([]);
    setChatLoading(true);
    stickToBottomRef.current = true;
    lastRequestRef.current = { text, images: imagesToSend, wordContext: wordContextToSend };

    await runAiRequest(text, imagesToSend, wordContextToSend);
  };

  // Xato kartasidagi "Qayta urinish" — foydalanuvchi xabarini takrorlamaydi, faqat
  // muvaffaqiyatsiz model javobini qayta so'raydi (bir xil sessionId/matn/rasm bilan).
  const handleRetry = () => {
    if (!lastRequestRef.current || chatLoading) return;
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { role: 'model', parts: [{ text: '' }], _streaming: true };
      return updated;
    });
    setChatLoading(true);
    stickToBottomRef.current = true;
    runAiRequest(lastRequestRef.current.text, lastRequestRef.current.images, lastRequestRef.current.wordContext);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  // TZ-vocably-v2.md §D2.3 — tez-tugma bosilganda avval Word Picker ochiladi (min/max
  // shu tugmaga mos), tanlov tugagach xabar avtomatik tuzilib yuboriladi.
  const openQuickAction = (action) => {
    setPickerConfig({
      minSelect: action.minSelect,
      maxSelect: action.maxSelect,
      title: action.label,
      pendingQuickAction: action,
    });
  };

  // §D2.1 — asosiy "📚 Lug'atdan tanlash" tugmasi: tanlangan so'zlar inputga chip
  // sifatida qo'shiladi, xabar matnini foydalanuvchi o'zi yozadi.
  const openManualPicker = () => {
    setPickerConfig({ minSelect: 1, maxSelect: 30, title: "Lug'atdan so'z tanlash" });
  };

  const handlePickerConfirm = (words) => {
    const action = pickerConfig?.pendingQuickAction;
    setPickerConfig(null);
    if (action) {
      handleSend(action.buildMessage(words), words);
      return;
    }
    setSelectedWordChips((prev) => {
      const merged = [...prev];
      for (const w of words) if (!merged.some((m) => m.wordId === w.wordId)) merged.push(w);
      return merged;
    });
  };

  const removeWordChip = (wordId) => {
    setSelectedWordChips((prev) => prev.filter((w) => w.wordId !== wordId));
  };

  // §D2.2 — `@` mention: kursor turgan joydan orqaga qarab oxirgi bo'shliqqacha bo'lgan
  // matnni tekshiradi, agar u "@" bilan boshlansa (va bo'sh joy bo'lmasa) — taklif ro'yxati
  // ochiladi. Barcha kategoriyalar bo'yicha qidiradi, mos so'zlar 6 tagacha ko'rsatiladi.
  const allWordsFlat = (categories || []).flatMap((c) => (c.words || []).map((w) => ({ word: w, category: c })));

  const mentionSuggestions = mentionQuery
    ? allWordsFlat
        .filter(({ word }) => mentionQuery.text === '' || word.word.toLowerCase().startsWith(mentionQuery.text.toLowerCase()))
        .slice(0, 6)
    : [];

  const updateMentionFromCaret = (value, caret) => {
    const upToCaret = value.slice(0, caret);
    const atIdx = upToCaret.lastIndexOf('@');
    if (atIdx === -1) return setMentionQuery(null);
    const between = upToCaret.slice(atIdx + 1);
    if (/\s/.test(between)) return setMentionQuery(null);
    setMentionQuery({ text: between, start: atIdx, end: caret });
  };

  const handleChatInputChange = (e) => {
    const value = e.target.value;
    setChatInput(value);
    updateMentionFromCaret(value, e.target.selectionStart ?? value.length);
  };

  const selectMention = ({ word, category }) => {
    if (!mentionQuery) return;
    const before = chatInput.slice(0, mentionQuery.start);
    const after = chatInput.slice(mentionQuery.end);
    setChatInput(`${before}${after}`);
    setMentionQuery(null);
    setSelectedWordChips((prev) => (prev.some((w) => w.wordId === word._id) ? prev : [...prev, toWordContext(word, category)]));
    textareaRef.current?.focus();
  };

  // Enter — yuborish, Shift+Enter — yangi qator.
  // IME (koreys/xitoy/yapon klaviaturasi) kompozitsiyasi paytida Enter xabarni yubormasligi kerak.
  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Escape' && mentionQuery) {
      // AiPanel'ning Escape tinglovchisi butun panelni yopib yubormasin.
      e.stopPropagation();
      setMentionQuery(null);
      return;
    }
    if (e.key !== 'Enter' || e.shiftKey) return;
    if (isCoarsePointer && !(mentionQuery && mentionSuggestions.length > 0)) return;
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    if (mentionQuery && mentionSuggestions.length > 0) {
      selectMention(mentionSuggestions[0]);
      return;
    }
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
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold font-luxury text-on-primary leading-tight">Vocably AI</p>
            <p className="text-[11px] text-on-primary/55 leading-tight">Har doim yordamga tayyor</p>
          </div>
          {onOpenSessions && (
            <IconButton
              icon={PanelLeft}
              label="Suhbatlar ro'yxati"
              variant="ghost-on-primary"
              size="lg"
              onClick={onOpenSessions}
              className="lg:hidden flex-shrink-0 -mr-2"
            />
          )}
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
              <p className="text-base font-semibold text-ink font-display">
                Assalomu alaykum{firstName ? `, ${firstName}` : ''}!
              </p>
              <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto">
                Men sizning Vocably yordamchingizman. Bugun sizga qanday yordam bera olaman?
              </p>
              <p className="text-[11px] text-ink-subtle mt-2">
                Masalan: "arise" so'zini bir nechta gapda ishlatib ko'rsat, yoki rasm yuboring
              </p>
              {/* Tez amallar (TZ-vocably-v2.md §D2.3) — avval Word Picker'ni ochadi. */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-5 max-w-sm mx-auto">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => openQuickAction(qa)}
                    className="px-3 py-2.5 md:py-1.5 bg-surface border border-border hover:border-accent/40 hover:text-accent rounded-full text-xs text-muted transition-colors"
                  >
                    {qa.label}
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
              key={`${sessionOpenNonce}-${i}`}
              msg={msg}
              index={i}
              categories={categories}
              sessionId={currentSessionId}
              onResolvedAdd={handleResolvedAdd}
              onEdit={msg.role === 'user' ? handleEditMessage : null}
              onRetry={msg.aiError ? handleRetry : null}
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
          {voiceSupported === false && (
            <p className="text-[11px] text-muted mb-2">
              Brauzeringiz ovozli kiritishni qo'llab-quvvatlamaydi — matn rejimida davom eting.
            </p>
          )}
          {micError && (
            <p className="flex items-start gap-1.5 text-[11px] text-danger mb-2">
              <span className="flex-1">{micError}</span>
              <button
                type="button"
                onClick={() => setMicError('')}
                aria-label="Xatoni yopish"
                className="flex-shrink-0 p-2 -m-2 text-danger/70 hover:text-danger"
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
            className="relative w-full border border-border rounded-2xl bg-surface focus-within:border-accent transition-colors"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileInputChange}
            />
            {/* §D2.2 `@` mention taklif ro'yxati */}
            {mentionQuery && mentionSuggestions.length > 0 && (
              <div className="absolute bottom-full mb-1 left-2 right-2 z-30 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                {mentionSuggestions.map(({ word, category }) => (
                  <button
                    key={word._id}
                    type="button"
                    onClick={() => selectMention({ word, category })}
                    className="w-full flex items-center justify-between gap-2 px-3 py-3 md:py-2 text-left text-xs hover:bg-bg transition-colors"
                  >
                    <span className="font-semibold text-ink">{word.word}</span>
                    <span className="text-muted truncate">{(word.syns || []).join(', ')}</span>
                  </button>
                ))}
              </div>
            )}
            {(attachedImages.length > 0 || selectedWordChips.length > 0) && (
              <div className="flex flex-wrap gap-2 px-3 pt-3">
                {selectedWordChips.map((w) => (
                  <span
                    key={w.wordId}
                    className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-accent-soft text-accent rounded-full text-xs font-semibold"
                  >
                    <BookMarked size={11} /> {w.word}
                    <button
                      type="button"
                      onClick={() => removeWordChip(w.wordId)}
                      aria-label={`${w.word} so'zini olib tashlash`}
                      className="p-1.5 -m-1 hover:text-accent-hover"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {attachedImages.map((img, i) => (
                  <div key={i} className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="Yuklanadigan rasm" className="h-16 rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => removeAttachedImage(i)}
                      aria-label="Rasmni olib tashlash"
                      className="absolute -top-3 -right-3 p-1.5"
                    >
                      <span className="block bg-primary-hover text-on-primary rounded-full p-0.5">
                        <X size={11} />
                      </span>
                    </button>
                  </div>
                ))}
                {attachedImages.length > 0 && (
                  <span className="self-center text-[11px] text-muted">
                    {attachedImages.length}/{MAX_ATTACHED_IMAGES}
                  </span>
                )}
              </div>
            )}
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={
                isCoarsePointer
                  ? "Xabar yozing... (@ — lug'atdan so'z)"
                  : "Xabaringizni yozing... (@ — lug'atdan so'z, Shift+Enter — yangi qator)"
              }
              value={chatInput}
              onChange={handleChatInputChange}
              onPaste={handlePaste}
              onKeyDown={handleTextareaKeyDown}
              className="w-full px-4 pt-3 pb-1 bg-transparent text-base md:text-sm leading-5 outline-none resize-none"
            />
            <div className="flex items-center justify-between gap-2 px-2 pb-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={openManualPicker}
                  className="p-3 md:p-2.5 text-muted hover:text-accent hover:bg-accent-soft rounded-xl transition-colors"
                  title="Lug'atdan so'z tanlash"
                  aria-label="Lug'atdan so'z tanlash"
                >
                  <BookMarked size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachedImages.length >= MAX_ATTACHED_IMAGES}
                  className="p-3 md:p-2.5 text-muted hover:text-accent hover:bg-accent-soft rounded-xl transition-colors disabled:opacity-30"
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
                      className={`p-3 md:p-2.5 rounded-xl transition-colors ${
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
                        className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-accent hover:bg-accent-hover text-on-accent text-[11px] font-bold leading-tight shadow"
                        title="Mikrofon tili"
                        aria-label={`Mikrofon tili: ${activeLang.name}`}
                        aria-expanded={langMenuOpen}
                      >
                        {activeLang.label}
                      </button>
                    )}

                    {langMenuOpen && (
                      <div className="absolute bottom-full mb-2 left-0 z-30 w-40 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                        <p className="px-3 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider bg-bg">
                          Mikrofon tili
                        </p>
                        {RECOGNITION_LANGS.map((l) => (
                          <button
                            key={l.code}
                            type="button"
                            onClick={() => changeRecognitionLang(l.code)}
                            className={`w-full flex items-center gap-2 px-3 py-3 md:py-2 text-left text-xs transition-colors ${
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
                className="min-h-11 min-w-11 md:min-h-0 md:min-w-0 px-4 py-2 flex items-center justify-center bg-accent hover:bg-accent-hover text-on-accent rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {pickerConfig && (
        <WordPicker
          open
          onClose={() => setPickerConfig(null)}
          categories={categories}
          minSelect={pickerConfig.minSelect}
          maxSelect={pickerConfig.maxSelect}
          title={pickerConfig.title}
          onConfirm={handlePickerConfirm}
        />
      )}
    </div>
  );
}
