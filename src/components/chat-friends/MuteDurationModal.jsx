'use client';
import { useId, useRef } from 'react';
import { BellOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useDialogFocus } from '@/features/exam/state/useDialogFocus';
import { MUTE_DURATION_OPTIONS } from '@/lib/chatConstants';

// G-3 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 G — "Mute: 1 soat / 8 soat / 1 kun /
// doimiy") — ilgari sarlavhadagi 🔔 tugmasi to'g'ridan-to'g'ri (faqat doimiy) mute
// qilardi. Endi bosilganda shu davomiylik tanlash oynasi ochiladi (ConversationView.jsx).
export default function MuteDurationModal({ open, onSelect, onCancel }) {
  const firstRef = useRef(null);
  const titleId = useId();
  const dialogRef = useDialogFocus(open, firstRef);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel?.()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-surface rounded-2xl shadow-card border border-border p-5 sm:p-6 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            <BellOff size={18} />
          </div>
          <h3 id={titleId} className="font-bold text-ink font-display">
            Necha vaqtga ovozsiz?
          </h3>
        </div>

        <div className="space-y-1.5 mb-4">
          {MUTE_DURATION_OPTIONS.map((opt, i) => (
            <button
              key={opt.value}
              ref={i === 0 ? firstRef : undefined}
              type="button"
              onClick={() => onSelect?.(opt.durationMs)}
              className="w-full min-h-11 px-3.5 py-2.5 text-left bg-bg hover:bg-primary-soft rounded-xl text-sm text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Button type="button" variant="secondary" onClick={onCancel} className="w-full">
          Bekor qilish
        </Button>
      </div>
    </div>
  );
}
