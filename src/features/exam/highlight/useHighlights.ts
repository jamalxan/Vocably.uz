'use client';
import { useCallback, useState } from 'react';
import { addHighlight, removeHighlight, setHighlightNote } from '../state/attemptsApi';
import type { Highlight } from '@/lib/exam/types';

// TZ-vocably-v2.md §6.3 / §19 Faza 3 item 19 — belgilash/eslatma har amalda
// DARHOL serverga saqlanadi (davomiy typing emas — bitta belgilash/o'chirish/
// eslatma bitta diskret amal), shuning uchun `examStore`'ning dirtyKeys-debounce
// autosave mexanizmiga QO'SHILMAYDI, alohida yengil hook. Optimistik UI:
// qo'shish/o'chirish darhol local state'da ko'rinadi, server so'rovi orqa fonda.
export function useHighlights(attemptId: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // Urinish `fetchAttempt` orqali yuklanganda saqlangan belgilashlarni
  // shu yerga "urug'lantiradi" — hook mount bo'lganda ma'lumot hali tayyor
  // emas (async fetch), shuning uchun boshlang'ich holat emas, alohida chaqiruv.
  const seed = useCallback((list: Highlight[]) => setHighlights(list), []);

  const add = useCallback(
    async (passageOrder: number, paragraphIndex: number, startOffset: number, endOffset: number) => {
      // Vaqtinchalik id — server javobi kelguncha ham `<mark>` ko'rinishi kerak (applyHighlights sync).
      const tempId = `tmp-${Date.now()}`;
      const optimistic: Highlight = { id: tempId, passageOrder, paragraphIndex, startOffset, endOffset };
      setHighlights((prev) => [...prev, optimistic]);
      try {
        const { highlight } = await addHighlight(attemptId, { passageOrder, paragraphIndex, startOffset, endOffset });
        setHighlights((prev) => prev.map((h) => (h.id === tempId ? highlight : h)));
      } catch {
        setHighlights((prev) => prev.filter((h) => h.id !== tempId));
      }
    },
    [attemptId]
  );

  const remove = useCallback(
    async (highlightId: string) => {
      let removed: Highlight | undefined;
      setHighlights((prev) => {
        removed = prev.find((h) => h.id === highlightId);
        return prev.filter((h) => h.id !== highlightId);
      });
      try {
        await removeHighlight(attemptId, highlightId);
      } catch {
        if (removed) setHighlights((prev) => [...prev, removed as Highlight]);
      }
    },
    [attemptId]
  );

  const setNote = useCallback(
    async (highlightId: string, note: string) => {
      setHighlights((prev) => prev.map((h) => (h.id === highlightId ? { ...h, note } : h)));
      try {
        await setHighlightNote(attemptId, highlightId, note);
      } catch {
        // Eslatma matnini yo'qotmaslik uchun rollback qilinmaydi — foydalanuvchi
        // yozganini ko'radi, keyingi muvaffaqiyatli amalda sinxron bo'ladi.
      }
    },
    [attemptId]
  );

  return { highlights, seed, add, remove, setNote };
}
