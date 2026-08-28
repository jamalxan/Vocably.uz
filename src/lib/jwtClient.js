// Token payload'ini serverga so'rovsiz o'qiydi (faqat "kim menman" UI belgisi
// uchun — masalan xabar/reply muallifini solishtirish). Imzoni tekshirmaydi,
// shuning uchun xavfsizlik qarori uchun EMAS, faqat client-side ko'rinish uchun.
export function getJwtUserId(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch {
    return null;
  }
}
