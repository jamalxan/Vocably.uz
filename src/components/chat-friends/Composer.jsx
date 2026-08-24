'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Loader2, X, Pencil } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { VoiceRecorderButton } from './VoiceRecorder';
import VideoRecorderButton from './VideoRecorder';
import EmojiPicker from './EmojiPicker';

const MAX_SIZE = { image: 10 * 1024 * 1024, video: 60 * 1024 * 1024, file: 25 * 1024 * 1024 };

export default function Composer() {
  const { sendMessage, uploadAndSend, editingMessage, editMessage, cancelEditMessage } = useChat();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const emojiButtonRef = useRef(null);

  // Tahrirlash rejimiga o'tilganda xabar matni inputga tushadi va fokus beriladi.
  useEffect(() => {
    if (!editingMessage) return;
    setText(editingMessage.text);
    textInputRef.current?.focus();
  }, [editingMessage]);

  const handleSendText = async (e) => {
    e?.preventDefault();
    const clean = text.trim();
    if (!clean || sending) return;
    setSending(true);

    if (editingMessage) {
      const res = await editMessage(editingMessage.id, clean);
      if (res.error) alert(res.error);
      else setText('');
    } else {
      setText('');
      const res = await sendMessage({ type: 'text', text: clean });
      if (res.error) {
        setText(clean);
        alert(res.error);
      }
    }
    setSending(false);
  };

  const handleCancelEdit = () => {
    cancelEditMessage();
    setText('');
  };

  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
    if (file.size > MAX_SIZE[type]) {
      alert(`Fayl juda katta (maksimum ${Math.round(MAX_SIZE[type] / 1024 / 1024)}MB)`);
      return;
    }
    setSending(true);
    const res = await uploadAndSend(file, type);
    if (res.error) alert(res.error);
    setSending(false);
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

  return (
    <div className="border-t border-border bg-surface">
      {editingMessage && (
        <div className="flex items-center gap-2 px-3.5 pt-2 text-xs text-accent">
          <Pencil size={12} className="flex-shrink-0" />
          <span className="flex-1 min-w-0 truncate">Xabarni tahrirlash</span>
          <button onClick={handleCancelEdit} className="p-0.5 text-muted hover:text-accent transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}
      <form onSubmit={handleSendText} className="flex items-center gap-1.5 px-3 py-2.5 relative">
        {!editingMessage && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFilePick}
              accept="image/*,video/*,.pdf,.doc,.docx,.zip,.txt"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Fayl biriktirish"
              className="p-2 text-muted hover:text-accent hover:bg-bg rounded-lg transition-colors flex-shrink-0"
            >
              <Paperclip size={18} />
            </button>

            <VoiceRecorderButton onRecorded={handleRecordedVoice} />
            <VideoRecorderButton onRecorded={handleRecordedVideo} />
          </>
        )}

        <div className="relative flex-shrink-0">
          <button
            ref={emojiButtonRef}
            type="button"
            onClick={() => setEmojiOpen((v) => !v)}
            title="Emoji"
            className="w-9 h-9 flex items-center justify-center text-muted hover:bg-bg rounded-lg transition-colors emoji font-chat"
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

        <input
          ref={textInputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && editingMessage) handleCancelEdit();
          }}
          placeholder="Xabar yozing..."
          className="flex-1 min-w-0 px-3.5 py-2 bg-bg rounded-full text-sm outline-none focus:ring-2 focus:ring-accent/20 font-chat"
        />

        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-on-accent rounded-full transition-colors flex-shrink-0"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : editingMessage ? <Pencil size={16} /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
