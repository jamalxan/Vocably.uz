// /demo sahifasi uchun — ro'yxatdan o'tmasdan sinab ko'rish (VOCABLY-TZ.md §3.1 IA).
// Qasddan STATIK: bu foydalanuvchi ma'lumotlariga aloqasi yo'q, faqat mahsulotni
// tanishtirish uchun 10 ta qo'lda tanlangan so'z — src/lib/models.js'dagi WordSchema
// bilan bir xil shakl (word/syns/pronunciation/enrichment), shuning uchun
// FlashcardMode/TestMode kabi haqiqiy rejim komponentlarining UI qismlari
// (kartochka old/orqa tarafi) shu ma'lumot bilan ham to'g'ri render bo'ladi.
export const DEMO_WORDS = [
  {
    _id: 'demo-1',
    word: 'resilient',
    syns: ['bardoshli', 'chidamli'],
    pronunciation: '/rɪˈzɪliənt/',
    enrichment: {
      cefr: 'B2',
      definitionEn: 'able to recover quickly from difficult conditions',
      examples: [{ en: 'Children are remarkably resilient.', uz: 'Bolalar hayratlanarli darajada bardoshli.' }],
    },
  },
  {
    _id: 'demo-2',
    word: 'mitigate',
    syns: ['yumshatmoq', 'kamaytirmoq'],
    pronunciation: '/ˈmɪtɪɡeɪt/',
    enrichment: {
      cefr: 'C1',
      definitionEn: 'to make something less severe, serious, or painful',
      examples: [{ en: 'The new policy aims to mitigate the effects of climate change.', uz: 'Yangi siyosat iqlim o\'zgarishi ta\'sirini yumshatishga qaratilgan.' }],
    },
  },
  {
    _id: 'demo-3',
    word: 'unprecedented',
    syns: ['misli ko\'rilmagan', 'tengsiz'],
    pronunciation: '/ʌnˈpresɪdentɪd/',
    enrichment: {
      cefr: 'C1',
      definitionEn: 'never having happened or existed before',
      examples: [{ en: 'The city faced unprecedented levels of rainfall.', uz: 'Shahar misli ko\'rilmagan darajadagi yomg\'irga duch keldi.' }],
    },
  },
  {
    _id: 'demo-4',
    word: 'arise',
    syns: ['paydo bo\'lmoq', 'yuzaga kelmoq'],
    pronunciation: '/əˈraɪz/',
    enrichment: {
      cefr: 'B1',
      definitionEn: 'to begin to happen or come into existence',
      examples: [{ en: 'A problem arose during the meeting.', uz: 'Yig\'ilish davomida muammo yuzaga keldi.' }],
    },
  },
  {
    _id: 'demo-5',
    word: 'thorough',
    syns: ['puxta', 'atroflicha'],
    pronunciation: '/ˈθʌrə/',
    enrichment: {
      cefr: 'B2',
      definitionEn: 'complete, with great attention to every detail',
      examples: [{ en: 'She did a thorough review of the report.', uz: 'U hisobotni puxta ko\'rib chiqdi.' }],
    },
  },
  {
    _id: 'demo-6',
    word: 'ambiguous',
    syns: ['noaniq', 'ikki ma\'noli'],
    pronunciation: '/æmˈbɪɡjuəs/',
    enrichment: {
      cefr: 'C1',
      definitionEn: 'having more than one possible meaning; unclear',
      examples: [{ en: 'His answer was deliberately ambiguous.', uz: 'Uning javobi ataylab noaniq edi.' }],
    },
  },
  {
    _id: 'demo-7',
    word: 'commence',
    syns: ['boshlamoq'],
    pronunciation: '/kəˈmens/',
    enrichment: {
      cefr: 'B2',
      definitionEn: 'to begin; to start',
      examples: [{ en: 'The ceremony will commence at noon.', uz: 'Marosim tush payti boshlanadi.' }],
    },
  },
  {
    _id: 'demo-8',
    word: 'inevitable',
    syns: ['muqarrar', 'oldini olib bo\'lmas'],
    pronunciation: '/ɪnˈevɪtəbl/',
    enrichment: {
      cefr: 'C1',
      definitionEn: 'certain to happen; unavoidable',
      examples: [{ en: 'Change was inevitable in such a fast-growing company.', uz: 'Bunday tez o\'sayotgan kompaniyada o\'zgarish muqarrar edi.' }],
    },
  },
  {
    _id: 'demo-9',
    word: 'compelling',
    syns: ['ishonarli', 'jozibali'],
    pronunciation: '/kəmˈpelɪŋ/',
    enrichment: {
      cefr: 'C1',
      definitionEn: 'evoking interest or attention in a powerfully irresistible way',
      examples: [{ en: 'She gave a compelling argument for the new plan.', uz: 'U yangi reja uchun ishonarli dalil keltirdi.' }],
    },
  },
  {
    _id: 'demo-10',
    word: 'diligent',
    syns: ['tirishqoq', 'mehnatkash'],
    pronunciation: '/ˈdɪlɪdʒənt/',
    enrichment: {
      cefr: 'B2',
      definitionEn: 'showing care and effort in your work or duties',
      examples: [{ en: 'He is a diligent student who never misses a class.', uz: 'U hech qachon darsni qoldirmaydigan tirishqoq talaba.' }],
    },
  },
];
