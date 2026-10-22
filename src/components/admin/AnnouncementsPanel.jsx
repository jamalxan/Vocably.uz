'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Megaphone, Send, Paperclip, X, Plus, Link2, Image as ImageIcon, Film, Music, FileText, Bot } from 'lucide-react';

// Reklama / e'lon yuborish. Barcha foydalanuvchiga ilova ichida (bildirishnoma
// + push) va Telegram'ga ulanganlarga botdan ham boradi. Media (rasm, video,
// audio, fayl — 4 MB gacha) va URL tugmalar ixtiyoriy. Kattaroq video,
// ovozli yoki video xabar — botga yuboring: bot o'zi "Barchaga yuborish"
// tugmasini ko'rsatadi (src/app/api/telegram/webhook).
const MEDIA_LABELS = { photo: 'Rasm', video: 'Video', animation: 'GIF', audio: 'Audio', voice: 'Ovozli xabar', video_note: 'Video xabar', document: 'Fayl' };
const MEDIA_ICONS = { photo: ImageIcon, animation: ImageIcon, video: Film, video_note: Film, audio: Music, voice: Music, document: FileText };
const MAX_BYTES = 4 * 1024 * 1024;

export default function AnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [buttons, setButtons] = useState([]);
  const [telegram, setTelegram] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const inputRef = useRef(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      if (res.ok) setAnnouncements(data.announcements || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pick = (f) => {
    setError('');
    if (!f) return;
    if (f.size > MAX_BYTES) return setError('Fayl 4 MB dan katta. Kattaroq media uchun botga yuboring.');
    setFile(f);
    setPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const validButtons = buttons.filter((b) => b.text.trim() && /^https?:\/\/\S+$/i.test(b.url.trim()));

  const send = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    // Bu — BARCHA foydalanuvchiga qaytarib bo'lmaydigan tarzda yuboriladigan
    // umumiy e'lon (bekor qilish/o'chirish imkoni yo'q), shuning uchun tasodifiy
    // yuborishning oldini olish uchun tasdiqlash so'raladi.
    if (!confirm(`Bu e'lon BARCHA foydalanuvchilarga${telegram ? ' (Telegram ham)' : ''} yuboriladi. Davom etasizmi?`)) return;
    setSending(true);
    setError('');
    setDone('');
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('body', body.trim());
      fd.append('telegram', String(telegram));
      fd.append('buttons', JSON.stringify(validButtons.map((b) => ({ text: b.text.trim(), url: b.url.trim() }))));
      if (file) fd.append('media', file);
      const res = await fetch('/api/admin/announcements', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik');
      setTitle('');
      setBody('');
      setButtons([]);
      clearFile();
      setDone(`Yuborildi: ${data.announcement.recipientCount} foydalanuvchi (ilova)${telegram ? `, Telegram: ${data.telegramCount}/${data.telegramLinked}` : ''}.`);
      setLoading(true);
      await fetchAnnouncements();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-base md:text-sm text-ink outline-none focus:border-accent transition-colors';

  return (
    <div className="space-y-6">
      <form onSubmit={send} className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-3">
        <p className="text-sm font-bold text-ink flex items-center gap-2">
          <Megaphone size={16} className="text-accent" /> Yangi e'lon / reklama
        </p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sarlavha" aria-label="E'lon sarlavhasi" className={inputCls} />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Matn (ixtiyoriy)"
          aria-label="E'lon matni (ixtiyoriy)"
          rows={4}
          className={`${inputCls} resize-none`}
        />

        {/* Media */}
        <div className="space-y-2">
          <input ref={inputRef} type="file" className="sr-only" accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.zip" onChange={(e) => pick(e.target.files?.[0])} />
          {file ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-bg">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="w-14 h-14 rounded-lg object-cover" />
              ) : (
                <Paperclip size={18} className="text-accent" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink truncate">{file.name}</p>
                <p className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" onClick={clearFile} aria-label="Faylni olib tashlash" className="w-9 h-9 grid place-items-center rounded-lg text-muted hover:text-ink hover:bg-surface">
                <X size={15} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 min-h-10 px-3.5 rounded-xl border border-dashed border-border text-sm text-muted hover:text-ink hover:border-accent/50">
              <Paperclip size={15} /> Rasm, video, audio yoki fayl qo'shish (4 MB gacha)
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          {buttons.map((b, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2">
              <input
                value={b.text}
                onChange={(e) => setButtons((prev) => prev.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                placeholder="Tugma matni"
                maxLength={64}
                aria-label={`${i + 1}-tugma matni`}
                className={`${inputCls} sm:w-48`}
              />
              <input
                value={b.url}
                onChange={(e) => setButtons((prev) => prev.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                placeholder="https://..."
                aria-label={`${i + 1}-tugma havolasi`}
                className={inputCls}
              />
              <button type="button" onClick={() => setButtons((prev) => prev.filter((_, j) => j !== i))} aria-label="Tugmani olib tashlash" className="w-10 h-10 grid place-items-center rounded-lg text-muted hover:text-danger hover:bg-danger-soft flex-shrink-0">
                <X size={15} />
              </button>
            </div>
          ))}
          {buttons.length < 4 && (
            <button type="button" onClick={() => setButtons((prev) => [...prev, { text: '', url: '' }])} className="inline-flex items-center gap-2 min-h-10 px-3.5 rounded-xl border border-dashed border-border text-sm text-muted hover:text-ink hover:border-accent/50">
              <Plus size={15} /> Tugma (havola) qo'shish
            </button>
          )}
        </div>

        <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer select-none">
          <input type="checkbox" checked={telegram} onChange={(e) => setTelegram(e.target.checked)} className="w-4 h-4 accent-accent" />
          <Bot size={15} className="text-muted" /> Telegram'ga ulangan foydalanuvchilarga botdan ham yuborilsin
        </label>

        <p className="text-xs text-muted">
          Ovozli xabar, video xabar (dumaloq) yoki 4 MB dan katta media kerakmi? Uni to'g'ridan-to'g'ri botga yuboring — bot "Barchaga yuborish" tugmasini ko'rsatadi.
        </p>

        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
        {done && (
          <p role="status" className="text-xs text-success font-medium">
            {done}
          </p>
        )}
        <button
          type="submit"
          disabled={sending || !title.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-on-accent rounded-xl text-sm font-semibold transition-colors"
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          Barcha foydalanuvchilarga yuborish
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-accent" size={22} />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface shadow-card divide-y divide-border overflow-hidden">
          {announcements.map((a) => {
            const kind = a.media?.kind;
            const Icon = kind ? MEDIA_ICONS[kind] || FileText : null;
            return (
              <div key={a._id} className="px-4 sm:px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <p className="min-w-0 text-sm font-semibold text-ink break-words flex items-center gap-2">
                    {Icon && <Icon size={14} className="text-accent flex-shrink-0" aria-label={MEDIA_LABELS[kind]} />}
                    {a.title}
                  </p>
                  <span className="text-[11px] text-muted flex-shrink-0">{new Date(a.createdAt).toLocaleString('uz-UZ')}</span>
                </div>
                {a.body && <p className="text-xs text-muted mt-1 break-words whitespace-pre-wrap">{a.body}</p>}
                {a.buttons?.length > 0 && (
                  <p className="text-[11px] text-muted mt-1.5 flex flex-wrap gap-x-3">
                    {a.buttons.map((b) => (
                      <span key={b.url} className="inline-flex items-center gap-1">
                        <Link2 size={11} /> {b.text}
                      </span>
                    ))}
                  </p>
                )}
                <p className="text-[11px] text-muted/70 mt-1.5">
                  {a.recipientCount} ta foydalanuvchiga yuborilgan
                  {a.telegramCount ? ` · Telegram: ${a.telegramCount}` : ''}
                  {a.source === 'bot' ? ' · bot orqali' : ''}
                </p>
              </div>
            );
          })}
          {announcements.length === 0 && <p className="text-center text-sm text-muted py-10">Hali e'lon yo'q</p>}
        </div>
      )}
    </div>
  );
}
