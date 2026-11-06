'use client';
import { useEffect, useState, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import Avatar from '@/components/avatar/Avatar';
import { useT } from '@/context/LocaleContext';

// C-08 — min 2 belgi bosilmaguncha qidirilmaydi (bitta harf butun kolleksiyani
// qimmat skanerlashga olib kelardi, natija ham foydasiz keng bo'lardi).
const MIN_QUERY_LEN = 2;
// 250ms — TZ talabi ("debounce 250 ms"), mavjud 350ms'dan biroz tezlashtirildi.
const DEBOUNCE_MS = 250;

export default function UserSearchBar({ onOpen }) {
  const { searchUsername, openConversationByUsername, showChatNotice } = useChat();
  const { t, ts } = useT();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(undefined); // undefined=hech qidirilmagan, []=topilmadi
  const [searching, setSearching] = useState(false);
  const [openingUsername, setOpeningUsername] = useState(null);
  const debounceRef = useRef(null);
  // Eskiroq so'rov javobi yangisining ustiga yozilmasin.
  const requestIdRef = useRef(0);
  const inputRef = useRef(null);

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
    if (res.error) showChatNotice(ts(res.error), 'error');
    else {
      setQ('');
      setResults(undefined);
      onOpen?.();
    }
  };

  return (
    <div className="px-3 pt-2 pb-2 flex-shrink-0">
      <div className="relative">
        <Search size={15} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          value={q}
          onChange={(e) => onChange(e.target.value)}
          // Panel torroq (masalan lg breakpoint atrofida) bo'lganda uzun matn
          // kesilib "...kiriti" bo'lib chiqardi — qisqaroq, mazmuni bir xil matn.
          placeholder={t('ch.searchPh')}
          aria-label={t('ch.searchPh')}
          // PARITY_PLAN WP8 — Telegram uslubidagi "pill" qidiruv: to'liq yumaloq, o'ngda tozalash tugmasi.
          className="w-full h-10 pl-10 pr-11 bg-bg rounded-full text-base md:text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-accent/30 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {searching ? (
          <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-muted" />
        ) : (
          q && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              aria-label={t('ch.searchClear')}
              title={t('ch.searchClear')}
              data-testid="search-clear"
              className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 md:w-9 md:h-9 inline-flex items-center justify-center rounded-full text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )
        )}
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
                <Avatar userId={result.id} photoId={result.photoId} name={result.name} username={result.username} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">@{result.username}</p>
                  {result.name && <p className="text-xs text-muted truncate">{result.name}</p>}
                </div>
                {openingUsername === result.username ? (
                  <Loader2 size={14} className="animate-spin text-accent flex-shrink-0" />
                ) : (
                  <span className="text-xs text-accent font-medium flex-shrink-0">{t('ch.write')}</span>
                )}
              </button>
            ))
          ) : (
            <p className="text-xs text-muted text-center py-2">{t('ch.userNotFound')}</p>
          )}
        </div>
      )}
    </div>
  );
}
