'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ShieldOff, Bell, BellOff, Pin, UserCheck, ArrowDown, X, Send, Forward, Trash2, Copy, Upload } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import { useT } from '@/context/LocaleContext';
import { formatDateLocale } from '@/lib/uzDate';
import { formatLastSeen, formatMuteUntil, isOnline, useLiveClock } from '@/lib/presence';
import { TYPING_LABEL, REPLY_TYPE_LABEL } from '@/lib/chatConstants';
import { groupAlbums } from '@/lib/chat/albums';
import { filesFromDataTransfer } from '@/lib/chat/attachments';
import MessageBubble from './MessageBubble';
import Composer from './Composer';
import UserProfileModal from './UserProfileModal';
import ForwardMessageModal from './ForwardMessageModal';
import DeleteMessageModal from './DeleteMessageModal';
import MediaViewer from './MediaViewer';
import Avatar from '@/components/avatar/Avatar';
import MuteDurationModal from './MuteDurationModal';
import ConfirmModal from '@/components/ConfirmModal';

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

function DaySeparator({ label }) {
  return (
    <div className="flex items-center justify-center py-1.5 select-none">
      <span className="px-2.5 py-1 rounded-full bg-surface-2 text-muted text-[11px] font-medium">{label}</span>
    </div>
  );
}

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
    typingByConversation,
    stageExternalFiles,
    deleteMessage,
  } = useChat();
  const { chatUserId: myId } = useApp();
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
      if (isNearBottomRef.current) scrollToBottom('smooth');
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
  const mediaItems = useMemo(() => {
    const otherName = activeConversation?.otherUser?.nickname || (activeConversation?.otherUser?.username ? `@${activeConversation.otherUser.username}` : '');
    return messages
      .filter((m) => !m.deletedForEveryone && (m.type === 'image' || (m.type === 'video' && !m.media?.round)) && (m.media?.key || m._localUrl))
      .map((m) => ({ id: idOf(m), type: m.type, key: m.media?.key, localUrl: m._localUrl || null, caption: m.text || '', senderLabel: String(m.senderId) === String(myId) ? t('ch.you') : otherName || t('ch.user'), createdAt: m.createdAt }));
  }, [messages, activeConversation, myId, t]);

  if (!activeConversation) {
    return <div className="hidden lg:flex flex-1 items-center justify-center text-sm text-muted">{t('cv.pickChat')}</div>;
  }

  const showPresence = activeConversation.otherUser?.showPresence !== false;
  const online = showPresence && isOnline(activeConversation.otherUser?.lastActiveAt, livePresence[String(activeConversation.otherUser?.id)]);
  const typingKind = typingByConversation[activeConversation.id];
  const lastSeenText = showPresence ? ts(formatLastSeen(activeConversation.otherUser?.lastActiveAt, livePresence[String(activeConversation.otherUser?.id)])) : null;
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
      const prevHeight = el.scrollHeight;
      const prevTop = el.scrollTop;
      loadOlderMessages().finally(() => {
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
    if (!found) return alert(t('ch.notLoaded'));
    requestAnimationFrame(() => highlight(messageId));
  };

  const handleBlock = async () => {
    setBlockOpen(false);
    const res = await blockUser(activeConversation.otherUser.id);
    if (res?.error) alert(ts(res.error));
  };
  const handleToggleMute = () => (activeConversation.muted ? toggleMuteConversation(activeConversation.id, false) : setMuteModalOpen(true));
  const handleSelectMuteDuration = (durationMs) => {
    setMuteModalOpen(false);
    toggleMuteConversation(activeConversation.id, true, durationMs);
  };
  const handleUnpin = async (messageId) => {
    const res = await unpinMessage(messageId);
    if (res?.error) alert(ts(res.error));
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
        alert(ts(res.error));
        break;
      }
    }
    setDeletingSel(false);
    setDeleteSel(false);
    setSelection(null);
  };
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
          <button type="button" onClick={() => setForwardSel(true)} disabled={!selectedIds.size} aria-label={t('mb.forward')} title={t('mb.forward')} className={`${HEADER_BTN} text-muted hover:text-accent disabled:opacity-40`}>
            <Forward size={17} />
          </button>
          <button type="button" onClick={() => setDeleteSel(true)} disabled={!selectedIds.size} aria-label={t('ch.delete')} title={t('ch.delete')} className={`${HEADER_BTN} text-muted hover:text-danger disabled:opacity-40`}>
            <Trash2 size={17} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 md:gap-2.5 px-4 py-3 border-b border-border flex-shrink-0">
          <button onClick={onBack} aria-label={t('cv.backAria')} className={`lg:hidden -ml-2.5 md:ml-0 text-muted hover:text-ink ${HEADER_BTN}`}>
            <ArrowLeft size={18} />
          </button>
          <button type="button" onClick={() => setProfileOpen(true)} aria-label={t('cv.profileAria')} className="flex-shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <Avatar userId={activeConversation.otherUser?.id} photoId={activeConversation.otherUser?.photoId} name={activeConversation.otherUser?.nickname || activeConversation.otherUser?.name} username={activeConversation.otherUser?.username} size={38} online={online} ringClass="border-surface" />
          </button>
          <button onClick={() => setProfileOpen(true)} className="min-w-0 flex-1 text-left ml-1.5 md:ml-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" title={t('cv.profileTitle')}>
            <p className="text-sm font-semibold text-ink truncate hover:underline">{activeConversation.otherUser?.nickname || `@${activeConversation.otherUser?.username}`}</p>
            {typingKind ? <p className="text-[11px] text-accent italic truncate">{ts(TYPING_LABEL[typingKind] || TYPING_LABEL.text)}</p> : lastSeenText && <p className="text-[11px] text-muted truncate">{lastSeenText}</p>}
          </button>
          <button onClick={() => toggleNotifyOnline(activeConversation.id, !activeConversation.notifyOnline)} title={activeConversation.notifyOnline ? t('cv.notifyOnOff') : t('cv.notifyOnOn')} aria-label={activeConversation.notifyOnline ? t('cv.notifyOnOff') : t('cv.notifyOnOn')} className={`${HEADER_BTN} ${activeConversation.notifyOnline ? 'text-accent' : 'text-muted hover:text-accent'}`}>
            <UserCheck size={16} />
          </button>
          <button
            onClick={async () => {
              const res = await toggleTgMessageNotify(activeConversation.id, !activeConversation.tgMessageNotify);
              if (res?.error) alert(ts(res.error));
            }}
            title={activeConversation.tgMessageNotify ? t('cv.tgOff') : t('cv.tgOn')}
            aria-label={activeConversation.tgMessageNotify ? t('cv.tgOff') : t('cv.tgOn')}
            aria-pressed={!!activeConversation.tgMessageNotify}
            className={`${HEADER_BTN} ${activeConversation.tgMessageNotify ? 'text-accent' : 'text-muted hover:text-accent'}`}
          >
            <Send size={16} />
          </button>
          <button onClick={handleToggleMute} title={activeConversation.muted ? muteUntilText || t('cv.unmute') : t('cv.mute')} aria-label={activeConversation.muted ? t('cv.unmute') : t('cv.mute')} className={`${HEADER_BTN} text-muted hover:text-accent`}>
            {activeConversation.muted ? <BellOff size={16} /> : <Bell size={16} />}
          </button>
          <button onClick={() => setBlockOpen(true)} title={t('cv.block')} aria-label={t('cv.blockAria')} className={`${HEADER_BTN} text-muted hover:text-danger`}>
            <ShieldOff size={16} />
          </button>
        </div>
      )}

      {!!activeConversation.pinnedMessageIds?.length && !selection && (
        <PinnedBanner pinnedIds={activeConversation.pinnedMessageIds} messages={messages} onJump={jumpToMessage} onUnpin={handleUnpin} />
      )}

      <div className="relative flex-1 min-h-0 bg-bg-sunken">
        <div ref={listRef} onScroll={handleScroll} className="h-full overflow-y-auto px-4 pt-3 pb-16 space-y-2.5">
          {items.map((it, i) => {
            const m = it.kind === 'album' ? it.messages[0] : it.message;
            const prevItem = items[i - 1];
            const prevMsg = prevItem ? (prevItem.kind === 'album' ? prevItem.messages[0] : prevItem.message) : null;
            const showDaySeparator = !prevMsg || new Date(prevMsg.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
            const group = it.kind === 'album' ? it.messages : [m];
            return (
              <div key={it.kind === 'album' ? it.id : m.clientMessageId || idOf(m)}>
                {showDaySeparator && <DaySeparator label={formatDaySeparator(m.createdAt, t, locale)} />}
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
                />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

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
