'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, Plus, RotateCw, Volume2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useT } from '@/context/LocaleContext';

// TZ §22 — Reading matnidagi so'z bosilganda: ta'rif, tarjima, talaffuz, misol, "Lug'atga qo'shish", "Takrorlash".
// Foydalanuvchining o'z lug'ati indeksdan (bitta so'rov bilan yuklangan) darhol ko'rsatiladi; boshqa so'zlar uchun
// avval kutubxona (bepul), topilmasa AddWordModal'dagi AI taklifi ishlatiladi (u chaqirilganda, bu yerda emas).

export interface IndexWord {
  wordId: string;
  categoryId: string;
  word: string;
  translations: string[];
  definitionEn: string;
  example: string;
  pos: string;
  cefr: string;
  status: string;
  mastery: number;
  weak: boolean;
  due: boolean;
}

interface LibraryEntry {
  id: string;
  word: string;
  pos: string;
  cefr: string;
  translationUz: string;
  shortDefinition: string;
  ipaUk: string;
  examples: { en: string; uz?: string }[];
}

const STATUS_KEYS = ['new', 'learning', 'familiar', 'strong', 'advanced', 'mastered'];

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || '');
  return data;
}

function speak(word: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-GB';
    u.rate = 0.9;
    synth.speak(u);
  } catch {
    // audio ixtiyoriy
  }
}

export interface WordPopupCardProps {
  surface: string;
  owned: IndexWord | null;
  x: number;
  y: number;
  onClose: () => void;
  /** Lug'atda yo'q so'z uchun AI orqali qo'shish dialogini ochadi. */
  onOpenAddModal: () => void;
  /** Kutubxonadan/signaldan keyin indeksni yangilash (belgilash qayta chizilsin). */
  onChanged: () => void;
}

export default function WordPopupCard({ surface, owned, x, y, onClose, onOpenAddModal, onChanged }: WordPopupCardProps) {
  const { t, ts } = useT();
  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [loading, setLoading] = useState(!owned);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Lug'atda bo'lmasa — kutubxonadan qidiramiz (bepul).
  useEffect(() => {
    if (owned) return undefined;
    let active = true;
    setLoading(true);
    jsonFetch(`/api/vocabulary/lookup?word=${encodeURIComponent(surface)}`)
      .then((d) => active && setEntry(d.entry || null))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [surface, owned]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onDown = (e: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown, true);
    };
  }, [onClose]);

  const markKnown = async (correct: boolean) => {
    if (!owned) return;
    setBusy(true);
    setError('');
    try {
      await jsonFetch('/api/vocabulary/signal', {
        method: 'POST',
        body: JSON.stringify({ source: 'reading', items: [{ wordId: owned.wordId, correct }] }),
      });
      setMsg(correct ? t('wp.good') : t('wp.weakNote'));
      onChanged();
    } catch (e: any) {
      setError(ts(e.message) || t('wp.saveFail'));
    } finally {
      setBusy(false);
    }
  };

  const addFromLibrary = async () => {
    if (!entry) return;
    setBusy(true);
    setError('');
    try {
      const r = await jsonFetch('/api/vocabulary/library', { method: 'POST', body: JSON.stringify({ entryIds: [entry.id] }) });
      // "Reading'dan qo'shildi" hodisasi (mastery'ga ta'sir qilmaydi — `correct` yuborilmaydi).
      await jsonFetch('/api/vocabulary/signal', {
        method: 'POST',
        body: JSON.stringify({ source: 'reading', items: [{ word: entry.word, added: true }] }),
      }).catch(() => {});
      setAdded(true);
      setMsg(r.added ? t('wp.addedMsg') : t('wp.already'));
      onChanged();
    } catch (e: any) {
      setError(ts(e.message) || t('aw.addFail'));
    } finally {
      setBusy(false);
    }
  };

  const display = owned?.word || entry?.word || surface;
  const left = Math.min(Math.max(x, 160), (typeof window !== 'undefined' ? window.innerWidth : 800) - 160);
  const below = y < 260; // tepada joy kam bo'lsa — pastga ochiladi

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label={t('wp.aria', { word: display })}
      style={{ position: 'fixed', left, top: below ? y + 28 : Math.max(y - 8, 8), transform: below ? 'translateX(-50%)' : 'translate(-50%, -100%)' }}
      className="z-40 w-[min(20rem,calc(100vw-1.5rem))] bg-surface-2 border border-border rounded-2xl shadow-card p-4 text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg font-bold text-brand-text break-words leading-tight">{display}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-muted">
            {entry?.ipaUk && <span>{entry.ipaUk}</span>}
            {(owned?.pos || entry?.pos) && <span>{owned?.pos || entry?.pos}</span>}
            {(owned?.cefr || entry?.cefr) && <span className="font-semibold">{owned?.cefr || entry?.cefr}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 -mt-1 -mr-1">
          <button
            type="button"
            onClick={() => speak(display)}
            aria-label={t('wp.listen')}
            className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Volume2 size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('aw.close')}
            className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {owned ? (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-ink break-words">{owned.translations.join(', ') || '—'}</p>
          {owned.definitionEn && <p className="text-xs text-muted break-words">{owned.definitionEn}</p>}
          {owned.example && <p className="text-xs text-muted italic break-words">“{owned.example}”</p>}
          <p className="text-xs">
            <span className="font-semibold text-ink">{STATUS_KEYS.includes(owned.status) ? t(`wp.st.${owned.status}`) : owned.status}</span>
            <span className="text-muted"> · {owned.mastery}%</span>
            {owned.weak && <span className="ml-2 text-warning font-semibold">{t('wp.weak')}</span>}
            {owned.due && <span className="ml-2 text-accent font-semibold">{t('wp.due')}</span>}
          </p>
          {msg ? (
            <p role="status" className="text-xs text-success">{msg}</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={() => markKnown(true)} disabled={busy}>
                <Check size={14} aria-hidden="true" /> {t('wp.known')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => markKnown(false)} disabled={busy}>
                {t('wp.hard')}
              </Button>
              <Link href="/app/lugat/takrorlash" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-accent hover:underline min-h-11 md:min-h-0">
                <RotateCw size={14} aria-hidden="true" /> {t('wp.review')}
              </Link>
            </div>
          )}
        </div>
      ) : loading ? (
        <p className="text-xs text-muted flex items-center gap-1.5 mt-3">
          <Loader2 size={12} className="animate-spin" aria-hidden="true" /> {t('wp.searching')}
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {entry ? (
            <>
              <p className="text-sm text-ink break-words">{entry.translationUz}</p>
              {entry.shortDefinition && <p className="text-xs text-muted break-words">{entry.shortDefinition}</p>}
              {entry.examples?.[0]?.en && <p className="text-xs text-muted italic break-words">“{entry.examples[0].en}”</p>}
            </>
          ) : (
            <p className="text-xs text-muted">{t('wp.notFound')}</p>
          )}
          {msg && <p role="status" className="text-xs text-success">{msg}</p>}
          {!added && (
            <Button size="sm" onClick={entry ? addFromLibrary : onOpenAddModal} disabled={busy}>
              {busy ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
              {t('aw.title')}
            </Button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-danger mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
