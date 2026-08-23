'use client';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Edit3,
  Grid,
  Home,
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
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import SidebarChatSessions from './chat/SidebarChatSessions';

const CHAT_ACCORDION_KEY = 'vocably.chatAccordionOpen';

const navItems = [
  { key: 'home', label: 'Bosh sahifa', icon: Home },
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

function navItemClass(active) {
  return `w-full flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-xl text-sm transition-all duration-200 relative ${
    active
      ? 'bg-gradient-to-r from-racing-700/90 to-racing-600/70 text-alabaster-50 font-medium shadow-admin-glow'
      : 'hover:bg-cherry-800/50 text-alabaster-500 hover:text-alabaster-100'
  }`;
}

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
    chatAccess,
    chatRole,
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-64 bg-gradient-to-b from-cherry-950 via-coffee-900 to-coffee-950 text-alabaster-300 flex flex-col justify-between border-r border-cherry-800/60 flex-shrink-0 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-5 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-racing-500 to-racing-800 rounded-lg flex items-center justify-center text-alabaster-50 font-bold text-lg font-display shadow-admin-glow">
                V
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-alabaster-50 tracking-wide font-display leading-tight">
                  Voc<span className="text-racing-400">ably</span>
                </h1>
                <p className="text-[10px] text-alabaster-600 leading-tight">Ingliz tili yordamchisi</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-alabaster-500 hover:text-alabaster-100 hover:bg-cherry-800/60 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-semibold text-gold-400 uppercase tracking-wider mb-2">
              Kategoriyalar
            </label>
            <select
              value={activeCatIndex}
              onChange={(e) => setActiveCatIndex(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-coffee-950/60 border border-cherry-800/60 rounded-lg text-sm text-alabaster-200 outline-none cursor-pointer focus:border-racing-600/70 transition-colors"
            >
              {categories.map((c, i) => (
                <option key={i} value={i}>
                  {c.name} ({c.words.length})
                </option>
              ))}
            </select>

            <button
              onClick={() => setManageOpen((v) => !v)}
              className="mt-2 w-full flex items-center justify-between px-2.5 py-1.5 bg-cherry-900/40 hover:bg-cherry-800/60 border border-cherry-800/60 rounded text-xs text-alabaster-500 hover:text-alabaster-100 transition-colors"
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
                        className="flex-1 min-w-0 px-2 py-1 bg-coffee-950/60 border border-racing-600/60 rounded text-xs text-alabaster-100 outline-none"
                      />
                      <button type="submit" className="p-1 bg-racing-600 hover:bg-racing-700 rounded text-alabaster-50 transition-colors">
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIdx(null)}
                        className="p-1 bg-cherry-900/60 hover:bg-cherry-800 rounded text-alabaster-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </form>
                  ) : (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-cherry-900/40 group"
                    >
                      <span className="flex-1 min-w-0 truncate text-xs text-alabaster-400">{c.name}</span>
                      <button
                        onClick={() => startEditCategory(i)}
                        title="Tahrirlash"
                        className="p-1 text-alabaster-600 hover:text-racing-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(i)}
                        title="O'chirish"
                        className="p-1 text-alabaster-600 hover:text-racing-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-cherry-900/40 hover:bg-cherry-800/60 border border-cherry-800/60 rounded text-xs text-alabaster-500 hover:text-alabaster-100 transition-colors"
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
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-coffee-950/50 border border-cherry-800/60 rounded text-xs text-alabaster-200 outline-none focus:border-racing-600/70"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-racing-600 hover:bg-racing-700 rounded text-alabaster-50 transition-colors"
                >
                  <Plus size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCat(false);
                    setNewCatName('');
                  }}
                  className="p-1.5 bg-cherry-900/60 hover:bg-cherry-800 rounded text-alabaster-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </form>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map(({ key, label, icon: Icon }) => {
              const isAi = key === 'ai';
              const active = view === key;
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
                    className={navItemClass(active)}
                  >
                    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-gold-400" />}
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

            {/* Do'stlar — yashirin bo'lim, faqat admin ruxsat bergan userlarga ko'rinadi
                (chatAccess src/app/api/chat/me'dan keladi, server tomonda ham tekshiriladi). */}
            {chatAccess && (
              <button
                onClick={() => {
                  setView('friends');
                  setSidebarOpen(false);
                }}
                className={navItemClass(view === 'friends')}
              >
                {view === 'friends' && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-gold-400" />}
                <Users size={16} />
                <span className="flex-1 text-left">Do'stlar</span>
              </button>
            )}

            {chatRole === 'admin' && (
              <a
                href="/admin"
                className="w-full flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-xl text-sm text-gold-400 hover:bg-cherry-800/50 hover:text-gold-300 transition-colors"
              >
                <ShieldCheck size={16} />
                <span className="flex-1 text-left">Admin panel</span>
              </a>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-cherry-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <div className="w-8 h-8 rounded-full bg-racing-500/15 border border-racing-600/30 text-racing-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="truncate">
              <p className="text-[10px] text-alabaster-600">Profil</p>
              <p className="text-sm font-semibold text-alabaster-200 truncate">{displayName}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-cherry-800/60 rounded text-alabaster-500 hover:text-racing-400 transition-colors flex-shrink-0"
            title="Chiqish"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
