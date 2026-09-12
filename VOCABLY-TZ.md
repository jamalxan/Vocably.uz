# Vocably — Mock / Exam bo'limi auditi

**Sana:** 12.09.2026
**Tekshirilgan sahifalar:** `/app/mock`, `/app/oqish` → Practice Test 1, `/app/tinglash` → Practice Test 1, `/app/yozish` → Practice Test 1
**Usul:** brauzerda jonli test (DOM, localStorage, network, audio API, computed style tekshiruvi)

---

## 0. Qisqa xulosa

Imtihon "dvigateli" (split panel, taymer, heartbeat, javoblarni serverga saqlash, audio bir marta o'ynash) yaxshi qurilgan. Lekin **imtihonni haqiqiy IELTS deb hisoblab bo'lmaydi** — quyidagi 9 ta P0 muammo bor:

| # | Muammo | Ta'sir |
|---|--------|--------|
| 1 | Mock Listening bilan boshlanmaydi, to'g'ridan-to'g'ri Reading ochiladi | Tartib buzilgan |
| 2 | Mockda "Yakunlash" tugmasi umuman yo'q | Imtihonni tugatib bo'lmaydi |
| 3 | Practice'dagi "Yakunlash" AI tugmasi ostida / nav ichida yo'qoladi | Bosib bo'lmaydi |
| 4 | Matching Information dropdownlari bo'sh | Mockda 9 ta savol javobsiz qoladi |
| 5 | AI yordamchi + sidebar + bildirishnoma imtihon ichida ishlaydi | Imtihon halolligi buzilgan |
| 6 | Matn o'lchami (A- / A+) umuman ishlamaydi | Sozlama yolg'on |
| 7 | Highlight yaratib bo'lmaydi | IELTS'ning asosiy vositasi yo'q |
| 8 | Flag (savolni belgilash) yo'q, lekin Yordamda yozilgan | Yordam yolg'on ma'lumot beradi |
| 9 | Nav'da javob berilgan savol ajratilmaydi | Nazorat yo'q |

Qo'shimcha: Listening audio 8 daqiqa (haqiqiyda ~30), Reading passage'lar ~450 so'z (haqiqiyda 700–950).

---

## 1. P0 — Imtihonni buzadigan xatolar

### 1.1 Mock Listening bilan boshlanmaydi

Start kartasi to'g'ri yozadi:

```
Listening   30 daq · 40 savol
Reading     60 daq · 40 savol
Writing     60 daq · 2 task
Jami        2 soat 30 daqiqa
```

Lekin **"Imtihonni boshlash" bosilganda darhol Reading ochiladi** (The Development of Photography, taymer 60:00). Listening ovoz tekshirish ekrani ham, audio ham ko'rinmaydi.

**Nima kerak:**
- Attempt ichida `sections: [listening, reading, writing]` ketma-ketligi va `currentSectionIndex` state machine.
- Har bo'lim tugaganda (taymer 0 yoki Yakunlash) → keyingi bo'limga majburiy o'tish, orqaga qaytish yo'q (start kartada shunday yozilgan).
- Listening bo'limi boshlanishida ovoz tekshirish ekrani (practice'dagidek).
- Bo'limlar orasida "Section complete → next section starts in X" oraliq ekrani.

### 1.2 Mockda "Yakunlash" tugmasi yo'q

`/app/mock` ichidagi barcha `<button>` elementlari sanab chiqildi — `Yakunlash` yo'q:

```
Chiqish, Mavzuni tanlash, Bildirishnomalar, Sozlamalar, Yordam,
Taymerni yashirish, Savol 1…Savol 40, Oldingi savol, Keyingi savol,
AI yordamchini ochish (Ctrl+K)
```

Practice sahifalarida (`/app/oqish`, `/app/tinglash`, `/app/yozish`) `Yakunlash` bor. Ya'ni mock komponenti bu tugmani render qilmaydi.

### 1.3 "Yakunlash" tugmasi AI tugmasi ostida va nav ichida yo'qoladi

DOM tuzilishi:

```
<nav class="... overflow-x: auto">          ← gorizontal scroll konteyner
  PASSAGE 1 [1][2]…[13] PASSAGE 2 [14]…[26] PASSAGE 3 [27]…[40]
  <div class="flex items-center gap-1 flex-shrink-0">
     <button>Yakunlash</button>             ← SHU YERDA, scroll ichida
  </div>
</nav>
```

O'lchovlar:

- **Reading (oqish):** `Yakunlash` rect x = 422 (viewport eni 1150). `document.elementFromPoint(markaz)` → **"Savol 25"** qaytaradi. Ya'ni tugma savol raqamlari ostida qolgan, bosib bo'lmaydi. Skrinshotda nav ichida "24 **a** 25 **s** 26" ko'rinadi — bu "Yak**a**nl**s**h" harflarining raqamlar orasidan sizib chiqqani.
- **Listening / Writing:** rect x = 1025…1135, viewport eni 1150 → tugma aynan **AI yordamchi doirasi (FAB) ostida**. Writing'da ekranda "Yaku**(AI)**h" ko'rinadi.

**Nima kerak:**
- Nav'ni 3 zonaga bo'lish: `[Part yorliqlari + raqamlar — o'z overflow-x:auto konteynerida]` `[flex-1]` `[Review + Yakunlash — flex-shrink-0, scroll dan tashqarida]`.
- AI FAB'ni imtihon layoutida umuman render qilmaslik (1.5 ga qarang).
- Savol raqamlari 40 ta — `w-8 h-8` o'rniga `w-7 h-7`, `gap-0.5` qilinsa 1280px ekranga hammasi sig'adi (haqiqiy IELTS'da ham hammasi ko'rinadi).

### 1.4 Matching Information dropdownlari bo'sh — 9 savol javobsiz

`/app/mock`, Passage 1, Questions 1–5 va Passage 3, Questions 37–40:

```js
[...document.querySelectorAll('select')].map(s => [...s.options].map(o => o.value))
// [[""], [""], [""], [""], [""]]   ← faqat bo'sh placeholder
```

Savol matni: *"Reading Passage 1 has five paragraphs, A-E. Which paragraph contains the following information?"* — lekin dropdownda A, B, C, D, E yo'q. **Bu savollarga javob berishning imkoni yo'q.**

Taqqoslash uchun `/app/oqish` Practice Test 1, Questions 1–5 (Matching Headings) — u yerda to'g'ri:

```js
[["", "i","ii","iii","iv","v","vi","vii"], …]
```

**Sabab (ehtimoliy):** option ro'yxati savol guruhining `headings` massividan olinadi. `matching_headings` turida `headings` bor, `matching_information` turida yo'q → bo'sh ro'yxat.

**Nima kerak:** task type `matching_information` (va `matching_features`) bo'lganda option'lar passage paragraflari harflaridan generatsiya qilinsin (`A`…`F`), `headings` dan emas.

### 1.5 AI yordamchi va butun app shell imtihon ichida ishlaydi

Imtihon sahifasida topilganlar:

- `AI yordamchini ochish (Ctrl+K)` FAB — mock va uchala practice ekranida bor.
- Sahifa yuklanishida yuborilgan so'rovlar: `/api/words`, `/api/chat/me`, `/api/ai/sessions`, `/api/notifications?limit=15`.
- DOM'da sidebar linklari (`Bugun, Lug'at, Oqish, Tinglash, Gapirish, Yozish, Mock imtihon, Reyting, Do'stlar, Profil, Admin panel`) va ikkita `Chiqish` tugmasi.

Ya'ni imtihon oddiy app layout ustiga `fixed inset-0 z-40` qatlam sifatida qo'yilgan — ostidagi hamma narsa tirik.

**Nima kerak:**
- `/app/mock` va practice imtihonlari uchun alohida route group (`app/(exam)/…`) va o'z `layout.tsx` fayli — sidebar, AI FAB, chat, notification provider'larsiz.
- `Ctrl+K` global shortcut'ni imtihon paytida o'chirish.
- Agar layout'ni ajratish qiyin bo'lsa, minimum: `useExamMode()` konteksti va AI/chat/notifications komponentlarida `if (examMode) return null`.

### 1.6 Matn o'lchami (A- / A+) ishlamaydi

Sozlamalar oynasida qiymat 16px ↔ 22px o'zgaradi, `localStorage["exam.fontSize"]` yoziladi, tashqi wrapper'ga `style="font-size: 20px"` qo'yiladi. **Lekin matn zarracha o'zgarmaydi.**

Sabab — matn bloklari Tailwind'ning qat'iy klasslarida:

```html
<div class="space-y-4 text-[16px] leading-[1.75]" style="color: var(--exam-text)">
```

`text-[16px]` merosni bosib ketadi. Tekshiruv: sozlama 20px bo'lganda ham `getComputedStyle(passage).fontSize === "16px"`. Savol paneli ham `text-[13px]` da qotib qolgan.

**Nima kerak:**

```css
:root { --exam-fs: 16px; }
.exam-passage { font-size: var(--exam-fs); line-height: 1.75; }
.exam-question { font-size: calc(var(--exam-fs) * 0.95); }
```

va barcha `text-[16px]` / `text-[13px]` klasslarini imtihon matnlaridan olib tashlash.

Qo'shimcha: real IELTS'da A-/A+ emas, **3 ta aniq daraja** bor — Standard / Large / Extra large. Shunga o'tish tavsiya etiladi.

### 1.7 Highlight yaratib bo'lmaydi

Tekshiruv:

- Matn sichqoncha bilan tanlandi → hech qanday popover/toolbar chiqmadi.
- Tanlangan matn ustida o'ng tugma → menyu yo'q (na custom, na native).
- Ikki marta bosish → hech narsa.
- Tanlovdan keyin DOM'da yangi `[role=menu]`, `[role=tooltip]` yoki "Belgilash / Highlight / Eslatma" tugmasi paydo bo'lmaydi.

Ayni paytda **render qismi ishlaydi** — sahifada mavjud bitta highlight ko'rinib turibdi:

```html
<mark class="exam-highlight-mark" aria-label="Belgilangan matn — boshqarish uchun Enter bosing">
```

fon rangi `rgb(255, 233, 168)`, reload'dan keyin ham saqlanadi.

Ya'ni: **saqlash va ko'rsatish bor, yaratish oqimi yo'q.**

**Nima kerak (haqiqiy IELTS xatti-harakati):**
1. `mouseup` + `selectionchange` → tanlov bo'sh emas va passage konteyneri ichida bo'lsa → tanlov ustida kichik popover: **Highlight · Note · Clear**.
2. `contextmenu` hodisasi (`preventDefault`) → o'sha popover'ni ochish (IELTS'da aynan o'ng tugma ishlatiladi).
3. Mavjud `<mark>` ustiga bosilganda → **Remove highlight / Edit note**.
4. Saqlash: `{ passageId, startOffset, endOffset, note }` — DOM node emas, matn offseti bo'yicha (shrift o'lchami o'zgarganda ham joyida qoladi).
5. `Ctrl+Shift+H` klaviatura yorlig'i.

### 1.8 Flag (savolni belgilash) yo'q

Yordam oynasida yozilgan:

> **Belgilash (flag)** — Ikkilanayotgan savolni keyinroq qaytish uchun belgilab qo'yishingiz mumkin.

Lekin DOM'da birorta flag tugmasi, checkbox yoki `aria-label`da "belgilash" so'zi bor element yo'q. Faqat highlight `<mark>` topiladi.

**Nima kerak:** real IELTS'dagi kabi har savol yonida **"Review"** checkbox, va nav'dagi raqam ustida belgi (kichik uchburchak/flag). Yordam matni UI bilan mos bo'lishi shart.

### 1.9 Nav'da javob berilgan savol ajratilmaydi

Listening Test 1, savol 1 ga javob yozildi. Nav tugmalarining klassi:

```
q1 (javobli): relative w-8 h-8 … border transition-colors
q2 (javobsiz): relative w-8 h-8 … border transition-colors   ← bir xil
```

**Nima kerak:** javob berilgan raqam to'ldirilgan (filled) ko'rinishda, joriy savol ramkali, flag qo'yilgani belgili — uchala holat farqlansin.

---

## 2. P1 — IELTS'ga mos kelmaydigan joylar

### 2.1 Listening

**Audio juda qisqa — eng jiddiy kontent muammosi.**

| Test | Umumiy davomiylik | Savollar |
|------|-------------------|----------|
| Practice Test 1 | **8 daqiqa** | 40 |
| Practice Test 2 | 9 daqiqa | 40 |
| Practice Test 3 | 10 daqiqa | 40 |
| Practice Test 4 | 12 daqiqa | 40 |

Part 1 audio fayli: `vocably-practice-test-1-l1.wav` — **davomiyligi 100 soniya (1:41)**.
Haqiqiy IELTS: har Part ~5–7 daqiqa, jami **~30 daqiqa audio + 2 daqiqa tekshirish**. 40 savolga 8 daqiqa jismonan yetmaydi — 12 soniyada bir javob.

**Ovoz tekshirish ekrani haqiqiy imtihon audiosini o'ynatadi.** "Sinov ovozini eshitish" tugmasi aynan `vocably-practice-test-1-l1.wav` ni ishga tushiradi — nomzod imtihon boshlanmasdan Part 1 ni eshitib oladi. Alohida neytral test tovushi (5–10 soniyalik namuna) kerak.

**Format:** `.wav` — siqilmagan, og'ir. `.mp3` (128 kbps) yoki `.m4a` ga o'tkazish kerak, ayniqsa O'zbekistondagi mobil internet uchun.

**Yo'q bo'lgan IELTS elementlari:**
- "You will have 30 seconds to look at questions 1–10" tayyorgarlik pauzalari.
- Part'lar orasidagi pauza va "Now turn to Part 2".
- Oxirida 2 daqiqalik tekshirish vaqti.
- Oxirgi 10 / 5 / 2 daqiqa ogohlantirishi.

**To'g'ri ishlayotgani:** audio faqat bir marta o'ynaydi, seek qilib bo'lmaydi (progress bar faqat ko'rsatkich, `<audio controls=false>`, faqat volume slider bor), ovoz tekshirish ekrani bor, PART 1/2/3/4 bo'linishi to'g'ri.

### 2.2 Reading

**Passage uzunligi:**

| Passage | So'zlar | IELTS normasi |
|---------|---------|---------------|
| The Development of Photography | 450 | 700–950 |
| Migratory Birds | 419 | 700–950 |
| Behavioural Economics and Marketing | 459 | 700–950 |
| **Jami** | **1328** | **2150–2750** |

Matnlar ~2 barobar qisqa → skimming/scanning ko'nikmasi sinovdan o'tmaydi, savollar haqiqiydan ancha oson.

**Savol turlari kam va takrorlanadi.** Mockdagi hozirgi tarkib:

- P1: Matching Information (1–5), MCQ (6–8), Sentence completion (9–13)
- P2: YES/NO/NOT GIVEN (14–19), Note completion (20–26)
- P3: Summary completion (27–32), MCQ (33–36), Matching Information (37–40)

Matching Information ikki marta ishlatilgan. **Yo'q turlar:** Matching Headings, Matching Features, Matching Sentence Endings, Table / Flow-chart / Diagram completion, "Choose TWO letters", Short-answer questions.

**YES/NO/NOT GIVEN noto'g'ri ishlatilgan.** "Migratory Birds" — faktik matn, savol *"Do the following statements agree with the claims of the writer?"* deb boshlanadi. Faktik ma'lumot uchun **TRUE / FALSE / NOT GIVEN**, muallif fikri/da'vosi uchun YES / NO / NOT GIVEN.

**Ko'rsatma UI bilan mos emas.** *"Write the correct letter, A-E"* deb yozilgan, lekin javob dropdown orqali tanlanadi. Yoki matn "Choose the correct letter" bo'lsin, yoki input matn maydoni bo'lsin. Shuningdek **"NB You may use any letter more than once"** eslatmasi yo'q.

**Qiyinlik darajasi** Passage 1 → 3 tomon oshishi kerak; hozir uchalasi bir xil.

### 2.3 Writing

**To'g'ri:** Task 1 / Task 2 tab'lari, `Kesish / Nusxa / Qo'yish` tugmalari, so'z hisoblagich (`So'zlar: 0 (kamida 150)`), 60 daqiqa taymer, chap tomonda topshiriq — o'ngda javob maydoni. Bu real IELTS'ga juda yaqin.

**Tuzatish kerak:**
- Task 1 diagrammasi: y o'qi belgilari **0% / 48% / 96%** — g'alati qadam. IELTS'da 0–20–40–60–80–100 kabi butun qadamlar. O'q nomlari (`Age group`, `% of people`) yo'q.
- Task 2 uchun "Task 2 Task 1 dan ikki barobar ko'p ball oladi" eslatmasi yo'q.
- Task 1/Task 2 orasida alohida taymer yoki tavsiya yo'q (faqat statik matn).

### 2.4 Umumiy

**Interfeys tili aralash.** Savollar inglizcha, tugmalar o'zbekcha: `Kesish`, `Nusxa`, `Qo'yish`, `So'zlar`, `Savol 1`, `Tavsiya etilgan vaqt: 20 daqiqa`, `PASSAGE 1`. Haqiqiy IELTS to'liq inglizcha. Kamida imtihon chrome'i inglizcha bo'lsin (`Cut / Copy / Paste / Words / Question 1 / Part 1`), tushuntirish ekranlari o'zbekcha qolsin.

**Attempt boshqaruvi nomuvofiq.** Mockdan chiqib qayta kirilganda attempt tiklanadi (taymer davom etadi). Practice testdan chiqib qayta kirilganda **yangi attempt ochiladi** — oldingi javoblar yo'qoladi va ovoz tekshirish qaytadan so'raladi. Bitta xatti-harakat bo'lishi kerak: davom ettirish yoki "Yangi urinish / Davom ettirish" tanlovi.

**Test ro'yxatida holat ko'rinmaydi.** `/app/oqish`, `/app/tinglash`, `/app/yozish` — to'rtta bir xil karta. Tugallangan / davom etayotgan / olingan ball ko'rsatilmaydi.

**To'g'ri ishlayotgani:** javoblar serverga saqlanadi (`PATCH /api/exam/attempts/{id}/answers`), `heartbeat` bor, panel kengligini drag qilish (`exam.splitRatio`), yuqori kontrast, taymerni yashirish, passage va savol panellari alohida scroll qiladi.

---

## 3. Kuzatilgan, lekin tasdiqlanmagan

Listening savol 1 ga tez yozilganda qiymat aralashib ketdi: `"James"` → **`"JaJamesmes"`**. Sekin yozganda va keyingi urinishlarda takrorlanmadi. Ehtimol sahifa hydration paytida controlled input'ning caret pozitsiyasi reset bo'ladi (debounce'li saqlash `value` ni qayta o'rnatganda). `useEffect` ichida `setValue(serverValue)` chaqiriladigan joyni tekshirish kerak — faqat `document.activeElement !== input` bo'lganda yozilsin.

---

## 4. Tuzatish tartibi

**1-bosqich (bir kunda, imtihon ishlaydigan holatga keladi):**
1. AI FAB + sidebar + notifications ni imtihon layoutidan olib tashlash (1.5)
2. Yakunlash tugmasini nav scroll'idan chiqarib, o'ng zonaga qat'iy joylashtirish (1.3)
3. Mockga Yakunlash tugmasini qo'shish (1.2)
4. Matching Information option'larini paragraph harflaridan generatsiya qilish (1.4)
5. Font size'ni CSS o'zgaruvchisiga o'tkazish (1.6)

**2-bosqich (imtihon IELTS'ga o'xshaydi):**
6. Mock bo'lim tartibi: Listening → Reading → Writing state machine (1.1)
7. Highlight yaratish oqimi + Note (1.7)
8. Flag / Review checkbox + nav belgilari (1.8, 1.9)
9. Listening tayyorgarlik pauzalari va tekshirish vaqti (2.1)

**3-bosqich (kontent):**
10. Listening audiolarini qayta yozish — har Part 5–7 daqiqa, mp3 formatda
11. Reading passage'larni 700–950 so'zga uzaytirish
12. Yetishmayotgan savol turlarini qo'shish, TRUE/FALSE vs YES/NO ni to'g'rilash
13. Imtihon chrome'ini inglizchaga o'tkazish

---

## 5. Claude Code uchun prompt

> Vocably (Next.js + MongoDB) loyihasida IELTS imtihon moduli bor: `/app/mock`, `/app/oqish`, `/app/tinglash`, `/app/yozish`. Quyidagi xatoliklarni tuzat. Har bir band mustaqil commit bo'lsin.
>
> **1. Imtihon layoutini app shell'dan ajrat.** Hozir imtihon `fixed inset-0 z-40` qatlam sifatida oddiy app layout ustiga qo'yilgan: sidebar, `Chiqish`, AI FAB (`AI yordamchini ochish (Ctrl+K)`), bildirishnomalar DOM'da qoladi va sahifa `/api/words`, `/api/chat/me`, `/api/ai/sessions`, `/api/notifications` so'rovlarini yuboradi. Imtihon route'lari uchun alohida route group va layout yarat — hech qanday AI, chat, notification, sidebar render qilinmasin. `Ctrl+K` global handler imtihon paytida o'chirilsin.
>
> **2. Yakunlash tugmasini tuzat.** Hozir u savol raqamlari bilan bitta `overflow-x: auto` qiluvchi `<nav>` ichida. Reading'da 40 raqamdan keyin surilib ketadi va raqamlar ostida qoladi (`elementFromPoint` → "Savol 25"), Listening/Writing'da esa AI FAB ostida qoladi. Nav'ni uch zonaga bo'l: chapda Part yorliqlari + raqamlar (o'z scroll konteynerida), o'ngda `flex-shrink-0` action zona (Review + Yakunlash). Savol tugmalarini `w-7 h-7`, `gap-0.5` qilib 40 tasi bir qatorga sig'sin.
>
> **3. `/app/mock` ga Yakunlash tugmasini qo'sh** — practice sahifalaridagi bilan bir xil oqim (tasdiqlash modali → natija sahifasi).
>
> **4. Matching Information dropdownlarini to'g'rila.** `matching_information` va `matching_features` turidagi savollarda `<select>` bo'sh (`options = [""]`), chunki option'lar `headings` massividan olinadi. Bu turlarda option'lar passage paragraflari harflaridan (`A`…`F`) generatsiya qilinsin. Hozir mockda 1–5 va 37–40 savollarga javob berib bo'lmaydi.
>
> **5. Matn o'lchami sozlamasini ishlaydigan qil.** `exam.fontSize` localStorage'ga yoziladi va tashqi wrapper'ga inline `font-size` beriladi, lekin matn bloklari `text-[16px]` / `text-[13px]` Tailwind klasslarida qotib qolgan, shuning uchun meros o'tmaydi. `--exam-fs` CSS o'zgaruvchisiga o'tkaz, qat'iy `text-[Npx]` klasslarini imtihon matnlaridan olib tashla. A-/A+ o'rniga 3 daraja: Standard / Large / Extra large.
>
> **6. Highlight yaratish oqimini qo'sh.** `mark.exam-highlight-mark` render qismi va saqlash allaqachon ishlaydi, lekin yaratishning yo'li yo'q: matn tanlanganda hech narsa chiqmaydi, o'ng tugma menyusi yo'q. Passage konteynerida `mouseup` va `contextmenu` (preventDefault) hodisalarida tanlov ustida popover chiqsin: Highlight / Note / Clear. Mavjud `<mark>` ustiga bosilganda o'chirish/tahrirlash. Saqlash matn offseti bo'yicha (`passageId`, `startOffset`, `endOffset`, `note`), DOM node bo'yicha emas. `Ctrl+Shift+H` yorlig'i.
>
> **7. Flag (Review) funksiyasini qo'sh.** Yordam oynasida "Belgilash (flag)" tushuntirilgan, lekin UI'da yo'q. Har savol yonida "Review" checkbox, nav raqamida flag belgisi.
>
> **8. Nav'da savol holatini ko'rsat:** javob berilgan (to'ldirilgan), joriy (ramkali), flag qo'yilgan (belgili) — uchalasi vizual farqlansin. Hozir javobli va javobsiz savol klassi bir xil.
>
> **9. Mock bo'limlari tartibini tuzat.** Start kartasi "Listening → Reading → Writing" deydi, lekin "Imtihonni boshlash" darhol Reading'ni ochadi. Attempt ichida `sections` ketma-ketligi va `currentSectionIndex` state machine bo'lsin: Listening (ovoz tekshirish ekrani bilan, 30 daq) → Reading (60 daq) → Writing (60 daq), orqaga qaytish yo'q, bo'limlar orasida oraliq ekran.
>
> **10. Listening oqimiga IELTS pauzalarini qo'sh:** har Part oldidan "You will have 30 seconds to look at questions X–Y", Part'lar orasida pauza, oxirida 2 daqiqa tekshirish vaqti, oxirgi 10/5/2 daqiqa ogohlantirishi.
>
> **11. Ovoz tekshirish ekrani haqiqiy imtihon audiosini o'ynatmasin** — hozir `vocably-practice-test-1-l1.wav` (ya'ni Part 1) ishga tushadi. Alohida 5–10 soniyalik neytral namuna fayl ishlatilsin.
>
> **12. Attempt boshqaruvini bir xil qil:** practice testdan chiqib qayta kirilganda yangi attempt ochiladi va javoblar yo'qoladi, mockda esa attempt tiklanadi. Ikkalasida ham "Davom ettirish / Yangi urinish" tanlovi bo'lsin. Test ro'yxati kartalarida holat va oxirgi ball ko'rsatilsin.
>
> **13. Imtihon chrome'ini inglizchaga o'tkaz:** `Cut / Copy / Paste / Words / Question N / Part N / Passage N / Finish`. Tushuntirish va natija ekranlari o'zbekcha qolsin.
>
> **14. Controlled input caret bug'ini tekshir:** tez yozganda input qiymati aralashib ketishi kuzatildi (`"James"` → `"JaJamesmes"`). Debounce'li saqlashdan keyin `useEffect` ichida `value` qayta o'rnatilayotgan bo'lsa, faqat `document.activeElement !== input` bo'lganda yozilsin.

---

## 6. Kontent bo'yicha alohida vazifa

Bu kod emas, material masalasi:

- **Listening:** har Part uchun 5–7 daqiqalik audio (jami ~30 daqiqa), turli aksentlar (British, Australian, Canadian), tabiiy tezlik, `.mp3` 128 kbps. Hozirgi 100 soniyalik fayllar yaroqsiz.
- **Reading:** har passage 700–950 so'z, qiyinlik P1 → P3 oshsin, savol turlari takrorlanmasin.
- **Writing:** Task 1 diagrammalari to'g'ri o'q qadamlari va nomlari bilan qayta chizilsin.