'use client';
import { useEffect, useState } from 'react';
import { X, Search, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ConfirmModal from '../ConfirmModal';
import IconButton from '../ui/IconButton';

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

export default function AllChatSessionsModal({ open, onClose, onSelect }) {
  const { chatSessions, currentSessionId, renameChatSession, deleteChatSession, deleteAllChatSessions } = useApp();

  const [query, setQuery] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  // Barchasini o'chirish ikki bosqichli: avval ogohlantirish paneli, keyin tasdiq modali.
  const [wipeStep, setWipeStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setRenamingId(null);
      setWipeStep(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = chatSessions.filter((s) => s.title.toLowerCase().includes(query.trim().toLowerCase()));
  const pendingDelete = chatSessions.find((s) => s.id === confirmDeleteId);

  const submitRename = (e) => {
    e?.preventDefault();
    if (renameValue.trim()) renameChatSession(renamingId, renameValue);
    setRenamingId(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="all-chat-sessions-title"
          className="bg-surface rounded-2xl shadow-premium border border-border w-full max-w-lg flex flex-col max-h-[min(80dvh,calc(100dvh-2rem))]"
        >
          <div className="flex items-center gap-3 pl-4 pr-2 py-2 border-b border-border flex-shrink-0">
            <h3 id="all-chat-sessions-title" className="font-bold text-ink font-display flex-1">
              Barcha suhbatlar <span className="text-muted font-normal text-sm">({chatSessions.length})</span>
            </h3>
            <IconButton icon={X} label="Yopish" size="lg" onClick={onClose} />
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="relative p-3 flex-shrink-0">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={15} />
            <input
              type="search"
              autoFocus
              placeholder="Suhbat nomi bo'yicha qidirish..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Suhbat qidirish"
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-base md:text-sm bg-surface outline-none focus:border-accent"
            />
          </form>

          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {filtered.length === 0 && (
              <p className="text-center text-xs text-muted py-8">Suhbat topilmadi</p>
            )}
            {filtered.map((s) => (
              <div
                key={s.id}
                className={`group flex items-center gap-1 lg:gap-2 rounded-lg pl-3 pr-1 lg:px-3 py-1 lg:py-2 transition-colors ${
                  currentSessionId === s.id ? 'bg-accent-soft' : 'hover:bg-bg'
                }`}
              >
                {renamingId === s.id ? (
                  <form onSubmit={submitRename} className="flex-1">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      aria-label="Suhbat nomi"
                      className="w-full px-2 py-1 border border-accent/30 rounded text-base md:text-sm bg-surface outline-none"
                    />
                  </form>
                ) : (
                  <>
                    <button onClick={() => onSelect?.(s.id)} className="flex-1 min-w-0 text-left">
                      <p
                        className={`truncate text-sm ${
                          currentSessionId === s.id ? 'text-accent font-semibold' : 'text-ink'
                        }`}
                      >
                        {s.title}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        {formatRelativeTime(s.updatedAt)} · {s.messageCount} ta xabar
                      </p>
                    </button>
                    <button
                      onClick={() => {
                        setRenamingId(s.id);
                        setRenameValue(s.title);
                      }}
                      className="min-w-11 min-h-11 lg:min-w-0 lg:min-h-0 p-1.5 flex items-center justify-center flex-shrink-0 text-muted hover:text-accent hover:bg-surface rounded opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      title="Nomini o'zgartirish"
                      aria-label="Suhbat nomini o'zgartirish"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(s.id)}
                      className="min-w-11 min-h-11 lg:min-w-0 lg:min-h-0 p-1.5 flex items-center justify-center flex-shrink-0 text-muted hover:text-accent hover:bg-surface rounded opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      title="O'chirish"
                      aria-label="Suhbatni o'chirish"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {chatSessions.length > 0 && (
            <div className="p-3 border-t border-border flex-shrink-0">
              {wipeStep === 0 ? (
                <button
                  onClick={() => setWipeStep(1)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-accent hover:bg-accent-soft border border-accent/25 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 size={13} /> Barcha suhbatlarni o'chirish
                </button>
              ) : (
                <div className="bg-danger-soft border border-danger/25 rounded-lg p-3">
                  <p role="alert" className="flex items-start gap-2 text-xs text-danger mb-3">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>
                      Barcha {chatSessions.length} ta suhbat butunlay o'chiriladi va tiklab bo'lmaydi.
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWipeStep(0)}
                      className="flex-1 py-2.5 md:py-2 bg-surface hover:bg-bg border border-border text-muted rounded-lg text-xs font-semibold transition-colors"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={() => setWipeStep(2)}
                      className="flex-1 py-2.5 md:py-2 bg-accent hover:bg-accent-hover text-on-accent rounded-lg text-xs font-semibold transition-colors"
                    >
                      Ha, hammasini o'chir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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

      <ConfirmModal
        open={wipeStep === 2}
        title="Barcha suhbatlarni o'chirish"
        message={`${chatSessions.length} ta suhbat butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi. Tasdiqlaysizmi?`}
        confirmLabel="Hammasini o'chirish"
        onConfirm={() => {
          deleteAllChatSessions();
          setWipeStep(0);
          onClose?.();
        }}
        onCancel={() => setWipeStep(0)}
      />
    </>
  );
}
