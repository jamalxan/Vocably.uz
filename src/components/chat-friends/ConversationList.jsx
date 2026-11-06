'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, BellOff, Trash2, Archive, ArchiveRestore, Pin, PinOff, Check, CheckSquare, MailOpen, Bell, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { isOnline, useLiveClock, formatListTime } from '@/lib/presence';
import { TYPING_LABEL } from '@/lib/chatConstants';
import { partitionConversations, rowPreview } from '@/lib/chat/chatList';
import { getDraft } from '@/lib/chat/drafts';
import { useDelayedFlag } from '@/lib/hooks/useDelayedFlag';
import UserSearchBar from './UserSearchBar';
import DeleteConversationModal from './DeleteConversationModal';
import ActionSheet from './ActionSheet';
import TypingDots, { stripDots } from './TypingDots';
import Avatar from '@/components/avatar/Avatar';
import { useT } from '@/context/LocaleContext';

// Chat list (Telegram parity): pinned chats first, an "Archived chats" folder, drafts shown in the
// row, a context menu per chat, and a multi-select mode (long-press / right-click / "Select") with
// one action bar: read, mute, archive, pin, delete.
// PARITY_PLAN WP8: 72 px qatorlar, 52 px avatar, 15/13 px matn, vaqt `formatListTime` (bugun HH:mm /
// kecha / hafta kuni / sana); "Chat amallari" tugmasi faqat `lg` da (hover) — kichik ekranda uzoq
// bosish; menyu sichqonchada popover, sensorda pastki varaq (ActionSheet, WP8.9).
const LONG_PRESS_MS = 500;

function ConversationRow({ c, selected, selecting, checked, onOpen, onMenu, onToggle, online, typing, draft }) {
  const { t, ts, locale } = useT();
  const pressTimer = useRef(null);
  const longPressFired = useRef(false);
  const menuBtnRef = useRef(null);
  const preview = rowPreview(c, draft);

  const startPress = (e) => {
    if (e?.pointerType === 'mouse') return;
    longPressFired.current = false;
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onMenu(c);
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => clearTimeout(pressTimer.current);
  const handleClick = () => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    if (selecting) onToggle(c);
    else onOpen(c);
  };
  const unread = c.unreadCount > 0;

  return (
    <div className={`group relative flex items-center rounded-xl transition-colors ${selected && !selecting ? 'bg-accent-soft' : checked ? 'bg-accent-soft/60' : 'hover:bg-bg'}`} data-testid="chat-row">
      {selecting && (
        <span className={`ml-2 w-5 h-5 rounded-full border-2 grid place-items-center flex-shrink-0 ${checked ? 'bg-accent border-accent text-on-accent' : 'border-border'}`} aria-hidden="true">
          {checked && <Check size={12} />}
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          onMenu(c, { point: { x: e.clientX, y: e.clientY } });
        }}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        aria-current={selected ? 'true' : undefined}
        aria-pressed={selecting ? checked : undefined}
        className="flex-1 min-w-0 flex items-center gap-3 px-2.5 lg:pr-1 py-2.5 rounded-xl text-left cursor-pointer select-none [-webkit-touch-callout:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Avatar userId={c.otherUser?.id} photoId={c.otherUser?.photoId} name={c.otherUser?.nickname || c.otherUser?.name} username={c.otherUser?.username} size={52} online={online} onlineLabel={t('ch.online')} ringClass="border-surface" />
        <span className="block min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 min-w-0">
              <span className={`block text-[15px] leading-5 truncate text-ink ${unread ? 'font-bold' : 'font-semibold'}`}>{c.otherUser?.nickname || `@${c.otherUser?.username || t('ch.unknown')}`}</span>
              {c.muted && <BellOff size={12} className="text-muted flex-shrink-0" />}
            </span>
            <span className="flex items-center gap-1 flex-shrink-0">
              {c.pinned && <Pin size={12} className="text-muted" aria-label={t('ch.pinned')} />}
              {c.lastMessageAt && (
                <time dateTime={new Date(c.lastMessageAt).toISOString()} className={`text-xs tabular-nums ${unread ? 'text-accent font-semibold' : 'text-muted'}`}>
                  {formatListTime(c.lastMessageAt, new Date(), locale, { yesterday: t('ch.yesterday') })}
                </time>
              )}
            </span>
          </span>
          <span className="flex items-center justify-between gap-2 mt-0.5">
            {typing ? (
              <span className="flex items-center gap-1.5 min-w-0 text-[13px] leading-5 text-accent">
                <span className="truncate">{stripDots(ts(TYPING_LABEL[typing] || TYPING_LABEL.text))}</span>
                <TypingDots />
              </span>
            ) : preview.kind === 'draft' ? (
              <span className="block text-[13px] leading-5 truncate text-muted" data-testid="row-draft">
                <span className="text-danger font-semibold">{t('ch.draft')}</span> {preview.text}
              </span>
            ) : (
              <span className={`block text-[13px] leading-5 truncate ${unread ? 'text-ink' : 'text-muted'}`}>{ts(preview.text)}</span>
            )}
            {unread && (
              <span className={`flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center tabular-nums ${c.muted ? 'bg-muted text-surface' : 'bg-accent text-on-accent'}`}>{c.unreadCount > 99 ? '99+' : c.unreadCount}</span>
            )}
          </span>
        </span>
      </button>
      {!selecting && (
        <button
          ref={menuBtnRef}
          type="button"
          onClick={() => onMenu(c, { anchor: menuBtnRef.current })}
          title={t('ch.chatMenu')}
          aria-label={t('ch.chatMenu')}
          aria-haspopup="dialog"
          className="hidden lg:inline-flex flex-shrink-0 items-center justify-center w-8 h-8 mr-1.5 rounded-lg text-muted hover:text-accent hover:bg-surface-2 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronDown size={16} />
        </button>
      )}
    </div>
  );
}

export default function ConversationList({ onSelect, selectedId }) {
  const { conversations, loadingConversations, conversationsError, loadConversations, socketConnected, bulkConversations, setConversationFlags, livePresence, typingByConversation, drafts, showChatNotice } = useChat();
  const { t, ts } = useT();
  const [menuFor, setMenuFor] = useState(null); // { c, anchorRef?, point? }
  const [deleteIds, setDeleteIds] = useState(null); // ids to delete (1 or many)
  const [deleting, setDeleting] = useState(false);
  const [selection, setSelection] = useState(null); // Set of ids or null
  const [showArchive, setShowArchive] = useState(false);
  // Doimiy Wifi belgisi o'rniga — faqat socket uzilganda (1.5 s dan keyin) "Ulanmoqda…" (Telegram).
  const connecting = useDelayedFlag(!socketConnected, 1500);
  useLiveClock();

  const { main, archived, archivedUnread } = useMemo(() => partitionConversations(conversations), [conversations]);
  const visible = showArchive ? archived : main;
  const selectedIds = selection || new Set();

  useEffect(() => {
    if (!selection) return undefined;
    const onKey = (e) => e.key === 'Escape' && setSelection(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selection]);

  const run = async (ids, action, extra) => {
    const res = await bulkConversations(ids, action, extra);
    if (res?.error) showChatNotice(ts(res.error), 'error');
    setSelection(null);
    return res;
  };
  const handleConfirmDelete = async (forEveryone) => {
    if (!deleteIds?.length) return;
    setDeleting(true);
    const res = await run(deleteIds, 'delete', { forEveryone });
    setDeleting(false);
    if (!res?.error) setDeleteIds(null);
  };
  const toggle = (c) =>
    setSelection((prev) => {
      const next = new Set(prev || []);
      const id = String(c.id);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const openMenu = (c, { anchor = null, point = null } = {}) => setMenuFor({ c, anchorRef: anchor ? { current: anchor } : null, point });
  const menuItems = (c) => [
    { key: 'select', label: t('ch.select'), icon: CheckSquare, onSelect: () => setSelection(new Set([String(c.id)])) },
    ...(c.unreadCount > 0 ? [{ key: 'read', label: t('ch.markRead'), icon: MailOpen, onSelect: () => run([c.id], 'read') }] : []),
    { key: 'pin', label: c.pinned ? t('ch.unpinChat') : t('ch.pinChat'), icon: c.pinned ? PinOff : Pin, onSelect: () => setConversationFlags(c.id, { pinned: !c.pinned }) },
    { key: 'mute', label: c.muted ? t('ch.unmuteChat') : t('ch.muteChat'), icon: c.muted ? Bell : BellOff, onSelect: () => run([c.id], c.muted ? 'unmute' : 'mute') },
    { key: 'archive', label: c.archived ? t('ch.unarchive') : t('ch.archive'), icon: c.archived ? ArchiveRestore : Archive, onSelect: () => setConversationFlags(c.id, { archived: !c.archived }) },
    { key: 'delete', label: t('ch.clearChat'), icon: Trash2, onSelect: () => setDeleteIds([String(c.id)]), danger: true },
  ];
  const selectedList = visible.filter((c) => selectedIds.has(String(c.id)));
  const anyUnread = selectedList.some((c) => c.unreadCount > 0);
  const allMuted = selectedList.length > 0 && selectedList.every((c) => c.muted);

  return (
    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-border flex flex-col h-full bg-surface" data-testid="chat-list">
      {selection ? (
        <div className="flex items-center gap-0.5 px-2 pt-2 pb-1 bg-accent-soft/40 border-b border-border" data-testid="chat-selection-bar">
          <button type="button" onClick={() => setSelection(null)} aria-label={t('ch.close')} className="w-10 h-10 grid place-items-center rounded-lg text-muted hover:text-ink"><X size={18} /></button>
          <p className="flex-1 text-sm font-semibold text-ink tabular-nums">{t('ch.selected', { n: selectedIds.size })}</p>
          <button type="button" onClick={() => setSelection(new Set(visible.map((c) => String(c.id))))} title={t('ch.selectAll')} aria-label={t('ch.selectAll')} className="w-10 h-10 grid place-items-center rounded-lg text-muted hover:text-accent"><CheckSquare size={17} /></button>
          <button type="button" disabled={!anyUnread} onClick={() => run([...selectedIds], 'read')} title={t('ch.markRead')} aria-label={t('ch.markRead')} className="w-10 h-10 grid place-items-center rounded-lg text-muted hover:text-accent disabled:opacity-40"><MailOpen size={17} /></button>
          <button type="button" disabled={!selectedIds.size} onClick={() => run([...selectedIds], allMuted ? 'unmute' : 'mute')} title={allMuted ? t('ch.unmuteChat') : t('ch.muteChat')} aria-label={allMuted ? t('ch.unmuteChat') : t('ch.muteChat')} className="w-10 h-10 grid place-items-center rounded-lg text-muted hover:text-accent disabled:opacity-40">{allMuted ? <Bell size={17} /> : <BellOff size={17} />}</button>
          <button type="button" disabled={!selectedIds.size} onClick={() => run([...selectedIds], showArchive ? 'unarchive' : 'archive')} title={showArchive ? t('ch.unarchive') : t('ch.archive')} aria-label={showArchive ? t('ch.unarchive') : t('ch.archive')} className="w-10 h-10 grid place-items-center rounded-lg text-muted hover:text-accent disabled:opacity-40">{showArchive ? <ArchiveRestore size={17} /> : <Archive size={17} />}</button>
          <button type="button" disabled={!selectedIds.size} onClick={() => setDeleteIds([...selectedIds])} title={t('ch.delete')} aria-label={t('ch.delete')} className="w-10 h-10 grid place-items-center rounded-lg text-muted hover:text-danger disabled:opacity-40"><Trash2 size={17} /></button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1 min-h-11">
          {showArchive ? (
            <button type="button" onClick={() => setShowArchive(false)} className="inline-flex items-center gap-1.5 text-base font-bold text-ink hover:text-accent" data-testid="archive-back">
              <ArrowLeft size={16} /> {t('ch.archived')}
            </button>
          ) : (
            <h3 className="text-base font-bold text-ink">{t('ch.friends')}</h3>
          )}
          {connecting && (
            <span role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-xs text-muted" data-testid="chat-connecting">
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              {t('ch.connecting')}
            </span>
          )}
        </div>
      )}

      {!showArchive && !selection && <UserSearchBar onOpen={() => {}} />}

      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-3">
        {loadingConversations && (
          <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-muted" /></div>
        )}
        {!loadingConversations && conversationsError && conversations.length === 0 && (
          <div className="text-center px-4 py-6">
            <p className="text-sm text-danger font-medium mb-2">{t('ch.loadFail')}</p>
            <button type="button" onClick={loadConversations} className="min-h-11 px-3 text-xs font-semibold text-accent hover:underline">{t('ch.reload')}</button>
          </div>
        )}
        {!showArchive && !selection && archived.length > 0 && (
          <button type="button" onClick={() => setShowArchive(true)} className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left hover:bg-bg" data-testid="archive-folder">
            <span className="w-[52px] h-[52px] rounded-full bg-bg-sunken text-muted grid place-items-center flex-shrink-0"><Archive size={20} /></span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-ink">{t('ch.archived')}</span>
              <span className="block text-[13px] text-muted truncate">{archived.map((c) => c.otherUser?.nickname || `@${c.otherUser?.username || ''}`).join(', ')}</span>
            </span>
            {archivedUnread > 0 && <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-muted text-surface text-[11px] font-bold flex items-center justify-center">{archivedUnread}</span>}
          </button>
        )}
        {!loadingConversations && !conversationsError && visible.length === 0 && (
          <p className="text-center text-xs text-muted px-4 py-6">{showArchive ? t('ch.noArchived') : t('ch.empty')}</p>
        )}
        {visible.map((c) => (
          <ConversationRow
            key={c.id}
            c={c}
            selected={String(selectedId) === String(c.id)}
            selecting={!!selection}
            checked={selectedIds.has(String(c.id))}
            onOpen={onSelect}
            onMenu={openMenu}
            onToggle={toggle}
            online={c.otherUser?.showPresence !== false && isOnline(c.otherUser?.lastActiveAt, livePresence[String(c.otherUser?.id)])}
            typing={typingByConversation[c.id]}
            draft={getDraft(drafts, c.id)}
          />
        ))}
      </div>

      <ActionSheet
        open={!!menuFor}
        title={menuFor ? menuFor.c.otherUser?.nickname || `@${menuFor.c.otherUser?.username || ''}` : ''}
        items={menuFor ? menuItems(menuFor.c) : []}
        onClose={() => setMenuFor(null)}
        anchorRef={menuFor?.anchorRef || undefined}
        anchorPoint={menuFor?.point || null}
        testid="chat-menu"
      />
      <DeleteConversationModal
        open={!!deleteIds}
        count={deleteIds?.length || 1}
        otherUsername={deleteIds?.length === 1 ? conversations.find((c) => String(c.id) === deleteIds[0])?.otherUser?.username : undefined}
        onConfirm={deleting ? undefined : handleConfirmDelete}
        onCancel={() => setDeleteIds(null)}
      />
    </div>
  );
}
