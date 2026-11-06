'use client';
import { useT } from '@/context/LocaleContext';
import { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Loader2, X, Pencil, Reply, FileText, Plus } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import { REPLY_TYPE_LABEL } from '@/lib/chatConstants';
import { stageFiles, filesFromDataTransfer, ATTACH } from '@/lib/chat/attachments';
import { formatBytes, fileExtension } from '@/lib/chat/mediaMeta';
import { getDraft } from '@/lib/chat/drafts';
import { VoiceRecorderButton } from './VoiceRecorder';
import VideoRecorderButton from './VideoRecorder';
import EmojiPicker from './EmojiPicker';

// Composer (Telegram parity): many attachments in one tray with previews, one caption for an album,
// "send as file", drag & drop / paste of several files, a draft (text + reply) that survives leaving
// the chat, and sending that never blocks typing — every file becomes its own bubble at once.
const MAX_TEXTAREA_HEIGHT = 120;
const DRAFT_DEBOUNCE_MS = 400;

function TrayItem({ att, onRemove, t }) {
  // Object URL made once per item (lazy state) and released when the tile goes away.
  const [url] = useState(() => (att.type === 'file' ? null : URL.createObjectURL(att.file)));
  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);
  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-bg border border-border flex-shrink-0" title={att.name}>
      {att.type === 'image' && url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" />
      )}
      {att.type === 'video' && url && <video src={url} muted className="w-full h-full object-cover" />}
      {att.type === 'file' && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 text-muted">
          <FileText size={18} />
          <span className="text-[9px] font-semibold uppercase">{fileExtension(att.name, att.file.type).slice(0, 4)}</span>
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('ch.tray.remove')}
        className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-black/60 text-white grid place-items-center hover:bg-black/80"
      >
        <X size={12} />
      </button>
      <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] px-1 truncate">{formatBytes(att.size)}</span>
    </div>
  );
}

export default function Composer() {
  const { t, ts } = useT();
  const {
    sendMessage,
    sendAttachments,
    editingMessage,
    editMessage,
    cancelEditMessage,
    replyingTo,
    startReply,
    cancelReply,
    activeConversation,
    sendTyping,
    drafts,
    saveDraft,
    clearDraftAfterSend,
    stagedFiles,
    stageExternalFiles,
  } = useChat();
  const { chatUserId: myId } = useApp();
  const conversationId = activeConversation?.id;
  const draft = getDraft(drafts, conversationId);
  const [text, setText] = useState(() => draft?.text || '');
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [tray, setTray] = useState([]); // staged attachments: { id, file, type, name, size }
  const [asFile, setAsFile] = useState(false);
  const [trayError, setTrayError] = useState('');
  const [voiceActive, setVoiceActive] = useState(false);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const draftTimer = useRef(null);
  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; });

  // Draft restore (reply target) once per conversation mount — the text came through useState.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (draft?.replyTo && !replyingTo) startReply({ id: draft.replyTo.id, senderId: draft.replyTo.senderId, type: draft.replyTo.type, text: draft.replyTo.text, mediaKey: draft.replyTo.mediaKey || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draft save: debounced on text change, immediately on reply change; cleared on send; a pending
  // save is flushed on unmount (leaving the chat right after typing keeps the last characters).
  // `syncedTextRef` — the text this composer last saved or received from the draft store: when the
  // textarea still equals it, nothing local is unsaved and a newer remote draft may replace it (WP6).
  const syncedTextRef = useRef(text);
  const pendingSaveRef = useRef(null); // () => void while a debounced save is waiting
  const persistDraft = (nextText, nextReply) => {
    if (!conversationId) return;
    pendingSaveRef.current = null;
    syncedTextRef.current = nextText;
    saveDraft(conversationId, { text: nextText, replyTo: nextReply ? { id: nextReply.id, senderId: nextReply.senderId, type: nextReply.type, text: nextReply.text, mediaKey: nextReply.mediaKey || null } : null });
  };
  const scheduleDraft = (nextText) => {
    clearTimeout(draftTimer.current);
    const save = () => persistDraft(nextText, replyingTo);
    pendingSaveRef.current = save;
    draftTimer.current = setTimeout(save, DRAFT_DEBOUNCE_MS);
  };
  // Saves only when the reply target really changed: on mount (and its StrictMode re-run) the target is
  // restored right after this effect, so saving then would write a transient "no reply" draft and
  // bounce a needless PUT to the server.
  const lastReplyIdRef = useRef(replyingTo?.id ?? null);
  useEffect(() => {
    const replyId = replyingTo?.id ?? null;
    if (replyId === lastReplyIdRef.current) return;
    lastReplyIdRef.current = replyId;
    if (editingMessage) return;
    clearTimeout(draftTimer.current);
    persistDraft(textRef.current, replyingTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyingTo]);
  useEffect(
    () => () => {
      clearTimeout(draftTimer.current);
      pendingSaveRef.current?.();
    },
    []
  );

  // WP6: a newer draft from another tab/device (server) replaces the text only when this composer has
  // nothing unsaved and the user is not typing here (textarea not focused); otherwise local text wins.
  const appliedSyncRef = useRef(draft?.syncedAt || 0);
  const remoteSyncedAt = draft?.syncedAt || 0;
  const remoteDirty = !!draft?.dirty;
  const remoteText = draft?.text ?? '';
  useEffect(() => {
    if (remoteDirty || remoteSyncedAt <= appliedSyncRef.current) return;
    appliedSyncRef.current = remoteSyncedAt;
    if (editingMessage || pendingSaveRef.current) return;
    if (textInputRef.current && document.activeElement === textInputRef.current) return;
    if (textRef.current !== syncedTextRef.current || textRef.current === remoteText) return;
    syncedTextRef.current = remoteText;
    setText(remoteText);
  }, [remoteSyncedAt, remoteDirty, remoteText, editingMessage]);

  // Edit mode: the message text replaces the input; leaving edit mode restores nothing (draft is separate).
  const [prevEditing, setPrevEditing] = useState(null);
  if (prevEditing !== editingMessage) {
    setPrevEditing(editingMessage);
    if (!editingMessage) {
      if (prevEditing != null) setText('');
    } else {
      setText(editingMessage.text);
      setTray([]);
    }
  }
  useEffect(() => {
    if (editingMessage) textInputRef.current?.focus();
  }, [editingMessage]);
  useEffect(() => {
    if (replyingTo) textInputRef.current?.focus();
  }, [replyingTo]);

  useEffect(() => {
    const el = textInputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    if (!el.scrollHeight) return;
    const border = el.offsetHeight - el.clientHeight;
    const needed = el.scrollHeight + border;
    el.style.height = `${Math.min(needed, MAX_TEXTAREA_HEIGHT)}px`;
    el.style.overflowY = needed > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  }, [text]);

  const addFiles = (files) => {
    const { accepted, rejected } = stageFiles(files, { existingCount: tray.length, asFile });
    if (accepted.length) setTray((prev) => [...prev, ...accepted]);
    const tooBig = rejected.find((r) => r.reason === 'too_big');
    const tooMany = rejected.find((r) => r.reason === 'too_many');
    setTrayError(
      tooBig
        ? t('ch.tray.tooBig', { name: tooBig.file.name, mb: Math.round(ATTACH.maxBytes[asFile ? 'file' : tooBig.file.type.startsWith('video/') ? 'video' : tooBig.file.type.startsWith('image/') ? 'image' : 'file'] / 1024 / 1024) })
        : tooMany
          ? t('ch.tray.tooMany', { n: ATTACH.maxPerMessage })
          : ''
    );
    textInputRef.current?.focus();
  };

  // Files dropped on the conversation area land in the tray (effect sits after addFiles on purpose).
  const addFilesRef = useRef(null);
  useEffect(() => { addFilesRef.current = addFiles; });
  useEffect(() => {
    if (!stagedFiles) return;
    addFilesRef.current?.(stagedFiles);
    stageExternalFiles(null);
  }, [stagedFiles, stageExternalFiles]);

  const clearTray = () => {
    setTray([]);
    setTrayError('');
    setAsFile(false);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const clean = text.trim();
    if (editingMessage) {
      if (!clean || sending) return;
      setSending(true);
      const res = await editMessage(editingMessage.id, clean);
      if (res.error) alert(ts(res.error));
      else setText('');
      setSending(false);
      return;
    }
    if (tray.length) {
      // Attachments: bubbles appear at once, uploads run in the background — the tray is free again.
      const items = tray.map((a) => ({ ...a, type: asFile ? 'file' : a.type }));
      const res = sendAttachments(items, { caption: clean, replyTo: replyingTo, asFile });
      if (res?.error) return alert(ts(res.error));
      clearTray();
      setText('');
      clearTimeout(draftTimer.current);
      pendingSaveRef.current = null;
      syncedTextRef.current = '';
      clearDraftAfterSend(conversationId);
      textInputRef.current?.focus();
      return;
    }
    if (!clean) return;
    setText('');
    clearTimeout(draftTimer.current);
    pendingSaveRef.current = null;
    syncedTextRef.current = '';
    clearDraftAfterSend(conversationId);
    textInputRef.current?.focus();
    sendMessage({ type: 'text', text: clean }).then((res) => {
      if (res?.error && res.error !== 'Tarmoq xatoligi') alert(ts(res.error));
    });
  };

  const handleCancelEdit = () => {
    cancelEditMessage();
    setText('');
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (editingMessage) handleCancelEdit();
      else if (tray.length) clearTray();
      else if (replyingTo) cancelReply();
      return;
    }
    if (e.key !== 'Enter' || e.shiftKey) return;
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    handleSend();
  };

  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length) addFiles(files);
  };

  const handlePaste = (e) => {
    const files = filesFromDataTransfer(e.clipboardData);
    if (!files.length) return;
    e.preventDefault();
    addFiles(files);
  };

  // Recorded voice/video go straight out as their own bubbles (never blocks typing).
  const handleRecordedVoice = (file, durationSec, waveform) => {
    const extra = { ...(durationSec > 0 ? { durationSec: Math.round(durationSec) } : {}), ...(waveform ? { waveform } : {}) };
    sendAttachments([{ id: `v${Date.now()}`, file, type: 'voice', name: file.name, size: file.size, extra }], { replyTo: replyingTo });
  };
  const handleRecordedVideo = (file, durationSec) => {
    const extra = { round: true, ...(durationSec > 0 ? { durationSec: Math.round(durationSec) } : {}) };
    sendAttachments([{ id: `r${Date.now()}`, file, type: 'video', name: file.name, size: file.size, extra }], { replyTo: replyingTo });
  };

  const handleEmojiPick = (emoji) => {
    const input = textInputRef.current;
    const start = input?.selectionStart ?? text.length;
    const end = input?.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    scheduleDraft(next);
    requestAnimationFrame(() => {
      if (!input) return;
      const pos = start + emoji.length;
      if (!window.matchMedia('(max-width: 767px)').matches) input.focus();
      input.setSelectionRange(pos, pos);
    });
  };

  const handleStickerPick = async (stickerId) => {
    setEmojiOpen(false);
    if (editingMessage) return;
    const res = await sendMessage({ type: 'sticker', stickerId });
    if (res?.error) alert(ts(res.error));
  };

  const replySenderLabel = replyingTo
    ? String(replyingTo.senderId) === String(myId)
      ? t('ch.you')
      : activeConversation?.otherUser?.username
        ? `@${activeConversation.otherUser.username}`
        : t('ch.user')
    : '';
  const replyPreview = replyingTo && (replyingTo.type === 'text' ? replyingTo.text : ts(REPLY_TYPE_LABEL[replyingTo.type] || ''));
  const hasContent = !!text.trim() || tray.length > 0 || sending;
  const showRecordersMobile = !hasContent || voiceActive;
  const bannerCloseClass =
    'inline-flex items-center justify-center min-w-11 min-h-11 -m-3 md:min-w-0 md:min-h-0 md:m-0 md:p-0.5 text-muted hover:text-accent transition-colors flex-shrink-0';
  const mediaCount = tray.filter((a) => a.type !== 'file').length;

  return (
    <div className="border-t border-border bg-surface" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} data-testid="composer">
      {editingMessage && (
        <div className="flex items-center gap-2 px-3.5 pt-2 text-xs text-accent">
          <Pencil size={12} className="flex-shrink-0" />
          <span className="flex-1 min-w-0 truncate">{t('ch.editing')}</span>
          <button onClick={handleCancelEdit} aria-label={t('ch.cancelEditAria')} type="button" className={bannerCloseClass}>
            <X size={14} />
          </button>
        </div>
      )}
      {!editingMessage && replyingTo && (
        <div className="flex items-center gap-2 px-3.5 pt-2 text-xs" data-testid="reply-banner">
          <Reply size={12} className="flex-shrink-0 text-accent" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-accent truncate">{t('ch.replyTo', { who: replySenderLabel })}</p>
            <p className="text-muted truncate">{replyPreview || '…'}</p>
          </div>
          <button onClick={cancelReply} aria-label={t('ch.cancelReplyAria')} type="button" className={bannerCloseClass}>
            <X size={14} />
          </button>
        </div>
      )}
      {tray.length > 0 && (
        <div className="px-3.5 pt-2" data-testid="attachment-tray">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {tray.map((att) => (
              <TrayItem key={att.id} att={att} t={t} onRemove={() => setTray((prev) => prev.filter((a) => a.id !== att.id))} />
            ))}
            {tray.length < ATTACH.maxPerMessage && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label={t('ch.tray.add')}
                title={t('ch.tray.add')}
                className="w-16 h-16 rounded-lg border border-dashed border-border text-muted hover:text-accent hover:border-accent/50 grid place-items-center flex-shrink-0"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted mt-1">
            <span>{t('ch.tray.count', { n: tray.length })}</span>
            {mediaCount > 0 && (
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={asFile} onChange={(e) => setAsFile(e.target.checked)} className="w-3.5 h-3.5 accent-accent" />
                {t('ch.tray.asFile')}
              </label>
            )}
            <button type="button" onClick={clearTray} className="ml-auto text-muted hover:text-danger">{t('ch.cancel')}</button>
          </div>
          {trayError && <p className="text-[11px] text-danger mt-0.5" role="alert">{trayError}</p>}
        </div>
      )}
      <form onSubmit={handleSend} className="flex items-end gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 relative">
        <div className="flex-1 min-w-0 flex items-end gap-0.5 bg-bg rounded-2xl pl-1 pr-1 md:py-1">
          <div className="relative flex-shrink-0">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setEmojiOpen((v) => !v)}
              title={t('ch.emoji')}
              aria-label={t('ch.emojiPick')}
              className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center text-muted hover:text-accent hover:bg-primary-soft rounded-full transition-colors emoji font-chat"
            >
              🙂
            </button>
            {emojiOpen && (
              <EmojiPicker triggerRef={emojiButtonRef} onPick={handleEmojiPick} onPickSticker={handleStickerPick} onClose={() => setEmojiOpen(false)} />
            )}
          </div>

          <textarea
            ref={textInputRef}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              scheduleDraft(e.target.value);
              sendTyping();
            }}
            onKeyDown={handleTextareaKeyDown}
            onPaste={handlePaste}
            placeholder={tray.length ? (mediaCount > 1 ? t('ch.captionAlbum') : t('ch.captionPh')) : t('ch.msgPh')}
            aria-label={tray.length ? t('ch.captionAria') : t('ch.msgAria')}
            className="flex-1 min-w-0 px-1.5 py-3 md:py-1.5 bg-transparent text-ink placeholder:text-muted text-base md:text-sm leading-5 outline-none font-chat resize-none"
          />

          {!editingMessage && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                aria-label={t('ch.pickFileAria')}
                className="hidden"
                onChange={handleFilePick}
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.mp3,.m4a,.ogg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={t('ch.attach')}
                aria-label={t('ch.attach')}
                className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center text-muted hover:text-accent hover:bg-primary-soft rounded-full transition-colors flex-shrink-0"
              >
                <Paperclip size={17} />
              </button>
            </>
          )}
        </div>

        {!editingMessage && (
          <div className={`${showRecordersMobile ? 'flex' : 'hidden'} sm:flex items-end gap-0.5 flex-shrink-0`}>
            <VoiceRecorderButton onRecorded={handleRecordedVoice} onActiveChange={setVoiceActive} />
            <VideoRecorderButton onRecorded={handleRecordedVideo} />
          </div>
        )}

        <button
          type="submit"
          disabled={(!text.trim() && !tray.length) || (sending && !!editingMessage)}
          aria-label={editingMessage ? t('ch.saveEdit') : t('ch.sendMsg')}
          data-testid="send-button"
          className={`${hasContent || editingMessage ? 'inline-flex' : 'hidden'} sm:inline-flex items-center justify-center w-11 h-11 md:w-auto md:h-auto md:p-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-on-accent rounded-full transition-colors flex-shrink-0`}
        >
          {sending && editingMessage ? <Loader2 size={16} className="animate-spin" /> : editingMessage ? <Pencil size={16} /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
