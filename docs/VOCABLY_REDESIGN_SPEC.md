# VOCABLY — To'liq audit, redizayn va kengaytirish spetsifikatsiyasi

> **Bu fayl Claude Code uchun ishchi topshiriq.** Uni loyiha ildiziga `docs/VOCABLY_REDESIGN_SPEC.md` nomi bilan qo'y va bosqichma-bosqich bajar.
>
> **Muhim ogohlantirish:** bu spetsifikatsiya sayt tashqarisidan (login sahifasi + skrinshotlar) tuzilgan. Kod bazasiga kirish yo'q edi. Shuning uchun **FAZA 0 (audit)** majburiy: har bir taxminni real kodga solishtir, mos kelmasa — spec emas, kod haqiqat. Nomuvofiqliklarni `docs/AUDIT_FINDINGS.md` ga yoz.

---

## 0. Claude Code uchun ish qoidalari

1. **Avval o'qi, keyin yoz.** Hech qanday fayl o'zgartirishdan oldin FAZA 0 ni to'liq bajar.
2. **Bosqichma-bosqich.** Har faza alohida branch va alohida PR: `feat/phase-1-design-system`, `feat/phase-2-navigation`, ...
3. **Buzma.** Mavjud funksionallik ishlashda davom etsin. Har fazadan keyin qo'lda smoke-test ro'yxatini bajar (14-bo'limda).
4. **Migratsiyalar orqaga qaytariladigan bo'lsin.** Har bir DB o'zgarishi uchun `up` va `down`.
5. **Katta fayllarni bo'lak.** 300 qatordan oshgan komponentni bo'lib tashla.
6. **Har fazada TODO qoldirma.** Tugallanmagan ish `docs/BACKLOG.md` ga yoziladi, kodda emas.
7. **Til:** UI matnlari — o'zbek tili (lotin). Kod, o'zgaruvchi nomlari, commit xabarlari — ingliz tili. i18n bo'lsa `uz` default, `en` va `ru` uchun struktura tayyor tursin.
8. **Har fazadan keyin** `npm run build` + lint + type-check toza o'tsin.

---

## 1. Mahsulot ta'rifi

**Vocably** — o'zbek tilida so'zlashuvchilar uchun ingliz tili so'z boyligini oshirish platformasi. Asosiy foydalanuvchi: IELTS / B1–C1 darajaga tayyorlanayotgan 16–30 yoshli o'quvchi, kuniga 10–30 daqiqa, ko'pincha telefonda, ko'pincha kechqurun.

**Mahsulotning bitta ishi:** foydalanuvchi har kuni qaytib kelib, kerakli so'zlarni kerakli vaqtda takrorlashi va ularni uzoq muddatli xotiraga o'tkazishi.

Demak mahsulotning yadrosi — **intervalli takrorlash (spaced repetition)** va **odat (streak)**. Qolgan hamma narsa shu ikkitasiga xizmat qiladi. Dizayn va statistika ham shu mantiqqa bo'ysunadi.

---

## 2. FAZA 0 — Audit va inventarizatsiya (BIRINCHI BAJARILADI)

Kod yozma. Faqat o'qi va hisobot tayyorla: `docs/AUDIT_FINDINGS.md`.

### 2.1 Texnik inventarizatsiya

Quyidagilarni aniqlab, hisobotga yoz:

- **Stack:** `package.json` / `requirements.txt` / `pyproject.toml` — framework (Next.js? Vite+React? FastAPI?), versiyalar, router turi (App Router / Pages / react-router).
- **Styling:** Tailwind bormi? CSS modules? styled-components? `tailwind.config` da qanday tokenlar bor?
- **State:** Redux / Zustand / React Query / Context — qaysi biri, qayerda.
- **Backend:** API endpointlar ro'yxati (metod + path + nima qiladi) → `docs/API_INVENTORY.md`.
- **DB sxemasi:** barcha jadvallar, ustunlar, indekslar, foreign key'lar → `docs/DB_SCHEMA.md` (ER diagramma matn ko'rinishida).
- **Auth:** JWT? session? token qayerda saqlanadi (localStorage = xavfli, httpOnly cookie bo'lishi kerak)?
- **AI:** qaysi provider (login sahifada "Gemini AI asosida ishlaydi" deb yozilgan), qaysi model, prompt'lar qayerda, rate limit bormi, xarajat kuzatilyaptimi?
- **TTS/audio:** so'z talaffuzi qayerdan keladi (Web Speech API? saqlangan mp3? tashqi API)?
- **Deploy:** qayerda hosting, CI/CD bormi, env o'zgaruvchilar qanday boshqariladi.

### 2.2 Sahifa-komponent xaritasi

Har bir route uchun: route → sahifa komponenti → ishlatadigan API'lar → asosiy bolalar komponentlari. Jadval ko'rinishida.

### 2.3 Tezkor sifat tekshiruvi

Ishga tushirib, quyidagilarni o'lchа:

| Tekshiruv | Qanday |
|---|---|
| Lighthouse (mobil) | Performance / Accessibility / Best Practices / SEO ballari |
| Bundle hajmi | `next build` yoki `vite build` chiqishi; 250 KB gzip'dan katta chunk'lar |
| Konsol xatolari | Har sahifada browser konsolini tekshir |
| Network | N+1 so'rovlar, takroriy fetch, kesh yo'qligi |
| 375px | Har sahifani 375px kenglikda och — gorizontal scroll bormi? |
| Klaviatura | Tab bilan butun sahifani aylanib chiq — focus ko'rinadimi, tuzoq bormi? |
| Kontrast | Barcha matn/fon juftliklari 4.5:1 dan past bo'lganlarini ro'yxatla |

### 2.4 Ma'lum muammolar (tekshir va tasdiqla)

Skrinshotlar va login sahifasidan aniqlangan. Har birini kodda topib, `docs/AUDIT_FINDINGS.md` da tasdiqla yoki rad et:

| # | Muammo | Tur | Jiddiylik |
|---|---|---|---|
| A1 | `<meta viewport>` da `maximum-scale=1` bor — pinch-zoom bloklangan | A11y buzilishi (WCAG 1.4.4) | **Yuqori** |
| A2 | Kategoriya boshqaruvi 3 ta alohida elementga bo'lingan: dropdown + "Kategoriyalarni boshqarish" + "Yangi kategoriya" | UX/dizayn | **Yuqori** |
| A3 | Dropdown matni kesilgan: "Destination B2 unit 24 (2" — tugamagan, tooltip yo'q | UX | O'rta |
| A4 | Sarlavhadagi qizil o'chirish ikonkasi — labelsiz, tushuntirishsiz, xavfli joyda | UX/xavf | **Yuqori** |
| A5 | "Jami so'zlar: 29 ta" va "Navbatda: 97" bir vaqtda ko'rinadi — ziddiyatli, tushunarsiz | UX | **Yuqori** |
| A6 | Statistik kartalar (7 / 1 / 5) kontekstsiz: nimaga nisbatan, trend qanday — bilinmaydi | UX | O'rta |
| A7 | 1440px'da kontent markazda tor ustunda, ekranning 60% i bo'sh | Layout | O'rta |
| A8 | Flashcard — juda katta oq quti, ichida kichik matn; vizual muvozanat yo'q | Dizayn | **Yuqori** |
| A9 | Sidebar'da 9 ta rejim tekis ro'yxatda, guruhlanmagan | IA | O'rta |
| A10 | "KO'RISH UCHUN BOSING" — uppercase, past kontrast kulrang | A11y/dizayn | O'rta |
| A11 | Login sahifa **to'q** (dark), ichki interfeys **och** (light) — brend bir xil emas | Dizayn | O'rta |
| A12 | Klaviatura shortcut'lari yo'q (Space = kartani ag'darish, 1–4 = baholash) | UX | O'rta |
| A13 | Sessiya davomida progress indikatori yo'q — "necha qoldi" bilinmaydi | UX | **Yuqori** |
| A14 | Kategoriya/so'zlar bo'yicha qidiruv yo'q | UX | O'rta |
| A15 | Bo'sh holat (empty state) va xatolik holatlari ishlangan-ishlanmagani noma'lum | UX | Tekshir |

**Qo'shimcha ravishda o'zing top:** har bir sahifada "bu yerda foydalanuvchi nima qilishni bilmay qoladi?" savolini ber va topilganini jadvalga qo'sh.

---

## 3. FAZA 1 — Design system

### 3.1 Dizayn yo'nalishi (nega aynan shunday)

Mahsulotning predmeti — **lug'at**. Shundan kelib chiqamiz:

- **So'zning o'zi — bosh qahramon.** Har bir ekranda eng katta, eng aniq element — o'rganilayotgan so'z. U lug'at nashrlaridagidek **serif** shriftda beriladi; interfeysning qolgan qismi — betaraf sans. Bu kontrast so'zni "kontent" emas, "obyekt" qilib ko'rsatadi.
- **Transkripsiya — mono shriftda.** IPA belgilar `/ˈvəʊkəbliː/` monospace'da texnik va aniq o'qiladi.
- **Imzo element (signature):** kartani o'rab turuvchi **mastery ring** — so'zning o'zlashtirilish darajasini ko'rsatuvchi ingichka halqa. U progress bar emas, so'zning "yetilish" holati: bo'sh → chorak → yarim → to'la → to'la + oltin. Bu bitta element butun mahsulot mantiqini (SRS) vizual tilga o'giradi. Boldlikni faqat shu yerga sarfla, qolgan hamma narsa jim va tartibli bo'lsin.
- **Alanga (streak) — yagona iliq rang.** Butun interfeys sovuq indigo-slate palitrada; faqat streak va kunlik maqsad amber rangda. Shuning uchun ko'z avtomatik "bugun qildingmi?" savoliga tushadi.

### 3.2 Rang tokenlari

`globals.css` (yoki `tokens.css`) da CSS o'zgaruvchi sifatida. **Komponent ichida xom hex yozish taqiqlanadi.**

```css
:root {
  /* Brand */
  --color-primary:        #4F46E5;  /* indigo-600 — mavjud brend rangi saqlanadi */
  --color-primary-hover:  #4338CA;
  --color-primary-soft:   #EEF2FF;
  --color-on-primary:     #FFFFFF;

  /* Accent — faqat streak, kunlik maqsad, motivatsiya */
  --color-accent:         #F59E0B;
  --color-accent-soft:    #FEF3C7;

  /* Semantik */
  --color-success:        #16A34A;
  --color-success-soft:   #DCFCE7;
  --color-warning:        #D97706;
  --color-danger:         #DC2626;
  --color-danger-soft:    #FEE2E2;

  /* Yuzalar (light) */
  --color-bg:             #F8FAFC;
  --color-surface:        #FFFFFF;
  --color-surface-raised: #FFFFFF;
  --color-border:         #E2E8F0;
  --color-border-strong:  #CBD5E1;

  /* Matn (light) — kontrast tekshirilgan */
  --color-fg:             #0F172A;  /* 16.1:1 on --color-bg */
  --color-fg-muted:       #475569;  /* 7.9:1  */
  --color-fg-subtle:      #64748B;  /* 4.9:1  — eng past ruxsat etilgan */

  --color-ring:           #4F46E5;
}

[data-theme="dark"] {
  --color-primary:        #818CF8;
  --color-primary-hover:  #A5B4FC;
  --color-primary-soft:   #1E1B4B;
  --color-on-primary:     #0B1020;

  --color-accent:         #FBBF24;
  --color-accent-soft:    #3A2A05;

  --color-success:        #4ADE80;
  --color-danger:         #F87171;

  --color-bg:             #0B1020;
  --color-surface:        #131A2E;
  --color-surface-raised: #1A2238;
  --color-border:         #26304A;
  --color-border-strong:  #33405F;

  --color-fg:             #E9EDF5;
  --color-fg-muted:       #A9B4CA;
  --color-fg-subtle:      #7C8AA5;
}
```

**Qoidalar:**
- 60 / 30 / 10: 60% — fon va yuzalar, 30% — matn va chegaralar, 10% — primary + accent. Indigo tugmalar ekranni bosib ketmasin.
- Amber **faqat** streak, kunlik maqsad halqasi va yutuqlarda ishlatiladi. Boshqa joyda yo'q.
- Yashil = to'g'ri javob, qizil = xato. Boshqa maqsadda emas.
- Xato va to'g'rilikni **faqat rang bilan** ko'rsatma — ikonka yoki matn ham bo'lsin (rang ko'rlik uchun).

### 3.3 Tipografika

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=IBM+Plex+Mono:wght@400;500&display=swap');

--font-ui:      'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
--font-word:    'Source Serif 4', Georgia, serif;   /* faqat o'rganilayotgan so'z uchun */
--font-mono:    'IBM Plex Mono', ui-monospace, monospace; /* IPA, raqamli statistika */
```

Shkala (mobil → desktop, `clamp` bilan):

| Rol | Hajm | Og'irlik | Line-height | Shrift |
|---|---|---|---|---|
| Display (flashcard so'zi) | `clamp(2.5rem, 8vw, 4rem)` | 600 | 1.1 | `--font-word` |
| H1 (sahifa sarlavhasi) | `clamp(1.5rem, 3vw, 2rem)` | 700 | 1.2 | `--font-ui` |
| H2 (bo'lim) | `1.25rem` | 700 | 1.3 | `--font-ui` |
| H3 (karta sarlavhasi) | `1rem` | 600 | 1.4 | `--font-ui` |
| Body | `1rem` (16px) | 400 | 1.6 | `--font-ui` |
| Small / yordamchi | `0.875rem` | 400 | 1.5 | `--font-ui` |
| Label / eyebrow | `0.75rem`, `letter-spacing: .06em`, **sentence case** | 600 | 1.4 | `--font-ui` |
| Statistika raqami | `clamp(1.75rem, 4vw, 2.5rem)`, `font-variant-numeric: tabular-nums` | 700 | 1.1 | `--font-mono` |
| IPA transkripsiya | `0.9375rem` | 400 | 1.4 | `--font-mono` |

**Qoidalar:** body hech qachon 16px dan kichik emas (mobilda input 16px dan kichik bo'lsa iOS avtomatik zoom qiladi). Uppercase faqat mikro-label'larda va faqat 12px da. `--color-fg-subtle` dan och rang yo'q.

### 3.4 Masofa, radius, soya

```css
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 24px; --space-6: 32px;  --space-7: 48px;  --space-8: 64px;

--radius-sm: 8px;  --radius-md: 12px;  --radius-lg: 16px;  --radius-xl: 24px;  --radius-full: 9999px;

/* Yumshoq, aniq soyalar — neumorfizm emas */
--shadow-sm:  0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.04);
--shadow-md:  0 4px 12px rgba(15,23,42,.08);
--shadow-lg:  0 12px 32px rgba(15,23,42,.10);
--shadow-card: 0 2px 4px rgba(15,23,42,.04), 0 12px 24px rgba(79,70,229,.06);

--dur-fast: 150ms; --dur-base: 220ms; --dur-slow: 320ms;
--ease-out: cubic-bezier(.16,1,.3,1);
```

Dark rejimda soya o'rniga chegara + `--color-surface-raised` ishlatiladi (to'q fonda soya ko'rinmaydi).

### 3.5 Komponent kutubxonasi

`src/components/ui/` ichida quyidagilar yaratilsin (yoki mavjudi shu tokenlarga o'tkazilsin). Har biri Storybook yoki `/dev/components` sahifasida ko'rsatilsin:

`Button` (primary / secondary / ghost / danger; sm/md/lg; loading; icon-only + `aria-label`), `IconButton`, `Card`, `Input`, `Textarea`, `Select`, `Combobox`, `Modal`, `Sheet` (mobil pastdan chiqadigan), `Dropdown`, `Tabs`, `Tooltip`, `Toast`, `Badge`, `Progress`, `ProgressRing`, `Skeleton`, `EmptyState`, `Avatar`, `Switch`, `Slider`, `Kbd`.

**Har bir interaktiv element uchun majburiy:** hover, active, focus-visible, disabled holatlari; `cursor: pointer`; 150–300ms o'tish; min 44×44px teginish maydoni.

### 3.6 Animatsiya qoidalari

- Davomiylik 150–300ms, `--ease-out`.
- `transform` va `opacity` ni animatsiya qil; `width`/`height`/`top` ni emas.
- Karta ag'darilishi: `rotateY` 3D flip, 400ms, `perspective: 1200px`.
- To'g'ri javob: yashil halqa 1 marta pulsatsiya + yengil `scale(1.02)`. Xato: 200ms gorizontal `shake` (±6px), 3 marta.
- Ro'yxatlar: stagger 60ms, `opacity 0→1`, `y 12px→0`.
- **`prefers-reduced-motion: reduce`** — barcha animatsiyalar `duration: 0.01ms` ga tushadi, faqat opacity qoladi. Bu majburiy.

---

## 4. FAZA 2 — Axborot arxitekturasi va navigatsiya

### 4.1 Yangi route strukturasi

```
/                       → login bo'lmasa: landing; bo'lsa: /dashboard ga redirect
/login  /register  /forgot-password
/dashboard              → YANGI bosh sahifa (statistika + bugungi ish)
/study                  → o'rganish markazi (rejim tanlash)
/study/flashcards
/study/typing
/study/matching
/study/quiz
/study/speed
/study/listening
/study/cloze            → YANGI
/study/speaking         → YANGI
/review                 → "Bugungi takrorlash" (SRS navbati)
/words                  → so'zlar jadvali (mavjud "Jadval")
/words/:id              → so'z tafsiloti
/categories             → kategoriyalar boshqaruvi (to'liq sahifa)
/stats                  → chuqur statistika
/ai                     → AI Chat
/settings               → profil, maqsad, bildirishnoma, mavzu, til
/admin/*                → admin panel (role-gated)
```

### 4.2 A2 muammosini hal qilish — kategoriya boshqaruvini birlashtirish

**Hozir:** dropdown + "Kategoriyalarni boshqarish" + "Yangi kategoriya" — 3 ta element, bittasi ish qiladi, ikkitasi joyni egallaydi va dizaynni buzadi.

**Bo'ladi:** bitta `<CategorySwitcher />` komponenti — qidiruvli combobox.

```
┌─────────────────────────────────────────────┐
│ [V] Destination B2 unit 24        29 · 12 ▾ │   ← trigger (sidebar tepasida)
└─────────────────────────────────────────────┘
       ↓ bosilganda popover ochiladi
┌─────────────────────────────────────────────┐
│ 🔍 Kategoriya qidirish...                   │
├─────────────────────────────────────────────┤
│ ● Destination B2 unit 24      29 soʻz  12 ⏰ │  ⋮
│ ○ IELTS Academic Word List   612 soʻz  48 ⏰ │  ⋮
│ ○ Phrasal verbs               84 soʻz   0 ⏰ │  ⋮
├─────────────────────────────────────────────┤
│ + Yangi kategoriya                          │
│ ⚙ Barcha kategoriyalar                      │  → /categories
└─────────────────────────────────────────────┘
```

Talablar:
- Trigger'da kategoriya nomi **kesilmaydi**: `truncate` + `title` atributi + popover ichida to'liq nomi ko'rinadi. Yonida ikkita raqam: jami so'z va bugun takrorlashga tayyor so'z (⏰).
- Har qatordagi `⋮` menyusi: **Nomini o'zgartirish · Nusxa olish · Eksport · Arxivlash · O'chirish**. Ya'ni "boshqarish" alohida tugma emas — u kontekst menyusida.
- "Yangi kategoriya" popover ichida, pastda.
- "Barcha kategoriyalar" — og'ir amallar (ommaviy import, tartiblash, birlashtirish) uchun to'liq sahifa.
- Klaviatura: `↑/↓` yurish, `Enter` tanlash, `Esc` yopish, yozish = filtrlash. `role="combobox"`, `aria-expanded`, `aria-activedescendant`.
- Tanlangan kategoriya `localStorage` + URL query (`?cat=`) da saqlanadi, sahifa yangilanganda tiklanadi.

### 4.3 A4 muammosini hal qilish — xavfli o'chirish

Sarlavhadagi yolg'iz qizil trash ikonkasi olib tashlanadi. O'chirish faqat `⋮` menyusida, va:
- Modal: "**Destination B2 unit 24** kategoriyasi va undagi 29 ta so'z butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi." — tasdiqlash uchun kategoriya nomini yozdirish (destructive confirm).
- O'chirilgandan keyin 10 soniyalik "Bekor qilish" toast (soft delete, `deleted_at`).
- Muqobil: **Arxivlash** — ma'lumot saqlanadi, ro'yxatdan yashiriladi. Ko'p holatda foydalanuvchiga aslida shu kerak.

### 4.4 A9 muammosini hal qilish — sidebar guruhlash

```
─────────────────────────
[CategorySwitcher]
─────────────────────────
  ▸ Bosh sahifa                (dashboard)
  ▸ Bugungi takrorlash    12   (badge = due count)
─────────────────────────
  MASHQLAR
  ▸ Kartochka
  ▸ Yozish testi
  ▸ Tinglab yozish
  ▸ Juftlikni topish
  ▸ Test
  ▸ Tezkor o'yin
  ▸ Boʻsh joyni toʻldirish     (yangi)
  ▸ Talaffuz                   (yangi)
─────────────────────────
  ▸ So'zlar jadvali
  ▸ Statistika
  ▸ AI yordamchi
─────────────────────────
[Profil · Sozlamalar · Chiqish]
```

- "MASHQLAR" guruhi yig'iladi/ochiladi (accordion), holati saqlanadi.
- Aktiv element: chap tomonda 3px indigo chiziq + `--color-primary-soft` fon + `font-weight: 600` + `aria-current="page"`. Faqat rang emas.
- "Bugungi takrorlash" yonida due soni badge — 0 bo'lsa badge yo'q, matn kulrang.
- Sidebar tepasida global qidiruv (`Cmd/Ctrl + K`): so'z, kategoriya, sahifa bo'yicha.

---

## 5. FAZA 3 — Dashboard (login'dan keyingi yangi bosh sahifa)

Bu foydalanuvchi eng ko'p ko'radigan ekran. Uning bitta ishi: **"bugun nima qilishim kerak"ni 2 soniyada aytish va boshlatish.**

### 5.1 Layout (desktop ≥1024px, 12 ustunli grid, max-width 1280px)

```
┌────────────────────────────────────────────────────────────────────┐
│  Xush kelibsiz, Jamolxon            [Kategoriya ▾]  [🔔]  [⚙]      │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  ┌────────────────────┐  │
│  │  BUGUNGI ISH  (hero)                 │  │  🔥 ALANGA          │  │
│  │                                      │  │                    │  │
│  │      ╭──────────╮                    │  │      12            │  │
│  │      │   14/20  │  ← maqsad halqasi  │  │   kun ketma-ket    │  │
│  │      ╰──────────╯                    │  │                    │  │
│  │                                      │  │  M T W T F S S     │  │
│  │  12 ta so'z takrorlashga tayyor      │  │  ● ● ● ● ● ○ ○     │  │
│  │  5 ta yangi so'z kutmoqda            │  │  Rekord: 23 kun    │  │
│  │                                      │  └────────────────────┘  │
│  │  [ Takrorlashni boshlash ]           │  ┌────────────────────┐  │
│  └──────────────────────────────────────┘  │  ⏱ BUGUN            │  │
│                                            │  18 daq · 87% aniq  │  │
│  ┌──────────┬──────────┬──────────┬─────┐ │  o'rtacha 4.2 s/so'z│  │
│  │ Bugun    │ Bu hafta │ Jami     │ O'zl│ └────────────────────┘  │
│  │ 37 ↑12   │ 214 ↑8%  │ 1 842    │ 312 │                          │
│  │ takror   │ takror   │ takror   │ so'z│                          │
│  └──────────┴──────────┴──────────┴─────┘                          │
├────────────────────────────────────────────────────────────────────┤
│  FAOLLIK                                   [7 kun][30 kun][1 yil]  │
│  ▁▃▅▂▇▆█▄▂▅▇▃▁▄▆█▅▃▂▆▇█▄▂▃▅▇▆▄  (bar chart / heatmap)             │
├────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────┐  ┌──────────────────────────────┐  │
│  │ O'ZLASHTIRISH DARAJASI    │  │ QIYNALAYOTGAN SO'ZLAR (7)    │  │
│  │ ████░░░░ Yangi        142 │  │  bewilder      6 xato  [→]   │  │
│  │ ████████░ O'rganilmoqda 78│  │  meticulous    5 xato  [→]   │  │
│  │ ██████░░ Mustahkam     53 │  │  reciprocate   5 xato  [→]   │  │
│  │ ████████ O'zlashtirilgan312│ │  [ Shularni mashq qilish ]   │  │
│  └───────────────────────────┘  └──────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────┤
│  KELGUSI YUK (7 kun)          │  KATEGORIYALAR BO'YICHA           │
│  Du 12 · Se 8 · Ch 15 · ...   │  Destination B2  ████████░ 76%    │
│                               │  IELTS AWL       ███░░░░░ 31%     │
└────────────────────────────────────────────────────────────────────┘
```

**A7 muammosi hal bo'ladi:** kontent 12 ustunli grid'ga yoyiladi, `max-width: 1280px`, chetlarda `padding: 32px`. Bo'sh markaziy ustun yo'q.

### 5.2 Har bir blok — aniq spetsifikatsiya

#### Blok 1 — «Bugungi ish» (hero)
- Markazda **kunlik maqsad halqasi** (`ProgressRing`, SVG, 160px): `bugun_takrorlangan / kunlik_maqsad`. Halqa amber, to'lganda yashil + bir marta pulsatsiya.
- Ostida ikki qator: `{due_count} ta so'z takrorlashga tayyor`, `{new_available} ta yangi so'z kutmoqda`.
- Asosiy CTA: **"Takrorlashni boshlash"** → `/review`. `due_count === 0` bo'lsa CTA "Yangi so'zlarni o'rganish" ga aylanadi. Ikkalasi ham 0 bo'lsa: "Bugun hammasi bajarildi 🎉 Ertaga {n} ta so'z kutadi" + ikkilamchi "Baribir mashq qilish".
- Hero bloki hech qachon bo'sh qolmaydi — har holat uchun matn va harakat bor.

#### Blok 2 — «Alanga» (streak)
- Katta raqam: joriy streak. Ostida so'nggi 7 kun nuqtalari (● bajarilgan, ◐ qisman, ○ o'tkazib yuborilgan).
- "Rekord: {longest} kun".
- **Streak muzlatgichi (freeze):** oyiga 2 marta bir kunni o'tkazib yuborsa streak buzilmaydi. Qolgan muzlatgichlar soni ko'rsatiladi. Bu retention uchun eng kuchli mexanizm.
- Streak buzilish xavfi bo'lsa (soat 20:00 dan keyin, bugun 0 takror): blok amber chegara oladi + "Alangani saqlash uchun 5 daqiqa" CTA.

#### Blok 3 — «Bugun» (vaqt va sifat)
- **Kun davomiyligi:** `18 daq 32 s` — bugungi barcha sessiyalar yig'indisi.
- **Aniqlik:** `87%` — bugungi to'g'ri javoblar ulushi.
- **O'rtacha javob vaqti:** `4.2 s/so'z` — tezlik ravonlikning ko'rsatkichi.
- Har biriga kichik sparkline (so'nggi 7 kun) va o'zgarish (`↑ 12%` yashil / `↓ 5%` kulrang — qizil emas, ayblamaslik uchun).

#### Blok 4 — KPI qatori (4 ta karta)
`Bugun takrorlangan` · `Bu hafta` · `Jami takrorlar` · `O'zlashtirilgan so'zlar`.
Har birida: raqam (`tabular-nums`), yorliq, oldingi davrga nisbatan o'zgarish. **A6 hal bo'ladi** — endi raqam kontekstga ega.

#### Blok 5 — «Faollik»
- **7/30 kun:** vertikal bar chart (Recharts). O'q, tooltip (`sana · N takror · M daq`), maqsad chizig'i (dashed).
- **1 yil:** GitHub uslubidagi **calendar heatmap** (53×7). 5 daraja intensivlik + 0 uchun bo'sh katak. Har katakda `aria-label="12-may: 34 takror"`. Rang ko'rlar uchun tooltip'da aniq raqam.
- Bo'sh holat: "Ma'lumot to'planmoqda — birinchi sessiyangizdan keyin bu yerda grafik paydo bo'ladi."

#### Blok 6 — «O'zlashtirish darajasi»
Gorizontal stacked bar + legenda. 4 daraja (5.4-bo'limga qarang): Yangi · O'rganilmoqda · Mustahkam · O'zlashtirilgan. Har segmentga bosilsa `/words?state=...` ga o'tadi.

#### Blok 7 — «Qiynalayotgan so'zlar» (leeches)
`lapses` bo'yicha top 5–10. Har qatorda: so'z · xatolar soni · [→] tugma (so'z tafsiloti). Pastda CTA: **"Shularni mashq qilish"** → faqat shu so'zlardan iborat maxsus sessiya. Bu eng qadrli funksiya — foydalanuvchi aynan zaif joyini biladi.

#### Blok 8 — «Kelgusi yuk»
Keyingi 7 kun uchun due bo'ladigan so'zlar soni (bar). Foydalanuvchi ertaga qancha ish borligini oldindan ko'radi va rejalashtiradi.

#### Blok 9 — «Kategoriyalar bo'yicha progress»
Har kategoriya: nom · o'zlashtirilgan foiz progress bar · due soni · [Boshlash].

### 5.3 A5 muammosini hal qilish — raqamlar ziddiyati

Hozir "Jami so'zlar: 29" va "Navbatda: 97" bir vaqtda ko'rinadi va bu mantiqsiz. Yagona lug'at o'rnatiladi va **butun ilova bo'ylab bir xil ishlatiladi**:

| Atama (UI) | Ma'nosi | Hisoblash |
|---|---|---|
| **Jami so'z** | Kategoriyadagi barcha so'zlar | `COUNT(words WHERE category_id = X)` |
| **Takrorlashga tayyor** | Hozir due bo'lganlar | `COUNT(user_word_state WHERE due_at <= now())` |
| **Yangi** | Hech qachon ko'rilmaganlar | `state = 'new'` |
| **Sessiyada qoldi** | Joriy sessiyada qolgan kartalar | sessiya navbati uzunligi |
| **O'zlashtirilgan** | `interval_days >= 21` | — |

Sarlavhada faqat **"Jami so'z"** va **"Takrorlashga tayyor"** ko'rsatiladi. "Navbatda" atamasi butunlay olib tashlanadi — u sessiya ichida "3 / 20" ko'rinishidagi progress bar bilan almashtiriladi (**A13 hal bo'ladi**).

### 5.4 Statistika API'lari

```
GET /api/stats/overview?category_id=&tz=Asia/Tashkent
→ {
    streak: { current, longest, freezes_left, last_7_days: [bool|null] },
    today:  { reviews, new_learned, correct, accuracy_pct, duration_sec, avg_response_ms, goal, goal_pct },
    totals: { reviews, words, mastered, categories },
    deltas: { reviews_vs_yesterday_pct, week_vs_last_week_pct }
  }

GET /api/stats/activity?range=7d|30d|365d&tz=
→ [{ date, reviews, new_words, correct, duration_sec }]

GET /api/stats/mastery?category_id=
→ { new, learning, young, mastered }

GET /api/stats/leeches?limit=10
→ [{ word_id, word, translation, lapses, last_reviewed_at, accuracy_pct }]

GET /api/stats/forecast?days=7
→ [{ date, due_count }]

GET /api/stats/by-category
→ [{ category_id, name, total, mastered, due, mastery_pct }]
```

**Muhim texnik talablar:**
- Barcha sana hisob-kitobi foydalanuvchi vaqt mintaqasida (`Asia/Tashkent`, lekin `users.timezone` dan olinadi). "Bugun" — UTC emas.
- **Kun chegarasi 04:00** da: kechasi 01:00 da o'qigan odam uchun bu hali "kecha". Bu streak adolatliligi uchun muhim.
- Og'ir agregatlar `daily_stats` jadvalidan o'qiladi (kunlik cron yoki har sessiya oxirida upsert), har so'rovda `review_events` skanerlanmaydi.
- Barcha statistika endpointlari 60 s Redis kesh + `stale-while-revalidate`.
- Dashboard **bitta** so'rov bilan ochilsin: `GET /api/dashboard` → yuqoridagilarni jamlab qaytaradi. N ta paralel fetch qilma.

---

## 6. FAZA 4 — SRS dvigateli va ma'lumotlar modeli

Bu backend ishi, lekin butun statistika va dashboard shunga tayanadi. **Faza 3 dan oldin yoki parallel bajarilishi kerak.**

### 6.1 Jadvallar (migratsiya)

```sql
-- Har bir so'zning har bir foydalanuvchi uchun holati
CREATE TABLE user_word_state (
  user_id        BIGINT NOT NULL,
  word_id        BIGINT NOT NULL,
  state          TEXT NOT NULL DEFAULT 'new',   -- new | learning | review | relearning
  ease           REAL NOT NULL DEFAULT 2.5,
  interval_days  REAL NOT NULL DEFAULT 0,
  due_at         TIMESTAMPTZ,
  reps           INT  NOT NULL DEFAULT 0,
  lapses         INT  NOT NULL DEFAULT 0,
  learning_step  INT  NOT NULL DEFAULT 0,
  is_leech       BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended   BOOLEAN NOT NULL DEFAULT FALSE,
  last_reviewed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, word_id)
);
CREATE INDEX idx_uws_due ON user_word_state (user_id, due_at) WHERE is_suspended = FALSE;
CREATE INDEX idx_uws_state ON user_word_state (user_id, state);

-- Har bir javob — audit va statistika manbai
CREATE TABLE review_events (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL,
  word_id       BIGINT NOT NULL,
  session_id    BIGINT,
  mode          TEXT NOT NULL,        -- flashcard | typing | quiz | matching | listening | cloze | speaking
  rating        SMALLINT,             -- 1=again 2=hard 3=good 4=easy
  is_correct    BOOLEAN NOT NULL,
  response_ms   INT,
  prev_interval REAL, new_interval REAL,
  prev_ease     REAL, new_ease     REAL,
  reviewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_re_user_time ON review_events (user_id, reviewed_at DESC);

CREATE TABLE study_sessions (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL,
  category_id  BIGINT,
  mode         TEXT NOT NULL,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at     TIMESTAMPTZ,
  duration_sec INT,
  reviews      INT DEFAULT 0,
  correct      INT DEFAULT 0
);

-- Kunlik agregat (dashboard tezligi uchun)
CREATE TABLE daily_stats (
  user_id      BIGINT NOT NULL,
  local_date   DATE   NOT NULL,
  reviews      INT DEFAULT 0,
  new_words    INT DEFAULT 0,
  correct      INT DEFAULT 0,
  duration_sec INT DEFAULT 0,
  goal_met     BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, local_date)
);

CREATE TABLE user_settings (
  user_id            BIGINT PRIMARY KEY,
  timezone           TEXT NOT NULL DEFAULT 'Asia/Tashkent',
  daily_goal_reviews INT  NOT NULL DEFAULT 20,
  daily_new_limit    INT  NOT NULL DEFAULT 10,
  daily_review_limit INT  NOT NULL DEFAULT 200,
  theme              TEXT NOT NULL DEFAULT 'system',
  tts_accent         TEXT NOT NULL DEFAULT 'en-GB',
  reminder_time      TIME,
  telegram_chat_id   BIGINT,
  streak_freezes     INT  NOT NULL DEFAULT 2
);
```

### 6.2 SRS algoritmi (SM-2 asosida, sozlangan)

`src/lib/srs.ts` — sof funksiya, unit test bilan qoplangan.

```
Kirish:  { state, ease, interval_days, learning_step, lapses }, rating (1..4)
Chiqish: { state, ease, interval_days, due_at, learning_step, lapses, is_leech }

LEARNING_STEPS = [1 daq, 10 daq, 1 kun]
GRADUATING_INTERVAL = 1 kun
EASY_INTERVAL = 4 kun
MIN_EASE = 1.3
LEECH_THRESHOLD = 8 lapses

state = new | learning:
  rating 1 → learning_step = 0
  rating 2 → learning_step o'zgarmaydi
  rating 3 → learning_step++; oxirgi qadamdan o'tsa → state='review', interval=1
  rating 4 → state='review', interval=EASY_INTERVAL
  due_at = now + LEARNING_STEPS[learning_step]

state = review:
  rating 1 (again) → lapses++, ease -= 0.20, interval = max(1, interval*0.5),
                     state='relearning', learning_step=0
                     lapses >= 8 → is_leech = true
  rating 2 (hard)  → ease -= 0.15, interval = interval * 1.2
  rating 3 (good)  → interval = interval * ease
  rating 4 (easy)  → ease += 0.15, interval = interval * ease * 1.3
  ease = clamp(ease, 1.3, 3.0)
  interval = min(interval, 365)
  fuzz: interval *= random(0.95, 1.05)   ← bir kunga hamma so'z to'planib qolmasligi uchun
  due_at = now + interval kun
```

Baholash tugmalari UI'da (o'zbekcha): **Bilmadim (1) · Qiyin (2) · Bildim (3) · Oson (4)**. Har tugma ostida keyingi ko'rish vaqti kichik matnda: `10 daq · 2 kun · 5 kun · 12 kun`. Bu foydalanuvchiga tanlov oqibatini ko'rsatadi.

Avtomatik rejimlarda (typing, quiz, matching) rating avtomatik: to'g'ri va tez → 3; to'g'ri lekin sekin (>8 s) → 2; xato → 1.

### 6.3 Navbat tuzish qoidasi

```
1. relearning (eng shoshilinch)
2. review, due_at <= now, due_at bo'yicha o'sish tartibida
3. learning, due_at <= now
4. new — kuniga daily_new_limit dan oshmasin
Aralashtirish: yangi so'zlar takrorlar orasiga tarqatiladi (hammasi oxirida emas)
Bir so'z bitta sessiyada 1 martadan ortiq (rating 1 bo'lmasa) chiqmasin
```

---

## 7. FAZA 5 — O'rganish rejimlari

### 7.1 Barcha rejimlar uchun umumiy talablar

- **Sessiya sarlavhasi:** yupqa progress bar (`7 / 20`) + o'tgan vaqt + [Toʻxtatish]. **A13 hal bo'ladi.**
- **Klaviatura (A12):** `Space` — kartani ag'darish / javobni ko'rsatish; `1–4` — baholash; `Enter` — tasdiqlash; `→` — keyingi; `Esc` — chiqish; `S` — talaffuz; `?` — shortcut yordami modali.
- **Sessiya yakuni ekrani:** takrorlangan soni · aniqlik · davomiylik · o'rtacha vaqt · yangi o'zlashtirilganlar · xato qilingan so'zlar ro'yxati + "Xatolarni qayta ko'rish" CTA + streak holati.
- **Uzilishga chidamlilik:** har javob darhol serverga yuboriladi (optimistic UI + navbat). Internet uzilsa `IndexedDB` ga yoziladi va qaytganda sinxronlanadi. Sahifa yopilsa sessiya yo'qolmaydi.
- **Undo:** oxirgi javobni qaytarish (`Ctrl+Z` / tugma), 1 qadam.

### 7.2 Flashcard qayta ishlanishi (A8, A10)

Hozirgi katta bo'sh oq quti o'rniga:

```
        ╭─────────────────────────────────────╮
        │  ○○○○○◐  mastery ring (imzo element)│
        │                                     │
        │            act                      │  ← Source Serif 4, 64px
        │          /ækt/                      │  ← IBM Plex Mono, 15px
        │            🔊                       │  ← audio tugma, 44×44
        │                                     │
        │   ─────────────────────────────     │
        │   Javobni ko'rish uchun bosing      │  ← sentence case, 4.5:1 kontrast
        ╰─────────────────────────────────────╯
              Space  ·  ← oldingi  ·  → keyingi
```

- Karta o'lchami: `max-width: 560px`, `aspect-ratio: 3/2`, markazda. Hozirgidek ekranning yarmini egallamaydi.
- Ag'darilgach: tarjima (katta) · so'z turkumi (badge: *fe'l*) · misol gap (**so'z ajratib ko'rsatilgan**) · sinonimlar · kolokatsiyalar.
- **A10:** "KO'RISH UCHUN BOSING" → "Javobni ko'rish uchun bosing", sentence case, `--color-fg-muted` (7.9:1).
- Mastery ring — karta chetida ingichka halqa, `interval_days` ga qarab to'ladi. Tooltip: "5 kundan keyin qayta ko'rasiz".
- Baholash tugmalari kartadan tashqarida, pastda, 4 ta, teng kenglikda, har birida keyingi interval.

### 7.3 Mavjud rejimlarni tekshirish ro'yxati

Har bir mavjud rejim (`Yozish testi`, `Juftlikni topish`, `Test`, `Tezkor o'yin`, `Tinglab yozish`) uchun tekshir va tuzat:

- [ ] Natija SRS ga yoziladimi? (Ko'p ilovada o'yin rejimlari statistikaga ta'sir qilmaydi — bu xato.)
- [ ] Xato javob berilganda **to'g'ri javob ko'rsatiladimi**? (Ko'rsatilmasa o'rganish bo'lmaydi.)
- [ ] Yozish testida **kichik xatolar kechiriladimi**? (Levenshtein masofasi ≤1 → "Deyarli to'g'ri, e'tibor bering: *recieve* → *receive*"). Bosh harf va ortiqcha probel farqi xato hisoblanmasin.
- [ ] Chalg'ituvchi variantlar (distractor) **mazmunan yaqin** so'zlardanmi yoki tasodifiymi? Tasodifiy bo'lsa test juda oson — bir xil so'z turkumi va uzunlikdan tanlansin.
- [ ] Tinglab yozishda audio **qayta eshitish** va **sekin tezlik (0.75×)** tugmasi bormi?
- [ ] Tezkor o'yinda taymer bosimi bormi, natija saqlanadimi, rekord ko'rsatiladimi?
- [ ] Juftlikni topish mobilda teginish bilan ishlaydimi (drag emas, tap-tap)?

### 7.4 Yangi rejimlar

#### A. Bo'sh joyni to'ldirish (Cloze) — `/study/cloze`
Misol gapdan so'z olib tashlanadi, foydalanuvchi yozadi. Kontekstda eslash — eng samarali usullardan biri. Gaplar AI orqali oldindan generatsiya qilinib **DB da keshlanadi** (har safar API chaqirilmaydi).

#### B. Talaffuz — `/study/speaking`
Web Speech API (`SpeechRecognition`) orqali foydalanuvchi so'zni aytadi, tizim taniganini solishtiradi va foiz beradi. Brauzer qo'llab-quvvatlamasa rejim yashiriladi (feature detection). Mikrofon ruxsati aniq tushuntirilsin.

#### C. Teskari yo'nalish (uz → en)
Har rejimda toggle: `EN→UZ` / `UZ→EN` / `Aralash`. Ishlab chiqarish (production) yo'nalishi tanib olishdan ancha qiyin va foydali — alohida SRS holati sifatida saqlansin (`direction` ustuni).

#### D. Xatolar ustida ish
Sessiya yakunida yoki dashboard'dan: faqat leech va so'nggi xato qilingan so'zlardan sessiya.

#### E. AI hikoya rejimi
Bugungi 10–15 ta so'zdan AI qisqa hikoya yozadi, so'zlar ajratib ko'rsatiladi, ustiga bosilsa tarjima chiqadi. Kontekstda takrorlash + zerikmaslik.

#### F. So'z qo'shish oqimi (import)
- Qo'lda bittalab (tez qo'shish: so'z yozilganda AI tarjima + IPA + misol gapni avtomatik taklif qiladi, foydalanuvchi tasdiqlaydi).
- CSV / TSV yuklash (ustunlarni moslashtirish ekrani bilan).
- Matn bo'lagidan (parcha yopishtiriladi → AI notanish so'zlarni ajratadi → foydalanuvchi tanlaydi).
- Rasm/skrindan OCR (u ilgari CamScanner matnini o'qish bilan ishlagan — shu oqim shu yerga bog'lanadi).
- Quizlet eksport formatini qo'llab-quvvatlash.

#### G. Bildirishnomalar (Telegram bot)
Kunlik eslatma: "12 ta so'z takrorlashga tayyor 🔥 streak: 12 kun". Telegram bot orqali (`telegram_chat_id` bog'langan bo'lsa). Web push — ikkinchi navbatda. Vaqt sozlanadi, o'chiriladi.

#### H. PWA
`manifest.json`, service worker, offline'da oxirgi navbatni o'qish va javoblarni navbatga qo'yish. Telefonga o'rnatish taklifi.

---

## 8. FAZA 6 — AI Chat (Claude uslubidagi interfeys)

Hozirgi AI bo'limi sidebar'dagi oddiy element. U to'liq huquqli, sokin va matnga yo'naltirilgan suhbat interfeysiga aylanadi.

### 8.1 Layout

```
┌──────────┬──────────────────────────────────────────────┐
│ Suhbatlar│                                              │
│          │        (max-width: 48rem, markazda)          │
│ + Yangi  │                                              │
│          │   Siz                                        │
│ Bugun    │   "bewilder" so'zini tushuntir               │
│ · so'z…  │                                              │
│ · IELTS… │   ─────────────────────────────────          │
│          │   bewilder /bɪˈwɪldə/ — fe'l                 │
│ Kecha    │   Kimnidir chalkashtirib yuborish...         │
│ · gramm… │                                              │
│          │   [📋] [↻] [+ Lug'atga qo'shish]            │
│          │                                              │
│          │  ┌────────────────────────────────────────┐  │
│          │  │ Savolingizni yozing...                 │  │
│          │  │ [Destination B2 ×]        [🎤] [ ↑ ]   │  │
│          │  └────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────┘
```

### 8.2 Aniq talablar

**Xabarlar:**
- AI javobi — **pufakchasiz**, fon rangida oddiy matn, to'liq kenglikda. Bu Claude/ChatGPT uslubining asosi: matn hujjatdek o'qiladi.
- Foydalanuvchi xabari — yengil `--color-surface-raised` fonli, `--radius-lg`, ichki `padding: 12px 16px`, kontent kengligining 80% igacha, o'ngga tekislanмаgan holda ham bo'ladi (ikkalasi ham qabul qilinadi — bittasini tanlab, izchil ishlat).
- Markdown to'liq render qilinadi: sarlavha, ro'yxat, jadval, `inline code`, kod bloki (til belgisi + nusxa olish tugmasi), iqtibos.
- Xabar ostidagi amallar (hover'da ko'rinadi, mobilda doim): **Nusxa olish · Qayta generatsiya · Lug'atga qo'shish · Ovozda eshitish · 👍/👎**.
- "Lug'atga qo'shish" — AI javobidan so'z + tarjima + misolni ajratib, tanlangan kategoriyaga qo'shadi. Bu AI ni mahsulot yadrosi bilan bog'laydigan eng muhim tugma.

**Oqim (streaming):**
- Javob token-token oqib chiqadi. Oqish davomida yuborish tugmasi **"To'xtatish"** ga aylanadi.
- Kursor sifatida yonib-o'chuvchi blok (`▍`).
- `aria-live="polite"` — skrinrider tugallangan javobni o'qisin (har token emas).
- Xato bo'lsa: xabar o'rnida "Javob olinmadi. [Qayta urinish]" — konsolga emas, ekranga.

**Kompozitor (yozish maydoni):**
- Auto-grow `textarea`: 1 qatordan 8 qatorgacha, keyin ichki scroll.
- `Enter` — yuborish, `Shift+Enter` — yangi qator. Mobilda `Enter` — yangi qator, yuborish faqat tugma bilan.
- Bo'sh bo'lsa yuborish tugmasi disabled.
- Pastki chap burchakda **kontekst chip'lari**: joriy kategoriya, tanlangan so'z. `×` bilan olib tashlanadi. Bu AI ga nima haqida gaplashayotganini bildiradi.
- Mikrofon tugmasi (ovozli kirish, Web Speech API).
- Kompozitor sticky — pastda turadi, xabarlar uning ostidan o'tadi (blur fon).

**Bo'sh holat:**
Markazda: "Nima haqida gaplashamiz?" + 4 ta taklif chip'i, mahsulotga xos:
- "Bugungi so'zlarim bilan gap tuz"
- "*bewilder* va *confuse* farqi nima?"
- "IELTS Writing uchun bu so'zning kolokatsiyalari"
- "Menga shu kategoriyadan 10 ta savol ber"

**Suhbatlar ro'yxati:**
- Sana bo'yicha guruhlangan (Bugun / Kecha / So'nggi 7 kun / Oldinroq).
- Sarlavha birinchi xabardan avtomatik generatsiya qilinadi (yoki AI 5 so'zli sarlavha beradi).
- Har birida `⋮`: Nomini o'zgartirish · O'chirish · Eksport (markdown).
- Desktop'da doimiy chap panel; mobilda yuqoridagi tugmadan ochiladigan `Sheet`.

**Texnik:**
- Server-Sent Events yoki streaming fetch. Uzilganda qayta ulanish.
- Har foydalanuvchi uchun rate limit (kuniga N ta xabar / M token) — `user_settings` da; limit tugaganda tushunarli xabar.
- Suhbat tarixi DB da: `ai_conversations`, `ai_messages(role, content, tokens_in, tokens_out, model, created_at)`.
- Token va xarajat hisobga olinadi (admin panelda ko'rinadi).
- System prompt: "Sen o'zbek tilida so'zlashuvchi ingliz tili o'rganuvchisiga yordam beradigan lug'at yordamchisisan. Javoblar o'zbek tilida, misollar ingliz tilida. Qisqa va aniq." — kodda emas, `ai_prompts` jadvalida saqlansin (admin paneldan tahrirlanadi).

---

## 9. FAZA 7 — Admin panel

### 9.1 Xavfsizlik (eng avval)

- `users.role`: `user | moderator | admin`. Default `user`.
- **Har bir** `/admin/*` va `/api/admin/*` so'rovi serverda rol tekshiradi. Faqat frontend'da yashirish — himoya emas.
- Admin uchun 2FA (TOTP) majburiy.
- Barcha o'zgartirish amallari `admin_audit_log` ga yoziladi: `actor_id, action, target_type, target_id, diff_json, ip, user_agent, created_at`.
- Mutatsiyalar faqat POST/PATCH/DELETE, CSRF himoyasi bilan. GET orqali hech narsa o'zgarmaydi.
- Impersonation ("foydalanuvchi sifatida ko'rish") bo'lsa — vaqt chegarali, banner bilan ko'rinadigan, to'liq loglangan.
- Admin endpointlarga alohida rate limit.

### 9.2 Bo'limlar

**1. Umumiy ko'rinish**
DAU / WAU / MAU · yangi ro'yxatdan o'tganlar (kunlik grafik) · D1/D7/D30 retention · aktiv streak'lar soni · bugungi takrorlar · AI so'rovlari va xarajati · o'rtacha sessiya davomiyligi.

**2. Foydalanuvchilar**
Jadval: ID · ism · telefon · ro'yxatdan o'tgan sana · oxirgi faollik · so'zlar soni · streak · rol · holat.
Filtr va qidiruv. Foydalanuvchi kartasi: faollik grafigi, kategoriyalari, AI foydalanishi.
Amallar: rol o'zgartirish · bloklash/blokdan chiqarish · parolni tiklash havolasi yuborish · ma'lumotlarini eksport qilish · o'chirish (soft delete).

**3. Kontent**
Global (tayyor) kategoriyalar va so'zlar: CRUD · CSV ommaviy import (validatsiya hisoboti bilan) · dublikatlarni topish · tarjimasi/IPA'si yo'q so'zlarni filtrlash · audio yo'qlarni topish · foydalanuvchi jo'natgan tuzatishlarni ko'rib chiqish.

**4. AI**
Foydalanuvchi bo'yicha token/xarajat · model tanlash · rate limit sozlash · system prompt shablonlarini tahrirlash (versiyalash bilan) · so'nggi 100 suhbatni ko'rish (maxfiylik siyosatiga mos ravishda, kirish loglanadi).

**5. Tizim**
So'nggi xatolar (Sentry yoki ichki log) · fon vazifalari navbati · feature flag'lar · barcha foydalanuvchilarga banner/e'lon · texnik ishlar rejimi.

**6. Hisobotlar**
Har bir jadvalni CSV eksport. Sana oralig'i bo'yicha filtr.

### 9.3 Dizayn
Asosiy ilova bilan bir xil tokenlar, lekin `--density` yuqori (kompakt jadval, 8–32px masofa). Ma'lumot zichligi ustuvor. Sidebar navigatsiya, tepada breadcrumb.

---

## 10. FAZA 8 — Mobil va responsive

### 10.1 Darhol tuzatiladigan (A1)

```html
<!-- HOZIR — noto'g'ri, zoom bloklangan -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

<!-- BO'LADI -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

`maximum-scale` va `user-scalable=no` butunlay olib tashlanadi. Input'lardagi avtomatik zoom `font-size: 16px` bilan hal qilinadi, zoomni bloklash bilan emas.

### 10.2 Breakpoint'lar

`375 · 640 · 768 · 1024 · 1280 · 1440`. Mobile-first: asosiy CSS mobil uchun, `min-width` media query bilan kengaytiriladi.

### 10.3 Mobil navigatsiya

Sidebar `<1024px` da pastki navigatsiyaga aylanadi — **maksimum 5 element**:

```
[🏠 Bosh]  [📚 O'rganish]  [ ▶ ]  [📊 Statistika]  [👤 Profil]
                            ↑
                  markaziy CTA — "Takrorlash"
                  (badge: due soni)
```

- "O'rganish" bosilganda barcha rejimlar `Sheet` da ochiladi.
- AI — "O'rganish" sheet'i ichida yoki profil ostida (5 tadan oshmaslik uchun).
- Kategoriya almashtirgich — sarlavhada, bosilganda `Sheet`.
- `padding-bottom: env(safe-area-inset-bottom)` — iPhone uchun majburiy.

### 10.4 Mobil o'ziga xosliklar

- `100vh` **ishlatilmaydi** → `100dvh` (mobil brauzer paneli muammosi).
- Flashcard'da **svayp**: chapga = Bilmadim, o'ngga = Bildim, tepaga = Oson. Vizual ishora (karta ranglanadi). Tugmalar ham qoladi — svayp majburiy emas.
- Haptik javob (`navigator.vibrate(10)`) baholashda, agar qo'llab-quvvatlansa.
- Barcha teginish maydonlari ≥44×44px, ular orasida ≥8px.
- Hech qanday funksiya **faqat hover**'da bo'lmasin (xabar amallari mobilda doim ko'rinadi).
- Jadvallar mobilda kartaga aylanadi yoki gorizontal scroll + birinchi ustun sticky.
- Modal'lar mobilda pastdan chiqadigan `Sheet` ko'rinishida.
- Sahifada gorizontal scroll bo'lmasin — 375px da har sahifani tekshir.

---

## 11. FAZA 9 — Sifat: a11y, holatlar, performance

### 11.1 Accessibility (WCAG 2.1 AA)

- [ ] Barcha matn kontrasti ≥4.5:1 (katta matn ≥3:1). Butun ilovani tekshir.
- [ ] `:focus-visible` halqasi hech qayerda o'chirilmagan (`outline: none` faqat `:focus-visible` alternativasi bilan).
- [ ] Har bir ikonka-tugmada `aria-label`.
- [ ] Rasm/ikonkalarda `alt` yoki `aria-hidden="true"` (dekorativ bo'lsa).
- [ ] Modal ochilganda fokus ichida qamalади (focus trap), yopilganda ochgan elementga qaytadi.
- [ ] Formalarda ko'rinadigan `<label>` (faqat placeholder — yetarli emas).
- [ ] Xatolik xabari maydon **yonida**, `aria-describedby` bilan bog'langan.
- [ ] Sahifa tili `<html lang="uz">`.
- [ ] Skip-link ("Asosiy kontentga o'tish").
- [ ] Dinamik yangilanishlar `aria-live` bilan.
- [ ] Faqat rang orqali ma'no berilmaydi (to'g'ri/xato — ikonka + matn ham).

### 11.2 Bo'sh, yuklanish va xato holatlari

Har bir ro'yxat/grafik/sahifa uchun **uchtasi ham** yozilishi shart:

| Holat | Talab |
|---|---|
| Yuklanish | Skeleton (spinner emas), real layout o'lchamida — CLS bo'lmasin |
| Bo'sh | Nima yo'qligi + nima qilish kerakligi + tugma. Masalan: "Bu kategoriyada hali so'z yo'q. Birinchi so'zni qo'shing yoki tayyor to'plamdan import qiling. [So'z qo'shish] [Import]" |
| Xato | Nima bo'lgani + qanday tuzatish + [Qayta urinish]. Texnik xato matni foydalanuvchiga ko'rsatilmaydi |

Matn qoidasi: xatolik uzr so'ramaydi va noaniq bo'lmaydi. "Xatolik yuz berdi" — yomon. "Internet aloqasi uzildi. Javoblaringiz saqlandi, aloqa tiklanganda yuboriladi." — yaxshi.

### 11.3 Performance maqsadlari

- Lighthouse mobil: Performance ≥85, Accessibility ≥95, Best Practices ≥95.
- LCP <2.5s, CLS <0.1, INP <200ms (3G Fast, o'rtacha telefon).
- Route bo'yicha code splitting; grafik kutubxonasi (Recharts) faqat `/dashboard` va `/stats` da yuklanadi (`dynamic import`).
- Rasm: WebP/AVIF, `loading="lazy"`, aniq `width`/`height`.
- Shrift: `display=swap`, faqat kerakli og'irliklar, `preconnect`.
- 500+ qatorli so'zlar jadvali virtualizatsiya qilinadi (`@tanstack/react-virtual`).
- API: dashboard bitta so'rov; ro'yxatlar sahifalanadi (pagination/infinite), hammasi birdan emas.

---

## 12. Muammolar backlog'i (FAZA 0 dan keyin to'ldiriladi)

`docs/AUDIT_FINDINGS.md` da quyidagi formatda yuritiladi:

```
| ID | Muammo | Joyi (fayl:qator) | Tur | Jiddiylik | Faza | Holat |
```

`Tur`: bug · a11y · ux · dizayn · performance · xavfsizlik · texnik qarz.
`Jiddiylik`: kritik (ish to'xtaydi) · yuqori · o'rta · past.

---

## 13. Qabul qilish (acceptance) checklist

Loyiha tugadi deyish uchun quyidagilarning **hammasi** bajarilishi kerak:

**Funksional**
- [ ] Login → `/dashboard` ochiladi, undagi barcha raqamlar real ma'lumotdan keladi (hardcode yo'q)
- [ ] Streak to'g'ri hisoblanadi (vaqt mintaqasi + 04:00 kun chegarasi bilan) — unit test bor
- [ ] Kun davomiyligi, kunlik takrorlar, ko'rilgan so'zlar soni ko'rsatiladi
- [ ] Faollik grafigi 7/30/365 kun rejimlarida ishlaydi
- [ ] Qiynalayotgan so'zlar ro'yxati va "Shularni mashq qilish" ishlaydi
- [ ] Kategoriya boshqaruvi **bitta** komponentda; eski dublikat elementlar kodda qolmagan
- [ ] Barcha o'rganish rejimlari natijasi SRS ga yoziladi
- [ ] Yangi rejimlar (cloze, talaffuz, teskari yo'nalish) ishlaydi
- [ ] AI Chat: streaming, suhbat tarixi, markdown, "Lug'atga qo'shish", kontekst chip'lari
- [ ] Admin panel: rol tekshiruvi serverda, audit log yoziladi

**Dizayn**
- [ ] Bitta token to'plami; komponentlarda xom hex yo'q (`grep -r "#[0-9a-fA-F]\{6\}" src/components` bo'sh)
- [ ] Light va dark rejim to'liq; login va ichki interfeys bir xil brendda (A11)
- [ ] Flashcard qayta ishlangan, mastery ring bor
- [ ] 1440px da bo'sh maydon muammosi yo'q (A7)

**Mobil**
- [ ] `maximum-scale` olib tashlangan (A1)
- [ ] 375 / 768 / 1024 / 1440 da gorizontal scroll yo'q
- [ ] Pastki navigatsiya ≤5 element, safe-area hisobga olingan
- [ ] Svayp bilan baholash ishlaydi

**Sifat**
- [ ] Lighthouse mobil: Perf ≥85, A11y ≥95
- [ ] Klaviatura bilan butun ilovani boshqarish mumkin, fokus ko'rinadi
- [ ] Har ro'yxat/grafikda loading + empty + error holatlari bor
- [ ] `prefers-reduced-motion` hurmat qilinadi
- [ ] Konsolda xato/warning yo'q
- [ ] `npm run build`, lint, type-check toza

---

## 14. Bajarish tartibi

| # | Faza | Nima | Taxminiy hajm |
|---|---|---|---|
| 0 | Audit | Kod inventarizatsiyasi, muammolar hisoboti | 1 sessiya |
| 1 | **Kritik tuzatishlar** | A1 (viewport), A4 (xavfli o'chirish), A5 (raqamlar ziddiyati), A13 (progress) | kichik, darhol |
| 2 | SRS + DB | Jadvallar, migratsiya, `srs.ts` + testlar, statistika API'lari | katta |
| 3 | Design system | Tokenlar, shriftlar, UI komponentlar | o'rta |
| 4 | Navigatsiya + kategoriya | `CategorySwitcher`, sidebar guruhlash, route'lar | o'rta |
| 5 | Dashboard | Yangi bosh sahifa, barcha bloklar, grafiklar | katta |
| 6 | O'rganish rejimlari | Flashcard redizayn, mavjudlarini tuzatish | katta |
| 7 | Mobil | Pastki navigatsiya, svayp, responsive audit | o'rta |
| 8 | AI Chat | To'liq redizayn, streaming, tarix | katta |
| 9 | Yangi rejimlar | Cloze, talaffuz, teskari, xatolar ustida ish | o'rta |
| 10 | Admin panel | Rol, bo'limlar, audit log | katta |
| 11 | Sifat | A11y, holatlar, performance, PWA, Telegram bot | o'rta |

**1-fazani birinchi kun bajar** — ular kichik, lekin foydalanuvchiga ta'siri katta.

Har faza oxirida:
```
1. npm run build && npm run lint && npm run type-check
2. 375px va 1440px da qo'lda ko'rib chiq
3. Klaviatura bilan asosiy oqimni bosib chiq
4. docs/AUDIT_FINDINGS.md dagi tegishli qatorlarni "Holat: bajarildi" ga o'zgartir
5. Commit: "feat(phase-N): <qisqa tavsif>"
```

---

## 15. Ochiq savollar (foydalanuvchidan so'ra)

Bajarish davomida javob kerak bo'ladigan savollar — taxmin qilma, so'ra:

1. Foydalanuvchilar o'z so'zlarini qo'shadimi yoki faqat tayyor to'plamlardan foydalanadimi (yoki ikkalasi)?
2. Monetizatsiya rejasi bormi (bepul/premium)? Bo'lsa, cheklovlar dizaynda hisobga olinishi kerak.
3. Hozircha nechta faol foydalanuvchi bor? (Migratsiya strategiyasi shunga bog'liq — mavjud ma'lumotni yangi SRS jadvallariga ko'chirish kerak.)
4. AI xarajati uchun oylik byudjet qancha? Rate limit shunga qarab belgilanadi.
5. Dark rejim default bo'lsinmi yoki light? (Login sahifa hozir dark — izchillik uchun qaror kerak.)
6. Telegram bot allaqachon bormi yoki noldan qurish kerakmi?
