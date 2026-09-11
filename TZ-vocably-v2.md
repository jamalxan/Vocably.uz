# Vocably v2 — To'liq Texnik Topshiriq (TZ)

**Loyiha:** vocably.uz — o'zbek tilida so'zlashuvchilar uchun ingliz tili platformasi
**Stack:** Next.js (App Router, Vercel) + MongoDB + Tailwind (CSS o'zgaruvchi tokenlari)
**Hujjat maqsadi:** Claude Code uchun bitta to'liq ish rejasi — topilgan xatoliklar, IELTS CD (kompyuterda topshiriladigan) imtihon interfeysining aniq spetsifikatsiyasi, dizayn tizimini premium darajaga chiqarish.
**Audit sanasi:** 2026-09-10 (login qilingan holatda, Chrome, 1150×712 viewport, light + dark rejim)

---

## 0. Qisqacha xulosa (TL;DR)

Audit natijasida **31 ta muammo** topildi. Ulardan **8 tasi P0** (mahsulotni ishlatib bo'lmaydigan yoki ishonchni yo'qotadigan darajada).

Eng og'ir 5 ta:

| # | Muammo | Ta'sir |
|---|--------|--------|
| 1 | **Dark mode dizayn tokenlarining yarmi light qiymatida qolgan** — `--color-primary`, `--color-primary-hover`, `--color-primary-soft`, `--color-*-soft` (danger/success/warning/info) qora rejimda umuman o'zgarmaydi | Barcha sarlavhalar, katta raqamlar, AI javob matni qora fonda to'q bordo bo'lib **o'qilmaydi**; natija sahifasida oq-pushti bloklar "buzilgan sayt" taassurotini beradi |
| 2 | **Mock Listening'da audio fayl yo'q** — "(Audio fayl hali yuklanmagan)" | Mock imtihonning 1-bo'limini umuman yechib bo'lmaydi |
| 3 | **Writing Task 1'da grafik/diagramma yo'q**, lekin topshiriq "The chart below shows…" deydi | Task 1 ni yechish jismonan imkonsiz; AI baholash ham ma'nosiz |
| 4 | **AI'ning "Bu so'zni tushuntir" tugmasi lug'atdan so'z tanlashni taklif qilmaydi** — "so'zni yozib yuboring" deydi. AI foydalanuvchi lug'atini umuman ko'rmaydi | Va'da qilingan "so'zlaringiz bilan ishlaydigan AI" mavjud emas |
| 5 | **Reading/Listening/Mock haqiqiy IELTS strukturasidan juda uzoq** — 1 matn/5 savol vs 3 matn/40 savol; faqat MCQ va TFNG; qolgan 9 ta savol turi yo'q; CD interfeysining birorta asosiy elementi (savol paneli, review, highlight, notes, volume) yo'q | "Mock imtihon" deb ataladigan narsa mock emas |

---

# QISM A — TOPILGAN XATOLIKLAR REYESTRI

Har bir xato: `ID · Joy · Nima bo'lyapti · Nima bo'lishi kerak`.

## A1. Dizayn tokenlari va Dark mode (P0)

### BUG-001 · Dark rejimda `--color-primary` o'zgarmaydi (P0)
- **Joy:** global CSS token qatlami (`:root` / `@media (prefers-color-scheme: dark)` yoki `[data-theme]`)
- **Fakt (DOM'dan o'lchangan):**
  - Light: `--color-primary: 74 18 38` (#4A1226)
  - Dark: `--color-primary: 74 18 38` — **bir xil**
  - Dark fon: `--color-bg: 23 9 14` (#17090E)
- **Natija:** #4A1226 matn #17090E fonda — kontrast **1.31:1** (WCAG minimumi 4.5:1). Quyidagilar o'qilmaydi:
  - Dashboard: "Xush kelibsiz, Jamolxon", "5/20", "55", "160", statistika kartalaridagi katta raqamlar, "Rekord: 2 kun"
  - AI chat: "Assalomu alaykum, Jamolxon!" va **AI'ning butun javob matni**
  - Lug'at jadvali: `SO'Z` ustunidagi so'zlar (enjoy, entertain, play…) ko'rinmaydi
  - Grafik o'qlaridagi belgilar
- **Kerak:** dark rejim uchun alohida qiymat. Pastdagi §B2 jadvaliga qarang.

### BUG-002 · `--color-*-soft` tokenlari dark rejimda light qolgan (P0)
- **Fakt:** `--color-danger-soft: 249 228 225`, `--color-success-soft: 227 240 233`, `--color-warning-soft: 247 237 217`, `--color-info-soft: 227 237 243`, `--color-primary-soft: 243 216 226` — **light va dark'da bir xil**
- **Natija:** Mock natija sahifasida "Savol 1: noto'g'ri" qatorlari qora fonda **och pushti to'siq** bo'lib turadi; Gapirish sahifasidagi ogohlantirish bannerи och bej quti; `KUTILMOQDA` badge'lari oq. Sayt yarim buzilgan ko'rinadi.
- **Kerak:** har bir `*-soft` uchun dark variant (§B2).

### BUG-003 · Sirt ierarxiyasi dark'da ajralmaydi (P1)
- **Fakt:** `bg 23 9 14` / `bg-sunken 18 6 9` / `surface 33 15 22` — qo'shni qiymatlar orasida ΔL juda kichik; `border 58 34 43` ham ko'rinmaydi.
- **Natija:** foydalanuvchi aytgan muammo — "sidebar, karta va fon bir xil qora bo'lib qolgan", chat paneli sahifadan ajralmaydi.
- **Kerak:** har bir sirt darajasi orasida kamida **ΔL* ≈ 4–6** (§B2) + dark'da soya o'rniga `1px` yorug' border.

### BUG-004 · Mavzu (theme) boshlang'ich holati faqat tizimga bog'langan (P2)
- **Fakt:** `localStorage.vocably-theme` **faqat birinchi marta tugma bosilgandan keyin** paydo bo'ladi. Undan oldin `<html>`da na `class="dark"`, na `data-theme` bor — rejim `prefers-color-scheme` orqali aniqlanadi.
- **Natija:** kompyuteri qora rejimda bo'lgan foydalanuvchi saytni birinchi marta ochganda majburan buzilgan dark UI'ni ko'radi.
- **Kerak:** `<html data-theme="light|dark">` + SSR'gacha ishlaydigan blocking inline script (FOUC yo'q), uch holat: `light | dark | system`.

### BUG-005 · Brend bo'lmagan ranglar (P2)
- `--color-success: 46 125 91` (yashil), Do'stlar sahifasidagi online indikatori — Deep Merlot palitrasiga umuman yopishmaydi.
- **Kerak:** semantik ranglarni ham palitraga moslashtirish (§B2).

## A2. AI qatlami (P0/P1)

### BUG-006 · AI xatosi foydalanuvchiga xom ko'rinishda chiqadi (P0, xavfsizlik + UX)
- **Joy:** `/app/oqish` (va ehtimol barcha AI endpointlari)
- **Aynan ko'rilgan matn:**
  `AI bilan bog'lanib bo'lmadi: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent: [503 Service Unavailable] This model is currently experiencing high demand…`
- **Muammolar:** (a) infratuzilma oshkor bo'ladi — provayder, model nomi, endpoint; (b) matn inglizcha; (c) retry yo'q; (d) fallback model yo'q.
- **Kerak:** §D1.

### BUG-007 · "Bu so'zni tushuntir" — lug'atdan tanlash yo'q (P0, foydalanuvchi alohida ta'kidlagan)
- **Joy:** `/app/ai` va yon paneldagi AI chat, tez-tugmalar: `Bu so'zni tushuntir`, `Misol jumla ber`, `Mnemonika o'ylab top`, `Test tuz`
- **Hozir:** tugma bosilganda AI shunchaki javob yozadi: *"Qaysi so'zni tushuntirib berishimni xohlaysiz? Iltimos, o'sha so'zni yozib yuboring."*
- **Muammo:** foydalanuvchida allaqachon 3 ta kategoriya va 215 ta so'z bor, lekin AI ularni **umuman ko'rmaydi**. Qo'lda yozib berish kerak — bu funksiya mavjud emas degani.
- **Kerak:** §D2 — lug'at so'z tanlagich (word picker) + `@so'z` mention + AI'ga lug'at konteksti.

### BUG-008 · "Barchasini boyitish" juda sekin va progress ko'rsatmaydi (P1)
- **Fakt:** 30 ta so'z uchun ~20 soniyada atigi 2 ta so'z boyitildi (≈10 s/so'z, ketma-ket). To'liq 30 ta so'z ≈ **5 daqiqa**.
- Birinchi bosishda hech qanday vizual javob bo'lmadi (loading holati yo'q) — foydalanuvchi "ishlamayapti" deb o'ylaydi.
- **Kerak:** batching (bir so'rovda 10 so'z), parallel 3 ta so'rov, progress bar + ETA, "Fon rejimida davom ettirish", xatoda qayta urinish.

### BUG-009 · Mnemonika rejimida AI tugmasi yo'q (P2)
- Rejim "O'z eslab qolish usulingizni yozing" deydi, lekin AI mnemonika taklif qilmaydi — holbuki AI chatning tez-tugmasi aynan shu nomda.
- **Kerak:** har bir kartada `✨ AI variant taklif qilsin` tugmasi.

### BUG-010 · AI suhbatlarini boshqarib bo'lmaydi (P2)
- `/app/ai` yon panelida 13 ta suhbat bor; nomini o'zgartirish, o'chirish, pin qilish, qidiruv natijasi yo'q (qidiruv maydoni bor, lekin natija sifati tekshirilmagan). "salom" nomli 3 ta bir xil suhbat.
- **Kerak:** rename / delete / pin / arxiv + avtomatik sarlavha.

### BUG-011 · AI javobida markdown to'liq render qilinmaydi (P2)
- `---` (horizontal rule) chiziq bo'lib chiqadi, lekin ro'yxatlar, jadval, kod bloklari uchun uslub yo'q. AI test tuzganda savollar oddiy matn bo'lib chiqadi.
- **Kerak:** §D3 — AI javobidan interaktiv blok yasash (structured output).

## A3. IELTS bo'limlari (P0/P1)

### BUG-012 · Mock Listening'da audio yo'q (P0)
- Ekranda: *"(Audio fayl hali yuklanmagan — mashq uchun savollarni matn asosida yeching)"*
- Play tugmasi bor, lekin hech narsa qilmaydi. Bu bo'limni yechib bo'lmaydi.

### BUG-013 · Mock hajmi haqiqiy imtihonga umuman mos emas (P0)
| Bo'lim | Vocably'da | Haqiqiy IELTS |
|---|---|---|
| Listening | **4 savol**, 1 section, faqat MCQ | 40 savol, 4 part, 7 savol turi |
| Reading | **5 savol**, 1 passage (~300 so'z), faqat MCQ | 40 savol, 3 passage (2150–2750 so'z), 11 savol turi |
| Writing | Task 1 + Task 2 bir sahifada, grafik yo'q | Task 1 (grafik/diagramma bilan) + Task 2, alohida |
| Speaking | Yozib olinmaydi, faqat 3 ta savol matni | 3 part, 11–14 daq, Part 2 da 1 daq tayyorgarlik |

### BUG-014 · Writing Task 1'da vizual yo'q (P0)
- Topshiriq: *"The chart below shows the percentage of households in different income brackets…"* — **hech qanday chart yo'q**.
- Mock ichidagi Task 1 da ham xuddi shunday: *"The chart below shows the number of students who took the IELTS mock exam at EVEREST centers…"* — grafik yo'q. (Qo'shimcha: "EVEREST centers" — boshqa loyihaning nomi TZ'ga tushib qolgan.)

### BUG-015 · Band hisoblash noto'g'ri (P0)
- Natija sahifasi `UMUMIY BAND: 0` deb ko'rsatadi, holbuki Writing va Speaking hali baholanmagan.
- Listening `0/4`, Reading `0/5` — **xom ball band'ga konvertatsiya qilinmaydi**.
- **Kerak:** §C6 — rasmiy konvertatsiya jadvallari + baholanmagan bo'lim uchun `—` (0 emas).

### BUG-016 · Natijada to'g'ri javoblar va izoh ko'rsatilmaydi (P1)
- Faqat "Savol 1: noto'g'ri". To'g'ri javob nima ekani, nega, matnning qaysi joyidan — hech narsa yo'q.
- **Kerak:** har bir savol uchun: sizning javobingiz / to'g'ri javob / manba (passage'dagi jumla yoki audio timestamp) / AI izoh.

### BUG-017 · Mock paytida sayt navigatsiyasi ochiq qoladi (P1)
- Chap sidebar, bildirishnomalar, mavzu tugmasi, AI FAB — hammasi ishlaydi. Imtihon rejimi yo'q.
- **Kerak:** §C5 — exam shell (fullscreen, navigatsiya bloklangan, chiqish tasdiqlash bilan).

### BUG-018 · Listening TTS bilan ishlaydi (P1)
- `/app/tinglash`: *"AI qisqa matn tayyorlaydi, brauzer ovozda o'qib beradi"* — `SpeechSynthesis`.
- **Muammo:** robot ovozi, aksent yo'q, ko'p spiker yo'q, fon shovqini yo'q, brauzerga qarab ovoz o'zgaradi, telefonda ishlamasligi mumkin. IELTS Listening'ning yarmi — 2–4 kishilik dialog.
- **Kerak:** §C2 — server tomonda TTS (ko'p ovoz, aksent), audio faylni cache'lash.

### BUG-019 · Reading matni juda qisqa (P1)
- Yaratilgan matn ~160 so'z, 5 savol. IELTS'da passage 700–950 so'z, 13–14 savol.

### BUG-020 · CD interfeysining birorta asosiy elementi yo'q (P0)
Hozir yo'q: savol raqamlari paneli (40 ta), review/flag, highlight, notes, volume slayder, taymer ogohlantirishi (10/5 daq), font o'lchami sozlamasi, split-screen o'lcham o'zgartirgichi, avtosaqlash indikatori, "Answers" ko'rinishi. Batafsil §C.

### BUG-021 · "Cambridge IELTS 15 — Test 1" nomli mock (P1, huquqiy)
- Cambridge Assessment materiallari mualliflik huquqi bilan himoyalangan. Bunday nomdagi kontentni platformada tarqatish tavakkalchilik.
- **Kerak:** original kontent + generik nomlar (`Vocably Practice Test 01`).

### BUG-022 · Mock taymeri bo'lim navigatsiyasi bilan mos kelmaydi (P2)
- Listening `29:52`, Reading `59:55`, Writing `59:55`, Speaking `13:55`. Umumiy vaqt va bo'limlar ketma-ketligi backend'da (`/api/exam/.../section/start`) boshqarilyapti — bu to'g'ri, lekin: sahifa yangilansa taymer holati, "Keyingi bo'lim" bosilganda tasdiqlash oynasi yo'q (qaytib bo'lmaydi, lekin ogohlantirilmaydi).

## A4. Chat (Do'stlar) (P0/P1)

### BUG-023 · Chat konteyneri ekran balandligini to'ldirmaydi (P0)
- 712px balandlikdagi viewportda chat paneli ~400px'da tugaydi, ostida bo'sh fon. Light va dark rejimda ham.
- **Sabab (ehtimoliy):** `h-[calc(100vh-Xpx)]` o'rniga fixed/auto balandlik, yoki flex `min-h-0` yo'q.
- **Kerak:** `100dvh` asosidagi grid layout (§E1).

### BUG-024 · Suhbat ochilganda xabarlar yuklanmaydi (P0)
- Ro'yxatda "Yagonam · oke · 2kun" ko'rinadi, suhbat ochilganda **"Hali xabar yo'q. Birinchi xabarni yozing!"**. Ya'ni oxirgi xabar preview'i bor, tarix yo'q.
- **Kerak:** xabarlar tarixini pagination bilan yuklash + skeleton + xato holati.

### BUG-025 · Bir foydalanuvchi bilan ikkita suhbat (P1)
- Ro'yxatda `@nazarbek` ikki marta (7kun va 17kun). Duplicate conversation.
- **Kerak:** `conversationId = sorted([userA, userB]).join(':')` unique index + migratsiya.

### BUG-026 · Dark'da chat qora fonda qora (P0 — foydalanuvchi aynan shuni aytgan)
- Suhbatlar ro'yxati, xabarlar sohasi va sahifa foni — uchtasi ham deyarli bir xil `#17090E`. Ajratuvchi border ko'rinmaydi.
- **Kerak:** §B2 sirt darajalari + §E2 chat dizayni.

### BUG-027 · AI FAB chat input ustiga tushadi (P2)
- O'ng pastdagi ✨ tugma yuborish tugmasi bilan bir joyda.

## A5. Umumiy UX (P1/P2)

### BUG-028 · Bo'sh holatlar (empty states) zaif (P2)
- "Suhbatni tanlang", "Hali xabar yo'q" — faqat markazdagi kul rang matn. Illyustratsiya, tavsiya, CTA yo'q.

### BUG-029 · Loading holatlari yo'q yoki bir xil (P1)
- Sahifa yuklanishida faqat aylanuvchi spinner. Skeleton yo'q. AI generatsiyasi 15–20 soniya davom etadi, lekin foydalanuvchi nima bo'layotganini bilmaydi.

### BUG-030 · JWT `localStorage`da saqlanyapti (P1, xavfsizlik)
- `localStorage.token` + `localStorage.phone`. XSS bo'lsa token o'g'irlanadi.
- **Kerak:** `httpOnly; Secure; SameSite=Lax` cookie + CSRF himoya. Telefon raqamini localStorage'da saqlamaslik.

### BUG-031 · `/api/notifications?limit=15` juda tez-tez chaqirilyapti (P2)
- Audit davomida 424 ta network so'rovning katta qismi shu. Har sahifa o'tishida qayta chaqirilyapti.
- **Kerak:** SWR/React Query cache + `refetchInterval` 60 s + sahifa ko'rinmasa to'xtatish.

---

# QISM B — DIZAYN TIZIMI

## B1. Dizayn tamoyillari (majburiy)

Bu loyihada quyidagi tamoyillar **tekshiriladigan talab**, tavsiya emas:

1. **Vizual ierarxiya** — F-pattern emas. Har ekranda bitta aniq birlamchi harakat (primary action), qolgani ikkinchi darajali. Z-pattern yoki markazlashgan fokus.
2. **60-30-10 rang qoidasi** — 60% neytral fon/sirt, 30% ikkilamchi (bordo sirtlar, matn), 10% urg'u (accent `#B8394A` / dark'da `#E05A6D`). Hozir sayt deyarli **bir rangda** — bu 100-0-0.
3. **Tipografika ierarxiyasi** — H1/H2/H3/body/caption aniq farqlanadi (o'lcham + og'irlik + rang + line-height). Hozir H1 va katta raqamlar bir xil bordo.
4. **Konversiyaga yo'naltirilgan UX** — aniqlik, skanlanuvchanlik, motivatsiya. Har ekranda: "Hozir nima qilishim kerak?" savoliga 2 soniyada javob bo'lsin.
5. **Kontrast** — barcha matn WCAG AA (normal 4.5:1, katta 3:1). Har token juftligi CI'da tekshiriladi (§H3).

## B2. Rang tokenlari — to'liq jadval (ASOSIY TUZATISH)

Barcha qiymatlar `R G B` formatida (Tailwind `rgb(var(--token) / <alpha-value>)` uchun).

### Semantik rollarni ajratish (yangi)
Hozirgi muammoning ildizi: **`--color-primary` bir vaqtda ham to'ldirish (fill), ham matn rangi sifatida ishlatilyapti.** Ularni ajratamiz:

| Rol | Ma'nosi |
|---|---|
| `--color-brand` | Tugma/badge foni (fill) |
| `--color-on-brand` | Shu fon ustidagi matn |
| `--color-brand-text` | Brend rangidagi **matn** (sarlavha, katta raqam) — har rejimda kontrast-xavfsiz |
| `--color-accent` | Urg'u (10%) |
| `--color-text` / `--color-text-muted` / `--color-text-subtle` | Matn darajalari |
| `--color-bg` → `--color-surface-3` | Sirt darajalari (chuqurlik) |

### Light rejim

| Token | RGB | HEX | Izoh |
|---|---|---|---|
| `--color-bg` | `243 237 230` | #F3EDE6 | sahifa foni |
| `--color-bg-sunken` | `235 227 218` | #EBE3DA | ichkariga botgan zona |
| `--color-surface` | `250 246 242` | #FAF6F2 | karta |
| `--color-surface-2` | `255 255 255` | #FFFFFF | ko'tarilgan karta |
| `--color-surface-3` | `247 241 236` | #F7F1EC | hover |
| `--color-border` | `224 214 208` | #E0D6D0 | nozik chegara |
| `--color-border-strong` | `199 184 176` | #C7B8B0 | kuchli chegara |
| `--color-text` | `42 16 26` | #2A101A | asosiy matn |
| `--color-text-muted` | `107 91 84` | #6B5B54 | ikkinchi darajali |
| `--color-text-subtle` | `120 102 99` | #786663 | caption (4.66:1 ✓) |
| `--color-brand` | `74 18 38` | #4A1226 | tugma foni |
| `--color-brand-hover` | `85 21 44` | #55152C | |
| `--color-brand-text` | `74 18 38` | #4A1226 | sarlavha (12.85:1 ✓) |
| `--color-on-brand` | `250 246 242` | #FAF6F2 | |
| `--color-brand-soft` | `243 216 226` | #F3D8E2 | |
| `--color-accent` | `184 57 74` | #B8394A | |
| `--color-accent-hover` | `144 44 58` | #902C3A | |
| `--color-accent-soft` | `246 229 231` | #F6E5E7 | |
| `--color-success` | `31 106 76` | #1F6A4C | |
| `--color-success-soft` | `223 240 232` | #DFF0E8 | |
| `--color-warning` | `138 90 18` | #8A5A12 | (5.09:1 ✓) |
| `--color-warning-soft` | `250 240 219` | #FAF0DB | |
| `--color-danger` | `168 39 34` | #A82722 | |
| `--color-danger-soft` | `250 228 225` | #FAE4E1 | |
| `--color-info` | `43 92 122` | #2B5C7A | |
| `--color-info-soft` | `226 238 245` | #E2EEF5 | |

### Dark rejim (BUTUNLAY QAYTA YOZILADI)

| Token | RGB | HEX | Kontrast (bg #14090D ga) |
|---|---|---|---|
| `--color-bg` | `20 9 13` | #14090D | — |
| `--color-bg-sunken` | `13 5 8` | #0D0508 | — |
| `--color-surface` | `31 18 24` | #1F1218 | +1 daraja |
| `--color-surface-2` | `42 26 33` | #2A1A21 | +2 daraja |
| `--color-surface-3` | `54 34 41` | #362229 | hover/+3 |
| `--color-border` | `64 43 51` | #402B33 | ko'rinadigan nozik chegara |
| `--color-border-strong` | `87 58 68` | #573A44 | |
| `--color-text` | `245 233 236` | #F5E9EC | **16.5:1** ✓ |
| `--color-text-muted` | `191 168 175` | #BFA8AF | **8.8:1** ✓ |
| `--color-text-subtle` | `147 124 131` | #937C83 | **5.1:1** ✓ |
| `--color-brand` | `122 30 54` | #7A1E36 | tugma foni (fill) |
| `--color-brand-hover` | `148 38 66` | #942642 | |
| `--color-brand-text` | `240 168 184` | #F0A8B8 | **10.2:1** ✓ ← BUG-001 tuzatilishi |
| `--color-on-brand` | `255 245 248` | #FFF5F8 | |
| `--color-brand-soft` | `48 20 30` | #30141E | ← BUG-002 |
| `--color-accent` | `224 90 109` | #E05A6D | **5.5:1** ✓ |
| `--color-accent-hover` | `235 118 135` | #EB7687 | |
| `--color-accent-soft` | `46 17 25` | #2E1119 | accent matni 4.8:1 ✓ |
| `--color-success` | `95 196 155` | #5FC49B | **9.2:1** ✓ |
| `--color-success-soft` | `16 36 27` | #10241B | ← BUG-002 |
| `--color-warning` | `224 172 91` | #E0AC5B | **9.5:1** ✓ |
| `--color-warning-soft` | `42 31 13` | #2A1F0D | ← BUG-002 |
| `--color-danger` | `242 143 132` | #F28F84 | **8.4:1** ✓ |
| `--color-danger-soft` | `58 21 18` | #3A1512 | ← BUG-002 |
| `--color-info` | `127 182 218` | #7FB6DA | **8.9:1** ✓ |
| `--color-info-soft` | `15 31 42` | #0F1F2A | ← BUG-002 |

**SRS holat ranglari** (dark uchun ham qayta hisoblansin):

| Token | Light | Dark |
|---|---|---|
| `--color-srs-new` | `156 139 132` #9C8B84 | `176 158 151` #B09E97 |
| `--color-srs-learning` | `138 90 18` #8A5A12 | `224 172 91` #E0AC5B |
| `--color-srs-review` | `43 92 122` #2B5C7A | `127 182 218` #7FB6DA |
| `--color-srs-mastered` | `31 106 76` #1F6A4C | `95 196 155` #5FC49B |

### Kontrast tekshiruvi (hisoblangan, WCAG 2.1 relative luminance)

Quyidagi juftliklar allaqachon tekshirildi — tokenlar o'zgartirilsa, bu jadval qayta hisoblanishi shart (§H1 CI testi).

| Juftlik | Light | Dark |
|---|---|---|
| `text` / `bg` | 15.2:1 ✓ | 16.5:1 ✓ |
| `text-muted` / `bg` | 5.6:1 ✓ | 8.8:1 ✓ |
| `text-subtle` / `bg` | 4.7:1 ✓ | 5.1:1 ✓ |
| `brand-text` / `bg` | 12.9:1 ✓ | **10.2:1 ✓** (hozir: 1.31:1 ✗) |
| `accent` / `bg` | 4.9:1 ✓ | 5.5:1 ✓ |
| `on-brand` / `brand` | 13.9:1 ✓ | 9.5:1 ✓ |
| `success` / `success-soft` | 5.5:1 ✓ | 7.6:1 ✓ |
| `warning` / `warning-soft` | 5.2:1 ✓ | 7.9:1 ✓ |
| `danger` / `danger-soft` | 5.8:1 ✓ | 7.0:1 ✓ |
| `info` / `info-soft` | 6.1:1 ✓ | 7.7:1 ✓ |
| `brand-text` / `brand-soft` | 11.2:1 ✓ | 8.8:1 ✓ |
| `accent` / `accent-soft` | — | 4.8:1 ✓ |

**Sirt darajalari** kontrast bilan emas, **yorug'lik farqi** bilan o'lchanadi (qo'shni sirtlar orasidagi nisbat 1.08–1.12 — bu to'g'ri, chunki ular fon, matn emas). Ajralib turishi uchun **har sirtda 1px `border` majburiy** — dark rejimda soya ishlamaydi.

### Implementatsiya qoidalari
1. Tokenlar **faqat ikki joyda** e'lon qilinadi: `:root` (light) va `:root[data-theme="dark"]`. `@media (prefers-color-scheme: dark)` **faqat** `:root:not([data-theme="light"])` bilan cheklangan holda qo'shiladi, `data-theme="dark"` esa har doim ustun turadi.
2. Komponentlarda **hech qachon** hardcode HEX yozilmaydi. ESLint qoidasi: `.tsx`/`.css` ichida `#[0-9a-f]{3,8}` — xato.
3. `<html>`ga theme SSR'gacha inline script bilan qo'yiladi (FOUC yo'q):
   ```js
   (function(){try{var t=localStorage.getItem('vocably-theme')||'system';
   var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);
   document.documentElement.dataset.theme=d?'dark':'light';
   document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})()
   ```
4. Mavzu tugmasi uch holatli: **Yorug' / Tungi / Tizim** (dropdown, ikonka emas — hozir bosganda nima bo'layotgani tushunarsiz).

## B3. Tipografika

| Rol | O'lcham (desktop / mobil) | Weight | Line-height | Letter-spacing | Rang |
|---|---|---|---|---|---|
| Display | 56 / 36 px | 700 | 1.05 | -0.02em | `brand-text` |
| H1 | 36 / 28 | 700 | 1.15 | -0.015em | `brand-text` |
| H2 | 28 / 22 | 650 | 1.2 | -0.01em | `text` |
| H3 | 20 / 18 | 600 | 1.3 | 0 | `text` |
| Body | 16 / 16 | 400 | 1.65 | 0 | `text` |
| Body-sm | 14 | 400 | 1.6 | 0 | `text-muted` |
| Caption / label | 12 | 600 | 1.4 | 0.08em, UPPERCASE | `text-subtle` |
| Metric (raqam) | 40 / 32 | 700 | 1 | -0.02em | `brand-text` |

- **Sarlavha shrifti:** serif (hozirgi "Xush kelibsiz" shriftidan davom ettirilsin — premium his beradi). Tavsiya: *Fraunces* yoki *Instrument Serif* variable.
- **Matn shrifti:** *Inter* yoki *Geist* variable.
- **Ingliz kontenti** (IELTS matnlari, savollar) uchun alohida o'quv shrifti: `Literata` / `Source Serif 4`, 18px, 1.75 line-height, `max-width: 68ch` — bu Reading bo'limi uchun majburiy.
- O'zbekcha diakritik belgilar (`o'`, `g'`, `sh`, `ch`) shriftda to'g'ri render bo'lishi tekshirilsin (apostrof `ʻ` U+02BB ishlatilsin, `'` emas).

## B4. Fazo, radius, chuqurlik, harakat

- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px. Boshqa qiymat ishlatilmaydi.
- **Radius:** `sm 8` / `md 12` / `lg 16` / `xl 24` / `full`. Karta = `lg`, tugma = `md`, modal = `xl`.
- **Chuqurlik (light):** soya `0 1px 2px rgb(74 18 38 / .06), 0 8px 24px rgb(74 18 38 / .06)`.
- **Chuqurlik (dark):** soya deyarli ko'rinmaydi → **1px border + sirt darajasini oshirish** ishlatiladi. Qo'shimcha: `inset 0 1px 0 rgb(255 255 255 / .04)` (yuqori qirrada nozik yorug'lik) — bu premium his beradi.
- **Harakat:**
  - Standart: `180ms cubic-bezier(.2,.8,.2,1)`
  - Kirish/chiqish: `260ms`
  - Sahifa o'tishlari: `view-transition-api` (Next.js App Router)
  - Scroll-driven: dashboard statistikasi va landing bo'limlari uchun `animation-timeline: view()` (progressive enhancement)
  - `prefers-reduced-motion: reduce` — barcha animatsiya o'chadi (majburiy)

## B5. "Premium" darajaga chiqarish — aniq ishlar

Hozirgi UI **toza, lekin xarakteri yo'q** (generic Tailwind karta + tugma). Premium his quyidagilardan tug'iladi:

1. **Tekstura:** sahifa foniga juda nozik `noise`/`grain` overlay (SVG `feTurbulence`, opacity .02–.03). Deep Merlot palitrasida bu qog'oz effektini beradi.
2. **Gradient sirtlar:** karta foni tekis rang emas — `linear-gradient(160deg, surface, surface-2)` + yuqori qirrada 1px yorug'lik.
3. **Sidebar:** hozir tekis bordo. → yuqoridan pastga `#4A1226 → #2A0C18` gradient + o'ng qirrada 1px `accent/20` chiziq + aktiv element uchun yumshoq glow.
4. **Katta raqamlar (metrics):** tabular-nums, serif shrift, raqam o'zgarganda `count-up` animatsiya.
5. **Progress ring** (bugungi maqsad): hozir oddiy. → konusli gradient (`accent → brand`), yumaloq uchlar, orqa fonda nozik izi, to'lganda mikro-celebration.
6. **Ikonkalar:** bitta oila (Lucide, `stroke-width: 1.5`), o'lcham 20px, hech qachon aralashtirilmaydi. Emoji ikonka sifatida ishlatilmaydi (hozir `⚠️`, `🎤` bor).
7. **Mikro-interaksiyalar:** tugma `active:scale(.98)`, karta `hover: translateY(-2px)` + soya kuchayishi, javob tanlanganda 120ms `ripple`, to'g'ri javobda `spring` bounce.
8. **Skeleton yuklash** — spinner o'rniga. Har kartaning o'z shakli bilan.
9. **Bo'sh holatlar:** har biri uchun kichik chiziqli illyustratsiya (SVG, brend rangida) + bitta CTA.
10. **Focus ring:** `outline: 2px solid accent; outline-offset: 2px` — barcha interaktiv elementda, klaviatura bilan yurish mumkin.
11. **3D / maximalist urg'u** faqat **landing va natija ekranlarida** (dashboard'da emas — u ish qurolisi): landing hero'da scroll-driven parallaks, band natijasi e'lon qilinganda 3D medal/badge animatsiyasi.

## B6. Responsive

| Breakpoint | Kenglik | Layout |
|---|---|---|
| `xs` | < 480 | 1 ustun, pastki tab-bar (5 element), sidebar → drawer |
| `sm` | 480–767 | 1 ustun, kengroq padding |
| `md` | 768–1023 | 2 ustun, sidebar ikonka rejimida |
| `lg` | 1024–1439 | to'liq sidebar + kontent |
| `xl` | ≥ 1440 | kontent `max-width: 1280px`, markazlashgan |

Majburiy:
- Barcha teginish nishoni ≥ **44×44 px**.
- `100vh` ishlatilmaydi → `100dvh` (mobil brauzer paneli muammosi).
- Reading/Listening split-screen mobil'da **tab**ga aylanadi (`Matn | Savollar`), pastda sticky savol paneli.
- Writing mobil'da: topshiriq yig'iladigan (collapsible) blok + to'liq ekran matn maydoni.
- iOS'da input `font-size ≥ 16px` (avtomatik zoom bo'lmasligi uchun).
- Chat: `dvh` grid, klaviatura ochilganda input ko'rinib turadi (`visualViewport` API).

---

# QISM C — IELTS CD (KOMPYUTERDA) IMTIHON SPETSIFIKATSIYASI

Bu qism **haqiqiy IELTS on Computer** interfeysi va formatiga asoslangan. Manbalar hujjat oxirida.

## C0. Haqiqiy imtihon faktlari (asos)

| Bo'lim | Vaqt | Savol | Struktura |
|---|---|---|---|
| **Listening** | ~30 daq audio + **2 daq** tekshirish (CD'da javob ko'chirish vaqti YO'Q) | 40 | Part 1: kundalik mavzudagi 2 kishilik dialog · Part 2: kundalik mavzudagi monolog · Part 3: ta'lim/tayyorgarlik mavzusida 2–4 kishilik suhbat · Part 4: akademik monolog |
| **Reading (Academic)** | 60 daq (alohida ko'chirish vaqti yo'q) | 40 | 3 passage, jami 2150–2750 so'z, qiyinlik ortib boradi |
| **Writing** | 60 daq | 2 task | Task 1 ≥150 so'z (~20 daq) · Task 2 ≥250 so'z (~40 daq). Task 2 ballda **2 barobar** og'irroq |
| **Speaking** | 11–14 daq | 3 part | Part 1: 4–5 daq · Part 2: 1 daq tayyorgarlik + 1–2 daq gapirish · Part 3: 4–5 daq |

**Umumiy band:** 4 bo'lim o'rtachasi. Yaxlitlash: `.25 → yuqoriga .5 ga`, `.75 → yuqoriga butun songa`. Masalan L6.5 R6.5 W5.0 S7.0 → 6.25 → **6.5**.

**CD interfeysining universal elementlari** (hammasini qilish kerak):
- Ekranning **yuqori o'rtasida taymer**; 10 daqiqa va 5 daqiqa qolganda **qizarib miltillaydi**; bosilganda soniyalar ham ko'rinadi
- Yuqorida **Settings** — matn o'lchami, rang/kontrast rejimi
- Pastda **savol raqamlari paneli (1–40)**: javob berilgan savol ostida chiziq, `Review` belgilangan savol kvadratdan **doira**ga aylanadi
- **Review** (belgilab qo'yish) tugmasi + oldinga/orqaga strelkalar
- **Avtosaqlash** (foydalanuvchi hech narsa qilmaydi)
- Bo'limlar orasida qaytib bo'lmaydi
- `Ctrl+F` **o'chirilgan**; `Ctrl+C/V` **faqat Writing ichida** ishlaydi
- `Tab` / `Shift+Tab` — savollar bo'ylab yurish

## C1. Listening — talablar

### Layout (desktop)
```
┌─────────────────────────────────────────────────────────────┐
│  IELTS Listening        [⏱ 29:12]        [🔊 ▁▃▅▇] [Aa ⚙]   │  ← yuqori panel
├─────────────────────────────────────────────────────────────┤
│  Part 1  ·  Questions 1–10                                  │  ← ko'rsatma qutisi
│  Complete the form below. Write NO MORE THAN TWO WORDS      │
│  AND/OR A NUMBER for each answer.                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [savollar — form/table/map/MCQ, scroll]                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Part1 [1][2][3]…[10]  Part2 [11]…[20]  Part3 …  Part4 …     │  ← savol paneli
└─────────────────────────────────────────────────────────────┘
```

### Funksional talablar
- **F-L1.** Audio **bir marta** ijro etiladi, pauza/orqaga qaytarish **yo'q** (To'liq imtihon rejimida). Mashq rejimida: pauza, 10s orqaga, tezlik 0.75×–1.25×, transkript.
- **F-L2.** Ovoz balandligi slayderi yuqori o'ng burchakda; qiymat `localStorage`da saqlanadi.
- **F-L3.** Audio boshlanishidan oldin har part uchun **30 soniyalik ko'rish vaqti** (real imtihondagidek) — countdown bilan.
- **F-L4.** Audio tugagach **2 daqiqa** tekshirish vaqti, alohida countdown.
- **F-L5.** Audio uzilib qolsa (tarmoq) — pauza + "Ulanish tiklanmoqda" + o'sha joydan davom. Taymer to'xtatiladi.
- **F-L6.** Javob maydonlari audio davomida yozish uchun mo'ljallangan: `autocomplete=off`, `spellcheck=false`, avtomatik katta harf yo'q.
- **F-L7.** Savol paneli: javob berilgan = ostida chiziq; review = doira; joriy = to'ldirilgan.
- **F-L8.** Audio faylni **oldindan yuklash** (preload) — birinchi part boshlanishidan oldin butun fayl bufer qilinadi, aks holda boshlanmaydi.

### Savol turlari (7 ta — hammasi kerak)
| Tur | Komponent |
|---|---|
| Multiple choice (1 to'g'ri) | radio ro'yxat |
| Multiple choice (2–3 to'g'ri) | checkbox + "Choose TWO letters" cheklovi |
| Matching | drag-and-drop yoki dropdown |
| Plan / map / diagram labelling | rasm ustidagi nuqtalarga dropdown/drag |
| Form / note / table / flow-chart completion | inline `<input>` (jadval yoki forma ichida) |
| Sentence completion | inline input |
| Short-answer questions | inline input + so'z limiti hisoblagichi |

**So'z limiti validatsiyasi:** "NO MORE THAN TWO WORDS AND/OR A NUMBER" — input ostida real vaqtda `2/2 so'z` ko'rsatiladi, oshsa qizil. Baholashda limit oshsa javob noto'g'ri.

### Audio generatsiyasi (BUG-012, BUG-018 tuzatilishi)
- Server tomonda TTS: **ko'p ovoz** (kamida 6 ta profil: BrE ayol, BrE erkak, AmE ayol, AmE erkak, AusE, CanE), aksentlar aralashadi.
- Dialoglar uchun har spiker alohida ovoz bilan sintez qilinadi, keyin `ffmpeg` bilan birlashtiriladi (spikerlar orasida 300–500 ms pauza).
- Part boshlanishida rasmiy ohangdagi kirish: *"Section 1. You will hear a conversation between…"*
- Yaratilgan audio **S3/R2'ga saqlanadi va qayta ishlatiladi** (har safar generatsiya qilinmaydi — narx va kechikish).
- Har savol uchun audio'dagi **timestamp** saqlanadi → natijada "Bu javob 01:24 da aytilgan" + o'sha joydan tinglash.
- Fon: yengil ambient (kafeteriya, auditoriya) — 1-2 dB, ixtiyoriy sozlama.

### Ma'lumot modeli
```ts
ListeningTest {
  _id, testCode: string,            // "VOC-L-0007"
  parts: [{
    partNumber: 1|2|3|4,
    context: string,                 // "conversation between a student and a librarian"
    speakers: [{ id, name, voiceId, accent }],
    transcript: [{ speakerId, text, startMs, endMs }],
    audioUrl: string, durationMs: number,
    instructions: string,
    questions: Question[]            // qarang: C4 umumiy Question modeli
  }],
  cefr: 'B1'|'B2'|'C1',
  sourceWordIds: ObjectId[]          // foydalanuvchi lug'atidan ishlatilgan so'zlar
}
```

## C2. Reading — talablar

### Layout (desktop) — split screen
```
┌─────────────────────────────────────────────────────────────┐
│  IELTS Reading          [⏱ 58:40]                  [Aa ⚙]   │
├──────────────────────────────┬──────────────────────────────┤
│ Passage 1                    │ Questions 1–13               │
│ ┌─ o'z scroll'i ────────────┐│┌─ o'z scroll'i ─────────────┐│
│ │ The Architecture of…      │││ 1. Choose the correct…     ││
│ │ (matn, highlight qilinadi)│││   ○ A  ○ B  ○ C  ○ D       ││
│ └───────────────────────────┘│└────────────────────────────┘│
│           ↕ o'lchamni o'zgartirish uchun drag  ↕             │
├──────────────────────────────┴──────────────────────────────┤
│ P1 [1][2]…[13]   P2 [14]…[26]   P3 [27]…[40]      [Review] │
└─────────────────────────────────────────────────────────────┘
```

### Funksional talablar
- **F-R1.** Chap — matn, o'ng — savollar. Ikkalasi **mustaqil scroll**. O'rtadagi ajratgich sichqoncha bilan suriladi (25%–75% oralig'ida), holati saqlanadi.
- **F-R2. Highlight:** matnni belgilab **o'ng tugma** → kontekst menyu: `Highlight` (4 rang) · `Note qo'shish` · `Highlight'ni olib tashlash`. Highlight'lar avtosaqlanadi, imtihon davomida saqlanib qoladi.
- **F-R3. Notes:** highlight'ga izoh yozish; matn chetida kichik marker; hover'da ko'rinadi.
- **F-R4.** `Ctrl+F` bloklanadi (`keydown` preventDefault + ogohlantirish toast).
- **F-R5.** Savolni bosganda matndagi tegishli paragrafga scroll qilish **yo'q** (real imtihonda yo'q). Lekin Mashq rejimida — bor.
- **F-R6.** Passage paragraflari **A, B, C…** harflari bilan belgilanadi (Matching Headings/Information uchun majburiy).
- **F-R7.** Bo'sh savollar soni yuqorida ko'rinadi: `Javobsiz: 7`.
- **F-R8.** 3 passage qiyinlik bo'yicha ortib boradi: P1 ≈ 700 so'z (B1–B2), P2 ≈ 800 so'z (B2), P3 ≈ 900 so'z (B2–C1). Jami **2150–2750 so'z**.

### Savol turlari (11 ta — hammasi kerak)
| # | Tur | Komponent |
|---|---|---|
| 1 | Multiple choice (single) | radio |
| 2 | Multiple choice (multi) | checkbox + limit |
| 3 | Identifying information — **TRUE / FALSE / NOT GIVEN** | 3 ta radio |
| 4 | Identifying writer's views — **YES / NO / NOT GIVEN** | 3 ta radio |
| 5 | Matching information (qaysi paragrafda) | dropdown A–H (takrorlanishi mumkin) |
| 6 | **Matching headings** | drag-and-drop: sarlavhalar ro'yxatidan paragraf ustiga tashlash |
| 7 | Matching features | dropdown / drag |
| 8 | Matching sentence endings | dropdown |
| 9 | Sentence completion | inline input + so'z limiti |
| 10 | Summary / note / table / flow-chart completion | (a) inline input, (b) so'zlar bankidan tanlash (drag/dropdown) |
| 11 | Diagram label completion | rasm + nuqtalarga input/dropdown |
| 12 | Short-answer questions | inline input + limit |

**Muhim:** Matching Headings odatda passage boshida beriladi va paragraf harflari bilan ishlaydi — kontent generatsiyasi buni hisobga olishi kerak.

## C3. Writing — talablar

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ IELTS Writing   [Part 1] [Part 2]   [⏱ 59:12]        [Aa ⚙] │
├──────────────────────────────┬──────────────────────────────┤
│ TASK 1                       │  [matn maydoni]              │
│ The chart below shows…       │                              │
│                              │                              │
│  ┌────────────────────────┐  │                              │
│  │   ██ ▄▄ ██ ▅▅  GRAFIK  │  │                              │
│  └────────────────────────┘  │                              │
│  Write at least 150 words.   │                              │
├──────────────────────────────┴──────────────────────────────┤
│ So'z: 142 / 150 ⚠   ·   Avtosaqlandi 12:04:31               │
└─────────────────────────────────────────────────────────────┘
```

### Funksional talablar
- **F-W1. (BUG-014)** Task 1 uchun **haqiqiy vizual majburiy**. Generatsiya jarayoni:
  1. AI **strukturali ma'lumot** qaytaradi (JSON): `{ chartType, title, xLabel, yLabel, series: [{name, data}], unit, period }`
  2. Server shu ma'lumotdan **SVG** chizadi (bar / line / pie / table / process diagram / map)
  3. SVG matnga aylantiriladi va topshiriq bilan birga saqlanadi
  - Task 1 turlari: bar chart · line graph · pie chart · table · mixed (2 ta grafik) · process diagram · map (before/after)
  - Grafik uslubi: **neytral, imtihondagidek** (brend rangsiz, oq fon, qora chiziqlar) — chunki real imtihon shunday. Dark rejimda oq karta ichida ko'rsatiladi.
  - **General Training** rejimi qo'shilsa: Task 1 = xat (formal/semi-formal/informal), grafik o'rniga vaziyat matni.
- **F-W2.** So'z hisoblagichi pastki chap burchakda, real vaqtda. Minimumdan kam bo'lsa ogohlantirish rangi. **Muhim:** so'zlarni IELTS qoidasi bo'yicha sanash (defis bilan yozilgan so'z = 1, raqam = 1).
- **F-W3.** Task 1 va Task 2 **alohida tab**, ikkalasi ham 60 daqiqa ichida, istalgan tartibda. Har tab ostida o'z so'z hisoblagichi.
- **F-W4.** Avtosaqlash har **5 soniyada** + har blur'da; "Avtosaqlandi HH:MM:SS" ko'rsatkichi. Sahifa yopilsa `beforeunload` ogohlantirish.
- **F-W5.** `Ctrl+C/V/X`, `Ctrl+Z/Y` ishlaydi (faqat matn maydoni ichida). Formatlash yo'q (bold/italic yo'q — real imtihondagidek).
- **F-W6.** Spellcheck **o'chirilgan** (real imtihonda yo'q). Mashq rejimida yoqish mumkin.
- **F-W7. Baholash (AI):** har task uchun 4 mezon bo'yicha 0–9 (0.5 qadam) + izoh + tuzatilgan versiya:
  - Task 1: **Task Achievement**, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy
  - Task 2: **Task Response**, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy
  - Task ball = 4 mezon o'rtachasi (0.5 ga yaxlitlangan)
  - Writing ball = `(Task1 × 1 + Task2 × 2) / 3`, keyin 0.5 ga yaxlitlanadi
  - Chiqish: (a) mezon bo'yicha jadval + tushuntirish, (b) matn ustida **inline tuzatishlar** (grammatika/leksika/kogeziya — rang bilan ajratilgan), (c) "band 7 ga chiqish uchun 3 ta aniq qadam", (d) foydalanuvchi lug'atidan qaysi so'zlar ishlatilgani/ishlatilmagani
  - **Ogohlantirish matni majburiy:** "Bu AI taxminiy bahosi, rasmiy IELTS bali emas."
- **F-W8.** Off-topic va nusxa ko'chirilgan javobni aniqlash (AI): agar javob topshiriqqa aloqador bo'lmasa — Task Response ≤ 4 va sabab.

## C4. Umumiy `Question` modeli (barcha bo'limlar uchun)

```ts
type QuestionType =
  | 'mcq_single' | 'mcq_multi'
  | 'tfng' | 'ynng'
  | 'matching_info' | 'matching_headings' | 'matching_features' | 'matching_endings'
  | 'sentence_completion' | 'summary_completion' | 'summary_completion_bank'
  | 'table_completion' | 'form_completion' | 'flowchart_completion'
  | 'diagram_labelling' | 'map_labelling' | 'short_answer';

interface Question {
  number: number;                    // 1..40 — global raqam
  groupId: string;                   // bir ko'rsatmaga tegishli savollar guruhi
  type: QuestionType;
  instruction: string;               // guruh ko'rsatmasi (birinchi savolda ko'rsatiladi)
  wordLimit?: { maxWords: number; allowNumber: boolean };
  prompt?: string;
  options?: { key: string; text: string }[];
  bank?: { key: string; text: string }[];      // summary_completion_bank uchun
  imageUrl?: string;                            // diagram/map uchun
  hotspots?: { id: string; x: number; y: number }[];
  answer: string[] | string;         // qabul qilinadigan variantlar
  acceptAlternatives?: string[];     // "5 pm" / "5pm" / "five pm"
  caseSensitive: false;
  explanation: string;               // nega shu javob
  sourceRef?: { paragraph?: string; charStart?: number; charEnd?: number; audioMs?: number };
}
```

**Javobni tekshirish qoidalari** (IELTS'dagidek):
- Katta/kichik harf farq qilmaydi
- Ortiqcha bo'shliqlar tozalanadi
- Britaniya/Amerika imlosi ikkalasi ham qabul qilinadi (`colour/color`, `organise/organize`)
- Raqam va so'z ekvivalenti (`5` / `five`) — savol turiga qarab
- Artikl (`a/the`) ixtiyoriy bo'lgan hollar `acceptAlternatives`da
- So'z limitidan oshsa — noto'g'ri
- Imlo xatosi — **noto'g'ri** (Listening/Reading'da imlo hisobga olinadi)

## C5. Exam Shell — imtihon qobig'i (BUG-017)

To'liq imtihon rejimida:
- **Alohida layout:** sidebar, header, AI FAB, bildirishnomalar — **yo'q**
- Yuqorida faqat: bo'lim nomi · taymer · ovoz (Listening) · Settings
- `Settings` paneli: matn o'lchami (S/M/L/XL) · kontrast rejimi (Standart / Yuqori kontrast / Sepia) · qatorlar orasi
- Boshlashdan oldin **ekranni to'liq rejimga** o'tkazish taklifi (`requestFullscreen`)
- Chiqishga urinish (`beforeunload`, `popstate`) → modal: "Imtihondan chiqsangiz, natija saqlanadi va davom ettirib bo'lmaydi"
- **Fokus yo'qolishi hisobga olinadi:** `visibilitychange` → natijada "Imtihon davomida 3 marta boshqa oynaga o'tdingiz" (halollik indikatori, bloklanmaydi)
- **Taymer server tomonda:** `sectionStartedAt` DB'da; klient faqat ko'rsatadi. Har 15 soniyada server bilan sinxronlanadi. Sahifa yangilansa vaqt davom etadi.
- Vaqt tugaganda: avtomatik saqlash + keyingi bo'limga o'tish (Writing'da matn qulflanadi)

## C6. Baholash va natija (BUG-015, BUG-016)

### Xom balldan band'ga konvertatsiya

**Listening (Academic va General uchun bir xil):**
| Xom | Band | | Xom | Band |
|---|---|---|---|---|
| 39–40 | 9.0 | | 16–17 | 5.0 |
| 37–38 | 8.5 | | 13–15 | 4.5 |
| 35–36 | 8.0 | | 11–12 | 4.0 |
| 32–34 | 7.5 | | 8–10 | 3.5 |
| 30–31 | 7.0 | | 6–7 | 3.0 |
| 26–29 | 6.5 | | 4–5 | 2.5 |
| 23–25 | 6.0 | | 3 | 2.0 |
| 18–22 | 5.5 | | 2 | 1.5 |

**Academic Reading:**
| Xom | Band | | Xom | Band |
|---|---|---|---|---|
| 39–40 | 9.0 | | 15–18 | 5.0 |
| 37–38 | 8.5 | | 13–14 | 4.5 |
| 35–36 | 8.0 | | 10–12 | 4.0 |
| 33–34 | 7.5 | | 8–9 | 3.5 |
| 30–32 | 7.0 | | 6–7 | 3.0 |
| 27–29 | 6.5 | | 4–5 | 2.5 |
| 23–26 | 6.0 | | 3 | 2.0 |
| 19–22 | 5.5 | | 1–2 | 1.0–1.5 |

**General Training Reading** (agar GT rejimi qo'shilsa):
`40→9.0 · 39→8.5 · 37–38→8.0 · 36→7.5 · 34–35→7.0 · 32–33→6.5 · 30–31→6.0 · 27–29→5.5 · 23–26→5.0 · 19–22→4.5 · 15–18→4.0 · 12–14→3.5 · 9–11→3.0 · 6–8→2.5`

Bu jadvallar **konfiguratsiya faylida** (`lib/ielts/bandTables.ts`) saqlanadi, kodga yozilmaydi.

### Umumiy band
```
overall = round_ielts((L + R + W + S) / 4)
round_ielts: .125–.374 → .5 ga tushmaydi; qoida:
  kasr .25 → yuqoriga .5 ga; kasr .75 → yuqoriga butun songa;
  qolgani eng yaqin .5 ga
```
**Muhim:** biror bo'lim baholanmagan bo'lsa `overall = null` va UI'da **`—`** ko'rsatiladi, `0` emas.

### Natija ekrani (yangi)
1. **Yuqorida:** umumiy band (katta, animatsiyali) + 4 ta bo'lim bandi (radar chart yoki 4 ta ring)
2. **Bo'lim tafsiloti:** har savol uchun `sizning javobingiz | to'g'ri javob | ✓/✗`
3. **Har savolni bosganda:** kengayadi → izoh + manba (Reading: passage'dagi jumla ajratib ko'rsatiladi; Listening: audio 01:24 dan ijro + transkript satri)
4. **Savol turi bo'yicha tahlil:** "TRUE/FALSE/NOT GIVEN: 2/6 — bu sizning eng zaif turingiz" + shu turga mashq tavsiyasi
5. **Vaqt tahlili:** qaysi savolga qancha vaqt sarfladingiz (heatmap)
6. **Lug'at bog'lanishi:** matnda uchragan, sizning lug'atingizda **yo'q** bo'lgan so'zlar → "Lug'atga qo'shish" tugmasi (bir bosishda)
7. **Writing/Speaking:** mezon bo'yicha jadval + inline tuzatishlar
8. **Tarix:** oldingi mocklar bilan taqqoslash grafigi
9. **Eksport:** PDF hisobot (band, mezonlar, xatolar ro'yxati)

## C7. Kontent generatsiya quvuri (pipeline)

Har mock/mashq uchun AI **bitta so'rovda butun testni** emas, bosqichma-bosqich yaratadi:

```
1. PLAN     → mavzu, CEFR daraja, savol turlari taqsimoti, foydalanuvchi lug'atidan tanlangan so'zlar
2. CONTENT  → passage / transcript (structured JSON)
3. QUESTIONS→ har guruh uchun savollar + javoblar + izohlar + sourceRef
4. VALIDATE → avtomatik tekshiruv (quyida)
5. RENDER   → audio (TTS+ffmpeg) / SVG grafik
6. CACHE    → DB + CDN
```

**VALIDATE bosqichi majburiy tekshiruvlar:**
- Savollar soni aynan kutilgan songa teng (40 / 13 / 10…)
- Har javob passage/transkript matnida **haqiqatan mavjud** (matn qidiruvi bilan)
- TRUE/FALSE/NOT GIVEN javoblari taqsimoti muvozanatli (bittasi 60%dan oshmasin)
- MCQ variantlari orasida takror yo'q, to'g'ri javob pozitsiyasi tasodifiy
- So'z limiti savol turiga mos
- Passage so'z soni belgilangan oraliqda
- Xato bo'lsa — **qayta generatsiya**, foydalanuvchiga chiqarilmaydi

---

# QISM D — AI QATLAMI

## D1. Xatolarni boshqarish (BUG-006)

Barcha AI endpointlari uchun yagona qatlam `lib/ai/client.ts`:

1. **Retry:** 3 marta, eksponensial backoff + jitter (`1s → 2.5s → 6s`). Faqat `429`, `500`, `502`, `503`, `504`, tarmoq xatosi uchun.
2. **Fallback zanjiri:** asosiy model → tezroq/arzonroq model → boshqa provayder. Har biri `AI_MODEL_CHAIN` env orqali sozlanadi.
3. **Foydalanuvchiga ko'rinadigan xabar — faqat o'zbekcha, texnik tafsilotsiz:**
   | Holat | Xabar |
   |---|---|
   | 429 / 503 | "AI hozir band. **Qayta urinish** tugmasini bosing yoki 30 soniyadan keyin harakat qiling." |
   | Timeout | "Javob juda uzoq davom etdi. Qayta urinamizmi?" |
   | Tarmoq | "Internet bilan bog'lanishda muammo. Ulanishni tekshiring." |
   | Boshqa | "Kutilmagan xato yuz berdi. Biz xabardor bo'ldik." |
4. **Texnik tafsilot faqat log'da** (Sentry): model, endpoint, status, requestId, userId. Klientga hech qachon yuborilmaydi.
5. UI: har xato kartasida `Qayta urinish` tugmasi + `requestId` kichik shrift bilan (support uchun).
6. **Rate limit** (o'z tomonimizdan): foydalanuvchi uchun soatiga N ta generatsiya; limitga yetganda aniq xabar + qachon tiklanishi.

## D2. Lug'atdan so'z tanlash (BUG-007) — foydalanuvchi alohida so'ragan

### D2.1 Word Picker (asosiy)
AI chat input maydoni ustida yangi tugma: **`📚 Lug'atdan tanlash`**.

Bosilganda modal/sheet ochiladi:
```
┌──────────────────────────────────────────────┐
│  Lug'atdan so'z tanlash               [×]    │
├──────────────────────────────────────────────┤
│  Kategoriya:  [Destination B2 unit 24  ▾]    │
│  🔎 [ qidirish...                        ]   │
│  Filtr: [Hammasi] [Yangi] [Qiyin] [Bugungi]  │
├──────────────────────────────────────────────┤
│  ☑ enjoy        rohatlanmoq          🔴 yangi │
│  ☐ entertain    ko'ngilhushlik…      🟡 o'rg. │
│  ☑ rehearsal    repetitsiya           🟢 bilg.│
│  …                                            │
├──────────────────────────────────────────────┤
│  Tanlandi: 2 · [Hammasini tanlash]           │
│                        [Bekor]  [Qo'shish →] │
└──────────────────────────────────────────────┘
```
- Ko'p tanlash, qidiruv, kategoriya bo'yicha filtr, SRS holati bo'yicha filtr (`yangi / o'rganilyapti / takrorlash / o'zlashtirilgan`), "bugungi takrorlash" yorlig'i
- `Qo'shish` bosilganda tanlangan so'zlar chat inputiga **chip** (yorliq) sifatida qo'shiladi va so'rovga kontekst bo'lib ketadi
- Tanlangan so'zlar bilan birga backend'ga **to'liq ma'lumot** yuboriladi: `word`, `translations`, `cefr`, `partOfSpeech`, `srsState`, `lastReviewedAt`, `mistakeCount`

### D2.2 `@` mention
Input ichida `@` yozilganda avtomatik ochiluvchi ro'yxat (lug'atdan). `@rehearsal` → chip.

### D2.3 Tez-tugmalarni tuzatish
Hozirgi 4 ta tugma **so'z tanlanmagan holda ishlamaydi**. Yangi xatti-harakat:

| Tugma | Yangi oqim |
|---|---|
| `Bu so'zni tushuntir` | → darhol Word Picker ochiladi (1 ta so'z) → AI izoh beradi |
| `Misol jumla ber` | → Word Picker (1–5 so'z) → har biri uchun 3 ta jumla |
| `Mnemonika o'ylab top` | → Word Picker (1–10 so'z) → o'zbekcha assotsiatsiya + rasm tavsifi |
| `Test tuz` | → Word Picker (5–30 so'z) + savol turi va soni tanlash → **interaktiv test** (matn emas!) |

Hech qanday holatda AI "so'zni yozib yuboring" deb javob bermaydi — agar kontekst bo'sh bo'lsa, UI Picker'ni ochadi.

### D2.4 AI'ga lug'at konteksti (system prompt)
Har suhbatda AI quyidagilarni **biladi**:
- Foydalanuvchi ismi, CEFR darajasi, streak
- Aktiv kategoriya nomi va undagi so'zlar soni
- Bugungi takrorlash navbati (so'zlar ro'yxati)
- Foydalanuvchi eng ko'p xato qilgan 20 ta so'z
- Oxirgi mock natijalari (band'lar)

Bu **kompakt JSON** sifatida system prompt'ga qo'shiladi (butun lug'at emas — token tejash uchun 300 so'zdan oshsa, faqat relevantlari).

### D2.5 AI natijasini lug'atga qaytarish
AI javobida yangi so'z uchrasa — javob ostida `+ Lug'atga qo'shish` tugmasi. Bir bosishda aktiv kategoriyaga tarjimasi bilan qo'shiladi.

## D3. Strukturali AI javoblari (BUG-011)

AI faqat matn qaytarmaydi. Quyidagi holatlar uchun **JSON schema** (structured output / tool calling) ishlatiladi va UI komponent render qilinadi:

| Niyat | Schema | UI |
|---|---|---|
| Test tuzish | `{questions:[{prompt, options, answer, explanation}]}` | Interaktiv quiz kartasi (javob → darhol tekshirish → izoh) |
| So'z tushuntirish | `{word, ipa, pos, meaningUz, meaningEn, examples[], collocations[], synonyms[], antonyms[], mnemonic}` | So'z kartasi (audio talaffuz tugmasi bilan) |
| Reading generatsiya | `{title, paragraphs[], questions[]}` | Reading vyuvi |
| Writing baholash | `{criteria:{ta,cc,lr,gra}, band, corrections[], improvements[]}` | Baholash paneli |
| Grafik ma'lumoti | `{chartType, series[], ...}` | SVG grafik |

Erkin matn javoblari uchun to'liq markdown render: sarlavhalar, ro'yxatlar, jadval, kod, `<hr>`, sitata. Kod bloklarida nusxalash tugmasi.

## D4. Streaming va idrok etilgan tezlik
- Barcha AI javoblari **stream** qilinadi (hozir AI chat'da bor, lekin Reading/Listening/Writing generatsiyasida yo'q — 15–20 soniya bo'sh ekran).
- Uzoq generatsiyalar uchun **bosqich indikatori**: `Mavzu tanlanmoqda → Matn yozilmoqda → Savollar tuzilmoqda → Audio tayyorlanmoqda (2/4)`.
- Generatsiya fon rejimida davom etadi: foydalanuvchi boshqa sahifaga o'tsa ham, tayyor bo'lganda bildirishnoma.

## D5. Enrichment optimizatsiyasi (BUG-008)
- Bir so'rovda **10 ta so'z** (batch), 3 ta parallel so'rov → 30 so'z ≈ **12–18 soniya** (hozirgi 5 daqiqa o'rniga).
- Progress bar + `12/30` + ETA + `Bekor qilish`.
- Xato bo'lgan so'zlar alohida ro'yxatda + `Faqat xatolarni qayta urinish`.
- Natija oqim tarzida jadvalga tushadi (hammasi tugashini kutmaydi).
- Server tomonda ARQ/queue orqali (agar mavjud bo'lsa) — foydalanuvchi sahifani yopsa ham davom etadi.

---

# QISM E — CHAT (DO'STLAR + AI)

## E1. Layout tuzatish (BUG-023)
```css
/* Chat sahifasi */
.chat-page {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 100dvh;            /* 100vh EMAS */
  overflow: hidden;
}
.chat-thread { display: grid; grid-template-rows: auto 1fr auto; min-height: 0; }
.chat-messages { overflow-y: auto; min-height: 0; overscroll-behavior: contain; }
```
- Mobil: `grid-template-columns: 1fr`, ro'yxat ↔ suhbat o'rtasida slide o'tish, orqaga tugmasi.
- Klaviatura ochilganda `visualViewport.height` bilan input ko'rinib turadi.

## E2. Dark rejimda chat dizayni (BUG-026)
| Element | Dark qiymat |
|---|---|
| Sahifa foni | `bg` #14090D |
| Suhbatlar ro'yxati paneli | `surface` #1F1218 + o'ngda `1px border` #402B33 |
| Xabarlar sohasi | `bg-sunken` #0D0508 (matn "ichkarida" hissi) |
| Kelgan xabar puufagi | `surface-2` #2A1A21, matn `text` #F5E9EC |
| Yuborilgan xabar pufagi | `linear-gradient(135deg,#7A1E36,#A02A48)`, matn #FFF5F8 |
| Input paneli | `surface` #1F1218 + yuqorida `1px border` |
| Vaqt/status | `text-subtle` #937C83 |
| Online indikator | `success` #5FC49B (yashil emas, muted mint) |

Qo'shimcha:
- Xabar pufagi: `border-radius: 16px` + o'z tomonida 4px (tail effekti)
- Ketma-ket xabarlar guruhlanadi (avatar faqat oxirgisida, vaqt faqat guruh oxirida)
- Sana ajratgichi: `Bugun` / `Kecha` / `12-sentabr` — sticky
- O'qilgan/yetkazilgan status (✓ / ✓✓)
- Yozmoqda... indikatori
- Xabarga javob (reply), reaksiya (emoji), o'chirish/tahrirlash

## E3. Ma'lumot muammolari
- **BUG-024:** suhbat ochilganda `GET /api/chat/:conversationId/messages?limit=50&before=` — pagination bilan. Skeleton → xabarlar → yuqoriga scroll'da eski xabarlar. Xato bo'lsa "Qayta yuklash".
- **BUG-025:** `conversations` kolleksiyasida `participantsKey` (saralangan ID'lar) bo'yicha **unique index**. Mavjud dublikatlarni birlashtiruvchi migratsiya skripti.
- Realtime: WebSocket yoki SSE (hozir yuqorida wifi ikonkasi bor — status ko'rsatkichi). Uzilganda "Qayta ulanmoqda" chizig'i.

## E4. AI chat paneli
- Dark'da: panel `surface` + chap tomonda `1px border` + `box-shadow: -24px 0 48px rgb(0 0 0 / .5)` — sahifadan **aniq ajralib** turishi uchun (BUG-026).
- Salomlashuv matni `brand-text` (#F0A8B8), AI javob matni `text` (#F5E9EC).
- Taklif chiplari: `surface-2` fon + `border` + hover'da `surface-3`.
- Suhbatlar ro'yxatida: rename / delete / pin / qidiruv (BUG-010).
- AI FAB pozitsiyasi: chat sahifalarida **yashiriladi** (BUG-027); boshqa joyda `bottom: 24px; right: 24px`, mobil'da tab-bar ustida.

---

# QISM F — MA'LUMOT MODELI VA API

## F1. Yangi/o'zgaradigan kolleksiyalar
```
tests            { type: 'listening'|'reading'|'writing'|'full_mock', testCode, cefr, parts[], createdBy, isPublic }
examAttempts     { userId, testId, mode: 'exam'|'practice', sections[{name, startedAt, endedAt, answers, raw, band}],
                   overallBand, integrityEvents[], createdAt }
questionBank     { type, cefr, skill, question, usageCount, lastUsedAt }
writingSubmissions { userId, taskType: 1|2, promptId, text, wordCount, criteria{}, band, corrections[], gradedAt }
speakingSubmissions{ userId, part, questionId, audioUrl, transcript, criteria{}, band }
audioAssets      { hash, text, voiceProfile, url, durationMs, createdAt }   // TTS cache
conversations    { participantsKey (unique), participants[], lastMessage, updatedAt }
aiSessions       { userId, title, pinned, messages[], contextWordIds[], createdAt }
```

## F2. API endpointlari (yangi)
```
POST /api/exam/start                     { testId | generate: {type, cefr} }
GET  /api/exam/:id/state                 → server taymer, joriy bo'lim
POST /api/exam/:id/section/start
POST /api/exam/:id/answer                { questionNumber, value }   // debounced avtosaqlash
POST /api/exam/:id/review                { questionNumber, flagged }
POST /api/exam/:id/highlight             { passageId, ranges[], note }
POST /api/exam/:id/submit
GET  /api/exam/:id/result                → band'lar, savol-savol tahlil

POST /api/generate/listening             { cefr, topic?, wordIds[] }
POST /api/generate/reading               { cefr, topic?, wordIds[], passageCount }
POST /api/generate/writing-task          { taskType, variant }        → prompt + chartSvg
POST /api/grade/writing                  { taskType, prompt, text }
POST /api/grade/speaking                 { part, audio }

GET  /api/words?categoryId&srsState&q&limit&cursor   // Word Picker uchun
POST /api/words/enrich-batch             { wordIds[] }               // 10 tagacha
POST /api/words/bulk-add                 { categoryId, words[] }     // AI natijasidan

GET  /api/chat/:conversationId/messages?limit&before
```

## F3. Performance
- **BUG-031:** `/api/notifications` — React Query, `staleTime: 60s`, `refetchOnWindowFocus: false`, sahifa yashirilganda to'xtaydi. Yoki SSE orqali push.
- Reading/Listening testlari **statik generatsiya + CDN cache** (bir xil test barcha foydalanuvchilar uchun).
- Audio fayllar: R2/S3 + `Cache-Control: public, max-age=31536000, immutable`.
- Lug'at jadvali 100+ so'zda **virtualizatsiya** (`@tanstack/react-virtual`).
- Route-level code splitting: exam shell alohida bundle.
- Lighthouse maqsad: Performance ≥ 90, Accessibility ≥ 95 (mobil).

---

# QISM G — XAVFSIZLIK

1. **BUG-030:** JWT `localStorage`dan olinadi → `httpOnly; Secure; SameSite=Lax` cookie. `phone` localStorage'dan butunlay olib tashlanadi.
2. AI xatolarida provayder/model/endpoint klientga chiqmaydi (BUG-006).
3. Barcha AI endpointlarida rate limit (IP + userId).
4. Foydalanuvchi kiritgan matn AI javobiga qo'shilganda prompt injection'dan himoya (system/user rollarini aniq ajratish; AI javobidagi "ko'rsatma"larni bajarmaslik).
5. `/admin` — role tekshiruvi **server tomonda** (hozir sidebar'da "Admin panel" ko'rinadi; middleware darajasida ham himoyalanganini tekshirish kerak).
6. Mock kontenti mualliflik huquqi: "Cambridge IELTS 15" nomli material olib tashlanadi (BUG-021).
7. Foydalanuvchi audio yozuvlari (Speaking) — TTL bilan avtomatik o'chirish + maxfiylik siyosatida ko'rsatish.

---

# QISM H — QABUL QILISH MEZONLARI (QA)

## H1. Dark mode
- [ ] `data-theme="dark"` da `--color-primary`, `--color-brand-text`, barcha `*-soft` tokenlar light qiymatdan **farq qiladi**
- [ ] Dashboard, AI chat, lug'at jadvali, mock natija sahifasida **hech qanday** matn 4.5:1 dan past kontrastga ega emas
- [ ] Mock natija sahifasida oq/och-pushti bloklar yo'q
- [ ] Sidebar, karta va fon vizual ajralib turadi (ΔL ≥ 4)
- [ ] Mavzu tugmasi: Yorug' / Tungi / Tizim — tanlov saqlanadi, sahifa yangilanganda FOUC yo'q
- [ ] Skript: barcha token juftliklari uchun kontrast hisoblovchi test (CI'da fail bo'ladi)

## H2. IELTS
- [ ] Listening: 4 part, 40 savol, haqiqiy audio (TTS ko'p ovoz), volume, 30s ko'rish + 2 daq tekshirish
- [ ] Reading: 3 passage (jami 2150–2750 so'z), 40 savol, 11 savol turining hammasi, split-screen + drag ajratgich, highlight + notes, Ctrl+F bloklangan
- [ ] Writing: Task 1 da **SVG grafik bor**, so'z hisoblagichi, avtosaqlash, 4 mezon bo'yicha AI baho + inline tuzatish
- [ ] Savol paneli: 40 raqam, javob berilgan/review holatlari to'g'ri
- [ ] Taymer server tomonda; sahifa yangilanganda davom etadi; 10 va 5 daqiqada qizarib miltillaydi
- [ ] Band konvertatsiyasi jadval bo'yicha to'g'ri (unit test: 40 xom ball → kutilgan band)
- [ ] Baholanmagan bo'lim `—` ko'rsatadi, `0` emas
- [ ] Natijada har savol uchun to'g'ri javob + izoh + manba
- [ ] Exam shell: sidebar/FAB/bildirishnoma yo'q, chiqishda ogohlantirish

## H3. AI
- [ ] AI xatosida foydalanuvchi faqat o'zbekcha xabar + `Qayta urinish` ko'radi; model nomi/URL ko'rinmaydi
- [ ] 503 holatida avtomatik 3 marta retry + fallback model
- [ ] `Bu so'zni tushuntir` bosilganda **Word Picker ochiladi**; "so'zni yozib yuboring" javobi umuman chiqmaydi
- [ ] Word Picker: qidiruv, kategoriya filtri, SRS filtri, ko'p tanlash ishlaydi
- [ ] `@` mention lug'atdan avtoto'ldiradi
- [ ] `Test tuz` interaktiv quiz qaytaradi (oddiy matn emas)
- [ ] 30 so'zni boyitish ≤ 20 soniya, progress bar bilan
- [ ] AI javobida markdown to'liq render bo'ladi

## H4. Chat
- [ ] Chat konteyneri ekran balandligini to'liq egallaydi (desktop + mobil)
- [ ] Suhbat ochilganda xabarlar tarixi yuklanadi
- [ ] Bir foydalanuvchi bilan bitta suhbat
- [ ] Dark rejimda panel/xabar/fon aniq ajraladi
- [ ] AI FAB chat inputini to'smaydi

## H5. Responsive va A11y
- [ ] 360 / 390 / 414 / 768 / 1024 / 1440 px da barcha sahifalar tekshirilgan
- [ ] Gorizontal scroll yo'q
- [ ] Teginish nishonlari ≥ 44px
- [ ] Butun ilova faqat klaviatura bilan boshqarilishi mumkin; focus ring ko'rinadi
- [ ] `prefers-reduced-motion` hurmat qilinadi
- [ ] Skrinrider uchun: barcha ikonka-tugmalarda `aria-label`, savollar `fieldset/legend` ichida
- [ ] Lighthouse Accessibility ≥ 95

---

# QISM I — BOSQICHLAR (yo'l xaritasi)

### Sprint 1 — "Sayt buzilmasin" (1 hafta) — P0
1. Dark mode token tizimini to'liq qayta yozish (§B2) + kontrast testi
2. AI xato qatlami: retry, fallback, o'zbekcha xabarlar (§D1)
3. Chat layout va xabar tarixi tuzatish (§E1, E3)
4. Writing Task 1 SVG grafik generatsiyasi (§C3 F-W1)
5. Mock Listening audio (§C1 audio pipeline) yoki audio tayyor bo'lmaguncha Listening'ni mock'dan vaqtincha olib turish

### Sprint 2 — "AI haqiqatan lug'at bilan ishlasin" (1 hafta) — P0/P1
6. Word Picker + `@` mention + AI lug'at konteksti (§D2)
7. Tez-tugmalar oqimini qayta qurish
8. Strukturali AI javoblari: interaktiv test, so'z kartasi (§D3)
9. Enrichment batching + progress (§D5)

### Sprint 3 — "IELTS'ga o'xshasin" (2 hafta) — P0
10. Umumiy `Question` modeli + 11 Reading / 7 Listening savol turi komponentlari (§C4)
11. Exam Shell: fullscreen, server taymer, savol paneli, review (§C5)
12. Reading split-screen + highlight + notes (§C2)
13. Band konvertatsiyasi + yangi natija ekrani (§C6)

### Sprint 4 — "Premium" (1–2 hafta) — P1/P2
14. Tipografika, spacing, radius, chuqurlik tizimi (§B3, B4)
15. Sidebar gradienti, tekstura, progress ring, mikro-interaksiyalar (§B5)
16. Skeleton yuklash, bo'sh holatlar, illyustratsiyalar
17. Responsive: mobil tab-bar, split-screen → tab, chat drawer (§B6)
18. Landing scroll-driven animatsiya

### Sprint 5 — "Ishonchlilik" (1 hafta) — P1
19. JWT cookie'ga o'tkazish (§G1)
20. Kontent VALIDATE bosqichi (§C7)
21. Performance: virtualizatsiya, cache, notifications (§F3)
22. Speaking to'liq baholash + mock ichida yozib olish
23. E2E testlar (Playwright): to'liq mock oqimi, dark mode snapshot, chat

---

## Manbalar (IELTS CD interfeysi bo'yicha)

- [Computer-Delivered IELTS: The Look — IDP Canada](https://ieltscanadatest.com/2018/11/computer-delivered-ielts-the-look) — ekran layouti, taymer pozitsiyasi, savol paneli, highlight/notes, split-screen, so'z hisoblagichi
- [How computer-delivered IELTS works — IDP](https://ielts.idp.com/canada/prepare/article-how-computer-delivered-ielts-works) — vaqt, volume, 2 daqiqa tekshirish, ko'chirish vaqti yo'qligi, review tugmasi
- [Key features of IELTS on Computer — IDP](https://ielts.idp.com/srilanka/about/news-and-articles/article-key-features-of-ielts-on-computer) — taymer, avtosaqlash, highlight, so'z hisoblagichi, volume
- [Computer Delivered IELTS: tips from test takers](https://ieltsfreeway.com/computer-delivered-ielts-16-tips-from-test-takers/) — Ctrl+F o'chirilgan, Ctrl+C/V faqat Writing'da, drag-and-drop matching headings, Tab navigatsiya, matn o'lchami/rangi
- [IELTS Listening raw score to band conversion](https://ielts9.io/blog/ielts-listening-raw-score-to-band-conversion) — Listening konvertatsiya jadvali
- [IELTS Reading raw score to band conversion](https://typogrammar.com/ielts/reading-raw-score-to-band-conversion/) — Academic va General Reading jadvallari
- [IELTS on Computer — British Council](https://takeielts.britishcouncil.org/computer-delivered-sample-test-questions) — rasmiy familiarisation test

# Vocably — IELTS CD Exam Engine
## To'liq texnik topshiriq (TZ) v1.0

**Loyiha:** vocably.uz
**Stack:** Next.js (App Router) + MongoDB + Vercel
**Maqsad:** Reading, Listening, Writing va to'liq Mock bo'limlarini haqiqiy IELTS Computer-Delivered imtihon interfeysiga maksimal darajada o'xshatish va ularning barchasini **bitta umumiy exam engine** ustiga o'tkazish.

---

## 0. Bu hujjat nima uchun

Hozir Vocably'da `/app/oqish`, `/app/tinglash`, `/app/yozish`, `/app/mock` — to'rtta alohida sahifa. Har biri o'z taymeri, o'z navigatsiyasi, o'z javob saqlash mantig'i bilan ishlaydi. Bu uchta muammo tug'diradi:

1. **Bir xil bug'ni 4 marta tuzatasiz.** Taymer drift'i, autosave, javob validatsiyasi — hammasi takrorlanadi.
2. **Mock haqiqiy tuyulmaydi.** Foydalanuvchi mashq rejimida bir interfeysni, mock'da boshqasini ko'radi. IELTS'ning butun qiymati — interfeysga o'rganib qolish.
3. **Yangi savol turi qo'shish 4 joyda kod yozish demak.**

Yechim: **bitta `ExamShell` + pluggable section modullari + bitta `QuestionRenderer`**. Barcha 4 sahifa shu shell'ning turli konfiguratsiyasi bo'ladi.

---

## 1. Qamrov: qaysi sahifalarga tegadi

| Sahifa | Rejim | Shell | Taymer | Savol navigatsiyasi | Audio | Split-pane |
|---|---|---|---|---|---|---|
| `/app/mock` | `exam` | ✅ to'liq | Server, qattiq | 1–40, bo'lim bo'yicha | ✅ bir marta | ✅ Reading + Writing |
| `/app/oqish` | `practice` | ✅ to'liq | Yumshoq / o'chiriladi | 1–13 (bitta passage) | — | ✅ |
| `/app/tinglash` | `practice` | ✅ to'liq | Yumshoq | 1–10 (bitta part) | ✅ to'liq boshqaruv | ❌ (faqat savollar) |
| `/app/yozish` | `practice` | ✅ to'liq | Yumshoq | Task 1 / Task 2 | — | ✅ |
| `/app/gapirish` | `practice` | ⚠️ Faza 3 | — | Part 1/2/3 | ovoz yozish | ❌ |
| `/app/lugat` | — | ❌ tegmaydi | — | — | — | — |

**Muhim:** `/app/lugat` (14 rejim) va dashboard bu engine'ga tegmaydi. Ular alohida qoladi.

---

## 2. Asosiy arxitektura qarori

```
┌─────────────────────────────────────────────────────────┐
│ ExamShell                                                │
│  ├─ ExamHeader   (nom, ID, taymer, sozlamalar, yordam)  │
│  ├─ ExamBody     ← bu yerga section moduli joylashadi   │
│  │    ├─ ReadingSection   (SplitPane: Passage | Questions)│
│  │    ├─ ListeningSection (AudioEngine + Questions)      │
│  │    ├─ WritingSection   (SplitPane: Task | Editor)     │
│  │    └─ SpeakingSection  (Faza 3)                       │
│  └─ ExamFooterNav (1–40 tugmalar, Review, ←/→, Submit)  │
└─────────────────────────────────────────────────────────┘
            ↑                    ↑                  ↑
      examStore (zustand)   useExamTimer()    useAutosave()
```

**Qoida:** Section moduli taymerni, navigatsiyani, saqlashni **bilmaydi**. U faqat "menda shu savollar bor, ularni chiz" deydi. Qolgan hammasi shell'ning ishi.

**Qoida 2:** `QuestionRenderer` bitta. Reading va Listening bir xil `sentence_completion` komponentidan foydalanadi. Farq faqat `allowedTypes` ro'yxatida.

---

## 3. Ma'lumotlar modeli

### 3.1 Test (kontent — admin kiritadi)

```ts
interface Test {
  _id: ObjectId;
  slug: string;                    // "cambridge-19-test-1"
  title: string;                   // "Cambridge IELTS 19 — Test 1"
  module: 'academic' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  sections: {
    listening?: ListeningSection;
    reading?: ReadingSection;
    writing?: WritingSection;
    speaking?: SpeakingSection;
  };
  isPublished: boolean;
  createdBy: ObjectId;
  createdAt: Date;
}
```

### 3.2 Reading

```ts
interface ReadingSection {
  durationSec: 3600;               // 60 daqiqa
  passages: Passage[];             // uzunligi 3
}

interface Passage {
  order: 1 | 2 | 3;
  title: string;                   // "The history of glass"
  subtitle?: string;               // "Read the text and answer questions 1-13"
  paragraphs: {
    label?: string;                // "A", "B", "C" — matching_headings uchun
    html: string;                  // <p>...</p>, faqat p/em/strong/sup ruxsat
  }[];
  questionGroups: QuestionGroup[];
}
```

### 3.3 Listening

```ts
interface ListeningSection {
  durationSec: 1800;               // 30 daqiqa (audio davomiyligi + 2 daq tekshirish)
  checkTimeSec: 120;
  parts: ListeningPart[];          // uzunligi 4
}

interface ListeningPart {
  order: 1 | 2 | 3 | 4;
  audioUrl: string;                // har part alohida fayl — bu eng barqaror yechim
  durationSec: number;
  transcript?: string;             // faqat practice rejimda, tugagandan keyin
  contextText?: string;            // "You will hear a conversation between..."
  questionGroups: QuestionGroup[];
}
```

### 3.4 Writing

```ts
interface WritingSection {
  durationSec: 3600;
  tasks: [WritingTask, WritingTask];
}

interface WritingTask {
  order: 1 | 2;
  minWords: 150 | 250;
  recommendedMin: 20 | 40;
  promptHtml: string;
  imageUrl?: string;               // Task 1 Academic uchun grafik
  imageAlt?: string;               // accessibility uchun majburiy
  sampleAnswer?: string;           // practice rejimda tugagandan keyin
  markingNotes?: string;           // AI grader uchun yashirin kontekst
}
```

### 3.5 QuestionGroup va Question

```ts
interface QuestionGroup {
  id: string;
  type: QuestionType;
  instructionHtml: string;         // "Choose NO MORE THAN TWO WORDS..."
  wordLimit?: {                    // avtomatik validatsiya uchun
    maxWords: number;
    maxNumbers?: number;
    label: string;                 // "NO MORE THAN TWO WORDS AND/OR A NUMBER"
  };
  bank?: BankItem[];               // matching / wordbank turlari uchun
  bankReusable?: boolean;          // variantni qayta ishlatish mumkinmi
  stemHtml?: string;               // summary/table/flowchart uchun umumiy karkas
  imageUrl?: string;               // map / diagram / plan
  imageHotspots?: Hotspot[];       // diagram_label uchun
  questions: Question[];
}

interface Question {
  number: number;                  // 1–40 global
  promptHtml?: string;
  options?: Option[];              // MC uchun
  selectCount?: number;            // multiple_choice_multi: 2 yoki 3
  answer: AnswerKey;               // ⚠️ MIJOZGA HECH QACHON YUBORILMAYDI (exam rejimda)
  explanationHtml?: string;        // natija ekranida ko'rsatiladi
  locatorParagraph?: string;       // "C" — javob qaysi paragrafda (review uchun)
}

interface AnswerKey {
  accepted: string[];              // ["museum", "the museum"]
  pattern?: string;                // ixtiyoriy regex, murakkab holatlar uchun
  caseSensitive?: false;
}
```

### 3.6 Savol turlari (to'liq ro'yxat)

```ts
type QuestionType =
  // Umumiy
  | 'multiple_choice_single'       // A/B/C/D — bitta
  | 'multiple_choice_multi'        // "Choose TWO letters"
  | 'sentence_completion'          // matn ichida gap
  | 'short_answer'                 // savolga qisqa javob
  | 'note_completion'
  | 'table_completion'
  | 'flowchart_completion'
  | 'summary_completion'           // bo'sh joy, erkin yozish
  | 'summary_completion_bank'      // bo'sh joy, variantlar bankidan
  | 'matching_features'            // "Which person said..."
  | 'matching_sentence_endings'
  | 'diagram_label'                // rasm ustiga yorliq
  // Faqat Reading
  | 'true_false_notgiven'
  | 'yes_no_notgiven'
  | 'matching_headings'            // i, ii, iii rim raqamlari
  | 'matching_information'         // "Which paragraph contains..."
  // Faqat Listening
  | 'form_completion'
  | 'map_label'                    // xarita/plan ustiga drag-drop
  | 'plan_label';
```

### 3.7 Attempt (foydalanuvchi urinishi)

```ts
interface Attempt {
  _id: ObjectId;
  userId: ObjectId;
  testId: ObjectId;
  mode: 'mock' | 'section';
  sections: ('listening'|'reading'|'writing'|'speaking')[];  // mock'da hammasi
  currentSection: string;
  status: 'in_progress' | 'submitted' | 'graded' | 'expired' | 'abandoned';

  // Taymer — SERVER manbai
  startedAt: Date;
  sectionStartedAt: Date;
  endsAt: Date;                    // server hisoblaydi
  pausedSec: number;               // faqat practice rejimda

  // Javoblar
  answers: Record<string, AnswerValue>;   // key = "q12"
  flagged: number[];                      // review uchun belgilangan savollar
  lastQuestion: number;

  // Listening holati
  audio: {
    partIndex: number;
    positionSec: number;           // refresh qilsa shu joydan davom etadi
    playedParts: number[];         // qayta tinglash mumkin emas
    volume: number;
  };

  // Writing
  essays: {
    task1?: { text: string; wordCount: number; updatedAt: Date };
    task2?: { text: string; wordCount: number; updatedAt: Date };
  };

  // Integrity
  events: { type: string; at: Date; meta?: any }[];
  tabSwitchCount: number;

  // Natija
  result?: AttemptResult;
  submittedAt?: Date;
}

type AnswerValue = string | string[] | null;
```

### 3.8 Natija

```ts
interface AttemptResult {
  listening?: { raw: number; band: number; perPart: number[] };
  reading?:   { raw: number; band: number; perPassage: number[] };
  writing?:   {
    task1: WritingScore;
    task2: WritingScore;
    band: number;                  // (task1 + task2*2) / 3, 0.5 ga yaxlitlanadi
  };
  speaking?:  { band: number; criteria: Record<string, number> };
  overall?: number;
  timeSpentSec: number;
  perQuestion: { number: number; userAnswer: string; correct: boolean; accepted: string[] }[];
}

interface WritingScore {
  taskAchievement: number;   // TA / TR
  coherenceCohesion: number; // CC
  lexicalResource: number;   // LR
  grammaticalRange: number;  // GRA
  band: number;
  feedbackUz: string;
  corrections: { original: string; suggested: string; reason: string }[];
  improvedVersion?: string;
}
```

---

## 4. Backend API

Barcha endpoint'lar `/api/exam/...` ostida. Auth majburiy.

| Metod | Endpoint | Vazifa |
|---|---|---|
| `POST` | `/attempts` | Yangi urinish. Body: `{testId, mode, sections}`. Javob: `{attemptId}` |
| `GET` | `/attempts/:id` | **Sanitizatsiya qilingan** kontent + saqlangan javoblar + `serverNow`, `endsAt` |
| `PATCH` | `/attempts/:id/answers` | Batch saqlash: `{answers: {...}, flagged: [...], lastQuestion: n}` |
| `POST` | `/attempts/:id/heartbeat` | Har 15s. Body: `{audioPositionSec, currentQuestion}`. Javob: `{remainingSec, status}` |
| `POST` | `/attempts/:id/section/next` | Mock'da keyingi bo'limga o'tish (orqaga qaytish mumkin emas) |
| `POST` | `/attempts/:id/submit` | Yakunlash + avtomatik baholash |
| `POST` | `/attempts/:id/grade-writing` | AI baholash (navbatga qo'yiladi, natija polling bilan) |
| `GET` | `/attempts/:id/result` | To'g'ri javoblar + izohlar — **faqat `status === 'graded'` bo'lsa** |
| `POST` | `/attempts/:id/event` | Integrity log: tab switch, fullscreen exit, paste |

### 4.1 ⚠️ Eng muhim xavfsizlik qoidasi

`GET /attempts/:id` javobida **`answer`, `explanationHtml`, `transcript`, `sampleAnswer`, `locatorParagraph` maydonlari bo'lmasligi kerak** (exam rejimda). Serverda sanitizer funksiyasi yozing:

```ts
function sanitizeForExam(test: Test): SanitizedTest {
  // recursively delete: answer, explanationHtml, locatorParagraph,
  // transcript, sampleAnswer, markingNotes
}
```

Hozir agar javoblar HTML/JSON payload bilan birga kelayotgan bo'lsa — bu butun mock tizimining ma'nosini yo'q qiladi. Birinchi navbatda shuni tekshiring.

### 4.2 Taymer — server manbai

Klientdagi taymer **faqat ko'rsatkich**. Haqiqat serverda:

```ts
// GET /attempts/:id javobida
{ serverNow: 1757580000000, endsAt: 1757583600000 }

// Klient:
const offset = serverNow - Date.now();
const remaining = () => endsAt - (Date.now() + offset);
```

Har `heartbeat`da server `remainingSec` qaytaradi va klient farqni ≥3s bo'lsa tuzatadi. `remaining <= 0` bo'lsa server `submit`ni majburan bajaradi — klient nima qilishidan qat'i nazar.

### 4.3 Autosave strategiyasi

| Trigger | Nima saqlanadi |
|---|---|
| Javob o'zgardi | 800ms debounce → shu bitta javob |
| Har 20 soniya | To'liq snapshot (javoblar + flagged + lastQuestion) |
| `blur` / `visibilitychange` | Darhol to'liq snapshot |
| `beforeunload` | `navigator.sendBeacon()` bilan snapshot |
| Bo'lim almashganda | Majburiy sync, muvaffaqiyatsiz bo'lsa o'tkazmaydi |

Optimistik UI: javob darhol ko'rinadi, saqlash fonda. Xatolik bo'lsa header'da kichik indikator: `● Saqlanmadi — qayta urinilmoqda`.

---

## 5. UI spetsifikatsiyasi — umumiy shell

### 5.1 Dizayn qarori (bu sizga yoqmasligi mumkin, lekin muhim)

Siz maksimalizm, 3D, scroll-animatsiya va premium ranglarni yoqtirasiz. **Imtihon ekranida bularning hech biri bo'lmasligi kerak.** Sabab: mock'ning yagona maqsadi — haqiqiy imtihonga o'rganish. Har qanday bezak diqqatni bo'ladi va tayyorgarlik sifatini pasaytiradi. IELTS CD ekrani ataylab zerikarli: kulrang, oq, Arial.

Shuning uchun:

- **Imtihon ekrani (`ExamShell` ichi):** neytral, IELTS'ga o'xshash. Deep Merlot faqat **aksent** sifatida — joriy savol ramkasi, focus ring, asosiy tugma.
- **Imtihondan oldin/keyin (intro, natija, review, dashboard):** to'liq Deep Merlot + premium + animatsiya. Bu yerda o'zingizni erkin his qiling.

### 5.2 Exam design tokenlari

```css
[data-exam] {
  --exam-bg:            #FFFFFF;
  --exam-chrome:        #F1F1F1;   /* header/footer fon */
  --exam-chrome-border: #D4D4D4;
  --exam-text:          #1A1A1A;
  --exam-muted:         #6B6B6B;
  --exam-instruction:   #F7F7F7;   /* ko'rsatma bloki foni */
  --exam-input-border:  #8C8C8C;
  --exam-accent:        #4A1226;   /* Deep Merlot — joriy savol, focus */
  --exam-accent-soft:   #B8394A;
  --exam-answered:      #4A1226;
  --exam-flag:          #E08D00;
  --exam-danger:        #C0392B;   /* 5 daqiqa qolganda */
  --exam-highlight:     #FFE9A8;   /* matn belgilash */
  --exam-focus-ring:    0 0 0 3px rgba(74,18,38,.28);
}
```

**Dark mode:** imtihon ekranida **yo'q**. Haqiqiy IELTS'da dark mode yo'q, va oq fon ko'z charchashini imitatsiya qiladi. Sozlamalarda faqat "yuqori kontrast" rejimi (oq matn qora fonda) — bu rasmiy IELTS'da mavjud accessibility opsiyasi.

### 5.3 Tipografika

| Element | O'lcham | Line-height | Og'irlik |
|---|---|---|---|
| Passage matni | 16px (sozlanadi 16/18/20/22) | 1.75 | 400 |
| Passage sarlavhasi | 20px | 1.3 | 700 |
| Savol matni | 16px | 1.6 | 400 |
| Ko'rsatma bloki | 15px | 1.55 | 400 (kalit so'zlar 700 + CAPS) |
| Savol raqami | 15px | — | 700 |
| Taymer | 18px tabular-nums | — | 600 |
| Nav tugmasi | 13px | — | 600 |

Shrift: `system-ui, -apple-system, "Segoe UI", Arial, sans-serif`. Imtihon ekranida dekorativ shrift ishlatmang.

### 5.4 ExamHeader (balandligi 56px)

```
┌──────────────────────────────────────────────────────────────────┐
│ 👤 Jamolxon T.  ·  ID 0012345 │  ⏱ 42:17  │ 🔊──── ⚙ ? 🖥 │
└──────────────────────────────────────────────────────────────────┘
   chap (nom + ID)              markaz (taymer)    o'ng (boshqaruv)
```

- **Chap:** foydalanuvchi ismi + soxta candidate ID (attempt'dan generatsiya, masalan `attemptId` oxirgi 7 raqami). Bu haqiqiylik hissini beradi.
- **Markaz:** taymer. `MM:SS` formatida, `font-variant-numeric: tabular-nums`.
  - 10 daqiqa qolganda: toast + taymer `--exam-accent-soft`
  - 5 daqiqa qolganda: toast + taymer `--exam-danger` + 2 marta pulsatsiya (keyin to'xtaydi)
  - 1 daqiqa: toast
  - `aria-live="polite"` bilan e'lon qilinadi
- **O'ng:**
  - 🔊 Volume slider (faqat Listening'da ko'rinadi)
  - ⚙ Sozlamalar: matn o'lchami, yuqori kontrast
  - ? Yordam: savol turlari bo'yicha qisqa qo'llanma (modal, taymer to'xtamaydi)
  - 🖥 "Yashirish" — taymerni yashirish tugmasi (haqiqiy IELTS'da bor, tashvishni kamaytiradi)

Header `position: sticky; top: 0; z-index: 50`.

### 5.5 ExamFooterNav (balandligi 64px desktop, 88px mobil)

```
┌──────────────────────────────────────────────────────────────────┐
│ Part 1 [1][2][3]…[10] │ Part 2 [11]…[20] │ Part 3 …  │  ← →  ✓ │
└──────────────────────────────────────────────────────────────────┘
```

Savol tugmasi holatlari:

| Holat | Ko'rinish |
|---|---|
| Javobsiz | Oq fon, `--exam-chrome-border` chegara, qora raqam |
| Javob berilgan | `--exam-answered` rangida **tagiga chizilgan** raqam + och fon `#EFE6EA` |
| Joriy | 2px `--exam-accent` ramka + `--exam-focus-ring` |
| Belgilangan (flag) | Yuqori-o'ng burchakda 6px `--exam-flag` uchburchak |
| Boshqa bo'limda (mock) | 40% opacity, bosilmaydi |

**Xatti-harakat:**
- Tugma bosilganda → savol paneli shu savolga smooth scroll + input'ga focus. **Passage paneli qimirlamaydi** (haqiqiy IELTS shunday).
- ← → strelkalari: bir savol oldinga/orqaga.
- ✓ tugmasi: mock'da faqat oxirgi bo'limda "Yakunlash", practice'da doim.
- Klaviatura: `←`/`→` navigatsiya, `Ctrl+F` belgilash (flag), `Tab` inputlar orasida.

### 5.6 Ko'rsatma bloki (instruction block)

Har `QuestionGroup` tepasida:

```
┌──────────────────────────────────────────────┐
│ Questions 14–18                              │  ← 15px, 700
│                                              │
│ Complete the sentences below.                │
│ Choose NO MORE THAN TWO WORDS from the       │  ← CAPS qismi 700
│ passage for each answer.                     │
└──────────────────────────────────────────────┘
background: var(--exam-instruction);
border-left: 3px solid var(--exam-accent);
padding: 14px 16px;
```

### 5.7 Sozlamalar paneli

```
Matn o'lchami:   [A-]  16px  [A+]        (16 / 18 / 20 / 22)
Yuqori kontrast: [  ○──]                 (off / on)
Taymer:          [──○  ]                 (ko'rsatish / yashirish)
```

`localStorage`da saqlanadi va keyingi urinishda tiklanadi.

---

## 6. Reading moduli

### 6.1 Split-pane — bu asosiy talab

```
┌───────────────────────────┬┬───────────────────────────┐
│ READING PASSAGE 1         ││ Questions 1–6             │
│ The history of glass      ││ ┌───────────────────────┐ │
│                           ││ │ Do the following      │ │
│ A  Glass has been used... ││ │ statements agree...   │ │
│    ...                    ││ └───────────────────────┘ │
│                           ││                           │
│ B  From the Middle Ages...││ 1. Glass was first...     │
│    ...                    ││    ○ TRUE                 │
│                           ││    ○ FALSE                │
│    ↕ mustaqil scroll      ││    ○ NOT GIVEN            │
│                           ││    ↕ mustaqil scroll      │
└───────────────────────────┴┴───────────────────────────┘
                        ↑ divider (6px, sudraladigan)
```

**Texnik talablar:**

```css
.exam-split { display: grid; grid-template-columns: 1fr 6px 1fr; height: calc(100vh - 120px); }
.exam-pane  { overflow-y: auto; overscroll-behavior: contain; padding: 24px 28px; }
.exam-divider {
  cursor: col-resize; background: var(--exam-chrome-border);
  position: relative; touch-action: none;
}
.exam-divider::after {           /* sudrash zonasi kengaytirilgan */
  content:''; position:absolute; inset:0 -6px;
}
```

- Boshlang'ich nisbat **50/50**.
- Sudrash chegarasi: **30%–70%**. Undan tashqariga chiqmaydi.
- **Double-click** → 50/50 ga qaytadi.
- Nisbat `localStorage['exam.split.reading']` da saqlanadi.
- Sudrash paytida `user-select: none` butun body'ga, va panellarda `pointer-events: none` (iframe muammosi oldini olish uchun).
- Sudrash `requestAnimationFrame` bilan, `transform` emas — `grid-template-columns` yangilanadi.
- Klaviatura: divider `tabindex="0"`, `←`/`→` bilan 2% qadamda siljiydi, `aria-label="Panellar kengligini o'zgartirish"`, `role="separator"`, `aria-valuenow`.

### 6.2 Passage paneli

- Paragraf yorliqlari (**A**, **B**, **C**) — chap chetda, `position: absolute; left: 0; font-weight: 700`, paragraf matni `padding-left: 28px`.
- Yorliq faqat `matching_headings` yoki `matching_information` guruhi mavjud bo'lsa ko'rsatiladi.
- `max-width` **yo'q** — panel kengligi o'zi cheklaydi.
- Sarlavha `position: sticky; top: 0` qilib qo'yiladi (fon bilan), scroll paytida qaysi passage ekanligi ko'rinib turadi.

### 6.3 Matn belgilash va eslatma (highlight & notes)

Haqiqiy IELTS CD'da bu bor va ko'p nomzod ishlatadi.

**Ish tartibi:**
1. Foydalanuvchi matnni tanlaydi → o'ng tugma bosadi (yoki mobil'da tanlov ustida "..." tugmasi).
2. Kontekst menyusi: `Belgilash` / `Belgini olib tashlash` / `Eslatma qo'shish`.
3. Belgilangan matn `background: var(--exam-highlight)` bo'ladi.
4. Eslatma: kichik popup, matn kiritiladi, belgilangan joyda kichik 📝 ikonka paydo bo'ladi, hover'da ko'rsatiladi.

**Saqlash formati:**

```ts
interface Highlight {
  passageOrder: number;
  paragraphIndex: number;
  startOffset: number;   // paragraf ichidagi tekst offset (barcha text node'lar birlashtirilgan holda)
  endOffset: number;
  note?: string;
}
```

Offset'ni hisoblash uchun `TreeWalker` bilan text node'larni yurib chiqing va kumulyativ offset toping. DOM'ni qayta chizishda offsetdan `Range` tiklanadi. Attempt'da saqlanadi, refresh'dan keyin tiklanadi.

**Brauzer kontekst menyusini bloklash:** faqat passage paneli ichida (`onContextMenu={e => e.preventDefault()}`), boshqa joyda emas.

### 6.4 Savol turlari — Reading render qoidalari

| Tur | Render |
|---|---|
| `true_false_notgiven` | Radio guruh, gorizontal: `TRUE / FALSE / NOT GIVEN`. Matn CAPS. |
| `yes_no_notgiven` | Xuddi shunday: `YES / NO / NOT GIVEN` |
| `multiple_choice_single` | Radio, vertikal, A–D harflari bilan |
| `multiple_choice_multi` | Checkbox. `selectCount` ga yetganda qolganlari `disabled`. Yuqorida: `2 tadan 1 ta tanlangan` |
| `matching_headings` | Har savol yonida `<select>` (rim raqamlari i–x). Yuqorida sarlavhalar ro'yxati sticky blokda. |
| `matching_information` | `<select>` yoki matn input (A–H harfi). Bitta harf bir necha marta ishlatilishi mumkin — `bankReusable: true` |
| `matching_features` | `<select>` variantlar bankidan |
| `matching_sentence_endings` | Chap: gap boshi, o'ng: `<select>` A–G |
| `sentence_completion` | Gap ichida inline input: `In 1932, the factory produced ____.` |
| `summary_completion` | Xuddi shunday, lekin abzats ichida bir nechta input |
| `summary_completion_bank` | Drag-drop yoki `<select>`. **Tavsiya: `<select>` + drag-drop ikkalasi ham.** Mobil'da drag-drop ishlamaydi. |
| `short_answer` | Bitta qatorli input |
| `table_completion` | HTML jadval, `{{q14}}` placeholder'lari input'ga almashadi |
| `flowchart_completion` | Vertikal oqim, qutilar orasida ↓, ichida input |
| `diagram_label` | Rasm + absolyut joylashgan input'lar (`imageHotspots` koordinatalari bo'yicha, foizda) |

### 6.5 Inline input dizayni

```css
.exam-gap {
  display: inline-block;
  min-width: 130px;
  border: none;
  border-bottom: 1.5px solid var(--exam-input-border);
  background: transparent;
  font: inherit;
  padding: 2px 4px;
  text-align: center;
}
.exam-gap:focus { outline: none; border-bottom-color: var(--exam-accent); box-shadow: 0 2px 0 0 var(--exam-accent); }
.exam-gap[data-answered="true"] { border-bottom-color: var(--exam-accent); }
```

Har input oldida kichik raqam belgisi: `⌜14⌟` yoki `14` superscript.

**Word limit real-time indikatori:** agar `wordLimit.maxWords = 2` va foydalanuvchi 3 so'z yozsa — input ostida kichik qizil matn: `Ko'pi bilan 2 ta so'z`. **Yozishni to'xtatmaydi** (haqiqiy imtihonda ham to'xtatmaydi), faqat ogohlantiradi.

---

## 7. Listening moduli

### 7.1 Audio dvigatel — eng nozik qism

```ts
// AudioEngine qoidalari (exam rejim)
- <audio> elementi yashirin, native controls YO'Q
- preload="auto", har part oldindan yuklanadi
- Faqat volume boshqariladi
- seek BLOKLANADI:
    audio.onseeking = () => { if (examMode) audio.currentTime = lastKnownTime; }
- pause BLOKLANADI (foydalanuvchi tomonidan)
- Part tugagach avtomatik keyingi partga o'tadi
- Har 15s heartbeat bilan positionSec serverga yoziladi
- Refresh qilinsa: server positionSec dan davom etadi, boshidan EMAS
- playedParts[] ga qo'shilgan part qayta tinglanmaydi
```

**Brauzer autoplay muammosi:** audio foydalanuvchi bosishisiz boshlanmaydi. Shuning uchun majburiy **Volume Check** ekrani.

### 7.2 Volume Check ekrani (imtihondan oldin)

```
┌─────────────────────────────────────────┐
│         🎧 Ovozni tekshirish             │
│                                         │
│  Naushnik taqing va quyidagi tugmani    │
│  bosib ovoz balandligini sozlang.       │
│                                         │
│         [ ▶ Sinov ovozini eshitish ]    │
│                                         │
│  🔊 ────────●──────────                 │
│                                         │
│  ☑ Ovozni eshitdim va tayyorman         │
│                                         │
│         [ Imtihonni boshlash ]          │
└─────────────────────────────────────────┘
```

Bu ekran `audio.play()` uchun user gesture beradi va real IELTS'dagi qadamni takrorlaydi.

### 7.3 Ekran tartibi

Listening'da split-pane **yo'q**. Faqat savollar paneli, markazda, `max-width: 860px`.

```
┌──────────────────────────────────────────────────────────┐
│ Part 1                        ▮▮▮▮▮▯▯▯▯▯ 2:14 / 5:30    │  ← progress, bosilmaydi
├──────────────────────────────────────────────────────────┤
│ Questions 1–5                                            │
│ Complete the form below. Write ONE WORD AND/OR A NUMBER. │
│                                                          │
│         HOLIDAY BOOKING FORM                             │
│  Name:          ______1______                            │
│  Date:          ______2______                            │
└──────────────────────────────────────────────────────────┘
```

Progress bar: 4px balandlik, `pointer-events: none`, `--exam-accent` rangida to'ladi.

### 7.4 Part o'tishlari

Haqiqiy IELTS'da part orasida audio ichida "You now have thirty seconds to check your answers" deb aytiladi. Sizda audio faylda shu pauza bo'lishi kerak. Agar yo'q bo'lsa:

- `ListeningPart.gapAfterSec: 30` maydonini qo'shing
- Part tugagach 30s sanoq ko'rsatiladi: `Javoblaringizni tekshiring — 0:28`
- Keyin avtomatik keyingi partga o'tadi va savollar paneli almashadi

### 7.5 Oxirgi 2 daqiqa

Audio tugagach: `Endi javoblaringizni tekshirish uchun 2 daqiqa vaqtingiz bor.` Taymer 02:00 dan sanaydi, keyin avtomatik submit.

> Eslatma: 2023-dan boshlab CD IELTS'da 10 daqiqalik "transfer time" yo'q, faqat 2 daqiqa tekshirish. Buni to'g'ri qiling.

### 7.6 Map / plan labelling

```ts
interface Hotspot {
  questionNumber: number;
  x: number;  // 0–100 (%)
  y: number;  // 0–100 (%)
}
```

- Rasm `position: relative` konteynerda, hotspot'lar `position: absolute; left: x%; top: y%`.
- Har hotspot: kichik input yoki drop zone (variantlar bankidan drag).
- **Mobil**: drag-drop o'rniga tap → bottom sheet'dan variant tanlash.
- Rasm zoom: pinch-to-zoom va `+`/`−` tugmalari (haqiqiy IELTS'da rasmni kattalashtirish mumkin).

### 7.7 Practice rejim farqlari

| Xususiyat | Exam | Practice |
|---|---|---|
| Pauza | ❌ | ✅ |
| Orqaga/oldinga | ❌ | ✅ (±10s) |
| Tezlik | 1.0x qat'iy | 0.75x / 1.0x / 1.25x |
| Qayta tinglash | ❌ | ✅ cheksiz |
| Transkript | ❌ | ✅ tugagandan keyin, matnda javob joyi ajratilgan |
| Darhol javob tekshirish | ❌ | ✅ opsiya |

---

## 8. Writing moduli

### 8.1 Ekran tartibi

```
┌───────────────────────────┬┬───────────────────────────┐
│ WRITING TASK 1            ││ [✂ Kesish][⧉ Nusxa][📋 Qo'y]│
│                           ││ ┌───────────────────────┐ │
│ The chart below shows...  ││ │                       │ │
│ [grafik rasmi]            ││ │  (foydalanuvchi       │ │
│                           ││ │   yozadi)             │ │
│ Write at least 150 words. ││ │                       │ │
│                           ││ └───────────────────────┘ │
│                           ││ So'zlar: 187              │
└───────────────────────────┴┴───────────────────────────┘
```

Divider Reading bilan bir xil komponent, `localStorage['exam.split.writing']`.

### 8.2 Editor talablari

```jsx
<textarea
  spellCheck={false}
  autoCorrect="off"
  autoCapitalize="off"
  autoComplete="off"
  data-gramm="false"          // Grammarly extensionni bloklash
  data-gramm_editor="false"
  data-enable-grammarly="false"
/>
```

- **Spellcheck qat'iy o'chirilgan** — haqiqiy imtihonda yo'q. Bu kelishuvsiz talab.
- Grammarly kabi extension'lar `data-gramm="false"` bilan bloklanadi (100% kafolat emas, lekin ko'pchiligini to'xtatadi).
- Shrift: `16px / 1.7`, `padding: 20px`, `resize: none`, panel to'liq balandligi.
- `Ctrl+Z`/`Ctrl+Y` native ishlaydi.
- Kesish/Nusxa/Qo'yish tugmalari — real IELTS'da bor, `document.execCommand` yoki `navigator.clipboard` bilan.
- **Task promptidan nusxa olish bloklanadi** (`onCopy → preventDefault` chap panelda).

### 8.3 So'z hisoblagich

```ts
const countWords = (t: string) =>
  t.trim().split(/\s+/).filter(w => /[a-zA-Z0-9]/.test(w)).length;
```

- 200ms debounce.
- Ko'rinish: `So'zlar: 187`
- `< minWords` bo'lsa: `--exam-muted` rangda + `(kamida 150)` qo'shimchasi
- `>= minWords` bo'lsa: `--exam-accent` rangda, ✓ belgisi bilan
- Haqiqiy IELTS'da so'z soni **hisoblanadi va ko'rsatiladi** — buni saqlang.

### 8.4 Task 1 ↔ Task 2 almashish

Footer'da ikkita katta tugma: `Task 1` va `Task 2`. Bitta 60-daqiqalik taymer ikkalasiga umumiy. Har taskda alohida tavsiya: `Tavsiya etilgan vaqt: 20 daqiqa`. Foydalanuvchi ixtiyoriy ravishda almashadi — cheklov yo'q (haqiqiy imtihonda ham shunday).

### 8.5 AI baholash

Everest-Mock'dagi grader'ni qayta ishlating. Talablar:

**Prompt strukturasi:**
```
Rol: Tajribali IELTS examiner (Cambridge rubrikasi).
Kirish: task turi, prompt, minWords, foydalanuvchi matni, so'z soni.
Chiqish: qat'iy JSON (preamble yo'q, ```json yo'q).
```

**JSON sxemasi:**
```json
{
  "taskAchievement": 6.5,
  "coherenceCohesion": 6.0,
  "lexicalResource": 6.5,
  "grammaticalRange": 6.0,
  "band": 6.5,
  "feedbackUz": "O'zbek tilida 3–5 jumlalik umumiy tahlil",
  "criteriaFeedbackUz": {
    "taskAchievement": "...",
    "coherenceCohesion": "...",
    "lexicalResource": "...",
    "grammaticalRange": "..."
  },
  "corrections": [
    { "original": "...", "suggested": "...", "reason": "O'zbekcha izoh" }
  ],
  "improvedVersion": "Band 7.5 darajasidagi qayta yozilgan variant"
}
```

**Muhim qoidalar:**
- Har mezon **0.5 qadamda**, 0–9.
- `band` = 4 mezon o'rtachasi, eng yaqin 0.5 ga yaxlitlangan.
- `minWords`dan kam bo'lsa TA/TR jarimasi qo'llanadi — promptda buni aniq yozing.
- Baholash **navbatda** (queue) ishlaydi: `POST /grade-writing` → `{jobId}` → klient 2s polling. Vercel serverless timeout muammosini oldini oladi.
- Natija `Attempt.result.writing` ga yoziladi va keshlanadi — bir matn ikki marta baholanmaydi.

**Natija ko'rsatish:** matn chapda, tuzatishlar o'ngda; tuzatilgan joylar matn ichida `<mark>` bilan belgilanadi, bosilganda o'ngdagi izoh highlight bo'ladi.

---

## 9. Mock — to'liq imtihon orkestratsiyasi

### 9.1 Oqim

```
Intro ekrani
  ↓ [Boshlash]
Volume check (Listening uchun)
  ↓
LISTENING — 30 daqiqa + 2 daqiqa
  ↓ avtomatik
"Listening tugadi" ekrani (10s sanoq)
  ↓
READING — 60 daqiqa
  ↓ avtomatik
"Reading tugadi" ekrani (10s)
  ↓
WRITING — 60 daqiqa
  ↓ avtomatik
Yakuniy submit → baholash → natija
```

**Qoidalar:**
- Bo'limlar orasida **orqaga qaytish yo'q**. `POST /section/next` bir tomonlama.
- Real imtihonda tanaffus yo'q — shuning uchun 10 soniyalik o'tish ekrani, uzoq tanaffus emas.
- Speaking alohida (Faza 3), mock natijasiga `null` sifatida kiradi.
- Foydalanuvchi brauzerni yopsa: `status` `in_progress` qoladi, qayta kirganda **qolgan vaqt bilan** davom etadi. Vaqt tugagan bo'lsa → avtomatik `expired` + qisman baholash.

### 9.2 Intro ekrani (bu yerda premium dizayn qiling)

```
┌────────────────────────────────────────────┐
│  Cambridge IELTS 19 — Test 1               │
│  Academic                                  │
│                                            │
│  📋 Listening   30 daq   40 savol         │
│  📖 Reading     60 daq   40 savol         │
│  ✍  Writing     60 daq   2 task           │
│  ─────────────────────────────            │
│  Jami: 2 soat 30 daqiqa                   │
│                                            │
│  ⚠ Boshlangandan keyin taymer to'xtamaydi.│
│  ⚠ Bo'limlar orasida orqaga qaytib        │
│     bo'lmaydi.                             │
│  ⚠ Naushnik tayyorlang.                   │
│                                            │
│  [ Imtihonni boshlash ]                    │
└────────────────────────────────────────────┘
```

### 9.3 Yakunlash tasdiqlash

```
Yakunlashni xohlaysizmi?
Javobsiz savollar: 4 ta  (12, 19, 27, 38)
[Orqaga qaytish]  [Ha, yakunlash]
```

---

## 10. Baholash mantig'i

### 10.1 Javob tekshirish — bu joyni to'g'ri qiling

Aksariyat klon-platformalar shu yerda xato qiladi.

```ts
function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")      // aqlli apostrof → oddiy
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')                  // ko'p probel → bitta
    .replace(/[.,;:!?]+$/g, '');           // oxirgi tinish belgisi
}

function isCorrect(user: string, key: AnswerKey, limit?: WordLimit): boolean {
  if (!user) return false;
  const u = normalize(user);

  // 1. So'z limiti tekshiruvi
  if (limit) {
    const words = u.split(' ').filter(Boolean);
    if (words.length > limit.maxWords) return false;
  }

  // 2. Qabul qilinadigan javoblar
  for (const raw of key.accepted) {
    // "(the) museum" → ["museum", "the museum"]
    for (const variant of expandOptional(raw)) {
      if (u === normalize(variant)) return true;
    }
  }

  // 3. Regex (murakkab holatlar)
  if (key.pattern && new RegExp(`^${key.pattern}$`, 'i').test(u)) return true;

  return false;
}

function expandOptional(s: string): string[] {
  // "(the) old museum" → ["old museum", "the old museum"]
  const m = s.match(/\(([^)]+)\)/);
  if (!m) return [s];
  const without = s.replace(/\s*\([^)]+\)\s*/, ' ').trim();
  const with_ = s.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  return [without, with_];
}
```

**Qo'shimcha qoidalar:**
- Ko'p javobli MC (`multiple_choice_multi`): tartibsiz to'plam solishtiruvi. `["A","C"]` va `["C","A"]` — ikkalasi to'g'ri. Qisman ball **yo'q** (IELTS'da 2 tadan 1 tasi to'g'ri = 0).
  - ⚠️ Istisno: agar "Choose TWO letters" savoli 2 ta savol raqamini egallasa (masalan 15 va 16), unda har to'g'ri harf 1 ball.
- Amerikacha/inglizcha imlo: `accepted` ga ikkalasini kiriting (`colour|color`). Avtomatik konvertatsiya qilmang — xato beradi.
- Raqamlar: `20` va `twenty` — ikkalasi accepted'da bo'lsa qabul qilinadi. Avtomatik emas.
- Defis bilan yozilgan so'z (`well-known`) = 1 ta so'z.
- Bo'sh javob = 0, minus ball yo'q.

### 10.2 Band konversiya jadvallari

> Bu jadvallar Cambridge namunalariga yaqin taxminiy qiymatlar. Rasmiy jadval har test uchun biroz farq qiladi. Kodda `bandTable` ni **testga bog'lab** saqlang (`Test.bandTable?`), default jadval bilan.

**Listening (ikkala modul uchun):**

| Xom ball | Band |
|---|---|
| 39–40 | 9.0 |
| 37–38 | 8.5 |
| 35–36 | 8.0 |
| 32–34 | 7.5 |
| 30–31 | 7.0 |
| 26–29 | 6.5 |
| 23–25 | 6.0 |
| 18–22 | 5.5 |
| 16–17 | 5.0 |
| 13–15 | 4.5 |
| 10–12 | 4.0 |
| 6–9 | 3.5 |
| 4–5 | 3.0 |

**Academic Reading:**

| Xom ball | Band |
|---|---|
| 39–40 | 9.0 |
| 37–38 | 8.5 |
| 35–36 | 8.0 |
| 33–34 | 7.5 |
| 30–32 | 7.0 |
| 27–29 | 6.5 |
| 23–26 | 6.0 |
| 19–22 | 5.5 |
| 15–18 | 5.0 |
| 13–14 | 4.5 |
| 10–12 | 4.0 |
| 8–9 | 3.5 |
| 6–7 | 3.0 |

**General Training Reading:**

| Xom ball | Band |
|---|---|
| 40 | 9.0 |
| 39 | 8.5 |
| 37–38 | 8.0 |
| 36 | 7.5 |
| 34–35 | 7.0 |
| 32–33 | 6.5 |
| 30–31 | 6.0 |
| 27–29 | 5.5 |
| 23–26 | 5.0 |
| 19–22 | 4.5 |
| 15–18 | 4.0 |

### 10.3 Umumiy band

```ts
function overallBand(l: number, r: number, w: number, s?: number): number {
  const scores = [l, r, w, s].filter((x): x is number => x != null);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  // IELTS yaxlitlash: .25 → .5 ga, .75 → keyingi butunga
  const floor = Math.floor(avg);
  const frac = avg - floor;
  if (frac < 0.25) return floor;
  if (frac < 0.75) return floor + 0.5;
  return floor + 1;
}
```

Agar Speaking topshirilmagan bo'lsa — 3 ta bo'lim o'rtachasi, va natijada aniq yozing: `Speaking topshirilmagan — bu taxminiy ball`.

---

## 11. Natija va Review ekrani

**Bu yerda premium dizayn qiling** — imtihon tugadi, endi cheklov yo'q.

### 11.1 Natija ekrani tuzilishi

```
1. Katta umumiy band (masalan 6.5) + halqa/gradient vizual
2. 4 ta bo'lim kartochkasi: band + xom ball + vaqt
3. Bar chart: bo'limlar taqqoslash
4. Oldingi urinishlar bilan solishtirish (line chart)
5. "Zaif tomonlar" bloki — savol turlari bo'yicha to'g'ri % 
   (masalan: "True/False/Not Given — 40%. Bu sizning eng zaif turingiz.")
6. [Javoblarni ko'rib chiqish] tugmasi
7. [Xatolardagi so'zlarni lug'atga qo'shish] ← Vocably'ning kuchli tomoni, buni albatta qiling
```

### 11.2 Review ekrani

Imtihon shell'ining o'zi, lekin:
- Taymer yo'q, o'rniga `Ko'rib chiqish rejimi`
- Har savol yonida: ✅ / ❌ / ⚪ (javobsiz)
- Foydalanuvchi javobi + to'g'ri javob(lar) ko'rsatiladi
- `explanationHtml` izoh bloki ochiladi
- `locatorParagraph` bo'lsa — passage panelida shu paragraf `--exam-highlight` bilan yoritiladi va unga scroll qilinadi
- Listening'da transkript ko'rsatiladi, javob joyi ajratilgan
- Bo'limlar va savol turlari bo'yicha filtr: `Faqat xatolar` / `Faqat TFNG`

### 11.3 Vocably bog'lanishi (raqobat ustunligi)

Natija ekranida:
- Matnda uchragan qiyin so'zlarni ajratib, `Lug'atga qo'shish` tugmasi
- Qo'shilgan so'zlar SRS tizimiga tushadi va 24 soatdan keyin kartochkada chiqadi
- Bu sizning landing page'dagi "so'z → ko'nikma zanjiri" va'dasini yopadi

---

## 12. Mobil va responsive

Haqiqatni aytish kerak: **haqiqiy IELTS CD telefonda topshirilmaydi.** Split-pane 375px ekranda ishlamaydi. Shuning uchun mobil = **mashq rejimi**, imtihon simulyatsiyasi emas.

### 12.1 Breakpointlar

| Kenglik | Tartib |
|---|---|
| `≥1280px` | To'liq split-pane, footer'da 40 tugma bir qatorda |
| `1024–1279px` | Split-pane, footer scroll qiladi |
| `768–1023px` | Split-pane 60/40, matn 15px |
| `<768px` | **Tab rejimi** |

### 12.2 Mobil tab rejimi

```
┌─────────────────────────┐
│ ⏱ 42:17         ⚙  ?   │
├─────────────────────────┤
│ [  Matn  ][ Savollar ●] │  ← segmented control, sticky
├─────────────────────────┤
│                         │
│   (faol tab kontenti)   │
│                         │
├─────────────────────────┤
│  ←   Savol 14/40   →    │  ← bosilsa bottom sheet ochiladi
└─────────────────────────┘
```

- Tab'lar orasida **swipe** ishlaydi.
- Savol raqamlari bottom sheet'da 5×8 grid.
- Klaviatura ochilganda: `visualViewport` API bilan faol input ko'rinib turishini ta'minlang.
- Barcha bosiladigan elementlar `min-height: 44px`.
- `viewport-fit=cover` + `env(safe-area-inset-bottom)` — iPhone uchun.
- Listening'da: `Media Session API` bilan lock screen'da audio davom etadi, lekin ogohlantirish ko'rsating: `Ekranni o'chirmang`.

### 12.3 Mobil uchun bloklanadigan narsalar

- Mock rejimi telefonda: **ruxsat bering, lekin ogohlantiring** — `Eng yaxshi tajriba uchun kompyuterdan foydalaning`. Bloklamang; Uzbekistonda ko'p foydalanuvchi faqat telefonda.
- Drag-drop savollari → tap-to-select fallback.

---

## 13. Accessibility (A11y)

| Talab | Amalga oshirish |
|---|---|
| Kontrast | Barcha matn ≥ 4.5:1. `--exam-muted` (#6B6B6B) oq fonda = 5.7:1 ✅ |
| Focus | `:focus-visible` ring hech qachon olib tashlanmaydi |
| Klaviatura | Butun imtihon sichqonchasiz o'tilishi kerak |
| Label | Har input `aria-label="Savol 14 javobi"` |
| Taymer | `role="timer" aria-live="polite"`, faqat 10/5/1 daqiqada e'lon qiladi (har soniyada emas) |
| Rasm | `imageAlt` majburiy, bo'sh bo'lsa admin saqlay olmaydi |
| Motion | `@media (prefers-reduced-motion: reduce)` — pulsatsiya va o'tishlar o'chadi |
| Divider | `role="separator" aria-orientation="vertical" aria-valuenow={pct}` |
| Skip link | `Asosiy kontentga o'tish` |

---

## 14. Yaxlitlik (integrity)

Halol bo'laylik: brauzerda to'liq nazorat **imkonsiz**. Maqsad — tasodifiy aldashni qiyinlashtirish, professional aldovni to'xtatish emas.

**Qiladigan narsalar:**
- To'g'ri javoblar mijozga yuborilmaydi (§4.1) — **bu eng muhimi**
- Taymer serverda
- `visibilitychange` → hodisa logi + hisoblagich
  - 1-marta: ogohlantirish toast
  - 3+: natijada belgi `Tab 5 marta almashtirildi`
- Mock boshlanganda `requestFullscreen()` (majburiy emas, taklif)
- Passage matnidan nusxa olish bloklanadi (mock'da)
- O'ng tugma passage'da faqat highlight menyusi
- Listening audio pozitsiyasi serverda — refresh bilan qayta tinglab bo'lmaydi

**Qilmaydigan narsalar** (vaqt behuda):
- DevTools bloklash — aylanib o'tiladi
- Screenshot bloklash — imkonsiz
- Sichqoncha nazorati

---

## 15. Admin — kontent kiritish

Bu qismni yaxshi qilmasangiz, tizim bo'sh qoladi. Test kiritish **soatlar emas, daqiqalar** olishi kerak.

### 15.1 Uch xil kiritish yo'li

1. **JSON import** — `Test` sxemasi bo'yicha fayl yuklash. Validatsiya + xato ko'rsatish.
2. **Markdown-ga o'xshash DSL** — tezkor yozish uchun:

```
## PASSAGE 1
### The history of glass

[A] Glass has been used by humans...
[B] From the Middle Ages...

## QUESTIONS 1-6
type: true_false_notgiven
instruction: Do the following statements agree with the information given in Reading Passage 1?

1. Glass was first made in Mesopotamia. | TRUE | para:A
2. The Romans invented glassblowing. | NOT GIVEN
```

3. **AI yordamchi** — xom matn + javob kalitini joylashtiradi, AI `Test` JSON'ini generatsiya qiladi. Admin ko'rib chiqadi va tasdiqlaydi. Bu eng tez yo'l, lekin **tekshiruvsiz publish qilmang**.

### 15.2 Admin talablari

- **Preview rejimi** — testni foydalanuvchi ko'rgandek ko'rish, javoblar bilan
- **Validator** — publish qilishdan oldin tekshiradi:
  - Savol raqamlari 1–40, uzilishsiz
  - Har savolda kamida 1 ta `accepted` javob
  - Barcha rasmlarda `imageAlt`
  - Audio fayl mavjud va davomiyligi mos
  - `matching_headings` uchun `bank` to'ldirilgan
- **Statistika** — har savol bo'yicha to'g'ri javob %. 95% dan yuqori yoki 10% dan past bo'lsa — savol shubhali, belgilanadi.

---

## 16. Fayl strukturasi (Next.js App Router)

```
src/
├── app/
│   └── app/
│       ├── mock/
│       │   ├── page.tsx                  # testlar ro'yxati
│       │   └── [attemptId]/page.tsx      # ExamShell
│       ├── oqish/[attemptId]/page.tsx
│       ├── tinglash/[attemptId]/page.tsx
│       ├── yozish/[attemptId]/page.tsx
│       └── natija/[attemptId]/page.tsx
│
├── features/exam/
│   ├── shell/
│   │   ├── ExamShell.tsx
│   │   ├── ExamHeader.tsx
│   │   ├── ExamFooterNav.tsx
│   │   ├── ExamTimer.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── HelpDialog.tsx
│   │   └── SectionTransition.tsx
│   ├── split/
│   │   ├── SplitPane.tsx
│   │   └── Divider.tsx
│   ├── reading/
│   │   ├── ReadingSection.tsx
│   │   ├── PassagePane.tsx
│   │   ├── ParagraphLabel.tsx
│   │   └── highlight/
│   │       ├── HighlightLayer.tsx
│   │       ├── useHighlights.ts
│   │       └── rangeSerializer.ts
│   ├── listening/
│   │   ├── ListeningSection.tsx
│   │   ├── AudioEngine.tsx
│   │   ├── VolumeCheck.tsx
│   │   ├── AudioProgress.tsx
│   │   └── PartGap.tsx
│   ├── writing/
│   │   ├── WritingSection.tsx
│   │   ├── TaskPane.tsx
│   │   ├── EssayEditor.tsx
│   │   ├── WordCounter.tsx
│   │   └── EditorToolbar.tsx
│   ├── questions/
│   │   ├── QuestionRenderer.tsx          # tur → komponent xaritasi
│   │   ├── QuestionGroupBlock.tsx
│   │   ├── InstructionBlock.tsx
│   │   ├── GapInput.tsx
│   │   └── types/
│   │       ├── MultipleChoice.tsx
│   │       ├── TrueFalseNotGiven.tsx
│   │       ├── MatchingHeadings.tsx
│   │       ├── MatchingFeatures.tsx
│   │       ├── SentenceCompletion.tsx
│   │       ├── SummaryCompletion.tsx
│   │       ├── TableCompletion.tsx
│   │       ├── FlowchartCompletion.tsx
│   │       ├── FormCompletion.tsx
│   │       ├── ShortAnswer.tsx
│   │       ├── DiagramLabel.tsx
│   │       └── MapLabel.tsx
│   ├── state/
│   │   ├── examStore.ts                  # zustand
│   │   ├── useExamTimer.ts
│   │   ├── useAutosave.ts
│   │   └── useKeyboardNav.ts
│   └── review/
│       ├── ReviewShell.tsx
│       └── QuestionResult.tsx
│
├── lib/exam/
│   ├── sanitize.ts                       # javoblarni olib tashlash
│   ├── scoring.ts                        # isCorrect, normalize, expandOptional
│   ├── bandTables.ts
│   └── wordCount.ts
│
└── app/api/exam/...
```

---

## 17. State (zustand)

```ts
interface ExamStore {
  attemptId: string;
  mode: 'exam' | 'practice' | 'review';
  section: 'listening' | 'reading' | 'writing';

  answers: Record<string, AnswerValue>;
  flagged: Set<number>;
  currentQuestion: number;

  // Taymer
  endsAt: number;
  serverOffset: number;
  remainingSec: number;
  timerHidden: boolean;

  // UI
  fontSize: 16 | 18 | 20 | 22;
  highContrast: boolean;
  splitRatio: number;

  // Saqlash
  saveStatus: 'saved' | 'saving' | 'error';
  dirtyKeys: Set<string>;

  setAnswer: (qNum: number, value: AnswerValue) => void;
  toggleFlag: (qNum: number) => void;
  goToQuestion: (qNum: number) => void;
  syncNow: () => Promise<void>;
}
```

**Muhim:** `answers` obyekt — `setAnswer` faqat shu kalitni yangilaydi, butun obyektni qayta yaratmaydi. 40 ta input bor, har bosishda hamma render bo'lsa sekinlashadi. Har savol komponenti `useExamStore(s => s.answers[key])` selektor bilan obuna bo'ladi.

---

## 18. Qabul qilish mezonlari (acceptance checklist)

### Umumiy shell
- [ ] Bitta `ExamShell` 4 sahifada ham ishlaydi
- [ ] Taymer server bilan sinxron, drift ≤3s
- [ ] Refresh'dan keyin javoblar, vaqt, audio pozitsiyasi tiklanadi
- [ ] Vaqt tugaganda avtomatik submit (klient yopiq bo'lsa ham server bajaradi)
- [ ] 10/5/1 daqiqa ogohlantirishlari ishlaydi
- [ ] Sozlamalar (matn o'lchami, kontrast) saqlanadi
- [ ] Javob berilgan/belgilangan/joriy savol footer'da to'g'ri ko'rinadi
- [ ] Klaviatura bilan to'liq navigatsiya

### Reading
- [ ] Split-pane ikki panel **mustaqil** scroll qiladi
- [ ] Divider sudraladi, 30–70% chegarada, double-click reset
- [ ] Nisbat localStorage'da saqlanadi
- [ ] Savol raqamiga bosganda **faqat** savol paneli siljiydi
- [ ] Paragraf yorliqlari (A, B, C) to'g'ri chiqadi
- [ ] Highlight ishlaydi va refresh'dan keyin tiklanadi
- [ ] 16 ta savol turining hammasi render bo'ladi

### Listening
- [ ] Volume check ekrani autoplay muammosini hal qiladi
- [ ] Audio orqaga surilmaydi (seek bloklangan)
- [ ] Pauza qilib bo'lmaydi (exam rejimda)
- [ ] Part avtomatik almashadi va savollar paneli yangilanadi
- [ ] Refresh → audio server pozitsiyasidan davom etadi
- [ ] Oxirida 2 daqiqa tekshirish vaqti
- [ ] Map/diagram savollari rasm ustida to'g'ri joylashadi
- [ ] Practice'da tezlik, pauza, transkript ishlaydi

### Writing
- [ ] Spellcheck o'chirilgan, Grammarly bloklangan
- [ ] So'z hisoblagich real vaqtda, to'g'ri hisoblaydi
- [ ] Task 1/2 almashadi, ikkalasi ham saqlanadi
- [ ] Task promptidan nusxa olib bo'lmaydi
- [ ] AI baholash JSON qaytaradi va parse bo'ladi
- [ ] Baholash navbatda ishlaydi, timeout bo'lmaydi

### Baholash
- [ ] `normalize()` katta/kichik harf, probel, apostrofni to'g'ri ishlaydi
- [ ] `(the) museum` ikkala variantni qabul qiladi
- [ ] So'z limitidan oshgan javob noto'g'ri sanaladi
- [ ] Band jadvallari to'g'ri qo'llanadi
- [ ] Umumiy band IELTS qoidasi bo'yicha yaxlitlanadi

### Xavfsizlik
- [ ] `GET /attempts/:id` javobida **hech qanday to'g'ri javob yo'q** (Network tab'da tekshiring)
- [ ] Transkript va sample answer exam rejimda yuborilmaydi
- [ ] Tab almashish loglanadi

### Mobil
- [ ] <768px da tab rejimi ishlaydi, swipe bilan
- [ ] Klaviatura input'ni yopib qo'ymaydi
- [ ] Barcha tugmalar ≥44px
- [ ] Safe area hisobga olingan

---

## 19. Fazalar

### Faza 1 — Poydevor (eng muhim)
1. `Test` / `Attempt` sxemalari + MongoDB indekslari
2. `sanitize.ts` — javoblarni olib tashlash
3. Backend: attempts CRUD + heartbeat + submit
4. `ExamShell` + `ExamHeader` + `ExamFooterNav` + `useExamTimer` + `useAutosave`
5. `SplitPane` + `Divider`
6. `QuestionRenderer` + 6 ta eng ko'p ishlatiladigan tur (TFNG, MC single, sentence/summary/note completion, matching_headings, short_answer, table)
7. `ReadingSection` to'liq
8. `scoring.ts` + band jadvallari
9. Natija ekrani (oddiy)

**Natija:** `/app/oqish` yangi engine'da to'liq ishlaydi.

### Faza 2 — Listening + Writing
10. `AudioEngine` + `VolumeCheck` + part o'tishlari
11. Qolgan savol turlari (form, map, diagram, flowchart, matching_features, sentence_endings, MC multi, YNG, matching_information, summary bank)
12. `WritingSection` + editor + word count
13. AI grader (queue + polling)
14. `/app/tinglash` va `/app/yozish` migratsiya

### Faza 3 — Mock + Review
15. Bo'lim orkestratsiyasi, intro, o'tish ekranlari
16. To'liq Review ekrani + izohlar + transkript
17. Natija analitikasi (zaif savol turlari, progress chart)
18. Lug'atga so'z qo'shish integratsiyasi
19. Highlight & notes

### Faza 4 — Sayqal
20. Mobil tab rejimi
21. Admin kontent kiritish (DSL + AI import + validator)
22. A11y audit
23. Speaking moduli

---

## 20. Migratsiya qanday qilinadi

Mavjud sahifalarni **bir vaqtda** almashtirmang.

1. Yangi engine `/app/oqish-beta` da qurib chiqing
2. `?engine=v2` flag bilan eski/yangi orasida almashish
3. Bitta passage'ni yangi formatga o'tkazib, 10 ta foydalanuvchida sinang
4. Ishonch hosil bo'lgach `/app/oqish` ni almashtiring, eski kodni **o'chiring** (`-old` qoldirmang)
5. Listening va Writing uchun takrorlang

Eski kontent migratsiyasi uchun bir martalik skript: eski format → yangi `Test` sxemasi. Skriptni yozishdan oldin eski ma'lumotlarni eksport qilib oling.

---

## 21. Nimaga e'tibor bermaslik kerak (scope ichida emas)

- Speaking AI baholash — Faza 3
- Real-time multiplayer (do'stlar bilan birga imtihon) — keyinroq
- Offline rejim — PWA cache murakkab, hozir shart emas
- Imtihon video-proctoring — talab yo'q
- Dark mode imtihon ekranida — ataylab yo'q

---

## 22. Claude Code uchun boshlang'ich prompt

```
Vocably (Next.js App Router + MongoDB) uchun IELTS CD exam engine quryapmiz.
To'liq TZ: docs/vocably-exam-engine-tz.md

FAZA 1 boshlaymiz. Tartib:

1. src/lib/exam/types.ts — TZ §3 dagi barcha interfeyslar
2. src/lib/exam/sanitize.ts — Test obyektidan answer, explanationHtml,
   locatorParagraph, transcript, sampleAnswer, markingNotes ni rekursiv o'chiradi.
   Bu funksiya uchun test yozing.
3. src/lib/exam/scoring.ts — normalize, expandOptional, isCorrect, bandTables.
   TZ §10.1 va §10.2 ga qat'iy amal qiling. Unit testlar bilan.
4. API route'lar: app/api/exam/attempts/... (TZ §4 jadvali)
5. features/exam/state/examStore.ts (zustand) + useExamTimer + useAutosave

Har qadamdan keyin to'xtang va ko'rsating. Birdaniga hammasini yozmang.

Muhim cheklovlar:
- Exam ekranida Deep Merlot faqat aksent sifatida. Fon oq, chrome kulrang.
- Taymer serverda, klient faqat ko'rsatadi.
- To'g'ri javoblar exam rejimda mijozga HECH QACHON yuborilmaydi.
- Har savol komponenti zustand selektor bilan obuna bo'ladi, butun store'ga emas.
```

---

## 23. Ochiq savollar (javob bering, TZ yangilanadi)

1. Audio fayllar qayerda saqlanadi? (Vercel Blob / S3 / Cloudflare R2). Listening uchun CDN kerak — Uzbekistondan tezlik muhim.
2. Mavjud `/app/oqish` kontenti qanday formatda? Migratsiya skripti uchun kerak.
3. AI grader qaysi modelda ishlaydi va byudjet cheklovi bormi?
4. Foydalanuvchi bir vaqtda nechta faol attempt'ga ega bo'la oladi? (Tavsiya: bitta mock + bo'limlar alohida)
5. General Training modulini qo'shasizmi yoki faqat Academic?