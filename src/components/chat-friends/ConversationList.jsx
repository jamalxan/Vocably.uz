'use client';
import { useRef, useState } from 'react';
import { Loader2, Wifi, WifiOff, BellOff, Trash2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { isOnline, useLiveClock, formatRelativeTime } from '@/lib/presence';
import { TYPING_LABEL } from '@/lib/chatConstants';
import UserSearchBar from './UserSearchBar';
import DeleteConversationModal from './DeleteConversationModal';
import Avatar from '@/components/avatar/Avatar';

// Uzoq bosish (long-press) uchun chegara — bundan qisqarog'i oddiy bosish
// (suhbatni ochish) hisoblanadi, uzunrog'i esa o'chirish menyusini chiqaradi
// (Telegram/WhatsApp mobil uslubi — "usernameni ustiga bosib turish").
const LONG_PRESS_MS = 500;

function ConversationRow({ c, selected, onSelect, onDeleteRequest, online, typing }) {
  const pressTimer = useRef(null);
  const longPressFired = useRef(false);

  const startPress = (e) => {
    // C-01 — uzoq-bosish faqat TEGIB (touch/pen) ishlatiladigan qurilmalarda
    // ishga tushsin. Sichqon bilan oddiy bosish ham `pointerdown` beradi —
    // agar bosish-qo'yib yuborish orasidagi vaqt (UI lag, sekin bosish)
    // 500ms'dan oshsa, sichqon useri buni sezmasdan "o'chirish" oynasini
    // ochib qo'yardi (o'chirish esa desktopda allaqachon 🗑 tugmasi va
    // o'ng-klik orqali mavjud — sichqon uchun long-press shart emas).
    if (e?.pointerType === 'mouse') return;
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

  // Qator — alohida <button> (Enter/Space, fokus halqasi tabiiy), o'chirish tugmasi esa
  // uning ICHIDA emas, yonida (ichma-ich interaktiv element bo'lmasin).
  return (
    <div
      className={`group relative flex items-center rounded-lg transition-colors ${
        selected ? 'bg-accent-soft' : 'hover:bg-bg'
      }`}
    >
      <button
        type="button"
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          onDeleteRequest(c);
        }}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        aria-current={selected ? 'true' : undefined}
        className="flex-1 min-w-0 flex items-center gap-2.5 pl-2.5 pr-1 lg:pr-2.5 py-2.5 rounded-lg text-left cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {/* Onlayn belgisi ramkasi qator foniga mos (`border-bg`) — 2026-09-10 so'rovi. */}
        <Avatar
          userId={c.otherUser?.id}
          photoId={c.otherUser?.photoId}
          name={c.otherUser?.nickname || c.otherUser?.name}
          username={c.otherUser?.username}
          size={44}
          online={online}
        />
        <span className="block min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 min-w-0">
              <span className={`block text-sm truncate ${c.unreadCount > 0 ? 'font-bold text-ink' : 'font-medium text-ink'}`}>
                {c.otherUser?.nickname || `@${c.otherUser?.username || 'noma\'lum'}`}
              </span>
              {c.muted && <BellOff size={11} className="text-muted flex-shrink-0" />}
            </span>
            {/* BUG-024: backend `lastMessageAt: null` qaytarishi mumkin (foydalanuvchi
                suhbatni tozalagan, hali yangi xabar kelmagan) — bunday holatda vaqt
                yorlig'i umuman ko'rsatilmaydi. */}
            {c.lastMessageAt && <span className="text-[11px] text-muted flex-shrink-0">{formatRelativeTime(c.lastMessageAt)}</span>}
          </span>
          <span className="flex items-center justify-between gap-2">
            {typing ? (
              <span className="block text-xs text-accent italic truncate">{TYPING_LABEL[typing] || TYPING_LABEL.text}</span>
            ) : (
              <span className={`block text-xs truncate ${c.unreadCount > 0 ? 'text-ink font-semibold' : 'text-muted'}`}>
                {c.lastMessagePreview || ''}
              </span>
            )}
            {c.unreadCount > 0 && (
              <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-on-accent text-[11px] font-bold flex items-center justify-center">
                {c.unreadCount > 99 ? '99+' : c.unreadCount}
              </span>
            )}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onDeleteRequest(c)}
        title="Suhbatni tozalash"
        aria-label="Suhbatni tozalash"
        className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 lg:w-auto lg:h-auto lg:p-1 lg:mr-2.5 rounded-lg text-muted hover:text-accent transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function ConversationList({ onSelect, selectedId }) {
  const {
    conversations,
    loadingConversations,
    conversationsError,
    loadConversations,
    socketConnected,
    deleteConversation,
    livePresence,
    typingByConversation,
  } = useChat();
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
    <div className="w-full lg:w-72 flex-shrink-0 border-r border-border flex flex-col h-full bg-surface">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="text-sm font-bold text-ink">Do'stlar</h3>
        <span
          role="status"
          title={socketConnected ? 'Onlayn' : 'Oflayn (yangilanish bilan)'}
          aria-label={socketConnected ? 'Onlayn' : 'Oflayn (yangilanish bilan)'}
          className="text-muted"
        >
          {socketConnected ? <Wifi size={13} className="text-success" /> : <WifiOff size={13} />}
        </span>
      </div>

      <UserSearchBar onOpen={() => {}} />

      {/* TZ-vocably-v2.md BUG-023 — `min-h-0` yo'q edi: flex-item standart bo'yicha
          o'z kontentidan qisqarmaydi (min-height:auto), shuning uchun ko'p suhbatli
          ro'yxat panelni majburan cho'zib yuborishi mumkin edi. */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-3">
        {loadingConversations && (
          <div className="flex justify-center py-6">
            <Loader2 size={18} className="animate-spin text-muted" />
          </div>
        )}
        {!loadingConversations && conversationsError && conversations.length === 0 && (
          <div className="text-center px-4 py-6">
            <p className="text-sm text-danger font-medium mb-2">Suhbatlarni yuklab bo'lmadi.</p>
            <button
              type="button"
              onClick={loadConversations}
              className="min-h-11 px-3 text-xs font-semibold text-accent hover:underline"
            >
              Qayta yuklash
            </button>
          </div>
        )}
        {!loadingConversations && !conversationsError && conversations.length === 0 && (
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
            online={
              c.otherUser?.showPresence !== false &&
              isOnline(c.otherUser?.lastActiveAt, livePresence[String(c.otherUser?.id)])
            }
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
