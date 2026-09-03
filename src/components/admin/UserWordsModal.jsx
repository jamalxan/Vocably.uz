'use client';
import { useEffect, useState } from 'react';
import { X, Loader2, BookOpen, Search } from 'lucide-react';

export default function UserWordsModal({ userId, token, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/admin/users/${userId}/words`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || 'Xatolik');
          return;
        }
        setUser(data.user);
        setCategories(data.categories || []);
      } catch {
        if (!cancelled) setError('Xatolik yuz berdi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, token]);

  const query = q.trim().toLowerCase();
  const filtered = categories
    .map((c) => ({
      ...c,
      words: !query
        ? c.words
        : (c.words || []).filter(
            (w) =>
              w.word?.toLowerCase().includes(query) ||
              (w.syns || []).some((s) => s.toLowerCase().includes(query))
          ),
    }))
    .filter((c) => (c.words || []).length > 0);

  const totalWords = categories.reduce((sum, c) => sum + (c.words?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-soft border border-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <BookOpen size={15} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-primary truncate">{user?.name || 'Foydalanuvchi'}</p>
              <p className="text-xs text-muted truncate">
                {user?.phoneDisplay} {!loading && `· ${totalWords} ta so'z`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted hover:text-primary rounded-lg flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {!loading && !error && categories.length > 0 && (
          <div className="relative px-5 pt-4 flex-shrink-0">
            <Search size={15} className="absolute left-8 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="So'z yoki sinonim bo'yicha qidirish..."
              className="w-full pl-9 pr-4 py-2.5 bg-bg border border-border rounded-xl text-sm text-primary placeholder:text-muted/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-accent" size={24} />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-muted py-10">{error}</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-sm text-muted py-10">Bu foydalanuvchida hali so'z yo'q</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted py-10">Hech narsa topilmadi</p>
          ) : (
            <div className="space-y-5">
              {filtered.map((cat) => (
                <div key={cat._id}>
                  <p className="text-[11px] text-accent uppercase tracking-[0.15em] font-semibold mb-2">
                    {cat.name} <span className="text-muted normal-case tracking-normal">· {cat.words.length}</span>
                  </p>
                  <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                    {cat.words.map((w) => (
                      <div key={w._id} className="px-4 py-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 hover:bg-bg/60 transition-colors">
                        <span className="font-medium text-primary">{w.word}</span>
                        {w.pronunciation && <span className="text-xs text-muted">{w.pronunciation}</span>}
                        <span className="text-muted text-xs">—</span>
                        <span className="text-sm text-muted">{(w.syns || []).join(', ') || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
