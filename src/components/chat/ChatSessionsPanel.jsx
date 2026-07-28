'use client';
import { useState } from 'react';
import { Plus, MoreVertical, Pencil, Trash2, X } from 'lucide-react';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'hozir';
  if (mins < 60) return `${mins} daq oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
}

export default function ChatSessionsPanel({
  open,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const startRename = (session) => {
    setRenamingId(session.id);
    setRenameValue(session.title);
    setMenuOpenId(null);
  };

  const submitRename = () => {
    if (renameValue.trim()) onRenameSession(renamingId, renameValue.trim());
    setRenamingId(null);
  };

  return (
    <>
      {open && (
        <div onClick={onClose} className="absolute inset-0 bg-slate-950/40 z-20 lg:hidden" />
      )}
      <div
        className={`absolute lg:relative inset-y-0 left-0 z-30 w-64 sm:w-72 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full lg:w-0 lg:border-0 lg:overflow-hidden'
        }`}
      >
        <div className="p-3 flex items-center gap-2 border-b border-slate-100 flex-shrink-0">
          <button
            onClick={onNewSession}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus size={14} /> Yangi suhbat
          </button>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-6">Hali suhbatlar yo'q</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => renamingId !== s.id && onSelectSession(s.id)}
              className={`group relative px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                currentSessionId === s.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              {renamingId === s.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitRename();
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  onBlur={submitRename}
                  className="w-full px-2 py-1 border border-indigo-300 rounded text-xs outline-none"
                />
              ) : (
                <>
                  <p className="truncate font-medium pr-6">{s.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatRelativeTime(s.updatedAt)}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === s.id ? null : s.id);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {menuOpenId === s.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-7 right-1.5 z-10 bg-white border border-slate-200 rounded-lg shadow-lg text-xs overflow-hidden w-32"
                    >
                      <button
                        onClick={() => startRename(s)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-600"
                      >
                        <Pencil size={12} /> Nomini o'zgartirish
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpenId(null);
                          onDeleteSession(s.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={12} /> O'chirish
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
