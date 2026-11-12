'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ShieldOff, Bell, BellOff, Pin, UserCheck, ArrowDown, X, Send, Forward, Trash2, Copy, Upload, Phone, Video, EllipsisVertical, User, Loader2 } from 'lucide-react';
import { newerIso, useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import { useT } from '@/context/LocaleContext';
import { useCall } from '@/context/CallContext';
import { formatDateLocale } from '@/lib/uzDate';
import { formatLastSeen, formatMuteUntil, isOnline, useLiveClock } from '@/lib/presence';
import { TYPING_LABEL, REPLY_TYPE_LABEL } from '@/lib/chatConstants';
import { groupAlbums } from '@/lib/chat/albums';
import { filesFromDataTransfer } from '@/lib/chat/attachments';
import { groupMessages } from '@/lib/chat/grouping';
import { useDelayedFlag } from '@/lib/hooks/useDelayedFlag';
import TypingDots, { stripDots } from './TypingDots';
import MessageBubble from './MessageBubble';
import Composer from './Composer';
import UserProfileModal from './UserProfileModal';
import ForwardMessageModal from './ForwardMessageModal';
import DeleteMessageModal from './DeleteMessageModal';
import MediaViewer from './MediaViewer';
import Avatar from '@/components/avatar/Avatar';
import MuteDurationModal from './MuteDurationModal';
import ConfirmModal from '@/components/ConfirmModal';
import ActionSheet from './ActionSheet';
import CallbackSheet from './CallbackSheet';

const HEADER_BTN =
  'inline-flex items-center justify-center w-11 h-11 -my-1.5 md:w-auto md:h-auto md:my-0 md:p-1.5 rounded-lg transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
const NEAR_BOTTOM_PX = 120;
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
const idOf = (m) => String(m.id || m._id);

function formatDaySeparator(dateStr, t, locale) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return t('cv.today');
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return t('cv.yesterday');
  if (locale !== 'uz') return formatDateLocale(locale, d, { year: d.getFullYear() !== now.getFullYear() });
  const label = `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}`;
  return d.getFullYear() === now.getFullYear() ? label : `${label} ${d.getFullYear()}`;
}

// Kun yorlig'i (PARITY_PLAN WP8.12): har kun o'z <section>ida, yorliq `sticky` — o'sha kun xabarlari
// ko'rinib turganda tepada qoladi (Telegram'dagi suzuvchi sana).
function DaySeparator({ label }) {
  return (
    <div className="sticky top-1 z-[5] flex items-center justify-center py-1.5 select-none pointer-events-none">
      <span className="px-2.5 py-1 rounded-full bg-surface-2/90 backdrop-blur-sm text-muted text-[11px] font-medium shadow-sm">{label}</span>
    </div>
  );
}

// O'qilmagan xabarlar chizig'i (WP8.12) — suhbat ochilgandagi birinchi o'qilmagan xabar oldida;
// suhbatdan chiqib qayta kirilganda qayta hisoblanadi (o'qilganlar uchun yo'qoladi).
function UnreadDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-2 -mx-4 px-4 py-1 bg-accent-soft/50 select-none" data-testid="unread-divider" role="separator" aria-label={label}>
      <span className="flex-1 h-px bg-accent/30" />
      <span className="text-[11px] font-semibold text-accent">{label}</span>
      <span className="flex-1 h-px bg-accent/30" />
    </div>
  );
}

const dayKeyOf = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
};

function PinnedBanner({ pinnedIds, messages, onJump, onUnpin }) {
  const { t, ts } = useT();
  const lastId = pinnedIds[pinnedIds.length - 1];
  const pinnedMessage = messages.find((m) => idOf(m) === String(lastId));
  const preview = pinnedMessage ? (pinnedMessage.type === 'text' ? pinnedMessage.text || '…' : ts(REPLY_TYPE_LABEL[pinnedMessage.type]) || t('cv.message')) : t('cv.pinned');
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-accent-soft/40 flex-shrink-0">
      <Pin size={14} className="text-accent flex-shrink-0" />
      <button type="button" onClick={() => onJump(String(lastId))} className="flex-1 min-w-0 text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <p className="text-[11px] font-semibold text-accent">
          {t('cv.pinned')}{pinnedIds.length > 1 ? ` (1/${pinnedIds.length})` : ''}
        </p>
        <p className="text-xs text-ink truncate">{preview}</p>
      </button>
      <button type="button" onClick={() => onUnpin(lastId)} aria-label={t('cv.unpin')} title={t('cv.unpin')} className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 -m-1 text-muted hover:text-danger transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ConversationView({ onBack }) {
  const { t, ts, locale } = useT();
  const {
    activeConversation,
    conversations,
    messages,
    loadingMessages,
    messagesError,
    retryLoadMessages,
    loadOlderMessages,
    ensureMessageLoaded,
    blockUser,
    toggleMuteConversation,
    toggleNotifyOnline,
    toggleTgMessageNotify,
    unpinMessage,
    livePresence,
    liveLastSeen,
    typingByConversation,
    stageExternalFiles,
    deleteMessage,
    socketConnected,
    showChatNotice,
  } = useChat();
  const { chatUserId: myId } = useApp();
  const { canCall, unavailableKey, startCall, pendingCallback, consumeCallback } = useCall();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const prevLenRef = useRef(0);
  const prevLastIdRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const dragDepth = useRef(0);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [muteModalOpen, setMuteModalOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [viewer, setViewer] = useState(null); // { index }
  // Multi-select (Telegram parity): a Set of message ids; null = not selecting.
  const [selection, setSelection] = useState(null);
  const [forwardSel, setForwardSel] = useState(false);
  const [deleteSel, setDeleteSel] = useState(false);
  const [deletingSel, setDeletingSel] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  // Suhbat ochilgandagi birinchi o'qilmagan xabar (WP8.12) — { convId, id }; keyin o'qilsa ham joyida qoladi.
  const [unreadAnchor, setUnreadAnchor] = useState({ convId: null, id: null });
  const connecting = useDelayedFlag(!socketConnected, 1500);
  useLiveClock();

  const scrollToBottom = (behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
    isNearBottomRef.current = true;
    setIsNearBottom(true);
    setNewMessageCount(0);
  };

  const convId = activeConversation?.id;
  const [prevConvId, setPrevConvId] = useState(convId);
  if (prevConvId !== convId) {
    setPrevConvId(convId);
    setIsNearBottom(true);
    setNewMessageCount(0);
    setSelection(null);
    setViewer(null);
  }
  // Birinchi yuklangan xabarlar shu suhbatniki bo'lganda o'qilmaganlar chizig'i joyini bir marta eslab qolamiz.
  const lastMsg = messages[messages.length - 1];
  if (convId && unreadAnchor.convId !== convId && !loadingMessages && lastMsg && (!lastMsg.conversationId || String(lastMsg.conversationId) === String(convId))) {
    const firstUnread = messages.find((m) => String(m.senderId) !== String(myId) && !m.readAt && !m.deletedForEveryone);
    setUnreadAnchor({ convId, id: firstUnread ? idOf(firstUnread) : null });
  }
  useEffect(() => {
    prevLenRef.current = 0;
    prevLastIdRef.current = null;
    isNearBottomRef.current = true;
  }, [convId]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    const lastId = last ? idOf(last) : null;
    if (prevLenRef.current === 0) {
      const unread = messages.filter((m) => String(m.senderId) !== String(myId) && !m.readAt);
      const firstUnread = unread[0];
      const firstUnreadId = firstUnread ? idOf(firstUnread) : null;
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
          setNewMessageCount(nearBottom ? 0 : unread.length);
        });
      } else scrollToBottom('auto');
    } else if (lastId && lastId !== prevLastIdRef.current) {
      const mine = last && String(last.senderId) === String(myId) && !!last.clientMessageId;
      if (isNearBottomRef.current || mine) scrollToBottom('smooth');
      else setNewMessageCount((n) => n + 1);
    }
    prevLenRef.current = messages.length;
    prevLastIdRef.current = lastId;
  }, [messages, myId]);

  // Escape leaves selection mode.
  useEffect(() => {
    if (!selection) return undefined;
    const onKey = (e) => e.key === 'Escape' && setSelection(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selection]);

  // Render items (albums grouped) and the media strip for the viewer.
  const items = useMemo(() => groupAlbums(messages), [messages]);
  // WP8.2 guruhlash (bir yuboruvchi, 5 daqiqa, bir kun) va WP8.12 kun bo'limlari (sticky sana).
  const groupFlags = useMemo(() => groupMessages(items.map((it) => (it.kind === 'album' ? it.messages[0] : it.message))), [items]);
  const sections = useMemo(() => {
    const out = [];
    items.forEach((it, i) => {
      const m = it.kind === 'album' ? it.messages[0] : it.message;
      const key = dayKeyOf(m.createdAt);
      if (!out.length || out[out.length - 1].key !== key) out.push({ key, createdAt: m.createdAt, entries: [] });
      out[out.length - 1].entries.push({ it, i });
    });
    return out;
  }, [items]);
  const mediaItems = useMemo(() => {
    const otherName = activeConversation?.otherUser?.nickname || (activeConversation?.otherUser?.username ? `@${activeConversation.otherUser.username}` : '');
    return messages
      .filter((m) => !m.deletedForEveryone && (m.type === 'image' || (m.type === 'video' && !m.media?.round)) && (m.media?.key || m._localUrl))
      .map((m) => ({ id: idOf(m), type: m.type, key: m.media?.key, localUrl: m._localUrl || null, caption: m.text || '', senderLabel: String(m.senderId) === String(myId) ? t('ch.you') : otherName || t('ch.user'), createdAt: m.createdAt }));
  }, [messages, activeConversation, myId, t]);

  if (!activeConversation) {
    return <div className="hidden lg:flex flex-1 items-center justify-center text-sm text-muted">{t('cv.pickChat')}</div>;
  }

  // `activeConversation` alohida holat; ro'yxat esa qayta yuklanib turadi (socket yo'q paytda har
  // 30 s) — sarlavha ikkalasining yangirog'ini ko'rsatadi, aks holda eski vaqtda "qotib" qolardi.
  const listEntry = conversations.find((c) => String(c.id) === String(activeConversation.id));
  const showPresence = (listEntry?.otherUser?.showPresence ?? activeConversation.otherUser?.showPresence) !== false;
  const otherLastActiveAt = newerIso(activeConversation.otherUser?.lastActiveAt, listEntry?.otherUser?.lastActiveAt);
  const otherId = String(activeConversation.otherUser?.id);
  const online = showPresence && isOnline(otherLastActiveAt, livePresence[otherId]);
  const typingKind = typingByConversation[activeConversation.id];
  // Suhbatdosh "Oxirgi marta ko'rilgan"ni yashirgan bo'lsa (sozlamalarda "Hech kim") — Telegram kabi
  // aniq vaqt ham, "onlayn" ham emas, faqat "yaqinda onlayn edi".
  const lastSeenText = showPresence
    ? ts(formatLastSeen(otherLastActiveAt, livePresence[otherId], liveLastSeen[otherId]))
    : t('ch.lastSeenRecently');
  const muteUntilText = activeConversation.muted ? ts(formatMuteUntil(activeConversation.mutedUntil)) : null;

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < NEAR_BOTTOM_PX;
    isNearBottomRef.current = nearBottom;
    setIsNearBottom(nearBottom);
    if (nearBottom) setNewMessageCount(0);
    if (el.scrollTop < 40 && !loadingOlderRef.current) {
      loadingOlderRef.current = true;
      setLoadingOlder(true);
      const prevHeight = el.scrollHeight;
      const prevTop = el.scrollTop;
      loadOlderMessages().finally(() => {
        setLoadingOlder(false);
        requestAnimationFrame(() => {
          if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight - prevHeight + prevTop;
          loadingOlderRef.current = false;
        });
      });
    }
  };

  const highlight = (messageId) => {
    const el = listRef.current?.querySelector(`[data-msg-id="${messageId}"]`);
    if (!el) return false;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('chat-highlight');
    setTimeout(() => el.classList.remove('chat-highlight'), 1200);
    return true;
  };
  // Telegram: tapping a quote jumps to the original, loading older pages if needed.
  const jumpToMessage = async (messageId) => {
    if (highlight(messageId)) return;
    const found = await ensureMessageLoaded(messageId);
    if (!found) return showChatNotice(t('ch.notLoaded'));
    requestAnimationFrame(() => highlight(messageId));
  };

  const handleBlock = async () => {
    setBlockOpen(false);
    const res = await blockUser(activeConversation.otherUser.id);
    if (res?.error) showChatNotice(ts(res.error), 'error');
  };
  const handleToggleMute = () => (activeConversation.muted ? toggleMuteConversation(activeConversation.id, false) : setMuteModalOpen(true));
  const handleSelectMuteDuration = (durationMs) => {
    setMuteModalOpen(false);
    toggleMuteConversation(activeConversation.id, true, durationMs);
  };
  const handleUnpin = async (messageId) => {
    const res = await unpinMessage(messageId);
    if (res?.error) showChatNotice(ts(res.error), 'error');
  };

  // Drag & drop anywhere over the conversation → composer tray.
  const onDragEnter = (e) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    dragDepth.current++;
    setDragging(true);
  };
  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    const files = filesFromDataTransfer(e.dataTransfer);
    if (files.length) stageExternalFiles(files);
  };

  // Selection helpers
  const selectedIds = selection || new Set();
  const toggleSelect = (msgs) =>
    setSelection((prev) => {
      const next = new Set(prev || []);
      const ids = msgs.map(idOf);
      const allIn = ids.every((id) => next.has(id));
      ids.forEach((id) => (allIn ? next.delete(id) : next.add(id)));
      return next;
    });
  const selectedMessages = messages.filter((m) => selectedIds.has(idOf(m)));
  const copySelected = async () => {
    const text = selectedMessages.map((m) => m.text).filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard blocked
    }
    setSelection(null);
  };
  const deleteSelected = async (forEveryone) => {
    setDeletingSel(true);
    for (const m of selectedMessages) {
      const res = await deleteMessage(idOf(m), forEveryone && String(m.senderId) === String(myId));
      if (res?.error) {
        showChatNotice(ts(res.error), 'error');
        break;
      }
    }
    setDeletingSel(false);
    setDeleteSel(false);
    setSelection(null);
  };
  // ⋮ menyusi: sarlavhadagi to'rtta almashtirgich + profil (CALLS_SPEC §10.9), yorliqlari avvalgidek.
  const moreItems = [
    {
      key: 'notify-online',
      label: activeConversation.notifyOnline ? t('cv.notifyOnOff') : t('cv.notifyOnOn'),
      icon: UserCheck,
      pressed: !!activeConversation.notifyOnline,
      onSelect: () => toggleNotifyOnline(activeConversation.id, !activeConversation.notifyOnline),
    },
    {
      key: 'tg-notify',
      label: activeConversation.tgMessageNotify ? t('cv.tgOff') : t('cv.tgOn'),
      icon: Send,
      pressed: !!activeConversation.tgMessageNotify,
      onSelect: async () => {
        const res = await toggleTgMessageNotify(activeConversation.id, !activeConversation.tgMessageNotify);
        if (res?.error) showChatNotice(ts(res.error), 'error');
      },
    },
    {
      key: 'mute',
      label: activeConversation.muted ? (muteUntilText ? `${t('cv.unmute')} · ${muteUntilText}` : t('cv.unmute')) : t('cv.mute'),
      icon: activeConversation.muted ? BellOff : Bell,
      pressed: !!activeConversation.muted,
      onSelect: handleToggleMute,
    },
    { key: 'profile', label: t('cv.profileAria'), icon: User, onSelect: () => setProfileOpen(true) },
    { key: 'block', label: t('cv.blockAria'), icon: ShieldOff, danger: true, onSelect: () => setBlockOpen(true) },
  ];
  // Bildirishnomadagi "qayta qo'ng'iroq" havolasi (?call=) aynan shu suhbat uchun bo'lsa.
  const callbackOpen =
    !!pendingCallback && !!activeConversation.otherUser?.username && pendingCallback.username.toLowerCase() === String(activeConversation.otherUser.username).toLowerCase();

  const openMedia = (messageId) => {
    const index = mediaItems.findIndex((it) => it.id === String(messageId));
    if (index >= 0) setViewer({ index });
  };

  return (
    <div className="relative flex-1 flex flex-col h-full min-w-0 bg-surface" onDragEnter={onDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={onDragLeave} onDrop={onDrop} data-testid="conversation-view">
      {selection ? (
        <div className="flex items-center gap-1 px-3 py-2.5 border-b border-border flex-shrink-0 bg-accent-soft/40" data-testid="selection-bar">
          <button type="button" onClick={() => setSelection(null)} aria-label={t('ch.close')} className={`${HEADER_BTN} text-muted hover:text-ink`}>
            <X size={18} />
          </button>
          <p className="flex-1 text-sm font-semibold text-ink tabular-nums">{t('ch.selected', { n: selectedIds.size })}</p>
          <button type="button" onClick={copySelected} disabled={!selectedMessages.some((m) => m.text)} aria-label={t('mb.copy')} title={t('mb.copy')} className={`${HEADER_BTN} text-muted hover:text-accent disabled:opacity-40`}>
            <Copy size={17} />
          </button>
          <button type="button" onClick={() => setForwardSel(true)} disabled={!selectedIds.size || selectedMessages.some((m) => m.type === 'call')} aria-label={t('mb.forward')} title={t('mb.forward')} className={`${HEADER_BTN} text-muted hover:text-accent disabled:opacity-40`}>
            <Forward size={17} />
          </button>
          <button type="button" onClick={() => setDeleteSel(true)} disabled={!selectedIds.size} aria-label={t('ch.delete')} title={t('ch.delete')} className={`${HEADER_BTN} text-muted hover:text-danger disabled:opacity-40`}>
            <Trash2 size={17} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 md:gap-2.5 px-4 py-2.5 border-b border-border flex-shrink-0">
          <button onClick={onBack} aria-label={t('cv.backAria')} className={`lg:hidden -ml-2.5 md:ml-0 text-muted hover:text-ink ${HEADER_BTN}`}>
            <ArrowLeft size={18} />
          </button>
          <button type="button" onClick={() => setProfileOpen(true)} aria-label={t('cv.profileAria')} className="flex-shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <Avatar userId={activeConversation.otherUser?.id} photoId={activeConversation.otherUser?.photoId} name={activeConversation.otherUser?.nickname || activeConversation.otherUser?.name} username={activeConversation.otherUser?.username} size={40} online={online} onlineLabel={t('ch.online')} ringClass="border-surface" />
          </button>
          <button onClick={() => setProfileOpen(true)} className="min-w-0 flex-1 text-left ml-1.5 md:ml-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" title={t('cv.profileTitle')}>
            <p className="text-[15px] leading-5 font-semibold text-ink truncate hover:underline">{activeConversation.otherUser?.nickname || `@${activeConversation.otherUser?.username}`}</p>
            {/* WP8.15: holat qatori doim bir xil balandlikda (layout siljimaydi); "yozmoqda" — animatsiyali nuqtalar,
                socket uzilgan bo'lsa — "Ulanmoqda…" (doimiy Wifi belgisi o'rniga). */}
            <p className="h-4 text-xs leading-4 truncate" aria-live="polite" data-testid="chat-status">
              {connecting ? (
                <span className="text-muted">{t('ch.connecting')}</span>
              ) : typingKind ? (
                <span className="inline-flex items-center gap-1 text-accent">
                  {stripDots(ts(TYPING_LABEL[typingKind] || TYPING_LABEL.text))}
                  <TypingDots />
                </span>
              ) : (
                lastSeenText && <span className={online ? 'text-accent' : 'text-muted'}>{lastSeenText}</span>
              )}
            </p>
          </button>
          <button
            type="button"
            onClick={() => startCall({ conversationId: String(activeConversation.id), kind: 'audio', peer: activeConversation.otherUser })}
            disabled={!canCall}
            aria-label={t('cv.callVoice')}
            title={canCall ? t('cv.callVoice') : t(unavailableKey || 'cv.callUnavailable')}
            data-testid="call-audio-button"
            className={`${HEADER_BTN} text-muted hover:text-accent disabled:opacity-40 disabled:hover:text-muted`}
          >
            <Phone size={17} />
          </button>
          <button
            type="button"
            onClick={() => startCall({ conversationId: String(activeConversation.id), kind: 'video', peer: activeConversation.otherUser })}
            disabled={!canCall}
            aria-label={t('cv.callVideo')}
            title={canCall ? t('cv.callVideo') : t(unavailableKey || 'cv.callUnavailable')}
            data-testid="call-video-button"
            className={`${HEADER_BTN} text-muted hover:text-accent disabled:opacity-40 disabled:hover:text-muted`}
          >
            <Video size={17} />
          </button>
          <button
            ref={moreRef}
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label={t('cv.moreAria')}
            title={t('cv.moreAria')}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            data-testid="chat-more-button"
            className={`${HEADER_BTN} text-muted hover:text-accent`}
          >
            <EllipsisVertical size={17} />
          </button>
        </div>
      )}

      {!!activeConversation.pinnedMessageIds?.length && !selection && (
        <PinnedBanner pinnedIds={activeConversation.pinnedMessageIds} messages={messages} onJump={jumpToMessage} onUnpin={handleUnpin} />
      )}

      <div className="relative flex-1 min-h-0 bg-bg-sunken">
        {/* Oraliqlar (WP8.2): guruh ichida mt-0.5 (2 px), guruhlar orasida mt-2.5; oxirgi pufakcha ostida pb-3. */}
        <div ref={listRef} onScroll={handleScroll} className="h-full overflow-y-auto px-4 pt-1 pb-3">
          {sections.map((sec) => (
            <section key={sec.key}>
              <DaySeparator label={formatDaySeparator(sec.createdAt, t, locale)} />
              {sec.entries.map(({ it, i }, k) => {
                const m = it.kind === 'album' ? it.messages[0] : it.message;
                const group = it.kind === 'album' ? it.messages : [m];
                const flags = groupFlags[i] || { first: true, last: true };
                const unreadHere = unreadAnchor.convId === convId && !!unreadAnchor.id && group.some((x) => idOf(x) === unreadAnchor.id);
                return (
                  <div key={it.kind === 'album' ? it.id : m.clientMessageId || idOf(m)} className={k === 0 || unreadHere ? '' : flags.first ? 'mt-2.5' : 'mt-0.5'}>
                    {unreadHere && <UnreadDivider label={t('cv.unread')} />}
                    <MessageBubble
                      message={m}
                      album={it.kind === 'album' ? it.messages : null}
                      isMine={String(m.senderId) === String(myId)}
                      myId={myId}
                      onJumpToReply={jumpToMessage}
                      onOpenMedia={openMedia}
                      selectionMode={!!selection}
                      selected={group.some((x) => selectedIds.has(idOf(x)))}
                      onToggleSelect={toggleSelect}
                      onEnterSelection={(msgs) => setSelection(new Set(msgs.map(idOf)))}
                      groupFirst={flags.first || unreadHere}
                      groupLast={flags.last}
                    />
                  </div>
                );
              })}
            </section>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Eski sahifa yuklanmoqda (WP8.12) — ro'yxat ustida suzadi, kontentni siljitmaydi (scroll anchoring buzilmaydi). */}
        {loadingOlder && (
          <div role="status" aria-label={t('cv.loadingOlder')} className="absolute top-2 left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-surface shadow-card grid place-items-center text-muted pointer-events-none">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          </div>
        )}

        {(loadingMessages || messagesError || messages.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none">
            {loadingMessages && (
              <div className="w-full max-w-xs space-y-2.5 animate-pulse" aria-label={t('cv.loading')}>
                <div className="h-10 w-2/3 rounded-2xl bg-surface-2" />
                <div className="h-10 w-1/2 rounded-2xl bg-accent-soft ml-auto" />
                <div className="h-10 w-3/5 rounded-2xl bg-surface-2" />
              </div>
            )}
            {!loadingMessages && messagesError && (
              <div className="text-center pointer-events-auto">
                <p className="text-sm text-danger font-medium mb-2">{t('cv.msgLoadFail')}</p>
                <button onClick={retryLoadMessages} className="text-xs font-semibold text-accent hover:underline">{t('ch.reload')}</button>
              </div>
            )}
            {!loadingMessages && !messagesError && messages.length === 0 && <p className="text-center text-sm text-muted">{t('cv.noMsgs')}</p>}
          </div>
        )}

        {!isNearBottom && (
          <button onClick={() => scrollToBottom('smooth')} title={t('cv.down')} aria-label={t('cv.downAria')} className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-surface border border-border shadow-card flex items-center justify-center text-ink hover:text-accent hover:border-accent/40 transition-colors">
            <ArrowDown size={18} />
            {newMessageCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-on-accent text-[11px] font-bold flex items-center justify-center">{newMessageCount > 99 ? '99+' : newMessageCount}</span>
            )}
          </button>
        )}

        {dragging && (
          <div className="absolute inset-0 z-20 m-3 rounded-2xl border-2 border-dashed border-accent bg-accent-soft/80 flex flex-col items-center justify-center gap-2 text-accent pointer-events-none" data-testid="drop-zone">
            <Upload size={28} />
            <p className="text-sm font-semibold">{t('ch.drop')}</p>
          </div>
        )}
      </div>

      <Composer key={activeConversation.id} />

      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <ActionSheet open={moreOpen} title={t('cv.moreAria')} items={moreItems} onClose={() => setMoreOpen(false)} anchorRef={moreRef} testid="chat-more-menu" />
      <CallbackSheet
        open={callbackOpen}
        kind={pendingCallback?.kind}
        disabled={!canCall}
        disabledTitle={!canCall && unavailableKey ? t(unavailableKey) : ''}
        onPick={(kind) => {
          consumeCallback();
          startCall({ conversationId: String(activeConversation.id), kind, peer: activeConversation.otherUser });
        }}
        onClose={consumeCallback}
      />
      <MuteDurationModal open={muteModalOpen} onSelect={handleSelectMuteDuration} onCancel={() => setMuteModalOpen(false)} />
      <ConfirmModal open={blockOpen} title={t('cv.blockTitle')} message={t('cv.blockMsg', { u: activeConversation.otherUser?.username || t('ch.user') })} confirmLabel={t('cv.blockConfirm')} onConfirm={handleBlock} onCancel={() => setBlockOpen(false)} />
      <ForwardMessageModal
        open={forwardSel}
        messages={selectedMessages}
        onClose={() => {
          setForwardSel(false);
          setSelection(null);
        }}
      />
      <DeleteMessageModal open={deleteSel} canDeleteForEveryone={selectedMessages.every((m) => String(m.senderId) === String(myId))} otherUsername={activeConversation.otherUser?.username} onConfirm={deletingSel ? undefined : deleteSelected} onCancel={() => setDeleteSel(false)} />
      {viewer && mediaItems.length > 0 && (
        <MediaViewer
          items={mediaItems}
          index={Math.min(viewer.index, mediaItems.length - 1)}
          onClose={() => setViewer(null)}
          formatDate={(d) => `${formatDateLocale(locale, new Date(d), { year: true })} · ${String(new Date(d).getHours()).padStart(2, '0')}:${String(new Date(d).getMinutes()).padStart(2, '0')}`}
        />
      )}
    </div>
  );
}
