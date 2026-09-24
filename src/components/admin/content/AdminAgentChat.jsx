'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  Check,
  FileText,
  History,
  Image as ImageIcon,
  Loader2,
  Music,
  Paperclip,
  Plus,
  Send,
  Trash2,
  User,
  X,
} from 'lucide-react';

// Admin kontent agenti — CHAT (foydalanuvchi so'rovi: "admin paneldagi AI
// qism chat ko'rinishida bo'lsin, asosiy AI assistent kabi, lekin vazifasi
// bilan farq qilsin").
//
// Ataylab MINIMAL: model tanlash, temperature, taskKey, tizim prompti —
// bularning birortasi ham bu ekranda YO'Q ("AI chatda keraksiz narsalar
// bo'lmasin"). Ular "Sozlamalar" tabida qoladi. Bu yerda faqat: xabar
// yozish, fayl tashlash va agent taklif qilgan harakatni bir bosishda
// tasdiqlash.
//
// Fayl bo'lak-bo'lak yuklanadi (`/api/admin/agent/upload`) — Vercel'ning
// so'rov tanasi chegarasi kitob PDF'idan kichik, shuning uchun boshqa
// iloji yo'q; progress shu sababli bo'laklar bo'yicha hisoblanadi.
const CHUNK_BYTES = 3 * 1024 * 1024;

const mdTag = (Tag, className) => {
  function MdTag({ node, ...props }) {
    void node;
    return <Tag className={className} {...props} />;
  }
  return MdTag;
};

const MD_COMPONENTS = {
  p: mdTag('p', 'my-1.5 first:mt-0 last:mb-0 leading-relaxed'),
  ul: mdTag('ul', 'list-disc pl-5 my-1.5 space-y-0.5'),
  ol: mdTag('ol', 'list-decimal pl-5 my-1.5 space-y-0.5'),
  li: mdTag('li', 'pl-0.5'),
  strong: mdTag('strong', 'font-semibold text-ink'),
  a: mdTag('a', 'text-accent underline underline-offset-2 hover:text-accent-hover'),
  code: mdTag('code', 'px-1 py-0.5 rounded bg-bg text-[0.9em] font-mono'),
  h2: mdTag('h2', 'text-[15px] font-bold text-ink mt-3 mb-1.5 first:mt-0'),
  h3: mdTag('h3', 'text-sm font-bold text-ink mt-2.5 mb-1 first:mt-0'),
};

const KIND_ICON = { document: FileText, text: FileText, audio: Music, image: ImageIcon };

function humanSize(bytes) {
  if (!bytes) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
  return `u${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
}

async function uploadInChunks(file, threadId, onProgress) {
  const uploadId = randomId();
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_BYTES));

  for (let i = 0; i < totalChunks; i++) {
    const form = new FormData();
    form.append('chunk', file.slice(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES));
    form.append('uploadId', uploadId);
    form.append('index', String(i));
    form.append('totalChunks', String(totalChunks));
    form.append('filename', file.name);
    form.append('mimeType', file.type || '');
    form.append('size', String(file.size));
    if (threadId) form.append('threadId', threadId);

    const res = await fetch('/api/admin/agent/upload', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Yuklashda xatolik");
    onProgress((i + 1) / totalChunks);
    if (i === totalChunks - 1) return data;
  }
  throw new Error("Yuklash tugamadi");
}

export default function AdminAgentChat() {
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState([]); // [{localId, file, progress, attachment, error}]
  const [sending, setSending] = useState(false);
  const [applying, setApplying] = useState(null);
  // 2026-09-24 (real Chrome sinovida topilgan xato) — taklif tugmasi
  // bosilgach ham DOM'da CHEKLANMAGAN holda qolar edi: `applying` faqat
  // so'rov davomida (fetch tugagunga qadar) tugmani o'chirar, muvaffaqiyatli
  // bajarilgandan KEYIN esa tugma yana bosiladigan holatga qaytardi. Admin
  // (yoki sekin tarmoqda ikki marta bossa) BITTA taklifni ikki marta
  // bajarib, ikkita bir xil ExamTest qoralamasini yaratib qo'yardi (jonli
  // sinovda aynan shu holat ro'y berdi: bitta "Test 1 — joylashtirish"
  // bosilib, ikkita hujjat paydo bo'ldi). `appliedKeys` — muvaffaqiyatli
  // bajarilgan taklif kalitlarini DOIMIY saqlaydi (qayta render bo'lsa ham),
  // tugma shundan keyin butunlay o'chadi va "Bajarildi" deb ko'rsatiladi.
  const [appliedKeys, setAppliedKeys] = useState(() => new Set());
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [threads, setThreads] = useState([]);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const applyingRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, applying, pending]);

  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/agent/threads');
      const data = await res.json();
      if (res.ok) setThreads(data.threads || []);
    } catch {
      /* ro'yxat ochilmasa ham chat ishlayveradi */
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const openThread = async (id) => {
    setHistoryOpen(false);
    setError('');
    try {
      const res = await fetch(`/api/admin/agent/threads/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setThreadId(id);
      setMessages(data.thread.messages || []);
      setPending([]);
    } catch (err) {
      setError(err.message || "Suhbatni ochib bo'lmadi");
    }
  };

  const deleteThread = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`/api/admin/agent/threads/${id}`, { method: 'DELETE' });
      if (id === threadId) {
        setThreadId(null);
        setMessages([]);
      }
      loadThreads();
    } catch {
      /* jim */
    }
  };

  const newThread = () => {
    setThreadId(null);
    setMessages([]);
    setPending([]);
    setError('');
    setHistoryOpen(false);
  };

  const addFiles = async (files) => {
    const list = Array.from(files || []).slice(0, 5);
    if (list.length === 0) return;
    setError('');

    for (const file of list) {
      const localId = randomId();
      setPending((prev) => [...prev, { localId, name: file.name, size: file.size, progress: 0 }]);
      try {
        const data = await uploadInChunks(file, threadId, (p) =>
          setPending((prev) => prev.map((x) => (x.localId === localId ? { ...x, progress: p } : x)))
        );
        setPending((prev) =>
          prev.map((x) => (x.localId === localId ? { ...x, progress: 1, attachment: data.attachment, notes: data.notes || [] } : x))
        );
      } catch (err) {
        setPending((prev) => prev.map((x) => (x.localId === localId ? { ...x, error: err.message } : x)));
      }
    }
  };

  const removePending = (localId) => setPending((prev) => prev.filter((x) => x.localId !== localId));

  const autosize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const send = async () => {
    const text = input.trim();
    const ready = pending.filter((p) => p.attachment);
    if ((!text && ready.length === 0) || sending) return;

    setSending(true);
    setError('');
    const optimistic = {
      id: `local-${randomId()}`,
      role: 'user',
      content: text,
      attachments: ready.map((p) => p.attachment),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setPending([]);
    requestAnimationFrame(autosize);

    try {
      const res = await fetch('/api/admin/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, text, attachmentIds: ready.map((p) => p.attachment.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Javob kelmadi');

      setThreadId(data.threadId);
      setMessages((prev) => [...prev.filter((m) => m.id !== optimistic.id), ...data.messages]);
      loadThreads();
    } catch (err) {
      setError(err.message || 'Tarmoq xatosi');
    } finally {
      setSending(false);
    }
  };

  const applyProposal = async (proposal, key) => {
    // `applying` (state) + `appliedKeys` (state) ikkalasi ham React
    // yangilanishi ASINXRON bo'lgani uchun, bitta tugma bir necha marta
    // ketma-ket bosilsa (yoki ikki hodisa bir xil tikda tushsa), ikkalasi
    // ham hali eski qiymatni ko'rishi mumkin. `applyingRef` — SINXRON,
    // darhol yangilanadigan qo'riqchi: shu funksiya ichida ikkinchi
    // chaqiruv HAR DOIM to'xtatiladi, state yangilanishini kutmasdan.
    if (applyingRef.current || appliedKeys.has(key)) return;
    applyingRef.current = key;
    setApplying(key);
    setError('');
    try {
      const res = await fetch('/api/admin/agent/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, proposal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bajarilmadi');
      setAppliedKeys((prev) => new Set(prev).add(key));
      setMessages((prev) => [...prev, ...data.messages]);
      loadThreads();
    } catch (err) {
      setError(err.message || 'Tarmoq xatosi');
    } finally {
      applyingRef.current = null;
      setApplying(null);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const onPaste = (e) => {
    const files = Array.from(e.clipboardData?.files || []);
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  };

  const busy = sending || !!applying;

  return (
    <div
      className="flex flex-col rounded-2xl border border-border bg-surface shadow-card overflow-hidden relative"
      style={{ height: 'calc(100dvh - 190px)', minHeight: 440 }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
      }}
    >
      {/* Tepalik — faqat ikkita harakat: yangi suhbat va tarix. */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-border flex items-center gap-2 flex-shrink-0 relative">
        <div className="w-7 h-7 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
          <Bot size={15} className="text-on-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink truncate">Kontent agenti</p>
          <p className="text-[11px] text-muted truncate">Kitob, audio yoki rasm tashlang — o'zi joyiga qo'yadi</p>
        </div>
        <button
          type="button"
          onClick={newThread}
          title="Yangi suhbat"
          aria-label="Yangi suhbat"
          className="ml-auto min-w-11 min-h-11 md:min-w-0 md:min-h-0 md:p-1.5 flex items-center justify-center rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={() => setHistoryOpen((v) => !v)}
          title="Suhbatlar tarixi"
          aria-label="Suhbatlar tarixi"
          aria-expanded={historyOpen}
          className="min-w-11 min-h-11 md:min-w-0 md:min-h-0 md:p-1.5 flex items-center justify-center rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors"
        >
          <History size={16} />
        </button>

        {historyOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setHistoryOpen(false)} />
            <div className="absolute right-3 top-full mt-1 z-30 w-72 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-xl shadow-card py-1.5 max-h-80 overflow-y-auto">
              {threads.length === 0 && <p className="px-3 py-2 text-xs text-muted">Hozircha suhbat yo'q.</p>}
              {threads.map((t) => (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openThread(t.id)}
                  onKeyDown={(e) => e.key === 'Enter' && openThread(t.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent-soft transition-colors cursor-pointer ${
                    t.id === threadId ? 'bg-accent-soft' : ''
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-ink truncate">{t.title}</span>
                    <span className="block text-[10px] text-muted truncate">{t.preview}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => deleteThread(t.id, e)}
                    aria-label="Suhbatni o'chirish"
                    className="p-1.5 rounded-lg text-muted hover:text-danger flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 space-y-3">
        {messages.length === 0 && <EmptyState onPick={() => fileInputRef.current?.click()} />}

        {messages.map((m, i) => (
          <MessageBubble
            key={m.id || i}
            message={m}
            applying={applying}
            appliedKeys={appliedKeys}
            onApply={(proposal, idx) => applyProposal(proposal, `${m.id || i}-${idx}`)}
            messageKey={m.id || i}
          />
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <div className="w-7 h-7 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-on-accent" />
            </div>
            <div className="bg-bg border border-border rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin" />
              {applying ? 'Bajarilmoqda...' : 'Tahlil qilinmoqda...'}
            </div>
          </div>
        )}
      </div>

      {error && <p className="px-4 py-2 text-xs text-danger border-t border-border flex-shrink-0">{error}</p>}

      {pending.length > 0 && (
        <div className="px-3 sm:px-4 pt-2 flex flex-col gap-1.5 flex-shrink-0">
          {pending.map((p) => (
            <div key={p.localId} className="flex flex-col gap-1 max-w-full">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs w-fit max-w-full">
                {p.error ? (
                  <X size={13} className="text-danger flex-shrink-0" />
                ) : p.attachment ? (
                  <Check size={13} className="text-success flex-shrink-0" />
                ) : (
                  <Loader2 size={13} className="animate-spin text-muted flex-shrink-0" />
                )}
                <span className="truncate max-w-[180px] text-ink">{p.name}</span>
                <span className={`flex-shrink-0 ${p.error ? 'text-danger' : 'text-muted'}`}>
                  {p.error ? p.error : p.attachment ? humanSize(p.size) : `${Math.round(p.progress * 100)}%`}
                </span>
                <button type="button" onClick={() => removePending(p.localId)} aria-label="Olib tashlash" className="text-muted hover:text-danger flex-shrink-0">
                  <X size={12} />
                </button>
              </div>
              {/* Server ogohlantirishlari (masalan "audio juda katta, avtomatik
                  tekshirib bo'lmaydi") — admin buni YUBORISHDAN OLDIN ko'rsin. */}
              {(p.notes || []).map((note, i) => (
                <p key={i} className="text-[11px] text-warning pl-1">{note}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="p-2.5 sm:p-3 border-t border-border flex items-end gap-2 flex-shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Fayl biriktirish (PDF, DOCX, audio, rasm)"
          aria-label="Fayl biriktirish"
          className="min-w-11 min-h-11 flex items-center justify-center rounded-xl text-muted hover:text-accent hover:bg-accent-soft transition-colors flex-shrink-0"
        >
          <Paperclip size={17} />
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autosize();
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder="Fayl tashlang yoki yozing..."
          aria-label="Xabar"
          rows={1}
          className="flex-1 px-3.5 py-2.5 bg-bg border border-border rounded-xl text-[16px] sm:text-sm text-ink outline-none focus:border-accent transition-colors resize-none max-h-40"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || (!input.trim() && !pending.some((p) => p.attachment))}
          aria-label="Yuborish"
          className="min-w-11 min-h-11 flex items-center justify-center p-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent rounded-xl transition-colors flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>

      {dragging && (
        <div className="absolute inset-0 z-40 bg-accent-soft/90 border-2 border-dashed border-accent rounded-2xl flex items-center justify-center pointer-events-none">
          <p className="text-sm font-semibold text-accent">Faylni shu yerga tashlang</p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onPick }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-8 px-4">
      <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center">
        <Bot size={24} className="text-accent" />
      </div>
      <div>
        <p className="text-base font-semibold text-ink">Kontent agenti</p>
        <p className="text-sm text-muted mt-1 max-w-md">
          Kitob (PDF/DOCX) tashlang — ichidagi Reading, Listening, Writing va Speaking bo'limlarini o'zim ajratib,
          alohida testlar sifatida joylashtiraman. Audio tashlasangiz — qaysi Listening uchun ekanini tekshirib biriktiraman.
        </p>
      </div>
      <button
        type="button"
        onClick={onPick}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-on-accent rounded-xl text-sm font-semibold transition-colors"
      >
        <Paperclip size={15} /> Fayl tanlash
      </button>
    </div>
  );
}

function MessageBubble({ message, onApply, applying, appliedKeys, messageKey }) {
  const isUser = message.role === 'user';
  const proposals = message.data?.proposals || [];

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-bg border border-border' : 'bg-accent'}`}>
        {isUser ? <User size={14} className="text-muted" /> : <Bot size={14} className="text-on-accent" />}
      </div>
      <div className={`max-w-[85%] sm:max-w-[80%] min-w-0 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Fayl ko'rinishi FAQAT admin xabarida — agent javobi ham xuddi
            shu faylga bog'langan, ikkala pufakchada ko'rsatilsa bitta audio
            ikki marta chiqib ketardi. */}
        {isUser && (message.attachments || []).length > 0 && (
          <div className="flex flex-col items-end gap-1.5 mb-1.5 max-w-full">
            {message.attachments.map((a) => {
              const Icon = KIND_ICON[a.kind] || FileText;
              return (
                <div key={a.id} className="flex flex-col gap-1 items-end max-w-full">
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-bg border border-border rounded-lg text-[11px] text-ink">
                    <Icon size={12} className="text-accent" />
                    <span className="truncate max-w-[160px]">{a.filename}</span>
                    <span className="text-muted">{humanSize(a.bytes)}</span>
                  </span>
                  {/* Yuklangan fayl HAQIQATAN o'sha fayl ekanini admin darhol
                      ko'rishi/eshitishi uchun — audio Listening part'iga
                      biriktirilishidan OLDIN tekshirib olinadi. */}
                  {a.audioFileId && (
                    <audio controls preload="none" src={`/api/exam/audio/${a.audioFileId}`} className="h-9 max-w-[260px]">
                      <track kind="captions" />
                    </audio>
                  )}
                  {a.imageFileId && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/exam/image/${a.imageFileId}`}
                      alt={a.filename}
                      className="max-h-40 max-w-[260px] rounded-lg border border-border object-contain bg-bg"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {message.content && (
          <div
            className={`px-4 py-2.5 text-sm break-words rounded-2xl ${
              isUser ? 'bg-accent text-on-accent rounded-br-none whitespace-pre-wrap' : 'bg-bg border border-border text-ink rounded-bl-none'
            }`}
          >
            {isUser ? (
              message.content
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}

        {proposals.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5 w-full">
            {proposals.map((p, idx) => {
              const key = `${messageKey}-${idx}`;
              const isBusy = applying === key;
              // Jonli Chrome sinovida topilgan xato: taklif muvaffaqiyatli
              // bajarilgandan keyin ham tugma bosiladigan holda qolar edi —
              // ikkinchi bosish (yoki tasodifiy ikki marta bosilishi) BITTA
              // taklifni ikki marta bajarib, ikkita bir xil ExamTest
              // qoralamasini yaratib qo'yardi. `appliedKeys` shu kalitni
              // doimiy "band" deb belgilaydi — tugma butunlay o'chadi.
              const isDone = appliedKeys?.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onApply(p, idx)}
                  disabled={!!applying || isDone}
                  aria-disabled={isDone}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-left transition-colors disabled:opacity-50 ${
                    isDone
                      ? 'border border-success/30 bg-success-soft text-ink cursor-default'
                      : p.secondary
                        ? 'border border-border hover:border-accent/50 hover:bg-accent-soft text-ink'
                        : 'bg-accent-soft border border-accent/40 hover:bg-accent/15 text-ink'
                  }`}
                >
                  {isBusy ? (
                    <Loader2 size={14} className="animate-spin flex-shrink-0 text-accent" />
                  ) : (
                    <Check size={14} className={`flex-shrink-0 ${isDone ? 'text-success' : 'text-accent'}`} />
                  )}
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold truncate">{isDone ? 'Bajarildi' : p.label}</span>
                    {!isDone && p.description && <span className="block text-[11px] text-muted truncate">{p.description}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
