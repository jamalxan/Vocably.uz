'use client';
import { useCallback, useEffect, useState } from 'react';
import { BookMarked, Check, Plus, Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useApp } from '@/context/AppContext';
import { useT } from '@/context/LocaleContext';

const CEFR = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const field = 'bg-surface border border-border rounded-xl px-3 py-2 text-sm text-ink min-h-11 md:min-h-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

async function call(url, options) {
  const res = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Xatolik yuz berdi');
  return data;
}

// Global lug'at kutubxonasi (TZ §30, §53): nashr qilingan so'zlarni qidirish va o'z lug'atiga qo'shish.
export default function LibraryView() {
  const app = useApp();
  const { t } = useT();
  const [q, setQ] = useState('');
  const [cefr, setCefr] = useState('');
  const [ielts, setIelts] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(() => new Set());

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const sp = new URLSearchParams({ page: String(page), limit: '20' });
        if (q.trim()) sp.set('q', q.trim());
        if (cefr) sp.set('cefr', cefr);
        if (ielts) sp.set('ielts', '2');
        const res = await fetch(`/api/vocabulary/library?${sp}`, { credentials: 'same-origin', signal: ctrl.signal });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Yuklashda xatolik');
        setData(json);
        setError('');
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message);
      }
    }, q ? 250 : 0);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, cefr, ielts, page]);

  const add = useCallback(
    async (entry) => {
      setPending((p) => new Set(p).add(entry.id));
      setError('');
      try {
        const r = await call('/api/vocabulary/library', { method: 'POST', body: JSON.stringify({ entryIds: [entry.id] }) });
        setData((d) => d && { ...d, items: d.items.map((i) => (i.id === entry.id ? { ...i, owned: true } : i)) });
        setNotice(r.added ? t('lib.added', { word: entry.word }) : t('lib.already', { word: entry.word }));
        // AppContext'dagi kategoriyalarni yangilaymiz, shunda yangi so'z boshqa sahifalarda ham ko'rinadi.
        app?.fetchUserData?.();
      } catch (e) {
        setError(e.message);
      } finally {
        setPending((p) => {
          const n = new Set(p);
          n.delete(entry.id);
          return n;
        });
      }
    },
    [app, t]
  );

  return (
    <div>
      <h1 className="text-xl font-bold text-ink font-display flex items-center gap-2 mb-1">
        <BookMarked size={20} aria-hidden="true" /> {t('lib.title')}
      </h1>
      <p className="text-sm text-muted mb-4">{t('lib.intro')}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('lib.searchPlaceholder')} aria-label={t('lib.searchAria')} className={`${field} w-full pl-9`} />
        </div>
        <select value={cefr} onChange={(e) => { setCefr(e.target.value); setPage(1); }} aria-label={t('lib.cefrAria')} className={field}>
          {CEFR.map((c) => <option key={c} value={c}>{c || t('lib.allLevels')}</option>)}
        </select>
        <label className={`${field} flex items-center gap-2 cursor-pointer`}>
          <input type="checkbox" checked={ielts} onChange={(e) => { setIelts(e.target.checked); setPage(1); }} /> {t('lib.ielts')}
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-danger bg-danger-soft border border-danger/30 rounded-xl px-4 py-3 mb-3">{error}</p>}
      <p role="status" aria-live="polite" className={notice ? 'text-sm text-success mb-3' : 'sr-only'}>{notice}</p>

      {!data ? (
        <div className="grid gap-3" aria-busy="true">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : data.items.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">{t('lib.nothing')}</p>
      ) : (
        <ul className="grid gap-3">
          {data.items.map((e) => (
            <li key={e.id} className="bg-surface border border-border rounded-2xl p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-ink break-words">{e.word}</p>
                    {e.ipaUk && <span className="text-xs text-muted">{e.ipaUk}</span>}
                    {e.cefr && <Badge tone="accent">{e.cefr}</Badge>}
                    {e.ieltsRelevance >= 2 && <Badge tone="info">IELTS</Badge>}
                  </div>
                  <p className="text-sm text-ink mt-0.5 break-words">{e.translationUz}</p>
                  {e.shortDefinition && <p className="text-xs text-muted mt-1 break-words">{e.shortDefinition}</p>}
                  {e.examples?.[0]?.en && <p className="text-xs text-muted italic mt-1 break-words">“{e.examples[0].en}”</p>}
                </div>
                {e.owned ? (
                  <span className="flex items-center gap-1 text-xs text-success flex-shrink-0 mt-1"><Check size={14} aria-hidden="true" /> {t('lib.inDict')}</span>
                ) : (
                  <Button size="sm" onClick={() => add(e)} disabled={pending.has(e.id)} aria-label={t('lib.addAria', { word: e.word })} className="flex-shrink-0">
                    <Plus size={14} aria-hidden="true" /> {t('cat.add')}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm mt-5">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t('lib.prev')}</Button>
          <span className="text-muted tabular-nums">{page} / {data.pages}</span>
          <Button variant="secondary" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>{t('lib.next')}</Button>
        </div>
      )}
    </div>
  );
}
