// So'rov IP manzili — rate limit kaliti uchun. Vercel `x-forwarded-for` ni o'zi o'rnatadi (mijoz yuborgan qiymat ustiga
// yozadi); boshqa joyda (o'z serveringiz) ishonchli proksi orqasida bo'lishi shart, aks holda sarlavhani soxtalashtirish mumkin.
// Birinchi (mijozga eng yaqin) manzil olinadi; formatni qat'iy tekshiramiz (kalitga ixtiyoriy matn tushmasin).
const IP_RE = /^[0-9a-fA-F:.]{3,45}$/;

/** @param {{ headers: { get(name: string): string | null } }} req @returns {string} */
export function clientIp(req) {
  const xff = req.headers.get('x-forwarded-for');
  const first = (xff ? xff.split(',')[0] : req.headers.get('x-real-ip') || '').trim();
  return IP_RE.test(first) ? first : 'unknown';
}
