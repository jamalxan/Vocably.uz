'use client';
import { useEffect } from 'react';
import type { MockKind } from '@/lib/exam/mockKind';

// VOCABLY_TZ_FINAL...2026-09-20.md §52.6 — "Secure Mock'da quyidagilarni
// bosqichma-bosqich joriy qilish kerak: tab visibility events, window blur/
// focus events, fullscreen exit events, copy/cut/paste attempt logging..."
// Bu MVP subset (task hujjatiga q. — full anti-cheat/proctoring OUT OF
// SCOPE): faqat ATTEMPT_EVENT_TYPES'da (models.js) ALLAQACHON mavjud sakkizta
// hodisa (visibility/fullscreen/blur/focus/copy/paste), POST
// /api/exam/attempts/:id/event ga (allaqachon qurilgan, hech qachon
// chaqirilmagan — bu hook uni birinchi marta ULAYDI). devtools heuristika/
// multi-session/IP-fingerprint/camera-mic proctoring — YO'Q, katta yangi
// infratuzilma talab qiladi.
//
// Muhim: §52.6 "avtomatik ravishda 'cheat qilgan' hukmini chiqarmasligi
// kerak" — bu hook FAQAT jimgina loglaydi, foydalanuvchiga HECH NARSA
// ko'rsatmaydi (dialog/toast/ogohlantirish yo'q) va hech narsani bloklamaydi.
// Har bir POST fire-and-forget (`.catch(() => {})`), UI oqimini kutmaydi.
//
// Darajalar (§52.1: "Secure Mock = Exam Simulation + kuchli anti-cheating
// telemetriya" — Secure > Exam > Practice signalda):
//   - 'practice' — hech narsa loglanmaydi (hook butunlay o'chirilgan holatda ishlaydi).
//   - 'exam'     — faqat yuqori-signal hodisalar: fullscreen_exit/enter, visibility_hidden/visible.
//   - 'secure'   — yuqoridagilar + blur/focus + copy/paste.
export type IntegrityLevel = MockKind;

export interface UseIntegrityEventsArgs {
  attemptId: string | null;
  // `mode:'mock'` bo'lmagan urinishlarda (standalone section/practice) bu
  // hook UMUMAN ishlamasligi kerak (task talabi) — shuning uchun `active`
  // alohida flag, `level==='practice'`dan farqli (level faqat mock ICHIDA
  // qaysi hodisalar loglanishini boshqaradi).
  active: boolean;
  level: IntegrityLevel;
}

function postEvent(attemptId: string, type: string) {
  fetch(`/api/exam/attempts/${attemptId}/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
    keepalive: true,
  }).catch(() => {
    // Halollik logi — muvaffaqiyatsiz POST hech narsani bloklamaydi va
    // foydalanuvchiga ko'rsatilmaydi (§52.6 "faqat signal", bloklamaydi).
  });
}

/** ExamShell/MockShell darajasida chaqiriladi — `document`/`window`ga
 * eventListener biriktiradi, `attemptId`/`active`/`level` o'zgarganda qayta
 * o'rnatadi. `active=false` yoki `level='practice'` bo'lsa hech qanday
 * listener BIRIKTIRILMAYDI (Practice mock'da telemetriya YO'Q — §52.1). */
export function useIntegrityEvents({ attemptId, active, level }: UseIntegrityEventsArgs) {
  useEffect(() => {
    if (!active || !attemptId || level === 'practice') return undefined;

    const log = (type: string) => postEvent(attemptId, type);

    const onVisibilityChange = () => log(document.visibilityState === 'hidden' ? 'visibility_hidden' : 'visibility_visible');
    const onFullscreenChange = () => log(document.fullscreenElement ? 'fullscreen_enter' : 'fullscreen_exit');
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    // §52.6 — "Secure Mock" faqat: kuchliroq signal (blur/focus/copy/paste)
    // Exam'da SHOVQIN bo'lar edi (masalan Writing'da matn ko'chirish/joylash
    // odatiy holat) — shuning uchun Exam faqat yuqori-signal (tab/fullscreen).
    let onBlur: (() => void) | undefined;
    let onFocus: (() => void) | undefined;
    let onCopy: (() => void) | undefined;
    let onPaste: (() => void) | undefined;
    if (level === 'secure') {
      onBlur = () => log('blur');
      onFocus = () => log('focus');
      onCopy = () => log('copy');
      onPaste = () => log('paste');
      window.addEventListener('blur', onBlur);
      window.addEventListener('focus', onFocus);
      document.addEventListener('copy', onCopy);
      document.addEventListener('paste', onPaste);
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (onBlur) window.removeEventListener('blur', onBlur);
      if (onFocus) window.removeEventListener('focus', onFocus);
      if (onCopy) document.removeEventListener('copy', onCopy);
      if (onPaste) document.removeEventListener('paste', onPaste);
    };
  }, [attemptId, active, level]);
}
