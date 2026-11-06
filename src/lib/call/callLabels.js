// Qo'ng'iroq pufakchasi (CallBubble) uchun sof yorliq yordamchilari — CALLS_SPEC §9.5.
// `isMine` — ko'ruvchi qo'ng'iroq qilgan tomonmi (qo'ng'iroq yozuvida senderId = callerId).
export { formatCallDuration } from '@/lib/chatConstants';

const LABELS = {
  ended: ['mb.callOut', 'mb.callIn'],
  cancelled: ['mb.callCancelled', 'mb.callMissed'],
  missed: ['mb.callNoAnswer', 'mb.callMissed'],
  declined: ['mb.callDeclined', 'mb.callDeclined'],
  busy: ['mb.callBusy', 'mb.callMissed'],
  failed: ['mb.callFailed', 'mb.callFailed'],
};

export function callBubbleLabelKey(outcome, isMine) {
  const pair = LABELS[outcome] || LABELS.failed;
  return isMine ? pair[0] : pair[1];
}

/** Qabul qiluvchi uchun "javobsiz" (qizil) ko'rinish. */
export function isMissedForViewer(outcome, isMine) {
  return !isMine && ['missed', 'cancelled', 'busy'].includes(outcome);
}

/** lucide-react ikonka nomi (CallBubble shu nom bo'yicha tanlaydi). */
export function callIconName(kind, outcome, isMine) {
  if (kind === 'video') return outcome === 'missed' || outcome === 'declined' || isMissedForViewer(outcome, isMine) ? 'VideoOff' : 'Video';
  if (isMissedForViewer(outcome, isMine)) return 'PhoneMissed';
  return isMine ? 'PhoneOutgoing' : 'PhoneIncoming';
}
