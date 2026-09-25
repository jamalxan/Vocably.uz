'use client';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { EmojiPicker as Frimousse } from 'frimousse';
import { Search, Clock } from 'lucide-react';

// Emoji rasm/sprite sifatida EMAS — native unicode belgi sifatida render qilinadi.
// Brauzer platformaning o'z emoji shriftini ishlatadi (iPhone/Mac'da Apple emoji,
// xuddi Telegramdagidek). Emoji ma'lumotlari (emojibase) bundle'ga qo'shilmaydi —
// frimousse ularni birinchi ochilganda lazy-fetch qiladi va localStorage'da keshlaydi.
//
// MUHIM: ma'lumot O'Z serverimizdan (/emojibase — scripts/copy-emojibase.mjs
// predev/prebuild'da `emojibase-data` paketidan public/'ga ko'chiradi). Ilgari
// frimousse'ning sukut manbai — cdn.jsdelivr.net — ishlatilardi; next.config.mjs'ga
// CSP (`connect-src 'self' ...`) qo'shilgach bu so'rov bloklanib, picker keshsiz
// brauzerlarda abadiy "Yuklanmoqda..."da qotib qolardi.
const EMOJIBASE_URL = '/emojibase';

// Emojibase'da "uz" locale yo'q (faqat en/ru va h.k.) — shuning uchun qidiruv
// kalit so'zlari uchun "en" ishlatiladi, lekin KO'RINADIGAN barcha matn (sarlavhalar,
// placeholder) qo'lda o'zbekchaga tarjima qilingan (pastdagi CATEGORY_META).
// Boshqa locale qo'shilsa — scripts/copy-emojibase.mjs#LOCALES ham yangilansin.
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
const CATEGORY_ORDER = Object.keys(CATEGORY_META);

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
      // Ro'yxat virtualizatsiyalangan — header ekrandan chiqsa unmount bo'ladi.
      // Eskirgan (DOM'dan uzilgan) tugun saqlanib qolmasligi uchun null'da o'chiramiz.
      ref={(node) => {
        if (node) headerRefs.current[category.label] = node;
        else if (headerRefs.current[category.label] && !headerRefs.current[category.label].isConnected) {
          delete headerRefs.current[category.label];
        }
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

// Pastki "sheet" ilovaning md chegarasigacha (<768) — 640–767px telefonlar ham sheet oladi.
// Picker faqat bosilgandan keyin mount bo'ladi (SSR'da emas), shuning uchun boshlang'ich
// qiymat darhol matchMedia'dan olinadi — birinchi kadrda desktop popover "miltillamaydi".
const MOBILE_QUERY = '(max-width: 767px)';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return isMobile;
}

// Header'ning kategoriya bloki ([frimousse-category]) viewport ichidagi haqiqiy
// scroll pozitsiyasi (bloklar absolyut joylashtirilgan, header esa sticky —
// shuning uchun header'ning o'zi emas, uning bloki o'lchanadi).
function categoryTop(viewport, headerNode) {
  const block = headerNode.closest('[frimousse-category]') || headerNode;
  return viewport.scrollTop + block.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
}

function PickerBody({ onPick, headerRefs, viewportRef, columns }) {
  const [recents, setRecents] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ORDER[0]);
  const searchInputRef = useRef(null);
  const jumpRef = useRef(null);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  // Frimousse.Search'ning ichki filtrlash mantig'iga aralashmaslik uchun onChange
  // prop orqali emas, xom DOM 'input' hodisasi orqali kuzatiladi — faqat
  // "qidiruv bo'shmi" degan holatni bilish uchun (Yaqinda ishlatilgan lentasini
  // ko'rsatish/yashirish), haqiqiy filtrlash to'liq kutubxonaning o'zida qoladi.
  useEffect(() => {
    const el = searchInputRef.current;
    if (!el) return undefined;
    const onInput = () => setSearching(el.value.trim().length > 0);
    el.addEventListener('input', onInput);
    return () => el.removeEventListener('input', onInput);
  }, []);

  useEffect(() => () => cancelAnimationFrame(jumpRef.current), []);

  const pick = useCallback(
    (emoji) => {
      setRecents(saveRecent(emoji));
      onPick(emoji);
    },
    [onPick]
  );

  // Joriy kategoriyani (tab belgisi uchun) scroll paytida aniqlash: yuqori
  // chegaradan o'tgan eng oxirgi (mount qilingan) kategoriya.
  const onViewportScroll = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    let best = null;
    let bestTop = -Infinity;
    for (const [label, node] of Object.entries(headerRefs.current)) {
      if (!node?.isConnected) continue;
      const top = categoryTop(vp, node);
      if (top <= vp.scrollTop + 4 && top > bestTop) {
        best = label;
        bestTop = top;
      }
    }
    if (best) setActiveCategory(best);
  }, [headerRefs, viewportRef]);

  // Tabga bosilganda kategoriyaga o'tish. Ro'yxat virtualizatsiyalangan: uzoqdagi
  // kategoriya header'i hali DOM'da YO'Q (ilgari shuning uchun ko'p tablar hech
  // narsa qilmasdi). Shu sabab header mount bo'lguncha kerakli yo'nalishda katta
  // qadamlar bilan suramiz, topilgach aniq joyiga o'rnatamiz.
  const scrollToCategory = useCallback(
    (label) => {
      const vp = viewportRef.current;
      if (!vp) return;
      cancelAnimationFrame(jumpRef.current);
      const target = CATEGORY_ORDER.indexOf(label);
      setActiveCategory(label);
      let tries = 0;
      const step = () => {
        const node = headerRefs.current[label];
        if (node?.isConnected) {
          vp.scrollTo({ top: Math.max(0, categoryTop(vp, node)), behavior: 'instant' });
          return;
        }
        const mounted = Object.entries(headerRefs.current)
          .filter(([, n]) => n?.isConnected)
          .map(([l]) => CATEGORY_ORDER.indexOf(l))
          .filter((i) => i >= 0);
        const current = mounted.length ? Math.max(...mounted) : 0;
        const dir = target > current ? 1 : -1;
        const before = vp.scrollTop;
        vp.scrollTop += dir * vp.clientHeight * 2;
        if (vp.scrollTop === before || ++tries > 60) return; // chetga yetdi / himoya
        // Ikki kadr — frimousse scroll hodisasidan keyin yangi qatorlarni render qilsin.
        jumpRef.current = requestAnimationFrame(() => {
          jumpRef.current = requestAnimationFrame(step);
        });
      };
      step();
    },
    [headerRefs, viewportRef]
  );

  // `components` BARQAROR bo'lishi shart: ilgari JSX ichida inline arrow sifatida
  // berilardi — har renderda yangi komponent turi = React butun ro'yxatni (har bir
  // qator va emoji tugmasini) unmount/mount qilardi (hover'da miltillash, sekinlik).
  const listComponents = useMemo(
    () => ({
      CategoryHeader: (props) => <CategoryHeader {...props} headerRefs={headerRefs} />,
      Row: ({ children, ...props }) => (
        <div {...props} className="grid gap-0.5" style={{ ...props.style, gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
          {children}
        </div>
      ),
      Emoji: EmojiCell,
    }),
    [columns, headerRefs]
  );

  return (
    <Frimousse.Root
      locale={LOCALE}
      emojibaseUrl={EMOJIBASE_URL}
      columns={columns}
      sticky
      onEmojiSelect={(e) => pick(e.emoji)}
      className="flex flex-col h-full min-h-0 font-chat"
    >
      <div className="flex items-center gap-2 px-2.5 pt-2.5 pb-2">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <Frimousse.Search
            ref={searchInputRef}
            placeholder="Emoji qidirish..."
            aria-label="Emoji qidirish"
            className="w-full pl-8 pr-2.5 py-1.5 bg-bg border border-border rounded-lg text-base md:text-sm text-ink placeholder:text-muted/70 outline-none focus:border-accent transition-colors"
          />
        </div>
        <Frimousse.SkinToneSelector aria-label="Teri rangi" className="flex-shrink-0 w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors emoji" />
      </div>

      {/* Kategoriya tablari — bosilganda mos kategoriyaga o'tadi, joriysi belgilanadi. */}
      {!searching && (
        <div className="flex items-center gap-0.5 px-2 pb-1.5 overflow-x-auto flex-shrink-0">
          {CATEGORY_ORDER.map((label) => (
            <button
              key={label}
              type="button"
              title={CATEGORY_META[label].uz}
              aria-label={CATEGORY_META[label].uz}
              aria-pressed={activeCategory === label}
              onClick={() => scrollToCategory(label)}
              className={`flex-shrink-0 w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-lg emoji transition-colors ${
                activeCategory === label ? 'bg-accent-soft' : 'opacity-60 hover:opacity-100 hover:bg-bg'
              }`}
            >
              {CATEGORY_META[label].icon}
            </button>
          ))}
        </div>
      )}

      {/* "Yaqinda ishlatilgan" — ATAYLAB Viewport'dan TASHQARIDA: frimousse ko'rinadigan
          qatorlarni viewport scrollTop'idan hisoblaydi va ro'yxat viewport'ning eng
          boshida turadi deb hisoblaydi. Ilgari bu bo'lim ro'yxat ustida (viewport
          ichida) edi — butun hisob shu balandlikka siljib, pastki qatorlar bo'sh
          qolardi va sticky sarlavhalar noto'g'ri kategoriyani ko'rsatardi. */}
      {!searching && recents.length > 0 && (
        <div className="flex items-center gap-1 px-2 pb-1.5 flex-shrink-0 border-b border-border">
          <Clock size={13} className="text-muted flex-shrink-0 mx-1" aria-hidden="true" />
          <div role="group" aria-label="Yaqinda ishlatilgan" className="flex gap-0.5 overflow-x-auto min-w-0">
            {recents.map((e, i) => (
              <button
                key={`${e}-${i}`}
                type="button"
                onClick={() => pick(e)}
                className="emoji font-chat flex-shrink-0 w-9 h-9 text-xl flex items-center justify-center rounded-lg transition-transform duration-100 hover:scale-[1.15] hover:bg-accent-soft"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <Frimousse.Viewport ref={viewportRef} onScroll={onViewportScroll} className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
        <Frimousse.Loading className="block py-6 text-center text-xs text-muted">Yuklanmoqda...</Frimousse.Loading>
        <Frimousse.Empty className="block py-6 text-center text-xs text-muted">Hech narsa topilmadi</Frimousse.Empty>
        <Frimousse.List components={listComponents} />
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
  }, [isMobile]);

  // Emoji panjarasi yuqoriga scroll qilingan bo'lsa, pastga surish — scroll, yopish emas.
  const handleTouchStart = (e) => {
    const vp = viewportRef.current;
    if (vp && vp.contains(e.target) && vp.scrollTop > 0) {
      touchStartY.current = null;
      return;
    }
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
          style={{ height: '60dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
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
      // lg'dan past (ro'yxat yo'q, suhbat to'liq kenglikda) — tugmadan o'ngga ochiladi,
      // aks holda chap chetdan ekrandan tashqariga chiqib ketardi.
      className="absolute bottom-full mb-2 left-0 lg:left-auto lg:right-0 w-80 max-w-[calc(100vw-2rem)] h-96 max-h-[60dvh] bg-surface border border-border rounded-2xl shadow-card flex flex-col overflow-hidden z-20"
    >
      <PickerBody onPick={onPick} headerRefs={headerRefs} viewportRef={viewportRef} columns={columns} />
    </div>
  );
}
