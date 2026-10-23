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

// English copy for the visible FAQ when the landing is switched to EN. The JSON-LD in
// page.jsx keeps using the Uzbek FAQS above (primary audience / indexed language).
const priceEn = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm/month`;

const FAQS_EN = [
  {
    q: 'What is Vocably?',
    a: 'Vocably is an English and IELTS preparation platform built for Uzbek speakers. It brings together an SRS (spaced repetition) vocabulary notebook, 16 vocabulary practice modes and 14 games, Reading, Listening, Writing and Speaking practice in the real IELTS format, a timed mock exam and AI scoring for Writing and Speaking. The interface speaks Uzbek or English; the study materials are in English.',
  },
  {
    q: 'Is Vocably free?',
    a: `There is a permanent free plan: vocabulary, SRS review and core IELTS practice are open with limits. Full Reading/Listening, AI-scored Writing and Speaking, full mocks and higher AI limits come with the ${TIER_CONFIG.standard.label} (${priceEn(TIER_CONFIG.standard.priceMonthly)}) and ${TIER_CONFIG.premium.label} (${priceEn(TIER_CONFIG.premium.priceMonthly)}) plans. No credit card needed, and you can cancel any time.`,
  },
  {
    q: 'Can I try it without signing up?',
    a: 'Yes — on the /demo page you can try 10 words without creating an account.',
  },
  {
    q: 'How does the IELTS mock exam work?',
    a: "It's a full four-part test (Listening, Reading, Writing, Speaking) in the real computer-delivered IELTS interface: server-side timer, autosave and text highlighting. At the end you get an estimated band for each skill plus an overall band; wrong answers go to your Mistakes notebook and the words in them join your SRS queue.",
  },
  {
    q: 'Does it work on my phone?',
    a: 'Yes. Vocably is fully mobile-friendly and can be installed on your home screen as a PWA. Download your review queue in advance and you can practise offline too.',
  },
  {
    q: 'How will my vocabulary grow?',
    a: 'A science-based spaced repetition (SRS) system shows each word again right before you would forget it — so you remember more in less time. Words you learn then reappear in Reading passages, Listening dialogues and Speaking questions.',
  },
];

export const FAQS_BY_LOCALE = { uz: FAQS, en: FAQS_EN };
