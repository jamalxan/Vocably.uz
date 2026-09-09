// `rate` — ListeningMode'ning "Tezlashtirilgan" darajasi (1.25x, VOCABLY-TZ.md 6.1.6) uchun
// ixtiyoriy override, berilmasa standart (0.9, biroz sekinroq — o'quvchilar uchun qulayroq).
export function speakText(text, { rate } = {}) {
  if (!text) return;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate ?? 0.9;
    window.speechSynthesis.speak(u);
  }
}
