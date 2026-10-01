// Parol siyosati (ro'yxatdan o'tish, parolni tiklash). Pastki chegara mavjud mijoz xulqi bilan bir xil (6); yuqori chegara yangi:
// bcrypt faqat birinchi 72 BAYTni hisobga oladi — juda uzun "parol" foydasiz, lekin hashing/JSON ishlov uchun resurs sarflaydi.
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 128;

/** @returns {string|null} xato xabari yoki null (yaroqli) */
export function passwordError(password) {
  if (typeof password !== 'string') return "Parol noto'g'ri";
  if (password.length < PASSWORD_MIN) return `Parol kamida ${PASSWORD_MIN} belgidan iborat bo'lsin`;
  if (password.length > PASSWORD_MAX) return `Parol ${PASSWORD_MAX} belgidan oshmasin`;
  return null;
}
