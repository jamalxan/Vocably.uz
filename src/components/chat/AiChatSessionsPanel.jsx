'use client';
import { useEffect, useRef, useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2, Search, ArrowLeft, Sparkles, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import IconButton from '../ui/IconButton';
import ConfirmModal from '../ConfirmModal';
import AllChatSessionsModal from './AllChatSessionsModal';

// AI Chat sahifasining (src/app/app/ai/page.jsx) o'z ichidagi suhbatlar ro'yxati —
// ChatGPT-uslubida. AppShell'ning asosiy navigatsiyasidan mustaqil: endi har bir
// bo'lim haqiqiy URL'ga ega bo'lgani uchun (U3 tuzatildi) bu panel navigatsiyani
// almashtirmaydi, faqat sahifa ichidagi ikkinchi ustun. `onBack` shu sabab endi
// ixtiyoriy — berilmasa strelka ko'rsatilmaydi.
const VISIBLE_LIMIT = 20;

export default function AiChatSessionsPanel({ sidebarOpen, setSidebarOpen, onBack }) {
  const { chatSessions, currentSessionId, openChatSession, startNewChatSession, renameChatSession, deleteChatSession } =
    useApp();

  const [query, setQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [allModalOpen, setAllModalOpen] = useState(false);
  const listRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Mobil drawer: ochilganda fokus "Yopish"ga o'tadi, Escape yopadi, yopilganda fokus qaytadi.
  useEffect(() => {
    if (!sidebarOpen) return;
    const prevFocus = document.activeElement;
    closeBtnRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
    };
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    if (!menuOpenId) return;
    const onDocClick = (e) => {
      if (!listRef.current?.contains(e.target)) setMenuOpenId(null);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpenId]);

  const filtered = chatSessions.filter((s) => s.title.toLowerCase().includes(query.trim().toLowerCase()));
  const visible = filtered.slice(0, VISIBLE_LIMIT);
  const pendingDelete = chatSessions.find((s) => s.id === confirmDeleteId);

  // Mobilda suhbat tanlanganda faqat drawer yopiladi (chat ko'rinsin) — asosiy
  // navigatsiyaga qaytish emas, shuning uchun onBack emas, setSidebarOpen(false).
  const select = (id) => {
    openChatSession(id);
    setSidebarOpen(false);
  };

  const startRename = (session) => {
    setRenamingId(session.id);
    setRenameValue(session.title);
    setMenuOpenId(null);
  };

  const submitRename = (e) => {
    e?.preventDefault();
    if (renameValue.trim()) renameChatSession(renamingId, renameValue);
    setRenamingId(null);
  };

  return (
    <>
      {/* Mobilda drawer ochiq bo'lganda orqa fon (Sidebar bilan bir xil naqsh) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        ref={listRef}
        role={sidebarOpen ? 'dialog' : undefined}
        aria-modal={sidebarOpen ? 'true' : undefined}
        aria-label="Suhbatlar"
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[min(18rem,85vw)] lg:w-64 bg-primary text-on-primary flex flex-col flex-shrink-0 border-r border-on-primary/10 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-3.5 border-b border-on-primary/10 flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              title="Orqaga"
              className="p-1.5 -ml-1.5 text-on-primary/60 hover:text-on-primary hover:bg-primary-hover rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <Sparkles size={15} className="text-accent flex-shrink-0" />
          <h2 className="text-sm font-semibold flex-1">Suhbatlar</h2>
          {sidebarOpen && (
            <IconButton
              ref={closeBtnRef}
              icon={X}
              label="Yopish"
              variant="ghost-on-primary"
              size="lg"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden -my-2 -mr-2"
            />
          )}
        </div>

        <div className="p-3 space-y-2 border-b border-on-primary/10">
          <button
            onClick={() => {
              startNewChatSession();
              setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover text-on-accent rounded-lg text-sm font-semibold transition-colors shadow-glow"
          >
            <Plus size={15} /> Yangi suhbat
          </button>

          {chatSessions.length > 5 && (
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-primary/40 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suhbat qidirish..."
                aria-label="Suhbat qidirish"
                className="w-full pl-8 pr-2.5 py-1.5 bg-primary-hover border border-on-primary/10 rounded-lg text-base md:text-xs text-on-primary outline-none focus:border-accent/50 transition-colors placeholder:text-on-primary/40"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {chatSessions.length === 0 && (
            <p className="px-2.5 py-2 text-xs text-on-primary/40">Hali suhbatlar yo'q</p>
          )}
          {chatSessions.length > 0 && filtered.length === 0 && (
            <p className="px-2.5 py-2 text-xs text-on-primary/40">Topilmadi</p>
          )}

          {visible.map((s, idx) =>
            renamingId === s.id ? (
              <form key={s.id} onSubmit={submitRename} className="px-1 py-0.5">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={submitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  aria-label="Suhbat nomi"
                  className="w-full px-2.5 py-1.5 bg-primary-hover border border-accent rounded-lg text-base md:text-xs text-on-primary outline-none"
                />
              </form>
            ) : (
              <div key={s.id} className="group relative">
                <button
                  onClick={() => select(s.id)}
                  title={s.title}
                  className={`w-full text-left pl-2.5 pr-12 lg:pr-8 py-3 lg:py-2 rounded-lg text-xs truncate transition-colors ${
                    currentSessionId === s.id
                      ? 'bg-primary-hover text-on-primary font-medium'
                      : 'text-on-primary/60 hover:bg-primary-hover/60 hover:text-on-primary'
                  }`}
                >
                  {s.title}
                </button>
                <button
                  onClick={() => setMenuOpenId(menuOpenId === s.id ? null : s.id)}
                  className="absolute top-1/2 -translate-y-1/2 right-0 lg:right-1.5 min-w-11 min-h-11 lg:min-w-0 lg:min-h-0 p-1 flex items-center justify-center rounded text-on-primary/60 lg:text-on-primary/40 hover:text-on-primary hover:bg-primary-hover opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  title="Amallar"
                  aria-label="Suhbat amallari"
                  aria-haspopup="menu"
                  aria-expanded={menuOpenId === s.id}
                >
                  <MoreHorizontal size={13} />
                </button>

                {menuOpenId === s.id && (
                  <div
                    className={`absolute z-20 right-1.5 w-44 bg-primary-hover border border-on-primary/15 rounded-lg shadow-xl overflow-hidden text-xs lg:text-[11px] ${
                      // Ro'yxat oxiridagi qatorlarda menyu yuqoriga ochiladi (scroll ichida kesilmasin).
                      visible.length > 3 && idx >= visible.length - 2 ? 'bottom-full mb-0.5' : 'top-full mt-0.5'
                    }`}
                  >
                    <button
                      onClick={() => startRename(s)}
                      className="w-full flex items-center gap-2 px-3 py-3 lg:py-2 text-on-primary/70 hover:bg-primary hover:text-on-primary transition-colors"
                    >
                      <Pencil size={12} /> Nomini o'zgartirish
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpenId(null);
                        setConfirmDeleteId(s.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-3 lg:py-2 text-accent hover:bg-primary transition-colors"
                    >
                      <Trash2 size={12} /> O'chirish
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {filtered.length > VISIBLE_LIMIT && (
            <button
              onClick={() => setAllModalOpen(true)}
              className="w-full text-left px-2.5 py-3 lg:py-2 rounded-lg text-[11px] text-accent hover:bg-primary-hover transition-colors"
            >
              Barchasini ko'rish ({chatSessions.length})
            </button>
          )}
        </div>
      </aside>

      <ConfirmModal
        open={!!pendingDelete}
        title="Suhbatni o'chirish"
        message="Bu suhbat o'chiriladi. Davom etasizmi?"
        onConfirm={() => {
          deleteChatSession(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <AllChatSessionsModal
        open={allModalOpen}
        onClose={() => setAllModalOpen(false)}
        onSelect={(id) => {
          setAllModalOpen(false);
          select(id);
        }}
      />
    </>
  );
}
