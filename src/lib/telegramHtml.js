/** Telegram `parse_mode: 'HTML'` uchun matnni ekranlaydi (foydalanuvchi kiritgan ism/matn teglar yoki parse xatosiga olib kelmasin). */
export function escapeTelegramHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
