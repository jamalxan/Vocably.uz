// VOCABLY-TZ.md §17.3 (SEO) — "Blog: haftada 1 maqola (AI yordamida, admin
// tahriri bilan)". To'liq avtomatik AI-generatsiya quvuri (admin tasdiq oqimi
// bilan) FAZA5'dagi admin CMS'ga bog'liq — hali qurilmagan (izoh:
// src/app/api/admin/learning-analytics/route.js). Shu bosqichda ROUTING+RENDERING
// infratuzilmasini (statik generatsiya, metadata, ichki havolalar) qurish va uni
// qo'lda yozilgan, chindan foydali 3 ta maqola bilan sinash maqsadga muvofiq —
// kelgusida admin CMS qo'shilganda, shu massiv o'rniga DB so'rovi qo'yiladi,
// sahifa komponentlarining o'zi o'zgarmaydi.
export const BLOG_POSTS = [
  {
    slug: 'ielts-ga-3-oyda-tayyorlanish-rejasi',
    title: "IELTS'ga 3 oyda tayyorlanish: haftama-hafta reja",
    excerpt: "Imtihonga 3 oy qoldimi? Mana boshlang'ich darajani aniqlashdan tortib oxirgi mock testgacha bo'lgan aniq, haftalik reja.",
    date: '2026-09-22',
    readMinutes: 7,
    content: `3 oy — bir bandga ko'tarilish uchun real muddat, agar har kuni **1–1,5 soat** muntazam shug'ullansangiz. Asosiy qoida: tasodifiy mashq emas, **zaif joyga yo'naltirilgan** mashq.

## 1-hafta: boshlang'ich nuqta

- To'liq mock test topshiring (Listening, Reading, Writing) va Speaking'ni yozib oling.
- Har bo'lim bandini yozib qo'ying — bu sizning "0-nuqta"ngiz.
- Maqsad bandni belgilang va farqni hisoblang: qaysi bo'lim eng ko'p ball "yo'qotyapti"?

## 2–5-haftalar: asos

- **Har kuni 20–30 ta yangi so'z** — SRS (oraliqli takrorlash) bilan. Akademik so'zlar ro'yxatidan boshlang.
- **Reading**: har kuni 1 ta passage, savol turlari bo'yicha (bir hafta — True/False/Not Given, keyingisi — matching headings).
- **Listening**: har kuni 1 ta part; xato qilgan joyni transkript bilan qayta tinglang.
- **Writing**: haftasiga 2 ta Task 2 va 1 ta Task 1. Har birini 4 mezon bo'yicha tahlil qildiring.
- **Speaking**: har kuni 10 daqiqa — Part 1 savollariga ovoz chiqarib javob, haftada bir marta Part 2 yozib olib tinglash.

## 6–9-haftalar: tezlik va aniqlik

- Reading va Listening'ni **vaqt bilan** ishlang.
- Xatolar daftarini yuriting: har xato — sababi (so'z bilmadim / vaqt yetmadi / savolni noto'g'ri tushundim).
- Writing'da avvalgi xatolaringiz qaytarilmayotganini tekshiring.

## 10–12-haftalar: imtihon rejimi

- Haftasiga 1–2 ta to'liq mock test.
- Imtihon kuni tartibiga ko'niking: bir o'tirishda Listening → Reading → Writing.
- Oxirgi hafta yangi narsa o'rganmang — faqat takrorlash va dam olish.

---

**Maslahat:** Vocably'da imtihon sanasi va maqsad bandni profilga kiritsangiz, bosh sahifada har kungi mashq rejasi va band bo'yicha taraqqiyot ko'rinib turadi.`,
  },
  {
    slug: 'ielts-reading-true-false-not-given',
    title: "IELTS Reading: True, False yoki Not Given — qanday qilib adashmaslik",
    excerpt: "Reading'dagi eng ko'p ball yo'qotiladigan savol turi. 4 qadamli usul va tipik tuzoqlar misollar bilan.",
    date: '2026-09-18',
    readMinutes: 5,
    content: `True/False/Not Given (TFNG) savollarida ko'pchilik **False** bilan **Not Given**ni chalkashtiradi. Farq oddiy, lekin qat'iy qo'llash kerak.

## Qoidalar

- **True** — matn aynan shu fikrni aytadi (boshqa so'zlar bilan).
- **False** — matn **aksini** aytadi.
- **Not Given** — matnda bu haqda **ma'lumot yo'q** (tasdiqlash ham, inkor ham qilib bo'lmaydi).

## 4 qadamli usul

1. Gapdagi **kalit so'zlarni** belgilang (ayniqsa ism, sana, raqamlar).
2. Matndan shu joyni **scanning** bilan toping — savollar matn tartibida keladi.
3. Gapdagi **"cheklovchi" so'zlarga** qarang: *all, only, never, always, most, some*. Ko'pincha javob shu so'zga bog'liq.
4. O'zingizga savol bering: "Matnga ko'ra bu gap **noto'g'ri** ekanini isbotlay olamanmi?" Olsangiz — False. Faqat "aytilmagan" bo'lsa — Not Given.

## Misol

Matn: *"The library was open to scholars and royal officials."*

- "The library was open to the general public." → **False** (faqat olimlar va amaldorlar — aksi).
- "The library was the largest in the world." → **Not Given** (hajm haqida gap yo'q).

## Tipik tuzoqlar

- O'z bilimingiz bilan javob berish — faqat matn hisobga olinadi.
- Matndagi so'z bilan savoldagi so'z bir xil bo'lsa ham, ma'no farq qilishi mumkin.
- *Some* va *all* farqi: "Some experts agree" ≠ "Experts agree".

Vocably'da Reading mashq rejimida har bir TFNG javobining izohi va matndagi dalil paragrafi ko'rsatiladi.`,
  },
  {
    slug: 'ielts-writing-task-2-tuzilmasi',
    title: "IELTS Writing Task 2: band 7 uchun 4 paragrafli tuzilma",
    excerpt: "Opinion, discussion, problem–solution — barcha insho turlari uchun ishlaydigan tuzilma va har paragrafda nima yozish kerakligi.",
    date: '2026-09-12',
    readMinutes: 6,
    content: `Task 2 — Writing bo'limining eng muhim qismi: u Task 1 dan ko'proq ball beradi. 40 daqiqada kamida **250 so'z** yozishingiz kerak.

## Rejalashtirish (5 daqiqa)

Savolni o'qing va aniqlang: bu **opinion** (fikringiz), **discussion** (ikki tomon), **problem–solution** yoki **advantages–disadvantages**mi? Savolning har bir qismiga javob berish shart — bittasini tashlab ketish Task Response ballini keskin tushiradi.

## 4 paragrafli tuzilma

**1. Introduction (2 gap)** — savolni o'z so'zlaringiz bilan qayta yozing va pozitsiyangizni aniq ayting.

**2. Body 1 (5–6 gap)** — birinchi asosiy fikr: mavzu gapi → tushuntirish → aniq misol → natija.

**3. Body 2 (5–6 gap)** — ikkinchi asosiy fikr xuddi shu tartibda.

**4. Conclusion (2 gap)** — pozitsiyani qisqa takrorlang. Yangi fikr qo'shmang.

## Band 7 ga olib boradigan detallar

- Har paragrafda **bitta** markaziy g'oya.
- Bog'lovchilarni tabiiy ishlating — har gap boshida "Moreover" emas.
- Aniq so'zlar: *"a significant rise in unemployment"* — *"a big problem"* o'rniga.
- Murakkab gaplar: nisbiy gaplar, shart gaplar, passive — lekin xatosiz.

## Tekshirish (3–5 daqiqa)

Artikllar (a/the), fe'l zamoni, birlik–ko'plik moslashuvi — eng ko'p uchraydigan xatolar shular.

Vocably AI inshoingizni 4 ta rasmiy mezon bo'yicha baholab, har paragraf uchun tuzatish beradi.`,
  },
  {
    slug: 'ielts-band-qanday-hisoblanadi',
    title: "IELTS band qanday hisoblanadi? Listening, Reading va umumiy ball",
    excerpt: "40 ta savoldan nechtasi band 6, 7 yoki 8 ga teng? Umumiy band qanday yaxlitlanadi? Jadval va misollar bilan.",
    date: '2026-09-05',
    readMinutes: 4,
    content: `IELTS natijasi 0 dan 9 gacha **band**larda beriladi — har bo'lim uchun alohida va umumiy (overall).

## Listening va Reading

Har bir to'g'ri javob — 1 ball, jami 40. Xom ball jadval orqali bandga o'giriladi. Taxminiy qiymatlar:

| To'g'ri javob (Listening) | Band |
|---|---|
| 39–40 | 9.0 |
| 35–36 | 8.0 |
| 30–31 | 7.0 |
| 23–25 | 6.0 |
| 16–17 | 5.0 |

Academic Reading'da band 7 uchun ham taxminan **30/40** kerak; General Training Reading'da esa ko'proq — taxminan **34/40**.

## Writing va Speaking

Bu bo'limlarni imtihonchi 4 ta mezon bo'yicha baholaydi (har biri 25%). Writing'da Task 2 Task 1 dan ko'proq og'irlikka ega.

## Umumiy (overall) band

To'rt bo'lim bandining o'rtachasi olinadi va eng yaqin 0.5 ga yaxlitlanadi:

- o'rtacha **6.25** → **6.5**
- o'rtacha **6.75** → **7.0**
- o'rtacha **6.125** → **6.0**

O'z natijangizni tez hisoblash uchun [IELTS band kalkulyatori](/ielts/band-kalkulyator)dan foydalaning.`,
  },
  {
    slug: 'sozlarni-unutmaslik-uchun-7-maslahat',
    title: "Ingliz tili so'zlarini unutmaslik uchun 7 amaliy maslahat",
    excerpt: "So'z yodladingiz, lekin bir hafta o'tib eslay olmayapsizmi? Muammo xotirangizda emas — usulingizda. Mana ilmiy asoslangan 7 ta maslahat.",
    date: '2026-08-15',
    readMinutes: 6,
    content: `Ko'pchilik "1000 ta so'z yodladim" deb maqtanadi-yu, bir oy o'tib ulardan 100 tasini ham eslay olmaydi. Bu xotira yomonligidan emas — **noto'g'ri usuldan**. Mana tadqiqotlar tasdiqlagan 7 ta yondashuv.

## 1. Bir martalik "yodlash" ishlamaydi

1885-yilda nemis psixologi Hermann Ebbinghaus "unutish egri chizig'i"ni kashf etdi: yangi ma'lumotning 70% i bir kun ichida, 90% i bir hafta ichida yo'qoladi — agar takrorlanmasa. Yechim — **spaced repetition (oraliqli takrorlash)**: so'zni bugun, ertaga, 3 kundan keyin, 7 kundan keyin, 21 kundan keyin ko'rish. Har safar oraliq kengayadi, chunki xotira mustahkamlanadi.

## 2. Faqat tarjima emas, kontekst yodlang

"Arise = paydo bo'lmoq" deb yodlash zaif ishlaydi. Buning o'rniga jumla bilan yodlang: *"A problem arose during the meeting."* Miya so'zni izolyatsiyalangan holda emas, boshqa so'zlar bilan bog'liq holda saqlaydi — bu **kontekstli o'rganish** deyiladi va tadqiqotlarga ko'ra 2 barobar samaraliroq.

## 3. Faol eslash (active recall), passiv o'qish emas

Ro'yxatni qayta-qayta o'qish — passiv. Kartochkani ko'rmasdan javobni topishga harakat qilish — faol. Miya "izlash" jarayonida ishlaganda, aloqalar kuchliroq shakllanadi. Shu sabab flashcard (kartochka) usuli samarali: avval o'zingiz eslashga harakat qilasiz, keyin tekshirasiz.

## 4. So'zni darhol ishlating

Yangi so'zni o'rgangan kuningiz o'zingiz bitta jumla tuzing. Bu — **elaborative encoding** (kengaytirilgan kodlash): so'zni faqat "eshitgan" emas, "ishlatgan" bo'lasiz, bu esa xotirada chuqurroq iz qoldiradi.

## 5. Kunlik yangi so'z sonini cheklang

Kuniga 50 ta yangi so'z — ko'p tuyulsa ham, aslida samarasiz: miya bir kunlik "yangi ma'lumot sig'imiga" ega. 10-15 ta yangi so'z + oldingi so'zlarni takrorlash — barqaror o'sish uchun optimal balans.

## 6. Turli rejimlarda mashq qiling

Faqat kartochka bilan cheklanmang: test, yozish, tinglab yozish, juftlikni topish — har biri boshqacha "yo'l" orqali xotiraga yetib boradi. Bir xil so'zni turli shaklda uchratish — aloqalarni mustahkamlaydi.

## 7. Uyqu — yodlashning yashirin qismi

Uyqu paytida miya kunduzgi ma'lumotni "konsolidatsiya" qiladi — qisqa muddatli xotiradan uzoq muddatligiga o'tkazadi. Kechqurun yangi so'z o'rganib, darhol uxlash — ertalab o'sha so'zlarni eslab qolish ehtimolini oshiradi.

---

**Xulosa:** so'z yodlash — iroda emas, tizim masalasi. To'g'ri oraliqda, to'g'ri kontekstda, faol tarzda takrorlansa, har qanday so'z boyligi barqaror o'sadi.`,
  },
  {
    slug: 'spaced-repetition-fsrs-nima',
    title: "Spaced Repetition (SRS) nima va nega ishlaydi?",
    excerpt: "Vocably, Anki, Duolingo — hammasi 'spaced repetition' so'zini ishlatadi. Lekin bu aslida qanday algoritm va nega bunchalik samarali?",
    date: '2026-08-22',
    readMinutes: 5,
    content: `"Spaced repetition" (oraliqli takrorlash) — so'nggi 20 yilda til o'rganish ilovalarining asosiga aylangan usul. Lekin uning ortida nima yotibdi?

## Muammo: "unutish egri chizig'i"

Yangi ma'lumotni o'rganganingizdan keyin, uni **eksponensial tarzda unutasiz** — birinchi kunlarda tez, keyin sekinlashib boradi. Agar hech qachon takrorlamasangiz, bir oydan keyin deyarli hech narsa qolmaydi.

Lekin har safar takrorlaganingizda, unutish egri chizig'i **yassiroq** bo'ladi — ya'ni keyingi safar unutish sekinroq boradi. Bu shuni anglatadiki: so'zni to'g'ri vaqtda (unutish arafasida) takrorlasangiz, xotira eng samarali mustahkamlanadi.

## Algoritm nima qiladi

Zamonaviy SRS algoritmlari (masalan FSRS — Free Spaced Repetition Scheduler) har bir karta uchun uchta narsani hisoblaydi:

- **Retrievability (R)** — hozir shu so'zni eslay olish ehtimoli
- **Stability (S)** — bu ehtimol 90% dan qanchalik tez pasayadi (kunlarda)
- **Difficulty (D)** — so'zning sizga qanchalik qiyinligi

Siz "Bildim" yoki "Bilmadim" tugmasini bosganingizda, algoritm shu uchta qiymatni yangilaydi va **keyingi ko'rish vaqtini** hisoblaydi — juda oson so'zlar kamroq, qiyin so'zlar tez-tez ko'rsatiladi.

## Nega bu muhim

An'anaviy "hammasini har kuni qayta ko'rish" usuli — vaqtni behuda sarflaydi: allaqachon bilgan so'zingizni yana va yana ko'rasiz. SRS esa faqat **unutish arafasidagi** so'zlarni ko'rsatadi — natijada bir xil bilim darajasiga 25-30% kamroq vaqt bilan yetasiz.

## Amalda qanday ko'rinadi

1. Yangi so'zni o'rganasiz (kartochka, test yoki boshqa rejim orqali)
2. Baho berasiz: Bilmadim / Qiynaldim / Bildim / Juda oson
3. Algoritm keyingi ko'rish vaqtini hisoblaydi (masalan "Bildim" — 4 kundan keyin, "Bilmadim" — 10 daqiqadan keyin)
4. Vaqti kelganda so'z qayta chiqadi

Shu tsikl davomida stability oshib boradi — bir vaqtning o'zida so'z sizning **uzoq muddatli xotirangizga** o'tadi.

---

Vocably'da bu jarayon avtomatik — sizga faqat "Bugungi takrorlash" tugmasini bosish qoladi, qaysi so'zni qachon ko'rsatishni tizim o'zi hal qiladi.`,
  },
  {
    slug: 'ielts-speaking-band-7-uchun-5-xato',
    title: "IELTS Speaking'da band 7+ olish uchun oldini olish kerak bo'lgan 5 ta xato",
    excerpt: "Grammatikangiz yaxshi, lekin ball past chiqyaptimi? Ko'pincha sabab — lug'at yoki talaffuz emas, quyidagi 5 ta odat.",
    date: '2026-09-01',
    readMinutes: 7,
    content: `IELTS Speaking'da band 6.0 dan 7.0 ga chiqish — ko'pchilik uchun eng qiyin bosqich. Sabab odatda grammatika emas — quyidagi 5 ta odat.

## 1. Juda qisqa javob berish

"Do you like reading?" savoliga "Yes, I do" deb javob berish — band 5 dan oshmaydi. Baholovchi **Fluency & Coherence** mezoni bo'yicha fikringizni qanchalik kengaytira olishingizni ko'radi. Har javobga sabab + misol qo'shing: *"Yes, I really enjoy reading, especially non-fiction — for example, I recently finished a book about..."*

## 2. Bir xil so'zlarni takrorlash

"Good", "nice", "interesting" — bu so'zlar C1 darajasidagi lug'at emas. **Lexical Resource** mezoni sizdan sinonim va murakkab kolokatsiyalar ishlatishni kutadi: "good" o'rniga "beneficial", "advantageous", "rewarding" kabi so'zlarni tanlang — lekin tabiiy, o'rinli tarzda.

## 3. Uzun jimlik va "uhm"lar

Har gap orasida 3-4 soniyalik jimlik yoki "um... uh..." — ravonlikni pasaytiradi. Yechim: gapirishdan oldin fikrni to'liq shakllantirmang, boshlang va gapirish jarayonida davom ettiring — inglizlar buni "thinking out loud" deb ataydi. Bog'lovchilar ("well", "actually", "you know") tabiiy pauza o'rnini bosadi.

## 4. Faqat sodda gaplar tuzish

"I like coffee. I drink it every day." — grammatik jihatdan to'g'ri, lekin **Grammatical Range** past baholanadi. Murakkab gap tuzilmalarini qo'shing: bog'lovchi gaplar, shart mayli (agar... bo'lsa), nisbiy gaplar (which/who/that). Masalan: *"I drink coffee every day, which honestly helps me focus, especially when I have a lot of work."*

## 5. Savolga to'g'ridan-to'g'ri javob bermaslik

Ba'zan tayyorlagan "shablon" javobni gapirib, savolning o'ziga javob bermay qo'yasiz. Baholovchi buni darhol sezadi — **Task Response** past bo'ladi. Har doim avval savolni diqqat bilan tinglang, keyin aynan o'shanga javob bering, keyin kengaytiring.

---

**Amaliy maslahat:** har mashqdan keyin o'z javobingizni yozib oling (yoki AI yordamchidan tahlil so'rang) — qaysi mezon bo'yicha zaif ekaningizni bilish, tasodifiy mashq qilishdan ko'ra tezroq natija beradi.`,
  },
];

export function getBlogPost(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}
