'use client';
import { useCallback, useEffect, useRef } from 'react';

// TZ-vocably-v2.md §6.1 — sudraladigan ajratgich. Pointer Events (sichqoncha +
// teginish ikkalasini ham bitta API bilan qamrab oladi), `requestAnimationFrame`
// bilan tekislangan yangilanish, 30%-70% chegara, double-click 50/50 ga reset,
// klaviatura bilan 2% qadam, `role="separator"`.
const MIN_RATIO = 0.3;
const MAX_RATIO = 0.7;
const KEYBOARD_STEP = 0.02;

export interface DividerProps {
  ratio: number; // 0..1 — chap panel ulushi
  onRatioChange: (ratio: number) => void;
  containerRef: React.RefObject<HTMLElement>;
  onDragStateChange?: (dragging: boolean) => void;
  ariaLabel?: string;
}

export default function Divider({
  ratio,
  onRatioChange,
  containerRef,
  onDragStateChange,
  ariaLabel = "Panellar kengligini o'zgartirish",
}: DividerProps) {
  const draggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const pendingRatioRef = useRef<number | null>(null);

  const applyPendingRatio = useCallback(() => {
    rafRef.current = null;
    if (pendingRatioRef.current != null) {
      onRatioChange(pendingRatioRef.current);
      pendingRatioRef.current = null;
    }
  }, [onRatioChange]);

  const scheduleRatio = useCallback(
    (r: number) => {
      pendingRatioRef.current = Math.min(MAX_RATIO, Math.max(MIN_RATIO, r));
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(applyPendingRatio);
    },
    [applyPendingRatio]
  );

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const r = (e.clientX - rect.left) / rect.width;
      scheduleRatio(r);
    };
    const stopDragging = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.userSelect = '';
      onDragStateChange?.(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, scheduleRatio, onDragStateChange]);

  const startDragging = () => {
    draggingRef.current = true;
    // Sudrash paytida butun sahifa bo'ylab matn tanlanib ketmasin (§6.1).
    document.body.style.userSelect = 'none';
    onDragStateChange?.(true);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onRatioChange(Math.max(MIN_RATIO, ratio - KEYBOARD_STEP));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onRatioChange(Math.min(MAX_RATIO, ratio + KEYBOARD_STEP));
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuemin={Math.round(MIN_RATIO * 100)}
      aria-valuemax={Math.round(MAX_RATIO * 100)}
      tabIndex={0}
      onPointerDown={startDragging}
      onDoubleClick={() => onRatioChange(0.5)}
      onKeyDown={onKeyDown}
      className="relative flex-shrink-0 w-1.5 cursor-col-resize touch-none focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
      style={{ background: 'var(--exam-chrome-border)', boxShadow: 'none' }}
    >
      {/* Sudrash zonasini kengaytiradi — 6px chiziqning o'ziga aniq tegish shart emas. */}
      <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
    </div>
  );
}
