'use client';
import { useState, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

export default function UserSearchBar({ onOpen }) {
  const { searchUsername, openConversationByUsername } = useChat();
  const [q, setQ] = useState('');
  const [result, setResult] = useState(undefined); // undefined=hech qidirilmagan, null=topilmadi
  const [searching, setSearching] = useState(false);
  const [opening, setOpening] = useState(false);
  const debounceRef = useRef(null);

  const onChange = (val) => {
    setQ(val);
    clearTimeout(debounceRef.current);
    const clean = val.trim().toLowerCase();
    if (!clean) {
      setResult(undefined);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const r = await searchUsername(clean);
      setResult(r);
      setSearching(false);
    }, 350);
  };

  const handleOpen = async () => {
    if (!result) return;
    setOpening(true);
    const res = await openConversationByUsername(result.username);
    setOpening(false);
    if (res.error) alert(res.error);
    else {
      setQ('');
      setResult(undefined);
      onOpen?.();
    }
  };

  return (
    <div className="px-3 pt-3 pb-2 flex-shrink-0">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={q}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Do'stingizning username'ini kiriting"
          className="w-full pl-9 pr-3 py-2 bg-bg rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20"
        />
        {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted" />}
      </div>

      {result !== undefined && q.trim() && !searching && (
        <div className="mt-2 p-2.5 bg-surface border border-border rounded-lg">
          {result ? (
            <button
              onClick={handleOpen}
              disabled={opening}
              className="w-full flex items-center gap-2.5 text-left disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
                {result.username[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary truncate">@{result.username}</p>
                {result.name && <p className="text-xs text-muted truncate">{result.name}</p>}
              </div>
              {opening ? <Loader2 size={14} className="animate-spin text-accent" /> : (
                <span className="text-xs text-accent font-medium flex-shrink-0">Yozish</span>
              )}
            </button>
          ) : (
            <p className="text-xs text-muted text-center">Foydalanuvchi topilmadi</p>
          )}
        </div>
      )}
    </div>
  );
}
