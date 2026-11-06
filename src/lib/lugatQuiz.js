// Lug'at mashq rejimlari (kollokatsiya, so'z oilasi, mnemonika) va o'yin savollari uchun umumiy
// yordamchilar — bir xil klasslar har faylda takrorlanmasin.

// Kategoriya almashganda sahifa holati (idx, navbat) noldan qurilishi uchun React `key`.
export function categoryKey(activeCatIndex, activeCategory) {
  return `${activeCatIndex}:${activeCategory?._id || ''}`;
}

// So'zdagi `(`, `[`, `+` kabi belgilar RegExp'ni sindirmasligi uchun.
export function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Javob variant tugmasining holat klassi (dark-mode'da invert bo'ladigan tokenlar).
export function optionStateClass(answered, isCorrectOpt, isSelected) {
  if (answered) {
    if (isCorrectOpt) return 'border-success/40 bg-success-soft text-success';
    if (isSelected) return 'border-danger/40 bg-danger-soft text-danger';
  }
  return 'border-border bg-surface text-ink hover:border-accent/40 hover:bg-bg-sunken/60';
}

// Tekshirilgan yozma javob maydoni (input) klassi.
export function answerStateClass(isCorrect) {
  return isCorrect ? 'border-success/40 bg-success-soft text-success' : 'border-danger/40 bg-danger-soft text-danger';
}

// Variant tugmasi — kamida 48px balandlik (mobil va desktop), katta matn, yumaloq burchak.
export const OPTION_BUTTON_CLASS =
  'w-full min-h-12 text-left px-4 py-3 border-2 rounded-2xl text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40';
