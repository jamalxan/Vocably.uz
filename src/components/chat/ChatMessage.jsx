'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Copy, Check, Pencil, RotateCcw, BookMarked } from 'lucide-react';
import PendingAddWordsCard from './PendingAddWordsCard';
import QuizCard from './QuizCard';

// @tailwindcss/typography o'rnatilmagan — `prose` klasslari ishlamasdi, shuning uchun
// har bir markdown elementi uchun token asosidagi utility klasslar (blog sahifasi kabi).
const mdTag = (Tag, className) => {
  function MdTag({ node, ...props }) {
    void node;
    return <Tag className={className} {...props} />;
  }
  return MdTag;
};

const MD_COMPONENTS = {
  p: mdTag('p', 'my-1.5 first:mt-0 last:mb-0 leading-relaxed'),
  h1: mdTag('h1', 'text-base font-bold text-ink mt-3 mb-1.5 first:mt-0'),
  h2: mdTag('h2', 'text-[15px] font-bold text-ink mt-3 mb-1.5 first:mt-0'),
  h3: mdTag('h3', 'text-sm font-bold text-ink mt-2.5 mb-1 first:mt-0'),
  h4: mdTag('h4', 'text-sm font-semibold text-ink mt-2 mb-1 first:mt-0'),
  ul: mdTag('ul', 'list-disc pl-5 my-1.5 space-y-0.5'),
  ol: mdTag('ol', 'list-decimal pl-5 my-1.5 space-y-0.5'),
  li: mdTag('li', 'pl-0.5'),
  strong: mdTag('strong', 'font-semibold text-ink'),
  a: mdTag('a', 'text-accent underline underline-offset-2 hover:text-accent-hover'),
  blockquote: mdTag('blockquote', 'border-l-2 border-accent/40 pl-3 my-2 text-muted'),
  hr: mdTag('hr', 'border-border my-3'),
  code: mdTag('code', 'px-1 py-0.5 rounded bg-bg-sunken text-[0.9em] font-mono'),
  pre: mdTag(
    'pre',
    'my-2 p-3 rounded-lg bg-primary-hover text-on-primary text-xs font-mono overflow-x-auto max-w-full [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit'
  ),
  table: ({ node, ...props }) => {
    void node;
    return (
      <div className="my-2 overflow-x-auto max-w-full">
        <table className="text-xs border-collapse" {...props} />
      </div>
    );
  },
  th: mdTag('th', 'border border-border bg-bg-sunken px-2 py-1 text-left font-semibold'),
  td: mdTag('td', 'border border-border px-2 py-1 align-top'),
};

// Tugmalar faqat hover'da ko'rinardi — sensorli ekranda doim ko'rinadi, lg+ da hover/fokusda.
const MSG_ACTION_CLS =
  'mt-0.5 min-h-11 lg:min-h-0 lg:mt-1 flex items-center gap-1 text-[11px] text-muted hover:text-ink opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity';

export default function ChatMessage({ msg, index, categories, sessionId, onResolvedAdd, onEdit, onRetry }) {
  const [copyState, setCopyState] = useState(null); // null | 'ok' | 'error'
  const isUser = msg.role === 'user';
  const text = msg.parts?.[0]?.text || '';

  const handleCopy = () => {
    const done = (state) => {
      setCopyState(state);
      setTimeout(() => setCopyState(null), 1500);
    };
    if (!navigator.clipboard?.writeText) return done('error');
    navigator.clipboard.writeText(text).then(
      () => done('ok'),
      () => done('error')
    );
  };

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-primary text-on-accent flex items-center justify-center flex-shrink-0 mt-0.5 shadow-glow">
          <Sparkles size={13} />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[80%] min-w-0 group ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {(msg.imageUrls?.length > 0 || msg.imageUrl) && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {(msg.imageUrls?.length > 0 ? msg.imageUrls : [msg.imageUrl]).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt="Yuklangan rasm"
                className="max-w-[min(220px,100%)] rounded-xl border border-border"
              />
            ))}
          </div>
        )}
        {/* TZ-vocably-v2.md §D2.1 — Word Picker orqali tanlangan so'zlar chat tarixida
            ham chip sifatida ko'rinadi (matn ichiga aralashtirilmaydi). */}
        {msg.wordChips?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5 justify-end">
            {msg.wordChips.map((w) => (
              <span
                key={w.wordId}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-soft text-accent rounded-full text-[11px] font-semibold"
              >
                <BookMarked size={10} /> {w.word}
              </span>
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
                <span className="text-[11px] text-danger/80 font-mono truncate" title={msg.aiError.requestId}>
                  {msg.aiError.requestId}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`min-w-0 max-w-full rounded-2xl px-4 py-2.5 text-sm break-words [overflow-wrap:anywhere] ${
              isUser
                ? 'bg-accent text-on-accent rounded-br-none'
                : 'bg-bg text-ink rounded-bl-none border border-border'
            }`}
          >
            {isUser ? (
              <span className="whitespace-pre-wrap">{text}</span>
            ) : (
              <div className="min-w-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                  {text || ' '}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {!isUser && text && (
          <button onClick={handleCopy} className={MSG_ACTION_CLS}>
            {copyState === 'ok' ? <Check size={12} /> : <Copy size={12} />}{' '}
            {copyState === 'ok' ? 'Nusxalandi' : copyState === 'error' ? "Nusxalab bo'lmadi" : 'Nusxalash'}
          </button>
        )}
        {isUser && onEdit && (
          <button onClick={() => onEdit(text)} className={MSG_ACTION_CLS}>
            <Pencil size={12} /> Tahrirlash
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
        {msg.quizAction && <QuizCard quizAction={msg.quizAction} />}
      </div>
    </div>
  );
}
