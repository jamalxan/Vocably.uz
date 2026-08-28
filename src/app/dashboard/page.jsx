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
import AiChatSessionsPanel from '@/components/chat/AiChatSessionsPanel';
import DashboardHome from '@/components/dashboard/DashboardHome';
import DoStlarPanel from '@/components/chat-friends/DoStlarPanel';
import NotificationBell from '@/components/NotificationBell';

function DashboardContent() {
  const [view, setView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // AI Chat'ga o'tilganda chap ustunda asosiy navigatsiya o'rniga suhbatlar ro'yxati
  // ko'rsatiladi (ikkalasi yonma-yon emas — bitta ustun, ikkita holat orasida almashadi).
  // Panelning o'zidagi strelka bosilganda asosiy navigatsiyaga qaytadi.
  const [aiSessionsPanelOpen, setAiSessionsPanelOpen] = useState(false);
  // Do'stlar bo'limida biror suhbat ochilganmi — mobil ekranda ikkita sarlavha
  // (tashqi sahifa header'i + ConversationView'ning o'z header'i, orqaga qaytish
  // strelkasi bilan) bir vaqtda ko'rinib, chat uchun tik joyni yeb qo'ymasligi
  // uchun shu holatda tashqi header mobil'da yashiriladi (pastga qarang).
  const [friendsChatOpen, setFriendsChatOpen] = useState(false);

  const { loadingApp, activeCatIndex, activeCategory, handleDeleteCategory, chatAccess, token } = useApp();

  // Mobil ekranda bo'lim almashtirilganda drawer'ni yopamiz
  useEffect(() => {
    setSidebarOpen(false);
    if (view !== 'friends') setFriendsChatOpen(false);
  }, [view]);

  const handleSetView = (v) => {
    setView(v);
    if (v === 'ai') setAiSessionsPanelOpen(true);
  };

  if (loadingApp) {
    return (
      <div className="flex items-center justify-center h-dvh bg-bg">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    // `h-dvh` (100vh EMAS) — mobil Chrome'da manzil paneli ochilib-yopilganda
    // yoki klaviatura chiqqanda 100vh o'zgarmay qoladi (dinamik emas), shuning
    // uchun Do'stlar bo'limining pastki qismi (Composer) qisman ekrandan tashqarida
    // qolib qolardi. `dvh` haqiqiy ko'rinadigan balandlikka moslashadi.
    <div className="flex h-dvh overflow-hidden bg-bg">
      {aiSessionsPanelOpen && view === 'ai' ? (
        <AiChatSessionsPanel
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onBack={() => setAiSessionsPanelOpen(false)}
        />
      ) : (
        <Sidebar view={view} setView={handleSetView} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto w-full min-w-0">
        <header
          className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-bg/90 backdrop-blur-md border-b border-border items-center justify-between gap-3 sticky top-0 z-10 ${
            friendsChatOpen ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-muted hover:bg-surface rounded-lg transition-colors flex-shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              {/* Bosh sahifa kategoriyalararo umumiy ko'rinish, shuning uchun sarlavhada
                  bitta kategoriya nomini emas, oddiy salomlashuvni ko'rsatamiz. */}
              <h2 className="text-lg sm:text-xl font-bold text-primary font-display truncate">
                {view === 'home'
                  ? 'Bosh sahifa'
                  : view === 'friends'
                    ? "Do'stlar"
                    : view === 'ai'
                      ? 'AI Chat'
                      : activeCategory.name || "Kategoriya yo'q"}
              </h2>
              {/* A5 (docs/AUDIT_FINDINGS.md): "Bugungi takrorlash" barcha kategoriyalar bo'yicha
                  ishlaydi, shuning uchun bitta kategoriyaga tegishli so'z sonini shu yerda
                  ko'rsatish SpacedRepetition'dagi "navbatda" soni bilan ziddiyatli ko'rinardi. */}
              {view !== 'review' && view !== 'home' && view !== 'friends' && view !== 'ai' && (
                <p className="text-xs text-muted mt-0.5">Jami so'zlar: {activeCategory.words?.length || 0} ta</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <NotificationBell token={token} onOpenFriends={() => handleSetView('friends')} />
            {view !== 'home' && view !== 'friends' && view !== 'ai' && (
              <button
                onClick={() => handleDeleteCategory(activeCatIndex)}
                className="p-2 border border-accent/25 hover:bg-accent-soft text-accent rounded-lg transition-colors flex-shrink-0"
                title="Kategoriyani o'chirish"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </header>

        {/* AI Chat va Do'stlar — to'liq balandlikdagi "ilova ichida ilova" ko'rinishidagi
            panellar. Bular sahifa ichida alohida ramka/karta bo'lib ajralib turmasligi
            uchun tashqi padding/max-width'siz, to'g'ridan-to'g'ri header ostida davom
            etadi (WhatsApp Web/Telegram Web uslubi — panelning o'zi "sahifa"). */}
        <div className={view === 'ai' || view === 'friends' ? 'flex-1 min-h-0 flex flex-col' : 'hidden'}>
          <div className={view === 'ai' ? 'flex-1 min-h-0' : 'hidden'}>
            <AiChat />
          </div>
          {chatAccess && (
            <div className={view === 'friends' ? 'flex-1 min-h-0' : 'hidden'}>
              <DoStlarPanel onActiveChange={setFriendsChatOpen} />
            </div>
          )}
        </div>

        <div className={`p-4 sm:p-6 lg:p-8 w-full mx-auto flex-1 ${view === 'home' ? 'max-w-6xl' : 'max-w-4xl'} ${view === 'ai' || view === 'friends' ? 'hidden' : ''}`}>
          <div className={view === 'home' ? '' : 'hidden'}>
            <DashboardHome setView={handleSetView} setSidebarOpen={setSidebarOpen} />
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
            <SpacedRepetition active={view === 'review'} />
          </div>
          <div className={view === 'table' ? '' : 'hidden'}>
            <WordTable />
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
