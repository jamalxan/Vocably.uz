'use client';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';

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
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    );
  }

  if (active) {
    return (
      <div>
        <button
          onClick={() => setActive(null)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-3"
        >
          <ArrowLeft size={15} /> Suhbatlar ro'yxati
        </button>
        <p className="text-sm font-semibold text-slate-800 mb-3">
          {active.participants.map((p) => `@${p.username || p.name || '?'}`).join(' ↔ ')}
        </p>
        {messages === null ? (
          <Loader2 className="animate-spin text-slate-300" />
        ) : (
          <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
            {messages.map((m) => (
              <div key={m._id} className="px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-medium text-slate-500">
                    {String(m.senderId) === String(active.participants[0]?._id) ? '①' : '②'} · {m.type}
                    {m.flagged && <span className="ml-1.5 text-red-500">⚑</span>}
                  </span>
                  <span className="text-[10px] text-slate-300">{new Date(m.createdAt).toLocaleString('uz-UZ')}</span>
                </div>
                {m.type === 'text' && <p className="text-slate-700 whitespace-pre-wrap break-words">{m.text}</p>}
                {m.type === 'sticker' && <p className="text-slate-400">😊 stiker: {m.stickerId}</p>}
                {['image', 'video', 'voice', 'file'].includes(m.type) && (
                  <p className="text-slate-400">📎 {m.media?.mimeType} ({Math.round((m.media?.size || 0) / 1024)}KB)</p>
                )}
              </div>
            ))}
            {messages.length === 0 && <p className="text-center text-sm text-slate-400 py-6">Xabar yo'q</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-slate-100 rounded-xl divide-y divide-slate-50">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => openConversation(c)}
          className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-3"
        >
          <span className="text-sm text-slate-700">
            {c.participants.map((p) => `@${p.username || p.name || '?'}`).join(' ↔ ')}
          </span>
          <span className="text-xs text-slate-400 truncate max-w-[200px]">{c.lastMessagePreview}</span>
        </button>
      ))}
      {conversations.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Suhbat yo'q</p>}
    </div>
  );
}
