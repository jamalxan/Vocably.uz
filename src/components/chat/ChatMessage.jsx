'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Copy, Check, Pencil } from 'lucide-react';
import PendingAddWordsCard from './PendingAddWordsCard';

export default function ChatMessage({ msg, index, categories, sessionId, onResolvedAdd, onEdit }) {
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
        <div className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
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
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isUser
              ? 'bg-accent text-white rounded-br-none'
              : 'bg-bg text-primary rounded-bl-none border border-border'
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

        {!isUser && text && (
          <button
            onClick={handleCopy}
            className="mt-1 flex items-center gap-1 text-[10px] text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
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
