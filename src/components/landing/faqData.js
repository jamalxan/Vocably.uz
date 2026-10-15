import { TIER_CONFIG } from '@/lib/entitlements';

// Shared by the visible FAQ section and the page's FAQPage JSON-LD, so the
// structured data always matches what's rendered. Prices come from the same
// config the pricing page uses — the answer can never contradict /pricing
// (it used to claim the product was "fully free" while Standard/Premium
// plans were on sale; search engines and AI assistants repeat such a claim).
// Qo'lda guruhlash — toLocaleString server (Node ICU) va brauzerda har xil ajratgich
// berib, hydration mismatch (React #418) chiqarardi.
const price = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm/oy`;

export const FAQS = [
  {
    q: 'Vocably nima?',
    a: "Vocably — o'zbek tilida so'zlashuvchilar uchun ingliz tili va IELTS tayyorgarlik platformasi. Unda SRS (intervalli takrorlash) lug'at daftari, 16 ta lug'at mashq rejimi va 14 ta o'yin, haqiqiy IELTS formatidagi Reading, Listening, Writing va Speaking mashqlari, taymerli mock imtihon hamda Writing/Speaking uchun AI baho bor. Interfeys o'zbekcha, o'quv materiallari inglizcha.",
  },
  {
    q: 'Vocably bepulmi?',
    a: `Bepul tarif doimiy: lug'at, SRS takrorlash va asosiy IELTS mashqlari cheklangan hajmda ochiq. To'liq Reading/Listening, AI baholi Writing va Speaking, to'liq mock va kengaytirilgan AI limitlari ${TIER_CONFIG.standard.label} (${price(TIER_CONFIG.standard.priceMonthly)}) va ${TIER_CONFIG.premium.label} (${price(TIER_CONFIG.premium.priceMonthly)}) tariflarida. Kredit karta shart emas, istalgan payt bekor qilinadi.`,
  },
  {
    q: "Ro'yxatdan o'tmasdan sinab ko'ra olamanmi?",
    a: "Ha — /demo sahifasida 10 ta so'zni ro'yxatdan o'tmasdan sinab ko'rishingiz mumkin.",
  },
  {
    q: 'IELTS mock imtihon qanday o\'tadi?',
    a: "To'rt bo'limli (Listening, Reading, Writing, Speaking) to'liq sinov haqiqiy IELTS kompyuter interfeysida: server taymeri, avtosaqlash, matnni belgilash. Yakunda har ko'nikma bo'yicha band va umumiy band taxmini chiqadi, xato javoblar Xatolar daftariga, ulardagi so'zlar esa SRS navbatiga tushadi.",
  },
  {
    q: 'Telefonda ishlaydimi?',
    a: "Ha, Vocably to'liq mobil-moslashuvchan va PWA sifatida telefon ekraniga o'rnatilishi mumkin. Takrorlash navbatini oldindan yuklab, internetsiz ham mashq qilish mumkin.",
  },
  {
    q: "So'z boyligim qanday oshadi?",
    a: "Ilmiy asoslangan takrorlash (SRS) tizimi har so'zni unutish arafasida qayta ko'rsatadi — natijada kamroq vaqt bilan ko'proq eslab qolasiz. O'rganilgan so'z keyin Reading matni, Listening dialogi va Speaking savolida qayta uchraydi.",
  },
];
