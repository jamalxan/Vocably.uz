'use client';
import { useState, useEffect } from 'react';
import { Trash2, Menu, Loader2 } from 'lucide-react';
import { AppProvider, useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import FlashcardMode from '@/components/FlashcardMode';
import WritingTest from '@/components/WritingTest';
import MatchGame from '@/components/MatchGame';
import TestMode from '@/components/TestMode';
import SpeedQuiz from '@/components/SpeedQuiz';
import ListeningMode from '@/components/ListeningMode';
import SpacedRepetition from '@/components/SpacedRepetition';
import WordTable from '@/components/WordTable';
import AiChat from '@/components/AiChat';
import DashboardHome from '@/components/dashboard/DashboardHome';
import DoStlarPanel from '@/components/chat-friends/DoStlarPanel';

function DashboardContent() {
  const [view, setView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { loadingApp, activeCatIndex, activeCategory, handleDeleteCategory, chatAccess } = useApp();

  // Mobil ekranda bo'lim almashtirilganda drawer'ni yopamiz
  useEffect(() => {
    setSidebarOpen(false);
  }, [view]);

  if (loadingApp) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={28} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar view={view} setView={setView} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto w-full min-w-0">
        <header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              {/* Bosh sahifa kategoriyalararo umumiy ko'rinish, shuning uchun sarlavhada
                  bitta kategoriya nomini emas, oddiy salomlashuvni ko'rsatamiz. */}
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-display truncate">
                {view === 'home' ? 'Bosh sahifa' : view === 'friends' ? "Do'stlar" : activeCategory.name || "Kategoriya yo'q"}
              </h2>
              {/* A5 (docs/AUDIT_FINDINGS.md): "Bugungi takrorlash" barcha kategoriyalar bo'yicha
                  ishlaydi, shuning uchun bitta kategoriyaga tegishli so'z sonini shu yerda
                  ko'rsatish SpacedRepetition'dagi "navbatda" soni bilan ziddiyatli ko'rinardi. */}
              {view !== 'review' && view !== 'home' && view !== 'friends' && (
                <p className="text-xs text-slate-400 mt-0.5">Jami so'zlar: {activeCategory.words?.length || 0} ta</p>
              )}
            </div>
          </div>

          {view !== 'home' && view !== 'friends' && (
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => handleDeleteCategory(activeCatIndex)}
                className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors flex-shrink-0"
                title="Kategoriyani o'chirish"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </header>

        <div className={`p-4 sm:p-6 lg:p-8 w-full mx-auto flex-1 ${view === 'home' || view === 'friends' ? 'max-w-6xl' : 'max-w-4xl'}`}>
          <div className={view === 'home' ? '' : 'hidden'}>
            <DashboardHome setView={setView} setSidebarOpen={setSidebarOpen} />
          </div>
          <div className={view === 'cards' ? '' : 'hidden'}>
            <FlashcardMode />
          </div>
          <div className={view === 'write' ? '' : 'hidden'}>
            <WritingTest />
          </div>
          <div className={view === 'match' ? '' : 'hidden'}>
            <MatchGame />
          </div>
          <div className={view === 'test' ? '' : 'hidden'}>
            <TestMode />
          </div>
          <div className={view === 'speed' ? '' : 'hidden'}>
            <SpeedQuiz />
          </div>
          <div className={view === 'listening' ? '' : 'hidden'}>
            <ListeningMode />
          </div>
          <div className={view === 'review' ? '' : 'hidden'}>
            <SpacedRepetition />
          </div>
          <div className={view === 'table' ? '' : 'hidden'}>
            <WordTable />
          </div>
          <div className={view === 'ai' ? '' : 'hidden'}>
            <AiChat />
          </div>
          {chatAccess && (
            <div className={view === 'friends' ? '' : 'hidden'}>
              <DoStlarPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
