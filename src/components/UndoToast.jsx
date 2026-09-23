'use client';
import { Undo2 } from 'lucide-react';

// Mobil (<768): pastki tab bar (~62px + safe-area) ustida, o'ngdagi AI tugmasiga
// tegmasligi uchun right-20. md+ da odatdagidek pastda, markazda.
export default function UndoToast({ message, onUndo }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-50 left-4 right-20 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-5 md:max-w-[calc(100vw-2rem)] bg-primary text-on-primary rounded-xl shadow-card px-4 py-3 flex items-center justify-between gap-3 text-sm"
    >
      <span className="min-w-0 break-words">{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="flex items-center gap-1 flex-shrink-0 px-2 py-3 -my-3 -mr-2 rounded-lg text-on-primary hover:opacity-80 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary"
      >
        <Undo2 size={14} aria-hidden="true" /> Bekor qilish
      </button>
    </div>
  );
}
