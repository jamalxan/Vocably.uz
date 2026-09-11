'use client';
import { useEffect, useRef } from 'react';
import { useExamStore, getStoredAuthToken } from './examStore';

const DEBOUNCE_MS = 800;
const SNAPSHOT_INTERVAL_MS = 20000;

// TZ-vocably-v2.md §4.3 (IELTS CD Exam Engine v1.0) — avtosaqlash strategiyasi:
//   | Trigger                        | Nima saqlanadi                    |
//   | Javob o'zgardi                 | 800ms debounce -> shu bitta javob |
//   | Har 20 soniya                  | To'liq snapshot                   |
//   | blur / visibilitychange        | Darhol to'liq snapshot            |
//   | beforeunload                   | keepalive fetch bilan snapshot    |
//   | Bo'lim almashganda             | Majburiy sync                     |
//
// "Bo'lim almashganda" bu hook'da YO'Q — Faza 1 `mode:'section'` (bitta bo'lim)
// bilan ishlaydi, bo'lim almashish faqat Mock orkestratsiyasida bor edi (Faza 3,
// TZ §19 item 15), o'sha yerda qo'shiladi.
//
// ⚠️ `navigator.sendBeacon` ATAYLAB ishlatilmadi: u custom HTTP header
// qo'sha olmaydi, bu loyihada esa autentifikatsiya FAQAT
// `Authorization: Bearer <token>` header orqali ishlaydi (JWT hali
// localStorage'da — BUG-030, Sprint 5'da httpOnly cookie'ga o'tkaziladi).
// `fetch(url, { keepalive: true })` xuddi shu maqsadga (sahifa yopilayotganda
// ham so'rovni yakunlash) xizmat qiladi VA header qo'shishga ruxsat beradi.
export function useAutosave(attemptId: string | null) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!attemptId) return undefined;

    const flush = () => {
      void useExamStore.getState().syncNow();
    };

    // Har bir javob/flag o'zgarishida debounce qayta boshlanadi — 800ms
    // "sukunat"dan keyin yuboriladi (TZ §4.3, birinchi qator).
    const unsubscribe = useExamStore.subscribe((state, prev) => {
      if (state.dirtyKeys === prev.dirtyKeys && state.flaggedDirty === prev.flaggedDirty) return;
      if (state.dirtyKeys.size === 0 && !state.flaggedDirty) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(flush, DEBOUNCE_MS);
    });

    const intervalId = setInterval(flush, SNAPSHOT_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', flush);

    const onBeforeUnload = () => {
      const state = useExamStore.getState();
      if (state.dirtyKeys.size === 0 && !state.flaggedDirty) return;
      const token = getStoredAuthToken();
      if (!token) return;

      const dirtyAnswers: Record<string, unknown> = {};
      for (const key of state.dirtyKeys) dirtyAnswers[key] = state.answers[key];

      fetch(`/api/exam/attempts/${attemptId}/answers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          answers: dirtyAnswers,
          flagged: Array.from(state.flagged),
          lastQuestion: state.currentQuestion,
        }),
        keepalive: true,
      }).catch(() => {
        // Sahifa allaqachon yopilmoqda — xatoni ko'rsatadigan joy yo'q, jimgina o'tkazib yuboramiz.
      });
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', flush);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [attemptId]);
}
