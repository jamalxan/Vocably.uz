// Ba'zi klaviatura/lokal sozlamalarda o'zbekcha apostrof turlicha kiritiladi (', ', `, ʻ, ʼ) yoki
// umuman kiritilmaydi (masalan "togri" o'rniga "to'g'ri"). Javobni tekshirishda bu farq xato
// hisoblanmasligi kerak — foydalanuvchi apostrofni to'g'ri qo'ysa ham, tushirib qoldirsa ham to'g'ri.
const APOSTROPHE_LIKE = /['''`ʻʼ’‘]/g;

export function normalizeForCompare(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(APOSTROPHE_LIKE, '')
    .replace(/\s+/g, ' ');
}
