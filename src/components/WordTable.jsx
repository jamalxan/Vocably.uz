'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, Trash2, Search, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import Badge from './ui/Badge';
import ConfirmModal from './ConfirmModal';
import UndoToast from './UndoToast';
import AiErrorNotice from './ui/AiErrorNotice';

const UNDO_MS = 5000;

export default function WordTable() {
  const { activeCategory, handleAddWord, deleteWords, restoreWords, enrichWordsBatch } = useApp();
  const [newWord, setNewWord] = useState('');
  const [newSyns, setNewSyns] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmState, setConfirmState] = useState(null); // { ids, words }
  const [undoState, setUndoState] = useState(null); // { categoryId, words }
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);
  // TZ-vocably-v2.md §D5 (BUG-008): "mavjud 215+ so'zni AI bilan boyitish" — { done, total }
  // yoki null (ishlamayotgan bo'lsa). 10 tagacha so'z bitta so'rovda (enrich-batch), bir
  // vaqtda BATCH_CONCURRENCY ta so'rov parallel yuboriladi — 30 so'z ≈ 5 daqiqa o'rniga
  // ≈12-18 soniyaga tushadi.
  const [bulkEnrich, setBulkEnrich] = useState(null);
  // TZ-vocably-v2.md §D1 — avval AI xatolari shu yerda jimgina yutilib ketardi (foydalanuvchi
  // "ishlamayapti" deb o'ylardi, hech qanday izoh yo'q edi). Endi muvaffaqiyatsiz so'zlar
  // ro'yxati saqlanadi va tugagach ko'rsatiladi, "faqat xatolarni qayta urinish" bilan.
  const [bulkEnrichFailed, setBulkEnrichFailed] = useState([]); // [{ wordId, word, error, requestId }]
  const bulkCancelRef = useRef(false);
  const undoTimerRef = useRef(null);

  const words = activeCategory.words || [];
  const filtered = words
    .map((w, idx) => ({ ...w, idx }))
    .filter(
      (w) =>
        w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.syns.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  // Kategoriya almashganda tanlovni tozalaymiz.
  useEffect(() => {
    setSelectedIds([]);
    setBulkEnrichFailed([]);
  }, [activeCategory._id]);

  useEffect(() => () => clearTimeout(undoTimerRef.current), []);
  useEffect(() => () => { bulkCancelRef.current = true; }, []);

  const unenrichedWords = words.filter((w) => w._id && !w.enrichment?.aiEnrichedAt);

  const ENRICH_BATCH_SIZE = 10;
  const BATCH_CONCURRENCY = 3;

  const runBulkEnrich = async (targets) => {
    if (targets.length === 0) return;
    const categoryId = activeCategory._id;
    bulkCancelRef.current = false;
    const failed = [];
    let done = 0;
    setBulkEnrichFailed([]);
    setBulkEnrich({ done: 0, total: targets.length });

    const chunks = [];
    for (let i = 0; i < targets.length; i += ENRICH_BATCH_SIZE) chunks.push(targets.slice(i, i + ENRICH_BATCH_SIZE));

    const wordById = new Map(targets.map((w) => [w._id, w]));
    let nextChunkIdx = 0;

    // BATCH_CONCURRENCY ta "worker" bir vaqtda navbatdagi keyingi partiyani oladi —
    // shu tarzda hech qachon BATCH_CONCURRENCY dan ortiq so'rov bir vaqtda ochiq turmaydi.
    const runWorker = async () => {
      while (!bulkCancelRef.current) {
        const idx = nextChunkIdx++;
        if (idx >= chunks.length) return;
        const chunk = chunks[idx];
        // eslint-disable-next-line no-await-in-loop
        const results = await enrichWordsBatch(categoryId, chunk.map((w) => w._id));
        for (const r of results) {
          if (r.error) failed.push({ wordId: r.wordId, word: wordById.get(r.wordId)?.word || r.word, error: r.error, requestId: r.requestId });
        }
        done += chunk.length;
        setBulkEnrich({ done: Math.min(done, targets.length), total: targets.length });
      }
    };

    await Promise.all(Array.from({ length: Math.min(BATCH_CONCURRENCY, chunks.length) }, runWorker));

    setBulkEnrich(null);
    setBulkEnrichFailed(failed);
  };

  const startBulkEnrich = () => runBulkEnrich(unenrichedWords);
  const retryFailedEnrich = () => runBulkEnrich(words.filter((w) => bulkEnrichFailed.some((f) => f.wordId === w._id)));

  const stopBulkEnrich = () => {
    bulkCancelRef.current = true;
    setBulkEnrich(null);
  };

  const onAddWord = async (e) => {
    e?.preventDefault();
    if (!newWord.trim() || !newSyns.trim()) {
      setAddError("So'z va sinonim/tarjima maydonlari to'ldirilishi kerak");
      return;
    }
    setAddError('');
    setAdding(true);
    try {
      await handleAddWord(newWord, newSyns);
      setNewWord('');
      setNewSyns('');
    } finally {
      setAdding(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    const visibleIds = filtered.map((w) => w._id).filter(Boolean);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : visibleIds);
  };

  const requestDeleteSelected = () => {
    const targets = words.filter((w) => selectedIds.includes(w._id));
    setConfirmState({ ids: selectedIds, words: targets });
  };

  const requestDeleteSingle = (word) => {
    setConfirmState({ ids: [word._id], words: [word] });
  };

  const confirmDelete = async () => {
    const { ids, words: deletedWords } = confirmState;
    const categoryId = activeCategory._id;
    setConfirmState(null);
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));

    clearTimeout(undoTimerRef.current);
    await deleteWords(ids);

    setUndoState({ categoryId, words: deletedWords });
    undoTimerRef.current = setTimeout(() => setUndoState(null), UNDO_MS);
  };

  const handleUndo = async () => {
    clearTimeout(undoTimerRef.current);
    if (undoState) {
      await restoreWords(undoState.categoryId, undoState.words);
    }
    setUndoState(null);
  };

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((w) => w._id && selectedIds.includes(w._id));

  return (
    <div className="space-y-5 sm:space-y-6">
      <form
        onSubmit={onAddWord}
        className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-3"
      >
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-semibold text-muted uppercase mb-1">Yangi so'z</label>
            <input
              type="text"
              placeholder="Masalan: Start"
              value={newWord}
              onChange={(e) => {
                setNewWord(e.target.value);
                if (addError) setAddError('');
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-accent ${
                addError && !newWord.trim() ? 'border-red-300' : 'border-border'
              }`}
            />
          </div>
          <div className="flex-[2] w-full">
            <label className="block text-[10px] font-semibold text-muted uppercase mb-1">
              Sinonimlar / tarjima, vergul bilan
            </label>
            <input
              type="text"
              placeholder="Masalan: begin, commence, launch"
              value={newSyns}
              onChange={(e) => {
                setNewSyns(e.target.value);
                if (addError) setAddError('');
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-accent ${
                addError && !newSyns.trim() ? 'border-red-300' : 'border-border'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            {adding ? 'Qo\'shilmoqda...' : "Qo'shish"}
          </button>
        </div>
        {addError && <p className="text-xs text-red-600 font-medium">{addError}</p>}
      </form>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Qidiruv jonli filtrlaydi — Enter bosilganda sahifa yangilanib ketmasligi kerak. */}
        <form onSubmit={(e) => e.preventDefault()} className="relative flex-1">
          <Search className="absolute left-3 top-3 text-muted" size={16} />
          <input
            type="search"
            placeholder="So'z yoki tarjimalar bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-surface text-sm outline-none focus:border-accent"
          />
        </form>

        {unenrichedWords.length > 0 && (
          bulkEnrich ? (
            <button
              onClick={stopBulkEnrich}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent-soft text-accent border border-accent/25 rounded-xl text-sm font-semibold whitespace-nowrap"
            >
              <Sparkles size={14} className="animate-pulse" /> Boyitilmoqda {bulkEnrich.done}/{bulkEnrich.total} — to'xtatish
            </button>
          ) : (
            <button
              onClick={startBulkEnrich}
              title="Kategoriyadagi hali boyitilmagan so'zlarni AI bilan to'ldiradi (10 tadan partiyalarda, 3 tasi parallel)"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-surface hover:bg-accent-soft border border-border hover:border-accent/40 text-muted hover:text-accent rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <Sparkles size={14} /> Barchasini boyitish ({unenrichedWords.length})
            </button>
          )
        )}
      </div>

      {bulkEnrichFailed.length > 0 && (
        <AiErrorNotice
          error={`${bulkEnrichFailed.length} ta so'z boyitilmadi: ${bulkEnrichFailed[0].error}`}
          onRetry={retryFailedEnrich}
          className="mb-4"
        />
      )}

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-accent-soft border border-accent/15 rounded-xl px-4 py-3 text-sm">
          <span className="font-semibold text-accent">{selectedIds.length} ta so'z tanlandi</span>
          <div className="flex gap-2">
            <button
              onClick={requestDeleteSelected}
              className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-semibold transition-colors"
            >
              O'chirish
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-surface hover:bg-bg border border-border text-muted rounded-lg text-xs font-semibold transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[520px]">
            <thead>
              <tr className="bg-bg text-[10px] font-semibold text-muted uppercase tracking-wider border-b border-border">
                <th className="py-3 px-4 sm:px-6 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 sm:px-6 w-12">#</th>
                <th className="py-3 px-4 sm:px-6">So'z</th>
                <th className="py-3 px-4 sm:px-6">Sinonimlar / tarjimalar</th>
                <th className="py-3 px-4 sm:px-6 w-24">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w._id || w.idx} className="border-b border-border hover:bg-bg/50 text-sm">
                  <td className="py-3.5 px-4 sm:px-6">
                    <input
                      type="checkbox"
                      checked={w._id ? selectedIds.includes(w._id) : false}
                      onChange={() => w._id && toggleSelect(w._id)}
                      disabled={!w._id}
                      className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-muted font-mono text-xs">{w.idx + 1}</td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <Link
                      href={`/app/lugat/soz/${w._id}`}
                      className="font-semibold text-ink hover:text-accent hover:underline inline-flex items-center gap-1.5"
                    >
                      {w.word}
                      {w.enrichment?.aiEnrichedAt && (
                        <Sparkles size={11} className="text-accent flex-shrink-0" aria-label="AI bilan boyitilgan" />
                      )}
                      {w.enrichment?.cefr && <Badge tone="accent">{w.enrichment.cefr}</Badge>}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-muted">{w.syns.join(', ')}</td>
                  <td className="py-3.5 px-4 sm:px-6 flex gap-2">
                    <button
                      onClick={() => speakText(w.word)}
                      className="p-1.5 bg-accent-soft hover:bg-accent/20 text-accent rounded transition-colors"
                      title="Eshitish"
                      aria-label={`"${w.word}" so'zini eshitish`}
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      onClick={() => requestDeleteSingle(w)}
                      disabled={!w._id}
                      className="p-1.5 bg-accent-soft hover:bg-red-100 text-accent rounded transition-colors disabled:opacity-40"
                      title="O'chirish"
                      aria-label={`"${w.word}" so'zini o'chirish`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-muted">
                    Bu kategoriyada hali so'z yo'q.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmState}
        title="So'zlarni o'chirish"
        message={`${confirmState?.ids.length || 0} ta so'z o'chiriladi. Davom etasizmi?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmState(null)}
      />

      {undoState && (
        <UndoToast
          message={`${undoState.words.length} ta so'z o'chirildi`}
          onUndo={handleUndo}
        />
      )}
    </div>
  );
}
