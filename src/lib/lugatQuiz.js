// Lug'at mashq rejimlari (cloze, kollokatsiya, antonim, jumla, so'z oilasi, tezkor,
// tinglab yozish) uchun umumiy yordamchilar — 7 ta faylda bir xil klasslar takrorlanmasin.

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
  return 'border-border text-ink hover:border-accent/30';
}

// Tekshirilgan yozma javob maydoni (input) klassi.
export function answerStateClass(isCorrect) {
  return isCorrect ? 'border-success/40 bg-success-soft text-success' : 'border-danger/40 bg-danger-soft text-danger';
}

// Variant tugmasi — mobilda 44px, desktopda avvalgi zichlik.
export const OPTION_BUTTON_CLASS =
  'w-full text-left px-4 py-3 md:py-2.5 border rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40';
