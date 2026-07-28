'use client';
import { useState, useEffect } from 'react';
import { ImageIcon, Trash2, Menu, Loader2 } from 'lucide-react';
import { AppProvider, useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import FlashcardMode from '@/components/FlashcardMode';
import WritingTest from '@/components/WritingTest';
import MatchGame from '@/components/MatchGame';
import WordTable from '@/components/WordTable';
import AiChat from '@/components/AiChat';

function DashboardContent() {
  const [view, setView] = useState('cards');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const {
    loadingApp,
    categories,
    setCategories,
    activeCatIndex,
    activeCategory,
    token,
    syncData,
    handleDeleteCategory,
  } = useApp();

  // Mobil ekranda bo'lim almashtirilganda drawer'ni yopamiz
  useEffect(() => {
    setSidebarOpen(false);
  }, [view]);

  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOcrLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/ai/ocr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageBase64: reader.result }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Xatolik');

        if (data.words && data.words.length > 0) {
          const updated = categories.map((c, i) =>
            i === activeCatIndex ? { ...c, words: [...c.words, ...data.words] } : c
          );
          setCategories(updated);
          syncData(updated);
          alert(`${data.words.length} ta so'z "${activeCategory.name}" kategoriyasiga qo'shildi!`);
        } else {
          alert("Rasmdan so'z topilmadi. Aniqroq rasm bilan urinib ko'ring.");
        }
      } catch (err) {
        alert('Xatolik yuz berdi: ' + err.message);
      } finally {
        setOcrLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

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
            <label className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap">
              <ImageIcon size={14} />
              <span className="hidden sm:inline">{ocrLoading ? 'AI tahlil qilmoqda...' : 'AI import (rasmdan)'}</span>
              <span className="sm:hidden">{ocrLoading ? '...' : 'AI import'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleOcrUpload} disabled={ocrLoading} />
            </label>
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
