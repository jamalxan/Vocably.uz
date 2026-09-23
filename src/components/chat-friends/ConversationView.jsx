'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ShieldOff, Bell, BellOff, UserCheck, ArrowDown } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import { formatLastSeen, isOnline, useLiveClock } from '@/lib/presence';
import { TYPING_LABEL } from '@/lib/chatConstants';
import MessageBubble from './MessageBubble';
import Composer from './Composer';
import UserProfileModal from './UserProfileModal';
import ConfirmModal from '@/components/ConfirmModal';

// Sarlavhadagi ikonka-tugmalar: mobil'da 44px (manfiy margin bilan zichlik saqlanadi), md+ da avvalgidek.
const HEADER_BTN =
  'inline-flex items-center justify-center w-11 h-11 -my-1.5 md:w-auto md:h-auto md:my-0 md:p-1.5 rounded-lg transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

// Suhbat pastiga qanchalik yaqin bo'lsak ham "pastda" hisoblanadi — yangi xabar
// kelganda avtomatik pastga tushishni davom ettirish uchun (undan uzoqda bo'lsa
// esa faqat strelka/hisoblagich ko'rsatiladi, pastga zo'rlab surilmaydi).
// C-05 — 80px'dan 120px'ga oshirildi: strelka pastki chekkaga yaqinroq bo'lgan
// ("deyarli pastda") holatlarda ham chiqavermasin — u ko'p hollarda aynan shu
// paytda ko'rinib turgan oxirgi pufakcha ustiga tushardi.
const NEAR_BOTTOM_PX = 120;

const UZ_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr',
];

// C-06 — xabarlar orasidagi kun ajratgichi: "Bugun" / "Kecha" / "15-sentyabr"
// (joriy yildan boshqa yil bo'lsa yil ham qo'shiladi).
function formatDaySeparator(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Bugun';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Kecha';
  const label = `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}`;
  return d.getFullYear() === now.getFullYear() ? label : `${label} ${d.getFullYear()}`;
}

function DaySeparator({ label }) {
  return (
    <div className="flex items-center justify-center py-1.5 select-none">
      <span className="px-2.5 py-1 rounded-full bg-surface-2 text-muted text-[11px] font-medium">{label}</span>
    </div>
  );
}

export default function ConversationView({ onBack }) {
  const {
    activeConversation,
    messages,
    loadingMessages,
    messagesError,
    retryLoadMessages,
    loadOlderMessages,
    blockUser,
    toggleMuteConversation,
    toggleNotifyOnline,
    livePresence,
    typingByConversation,
  } = useChat();
  const { chatUserId: myId } = useApp();
  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const prevLenRef = useRef(0);
  const prevLastIdRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
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
      // C-04 — birinchi yuklanishda ENG PASTGA emas, birinchi o'qilmagan xabarga
      // (bo'lsa) sirg'aladi, aks holda (hammasi o'qilgan) avvalgidek eng pastga.
      // "O'qilmagan" — boshqa tomon yuborgan va hali `readAt`siz xabarlar (GET
      // /messages javobi shu holatni aks ettiradi — o'qilgan deb belgilash
      // fon rejimida, javob QAYTARILGANDAN keyin sodir bo'ladi, src/app/api/chat/
      // conversations/[id]/messages/route.js GET izohiga qarang).
      const unread = messages.filter((m) => String(m.senderId) !== String(myId) && !m.readAt);
      const firstUnread = unread[0];
      const firstUnreadId = firstUnread ? String(firstUnread.id || firstUnread._id) : null;
      const el = firstUnreadId ? listRef.current?.querySelector(`[data-msg-id="${firstUnreadId}"]`) : null;
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
        requestAnimationFrame(() => {
          const listEl = listRef.current;
          if (!listEl) return;
          const distanceFromBottom = listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight;
          const nearBottom = distanceFromBottom < NEAR_BOTTOM_PX;
          isNearBottomRef.current = nearBottom;
          setIsNearBottom(nearBottom);
          // C-05 — strelka ustidagi son: bu yerda "yangi kelgan" emas, "hali
          // o'qilmagan" sonini ko'rsatadi (near-bottom bo'lsa strelka umuman
          // ko'rinmaydi, shuning uchun bu holatda 0 qoldiriladi).
          setNewMessageCount(nearBottom ? 0 : unread.length);
        });
      } else {
        // O'qilmagan yo'q (yoki topilmadi) — avvalgidek darhol (animatsiyasiz) pastga.
        scrollToBottom('auto');
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, myId]);

  if (!activeConversation) {
    return <div className="hidden lg:flex flex-1 items-center justify-center text-sm text-muted">Suhbatni tanlang</div>;
  }

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
    setBlockOpen(false);
    const res = await blockUser(activeConversation.otherUser.id);
    if (res?.error) alert(res.error);
  };

  const handleToggleMute = () => {
    toggleMuteConversation(activeConversation.id, !activeConversation.muted);
  };

  const handleToggleNotifyOnline = () => {
    toggleNotifyOnline(activeConversation.id, !activeConversation.notifyOnline);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-surface">
      <div className="flex items-center gap-1 md:gap-2.5 px-4 py-3 border-b border-border flex-shrink-0">
        <button onClick={onBack} aria-label="Suhbatlar ro'yxatiga qaytish" className={`lg:hidden -ml-2.5 md:ml-0 text-muted hover:text-ink ${HEADER_BTN}`}>
          <ArrowLeft size={18} />
        </button>
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-bold">
            {(activeConversation.otherUser?.username || '?')[0]?.toUpperCase()}
          </div>
          {online && (
            <span title="Onlayn" className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-bg" />
          )}
        </div>
        <button
          onClick={() => setProfileOpen(true)}
          className="min-w-0 flex-1 text-left ml-1.5 md:ml-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Foydalanuvchi haqida (taxallus, media)"
        >
          <p className="text-sm font-semibold text-ink truncate hover:underline">
            {activeConversation.otherUser?.nickname || `@${activeConversation.otherUser?.username}`}
          </p>
          {isTyping ? (
            <p className="text-[11px] text-accent italic truncate">{TYPING_LABEL[typingKind] || TYPING_LABEL.text}</p>
          ) : (
            lastSeenText && <p className="text-[11px] text-muted truncate">{lastSeenText}</p>
          )}
        </button>
        <button
          onClick={handleToggleNotifyOnline}
          title={
            activeConversation.notifyOnline
              ? "Onlayn bo'lganda Telegram orqali xabar berishni o'chirish"
              : "Onlayn bo'lganda Telegram bot orqali xabar ber"
          }
          aria-label={
            activeConversation.notifyOnline
              ? "Onlayn bo'lganda Telegram orqali xabar berishni o'chirish"
              : "Onlayn bo'lganda Telegram bot orqali xabar ber"
          }
          className={`${HEADER_BTN} ${activeConversation.notifyOnline ? 'text-accent' : 'text-muted hover:text-accent'}`}
        >
          {/* Wifi ikonkasi ro'yxatda "ulanish holati" ma'nosida — bu yerda boshqa ikonka. */}
          <UserCheck size={16} />
        </button>
        <button
          onClick={handleToggleMute}
          title={activeConversation.muted ? 'Bildirishnomani yoqish' : 'Bildirishnomani o\'chirish'}
          aria-label={activeConversation.muted ? 'Bildirishnomani yoqish' : 'Bildirishnomani o\'chirish'}
          className={`${HEADER_BTN} text-muted hover:text-accent`}
        >
          {activeConversation.muted ? <BellOff size={16} /> : <Bell size={16} />}
        </button>
        <button onClick={() => setBlockOpen(true)} title="Bloklash" aria-label="Foydalanuvchini bloklash" className={`${HEADER_BTN} text-muted hover:text-danger`}>
          <ShieldOff size={16} />
        </button>
      </div>

      {/* TZ-vocably-v2.md BUG-026 — dark rejimda xabarlar sohasi "ichkarida" hissini
          berishi uchun bg-bg-sunken (§E2); avval alohida fon yo'q edi, sahifa foni bilan
          bir xil ko'rinardi. */}
      <div className="relative flex-1 min-h-0 bg-bg-sunken">
        {/* C-05 — pastki bo'shliq (pb-16) ataylab: pastga tushish strelkasi shu
            konteynerning bottom-right burchagida (ekranga nisbatan) suzib turadi;
            xabarlar oqimida shu bo'shliq bo'lmasa, suhbatning ENG OXIRGI xabari
            aynan strelka joylashgan burchakka to'g'ri kelib, strelka uning ustini
            yopib qo'yardi. */}
        <div ref={listRef} onScroll={handleScroll} className="h-full overflow-y-auto px-4 pt-3 pb-16 space-y-2.5">
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            // C-06 — kun ajratgichi: ketma-ket ikkita xabar boshqa-boshqa kunga
            // tegishli bo'lsa (yoki bu ro'yxatdagi birinchi xabar bo'lsa) oralarida.
            const showDaySeparator =
              !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
            return (
              <div key={m.id || m._id || m.clientMessageId}>
                {showDaySeparator && <DaySeparator label={formatDaySeparator(m.createdAt)} />}
                <MessageBubble
                  message={m}
                  isMine={String(m.senderId) === String(myId)}
                  myId={myId}
                  onJumpToReply={jumpToMessage}
                />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* TZ-vocably-v2.md §E3/BUG-029 + BUG-4 (chat UI audit) — skeleton/xato/bo'sh
            holatlar endi scroll konteyneri ICHIDA emas (avval tepada "osilib" qolardi,
            ko'p xabar bo'lganda hech qachon ko'rinmasdi ham) — mutlaq joylashuv bilan
            markazga olib chiqilgan, `messages` bo'sh bo'lganda (yoki hali yuklanayotganda/
            xato bo'lganda) ko'rinadi. */}
        {(loadingMessages || messagesError || messages.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            {loadingMessages && (
              <div className="w-full max-w-xs space-y-2.5 animate-pulse" aria-label="Yuklanmoqda">
                <div className="h-10 w-2/3 rounded-2xl bg-surface-2" />
                <div className="h-10 w-1/2 rounded-2xl bg-accent-soft ml-auto" />
                <div className="h-10 w-3/5 rounded-2xl bg-surface-2" />
              </div>
            )}
            {!loadingMessages && messagesError && (
              <div className="text-center">
                <p className="text-sm text-danger font-medium mb-2">Xabarlarni yuklab bo'lmadi.</p>
                <button onClick={retryLoadMessages} className="text-xs font-semibold text-accent hover:underline">
                  Qayta yuklash
                </button>
              </div>
            )}
            {!loadingMessages && !messagesError && messages.length === 0 && (
              <p className="text-center text-sm text-muted">Hali xabar yo'q. Birinchi xabarni yozing!</p>
            )}
          </div>
        )}

        {/* Pastga tushish strelkasi — foydalanuvchi eski xabarlarni o'qish uchun
            yuqoriga sirg'algan bo'lsa chiqadi (pastda bo'lsa umuman ko'rinmaydi).
            Yangi xabar(lar) shu paytda kelsa, sonlar shu strelka ustida chiqadi. */}
        {!isNearBottom && (
          <button
            onClick={() => scrollToBottom('smooth')}
            title="Pastga tushish"
            aria-label="Suhbat oxiriga tushish"
            className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-surface border border-border shadow-card flex items-center justify-center text-ink hover:text-accent hover:border-accent/40 transition-colors"
          >
            <ArrowDown size={18} />
            {newMessageCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-on-accent text-[11px] font-bold flex items-center justify-center">
                {newMessageCount > 99 ? '99+' : newMessageCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* key — har suhbatning qoralamasi (matn, biriktirma) boshqasiga o'tib ketmasin. */}
      <Composer key={activeConversation.id} />

      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <ConfirmModal
        open={blockOpen}
        title="Foydalanuvchini bloklash"
        message={`@${activeConversation.otherUser?.username || 'foydalanuvchi'}ni bloklaysizmi? Suhbat yopiladi.`}
        confirmLabel="Bloklash"
        onConfirm={handleBlock}
        onCancel={() => setBlockOpen(false)}
      />
    </div>
  );
}
