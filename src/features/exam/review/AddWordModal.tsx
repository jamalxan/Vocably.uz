'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { useDialogFocus } from '../state/useDialogFocus';
import Button from '@/components/ui/Button';

// TZ-vocably-v2.md §11.3 / §19 Faza 3 item 18 — "Qo'shilgan so'zlar SRS
// tizimiga tushadi va 24 soatdan keyin kartochkada chiqadi. Bu sizning
// landing page'dagi 'so'z → ko'nikma zanjiri' va'dasini yopadi." Bu yerda
// FAQAT qo'shish (bir tarjima bilan) — to'liq AI boyitish (misol jumlalar,
// kollokatsiya, mnemonika) qasddan qilinmaydi: u allaqachon WordTable'da
// mavjud "Boyitish" oqimi (`/api/words/enrich`), so'z lug'atga tushgandan
// keyin foydalanuvchi o'sha yerdan normal ishlatadi — bu yerda ikkinchi
// marta qurilmaydi.
async function authedFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
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
  const [categoriesError, setCategoriesError] = useState(false);
  const [categoriesReload, setCategoriesReload] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [synsText, setSynsText] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const synsRef = useRef<HTMLInputElement>(null);
  const dialogRef = useDialogFocus<HTMLDivElement>(true, synsRef);

  useEffect(() => {
    let active = true;
    setCategoriesError(false);
    authedFetch('/api/words')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (!active) return;
        const cats: Category[] = data.categories || [];
        setCategories(cats);
        if (cats.length > 0) setCategoryId((cur) => cur || cats[0]._id);
      })
      .catch(() => {
        if (active) setCategoriesError(true);
      });
    return () => {
      active = false;
    };
  }, [categoriesReload]);

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="addword-title"
        className="bg-surface-2 rounded-2xl shadow-card border border-border p-5 sm:p-6 w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <p role="status" className="text-sm font-semibold text-ink text-center py-4 break-words">
            &quot;{word}&quot; lug&apos;atga qo&apos;shildi ✓
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 id="addword-title" className="font-bold text-ink font-display">Lug&apos;atga qo&apos;shish</h3>
              <button
                type="button"
                aria-label="Yopish"
                onClick={onClose}
                className="w-11 h-11 -m-2.5 flex items-center justify-center rounded-lg text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="text-lg font-bold text-brand-text mb-2 break-words">{word}</p>

            {loadingSuggestion && (
              <p className="text-xs text-muted flex items-center gap-1.5 mb-2">
                <Loader2 size={12} className="animate-spin" /> Tarjima taklif qilinmoqda...
              </p>
            )}
            <input
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              placeholder="Talaffuz (ixtiyoriy)"
              aria-label="Talaffuz (ixtiyoriy)"
              className="w-full mb-2 px-3 py-2 bg-surface text-ink border border-border rounded-lg text-base md:text-sm outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 italic"
            />
            <input
              ref={synsRef}
              value={synsText}
              onChange={(e) => setSynsText(e.target.value)}
              placeholder="Tarjimalar, vergul bilan"
              aria-label="Tarjimalar, vergul bilan"
              className="w-full mb-3 px-3 py-2 bg-surface text-ink border border-border rounded-lg text-base md:text-sm outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
            />

            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Kategoriya">
                {categories.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    aria-pressed={categoryId === c._id}
                    onClick={() => setCategoryId(c._id)}
                    className={`min-h-9 max-w-full truncate px-3 py-1.5 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      categoryId === c._id
                        ? 'bg-accent border-accent text-on-accent'
                        : 'bg-surface border-border text-muted hover:border-accent/30'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            {categoriesError && (
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-xs text-danger">Kategoriyalarni yuklab bo&apos;lmadi.</p>
                <button
                  type="button"
                  onClick={() => setCategoriesReload((n) => n + 1)}
                  className="min-h-9 px-2 text-xs font-semibold text-accent hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Qayta urinish
                </button>
              </div>
            )}
            {!categoriesError && categories && categories.length === 0 && (
              <p className="text-xs text-muted mb-3">Avval lug&apos;atda kategoriya yarating.</p>
            )}

            {error && <p className="text-xs text-danger mb-2">{error}</p>}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !categories || categories.length === 0}
              className="w-full"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Qo&apos;shish
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
