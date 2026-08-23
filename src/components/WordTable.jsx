'use client';
import { useState, useRef, useEffect } from 'react';
import { Volume2, Trash2, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import ConfirmModal from './ConfirmModal';
import UndoToast from './UndoToast';

const UNDO_MS = 5000;

export default function WordTable() {
  const { activeCategory, handleAddWord, deleteWords, restoreWords } = useApp();
  const [newWord, setNewWord] = useState('');
  const [newSyns, setNewSyns] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmState, setConfirmState] = useState(null); // { ids, words }
  const [undoState, setUndoState] = useState(null); // { categoryId, words }
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
  }, [activeCategory._id]);

  useEffect(() => () => clearTimeout(undoTimerRef.current), []);

  const onAddWord = (e) => {
    e?.preventDefault();
    handleAddWord(newWord, newSyns);
    setNewWord('');
    setNewSyns('');
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
        className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-end"
      >
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-semibold text-muted uppercase mb-1">Yangi so'z</label>
          <input
            type="text"
            placeholder="Masalan: Start"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-accent"
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
            onChange={(e) => setNewSyns(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm transition-colors whitespace-nowrap"
        >
          Qo'shish
        </button>
      </form>

      {/* Qidiruv jonli filtrlaydi — Enter bosilganda sahifa yangilanib ketmasligi kerak. */}
      <form onSubmit={(e) => e.preventDefault()} className="relative">
        <Search className="absolute left-3 top-3 text-muted" size={16} />
        <input
          type="search"
          placeholder="So'z yoki tarjimalar bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-surface text-sm outline-none focus:border-accent"
        />
      </form>

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
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-primary">{w.word}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-muted">{w.syns.join(', ')}</td>
                  <td className="py-3.5 px-4 sm:px-6 flex gap-2">
                    <button
                      onClick={() => speakText(w.word)}
                      className="p-1.5 bg-accent-soft hover:bg-accent/20 text-accent rounded transition-colors"
                      title="Eshitish"
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      onClick={() => requestDeleteSingle(w)}
                      disabled={!w._id}
                      className="p-1.5 bg-accent-soft hover:bg-red-100 text-accent rounded transition-colors disabled:opacity-40"
                      title="O'chirish"
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
