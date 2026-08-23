'use client';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import UserSearchBar from './UserSearchBar';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'hozir';
  if (mins < 60) return `${mins}d`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}s`;
  return `${Math.floor(hours / 24)}kun`;
}

export default function ConversationList({ onSelect, selectedId }) {
  const { conversations, loadingConversations, socketConnected } = useChat();

  return (
    <div className="w-full lg:w-72 flex-shrink-0 border-r border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="text-sm font-bold text-slate-800">Do'stlar</h3>
        <span title={socketConnected ? 'Onlayn' : 'Oflayn (yangilanish bilan)'} className="text-slate-300">
          {socketConnected ? <Wifi size={13} className="text-emerald-500" /> : <WifiOff size={13} />}
        </span>
      </div>

      <UserSearchBar onOpen={() => {}} />

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {loadingConversations && (
          <div className="flex justify-center py-6">
            <Loader2 size={18} className="animate-spin text-slate-300" />
          </div>
        )}
        {!loadingConversations && conversations.length === 0 && (
          <p className="text-center text-xs text-slate-400 px-4 py-6">
            Hozircha suhbat yo'q. Yuqoridan username qidirib, yozishni boshlang.
          </p>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-colors ${
              String(selectedId) === String(c.id) ? 'bg-indigo-50' : 'hover:bg-slate-50'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {(c.otherUser?.username || '?')[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800 truncate">@{c.otherUser?.username || 'noma\'lum'}</p>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{timeAgo(c.lastMessageAt)}</span>
              </div>
              <p className="text-xs text-slate-400 truncate">{c.lastMessagePreview || ''}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
