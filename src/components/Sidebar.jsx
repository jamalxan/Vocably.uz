'use client';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Edit3,
  Grid,
  Layers,
  Sparkles,
  Plus,
  X,
  LogOut,
  RotateCw,
  ListChecks,
  Headphones,
  Zap,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import SidebarChatSessions from './chat/SidebarChatSessions';

const CHAT_ACCORDION_KEY = 'vocably.chatAccordionOpen';

const navItems = [
  { key: 'cards', label: 'Kartochka', icon: Layers },
  { key: 'write', label: 'Yozish testi', icon: Edit3 },
  { key: 'match', label: 'Juftlikni topish', icon: Grid },
  { key: 'test', label: 'Test', icon: ListChecks },
  { key: 'speed', label: 'Tezkor o\'yin', icon: Zap },
  { key: 'listening', label: 'Tinglab yozish', icon: Headphones },
  { key: 'review', label: 'Bugungi takrorlash', icon: RotateCw },
  { key: 'table', label: 'Jadval', icon: BookOpen },
  { key: 'ai', label: 'AI Chat', icon: Sparkles },
];

export default function Sidebar({ view, setView, sidebarOpen, setSidebarOpen }) {
  const {
    categories,
    activeCatIndex,
    setActiveCatIndex,
    displayName,
    logout,
    handleAddCategory,
    handleRenameCategory,
    handleDeleteCategory,
    triggerWriteReset,
    triggerMatchReshuffle,
  } = useApp();

  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editingName, setEditingName] = useState('');
  // Suhbatlar ro'yxati default yopiq; ochiq/yopiq holati localStorage'da eslab qolinadi.
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    setChatOpen(localStorage.getItem(CHAT_ACCORDION_KEY) === '1');
  }, []);

  const toggleChatAccordion = () => {
    setChatOpen((prev) => {
      localStorage.setItem(CHAT_ACCORDION_KEY, prev ? '0' : '1');
      return !prev;
    });
  };

  const onAddCategory = (e) => {
    e?.preventDefault();
    if (!newCatName.trim()) return;
    handleAddCategory(newCatName);
    setNewCatName('');
    setShowAddCat(false);
  };

  const startEditCategory = (idx) => {
    setEditingIdx(idx);
    setEditingName(categories[idx]?.name || '');
  };

  const saveEditCategory = (e) => {
    e?.preventDefault();
    if (editingIdx === null) return;
    handleRenameCategory(editingIdx, editingName);
    setEditingIdx(null);
    setEditingName('');
  };

  return (
    <>
      {/* Mobil uchun qorong'i fon (drawer ochiq bo'lganda) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 flex-shrink-0 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-5 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-lg font-display shadow-lg shadow-indigo-900/40">
                V
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white tracking-wide font-display leading-tight">
                  Voc<span className="text-indigo-400">ably</span>
                </h1>
                <p className="text-[10px] text-slate-500 leading-tight">Ingliz tili yordamchisi</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Kategoriyalar
            </label>
            <select
              value={activeCatIndex}
              onChange={(e) => setActiveCatIndex(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 outline-none cursor-pointer focus:border-indigo-500"
            >
              {categories.map((c, i) => (
                <option key={i} value={i}>
                  {c.name} ({c.words.length})
                </option>
              ))}
            </select>

            <button
              onClick={() => setManageOpen((v) => !v)}
              className="mt-2 w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>Kategoriyalarni boshqarish</span>
              <ChevronRight size={12} className={`transition-transform ${manageOpen ? 'rotate-90' : ''}`} />
            </button>

            {manageOpen && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {categories.map((c, i) =>
                  editingIdx === i ? (
                    <form key={i} onSubmit={saveEditCategory} className="flex gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setEditingIdx(null);
                        }}
                        className="flex-1 min-w-0 px-2 py-1 bg-slate-800 border border-indigo-500 rounded text-xs text-slate-100 outline-none"
                      />
                      <button type="submit" className="p-1 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition-colors">
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIdx(null)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </form>
                  ) : (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800/70 group"
                    >
                      <span className="flex-1 min-w-0 truncate text-xs text-slate-300">{c.name}</span>
                      <button
                        onClick={() => startEditCategory(i)}
                        title="Tahrirlash"
                        className="p-1 text-slate-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(i)}
                        title="O'chirish"
                        className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {!showAddCat ? (
              <button
                onClick={() => setShowAddCat(true)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Plus size={13} /> Yangi kategoriya
              </button>
            ) : (
              <form onSubmit={onAddCategory} className="flex gap-2 mt-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nomi (masalan: Words 2)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowAddCat(false);
                  }}
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-xs outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCat(false);
                    setNewCatName('');
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </form>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map(({ key, label, icon: Icon }) => {
              const isAi = key === 'ai';
              return (
                <div key={key}>
                  <button
                    onClick={() => {
                      setView(key);
                      triggerWriteReset();
                      if (key === 'match') triggerMatchReshuffle();
                      // "AI Chat" bosilganda chat ekrani ochiladi VA suhbatlar ro'yxati yig'iladi/ochiladi.
                      if (isAi) toggleChatAccordion();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-lg text-sm transition-colors ${
                      view === key
                        ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-900/40'
                        : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="flex-1 text-left">{label}</span>
                    {isAi && (
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${chatOpen ? 'rotate-90' : ''}`}
                      />
                    )}
                  </button>

                  {isAi && (
                    <SidebarChatSessions
                      expanded={chatOpen}
                      onOpenChat={() => {
                        setView('ai');
                        setSidebarOpen(false);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="truncate">
              <p className="text-[10px] text-slate-500">Profil</p>
              <p className="text-sm font-semibold text-slate-300 truncate">{displayName}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
            title="Chiqish"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
