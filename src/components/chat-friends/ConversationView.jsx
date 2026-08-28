'use client';
import { useEffect, useRef } from 'react';
import { ArrowLeft, ShieldOff, Loader2, Bell, BellOff } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import { formatLastSeen, isOnline, useLiveClock } from '@/lib/presence';
import { getJwtUserId } from '@/lib/jwtClient';
import MessageBubble from './MessageBubble';
import Composer from './Composer';

export default function ConversationView({ onBack }) {
  const {
    activeConversation,
    messages,
    loadingMessages,
    loadOlderMessages,
    blockUser,
    toggleMuteConversation,
    livePresence,
    typingByConversation,
  } = useChat();
  const { token: myToken } = useApp();
  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const prevLenRef = useRef(0);
  useLiveClock();

  useEffect(() => {
    if (messages.length > prevLenRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: prevLenRef.current === 0 ? 'auto' : 'smooth' });
    }
    prevLenRef.current = messages.length;
  }, [messages]);

  if (!activeConversation) {
    return <div className="hidden lg:flex flex-1 items-center justify-center text-sm text-muted">Suhbatni tanlang</div>;
  }

  const myId = getJwtUserId(myToken);
  const online = isOnline(activeConversation.otherUser?.lastActiveAt, livePresence[String(activeConversation.otherUser?.id)]);
  const isTyping = !!typingByConversation[activeConversation.id];
  const lastSeenText = formatLastSeen(activeConversation.otherUser?.lastActiveAt, livePresence[String(activeConversation.otherUser?.id)]);

  const handleScroll = () => {
    if (listRef.current && listRef.current.scrollTop < 40) loadOlderMessages();
  };

  // Javob (reply) iqtibosiga bosilganda original xabarga sirg'alib o'tadi va
  // uni bir lahza yoritib ko'rsatadi (Telegram uslubi) — agar xabar hali
  // yuklanmagan (eski, "oldingi xabarlar"da) bo'lsa, hech narsa qilmaydi.
  const jumpToMessage = (messageId) => {
    const el = listRef.current?.querySelector(`[data-msg-id="${messageId}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('chat-highlight');
    setTimeout(() => el.classList.remove('chat-highlight'), 1200);
  };

  const handleBlock = async () => {
    if (!confirm(`${activeConversation.otherUser?.username || 'Foydalanuvchi'}ni bloklaysizmi? Suhbat yopiladi.`)) return;
    await blockUser(activeConversation.otherUser.id);
  };

  const handleToggleMute = () => {
    toggleMuteConversation(activeConversation.id, !activeConversation.muted);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border flex-shrink-0">
        <button onClick={onBack} className="lg:hidden p-1 text-muted hover:text-primary">
          <ArrowLeft size={18} />
        </button>
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-bold">
            {(activeConversation.otherUser?.username || '?')[0]?.toUpperCase()}
          </div>
          {online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-surface" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary truncate">@{activeConversation.otherUser?.username}</p>
          {isTyping ? (
            <p className="text-[11px] text-accent italic truncate">yozmoqda...</p>
          ) : (
            lastSeenText && <p className="text-[11px] text-muted truncate">{lastSeenText}</p>
          )}
        </div>
        <button
          onClick={handleToggleMute}
          title={activeConversation.muted ? 'Bildirishnomani yoqish' : 'Bildirishnomani o\'chirish'}
          className="p-1.5 text-muted hover:text-accent transition-colors flex-shrink-0"
        >
          {activeConversation.muted ? <BellOff size={16} /> : <Bell size={16} />}
        </button>
        <button onClick={handleBlock} title="Bloklash" className="p-1.5 text-muted hover:text-accent transition-colors flex-shrink-0">
          <ShieldOff size={16} />
        </button>
      </div>

      <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {loadingMessages && (
          <div className="flex justify-center py-4">
            <Loader2 size={18} className="animate-spin text-muted" />
          </div>
        )}
        {!loadingMessages && messages.length === 0 && (
          <p className="text-center text-sm text-muted py-8">Hali xabar yo'q. Birinchi xabarni yozing!</p>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id || m._id}
            message={m}
            isMine={String(m.senderId) === String(myId)}
            myId={myId}
            onJumpToReply={jumpToMessage}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <Composer />
    </div>
  );
}
