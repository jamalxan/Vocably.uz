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
