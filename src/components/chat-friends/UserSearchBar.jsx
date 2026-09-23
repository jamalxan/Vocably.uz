'use client';
import { useEffect, useState, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

// C-08 — min 2 belgi bosilmaguncha qidirilmaydi (bitta harf butun kolleksiyani
// qimmat skanerlashga olib kelardi, natija ham foydasiz keng bo'lardi).
const MIN_QUERY_LEN = 2;
// 250ms — TZ talabi ("debounce 250 ms"), mavjud 350ms'dan biroz tezlashtirildi.
const DEBOUNCE_MS = 250;

export default function UserSearchBar({ onOpen }) {
  const { searchUsername, openConversationByUsername } = useChat();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(undefined); // undefined=hech qidirilmagan, []=topilmadi
  const [searching, setSearching] = useState(false);
  const [openingUsername, setOpeningUsername] = useState(null);
  const debounceRef = useRef(null);
  // Eskiroq so'rov javobi yangisining ustiga yozilmasin.
  const requestIdRef = useRef(0);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const onChange = (val) => {
    setQ(val);
    clearTimeout(debounceRef.current);
    const reqId = ++requestIdRef.current;
    const clean = val.trim();
    if (clean.length < MIN_QUERY_LEN) {
      setResults(undefined);
      setSearching(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const r = await searchUsername(clean);
      if (reqId !== requestIdRef.current) return;
      setResults(r);
      setSearching(false);
    }, DEBOUNCE_MS);
  };

  const handleOpen = async (username) => {
    setOpeningUsername(username);
    const res = await openConversationByUsername(username);
    setOpeningUsername(null);
    if (res.error) alert(res.error);
    else {
      setQ('');
      setResults(undefined);
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
          // Panel torroq (masalan lg breakpoint atrofida) bo'lganda uzun matn
          // kesilib "...kiriti" bo'lib chiqardi — qisqaroq, mazmuni bir xil matn.
          placeholder="Username yoki ism bo'yicha qidirish"
          aria-label="Username yoki ism bo'yicha qidirish"
          className="w-full pl-9 pr-3 py-2 bg-bg rounded-lg text-base md:text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-accent/20"
        />
        {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted" />}
      </div>

      {results !== undefined && q.trim().length >= MIN_QUERY_LEN && !searching && (
        <div className="mt-2 p-1 bg-surface border border-border rounded-lg max-h-72 overflow-y-auto">
          {results.length ? (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleOpen(result.username)}
                disabled={openingUsername === result.username}
                className="w-full min-h-11 flex items-center gap-2.5 text-left px-1.5 py-1 rounded-lg hover:bg-bg disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {result.username[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">@{result.username}</p>
                  {result.name && <p className="text-xs text-muted truncate">{result.name}</p>}
                </div>
                {openingUsername === result.username ? (
                  <Loader2 size={14} className="animate-spin text-accent flex-shrink-0" />
                ) : (
                  <span className="text-xs text-accent font-medium flex-shrink-0">Yozish</span>
                )}
              </button>
            ))
          ) : (
            <p className="text-xs text-muted text-center py-2">Foydalanuvchi topilmadi</p>
          )}
        </div>
      )}
    </div>
  );
}
