'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import IconButton from '../ui/IconButton';

// TZ-vocably-v2.md §D2.1 (BUG-007) — "Bu so'zni tushuntir" va boshqa AI tez-tugmalari
// avval AI'dan so'zni qo'lda yozib berishni so'rardi, holbuki foydalanuvchida allaqachon
// kategoriyalar/so'zlar bor edi. Bu komponent o'sha lug'atdan tanlab, AI'ga to'liq
// kontekst (tarjima, CEFR, SRS holati, xato soni) bilan yuboradigan modal.
const FILTERS = [
  { key: 'all', label: 'Hammasi' },
  { key: 'new', label: 'Yangi' },
  { key: 'hard', label: 'Qiyin' },
  { key: 'today', label: 'Bugungi' },
];

function isDue(word) {
  const next = word?.stats?.nextReview;
  return next ? new Date(next).getTime() <= Date.now() : true;
}

function isHard(word) {
  const stats = word?.stats;
  if (!stats) return false;
  return stats.isLeech || (stats.wrong || 0) > (stats.correct || 0);
}

function matchesFilter(word, filter) {
  if (filter === 'new') return (word.stats?.srsState || 'new') === 'new';
  if (filter === 'hard') return isHard(word);
  if (filter === 'today') return isDue(word);
  return true;
}

function srsBadge(word) {
  const state = word.stats?.srsState || 'new';
  if (state === 'new') return { label: 'yangi', tone: 'text-muted' };
  if (state === 'learning' || state === 'relearning') return { label: "o'rg.", tone: 'text-warning' };
  if (isDue(word)) return { label: 'bugungi', tone: 'text-danger' };
  return { label: 'bilg.', tone: 'text-success' };
}

// AI'ga (va Word Picker orqali chat inputiga) yuboriladigan to'liq kontekst —
// TZ-vocably-v2.md §D2.1 oxirgi paragrafi: word/translations/cefr/partOfSpeech/
// srsState/lastReviewedAt/mistakeCount.
export function toWordContext(word, category) {
  return {
    wordId: word._id,
    categoryId: category?._id,
    word: word.word,
    translations: word.syns || [],
    cefr: word.enrichment?.cefr || '',
    partOfSpeech: word.enrichment?.pos || '',
    srsState: word.stats?.srsState || 'new',
    lastReviewedAt: word.stats?.lastReviewed || null,
    mistakeCount: word.stats?.wrong || 0,
  };
}

export default function WordPicker({
  open,
  onClose,
  categories,
  defaultCategoryId,
  minSelect = 1,
  maxSelect = 30,
  title = "Lug'atdan so'z tanlash",
  onConfirm,
}) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId || categories?.[0]?._id || '');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [capHit, setCapHit] = useState(false);
  const searchRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    setCategoryId(defaultCategoryId || categories?.[0]?._id || '');
    setSearch('');
    setFilter('all');
    setSelectedIds([]);
    setCapHit(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Ochilganda fokus qidiruvga o'tadi, yopilganda avvalgi elementga qaytadi.
  // Escape capture fazasida ushlanadi — AiPanel'ning window tinglovchisi panelni yopmasin.
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    searchRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onCloseRef.current?.();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
    };
  }, [open]);

  const category = categories?.find((c) => c._id === categoryId);
  const words = useMemo(() => category?.words || [], [category]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return words.filter((w) => {
      if (!matchesFilter(w, filter)) return false;
      if (!q) return true;
      return w.word.toLowerCase().includes(q) || (w.syns || []).some((s) => s.toLowerCase().includes(q));
    });
  }, [words, search, filter]);

  if (!open) return null;

  const toggle = (id) => {
    if (!selectedIds.includes(id) && selectedIds.length >= maxSelect) {
      setCapHit(true);
      return;
    }
    setCapHit(false);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Boshqa kategoriyalarda tanlanganlar saqlanadi — faqat ko'rinayotganlar qo'shiladi.
  const selectAllFiltered = () => {
    setSelectedIds((prev) => {
      const merged = [...prev];
      for (const w of filtered) {
        if (merged.length >= maxSelect) break;
        if (!merged.includes(w._id)) merged.push(w._id);
      }
      return merged;
    });
  };

  // Tanlov kategoriya almashtirilganda ham saqlanadi, shuning uchun barcha kategoriyalardan yig'amiz.
  const handleConfirm = () => {
    const selectedWords = (categories || []).flatMap((c) =>
      (c.words || []).filter((w) => selectedIds.includes(w._id)).map((w) => toWordContext(w, c))
    );
    onConfirm(selectedWords);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-primary/40 backdrop-blur-sm p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="word-picker-title"
        className="w-full sm:max-w-lg bg-surface rounded-t-2xl sm:rounded-2xl border border-border shadow-xl flex flex-col max-h-[85dvh] sm:max-h-[calc(100dvh-2rem)] overflow-hidden"
      >
        <div className="flex items-center justify-between gap-2 pl-4 pr-2 py-1.5 border-b border-border flex-shrink-0">
          <h2 id="word-picker-title" className="text-sm font-bold text-ink min-w-0 truncate">
            {title}
          </h2>
          <IconButton icon={X} label="Yopish" size="lg" onClick={onClose} className="flex-shrink-0" />
        </div>

        <div className="p-4 space-y-3 flex-shrink-0 border-b border-border">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-label="Kategoriya"
            className="w-full px-3 py-2 border border-border rounded-lg text-base md:text-sm bg-bg outline-none focus:border-accent"
          >
            {(categories || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.words.length})
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-muted" size={15} />
            <input
              ref={searchRef}
              type="search"
              aria-label="So'z qidirish"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="So'z yoki tarjima bo'yicha qidirish..."
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-base md:text-sm outline-none focus:border-accent bg-bg"
            />
          </div>

          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`px-3 py-2 md:py-1 rounded-full text-xs font-semibold transition-colors ${
                  filter === f.key ? 'bg-accent text-on-accent' : 'bg-bg text-muted border border-border hover:border-accent/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 min-h-0">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted py-8">Mos so'z topilmadi</p>
          ) : (
            filtered.map((w) => {
              const badge = srsBadge(w);
              const checked = selectedIds.includes(w._id);
              return (
                <button
                  key={w._id}
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggle(w._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    checked ? 'bg-accent-soft' : 'hover:bg-bg'
                  }`}
                >
                  <span
                    className={`w-[18px] h-[18px] flex-shrink-0 rounded border flex items-center justify-center ${
                      checked ? 'bg-accent border-accent text-on-accent' : 'border-border-strong'
                    }`}
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-ink truncate">{w.word}</span>
                    <span className="block text-xs text-muted truncate">{(w.syns || []).join(', ')}</span>
                  </span>
                  <span className={`text-[11px] font-semibold uppercase flex-shrink-0 ${badge.tone}`}>{badge.label}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3 border-t border-border flex-shrink-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted min-w-0">
            <span aria-live="polite">
              Tanlandi: <strong className="text-ink">{selectedIds.length}</strong>
              {maxSelect < 999 ? ` / ${maxSelect}` : ''}
              {capHit && <span className="block text-warning">Ko&apos;pi bilan {maxSelect} ta</span>}
            </span>
            {filtered.length > 1 && (
              <button onClick={selectAllFiltered} className="text-accent hover:underline font-semibold">
                Hammasini tanlash
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3.5 py-2.5 md:py-2 text-sm font-semibold text-muted hover:text-ink rounded-lg">
              Bekor
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.length < minSelect}
              className="px-4 py-2.5 md:py-2 whitespace-nowrap bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent text-sm font-semibold rounded-lg transition-colors"
            >
              Qo'shish →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
