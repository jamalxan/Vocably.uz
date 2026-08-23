'use client';
import { useEffect, useRef } from 'react';
import { ArrowLeft, ShieldOff, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import MessageBubble from './MessageBubble';
import Composer from './Composer';

export default function ConversationView({ onBack }) {
  const { activeConversation, messages, loadingMessages, loadOlderMessages, blockUser } = useChat();
  const { token: myToken } = useApp();
  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevLenRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: prevLenRef.current === 0 ? 'auto' : 'smooth' });
    }
    prevLenRef.current = messages.length;
  }, [messages]);

  if (!activeConversation) {
    return <div className="hidden lg:flex flex-1 items-center justify-center text-sm text-muted">Suhbatni tanlang</div>;
  }

  const myId = jwtUserId(myToken);

  const handleScroll = () => {
    if (listRef.current && listRef.current.scrollTop < 40) loadOlderMessages();
  };

  const handleBlock = async () => {
    if (!confirm(`${activeConversation.otherUser?.username || 'Foydalanuvchi'}ni bloklaysizmi? Suhbat yopiladi.`)) return;
    await blockUser(activeConversation.otherUser.id);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border flex-shrink-0">
        <button onClick={onBack} className="lg:hidden p-1 text-muted hover:text-primary">
          <ArrowLeft size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
          {(activeConversation.otherUser?.username || '?')[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary truncate">@{activeConversation.otherUser?.username}</p>
        </div>
        <button onClick={handleBlock} title="Bloklash" className="p-1.5 text-muted hover:text-accent transition-colors">
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
          <MessageBubble key={m.id || m._id} message={m} isMine={String(m.senderId) === String(myId)} />
        ))}
        <div ref={bottomRef} />
      </div>

      <Composer />
    </div>
  );
}

// Token bevosita import qilinsa hook chaqiruv tartibiga ta'sir qilmasligi uchun
// oddiy funksiya sifatida — JWT payload'ini serverga so'rovsiz o'qiydi (faqat userId
// solishtirish uchun, imzoni tekshirmaydi — bu client-side, faqat "kim menman" UI belgisi).
function jwtUserId(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch {
    return null;
  }
}
