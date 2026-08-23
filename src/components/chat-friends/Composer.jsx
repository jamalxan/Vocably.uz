'use client';
import { useRef, useState } from 'react';
import { Send, Paperclip, Smile, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { VoiceRecorderButton } from './VoiceRecorder';
import VideoRecorderButton from './VideoRecorder';
import StickerPicker from './StickerPicker';

const MAX_SIZE = { image: 10 * 1024 * 1024, video: 60 * 1024 * 1024, file: 25 * 1024 * 1024 };

export default function Composer() {
  const { sendMessage, uploadAndSend } = useChat();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleSendText = async (e) => {
    e?.preventDefault();
    const clean = text.trim();
    if (!clean || sending) return;
    setSending(true);
    setText('');
    const res = await sendMessage({ type: 'text', text: clean });
    if (res.error) {
      setText(clean);
      alert(res.error);
    }
    setSending(false);
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

  const handleSticker = async (stickerId) => {
    setSending(true);
    const res = await sendMessage({ type: 'sticker', stickerId });
    if (res.error) alert(res.error);
    setSending(false);
  };

  return (
    <form onSubmit={handleSendText} className="flex items-center gap-1.5 border-t border-border px-3 py-2.5 bg-surface relative">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePick} accept="image/*,video/*,.pdf,.doc,.docx,.zip,.txt" />
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

      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setStickerOpen((v) => !v)}
          title="Stiker"
          className="p-2 text-muted hover:text-accent hover:bg-bg rounded-lg transition-colors"
        >
          <Smile size={18} />
        </button>
        {stickerOpen && <StickerPicker onPick={handleSticker} onClose={() => setStickerOpen(false)} />}
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Xabar yozing..."
        className="flex-1 min-w-0 px-3.5 py-2 bg-bg rounded-full text-sm outline-none focus:ring-2 focus:ring-accent/20"
      />

      <button
        type="submit"
        disabled={!text.trim() || sending}
        className="p-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition-colors flex-shrink-0"
      >
        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </button>
    </form>
  );
}
