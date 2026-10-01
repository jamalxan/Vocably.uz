# Takliflar: Vocably'ni yanada mukammal va "o'ziga o'rgatadigan" qilish

Audit va tuzatishlar tugagach tuzildi. Har taklifda: **nima**, **nega** (foydalanuvchi uchun real foyda), **mavjud qaysi qismga tayanadi**
(qayta ishlash ~ arzon), **taxminiy hajm** (S = kunlar, M = 1–2 hafta, L = 3+ hafta; bu taxmin, o'lchov emas) va **ta'sir** (⭐ 1–3).
Eng yuqorisi — "ekanligi isbotlangan" retention va to'lov konversiyasi tomoni.

## A. Darhol qiymat beradigan (arzon, mavjud API'ga tayanadi)

| # | Taklif | Nega | Mavjud asos | Hajm | Ta'sir |
|---|---|---|---|---|---|
| A1 | **AI hikoya va AI mashq ekranlari** | Vokabulyar kontekstda yodlanadi: "bugungi 8 so'zdan hikoya" va shaxsiy mashqlar. Backend tayyor, UI yo'q | `POST /api/vocabulary/story`, `/exercises`, `aiService.js` (Premium kvota) | S–M | ⭐⭐⭐ |
| A2 | **Xatolardan avtomatik "mini-dars"** | Xato qilingan so'z/savol turi bo'yicha 3 daqiqalik takrorlash — eng yuqori o'zlashtirish samarasi | `weakness.ts`, Xatolar daftari, zaif so'zlar | S | ⭐⭐⭐ |
| A3 | **Ulashiladigan natija kartasi** (Telegram/Instagram): "12 kunlik seriya, 240 so'z, Band 6.5 prognoz" | Organik o'sish; foydalanuvchi o'z yutug'ini ko'rsatadi | XP/streak/CEFR ma'lumotlari, OG-image | S | ⭐⭐ |
| A4 | **Imtihongacha qolgan kun + kunlik reja** | `examDate` allaqachon saqlanadi; "IELTS'ga 41 kun — kuniga 22 so'z" aniq maqsad beradi | profil `examDate`, `dailyPlan.ts` | S | ⭐⭐⭐ |
| A5 | **Haftalik hisobot** (Telegram/ilova): o'tgan hafta yutuqlari + keyingi hafta maqsadi | Qaytish sababi, ayniqsa uzilgan foydalanuvchilar uchun | `reminderService`, analytics | S | ⭐⭐ |
| A6 | **Streakni "qutqarish" bildirishnomasi** (kechqurun, seriya xavfda) | Seriya — eng kuchli odat omili; eslatma soati allaqachon foydalanuvchi mintaqasida | `reminders.ts` (`atRisk`) | S | ⭐⭐ |

## B. O'rta hajm, katta ta'sir

| # | Taklif | Nega | Mavjud asos | Hajm | Ta'sir |
|---|---|---|---|---|---|
| B1 | **Ruscha interfeys va ruscha tarjimalar** | O'zbekistonda katta auditoriya ruscha o'qiydi; ma'lumot modelida `translationRu` bor, interfeys faqat o'zbekcha | `VocabularyEntry.translationRu` | M | ⭐⭐⭐ |
| B2 | **Offline-first takrorlash (PWA)** | Metro/avtobusda internetsiz SRS — mashq chastotasini oshiradi; navbatni keshlab, javoblarni keyin yuborish | `answerQueue.js` (offlayn navbat bor), push SW | M | ⭐⭐⭐ |
| B3 | **1-ga-1 va haftalik "liga" musobaqalari** | Raqobat va ijtimoiy majburiyat; realtime server va reyting mavjud | `realtime-server`, XP ledger, reyting | M | ⭐⭐⭐ |
| B4 | **Talaffuz mashqi ("so'zni ayt")** | Speaking uchun lug'at: mikrofon → AI baho; hozir Speaking faqat imtihon rejimida | `speakingGrader.ts`, `generateJsonWithAudio` | M | ⭐⭐ |
| B5 | **Yozuvdan so'z tavsiyasi**: Writing javobidagi oddiy so'zlarni kuchliroq sinonim/kollokatsiyalar bilan almashtirish | IELTS Writing balli uchun leksik resurs eng muhim mezonlardan; vokabulyar → yozuv aloqasi (TZ §24) | writing grader, kutubxona | M | ⭐⭐⭐ |
| B6 | **Mavzu to'plamlari** (Environment, Technology, Health…) har biri: so'zlar + mini-matn + o'yinlar | Band 7+ uchun mavzu bo'yicha tayyorgarlik; kontent fabrikasi (AI → ko'rib chiqish) bor | content factory, kutubxona | M | ⭐⭐⭐ |
| B7 | **Yaxshilangan SRS (FSRS)** | Hozirgi interval jadvali oddiy; FSRS ~20–30% kamroq takrorlash bilan bir xil eslab qolish beradi (adabiyotdagi taxmin, sizning ma'lumotingizda o'lchash kerak) | `srs.js`, `ReviewEvent` tarixi (o'qitish ma'lumoti bor) | M–L | ⭐⭐ |
| B8 | **Referal dasturi** (do'stga havola → ikkalasiga 1 hafta Standard) | Past xarajatli o'sish kanali | tarif/obuna tizimi, Telegram | M | ⭐⭐ |

## C. Strategik (katta)

| # | Taklif | Nega | Mavjud asos | Hajm | Ta'sir |
|---|---|---|---|---|---|
| C1 | **O'qituvchi/maktab (B2B) paneli**: sinf analitikasi, deadline'li topshiriqlar, ota-ona/maktab hisobotlari, CSV orqali ommaviy taklif | Takroriy daromad, kanal orqali o'sish; markaz va repetitorlar uchun | `teacher/*`, classrooms, assignments | L | ⭐⭐⭐ |
| C2 | **IELTS band prognozi**: lug'at darajasi + mock natijalar + faollikdan "hozirgi taxminiy band" va yo'l xaritasi | Eng aniq motivatsiya ("Band 6.0 → 7.0 uchun 800 so'z kerak") | `estimateVocabularyCefr`, mock natijalari | M–L | ⭐⭐⭐ |
| C3 | **Yuqori sifatli audio (oldindan yaratilgan TTS)** 3000 asosiy so'z uchun, CDN'da | Hozir brauzer TTS — qurilmaga bog'liq, sifati past; audio maydoni modelda bor | `audioUk/audioUs`, S3 | M | ⭐⭐ |
| C4 | **Shaxsiylashtirilgan onboarding + diagnostika → "yo'l xaritasi"** | Birinchi 5 daqiqada qiymat: daraja, maqsad, kunlik reja, birinchi mashq | `DiagnosticCard`, CEFR path | M | ⭐⭐⭐ |

## D. Mahsulot sog'ligi (o'lchash va ishonchlilik)

- **Funnel va retention o'lchovi:** ro'yxatdan o'tish → birinchi o'yin (24 soat ichida) → 7-kun qaytish. Hozir `VocabEvent` bor, ko'rinish yo'q — `admin/vocab` analitikasini funnel/kogortaga kengaytirish (S–M, ⭐⭐⭐).
- **Xatolar monitoringi (Sentry yoki o'xshash) va Web Vitals:** hozir xatolar `console.error` va logda; foydalanuvchi sezmaguncha ko'rinmaydi (S, ⭐⭐⭐).
- **A/B test infratuzilmasi** (flag + tasodifiy guruh): eslatma matni, onboarding, narx sahifasi uchun (M, ⭐⭐).
- **Zaxira va tiklash mashqi:** MongoDB snapshot jadvali va bir marta tiklash sinovi (S, ⭐⭐⭐ — ayniqsa so'zlarni alohida kolleksiyaga ko'chirishdan oldin).

## Tavsiya etilgan tartib (birinchi 6 hafta)

1. **A4 + A6 + A2** (hafta 1–2): maqsad (imtihon sanasi), seriyani saqlash va xatolardan dars — kichik ishlar, retentionga to'g'ridan-to'g'ri ta'sir.
2. **A1** (hafta 2–3): tayyor AI backend'ga UI.
3. **D (monitoring + funnel)** (hafta 3): qaysi taklif ishlayotganini bilish uchun.
4. **B1 (ruscha)** yoki **B2 (offline)** (hafta 4–6): auditoriyani kengaytirish yoki mashq chastotasini oshirish — foydalanuvchi so'rovlariga qarab tanlang.

> Eslatma: yuqoridagi "ta'sir" baholari tajribaga asoslangan taxmin; haqiqiy ta'sirni D bandidagi o'lchovlar ko'rsatadi. Har bir taklifdan oldin
> kichik tajriba (A/B yoki 10% foydalanuvchiga flag bilan) o'tkazish tavsiya etiladi.
