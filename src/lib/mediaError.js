// getUserMedia() xatosini foydalanuvchi tushunadigan, HARAKATGA UNDAYDIGAN matnga
// aylantiradi — avval hamma xato uchun bitta umumiy "ruxsat berilmadi" xabari bor edi,
// bu esa haqiqiy sababni (masalan qurilma band, yoki Windows darajasidagi bloklash)
// yashirib, foydalanuvchini noto'g'ri yo'lga (faqat brauzer sayt-ruxsatini qayta
// tekshirish) yo'naltirardi.
export function mediaErrorMessage(err, deviceLabel = 'Mikrofon/kamera') {
  const name = err?.name || '';
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return (
        `${deviceLabel}ga ruxsat berilmagan. Manzil satridagi qulf (🔒) belgisini bosib, ` +
        `saytga ${deviceLabel.toLowerCase()} ruxsatini "Ruxsat berish"ga o'zgartiring, so'ng sahifani yangilang. ` +
        `Agar u yerda ruxsat berilgan ko'rinsa — bu operatsion tizim darajasidagi cheklov bo'lishi mumkin ` +
        `(Windows: Sozlamalar → Maxfiylik va xavfsizlik → Mikrofon/Kamera → "Ilovalarga ruxsat berish" yoqilganini tekshiring).`
      );
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return `${deviceLabel} topilmadi. Qurilmangizda ${deviceLabel.toLowerCase()} ulanganligini tekshiring.`;
    case 'NotReadableError':
    case 'TrackStartError':
      return `${deviceLabel} band — uni boshqa dastur (Zoom, Teams va h.k.) ishlatayotgan bo'lishi mumkin.`;
    case 'SecurityError':
      return "Xavfsiz ulanish (HTTPS) talab qilinadi.";
    case 'OverconstrainedError':
      return `${deviceLabel} so'ralgan sozlamalarni qo'llab-quvvatlamaydi.`;
    default:
      return err?.message ? `${deviceLabel}ni ishga tushirib bo'lmadi: ${err.message}` : `${deviceLabel}ni ishga tushirib bo'lmadi.`;
  }
}
