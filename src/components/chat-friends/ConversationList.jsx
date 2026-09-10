'use client';
import { useRef, useState } from 'react';
import { Loader2, Wifi, WifiOff, BellOff, Trash2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { isOnline, useLiveClock } from '@/lib/presence';
import { TYPING_LABEL } from '@/lib/chatConstants';
import UserSearchBar from './UserSearchBar';
import DeleteConversationModal from './DeleteConversationModal';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'hozir';
  if (mins < 60) return `${mins}d`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}s`;
  return `${Math.floor(hours / 24)}kun`;
}

// Uzoq bosish (long-press) uchun chegara — bundan qisqarog'i oddiy bosish
// (suhbatni ochish) hisoblanadi, uzunrog'i esa o'chirish menyusini chiqaradi
// (Telegram/WhatsApp mobil uslubi — "usernameni ustiga bosib turish").
const LONG_PRESS_MS = 500;

function ConversationRow({ c, selected, onSelect, onDeleteRequest, online, typing }) {
  const pressTimer = useRef(null);
  const longPressFired = useRef(false);

  const startPress = () => {
    longPressFired.current = false;
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onDeleteRequest(c);
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => clearTimeout(pressTimer.current);

  const handleClick = () => {
    // Uzoq bosish allaqachon o'chirish oynasini ochgan bo'lsa — shu bosishni
    // "suhbatni ochish" sifatida qayta ishlatmaymiz.
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    onSelect(c);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect(c);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onDeleteRequest(c);
      }}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      className={`group w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-colors cursor-pointer select-none ${
        selected ? 'bg-accent-soft' : 'hover:bg-bg'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-bold">
          {(c.otherUser?.username || '?')[0]?.toUpperCase()}
        </div>
        {/* Onlayn belgisi — 2026-09-10 so'rovi: avval `border-surface` edi, lekin bu
            qator haqiqatda `bg-bg` fonida turadi (ConversationList'ning o'zi alohida
            fon bermaydi) — mos kelmagan ramka nuqtani "kesib olingan" his qildirmay,
            xira ko'rsatardi. Endi to'g'ri fon (`border-bg`) + semantik `success` rang. */}
        {online && (
          <span
            title="Onlayn"
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-bg"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 min-w-0">
            <p className={`text-sm truncate ${c.unreadCount > 0 ? 'font-bold text-ink' : 'font-medium text-ink'}`}>
              {c.otherUser?.nickname || `@${c.otherUser?.username || 'noma\'lum'}`}
            </p>
            {c.muted && <BellOff size={11} className="text-muted flex-shrink-0" />}
          </span>
          <span className="text-[10px] text-muted flex-shrink-0">{timeAgo(c.lastMessageAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          {typing ? (
            <p className="text-xs text-accent italic truncate">{TYPING_LABEL[typing] || TYPING_LABEL.text}</p>
          ) : (
            <p className={`text-xs truncate ${c.unreadCount > 0 ? 'text-ink font-semibold' : 'text-muted'}`}>
              {c.lastMessagePreview || ''}
            </p>
          )}
          {c.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-on-accent text-[10px] font-bold flex items-center justify-center">
              {c.unreadCount > 99 ? '99+' : c.unreadCount}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRequest(c);
        }}
        title="Suhbatni tozalash"
        aria-label="Suhbatni tozalash"
        className="p-1 text-muted hover:text-accent transition-colors flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function ConversationList({ onSelect, selectedId }) {
  const { conversations, loadingConversations, socketConnected, deleteConversation, livePresence, typingByConversation } =
    useChat();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  useLiveClock();

  const handleConfirmDelete = async (forEveryone) => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteConversation(deleteTarget.id, forEveryone);
    setDeleting(false);
    if (res.error) alert(res.error);
    else setDeleteTarget(null);
  };

  return (
    <div className="w-full lg:w-72 flex-shrink-0 border-r border-border flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="text-sm font-bold text-ink">Do'stlar</h3>
        <span title={socketConnected ? 'Onlayn' : 'Oflayn (yangilanish bilan)'} className="text-muted">
          {socketConnected ? <Wifi size={13} className="text-emerald-500" /> : <WifiOff size={13} />}
        </span>
      </div>

      <UserSearchBar onOpen={() => {}} />

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {loadingConversations && (
          <div className="flex justify-center py-6">
            <Loader2 size={18} className="animate-spin text-muted" />
          </div>
        )}
        {!loadingConversations && conversations.length === 0 && (
          <p className="text-center text-xs text-muted px-4 py-6">
            Hozircha suhbat yo'q. Yuqoridan username qidirib, yozishni boshlang.
          </p>
        )}
        {conversations.map((c) => (
          <ConversationRow
            key={c.id}
            c={c}
            selected={String(selectedId) === String(c.id)}
            onSelect={onSelect}
            onDeleteRequest={setDeleteTarget}
            online={isOnline(c.otherUser?.lastActiveAt, livePresence[String(c.otherUser?.id)])}
            typing={typingByConversation[c.id]}
          />
        ))}
      </div>

      <DeleteConversationModal
        open={!!deleteTarget}
        otherUsername={deleteTarget?.otherUser?.username}
        onConfirm={deleting ? undefined : handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
