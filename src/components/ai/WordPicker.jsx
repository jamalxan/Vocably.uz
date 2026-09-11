'use client';
import { useEffect, useMemo, useState } from 'react';
import { X, Search, Check } from 'lucide-react';

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

  useEffect(() => {
    if (!open) return;
    setCategoryId(defaultCategoryId || categories?.[0]?._id || '');
    setSearch('');
    setFilter('all');
    setSelectedIds([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxSelect) return prev;
      return [...prev, id];
    });
  };

  const selectAllFiltered = () => {
    const ids = filtered.map((w) => w._id).slice(0, maxSelect);
    setSelectedIds(ids);
  };

  const handleConfirm = () => {
    const selectedWords = words.filter((w) => selectedIds.includes(w._id)).map((w) => toWordContext(w, category));
    onConfirm(selectedWords);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-surface rounded-t-2xl sm:rounded-2xl border border-border shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Yopish" className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-bg">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3 flex-shrink-0 border-b border-border">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg outline-none focus:border-accent"
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
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="So'z yoki tarjima bo'yicha qidirish..."
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-accent bg-bg"
            />
          </div>

          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filter === f.key ? 'bg-accent text-white' : 'bg-bg text-muted border border-border hover:border-accent/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 min-h-[160px]">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted py-8">Mos so'z topilmadi</p>
          ) : (
            filtered.map((w) => {
              const badge = srsBadge(w);
              const checked = selectedIds.includes(w._id);
              return (
                <button
                  key={w._id}
                  onClick={() => toggle(w._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    checked ? 'bg-accent-soft' : 'hover:bg-bg'
                  }`}
                >
                  <span
                    className={`w-4.5 h-4.5 flex-shrink-0 rounded border flex items-center justify-center ${
                      checked ? 'bg-accent border-accent text-white' : 'border-border-strong'
                    }`}
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-ink truncate">{w.word}</span>
                    <span className="block text-xs text-muted truncate">{(w.syns || []).join(', ')}</span>
                  </span>
                  <span className={`text-[10px] font-semibold uppercase flex-shrink-0 ${badge.tone}`}>{badge.label}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>
              Tanlandi: <strong className="text-ink">{selectedIds.length}</strong>
              {maxSelect < 999 ? ` / ${maxSelect}` : ''}
            </span>
            {filtered.length > 1 && (
              <button onClick={selectAllFiltered} className="text-accent hover:underline font-semibold">
                Hammasini tanlash
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3.5 py-2 text-sm font-semibold text-muted hover:text-ink rounded-lg">
              Bekor
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.length < minSelect}
              className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Qo'shish →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
