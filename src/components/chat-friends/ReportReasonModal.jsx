'use client';
import { useId, useRef, useState } from 'react';
import { Flag } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useDialogFocus } from '@/features/exam/state/useDialogFocus';
import { REPORT_REASON_CATEGORIES } from '@/lib/chatConstants';

// H-2 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 H — "Report: sabab kategoriyasi +
// xabar konteksti admin'ga boradi") — ilgari MessageBubble.jsx `handleReport` faqat
// `window.prompt("Shikoyat sababi:")` chaqirardi (erkin matn, hech qanday kategoriya).
// Endi kichik kategoriya tanlovi (admin ReportsQueue.jsx ko'rsatadigan
// REPORT_REASON_CATEGORIES bilan bir xil manba) + ixtiyoriy qo'shimcha izoh.
export default function ReportReasonModal({ open, onSubmit, onCancel }) {
  const [category, setCategory] = useState(REPORT_REASON_CATEGORIES[0].value);
  const [note, setNote] = useState('');
  const selectRef = useRef(null);
  const titleId = useId();
  const dialogRef = useDialogFocus(open, selectRef);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(category, note.trim());
    setNote('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel?.()}
    >
      <form
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        className="bg-surface rounded-2xl shadow-card border border-border p-5 sm:p-6 w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            <Flag size={18} />
          </div>
          <h3 id={titleId} className="font-bold text-ink font-display">
            Shikoyat qilish
          </h3>
        </div>

        <label className="block mb-3">
          <span className="block text-xs font-medium text-muted mb-1.5">Sabab</span>
          <select
            ref={selectRef}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-base md:text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors"
          >
            {REPORT_REASON_CATEGORIES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-5">
          <span className="block text-xs font-medium text-muted mb-1.5">Izoh (ixtiyoriy)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Qo'shimcha izoh..."
            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-base md:text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors resize-none"
          />
        </label>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Bekor qilish
          </Button>
          <Button type="submit" className="flex-1">
            Yuborish
          </Button>
        </div>
      </form>
    </div>
  );
}
