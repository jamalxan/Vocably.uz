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
