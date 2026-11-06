// Chatdagi ovozli/video pufakchalarni boshqarish: bir vaqtda faqat bittasi o'ynaydi; qo'ng'iroq
// boshlanganda (CallProvider `PAUSE_MEDIA_EVENT` yuboradi) hammasi to'xtaydi (CALLS_SPEC §9.6).
export const PAUSE_MEDIA_EVENT = 'vocably:pause-media';

/** `current` (o'ynayotgan element) dan boshqa barcha `[data-chat-media]` elementlarni to'xtatadi. */
export function pauseOtherMedia(current) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-chat-media]').forEach((el) => {
    if (el !== current && !el.paused) el.pause();
  });
}

/** Hamma chat mediasini to'xtatish signalini yuboradi (MessageBubble tinglaydi). */
export function requestPauseAllMedia() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PAUSE_MEDIA_EVENT));
}
