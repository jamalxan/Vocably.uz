'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { EmojiPicker as Frimousse } from 'frimousse';
import { Search, Clock } from 'lucide-react';

// Emoji rasm/sprite sifatida EMAS — native unicode belgi sifatida render qilinadi.
// Brauzer platformaning o'z emoji shriftini ishlatadi (iPhone/Mac'da Apple emoji,
// xuddi Telegramdagidek). Hech qanday asset yuklab olinmaydi — emoji ma'lumotlari
// frimousse tomonidan tashqi CDN'dan (emojibase) so'ralganda lazy-fetch qilinadi,
// bizning bundle'imizga qo'shilmaydi.

// Emojibase'da "uz" locale yo'q (faqat en/ru va h.k.) — shuning uchun qidiruv
// kalit so'zlari uchun "en" ishlatiladi, lekin KO'RINADIGAN barcha matn (sarlavhalar,
// placeholder) qo'lda o'zbekchaga tarjima qilingan (pastdagi CATEGORY_META).
const LOCALE = 'en';

// DIQQAT: kalitlar emojibase'ning haqiqiy (en) kategoriya matnlariga aynan mos
// bo'lishi shart — faqat birinchi so'z bosh harf bilan ("Smileys & emotion", "Emotion"
// EMAS). Bu brauzerda amalda tekshirilgan qiymatlar, taxmin qilingan Title Case emas.
const CATEGORY_META = {
  'Smileys & emotion': { uz: 'Smaylik', icon: '😀' },
  'People & body': { uz: 'Odamlar', icon: '🧑' },
  'Animals & nature': { uz: 'Tabiat', icon: '🐶' },
  'Food & drink': { uz: 'Ovqat', icon: '🍔' },
  'Travel & places': { uz: 'Sayohat', icon: '✈️' },
  Activities: { uz: 'Faoliyat', icon: '⚽' },
  Objects: { uz: 'Predmetlar', icon: '💡' },
  Symbols: { uz: 'Belgilar', icon: '❤️' },
  Flags: { uz: 'Bayroqlar', icon: '🏳️' },
};

const RECENTS_KEY = 'vocably.recentEmojis';
const RECENTS_MAX = 24;

function loadRecents() {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
    return Array.isArray(raw) ? raw.slice(0, RECENTS_MAX) : [];
  } catch {
    return [];
  }
}

function saveRecent(emoji) {
  try {
    const prev = loadRecents().filter((e) => e !== emoji);
    const next = [emoji, ...prev].slice(0, RECENTS_MAX);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [emoji];
  }
}

function CategoryHeader({ category, headerRefs, ...props }) {
  const meta = CATEGORY_META[category.label];
  return (
    <div
      {...props}
      ref={(node) => {
        if (node) headerRefs.current[category.label] = node;
      }}
      className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-1 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wide"
    >
      {meta?.uz || category.label}
    </div>
  );
}

function EmojiCell({ emoji, ...props }) {
  return (
    <button
      {...props}
      type="button"
      title={emoji.label}
      className={`emoji font-chat flex items-center justify-center rounded-lg aspect-square transition-transform duration-100 hover:scale-[1.15] hover:bg-accent-soft ${
        emoji.isActive ? 'bg-accent-soft scale-[1.15]' : ''
      }`}
    >
      {emoji.emoji}
    </button>
  );
}

function useResponsiveColumns() {
  const [columns, setColumns] = useState(7);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const apply = () => setColumns(mq.matches ? 8 : 7);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return columns;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return isMobile;
}

function PickerBody({ onPick, headerRefs, viewportRef, columns }) {
  const [recents, setRecents] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  // Frimousse.Search'ning ichki filtrlash mantig'iga aralashmaslik uchun onChange
  // prop orqali emas, xom DOM 'input' hodisasi orqali kuzatiladi — faqat
  // "qidiruv bo'shmi" degan holatni bilish uchun (Yaqinda ishlatilgan bo'limini
  // ko'rsatish/yashirish), haqiqiy filtrlash to'liq kutubxonaning o'zida qoladi.
  useEffect(() => {
    const el = searchInputRef.current;
    if (!el) return undefined;
    const onInput = () => setSearching(el.value.trim().length > 0);
    el.addEventListener('input', onInput);
    return () => el.removeEventListener('input', onInput);
  }, []);

  const pick = useCallback(
    (emoji) => {
      setRecents(saveRecent(emoji));
      onPick(emoji);
    },
    [onPick]
  );

  return (
    <Frimousse.Root
      locale={LOCALE}
      columns={columns}
      sticky
      onEmojiSelect={(e) => pick(e.emoji)}
      className="flex flex-col h-full font-chat"
    >
      <div className="flex items-center gap-2 px-2.5 pt-2.5 pb-2">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <Frimousse.Search
            ref={searchInputRef}
            placeholder="Emoji qidirish..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-bg border border-border rounded-lg text-sm text-primary placeholder:text-muted/70 outline-none focus:border-accent transition-colors"
          />
        </div>
        <Frimousse.SkinToneSelector className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors emoji" />
      </div>

      {/* Kategoriya tablari — bosilganda mos sarlavhaga scroll qiladi. */}
      <div className="flex items-center gap-0.5 px-2 pb-1.5 overflow-x-auto flex-shrink-0">
        <button
          type="button"
          onClick={() => viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Yaqinda ishlatilgan"
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:bg-bg hover:text-accent transition-colors"
        >
          <Clock size={14} />
        </button>
        {Object.entries(CATEGORY_META).map(([label, meta]) => (
          <button
            key={label}
            type="button"
            title={meta.uz}
            onClick={() => headerRefs.current[label]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg emoji hover:bg-bg transition-colors"
          >
            {meta.icon}
          </button>
        ))}
      </div>

      <Frimousse.Viewport ref={viewportRef} className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
        {!searching && recents.length > 0 && (
          <div className="mb-1">
            <p className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-1 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wide">
              Yaqinda ishlatilgan
            </p>
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
              {recents.map((e, i) => (
                <button
                  key={`${e}-${i}`}
                  type="button"
                  onClick={() => pick(e)}
                  className="emoji font-chat flex items-center justify-center rounded-lg aspect-square transition-transform duration-100 hover:scale-[1.15] hover:bg-accent-soft"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
        <Frimousse.Loading className="block py-6 text-center text-xs text-muted">Yuklanmoqda...</Frimousse.Loading>
        <Frimousse.Empty className="block py-6 text-center text-xs text-muted">Hech narsa topilmadi</Frimousse.Empty>
        <Frimousse.List
          components={{
            CategoryHeader: (props) => <CategoryHeader {...props} headerRefs={headerRefs} />,
            Row: ({ children, ...props }) => (
              <div {...props} className="grid gap-0.5" style={{ ...props.style, gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
                {children}
              </div>
            ),
            Emoji: EmojiCell,
          }}
        />
      </Frimousse.Viewport>
    </Frimousse.Root>
  );
}

// `onPick(emoji)` — tanlangan emoji belgisi (masalan "😀"). Joylashtirish joyi
// (kursor pozitsiyasi) chaqiruvchi (Composer.jsx) tomonidan hal qilinadi.
export default function EmojiPicker({ onPick, onClose, triggerRef }) {
  const rootRef = useRef(null);
  const headerRefs = useRef({});
  const viewportRef = useRef(null);
  const columns = useResponsiveColumns();
  const isMobile = useIsMobile();
  const touchStartY = useRef(null);

  // Escape — yopish, tashqariga bosilganda — yopish. `triggerRef` (ochish/yopish
  // tugmasi) ataylab chetlab o'tiladi — aks holda tugma bosilganda avval bu listener
  // yopadi, keyin tugmaning o'z onClick'i qayta ochib yuboradi (mousedown -> click
  // ketma-ketligidagi klassik xato).
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const onPointerDown = (e) => {
      if (rootRef.current?.contains(e.target)) return;
      if (triggerRef?.current?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [onClose, triggerRef]);

  // Mobilda ochilganda ekran klaviaturasini yopamiz (input'dan fokusni olib tashlab).
  useEffect(() => {
    if (isMobile && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (delta > 60) onClose(); // pastga siljitish — yopish
  };

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end">
        <div onClick={onClose} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
        <div
          ref={rootRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full bg-surface rounded-t-2xl shadow-card flex flex-col"
          style={{ height: '60vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>
          <PickerBody onPick={onPick} headerRefs={headerRefs} viewportRef={viewportRef} columns={columns} />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="absolute bottom-full mb-2 right-0 w-80 h-96 bg-surface border border-border rounded-2xl shadow-card flex flex-col overflow-hidden z-20"
    >
      <PickerBody onPick={onPick} headerRefs={headerRefs} viewportRef={viewportRef} columns={columns} />
    </div>
  );
}
