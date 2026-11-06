'use client';
import { useEffect, useRef, useState } from 'react';
import { formatCallDuration } from '@/lib/chatConstants';

// Qo'ng'iroq UI uchun kichik umumiy yordamchilar: ism, taymer, oqimni <video>/<audio>ga bog'lash,
// burchaklarga yopishadigan sudraladigan oyna (lokal preview va PiP karta).

export const peerDisplayName = (peer) => peer?.nickname || peer?.name || (peer?.username ? `@${peer.username}` : '');

/** `since` (ms) dan beri o'tgan soniyalar; har soniyada yangilanadi. */
export function useElapsedSec(since, running = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!since || !running) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [since, running]);
  if (!since) return 0;
  return Math.max(0, Math.floor((now - since) / 1000));
}

export const elapsedLabel = (sec) => formatCallDuration(sec) || '0:00';

/** MediaStream'ni media elementga bog'laydi (srcObject React prop emas). */
export function useStreamRef(stream) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.srcObject !== stream) el.srcObject = stream || null;
    if (stream) el.play?.().catch(() => {});
  }, [stream]);
  return ref;
}

const CORNERS = ['tl', 'tr', 'bl', 'br'];

/**
 * Burchakka yopishadigan sudrash: pointer bilan suriladi, qo'yib yuborilganda eng yaqin burchakka
 * o'tadi. `moved()` — bosish sudrash bilan tugaganini bilish uchun (click'ni bekor qilish).
 */
export function useCornerDrag(initial = 'tr') {
  const [corner, setCorner] = useState(initial);
  const [offset, setOffset] = useState(null);
  const dragRef = useRef(null);

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragRef.current = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    setOffset({ dx, dy });
  };
  const finish = (e) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.moved) {
      const left = e.clientX < window.innerWidth / 2;
      const top = e.clientY < window.innerHeight / 2;
      setCorner(CORNERS[(top ? 0 : 2) + (left ? 0 : 1)]);
    }
    setOffset(null);
    // `moved` click handler'gacha saqlanadi, keyingi bosishda tozalanadi.
    dragRef.current = { ...d, id: null };
  };

  return {
    corner,
    style: offset ? { transform: `translate(${offset.dx}px, ${offset.dy}px)`, transition: 'none', touchAction: 'none' } : { touchAction: 'none' },
    handlers: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish },
    moved: () => !!dragRef.current?.moved,
  };
}
