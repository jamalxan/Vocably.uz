// Public IELTS guide pages (/ielts and /ielts/<slug>). Written for people
// searching in Uzbek ("IELTS Reading qanday tayyorlanish", "IELTS band
// hisoblash") and for AI answer engines, which quote pages that state facts
// plainly. Every fact here is standard IELTS format information; nothing is
// promised about scores. Rendered by src/app/ielts/[slug]/page.jsx.

export const IELTS_GUIDES = [
  {
    slug: 'reading',
    skill: 'Reading',
    title: "IELTS Reading: format, savol turlari va band 7+ strategiyasi",
    short: 'IELTS Reading',
    description:
      "IELTS Academic Reading — 60 daqiqa, 3 ta matn, 40 ta savol. Savol turlari, vaqtni taqsimlash, True/False/Not Given sirlari va onlayn mashq qilish.",
    facts: [
      ['Vaqt', '60 daqiqa (javoblarni ko‘chirish uchun qo‘shimcha vaqt yo‘q)'],
      ['Tuzilish', '3 ta passage, har biri ~700–900 so‘z'],
      ['Savollar', '40 ta, har biri 1 ball'],
      ['Band 7 uchun', 'taxminan 30/40 to‘g‘ri javob (Academic)'],
    ],
    body: `## IELTS Reading qanday tuzilgan?

Academic Reading'da 60 daqiqada 3 ta uzun matn o'qiysiz va jami **40 ta savolga** javob berasiz. Matnlar jurnal, kitob va ilmiy nashrlardan olinadi; har bir keyingi passage odatda qiyinroq bo'ladi. Kompyuterda topshiriladigan IELTS'da javoblarni ko'chirish uchun alohida vaqt berilmaydi — javobni darhol ekranga yozasiz.

## Savol turlari

- **Multiple choice** — bir yoki bir nechta to'g'ri variant.
- **True / False / Not Given** va **Yes / No / Not Given** — fikr matnda bormi, unga zidmi yoki umuman aytilmaganmi.
- **Matching headings** — har bir paragrafga sarlavha tanlash.
- **Matching information / features / sentence endings.**
- **Sentence, summary, note, table, flow-chart completion** — matndagi so'z bilan to'ldirish ("NO MORE THAN TWO WORDS" kabi cheklovga e'tibor bering).
- **Diagram label completion** va **short-answer questions.**

## Vaqtni qanday taqsimlash kerak?

1. Passage 1 — 17 daqiqa, Passage 2 — 20 daqiqa, Passage 3 — 23 daqiqa.
2. Avval savollarni ko'z yugurtirib o'qing, keyin matnni **skimming** (umumiy g'oya) bilan o'qing.
3. Javobni **scanning** bilan qidiring: raqamlar, nomlar, kalit so'zlarning sinonimlari.
4. Bitta savolga 2 daqiqadan ko'p vaqt ketsa — belgilab qo'ying va keyinga o'ting.

## True / False / Not Given'ni qanday farqlash mumkin?

**False** — matn aksini aytadi. **Not Given** — matnda bu haqda ma'lumot yo'q. Eng ko'p xato shu yerda: o'z bilimingizga emas, faqat matnga tayanib javob bering.

## Vocably'da Reading mashqi

Vocably'da Reading haqiqiy kompyuter imtihoni interfeysida ishlanadi: matn va savollar yonma-yon turadi, matnni **highlight** qilish mumkin, mashq rejimida taymer yo'q va har bir javob izohi bilan ko'rsatiladi. Timed test rejimi esa band ballni hisoblab beradi.`,
    faq: [
      ['IELTS Reading necha daqiqa?', '60 daqiqa. Kompyuterda topshirilganda javoblarni ko‘chirish uchun qo‘shimcha vaqt berilmaydi.'],
      ['Reading’da band 7 uchun nechta to‘g‘ri javob kerak?', 'Academic Reading’da odatda 40 tadan taxminan 30 ta to‘g‘ri javob band 7.0 ga teng. Aniq jadval har testda biroz farq qiladi.'],
      ['Not Given va False farqi nima?', 'False — matn gapga zid ma’lumot beradi. Not Given — matnda bu haqda umuman ma’lumot yo‘q.'],
    ],
  },
  {
    slug: 'listening',
    skill: 'Listening',
    title: "IELTS Listening: 4 ta part, savol turlari va xatolarsiz tinglash",
    short: 'IELTS Listening',
    description:
      "IELTS Listening — 4 ta part, 40 ta savol, audio faqat bir marta eshittiriladi. Har bir part nimadan iborat, imlo xatolari va band hisoblash.",
    facts: [
      ['Vaqt', '~30 daqiqa audio (+ kompyuterda 2 daqiqa tekshirish)'],
      ['Tuzilish', '4 ta part, har birida 10 ta savol'],
      ['Audio', 'faqat bir marta eshittiriladi'],
      ['Band 7 uchun', 'taxminan 30/40 to‘g‘ri javob'],
    ],
    body: `## IELTS Listening qanday tuzilgan?

Listening **4 ta part**dan iborat va jami **40 ta savol** bor. Audio **faqat bir marta** eshittiriladi, har bir part oldidan savollarni o'qib olish uchun qisqa vaqt beriladi.

- **Part 1** — kundalik suhbat (masalan, mehmonxona bron qilish). Ko'pincha forma to'ldirish.
- **Part 2** — bitta kishining kundalik mavzudagi nutqi (ekskursiya, e'lon).
- **Part 3** — ta'limga oid 2–4 kishilik suhbat (talabalar va o'qituvchi).
- **Part 4** — akademik ma'ruza, eng qiyin qism.

## Eng ko'p uchraydigan xatolar

1. **Imlo** — noto'g'ri yozilgan so'z noto'g'ri hisoblanadi. Ko'p so'raladigan so'zlarni (accommodation, Wednesday, necessary) yod oling.
2. **So'z cheklovi** — "ONE WORD AND/OR A NUMBER" bo'lsa, ikki so'z yozish xato.
3. **Distractor'lar** — so'zlovchi avval bir javobni aytib, keyin tuzatadi ("Tuesday... oh no, actually Thursday").
4. **Birlik/ko'plik** — "-s" qo'shimchasini tashlab ketmang.

## Qanday mashq qilish kerak?

Har bir part turini alohida mashq qiling, keyin to'liq testni vaqt bilan ishlang. Xato qilgan savolingizning audio parchasini qayta tinglab, nima uchun eshitmaganingizni aniqlang.

## Vocably'da Listening mashqi

Mashq rejimida audioni qayta tinglash va tezligini o'zgartirish mumkin, savol matnidagi kalit so'zlarni belgilab (highlight) olasiz. Timed test rejimida esa audio xuddi imtihondagidek bir marta eshittiriladi va band ball hisoblanadi.`,
    faq: [
      ['IELTS Listening’da audio necha marta eshittiriladi?', 'Faqat bir marta.'],
      ['Imlo xatosi uchun ball kesiladimi?', 'Ha. Noto‘g‘ri yozilgan javob noto‘g‘ri hisoblanadi.'],
      ['Listening’da band 7 uchun nechta to‘g‘ri javob kerak?', 'Odatda 40 tadan taxminan 30–31 ta to‘g‘ri javob band 7.0 ga teng.'],
    ],
  },
  {
    slug: 'writing',
    skill: 'Writing',
    title: "IELTS Writing Task 1 va Task 2: tuzilma, baholash mezonlari, band 7",
    short: 'IELTS Writing',
    description:
      "IELTS Academic Writing — 60 daqiqa, Task 1 (150+ so‘z) va Task 2 (250+ so‘z). 4 ta baholash mezoni, insho tuzilmasi va AI bilan tekshirish.",
    facts: [
      ['Vaqt', '60 daqiqa (Task 1 ~20, Task 2 ~40 daqiqa)'],
      ['Task 1', 'grafik/diagramma tavsifi, kamida 150 so‘z'],
      ['Task 2', 'insho, kamida 250 so‘z — ballning katta qismi'],
      ['Mezonlar', 'TA/TR, CC, LR, GRA — har biri 25%'],
    ],
    body: `## IELTS Writing qanday baholanadi?

Har bir task 4 ta mezon bo'yicha baholanadi, har biri teng (25%) hissaga ega:

- **Task Achievement / Task Response** — savolga to'liq javob berdingizmi.
- **Coherence and Cohesion** — fikrlar mantiqiy ketma-ketlikda va to'g'ri bog'langanmi.
- **Lexical Resource** — so'z boyligi, aniq va xilma-xil so'zlar.
- **Grammatical Range and Accuracy** — murakkab gaplar va xatolarsiz grammatika.

**Task 2 ballda Task 1 dan ko'proq og'irlikka ega**, shuning uchun unga ko'proq vaqt ajrating.

## Task 1 tuzilmasi (Academic)

1. **Introduction** — savolni o'z so'zlaringiz bilan qayta yozing.
2. **Overview** — eng muhim 2–3 tendensiya (usiz band 6 dan oshish qiyin).
3. **Body 1–2** — aniq raqamlar bilan taqqoslash.

## Task 2 tuzilmasi

1. **Introduction** — mavzu + aniq pozitsiyangiz.
2. **Body 1 va Body 2** — har birida bitta asosiy fikr, tushuntirish va misol.
3. **Conclusion** — pozitsiyani qisqa takrorlash, yangi fikr qo'shmang.

## Band 7 uchun eng muhim 3 narsa

- Savolning **barcha qismlariga** javob bering (ikkala tomonni muhokama qiling kabi talablar).
- Bir xil so'zni takrorlamang — sinonim va to'g'ri kollokatsiyalardan foydalaning.
- Murakkab gaplar yozing, lekin xatolar soni kam bo'lsin.

## Vocably'da Writing mashqi

Vocably Writing topshirig'ini tasodifiy beradi va AI inshoni 4 ta rasmiy mezon bo'yicha tekshirib, har biriga band va aniq tuzatishlar beradi.`,
    faq: [
      ['IELTS Writing Task 2 necha so‘z bo‘lishi kerak?', 'Kamida 250 so‘z. Undan kam yozilsa Task Response bo‘yicha ball kamayadi.'],
      ['Task 1 va Task 2 ga qancha vaqt ajratish kerak?', 'Tavsiya: Task 1 ga taxminan 20 daqiqa, Task 2 ga 40 daqiqa.'],
      ['Writing necha mezon bo‘yicha baholanadi?', '4 ta: Task Achievement/Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy.'],
    ],
  },
  {
    slug: 'speaking',
    skill: 'Speaking',
    title: "IELTS Speaking: Part 1, 2, 3 — savollar, cue card va baholash",
    short: 'IELTS Speaking',
    description:
      "IELTS Speaking — 11–14 daqiqa, 3 qism. Part 2 cue card uchun 1 daqiqa tayyorgarlik, fluency va pronunciation qanday baholanadi.",
    facts: [
      ['Vaqt', '11–14 daqiqa, imtihonchi bilan yuzma-yuz'],
      ['Part 1', 'o‘zingiz haqingizda savollar, 4–5 daqiqa'],
      ['Part 2', 'cue card: 1 daqiqa tayyorgarlik, 1–2 daqiqa gapirish'],
      ['Part 3', 'Part 2 mavzusida chuqurroq muhokama, 4–5 daqiqa'],
    ],
    body: `## IELTS Speaking qanday baholanadi?

To'rtta teng mezon: **Fluency and Coherence**, **Lexical Resource**, **Grammatical Range and Accuracy** va **Pronunciation**.

## Har bir part uchun maslahat

- **Part 1** — qisqa, lekin "yes/no" bilan cheklanmang: javob + sabab + misol (2–3 gap).
- **Part 2** — tayyorgarlik daqiqasida kalit so'zlarni yozing, cue card'dagi barcha bandlarni yoriting va 2 daqiqa to'xtamasdan gapiring.
- **Part 3** — fikringizni asoslang, taqqoslang, "It depends..." kabi iboralar bilan turli tomonlarni ko'rsating.

## Keng tarqalgan xatolar

1. Yodlangan javoblar — imtihonchi darhol sezadi va ball pasayadi.
2. Juda uzun pauzalar va "ee... mm..." ko'pligi (fluency).
3. So'zlarning noto'g'ri urg'usi (pronunciation) — masalan **pho**tograph va pho**to**graphy.

## Vocably'da Speaking mashqi

Savollar tasodifiy tushadi, javoblaringiz yozib olinadi va AI ularni 4 mezon bo'yicha baholab, fluency va talaffuz bo'yicha izoh beradi.`,
    faq: [
      ['IELTS Speaking necha daqiqa davom etadi?', '11–14 daqiqa, uch qismda.'],
      ['Part 2 ga qancha tayyorlanish vaqti beriladi?', '1 daqiqa. Keyin 1–2 daqiqa gapirasiz.'],
      ['Speaking’da talaffuz qancha ahamiyatga ega?', 'Pronunciation to‘rt mezondan biri — umumiy Speaking ballining 25%.'],
    ],
  },
  {
    slug: 'mock-test',
    skill: 'Mock',
    title: "IELTS Mock test onlayn: haqiqiy imtihon sharoitida band ballingizni biling",
    short: 'IELTS Mock test',
    description:
      "Onlayn IELTS mock test: Listening, Reading va Writing ketma-ket, haqiqiy vaqt va interfeysda. Har bo‘lim va umumiy band hisoblanadi.",
    facts: [
      ['Bo‘limlar', 'Listening → Reading → Writing (Speaking alohida)'],
      ['Vaqt', 'to‘liq mock ~2 soat 40 daqiqa'],
      ['Natija', 'har bo‘lim bandi va umumiy band'],
      ['Mini mock', 'qisqaroq matnlar bilan tezkor variant'],
    ],
    body: `## Mock test nima uchun kerak?

Mock test — haqiqiy imtihonning to'liq nusxasi: bir xil vaqt, bir xil ketma-ketlik va bir xil bosim. U sizga **hozirgi bandingizni** ko'rsatadi va qaysi bo'limga ko'proq vaqt ajratish kerakligini aniq aytadi.

## Mock'ni qachon topshirish kerak?

- Tayyorgarlik boshida — boshlang'ich darajani bilish uchun.
- Har 2–3 haftada — o'sishni kuzatish uchun.
- Imtihondan 1 hafta oldin — sharoitga ko'nikish uchun.

## Umumiy band qanday hisoblanadi?

To'rtta bo'lim bandining o'rtachasi olinib, eng yaqin 0.5 ga yaxlitlanadi: o'rtacha .25 bo'lsa .5 ga, .75 bo'lsa keyingi butun songa ko'tariladi. Masalan, 6.5 + 6.5 + 5.5 + 6.0 = 24.5 → 6.125 → **6.0**.

## Vocably mock testi

Vocably'da mock imtihon haqiqiy kompyuter IELTS interfeysida o'tadi: taymer, savollar paneli, matnni belgilash, bo'limlar orasida qaytib bo'lmaslik. Oxirida har bo'lim va umumiy band, xatolar tahlili ko'rsatiladi.`,
    faq: [
      ['Onlayn IELTS mock test qancha davom etadi?', 'To‘liq mock (Listening, Reading, Writing) taxminan 2 soat 40 daqiqa. Mini mock qisqaroq.'],
      ['IELTS umumiy band qanday yaxlitlanadi?', 'To‘rt bo‘lim o‘rtachasi eng yaqin 0.5 ga yaxlitlanadi: .25 → .5, .75 → keyingi butun son.'],
      ['Mock testni necha marta topshirish kerak?', 'Odatda har 2–3 haftada bir marta — o‘sishni kuzatish uchun yetarli.'],
    ],
  },
];

export function getIeltsGuide(slug) {
  return IELTS_GUIDES.find((g) => g.slug === slug) || null;
}
