'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Copy, Check, Pencil, RotateCcw } from 'lucide-react';
import PendingAddWordsCard from './PendingAddWordsCard';

export default function ChatMessage({ msg, index, categories, sessionId, onResolvedAdd, onEdit, onRetry }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';
  const text = msg.parts?.[0]?.text || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-primary text-on-accent flex items-center justify-center flex-shrink-0 mt-0.5 shadow-glow">
          <Sparkles size={13} />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[80%] group ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {(msg.imageUrls?.length > 0 || msg.imageUrl) && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {(msg.imageUrls?.length > 0 ? msg.imageUrls : [msg.imageUrl]).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt="Yuklangan rasm"
                className="max-w-[220px] rounded-xl border border-border"
              />
            ))}
          </div>
        )}
        {msg.aiError ? (
          // TZ-vocably-v2.md §D1.3/H3 — AI xatosi: faqat o'zbekcha xabar + "Qayta urinish"
          // tugmasi, provayder/model/URL hech qachon ko'rinmaydi. requestId kichik shrift
          // bilan (support so'ralganda shu ID orqali logdan topiladi).
          <div className="rounded-2xl px-4 py-2.5 text-sm bg-danger-soft text-danger rounded-bl-none border border-danger/20 max-w-sm">
            <p>{msg.aiError.message}</p>
            <div className="flex items-center justify-between gap-3 mt-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1 text-xs font-semibold hover:underline"
                >
                  <RotateCcw size={12} /> Qayta urinish
                </button>
              )}
              {msg.aiError.requestId && (
                <span className="text-[10px] text-danger/70 font-mono truncate" title={msg.aiError.requestId}>
                  {msg.aiError.requestId}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm ${
              isUser
                ? 'bg-accent text-on-accent rounded-br-none'
                : 'bg-bg text-ink rounded-bl-none border border-border'
            }`}
          >
            {isUser ? (
              <span className="whitespace-pre-wrap">{text}</span>
            ) : (
              <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-pre:bg-primary-hover prose-pre:text-on-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || ' '}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {!isUser && text && (
          <button
            onClick={handleCopy}
            className="mt-1 flex items-center gap-1 text-[10px] text-muted hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Nusxalandi' : 'Nusxalash'}
          </button>
        )}
        {isUser && onEdit && (
          <button
            onClick={() => onEdit(text)}
            className="mt-1 flex items-center gap-1 text-[10px] text-on-accent/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil size={11} /> Tahrirlash
          </button>
        )}

        {msg.pendingAction && (
          <PendingAddWordsCard
            pendingAction={msg.pendingAction}
            categories={categories}
            sessionId={sessionId}
            onResolved={(data) => onResolvedAdd(index, data)}
          />
        )}
      </div>
    </div>
  );
}
