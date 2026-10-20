// getUserMedia() xatosini foydalanuvchi tushunadigan, HARAKATGA UNDAYDIGAN matnga
// aylantiradi — avval hamma xato uchun bitta umumiy "ruxsat berilmadi" xabari bor edi,
// bu esa haqiqiy sababni (masalan qurilma band, yoki Windows darajasidagi bloklash)
// yashirib, foydalanuvchini noto'g'ri yo'lga (faqat brauzer sayt-ruxsatini qayta
// tekshirish) yo'naltirardi.
const EN_DEVICE = { Mikrofon: 'Microphone', Kamera: 'Camera', 'Kamera/mikrofon': 'Camera/microphone', 'Mikrofon/kamera': 'Microphone/camera' };

function mediaErrorMessageEn(err, deviceLabel) {
  const label = EN_DEVICE[deviceLabel] || deviceLabel;
  switch (err?.name || '') {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return (
        `${label} access was denied. Click the lock icon (🔒) in the address bar, set the site permission to "Allow" and reload the page. ` +
        'If it already shows as allowed, it may be an operating-system restriction ' +
        '(Windows: Settings → Privacy & security → Microphone/Camera → make sure "Let apps access" is on).'
      );
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return `${label}: device not found. Check that it is connected.`;
    case 'NotReadableError':
    case 'TrackStartError':
      return `${label}: the device is busy — another app (Zoom, Teams, etc.) may be using it.`;
    case 'SecurityError':
      return 'A secure connection (HTTPS) is required.';
    case 'OverconstrainedError':
      return `${label}: the device does not support the requested settings.`;
    default:
      return err?.message ? `Could not start (${label}): ${err.message}` : `Could not start (${label}).`;
  }
}

export function mediaErrorMessage(err, deviceLabel = 'Mikrofon/kamera', locale = 'en') {
  if (locale !== 'uz') return mediaErrorMessageEn(err, deviceLabel);
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
