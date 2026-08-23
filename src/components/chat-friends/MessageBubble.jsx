'use client';
import { useState } from 'react';
import { Download, FileText, Flag } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuthedMediaUrl } from '@/lib/useAuthedMedia';
import { findSticker } from '@/lib/stickers';
import { useChat } from '@/context/ChatContext';

function ImageBubble({ media }) {
  const { token } = useApp();
  const { url } = useAuthedMediaUrl(media.key, token);
  const [open, setOpen] = useState(false);
  if (!url) return <div className="w-40 h-32 bg-primary-soft rounded-lg animate-pulse" />;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Rasm"
        onClick={() => setOpen(true)}
        className="max-w-[240px] max-h-[280px] rounded-lg cursor-zoom-in object-cover"
      />
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Rasm" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </>
  );
}

function VideoBubble({ media }) {
  const { token } = useApp();
  const { url } = useAuthedMediaUrl(media.key, token);
  if (!url) return <div className="w-56 h-40 bg-primary-soft rounded-lg animate-pulse" />;
  return <video src={url} controls className="max-w-[260px] max-h-[300px] rounded-lg" />;
}

function VoiceBubble({ media }) {
  const { token } = useApp();
  const { url } = useAuthedMediaUrl(media.key, token);
  if (!url) return <div className="w-48 h-10 bg-primary-soft rounded-full animate-pulse" />;
  return <audio src={url} controls className="w-56 h-10" />;
}

function FileBubble({ media }) {
  const { token } = useApp();
  const { url } = useAuthedMediaUrl(media.key, token);
  return (
    <a
      href={url || '#'}
      download
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 px-3 py-2 bg-surface/70 rounded-lg text-sm text-primary hover:bg-surface"
    >
      <FileText size={16} />
      <span className="truncate max-w-[160px]">Fayl</span>
      <Download size={14} className="ml-auto flex-shrink-0" />
    </a>
  );
}

export default function MessageBubble({ message, isMine }) {
  const { reportTarget } = useChat();
  const [reported, setReported] = useState(false);

  const sticker = message.type === 'sticker' ? findSticker(message.stickerId) : null;

  const handleReport = async () => {
    const reason = window.prompt("Shikoyat sababi:");
    if (!reason?.trim()) return;
    const ok = await reportTarget('message', message.id || message._id, reason.trim());
    if (ok) setReported(true);
  };

  const isPlain = message.type === 'sticker';

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex items-end gap-1.5 max-w-[85%] ${isMine ? 'flex-row-reverse' : ''}`}>
        <div
          className={
            isPlain
              ? ''
              : `rounded-2xl px-3.5 py-2.5 text-sm ${
                  isMine ? 'bg-accent text-white rounded-br-md' : 'bg-bg text-primary rounded-bl-md'
                }`
          }
        >
          {message.type === 'text' && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
          {message.type === 'sticker' && sticker && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={sticker.file} alt={sticker.label} className="w-24 h-24" />
          )}
          {message.type === 'image' && <ImageBubble media={message.media} />}
          {message.type === 'video' && <VideoBubble media={message.media} />}
          {message.type === 'voice' && <VoiceBubble media={message.media} />}
          {message.type === 'file' && <FileBubble media={message.media} />}
        </div>
        {!isMine && !reported && (
          <button
            onClick={handleReport}
            title="Shikoyat qilish"
            className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-accent transition-opacity flex-shrink-0"
          >
            <Flag size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
