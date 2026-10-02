'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CloudOff, DownloadCloud, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { downloadDueQueue, isOfflineReviewSupported, listPending, loadDueQueue, recordAnswer, syncPending } from '@/lib/offlineReview';

// Offline takrorlash (B2): metro/avtobusda internetsiz. Bugungi navbat oldindan yuklanadi, javoblar qurilmada saqlanadi va
// ulanganda yuboriladi. Offline javoblar XP BERMAYDI (faqat so'z holati va seriya) — server shunday hal qiladi.
export default function OfflineReviewCard() {
  const { phone } = useApp();
  const userKey = phone || '';
  const [supported, setSupported] = useState(false);
  const [online, setOnline] = useState(true);
  const [queue, setQueue] = useState({ words: [], fetchedAt: null, stale: false });
  const [pending, setPending] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState(null); // { words, index, revealed, shownAt, done }
  const syncingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!userKey) return;
    try {
      const [q, p] = await Promise.all([loadDueQueue(userKey), listPending(userKey)]);
      setQueue(q);
      setPending(p.length);
    } catch {
      // IndexedDB yopiq (private rejim) — karta oddiy holatda qoladi
    }
  }, [userKey]);

  const sync = useCallback(
    async (quiet = true) => {
      if (!userKey || syncingRef.current || !navigator.onLine) return;
      syncingRef.current = true;
      try {
        const out = await syncPending(userKey);
        if (!quiet && out.sent) setMessage(`${out.sent} ta javob yuborildi.`);
        if (out.error && !quiet) setMessage('Yuborib bo‘lmadi — keyinroq qayta uriniladi.');
      } catch {
        // keyingi urinishda
      } finally {
        syncingRef.current = false;
        refresh();
      }
    },
    [userKey, refresh]
  );

  useEffect(() => {
    setSupported(isOfflineReviewSupported());
    setOnline(navigator.onLine);
    const on = () => {
      setOnline(true);
      sync(false);
    };
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, [sync]);

  useEffect(() => {
    refresh().then(() => sync(true));
  }, [refresh, sync]);

  if (!supported || !userKey) return null;

  const download = async () => {
    setBusy(true);
    setMessage('');
    try {
      const { saved, total } = await downloadDueQueue(userKey, 50);
      setMessage(saved ? `${saved} ta so‘z offline uchun yuklandi${total > saved ? ` (jami ${total} ta navbatda)` : ''}.` : 'Hozir takrorlanadigan so‘z yo‘q.');
    } catch (e) {
      setMessage(e.message === 'unauthorized' ? 'Qayta kiring.' : 'Yuklab bo‘lmadi. Internetni tekshiring.');
    } finally {
      setBusy(false);
      refresh();
    }
  };

  const start = () => setSession({ words: queue.words, index: 0, revealed: false, shownAt: Date.now(), answered: 0 });

  const answer = async (correct) => {
    const w = session.words[session.index];
    try {
      await recordAnswer(userKey, { wordId: w.wordId, categoryId: w.categoryId, correct, responseMs: Date.now() - session.shownAt });
    } catch {
      setMessage('Javobni saqlab bo‘lmadi.');
      return;
    }
    const next = session.index + 1;
    if (next >= session.words.length) {
      setSession({ ...session, answered: session.answered + 1, done: true });
      await refresh();
      sync(true);
    } else {
      setSession({ ...session, index: next, revealed: false, shownAt: Date.now(), answered: session.answered + 1 });
      refresh();
    }
  };

  const w = session && !session.done ? session.words[session.index] : null;

  return (
    <section className="mt-6 bg-surface border border-border rounded-2xl p-5 shadow-card" aria-labelledby="offline-title">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
          <CloudOff size={20} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="offline-title" className="text-sm font-semibold text-ink">
            Offline takrorlash
          </h3>
          <p className="text-xs text-muted mt-0.5">Navbatni oldindan yuklab oling — internetsiz ham takrorlaysiz. Offline javoblar XP bermaydi, lekin so‘z holati va seriyani yangilaydi.</p>
        </div>
      </div>

      {!session && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={download} disabled={busy || !online}>
            <DownloadCloud size={16} aria-hidden="true" /> {busy ? 'Yuklanmoqda...' : 'Navbatni yuklash'}
          </Button>
          <Button onClick={start} disabled={queue.words.length === 0}>
            Boshlash ({queue.words.length})
          </Button>
          {pending > 0 && (
            <Button variant="ghost" onClick={() => sync(false)} disabled={!online}>
              <RefreshCw size={16} aria-hidden="true" /> Yuborish ({pending})
            </Button>
          )}
        </div>
      )}

      {!session && queue.stale && queue.words.length > 0 && <p className="mt-2 text-xs text-warning">Navbat 24 soatdan eski — onlayn bo‘lganda qayta yuklang.</p>}
      {!session && !online && <p className="mt-2 text-xs text-muted" role="status">Hozir offlaynsiz. Javoblar qurilmada saqlanadi.</p>}

      {w && (
        <div className="mt-4 border-t border-border pt-4" aria-live="polite">
          <p className="text-xs text-muted tabular-nums">
            {session.index + 1} / {session.words.length}
          </p>
          <p className="text-2xl font-bold text-ink font-display my-2">{w.word}</p>
          {session.revealed ? (
            <>
              <p className="text-sm text-ink mb-3">{w.translations.join(', ') || '—'}</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => answer(false)}>
                  Bilmadim
                </Button>
                <Button onClick={() => answer(true)}>Bilaman</Button>
              </div>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setSession({ ...session, revealed: true })}>
              Javobni ko‘rsat
            </Button>
          )}
        </div>
      )}

      {session?.done && (
        <div className="mt-4 border-t border-border pt-4" role="status">
          <p className="text-sm text-ink">{session.answered} ta javob saqlandi. {online ? 'Yuborilmoqda...' : 'Ulanganda avtomatik yuboriladi.'}</p>
          <Button className="mt-3" variant="secondary" onClick={() => setSession(null)}>
            Yopish
          </Button>
        </div>
      )}

      {message && (
        <p className="mt-3 text-xs text-muted" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
