// Telefon raqamlarni solishtirish va saqlash uchun yordamchi funksiyalar.
// Har xil formatlarda kiritilgan raqamlarni (bo'shliq, tire, qavs, + bilan/-siz)
// bitta standart ko'rinishga keltiradi.

// Faqat raqamlarni qoldiradi (+ belgisisiz)
function digitsOnly(raw) {
  return String(raw || '').replace(/\D/g, '');
}

// Foydalanuvchi kiritgan raqamni "+998901234567" ko'rinishiga keltiradi.
// Agar raqam yaroqsiz bo'lsa (juda qisqa) - null qaytaradi.
export function normalizePhone(raw) {
  let digits = digitsOnly(raw);
  if (!digits) return null;

  // Agar 9 xonali bo'lsa (masalan 901234567) - O'zbekiston kodini qo'shamiz
  if (digits.length === 9) {
    digits = '998' + digits;
  }
  // Agar 998 bilan boshlanmasa-yu 12 xonadan kam bo'lsa - baribir davom etamiz,
  // chunki xalqaro raqamlar ham bo'lishi mumkin.

  if (digits.length < 9) return null;

  return '+' + digits;
}

// Ikki raqamni oxirgi 9 ta raqami bo'yicha solishtiradi (kod farqi bo'lsa ham mos kelishi uchun)
export function phonesMatch(a, b) {
  const da = digitsOnly(a);
  const db = digitsOnly(b);
  if (!da || !db) return false;
  const tailA = da.slice(-9);
  const tailB = db.slice(-9);
  return tailA === tailB && tailA.length === 9;
}

// Foydalanuvchiga ko'rsatish uchun chiroyli formatlash: +998 90 123 45 67
export function formatPhoneDisplay(normalized) {
  const digits = digitsOnly(normalized);
  if (digits.length !== 12) return normalized || '';
  const cc = digits.slice(0, 3);
  const a = digits.slice(3, 5);
  const b = digits.slice(5, 8);
  const c = digits.slice(8, 10);
  const d = digits.slice(10, 12);
  return `+${cc} ${a} ${b} ${c} ${d}`;
}
