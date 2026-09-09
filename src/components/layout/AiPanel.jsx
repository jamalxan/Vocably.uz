'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, X, Maximize2 } from 'lucide-react';
import AiChat from '@/components/AiChat';
import IconButton from '@/components/ui/IconButton';

// VOCABLY-TZ.md §12.1 — AI Tutor endi istalgan sahifadan ⌘K (Ctrl+K) yoki
// suzuvchi tugma bilan ochiladigan sirg'aluvchi panel (desktop: 420px, mobil:
// to'liq ekran). /app/ai to'liq sahifasi ALOHIDA qoladi (suhbatlar ro'yxati +
// tarix boshqaruvi kerak bo'lganda) — bu panel esa tezkor, kontekstli yordam
// uchun (faqat joriy suhbat, sessiya boshqaruvsiz — "Kengaytirish" tugmasi
// to'liq sahifaga olib o'tadi).
function contextHintForPath(pathname) {
  if (pathname.startsWith('/app/lugat')) return "Lug'at bo'limida, so'z mashq qilmoqda";
  if (pathname.startsWith('/app/oqish')) return 'Reading (Oqish) bo\'limida';
  if (pathname.startsWith('/app/tinglash')) return 'Listening (Tinglash) bo\'limida';
  if (pathname.startsWith('/app/gapirish')) return 'Speaking (Gapirish) bo\'limida';
  if (pathname.startsWith('/app/yozish')) return 'Writing (Yozish) bo\'limida';
  if (pathname.startsWith('/app/mock')) return 'Mock imtihon bo\'limida';
  if (pathname === '/app') return 'Bosh sahifada (Bugungi ish)';
  return null;
}

export default function AiPanel() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // ⌘K / Ctrl+K — istalgan sahifadan.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // /app/ai'ning o'zida (to'liq sahifa) qo'shimcha suzuvchi tugma/panel keraksiz —
  // ikkalasi bir vaqtda ustma-ust chiqmasin.
  if (pathname.startsWith('/app/ai')) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="AI yordamchini ochish (Ctrl+K)"
        title="AI yordamchi (Ctrl+K)"
        className="fixed z-40 right-4 sm:right-6 bottom-20 md:bottom-6 w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-on-accent shadow-glow flex items-center justify-center transition-transform hover:scale-105"
      >
        <Sparkles size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:w-[420px] h-full bg-bg shadow-2xl flex flex-col animate-[slideIn_200ms_ease-out]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
              <Link
                href="/app/ai"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
              >
                <Maximize2 size={13} /> To'liq sahifa
              </Link>
              <IconButton icon={X} label="Yopish" size="sm" onClick={() => setOpen(false)} />
            </div>
            <div className="flex-1 min-h-0">
              <AiChat contextHint={contextHintForPath(pathname)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
