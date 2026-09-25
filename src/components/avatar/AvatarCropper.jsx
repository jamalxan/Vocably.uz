'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { X, Check, RotateCcw, ZoomIn, ZoomOut, Loader2, Undo2 } from 'lucide-react';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  clampOffset,
  clampZoom,
  coverScale,
  renderCrop,
  zoomAround,
} from '@/lib/avatarCrop';
import { AVATAR_OUTPUT } from './avatarConfig';

// Telegram'dagi "Rasmni tahrirlash" oynasi: dumaloq niqob ostida rasmni sudrash,
// sichqon g'ildiragi / ikki barmoq (pinch) / slayder bilan kattalashtirish, 90°
// burish. Natija — ikki JPEG (640 va 160px), `onConfirm({ full, small })`ga beriladi.
// Yuklash jarayonini (progress) ota komponent boshqaradi — `busy`/`progress` orqali.
export default function AvatarCropper({ file, onCancel, onConfirm, busy = false, progress = 0, error = '' }) {
  const titleId = useId();
  const stageRef = useRef(null);
  const saveRef = useRef(null);
  const [viewport, setViewport] = useState(300);
  const [image, setImage] = useState(null); // HTMLImageElement
  const [loadError, setLoadError] = useState('');
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [interacting, setInteracting] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [rendering, setRendering] = useState(false);

  // Holatni ref'da ham saqlaymiz — pointer/wheel handler'lar har renderda qayta
  // ulanmasin (aks holda pinch o'rtasida eski qiymat bilan hisoblanardi).
  const stateRef = useRef({ rotation, zoom, offset, viewport, image });
  stateRef.current = { rotation, zoom, offset, viewport, image };

  // Rasmni yuklash
  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setRotation(0);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.onerror = () => setLoadError("Bu rasmni ochib bo'lmadi. JPG, PNG yoki WEBP formatidagi rasm tanlang.");
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Oyna o'lchami — ekran kengligiga moslashadi (telefonda ham to'liq sig'adi).
  useEffect(() => {
    const update = () => setViewport(Math.max(220, Math.min(340, window.innerWidth - 48, window.innerHeight - 260)));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const apply = useCallback((next) => {
    const s = { ...stateRef.current, ...next };
    if (!s.image) return;
    const z = clampZoom(s.zoom);
    const o = clampOffset(s.offset, {
      width: s.image.naturalWidth,
      height: s.image.naturalHeight,
      rotation: s.rotation,
      zoom: z,
      viewport: s.viewport,
    });
    setZoom(z);
    setOffset(o);
    if (next.rotation !== undefined) setRotation(next.rotation);
  }, []);

  // Oyna o'lchami o'zgarsa, siljishni qayta cheklaymiz.
  useEffect(() => {
    if (image) apply({});
  }, [viewport, image, apply]);

  // --- Sudrash va pinch (Pointer Events — sichqon, sensor, qalam bir xil) ---
  const pointers = useRef(new Map());
  const gesture = useRef(null);

  const stagePoint = (e) => {
    const r = stageRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
  };

  const onPointerDown = (e) => {
    if (!image || busy) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, stagePoint(e));
    setInteracting(true);
    setAnimate(false);
    startGesture();
  };

  const startGesture = () => {
    const pts = [...pointers.current.values()];
    const { zoom: z, offset: o } = stateRef.current;
    if (pts.length >= 2) {
      const [a, b] = pts;
      gesture.current = {
        type: 'pinch',
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        zoom: z,
        offset: o,
      };
    } else if (pts.length === 1) {
      gesture.current = { type: 'drag', start: pts[0], offset: o };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, stagePoint(e));
    const g = gesture.current;
    if (!g) return;
    const pts = [...pointers.current.values()];
    if (g.type === 'drag' && pts.length === 1) {
      apply({ offset: { x: g.offset.x + pts[0].x - g.start.x, y: g.offset.y + pts[0].y - g.start.y } });
    } else if (g.type === 'pinch' && pts.length >= 2) {
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const nextZoom = clampZoom((g.zoom * dist) / g.dist);
      const zoomed = zoomAround(g.offset, g.mid, g.zoom, nextZoom);
      apply({ zoom: nextZoom, offset: { x: zoomed.x + mid.x - g.mid.x, y: zoomed.y + mid.y - g.mid.y } });
    }
  };

  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      gesture.current = null;
      setInteracting(false);
    } else {
      startGesture(); // pinch'dan bitta barmoq qolsa — sakramasdan sudrashga o'tadi
    }
  };

  // G'ildirak bilan zoom — passive:false bo'lishi shart (sahifa aylanmasin).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const { zoom: z, offset: o } = stateRef.current;
      const next = clampZoom(z * Math.exp(-e.deltaY * 0.0015));
      const r = el.getBoundingClientRect();
      const anchor = { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
      setAnimate(false);
      apply({ zoom: next, offset: zoomAround(o, anchor, z, next) });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [apply, image]);

  const setZoomCentered = (next) => {
    const { zoom: z, offset: o } = stateRef.current;
    const nz = clampZoom(next);
    apply({ zoom: nz, offset: zoomAround(o, { x: 0, y: 0 }, z, nz) });
  };

  const rotate = () => {
    const { rotation: r, offset: o } = stateRef.current;
    setAnimate(true);
    // Soat miliga teskari 90°: ekran nuqtasi (x, y) -> (y, -x)
    apply({ rotation: r - 90, offset: { x: o.y, y: -o.x } });
  };

  const reset = () => {
    setAnimate(true);
    apply({ rotation: 0, zoom: 1, offset: { x: 0, y: 0 } });
  };

  const save = async () => {
    if (!image || busy || rendering) return;
    setRendering(true);
    try {
      const state = { rotation, zoom, offset, viewport };
      const [full, small] = await Promise.all([
        renderCrop(image, state, AVATAR_OUTPUT.full, 0.9),
        renderCrop(image, state, AVATAR_OUTPUT.small, 0.85),
      ]);
      await onConfirm({ full, small });
    } catch {
      setLoadError("Rasmni tayyorlab bo'lmadi. Boshqa rasm tanlab ko'ring.");
    } finally {
      setRendering(false);
    }
  };

  // Klaviatura: strelkalar — surish, +/- — zoom, R — burish, Enter — saqlash, Esc — bekor.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) return onCancel?.();
      if (!stateRef.current.image || busy) return undefined;
      const step = e.shiftKey ? 40 : 10;
      const { offset: o, zoom: z } = stateRef.current;
      const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
      if (moves[e.key]) {
        e.preventDefault();
        setAnimate(false);
        apply({ offset: { x: o.x + moves[e.key][0], y: o.y + moves[e.key][1] } });
      } else if (e.key === '+' || e.key === '=') {
        setZoomCentered(z * 1.15);
      } else if (e.key === '-') {
        setZoomCentered(z / 1.15);
      } else if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        rotate();
      }
      return undefined;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, onCancel, apply]);

  useEffect(() => {
    saveRef.current?.focus();
  }, [image]);

  // Body scroll'ini bloklash (mobilda orqa fon surilmasin).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const scale = image ? coverScale(image.naturalWidth, image.naturalHeight, rotation, viewport) * zoom : 1;
  const working = busy || rendering;
  const shownError = loadError || error;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md flex flex-col items-center gap-4 text-white"
      >
        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Bekor qilish"
            className="w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X size={22} />
          </button>
          <h2 id={titleId} className="text-base font-semibold">
            Rasmni joylashtiring
          </h2>
          <button
            type="button"
            onClick={reset}
            disabled={!image || working}
            aria-label="Asl holatga qaytarish"
            title="Asl holatga qaytarish"
            className="w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <Undo2 size={19} />
          </button>
        </div>

        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`relative overflow-hidden rounded-2xl bg-black touch-none ${image ? (interacting ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
          style={{ width: viewport, height: viewport }}
          aria-label="Rasm maydoni: sudrab joylashtiring, g'ildirak yoki ikki barmoq bilan kattalashtiring"
        >
          {!image && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin text-white/70" size={28} />
            </div>
          )}
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.src}
              alt=""
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
              style={{
                width: image.naturalWidth,
                height: image.naturalHeight,
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})`,
                transition: animate ? 'transform 220ms cubic-bezier(.2,.8,.2,1)' : 'none',
              }}
            />
          )}
          {/* Dumaloq niqob: tashqarisi xiralashtirilgan, doira chegarasi ingichka oq chiziq */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full pointer-events-none ring-1 ring-white/60"
            style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }}
          />
          {/* Sudrash paytida "uchdan bir" to'r chiziqlari (Telegram kabi) */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${interacting ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute left-1/3 inset-y-0 w-px bg-white/35" />
            <div className="absolute left-2/3 inset-y-0 w-px bg-white/35" />
            <div className="absolute top-1/3 inset-x-0 h-px bg-white/35" />
            <div className="absolute top-2/3 inset-x-0 h-px bg-white/35" />
          </div>
          {working && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
              <ProgressRing value={busy ? progress : 0} />
              <span className="text-xs text-white/85">{busy ? 'Yuklanmoqda…' : 'Tayyorlanmoqda…'}</span>
            </div>
          )}
        </div>

        {shownError && (
          <p role="alert" className="text-sm text-red-300 text-center">
            {shownError}
          </p>
        )}

        <div className="w-full flex items-center gap-3" style={{ maxWidth: viewport }}>
          <button
            type="button"
            onClick={() => setZoomCentered(zoom / 1.25)}
            disabled={!image || working || zoom <= MIN_ZOOM}
            aria-label="Kichraytirish"
            className="w-11 h-11 inline-flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ZoomOut size={18} />
          </button>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            disabled={!image || working}
            onChange={(e) => {
              setAnimate(false);
              setZoomCentered(Number(e.target.value));
            }}
            aria-label="Kattalashtirish darajasi"
            className="flex-1 accent-white"
          />
          <button
            type="button"
            onClick={() => setZoomCentered(zoom * 1.25)}
            disabled={!image || working || zoom >= MAX_ZOOM}
            aria-label="Kattalashtirish"
            className="w-11 h-11 inline-flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <div className="w-full flex items-center justify-between" style={{ maxWidth: viewport }}>
          <button
            type="button"
            onClick={rotate}
            disabled={!image || working}
            aria-label="90° burish"
            title="Burish (R)"
            className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <RotateCcw size={20} />
          </button>
          <p className="text-[11px] text-white/55 text-center px-2 hidden sm:block">Sudrang · g'ildirak bilan kattalashtiring</p>
          <button
            ref={saveRef}
            type="button"
            onClick={save}
            disabled={!image || working}
            aria-label="Saqlash"
            title="Saqlash (Enter)"
            className="w-14 h-14 inline-flex items-center justify-center rounded-full bg-accent text-on-accent shadow-lg hover:bg-accent-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {working ? <Loader2 size={22} className="animate-spin" /> : <Check size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ value }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true" className={value ? '' : 'animate-spin'}>
      <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="4" />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={value ? c * (1 - value) : c * 0.7}
        transform="rotate(-90 26 26)"
        style={{ transition: 'stroke-dashoffset 150ms linear' }}
      />
    </svg>
  );
}
