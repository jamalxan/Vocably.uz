'use client';
import { useEffect, useRef, useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2, Search, X, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ConfirmModal from '../ConfirmModal';
import AllChatSessionsModal from './AllChatSessionsModal';

// Sidebar (asosiy navigatsiya)dan ajratilgan, faqat AI Chat ko'rinishi ichida yashaydigan
// mustaqil panel — ChatGPT-uslubidagi suhbatlar ro'yxati. Avval bu ro'yxat asosiy
// navigatsiya sidebar'ining akkordionida edi (boshqa bo'limlar bilan bir joyda,
// noqulay joylashuv); endi faqat AI Chat ochilganda ko'rinadi.
const VISIBLE_LIMIT = 20;

export default function AiChatSessionsPanel({ open, onCloseMobile }) {
  const { chatSessions, currentSessionId, openChatSession, startNewChatSession, renameChatSession, deleteChatSession } =
    useApp();

  const [query, setQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [allModalOpen, setAllModalOpen] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!menuOpenId) return;
    const onDocClick = (e) => {
      if (!listRef.current?.contains(e.target)) setMenuOpenId(null);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpenId]);

  if (!open) return null;

  const filtered = chatSessions.filter((s) => s.title.toLowerCase().includes(query.trim().toLowerCase()));
  const visible = filtered.slice(0, VISIBLE_LIMIT);
  const pendingDelete = chatSessions.find((s) => s.id === confirmDeleteId);

  const select = (id) => {
    openChatSession(id);
    onCloseMobile?.();
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
      {/* Mobilda panel ochiq bo'lganda orqa fon */}
      <div
        onClick={onCloseMobile}
        className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-30 lg:hidden"
      />

      <aside
        ref={listRef}
        className="fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-64 h-full bg-primary text-on-primary flex flex-col flex-shrink-0 border-r border-on-primary/10"
      >
        <div className="p-3.5 border-b border-on-primary/10 flex items-center gap-2">
          <Sparkles size={15} className="text-accent flex-shrink-0" />
          <h2 className="text-sm font-semibold flex-1">Suhbatlar</h2>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-on-primary/50 hover:text-on-primary rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3 space-y-2 border-b border-on-primary/10">
          <button
            onClick={() => {
              startNewChatSession();
              onCloseMobile?.();
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
                className="w-full pl-8 pr-2.5 py-1.5 bg-primary-hover border border-on-primary/10 rounded-lg text-xs text-on-primary outline-none focus:border-accent/50 transition-colors placeholder:text-on-primary/40"
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

          {visible.map((s) =>
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
                  className="w-full px-2.5 py-1.5 bg-primary-hover border border-accent rounded-lg text-xs text-on-primary outline-none"
                />
              </form>
            ) : (
              <div key={s.id} className="group relative">
                <button
                  onClick={() => select(s.id)}
                  title={s.title}
                  className={`w-full text-left pl-2.5 pr-8 py-2 rounded-lg text-xs truncate transition-colors ${
                    currentSessionId === s.id
                      ? 'bg-primary-hover text-on-primary font-medium'
                      : 'text-on-primary/60 hover:bg-primary-hover/60 hover:text-on-primary'
                  }`}
                >
                  {s.title}
                </button>
                <button
                  onClick={() => setMenuOpenId(menuOpenId === s.id ? null : s.id)}
                  className="absolute top-1/2 -translate-y-1/2 right-1.5 p-1 rounded text-on-primary/40 hover:text-on-primary hover:bg-primary-hover opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  title="Amallar"
                >
                  <MoreHorizontal size={13} />
                </button>

                {menuOpenId === s.id && (
                  <div className="absolute z-20 right-1.5 top-8 w-40 bg-primary-hover border border-on-primary/15 rounded-lg shadow-xl overflow-hidden text-[11px]">
                    <button
                      onClick={() => startRename(s)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-on-primary/70 hover:bg-primary hover:text-on-primary transition-colors"
                    >
                      <Pencil size={12} /> Nomini o'zgartirish
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpenId(null);
                        setConfirmDeleteId(s.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-accent hover:bg-primary transition-colors"
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
              className="w-full text-left px-2.5 py-2 rounded-lg text-[11px] text-accent hover:bg-primary-hover transition-colors"
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
