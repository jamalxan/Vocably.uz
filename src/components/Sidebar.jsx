'use client';
import { useState } from 'react';
import { BookOpen, Edit3, Grid, Layers, Sparkles, Plus, X, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const navItems = [
  { key: 'cards', label: 'Kartochka', icon: Layers },
  { key: 'write', label: 'Yozish testi', icon: Edit3 },
  { key: 'match', label: 'Juftlikni topish', icon: Grid },
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
    triggerWriteReset,
    triggerMatchReshuffle,
  } = useApp();

  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const onAddCategory = () => {
    handleAddCategory(newCatName);
    setNewCatName('');
    setShowAddCat(false);
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
                S
              </div>
              <h1 className="text-lg font-bold text-white tracking-wide font-display">
                Sinonimlar <span className="text-indigo-400">AI</span>
              </h1>
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

            {!showAddCat ? (
              <button
                onClick={() => setShowAddCat(true)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Plus size={13} /> Yangi kategoriya
              </button>
            ) : (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nomi (masalan: Words 2)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onAddCategory();
                    if (e.key === 'Escape') setShowAddCat(false);
                  }}
                  className="flex-1 px-2.5 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-xs outline-none focus:border-indigo-500"
                />
                <button
                  onClick={onAddCategory}
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => {
                    setShowAddCat(false);
                    setNewCatName('');
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setView(key);
                  triggerWriteReset();
                  if (key === 'match') triggerMatchReshuffle();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-lg text-sm transition-colors ${
                  view === key
                    ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-900/40'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
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
