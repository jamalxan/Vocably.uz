'use client';
import { useId, useRef, type KeyboardEvent, type ReactNode, type TouchEvent } from 'react';

// TZ-vocably-v2.md §12.2 — "<768px: Tab rejimi... [Matn][Savollar ●]
// segmented control, sticky... Tab'lar orasida swipe ishlaydi... Barcha
// bosiladigan elementlar min-height: 44px."
const SWIPE_THRESHOLD_PX = 50;

export interface MobileTabsProps {
  left: ReactNode;
  right: ReactNode;
  rightPadded: boolean;
  tabs: [string, string];
  active: 0 | 1;
  onChange: (tab: 0 | 1) => void;
}

export default function MobileTabs({ left, right, rightPadded, tabs, active, onChange }: MobileTabsProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const idBase = useId();

  const onTouchStart = (e: TouchEvent) => {
    // Matn maydoni/select ichidagi kursor sudrash tab almashtirmasin.
    if ((e.target as Element).closest?.('textarea, input, select, [contenteditable="true"], [data-no-swipe]')) {
      touchStart.current = null;
      return;
    }
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    // Faqat asosan gorizontal harakat swipe deb hisoblanadi — aks holda
    // vertikal scroll (savollar ro'yxatini yuqori/past qilish) tasodifiy
    // tab almashtirib yubormasligi kerak.
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy) * 2) {
      if (dx < 0 && active === 0) onChange(1);
      if (dx > 0 && active === 1) onChange(0);
    }
  };

  const contentPadded = active === 0 || rightPadded;

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = (active === 0 ? 1 : 0) as 0 | 1;
    onChange(next);
    document.getElementById(`${idBase}-tab-${next}`)?.focus();
  };

  return (
    <div className="h-full min-w-0 flex flex-col">
      <div
        role="tablist"
        aria-label="Bo'lim tanlash"
        className="flex-shrink-0 sticky top-0 z-10 flex gap-1 p-1"
        style={{ background: 'var(--exam-chrome)', borderBottom: '1px solid var(--exam-chrome-border)' }}
      >
        {tabs.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            id={`${idBase}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${idBase}-panel`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => onChange(i as 0 | 1)}
            onKeyDown={onTabKeyDown}
            className="flex-1 rounded-lg text-sm font-semibold transition-colors"
            style={{
              minHeight: 44,
              background: active === i ? 'var(--exam-bg)' : 'transparent',
              color: active === i ? 'var(--exam-accent)' : 'var(--exam-muted)',
              boxShadow: active === i ? '0 1px 2px rgba(0,0,0,.08)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        id={`${idBase}-panel`}
        role="tabpanel"
        aria-labelledby={`${idBase}-tab-${active}`}
        className={`flex-1 min-h-0 ${contentPadded ? 'overflow-y-auto overscroll-contain px-4 sm:px-6 py-4' : 'overflow-hidden'}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {active === 0 ? left : right}
      </div>
    </div>
  );
}
