'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronsUpDown, Search, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

// Kategoriya boshqaruvi — ilgari 3 ta alohida elementga bo'lingan edi (dropdown +
// "Kategoriyalarni boshqarish" + "Yangi kategoriya"), endi bittasi: trigger bosilganda
// qidiruvli popover ochiladi, unda tanlash/qidirish/qayta nomlash/o'chirish/qo'shish —
// hammasi shu yerda (docs/VOCABLY_REDESIGN_SPEC.md §4.2'ga mos).
export default function CategorySwitcher() {
  const { categories, activeCatIndex, setActiveCatIndex, handleAddCategory, handleRenameCategory, handleDeleteCategory } =
    useApp();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [addingName, setAddingName] = useState('');
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const active = categories[activeCatIndex];
  const filtered = categories
    .map((c, i) => ({ ...c, i }))
    .filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setEditingIdx(null);
    setAddingName('');
    const t = setTimeout(() => searchRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectCategory = (i) => {
    setActiveCatIndex(i);
    setOpen(false);
  };

  const startEdit = (i, name) => {
    setEditingIdx(i);
    setEditingName(name);
  };

  const saveEdit = (e) => {
    e?.preventDefault();
    if (editingIdx === null || !editingName.trim()) return;
    handleRenameCategory(editingIdx, editingName);
    setEditingIdx(null);
  };

  const onAdd = (e) => {
    e?.preventDefault();
    if (!addingName.trim()) return;
    handleAddCategory(addingName);
    setAddingName('');
  };

  return (
    <div ref={rootRef} className="relative mb-6">
      <label className="block text-[10px] font-semibold text-accent uppercase tracking-wider mb-2">Kategoriyalar</label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={active?.name}
        aria-expanded={open}
        aria-controls="category-switcher-listbox"
        role="combobox"
        className="w-full flex items-center gap-2 px-3 py-2 bg-primary-hover border border-on-primary/10 rounded-lg text-sm text-on-primary outline-none hover:border-accent/50 transition-colors"
      >
        <span className="flex-1 min-w-0 truncate text-left">{active?.name || "Kategoriya yo'q"}</span>
        <span className="text-[10px] text-on-primary/50 flex-shrink-0">{active?.words?.length ?? 0} so'z</span>
        <ChevronsUpDown size={13} className="text-on-primary/40 flex-shrink-0" />
      </button>

      {open && (
        <div id="category-switcher-listbox" className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-surface border border-border rounded-xl shadow-card overflow-hidden">
          <div className="relative p-2 border-b border-border">
            <Search size={13} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kategoriya qidirish..."
              className="w-full pl-7 pr-2 py-1.5 bg-bg border border-border rounded-lg text-xs text-ink outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && <p className="text-center text-xs text-muted py-4">Topilmadi</p>}
            {filtered.map((c) =>
              editingIdx === c.i ? (
                <form key={c._id || c.i} onSubmit={saveEdit} className="flex gap-1.5 px-2 py-1">
                  <input
                    type="text"
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setEditingIdx(null)}
                    className="flex-1 min-w-0 px-2 py-1 bg-bg border border-accent/60 rounded text-xs text-ink outline-none"
                  />
                  <button type="submit" aria-label="Yangi nomni saqlash" className="p-1 bg-accent hover:bg-accent-hover rounded text-on-accent transition-colors flex-shrink-0">
                    <Check size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingIdx(null)}
                    aria-label="Nomini o'zgartirishni bekor qilish"
                    className="p-1 bg-bg hover:bg-primary-soft rounded text-muted transition-colors flex-shrink-0"
                  >
                    <X size={12} />
                  </button>
                </form>
              ) : (
                <div key={c._id || c.i} className={`flex items-center gap-1 px-2 py-1 group ${c.i === activeCatIndex ? 'bg-accent-soft' : 'hover:bg-bg'}`}>
                  <button onClick={() => selectCategory(c.i)} className="flex-1 min-w-0 flex items-center justify-between gap-2 py-1 text-left">
                    <span className="text-sm text-ink truncate">{c.name}</span>
                    <span className="text-[10px] text-muted flex-shrink-0">{c.words.length}</span>
                  </button>
                  <button
                    onClick={() => startEdit(c.i, c.name)}
                    title="Nomini o'zgartirish"
                    aria-label={`"${c.name}" nomini o'zgartirish`}
                    className="p-1 text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleDeleteCategory(c.i);
                    }}
                    title="O'chirish"
                    aria-label={`"${c.name}" kategoriyasini o'chirish`}
                    className="p-1 text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            )}
          </div>

          <form onSubmit={onAdd} className="flex gap-1.5 p-2 border-t border-border">
            <input
              type="text"
              value={addingName}
              onChange={(e) => setAddingName(e.target.value)}
              placeholder="Yangi kategoriya nomi"
              className="flex-1 min-w-0 px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs text-ink outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-accent hover:bg-accent-hover text-on-accent rounded-lg text-xs font-medium transition-colors flex-shrink-0"
            >
              <Plus size={13} /> Qo'shish
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
