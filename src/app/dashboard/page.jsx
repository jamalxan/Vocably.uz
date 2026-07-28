'use client';
import { useState, useEffect } from 'react';
import { Trash2, Menu, Loader2 } from 'lucide-react';
import { AppProvider, useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import FlashcardMode from '@/components/FlashcardMode';
import WritingTest from '@/components/WritingTest';
import MatchGame from '@/components/MatchGame';
import TestMode from '@/components/TestMode';
import ListeningMode from '@/components/ListeningMode';
import SpacedRepetition from '@/components/SpacedRepetition';
import WordTable from '@/components/WordTable';
import AiChat from '@/components/AiChat';

function DashboardContent() {
  const [view, setView] = useState('cards');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { loadingApp, activeCatIndex, activeCategory, handleDeleteCategory } = useApp();

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
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-display truncate">
                {activeCategory.name || "Kategoriya yo'q"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Jami so'zlar: {activeCategory.words?.length || 0} ta</p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => handleDeleteCategory(activeCatIndex)}
              className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors flex-shrink-0"
              title="Kategoriyani o'chirish"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto flex-1">
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
