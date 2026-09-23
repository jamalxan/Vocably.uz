'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, Maximize2, Minimize2 } from 'lucide-react';
import AiChat from '@/components/AiChat';
import IconButton from '@/components/ui/IconButton';
import { useDialogFocus } from '@/features/exam/state/useDialogFocus';

// VOCABLY-TZ.md §12.1 — AI Tutor endi istalgan sahifadan ⌘K (Ctrl+K) yoki
// suzuvchi tugma bilan ochiladigan sirg'aluvchi panel (desktop: 420px, mobil:
// to'liq ekran). /app/ai to'liq sahifasi ALOHIDA qoladi (suhbatlar ro'yxati +
// tarix boshqaruvi kerak bo'lganda) — bu panel esa tezkor, kontekstli yordam
// uchun (faqat joriy suhbat, sessiya boshqaruvsiz — "Kengaytirish" tugmasi
// ENDI sahifadan chiqmasdan shu panelni to'liq ekranga yoyadi, ostidagi sahifa
// o'zgarmaydi).
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
  // Kengaytirish ENDI sahifa navigatsiyasi EMAS (eski "To'liq sahifa" havolasi
  // /app/ai'ga olib ketardi — orqaga qaytilganda foydalanuvchi qaysi sahifada
  // bo'lgani yo'qolardi). Endi shu panelning o'zi to'liq ekranga sig'adi;
  // "Kichiklashtirish" bosilsa oddiy sirg'aluvchi o'lchamga qaytadi — ostidagi
  // sahifa hech qachon o'zgarmagani uchun "qaysi oynada bo'lsa shunga qaytish"
  // avtomatik ta'minlanadi (2026-09-10 so'rovi).
  const [fullscreen, setFullscreen] = useState(false);

  const closePanel = () => {
    setOpen(false);
    setFullscreen(false);
  };

  // ⌘K / Ctrl+K — istalgan sahifadan.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Dialog: fokus ichkariga o'tadi, Tab ichida qoladi, yopilganda qaytadi.
  const panelRef = useDialogFocus(open);

  // Panel ochiq paytda orqadagi sahifa scroll bo'lmasin.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // /app/ai'ning o'zida (to'liq sahifa) qo'shimcha suzuvchi tugma/panel keraksiz —
  // ikkalasi bir vaqtda ustma-ust chiqmasin.
  // Mock imtihon FAOL sessiyasida (masalan /app/mock/<id>, lekin natija sahifasi
  // EMAS) AI yordamchi ko'rinmasligi kerak — haqiqiy imtihonda tashqi yordam
  // yo'q, bu suzuvchi tugma ham "imtihon vibe"ni buzardi (2026-09-10 so'rovi).
  const inMockSession = /^\/app\/mock\/[^/]+$/.test(pathname);
  // TZ-vocably-v2.md BUG-027 — Do'stlar (chat) sahifasida bu suzuvchi tugma
  // composer'ning o'ng tarafidagi tugmalari (emoji/fayl/mikrofon/yuborish) ustiga
  // tushib qolardi. §E4: "AI FAB pozitsiyasi: chat sahifalarida yashiriladi".
  const inDostlar = pathname.startsWith('/app/dostlar');
  if (pathname.startsWith('/app/ai') || inMockSession || inDostlar) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="AI yordamchini ochish (Ctrl+K)"
        title="AI yordamchi (Ctrl+K)"
        className="fixed z-40 right-4 sm:right-6 bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-on-accent shadow-glow flex items-center justify-center transition-transform hover:scale-105"
      >
        <Sparkles size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {!fullscreen && <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={closePanel} />}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="AI yordamchi"
            tabIndex={-1}
            className={`relative h-full bg-bg shadow-2xl flex flex-col pb-[env(safe-area-inset-bottom)] outline-none ${
              fullscreen ? 'w-full' : 'w-full sm:w-[420px] animate-[slideIn_200ms_ease-out]'
            }`}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
              <button
                type="button"
                onClick={() => setFullscreen((v) => !v)}
                className="flex items-center gap-1.5 px-2 -ml-2 min-h-11 md:min-h-9 rounded-lg text-xs text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {fullscreen ? (
                  <>
                    <Minimize2 size={13} /> Kichiklashtirish
                  </>
                ) : (
                  <>
                    <Maximize2 size={13} /> Kengaytirish
                  </>
                )}
              </button>
              <IconButton icon={X} label="Yopish" onClick={closePanel} />
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
