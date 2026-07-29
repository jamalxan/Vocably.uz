'use client';
import { useEffect, useRef, useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ConfirmModal from '../ConfirmModal';
import AllChatSessionsModal from './AllChatSessionsModal';

// Sidebar'da ko'rinadigan oxirgi suhbatlar soni; qolganlari "Barchasini ko'rish" modalida.
const VISIBLE_LIMIT = 15;

export default function SidebarChatSessions({ expanded, onOpenChat }) {
  const {
    chatSessions,
    currentSessionId,
    openChatSession,
    startNewChatSession,
    renameChatSession,
    deleteChatSession,
  } = useApp();

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [allModalOpen, setAllModalOpen] = useState(false);
  const listRef = useRef(null);

  // Ro'yxatdan tashqariga bosilganda "..." menyusini yopamiz.
  useEffect(() => {
    if (!menuOpenId) return;
    const onDocClick = (e) => {
      if (!listRef.current?.contains(e.target)) setMenuOpenId(null);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpenId]);

  const visible = chatSessions.slice(0, VISIBLE_LIMIT);
  const pendingDelete = chatSessions.find((s) => s.id === confirmDeleteId);

  const select = (id) => {
    openChatSession(id);
    onOpenChat?.();
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
      {expanded && (
        <div ref={listRef} className="mt-1 ml-4 pl-3 border-l border-slate-800 space-y-0.5">
          <button
            onClick={() => {
              startNewChatSession();
              onOpenChat?.();
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <Plus size={13} /> Yangi suhbat
          </button>

          {chatSessions.length === 0 && (
            <p className="px-2 py-1.5 text-[11px] text-slate-600">Hali suhbatlar yo'q</p>
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
                  className="w-full px-2 py-1 bg-slate-800 border border-indigo-500 rounded text-[11px] text-slate-100 outline-none"
                />
              </form>
            ) : (
              <div key={s.id} className="group relative">
                <button
                  onClick={() => select(s.id)}
                  title={s.title}
                  className={`w-full text-left pl-2 pr-7 py-1.5 rounded-md text-xs truncate transition-colors ${
                    currentSessionId === s.id
                      ? 'bg-slate-800 text-slate-100 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  {s.title}
                </button>
                <button
                  onClick={() => setMenuOpenId(menuOpenId === s.id ? null : s.id)}
                  className="absolute top-1/2 -translate-y-1/2 right-1 p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  title="Amallar"
                >
                  <MoreHorizontal size={13} />
                </button>

                {menuOpenId === s.id && (
                  <div className="absolute z-20 right-1 top-7 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden text-[11px]">
                    <button
                      onClick={() => startRename(s)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-700"
                    >
                      <Pencil size={12} /> Nomini o'zgartirish
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpenId(null);
                        setConfirmDeleteId(s.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-slate-700"
                    >
                      <Trash2 size={12} /> O'chirish
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {chatSessions.length > VISIBLE_LIMIT && (
            <button
              onClick={() => setAllModalOpen(true)}
              className="w-full text-left px-2 py-1.5 rounded-md text-[11px] text-indigo-400 hover:bg-slate-800 hover:text-indigo-300 transition-colors"
            >
              Barchasini ko'rish ({chatSessions.length})
            </button>
          )}
        </div>
      )}

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
