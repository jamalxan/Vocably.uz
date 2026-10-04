// getUserMedia() xatosini foydalanuvchi tushunadigan, HARAKATGA UNDAYDIGAN matnga
// aylantiradi — avval hamma xato uchun bitta umumiy "ruxsat berilmadi" xabari bor edi,
// bu esa haqiqiy sababni (masalan qurilma band, yoki Windows darajasidagi bloklash)
// yashirib, foydalanuvchini noto'g'ri yo'lga (faqat brauzer sayt-ruxsatini qayta
// tekshirish) yo'naltirardi.
const RU_DEVICE = { Mikrofon: 'Микрофон', Kamera: 'Камера', 'Kamera/mikrofon': 'Камера/микрофон', 'Mikrofon/kamera': 'Микрофон/камера' };

function mediaErrorMessageRu(err, deviceLabel) {
  const label = RU_DEVICE[deviceLabel] || deviceLabel;
  switch (err?.name || '') {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return (
        `Доступ запрещён: ${label}. Нажмите на значок замка (🔒) в адресной строке, измените разрешение для сайта на «Разрешить» и обновите страницу. ` +
        'Если там уже разрешено — возможно, это ограничение операционной системы ' +
        '(Windows: Параметры → Конфиденциальность и безопасность → Микрофон/Камера → проверьте, что «Разрешить приложениям доступ» включено).'
      );
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return `${label}: устройство не найдено. Проверьте, что оно подключено.`;
    case 'NotReadableError':
    case 'TrackStartError':
      return `${label}: устройство занято — возможно, его использует другая программа (Zoom, Teams и т. д.).`;
    case 'SecurityError':
      return 'Требуется безопасное соединение (HTTPS).';
    case 'OverconstrainedError':
      return `${label}: устройство не поддерживает запрошенные настройки.`;
    default:
      return err?.message ? `Не удалось запустить (${label}): ${err.message}` : `Не удалось запустить (${label}).`;
  }
}

export function mediaErrorMessage(err, deviceLabel = 'Mikrofon/kamera', locale = 'uz') {
  if (locale === 'ru') return mediaErrorMessageRu(err, deviceLabel);
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
