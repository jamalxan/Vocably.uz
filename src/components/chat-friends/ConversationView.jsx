'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ShieldOff, Loader2, Bell, BellOff, ArrowDown } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import { formatLastSeen, isOnline, useLiveClock } from '@/lib/presence';
import { getJwtUserId } from '@/lib/jwtClient';
import { TYPING_LABEL } from '@/lib/chatConstants';
import MessageBubble from './MessageBubble';
import Composer from './Composer';
import UserProfileModal from './UserProfileModal';

// Suhbat pastiga qanchalik yaqin bo'lsak ham "pastda" hisoblanadi — yangi xabar
// kelganda avtomatik pastga tushishni davom ettirish uchun (undan uzoqda bo'lsa
// esa faqat strelka/hisoblagich ko'rsatiladi, pastga zo'rlab surilmaydi).
const NEAR_BOTTOM_PX = 80;

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
  const prevLastIdRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  useLiveClock();

  const scrollToBottom = (behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
    isNearBottomRef.current = true;
    setIsNearBottom(true);
    setNewMessageCount(0);
  };

  // Har bir suhbat almashtirilganda hisob-kitob "toza sahifa"dan boshlanadi —
  // shuning uchun keyingi effekt buni "birinchi yuklanish" deb qabul qiladi
  // (pastga sirg'almasdan, darhol tushadi, hisoblagich bo'lmaydi).
  useEffect(() => {
    prevLenRef.current = 0;
    prevLastIdRef.current = null;
    isNearBottomRef.current = true;
    setIsNearBottom(true);
    setNewMessageCount(0);
  }, [activeConversation?.id]);

  // MUHIM: bu yerda ENDI xabarlar soni ko'paygani bilan ("length > prev") emas,
  // aynan OXIRGI xabar o'zgarganiga qarab qaror qilinadi — aks holda eski
  // xabarlarni yuqoriga yuklash (loadOlderMessages, ro'yxat BOSHIGA qo'shiladi)
  // ham "yangi xabar keldi" deb hisoblanib, foydalanuvchini eski xabarlarni
  // o'qiyotganda kutilmaganda pastga tashlab yuborardi.
  useEffect(() => {
    const last = messages[messages.length - 1];
    const lastId = last ? String(last.id || last._id) : null;

    if (prevLenRef.current === 0) {
      // Birinchi yuklanish (yoki suhbat almashtirilgan) — darhol (animatsiyasiz) pastga.
      scrollToBottom('auto');
    } else if (lastId && lastId !== prevLastIdRef.current) {
      // Ro'yxat oxiriga chindan ham yangi xabar qo'shildi.
      if (isNearBottomRef.current) {
        scrollToBottom('smooth');
      } else {
        setNewMessageCount((n) => n + 1);
      }
    }
    // aks holda — faqat boshiga eski xabar(lar) qo'shilgan, scroll holati
    // handleScroll ichida (loadOlderMessages atrofida) alohida saqlanadi.

    prevLenRef.current = messages.length;
    prevLastIdRef.current = lastId;
  }, [messages]);

  if (!activeConversation) {
    return <div className="hidden lg:flex flex-1 items-center justify-center text-sm text-muted">Suhbatni tanlang</div>;
  }

  const myId = getJwtUserId(myToken);
  const online = isOnline(activeConversation.otherUser?.lastActiveAt, livePresence[String(activeConversation.otherUser?.id)]);
  const typingKind = typingByConversation[activeConversation.id];
  const isTyping = !!typingKind;
  const lastSeenText = formatLastSeen(activeConversation.otherUser?.lastActiveAt, livePresence[String(activeConversation.otherUser?.id)]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < NEAR_BOTTOM_PX;
    isNearBottomRef.current = nearBottom;
    setIsNearBottom(nearBottom);
    if (nearBottom) setNewMessageCount(0);

    // Eski xabarlarni ro'yxat BOSHIGA yuklaydi — bu balandlikni o'zgartiradi,
    // shuning uchun yuklashdan oldingi scrollHeight/scrollTop saqlab qo'yilib,
    // yuklangandan keyin xuddi shu ko'rinish nuqtasi tiklanadi (foydalanuvchi
    // pastga uloqtirilmaydi). `loadingOlderRef` — bitta so'rov tugamasdan
    // ikkinchisi qo'zg'almasligi uchun.
    if (el.scrollTop < 40 && !loadingOlderRef.current) {
      loadingOlderRef.current = true;
      const prevHeight = el.scrollHeight;
      const prevTop = el.scrollTop;
      loadOlderMessages().finally(() => {
        requestAnimationFrame(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight - prevHeight + prevTop;
          }
          loadingOlderRef.current = false;
        });
      });
    }
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
        <button
          onClick={() => setProfileOpen(true)}
          className="min-w-0 flex-1 text-left"
          title="Foydalanuvchi haqida (taxallus, media)"
        >
          <p className="text-sm font-semibold text-primary truncate hover:underline">
            {activeConversation.otherUser?.nickname || `@${activeConversation.otherUser?.username}`}
          </p>
          {isTyping ? (
            <p className="text-[11px] text-accent italic truncate">{TYPING_LABEL[typingKind] || TYPING_LABEL.text}</p>
          ) : (
            lastSeenText && <p className="text-[11px] text-muted truncate">{lastSeenText}</p>
          )}
        </button>
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

      <div className="relative flex-1 min-h-0">
        <div ref={listRef} onScroll={handleScroll} className="h-full overflow-y-auto px-4 py-3 space-y-2.5">
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

        {/* Pastga tushish strelkasi — foydalanuvchi eski xabarlarni o'qish uchun
            yuqoriga sirg'algan bo'lsa chiqadi (pastda bo'lsa umuman ko'rinmaydi).
            Yangi xabar(lar) shu paytda kelsa, sonlar shu strelka ustida chiqadi. */}
        {!isNearBottom && (
          <button
            onClick={() => scrollToBottom('smooth')}
            title="Pastga tushish"
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-surface border border-border shadow-card flex items-center justify-center text-primary hover:text-accent hover:border-accent/40 transition-colors"
          >
            <ArrowDown size={18} />
            {newMessageCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-on-accent text-[10px] font-bold flex items-center justify-center">
                {newMessageCount > 99 ? '99+' : newMessageCount}
              </span>
            )}
          </button>
        )}
      </div>

      <Composer />

      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
