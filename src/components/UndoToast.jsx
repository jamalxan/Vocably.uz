'use client';
import { Undo2 } from 'lucide-react';

export default function UndoToast({ message, onUndo }) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary rounded-xl shadow-card px-4 py-3 flex items-center gap-3 text-sm">
      <span>{message}</span>
      <button
        onClick={onUndo}
        className="flex items-center gap-1 text-on-primary hover:opacity-80 font-semibold"
      >
        <Undo2 size={14} /> Bekor qilish
      </button>
    </div>
  );
}
