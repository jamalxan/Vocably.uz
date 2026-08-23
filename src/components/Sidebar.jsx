'use client';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Edit3,
  Grid,
  Home,
  Layers,
  Sparkles,
  X,
  LogOut,
  RotateCw,
  ListChecks,
  Headphones,
  Zap,
  ChevronRight,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import SidebarChatSessions from './chat/SidebarChatSessions';
import CategorySwitcher from './CategorySwitcher';

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
  return `w-full flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-xl text-sm transition-all duration-200 ${
    active ? 'bg-accent text-on-accent font-medium shadow-glow' : 'hover:bg-primary-hover text-on-primary/60 hover:text-on-primary'
  }`;
}

export default function Sidebar({ view, setView, sidebarOpen, setSidebarOpen }) {
  const { displayName, logout, triggerWriteReset, triggerMatchReshuffle, chatAccess, chatRole } = useApp();

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

  return (
    <>
      {/* Mobil uchun qorong'i fon (drawer ochiq bo'lganda) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-64 bg-primary text-on-primary flex flex-col justify-between flex-shrink-0 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-5 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-on-accent font-bold text-lg font-display shadow-glow">
                V
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-on-primary tracking-wide font-display leading-tight">
                  Voc<span className="text-accent">ably</span>
                </h1>
                <p className="text-[10px] text-on-primary/50 leading-tight">Ingliz tili yordamchisi</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-on-primary/60 hover:text-on-primary hover:bg-primary-hover rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <CategorySwitcher />

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
                <Users size={16} />
                <span className="flex-1 text-left">Do'stlar</span>
              </button>
            )}

            {chatRole === 'admin' && (
              <a
                href="/admin"
                className="w-full flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-xl text-sm text-accent hover:bg-primary-hover transition-colors"
              >
                <ShieldCheck size={16} />
                <span className="flex-1 text-left">Admin panel</span>
              </a>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-on-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
              {displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="truncate">
              <p className="text-[10px] text-on-primary/50">Profil</p>
              <p className="text-sm font-semibold text-on-primary truncate">{displayName}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-primary-hover rounded text-on-primary/60 hover:text-accent transition-colors flex-shrink-0"
            title="Chiqish"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
