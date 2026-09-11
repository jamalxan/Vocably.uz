'use client';
import { useEffect, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { getStoredAuthToken } from '../state/examStore';

// TZ-vocably-v2.md §11.3 / §19 Faza 3 item 18 — "Qo'shilgan so'zlar SRS
// tizimiga tushadi va 24 soatdan keyin kartochkada chiqadi. Bu sizning
// landing page'dagi 'so'z → ko'nikma zanjiri' va'dasini yopadi." Bu yerda
// FAQAT qo'shish (bir tarjima bilan) — to'liq AI boyitish (misol jumlalar,
// kollokatsiya, mnemonika) qasddan qilinmaydi: u allaqachon WordTable'da
// mavjud "Boyitish" oqimi (`/api/words/enrich`), so'z lug'atga tushgandan
// keyin foydalanuvchi o'sha yerdan normal ishlatadi — bu yerda ikkinchi
// marta qurilmaydi.
async function authedFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = getStoredAuthToken();
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
}

interface Category {
  _id: string;
  name: string;
}

export interface AddWordModalProps {
  word: string;
  context?: string;
  onClose: () => void;
}

export default function AddWordModal({ word, context, onClose }: AddWordModalProps) {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [synsText, setSynsText] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    authedFetch('/api/words')
      .then((r) => r.json())
      .then((data) => {
        const cats: Category[] = data.categories || [];
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0]._id);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    authedFetch('/api/words/suggest-translation', {
      method: 'POST',
      body: JSON.stringify({ word, context }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setPronunciation(data.pronunciation || '');
        setSynsText(Array.isArray(data.syns) ? data.syns.join(', ') : '');
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingSuggestion(false);
      });
    return () => {
      active = false;
    };
  }, [word, context]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = async () => {
    const syns = synsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!categoryId) {
      setError('Avval kategoriyani tanlang');
      return;
    }
    if (syns.length === 0) {
      setError('Kamida bitta tarjima kerak');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await authedFetch('/api/words/add', {
        method: 'POST',
        body: JSON.stringify({ categoryId, words: [{ word, syns }] }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      setTimeout(onClose, 900);
    } catch {
      setError("Qo'shib bo'lmadi, qayta urinib ko'ring");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-card border border-border p-5 sm:p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <p className="text-sm font-semibold text-ink text-center py-4">
            &quot;{word}&quot; lug&apos;atga qo&apos;shildi ✓
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-ink font-display">Lug&apos;atga qo&apos;shish</h3>
              <button onClick={onClose} className="text-muted hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <p className="text-lg font-bold text-brand-text mb-2">{word}</p>

            {loadingSuggestion && (
              <p className="text-xs text-muted flex items-center gap-1.5 mb-2">
                <Loader2 size={12} className="animate-spin" /> Tarjima taklif qilinmoqda...
              </p>
            )}
            <input
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              placeholder="Talaffuz (ixtiyoriy)"
              className="w-full mb-2 px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-accent italic"
            />
            <input
              value={synsText}
              onChange={(e) => setSynsText(e.target.value)}
              placeholder="Tarjimalar, vergul bilan"
              className="w-full mb-3 px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-accent"
            />

            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setCategoryId(c._id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      categoryId === c._id
                        ? 'bg-accent border-accent text-white'
                        : 'bg-surface border-border text-muted hover:border-accent/30'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            {categories && categories.length === 0 && (
              <p className="text-xs text-muted mb-3">Avval lug&apos;atda kategoriya yarating.</p>
            )}

            {error && <p className="text-xs text-danger mb-2">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting || !categories || categories.length === 0}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-semibold rounded-lg"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Qo&apos;shish
            </button>
          </>
        )}
      </div>
    </div>
  );
}
