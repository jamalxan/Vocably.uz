'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Loader2, X, Pencil, Reply, FileText } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import { getJwtUserId } from '@/lib/jwtClient';
import { REPLY_TYPE_LABEL } from '@/lib/chatConstants';
import { VoiceRecorderButton } from './VoiceRecorder';
import VideoRecorderButton from './VideoRecorder';
import EmojiPicker from './EmojiPicker';

const MAX_SIZE = { image: 10 * 1024 * 1024, video: 60 * 1024 * 1024, file: 25 * 1024 * 1024 };
// Textarea 1 qatordan boshlanadi va ~5 qatorgacha o'sadi, keyin ichida scroll paydo bo'ladi
// (AiChat.jsx'dagi bilan bir xil yondashuv — single-line <input> Shift+Enter'ni qo'llab-
// quvvatlolmaydi va ba'zi brauzerlarda "beep" tovushi bilan rad etadi).
const MAX_TEXTAREA_HEIGHT = 120;

export default function Composer() {
  const {
    sendMessage,
    uploadAndSend,
    editingMessage,
    editMessage,
    cancelEditMessage,
    replyingTo,
    cancelReply,
    activeConversation,
    sendTyping,
  } = useChat();
  const { token: myToken } = useApp();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  // Fayl tanlash/joylashtirish (paste) darhol yubormaydi — Telegram/WhatsApp uslubida
  // avval shu preview ko'rsatiladi (ixtiyoriy izoh yozish imkoni bilan), faqat "Yuborish"
  // tugmasi (yoki Enter) bosilganda haqiqatan yuklab yuboriladi. { file, type, previewUrl }
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const pendingAttachmentRef = useRef(null);
  pendingAttachmentRef.current = pendingAttachment;

  const clearPendingAttachment = () => {
    setPendingAttachment((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  };

  // Tahrirlash rejimiga o'tilganda xabar matni inputga tushadi va fokus beriladi
  // (kutilayotgan biriktirma bo'lsa — konflikt bo'lmasligi uchun bekor qilinadi).
  useEffect(() => {
    if (!editingMessage) return;
    setText(editingMessage.text);
    textInputRef.current?.focus();
    clearPendingAttachment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMessage]);

  // Javob berish rejimiga o'tilganda (xabardagi "Reply" tugmasi) inputga fokus
  // beriladi, lekin matn o'zgarmaydi — foydalanuvchi o'z javobini yozadi.
  useEffect(() => {
    if (replyingTo) textInputRef.current?.focus();
  }, [replyingTo]);

  // Matn o'zgarganda textarea balandligini moslaymiz; xabar yuborilib matn
  // tozalangach balandlik o'z-o'zidan 1 qatorga qaytadi.
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

  // Faqat unmount'da — biriktirma almashtirilganda/tozalanganda revoke qilish
  // clearPendingAttachment/setPendingAttachment ichida allaqachon bajariladi.
  useEffect(() => {
    return () => {
      if (pendingAttachment?.previewUrl) URL.revokeObjectURL(pendingAttachment.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendText = async (e) => {
    e?.preventDefault();
    if (sending) return;
    const clean = text.trim();

    if (editingMessage) {
      if (!clean) return;
      setSending(true);
      const res = await editMessage(editingMessage.id, clean);
      if (res.error) alert(res.error);
      else setText('');
      setSending(false);
      return;
    }

    if (pendingAttachment) {
      const { file, type } = pendingAttachment;
      setSending(true);
      setText('');
      clearPendingAttachment();
      // Video biriktirilgan bo'lsa (fayl tanlash/paste orqali, mikrofon/kamera
      // yozuvi emas) — yuklanayotgan payt boshqa tomonga "video yubormoqda..."
      // ko'rsatiladi (VoiceRecorder/VideoRecorder'dagi bilan bir xil kanal).
      if (type === 'video') sendTyping('video');
      const res = await uploadAndSend(file, type, clean || undefined);
      if (res.error) alert(res.error);
      setSending(false);
      return;
    }

    if (!clean) return;
    setSending(true);
    setText('');
    const res = await sendMessage({ type: 'text', text: clean });
    if (res.error) {
      setText(clean);
      alert(res.error);
    }
    setSending(false);
  };

  const handleCancelEdit = () => {
    cancelEditMessage();
    setText('');
  };

  // Enter — yuborish, Shift+Enter — yangi qator (AiChat.jsx bilan bir xil).
  // IME (koreys/xitoy/yapon klaviaturasi) kompozitsiyasi paytida Enter xabarni
  // yubormasligi kerak.
  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (editingMessage) handleCancelEdit();
      else if (pendingAttachment) clearPendingAttachment();
      else if (replyingTo) cancelReply();
      return;
    }
    if (e.key !== 'Enter' || e.shiftKey) return;
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    handleSendText();
  };

  // Darhol yuklab yubormaydi — preview'ga qo'yadi, haqiqiy yuborish faqat
  // "Yuborish" tugmasi/Enter bosilganda (handleSendText) sodir bo'ladi.
  const stageAttachment = (file, type) => {
    if (file.size > MAX_SIZE[type]) {
      alert(`Fayl juda katta (maksimum ${Math.round(MAX_SIZE[type] / 1024 / 1024)}MB)`);
      return;
    }
    clearPendingAttachment();
    setPendingAttachment({
      file,
      type,
      previewUrl: type !== 'file' ? URL.createObjectURL(file) : null,
    });
    textInputRef.current?.focus();
  };

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
    stageAttachment(file, type);
  };

  // Boshqa joydan (screenshot, brauzer, fayl menejeri — nusxalangan istalgan fayl)
  // nusxalangan narsani to'g'ridan-to'g'ri matn maydoniga joylashtirib (Ctrl/Cmd+V)
  // preview'ga qo'yish — fayl tanlash oynasini ochmasdan, Telegram/WhatsApp Web
  // uslubida. Rasm/video bo'lsa shu turda, boshqa har qanday fayl (masalan .html,
  // .json, .pdf) 'file' turida biriktiriladi — mimeType server tomonda ('file'
  // uchun) cheklanmagan, faqat hajm tekshiriladi (src/lib/s3.js ALLOWED_MEDIA).
  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const fileItem = items.find((it) => it.kind === 'file');
    if (!fileItem) return;
    e.preventDefault();
    const file = fileItem.getAsFile();
    if (!file) return;
    const type = fileItem.type.startsWith('image/') ? 'image' : fileItem.type.startsWith('video/') ? 'video' : 'file';
    stageAttachment(file, type);
  };

  const handleRecordedVoice = async (file) => {
    setSending(true);
    const res = await uploadAndSend(file, 'voice');
    if (res.error) alert(res.error);
    setSending(false);
  };

  const handleRecordedVideo = async (file) => {
    setSending(true);
    const res = await uploadAndSend(file, 'video');
    if (res.error) alert(res.error);
    setSending(false);
  };

  // Tanlangan emoji xabar oxiriga emas, aynan kursor turgan joyga qo'shiladi.
  const handleEmojiPick = (emoji) => {
    const input = textInputRef.current;
    const start = input?.selectionStart ?? text.length;
    const end = input?.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);

    requestAnimationFrame(() => {
      if (!input) return;
      input.focus();
      const pos = start + emoji.length;
      input.setSelectionRange(pos, pos);
    });
  };

  const myId = getJwtUserId(myToken);
  const replySenderLabel = replyingTo
    ? String(replyingTo.senderId) === String(myId)
      ? 'Siz'
      : activeConversation?.otherUser?.username
        ? `@${activeConversation.otherUser.username}`
        : 'Foydalanuvchi'
    : '';
  const replyPreview = replyingTo && (replyingTo.type === 'text' ? replyingTo.text : REPLY_TYPE_LABEL[replyingTo.type] || '');

  return (
    <div className="border-t border-border bg-surface" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {editingMessage && (
        <div className="flex items-center gap-2 px-3.5 pt-2 text-xs text-accent">
          <Pencil size={12} className="flex-shrink-0" />
          <span className="flex-1 min-w-0 truncate">Xabarni tahrirlash</span>
          <button onClick={handleCancelEdit} aria-label="Tahrirlashni bekor qilish" className="p-0.5 text-muted hover:text-accent transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}
      {!editingMessage && replyingTo && (
        <div className="flex items-center gap-2 px-3.5 pt-2 text-xs">
          <Reply size={12} className="flex-shrink-0 text-accent" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-accent truncate">{replySenderLabel}ga javob</p>
            <p className="text-muted truncate">{replyPreview || '…'}</p>
          </div>
          <button onClick={cancelReply} aria-label="Javob berishni bekor qilish" className="p-0.5 text-muted hover:text-accent transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}
      {pendingAttachment && (
        <div className="flex items-center gap-2.5 px-3.5 pt-2">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg flex items-center justify-center flex-shrink-0">
            {pendingAttachment.type === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pendingAttachment.previewUrl} alt="" className="w-full h-full object-cover" />
            )}
            {pendingAttachment.type === 'video' && (
              <video src={pendingAttachment.previewUrl} className="w-full h-full object-cover" muted />
            )}
            {pendingAttachment.type === 'file' && <FileText size={18} className="text-muted" />}
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-semibold text-primary truncate">
              {pendingAttachment.type === 'image' ? 'Rasm' : pendingAttachment.type === 'video' ? 'Video' : pendingAttachment.file.name}
            </p>
            <p className="text-muted">{(pendingAttachment.file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <button onClick={clearPendingAttachment} aria-label="Biriktirilgan faylni olib tashlash" className="p-0.5 text-muted hover:text-accent transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}
      <form onSubmit={handleSendText} className="flex items-end gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 relative">
        {/* Yagona dumaloq "yozish qutisi" — emoji va fayl biriktirish tugmalari
            endi alohida qator elementi emas, aynan shu quti ICHIDA (WhatsApp/Telegram
            uslubi) — tor mobil ekranda ortiqcha qatorlar bosim qilmasligi uchun. */}
        <div className="flex-1 min-w-0 flex items-end gap-0.5 bg-bg rounded-2xl pl-1 pr-1 py-1">
          <div className="relative flex-shrink-0">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setEmojiOpen((v) => !v)}
              title="Emoji"
              aria-label="Emoji tanlash"
              className="w-8 h-8 flex items-center justify-center text-muted hover:text-accent hover:bg-primary-soft rounded-full transition-colors emoji font-chat"
            >
              🙂
            </button>
            {emojiOpen && (
              <EmojiPicker
                triggerRef={emojiButtonRef}
                onPick={(e) => {
                  handleEmojiPick(e);
                }}
                onClose={() => setEmojiOpen(false)}
              />
            )}
          </div>

          <textarea
            ref={textInputRef}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              sendTyping();
            }}
            onKeyDown={handleTextareaKeyDown}
            onPaste={handlePaste}
            placeholder={pendingAttachment ? "Izoh qo'shing (ixtiyoriy)..." : 'Xabar yozing...'}
            className="flex-1 min-w-0 px-1.5 py-1.5 bg-transparent text-sm leading-5 outline-none font-chat resize-none"
          />

          {!editingMessage && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFilePick}
                accept="image/*,video/*,.pdf,.doc,.docx,.zip,.txt,.html,.htm,.json"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Fayl biriktirish"
                aria-label="Fayl biriktirish"
                className="w-8 h-8 flex items-center justify-center text-muted hover:text-accent hover:bg-primary-soft rounded-full transition-colors flex-shrink-0"
              >
                <Paperclip size={17} />
              </button>
            </>
          )}
        </div>

        {!editingMessage && (
          <div className="flex items-end gap-0.5 flex-shrink-0">
            <VoiceRecorderButton onRecorded={handleRecordedVoice} />
            <VideoRecorderButton onRecorded={handleRecordedVideo} />
          </div>
        )}

        <button
          type="submit"
          disabled={(!text.trim() && !pendingAttachment) || sending}
          aria-label={editingMessage ? "Tahrirni saqlash" : 'Xabarni yuborish'}
          className="p-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-on-accent rounded-full transition-colors flex-shrink-0"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : editingMessage ? <Pencil size={16} /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
