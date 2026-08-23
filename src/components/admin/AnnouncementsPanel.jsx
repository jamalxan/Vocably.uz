'use client';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, Megaphone, Send } from 'lucide-react';

export default function AnnouncementsPanel({ token }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setAnnouncements(data.announcements || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik');
      setTitle('');
      setBody('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={send} className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-3">
        <p className="text-sm font-bold text-primary flex items-center gap-2">
          <Megaphone size={16} className="text-accent" /> Yangi e'lon
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sarlavha"
          className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm text-primary outline-none focus:border-accent transition-colors"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Matn (ixtiyoriy)"
          rows={3}
          className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm text-primary outline-none focus:border-accent transition-colors resize-none"
        />
        {error && <p className="text-xs text-accent">{error}</p>}
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
          {announcements.map((a) => (
            <div key={a._id} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">{a.title}</p>
                <span className="text-[11px] text-muted flex-shrink-0">{new Date(a.createdAt).toLocaleString('uz-UZ')}</span>
              </div>
              {a.body && <p className="text-xs text-muted mt-1">{a.body}</p>}
              <p className="text-[10px] text-muted/70 mt-1.5">{a.recipientCount} ta foydalanuvchiga yuborilgan</p>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-center text-sm text-muted py-10">Hali e'lon yo'q</p>}
        </div>
      )}
    </div>
  );
}
