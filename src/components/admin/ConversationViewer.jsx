'use client';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, MessageSquareText, Image as ImageIcon, Video, Mic, Paperclip, Flag } from 'lucide-react';

const TYPE_ICON = { image: ImageIcon, video: Video, voice: Mic, file: Paperclip, text: MessageSquareText };

export default function ConversationViewer({ token }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    fetch('/api/admin/chat/conversations', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .finally(() => setLoading(false));
  }, [token]);

  const openConversation = async (c) => {
    setActive(c);
    setMessages(null);
    const res = await fetch(`/api/admin/chat/conversations/${c.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data.messages || []);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (active) {
    const p1 = active.participants[0];
    return (
      <div>
        <button
          onClick={() => setActive(null)}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={15} /> Suhbatlar ro'yxati
        </button>
        <p className="font-luxury text-lg text-primary mb-4">
          @{active.participants[0]?.username || active.participants[0]?.name || '?'}
          <span className="text-muted mx-2">↔</span>
          @{active.participants[1]?.username || active.participants[1]?.name || '?'}
        </p>
        {messages === null ? (
          <Loader2 className="animate-spin text-accent" size={22} />
        ) : (
          <div className="rounded-2xl border border-border bg-bg/60 shadow-card p-5 max-h-[65vh] overflow-y-auto space-y-3">
            {messages.map((m) => {
              const mine = String(m.senderId) === String(p1?._id);
              const Icon = TYPE_ICON[m.type] || MessageSquareText;
              return (
                <div key={m._id} className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm relative ${
                      mine
                        ? 'bg-surface border border-border text-primary rounded-bl-md'
                        : 'bg-accent text-on-accent rounded-br-md'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wide opacity-70">
                      <Icon size={11} />
                      {m.type}
                      {m.flagged && <Flag size={11} className="ml-1" />}
                    </div>
                    {m.type === 'text' && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                    {m.type === 'sticker' && <p className="opacity-80">stiker: {m.stickerId}</p>}
                    {['image', 'video', 'voice', 'file'].includes(m.type) && (
                      <p className="opacity-80">
                        {m.media?.mimeType} · {Math.round((m.media?.size || 0) / 1024)}KB
                      </p>
                    )}
                    <p className="text-[10px] opacity-60 mt-1.5">{new Date(m.createdAt).toLocaleString('uz-UZ')}</p>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && <p className="text-center text-sm text-muted py-8">Xabar yo'q</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card divide-y divide-border overflow-hidden">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => openConversation(c)}
          className="w-full text-left px-5 py-4 hover:bg-bg/60 flex items-center justify-between gap-3 transition-colors"
        >
          <span className="text-sm font-medium text-primary">
            @{c.participants[0]?.username || c.participants[0]?.name || '?'}
            <span className="text-muted mx-1.5">↔</span>
            @{c.participants[1]?.username || c.participants[1]?.name || '?'}
          </span>
          <span className="text-xs text-muted truncate max-w-[220px]">{c.lastMessagePreview}</span>
        </button>
      ))}
      {conversations.length === 0 && <p className="text-center text-sm text-muted py-10">Suhbat yo'q</p>}
    </div>
  );
}
