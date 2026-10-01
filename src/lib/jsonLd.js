// U+2028/2029 literal belgi sifatida emas, kod nuqtasi orqali (manba faylda satr ajratuvchi paydo bo'lmasin).
const LS = new RegExp(String.fromCharCode(0x2028), 'g');
const PS = new RegExp(String.fromCharCode(0x2029), 'g');

/**
 * JSON-LD ni `<script type="application/ld+json">` ichiga xavfsiz yozish uchun. `JSON.stringify` `<`, `>`, `&` ni ekranlamaydi:
 * qiymatda `</script><script>…` bo'lsa, skript blokidan chiqib XSS bo'ladi (CSP'da 'unsafe-inline' ruxsat etilgan).
 * Hozirgi ma'lumot statik, lekin kelajakda DB/URL'dan kelgan qiymat qo'shilsa ham xavfsiz bo'lishi uchun doim shu ishlatiladi.
 * U+2028/2029 ham ekranlanadi (eski JS parserlarida satr ajratuvchi).
 * @param {unknown} data
 * @returns {string}
 */
export function serializeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LS, '\\u2028')
    .replace(PS, '\\u2029');
}
