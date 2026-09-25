'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, MoreVertical, Star, Trash2, Camera, Loader2 } from 'lucide-react';
import { avatarUrl } from '@/lib/avatarShared';

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];

function formatPhotoDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const ICON_BTN =
  'w-11 h-11 inline-flex items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70';

// Telegram'dagi profil rasmlarini to'liq ekranda varaqlash: tepada segmentli
// indikator, ←/→ (klaviatura, tugmalar, ekran chetiga bosish, swipe), pastga
// surib yopish. O'z profilida — "Asosiy qilish", "O'chirish", "Yangi rasm".
export default function PhotoViewer({
  userId,
  photos,
  startIndex = 0,
  title,
  isOwn = false,
  onClose,
  onSetMain,
  onDelete,
  onAddNew,
}) {
  const titleId = useId();
  const closeRef = useRef(null);
  const [index, setIndex] = useState(Math.min(startIndex, Math.max(0, photos.length - 1)));
  const [loaded, setLoaded] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [working, setWorking] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [toast, setToast] = useState('');

  // Rasmlar ro'yxati tashqaridan o'zgarsa (o'chirildi / asosiy qilindi) indeks chegarada qolsin.
  useEffect(() => {
    if (photos.length === 0) onClose?.();
    else if (index > photos.length - 1) setIndex(photos.length - 1);
  }, [photos, index, onClose]);

  const photo = photos[index];
  const count = photos.length;

  const go = useCallback(
    (delta) => {
      setMenuOpen(false);
      setConfirmDelete(false);
      setIndex((i) => Math.min(count - 1, Math.max(0, i + delta)));
    },
    [count]
  );

  // Klaviatura va fokus
  useEffect(() => {
    const prevFocus = document.activeElement;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (menuOpen || confirmDelete) {
          setMenuOpen(false);
          setConfirmDelete(false);
        } else onClose?.();
      } else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [go, onClose, menuOpen, confirmDelete]);

  // Qo'shni rasmlarni oldindan yuklab qo'yish — varaqlaganda kutilmasin.
  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
      const p = photos[i];
      if (p) new Image().src = avatarUrl(userId, p.id, 'full');
    });
  }, [index, photos, userId]);

  // --- Swipe (gorizontal — varaqlash, pastga — yopish) ---
  const start = useRef(null);
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, t: Date.now(), moved: false };
    setDrag({ x: 0, y: 0, active: true });
  };
  const onPointerMove = (e) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) start.current.moved = true;
    // Bir o'q bo'yicha qulflash: qaysi yo'nalish ustun bo'lsa, faqat o'sha.
    setDrag(Math.abs(dx) > Math.abs(dy) ? { x: dx, y: 0, active: true } : { x: 0, y: Math.max(0, dy), active: true });
  };
  const onPointerUp = (e) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    setDrag({ x: 0, y: 0, active: false });
    if (!s.moved) {
      // Oddiy bosish: ekranning chap/o'ng uchdan biri — oldingi/keyingi (Telegram mobil).
      const w = window.innerWidth;
      if (e.clientX < w / 3) go(-1);
      else if (e.clientX > (2 * w) / 3) go(1);
      return;
    }
    const fast = Date.now() - s.t < 250;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -60 || (fast && dx < -20)) go(1);
      else if (dx > 60 || (fast && dx > 20)) go(-1);
    } else if (dy > 120 || (fast && dy > 40)) {
      onClose?.();
    }
  };

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(''), 2200);
  };

  const download = async () => {
    const url = avatarUrl(userId, photo.id, 'full');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `profil-rasm-${photo.id.slice(-6)}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      // S3 CORS GET'ga ruxsat bermasa — hech bo'lmasa yangi tabda ochamiz.
      window.open(url, '_blank', 'noopener');
    }
  };

  const handleSetMain = async () => {
    setMenuOpen(false);
    setWorking(true);
    const res = await onSetMain?.(photo.id);
    setWorking(false);
    if (res?.error) showToast(res.error);
    else {
      setIndex(0);
      showToast('Asosiy rasm yangilandi');
    }
  };

  const handleDelete = async () => {
    setWorking(true);
    const res = await onDelete?.(photo.id);
    setWorking(false);
    setConfirmDelete(false);
    if (res?.error) showToast(res.error);
  };

  if (!photo) return null;

  const dragOpacity = drag.y ? Math.max(0.3, 1 - drag.y / 400) : 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[60] flex flex-col bg-black text-white select-none"
      style={{ backgroundColor: `rgba(0,0,0,${0.96 * dragOpacity})` }}
    >
      {/* Segmentli indikator (Telegram) */}
      {count > 1 && (
        <div className="absolute top-0 inset-x-0 z-10 flex gap-1 px-3 pt-2" style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}>
          {photos.map((p, i) => (
            <span key={p.id} className={`h-[3px] flex-1 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      )}

      {/* Sarlavha */}
      <div
        className="relative z-10 flex items-center gap-2 px-2 pt-4 pb-2 bg-gradient-to-b from-black/70 to-transparent"
        style={{ paddingTop: 'max(1rem, calc(env(safe-area-inset-top) + 0.75rem))' }}
      >
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Yopish" className={ICON_BTN}>
          <X size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <p id={titleId} className="text-sm font-semibold truncate">
            {title || 'Profil rasmi'}
          </p>
          <p className="text-xs text-white/65 truncate">
            {count > 1 ? `${index + 1} / ${count}` : 'Profil rasmi'}
            {photo.createdAt ? ` · ${formatPhotoDate(photo.createdAt)}` : ''}
            {isOwn && index === 0 && count > 1 ? ' · asosiy' : ''}
          </p>
        </div>
        <button type="button" onClick={download} aria-label="Yuklab olish" title="Yuklab olish" className={ICON_BTN}>
          <Download size={20} />
        </button>
        {isOwn && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Ko'proq"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={ICON_BTN}
              disabled={working}
            >
              {working ? <Loader2 size={20} className="animate-spin" /> : <MoreVertical size={20} />}
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 w-56 py-1.5 rounded-xl bg-neutral-900/95 border border-white/10 shadow-2xl backdrop-blur"
              >
                {onAddNew && (
                  <MenuItem
                    icon={Camera}
                    label="Yangi rasm qo'yish"
                    onClick={() => {
                      setMenuOpen(false);
                      onAddNew();
                    }}
                  />
                )}
                {index > 0 && <MenuItem icon={Star} label="Asosiy rasm qilish" onClick={handleSetMain} />}
                <MenuItem
                  icon={Trash2}
                  label="O'chirish"
                  danger
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmDelete(true);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rasm maydoni */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          start.current = null;
          setDrag({ x: 0, y: 0, active: false });
        }}
      >
        <div
          key={photo.id}
          className="relative w-[min(100vw,100%)] max-w-[min(92vw,640px)] aspect-square"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) scale(${drag.y ? Math.max(0.85, 1 - drag.y / 1200) : 1})`,
            transition: drag.active ? 'none' : 'transform 200ms ease-out',
          }}
        >
          {/* Kichik nusxa darhol (keshdan) — katta nusxa yuklanguncha xira fon sifatida */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl(userId, photo.id, 'small')}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`absolute inset-0 w-full h-full object-contain blur-md scale-[1.02] transition-opacity duration-300 ${
              loaded[photo.id] ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl(userId, photo.id, 'full')}
            alt={title ? `${title} — profil rasmi` : 'Profil rasmi'}
            draggable={false}
            onLoad={() => setLoaded((m) => ({ ...m, [photo.id]: true }))}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              loaded[photo.id] ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Desktop o'q tugmalari */}
        {index > 0 && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => go(-1)}
            aria-label="Oldingi rasm"
            className="hidden md:inline-flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ChevronLeft size={26} />
          </button>
        )}
        {index < count - 1 && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => go(1)}
            aria-label="Keyingi rasm"
            className="hidden md:inline-flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ChevronRight size={26} />
          </button>
        )}
      </div>

      {/* Pastki qism: kichik rasmlar lentasi (2+ rasm bo'lsa) */}
      {count > 1 && (
        <div
          className="flex justify-center gap-1.5 px-3 pb-4 pt-2 overflow-x-auto"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(i - index)}
              aria-label={`${i + 1}-rasm`}
              aria-current={i === index ? 'true' : undefined}
              className={`flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden ring-2 transition-all focus-visible:outline-none focus-visible:ring-white ${
                i === index ? 'ring-white opacity-100' : 'ring-transparent opacity-50 hover:opacity-80'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl(userId, p.id, 'small')} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* O'chirishni tasdiqlash */}
      {confirmDelete && (
        <div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={() => !working && setConfirmDelete(false)}>
          <div
            role="alertdialog"
            aria-label="Rasmni o'chirish"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-white/10 p-5 shadow-2xl"
          >
            <p className="text-base font-semibold mb-1">Rasmni o'chirasizmi?</p>
            <p className="text-sm text-white/65 mb-5">
              {index === 0 && count > 1 ? "Keyingi rasm asosiy bo'lib qoladi." : "Bu amalni ortga qaytarib bo'lmaydi."}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={working}
                className="min-h-11 px-4 rounded-xl text-sm font-medium text-white/85 hover:bg-white/10"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={working}
                autoFocus
                className="min-h-11 px-4 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white inline-flex items-center gap-2 disabled:opacity-60"
              >
                {working && <Loader2 size={15} className="animate-spin" />} O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div role="status" className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-white/15 backdrop-blur text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/10 focus-visible:outline-none focus-visible:bg-white/10 ${
        danger ? 'text-red-400' : 'text-white'
      }`}
    >
      <Icon size={17} /> {label}
    </button>
  );
}
