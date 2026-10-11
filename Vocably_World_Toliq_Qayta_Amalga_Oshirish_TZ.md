# VOCABLY.UZ — VOCABULARY WORLD
## Kod arxitekturasini moslashtirishdan production tekshiruvigacha: to‘liq qayta amalga oshirish uchun texnik topshiriq (TZ)

**Loyiha:** Vocably.uz / Vocabulary World  
**Hujjat turi:** End-to-end technical specification + coding-agent execution brief  
**Maqsad:** bugungi ishlar davomida rejalashtirilgan va bajarilgani haqida hisobot berilgan barcha qismlarni bitta izchil arxitektura asosida qayta tekshirish, zarur joylarini qayta ishlab chiqish, integratsiya qilish va dalillar bilan tasdiqlash.  
**Kim bajaradi:** Claude Code, Codex yoki repository bilan ishlay oladigan coding agent.  
**Asosiy prinsip:** hisobotdagi “bajarildi”, “PASS” yoki “production-ready” yozuvlari avtomatik ravishda to‘g‘ri deb qabul qilinmaydi. Har bir muhim natija real kod, test, build yoki brauzerda bajarilgan tekshiruv bilan tasdiqlanishi shart.

---

# 0. Eng muhim topshiriq

Vocably.uz ichida mustaqil, modulga ajratilgan va keyinchalik kengaytiriladigan **Vocabulary World** 3D web-game tizimini to‘liq amalga oshir. Ish quyidagi ketma-ketlikda bajariladi:

1. Git holatini, mavjud arxitekturani va bugungi o‘zgarishlarni tekshirish.
2. Hozirgi kodni audit qilish va bazaviy test natijalarini olish.
3. Mavjud Vocably arxitekturasini buzmasdan game moduliga moslashtirish.
4. Database modellari va migratsiyalarini xavfsiz tayyorlash.
5. Server-side game session, scoring, ownership va progress tizimini yaratish yoki to‘g‘rilash.
6. Yagona Vocabulary Adapter va SM-2 asosidagi Smart Review tizimini bog‘lash.
7. 3D sahna, Starter Island, personaj, kamera, boshqaruv va mobil joystick’ni to‘liq amalga oshirish.
8. Memory Match, Word Runner, Word Lab va Boss Battle rejimlarini yagona engine’ga ulash.
9. Haqiqiy 3D vizual sifat, asset pipeline, audio va performance’ni yaxshilash.
10. Unit, integration, E2E, security, responsive va production build tekshiruvlarini bajarish.
11. Hujjatlarni yangilash, o‘zgargan fayllarni qayd etish va yakuniy hisobot tayyorlash.

**Bu faqat hujjat yoki maket yaratish vazifasi emas.** Repository mavjud va unga kirish imkoni bo‘lsa, TZ’dagi ishlar kodda amalga oshiriladi. Agar repository’ga kirish, environment, secret yoki real DB talab qilinib, mavjud bo‘lmasa, agent bu cheklovni aniq yozadi va bajarilgan deb ko‘rsatmaydi.

## 0.1. Ma’lum bo‘lgan maqsadli stack — audit bilan tasdiqlansin

Bugungi hisobotlarda quyidagi texnologiyalar qayd etilgan:

- Next.js 16
- Prisma ORM
- PostgreSQL
- Tailwind CSS 4
- Three.js va React Three Fiber (R3F)
- Mavjud authentication mexanizmi (`auth()` ishlatilishi haqida hisobot bor)
- Mavjud Vocably design system

Bularning barchasini `package.json`, lockfile, Prisma schema, source code va haqiqiy config’dan tekshir. Versiyalar yoki nomlar boshqacha chiqsa, haqiqiy holatga amal qil; faqat TZ’ga mos kelishi uchun framework yoki paket versiyalarini sababsiz almashtirma.

## 0.2. Brand va vizual yo‘nalish

Oldingi hisobotlarda quyidagilar qayd qilingan:

- Brand ranglari: `#0a0b2e` va `#00f0b5`
- Fontlar: `Unbounded` va `Manrope`
- UI uslubi: `.panel`, `backdrop-blur` va mavjud dashboard dizayn tizimi

O‘yin Vocably brendiga mos bo‘lsin, lekin muhit faqat neon geometrik shakllardan iborat bo‘lib qolmasin. Asosiy san’at yo‘nalishi — **zamonaviy, stilizatsiyalangan-realistik uchinchi shaxsli 3D sarguzasht**: Fortnite’dan ilhomlangan sifat va jonli atmosfera, ammo o‘ziga xos Vocably dizayni, o‘z modellarimiz va original asset’lar. Fortnite yoki Roblox’ning himoyalangan modellarini, logotiplarini yoki xarita elementlarini ko‘chirish mumkin emas.

Cyber/neon effektlar kerakli quest, portal, XP yoki interaktiv nuqtalarda aksent sifatida qo‘llanishi mumkin. Butun tabiat neon bilan qoplangan bo‘lib, haqiqiy 3D muhit taassurotini yo‘qotmasin.

---

# 1. Repository’ni himoyalash va dastlabki audit

## 1.1. Ish boshlashdan oldin

1. Repository manzili va lokal checkout haqiqatan Vocably.uz’ga tegishli ekanini tekshir.
2. `git status`, `git branch --show-current`, `git log -n 10 --oneline` va mavjud remote’larni tekshir.
3. Foydalanuvchining uncommitted o‘zgarishlarini aniqlab, ustidan yozma.
4. Hozirgi branch/commit’ni qayd et; kerak bo‘lsa alohida work branch yarat. `master` yoki production branch’ni force-push qilma.
5. `.env`, API token, database URL, session secret va shaxsiy ma’lumotlarni terminal log, hisobot, test fixture yoki Git’ga chiqarmagin.
6. Production ma’lumotlari ustida sinov o‘tkazma. Mavjud staging/local test muhitidan foydalan.
7. Avvalgi hisobotlar va game bilan bog‘liq fayllarni top. Fayl nomini taxmin qilib yozma: actual path’larni qidir.

## 1.2. Tekshiriladigan kod va config

- `package.json` va lockfile: paketlar, scripts, package manager, framework version’lari.
- Next.js routes/layouts, server/client boundary va mavjud locale routing.
- Auth configuration va foydalanuvchini serverda aniqlash usuli.
- Vocabulary/card/deck/word modeli va amaldagi o‘rganish/review oqimlari.
- Prisma `schema.prisma`, migration tarixi, PostgreSQL ulanish usuli va indexes.
- Game kodlari: `GameCanvas`, `GameEngine`, `lib/game/`, game actions/API, mode registry va UI route’lari — real yo‘llarini tekshir.
- Game bilan bog‘liq komponentlar, virtual joystick, kamera, input, collision va audio manager.
- Unit/integration/E2E testlar va CI workflow.
- Tailwind 4, design tokens, fonts, theme va UI komponentlari.
- CSP, security headers, CORS, cookie/JWT, rate limiting, input validation va logging.
- Asset’lar: GLB/glTF, teksturalar, audio, litsenziya, fayl hajmi va load strategiyasi.
- Build, lint, typecheck, test, migration validation va bundle/performance holati.

## 1.3. Majburiy audit deliverable’lari

Quyidagilarni yarat yoki mavjud bo‘lsa yangilab, takroriy hujjat yaratma:

- `docs/game/REPOSITORY_AUDIT.md`
- `docs/game/GAME_ARCHITECTURE.md`
- `docs/game/IMPLEMENTATION_PLAN.md`
- `docs/game/PRODUCTION_VERIFICATION_REPORT.md`
- zarur qarorlar uchun `docs/game/ADR-*.md`

Har bir topilma `PASS`, `FAIL`, `PARTIAL` yoki `NOT VERIFIED` bo‘lsin; yonida dalil, fayl yo‘li, test nomi yoki o‘lchov keltirilsin. “Sertifikatlangan”, “minglab foydalanuvchi uchun tayyor” yoki “millionlab yozuvni boshqaradi” kabi da’volar o‘lchovsiz yozilmasin.

## 1.4. Baseline test

Kodga tegishdan oldin mavjud project scripts orqali, imkon bo‘lsa quyidagilarni ishga tushir:

- install/lockfile validation;
- lint;
- typecheck;
- unit test;
- integration test;
- E2E smoke test;
- production build;
- Prisma schema validation va mavjud migration status.

Qaysi tekshiruv mavjud emas yoki environment sababli ishga tushmagan bo‘lsa, ochiq qayd et. Eski test yiqilsa, natijani yashirma; yangi o‘zgarish sababli xato bilan oldindan mavjud xatoni ajrat.

---

# 2. Maqsadli arxitektura

## 2.1. Arxitektura qoidalari

- 3D renderer va vocabulary/game qoidalari bir-biridan ajratilsin.
- Game UI ichida to‘g‘ridan-to‘g‘ri Prisma query yoki database access bo‘lmasin.
- XP, grade, mastery va reward qiymatlari client yuborgan qiymatga ishonib belgilanmasin.
- Har bir mini-game umumiy session/progression/vocabulary xizmatlaridan foydalansin.
- Mavjud auth, account, vocabulary, UI kit va localization tizimining nusxasi yaratilmasin.
- Bir xil vazifa uchun ikkinchi database client, auth tizimi yoki state manager kiritilmasin.
- 3D paketlari faqat kerakli game route’da lazy/dynamic load qilinsin; boshqa Vocably sahifalarining initial bundle’i ortiqcha kattalashmasin.
- Server-only secrets va scoring logic client bundle’ga kirmasin.
- Papkalar va nomlar mavjud repository conventions’ga moslashtirilsin; quyidagi tuzilma maqsadli mantiqiy namuna.

## 2.2. Mantiqiy modullar

```text
Vocabulary World
├── Presentation
│   ├── /vocabulary-world route/page
│   ├── HUD, menus, quest panels, loading/error states
│   ├── responsive/mobile controls
│   └── localization/accessibility
├── 3D Runtime
│   ├── WorldCanvas / scene lifecycle
│   ├── camera + input + player controller
│   ├── terrain/environment/lighting
│   ├── asset loader + animation controller
│   └── interaction/collision layer
├── Game Application
│   ├── start session
│   ├── get prompt
│   ├── submit answer/interaction
│   ├── finish session
│   └── get world/progress state
├── Game Domain
│   ├── typed contracts and session state machine
│   ├── scoring/grade/XP rules
│   ├── unlock/achievement rules
│   ├── mode registry
│   └── SRS adapter
├── Game Modes
│   ├── Memory Match
│   ├── Word Runner
│   ├── Word Lab
│   └── Boss Battle
├── Data/Adapters
│   ├── existing vocabulary adapter
│   ├── session/progress repository
│   └── safe server-side database access
└── Existing Vocably platform
    ├── auth/user identity
    ├── database/content/decks/cards
    ├── subscriptions/entitlements, if applicable
    └── existing learning/review modules
```

## 2.3. Route va browser rendering

- Asosiy entry route — mavjud locale va routing qoidalariga mos `/vocabulary-world` yoki mos lokal prefiksdagi route.
- Agar Next.js server components ishlatilsa, WebGL talab qiladigan 3D komponent browser/client boundary’da yuklansin.
- SSR vaqtida `window`, `document`, WebGL yoki browser-only API ishlatilmasin.
- Faqat game route Three.js/R3F bundle’ini yuklasin.
- Loading, network error, asset error, WebGL unavailable va fallback holatlari chiroyli ko‘rsatilsin.

---

# 3. Database va ma’lumotlar modeli

Bugungi hisobotlarda quyidagi modellarning qo‘shilgani aytilgan: `Word`, `UserWordProgress`, `GameSession`, `WorldProgress`. Ularni ko‘r-ko‘rona yana qo‘shma. Avval mavjud Prisma schema’da ayni ma’nodagi model/relationship bormi, amaldagi Vocabulary/Flashcard/Deck modeli mavjudmi — tekshir. Mavjud modeldan adapter orqali foydalanish afzal. Dublikat `Word` yoki progress manbasini faqat asoslangan arxitektura qarori va migration rejasi bilan yaratish mumkin.

## 3.1. Zarur domen ma’lumotlari

Mavjud schema bilan moslashtirib, tizim quyidagi ma’lumotlarni ifodalashi kerak:

### Vocabulary item

Mavjud ma’lumot manbasi orqali quyidagilarga murojaat qilish imkoni bo‘lsin:

- stable ID;
- inglizcha so‘z/ibora;
- tarjima yoki ma’no;
- definition/example — platformada bo‘lsa;
- pronunciation/audio — mavjud bo‘lsa;
- image/illustration reference — mavjud bo‘lsa;
- category/deck/tags/difficulty — mavjud bo‘lsa;
- content status va owner/access rules.

Maydon nomlari haqiqiy Prisma modelidan olinadi; yangi duplicate vocabulary source bo‘lmasin.

### UserWordProgress / review state

- user ID + vocabulary item ID;
- current mastery/review state;
- correct/incorrect attempt summary — mavjud dizaynga qarab;
- ease factor, interval, repetition count va next review timestamp — SM-2 tanlansa;
- last reviewed timestamp;
- version/timestamps, zarur bo‘lsa.

### GameSession

- session ID;
- authenticated user relation;
- mode ID;
- world/level/quest ID, agar tegishli bo‘lsa;
- lifecycle status: ready/in-progress/completed/abandoned/expired;
- started/completed timestamps;
- prompt/attempt uchun zarur server-side reference’lar;
- final server-calculated score, grade va XP;
- idempotency key yoki yakunlash holati;
- review update natijasi/logging uchun kerakli metadata.

### WorldProgress

- user relation;
- unlocked world/level’lar;
- total XP va level — bular boshqa authoritative manbada bo‘lmasa;
- quest/challenge completion;
- achievements/streak — mavjud Vocably tizimiga qarab, dublikat qilmasdan.

## 3.2. Integrity va migration

- `userId + vocabularyItemId`, session owner/status va asosiy query’lar uchun indekslar ko‘rib chiqilsin.
- XP awarding va session completion transaction yoki atomik/idempotent usulda bajarilsin.
- Bitta session ikki marta yakunlansa XP ikki marta qo‘shilmasin.
- Mavjud production ma’lumotlari o‘chirilmasin yoki reset qilinmasin.
- Har bir migration lokal/staging muhitida sinovdan o‘tsin.
- Zarur bo‘lsa backup, backfill, rollback va recovery rejasi yozilsin.
- Production DB URL aniqlanmasa yoki ruxsat bo‘lmasa production migration’ni ishga tushirma.

---

# 4. Authentication, authorization va backend xavfsizligi

Hisobotda `app/api/game/actions.ts` ichida `auth()` va ownership guard qo‘shilgani aytilgan. Bu path’ning amaldagi framework konvensiyasiga mosligi va real ishlatilishi tekshirilsin. Zarur bo‘lsa mavjud route/action strukturasiga moslashtir; faqat ko‘rsatilgan nomga mos bo‘lishi uchun yangi noto‘g‘ri path yaratma.

## 4.1. Majburiy qoidalar

1. Har bir private game operation serverda authenticated user’ni mavjud auth mexanizmi orqali aniqlaydi.
2. Client yuborgan `userId` ishonchli identity hisoblanmaydi; identity session’dan olinadi.
3. Foydalanuvchi faqat o‘z session’i va progressiga murojaat qila oladi.
4. `sessionId` validatsiya qilinadi; session user’ga tegishli, active va kerakli holatda ekanligi tekshiriladi.
5. XP, grade, correct answer va boss damage client payload’dan autoritativ qabul qilinmaydi.
6. Server prompt/answer context’ni tekshiradi. Iloji boricha to‘g‘ri javob kaliti va scoring qoidalari clientga yuborilmaydi.
7. Runner collision faqat client animation event’i sifatida ko‘riladi; client “to‘g‘ri darvozadan o‘tdim” desa ham, savol/gate tanlovi server-side session bilan bog‘lanib tekshiriladi.
8. Boss Battle’da ko‘rinadigan zarba animatsiyasi local bo‘lishi mumkin, ammo haqiqiy natija/XP faqat server tekshirgan attempt’lardan kelib chiqadi.
9. Duplicate requests, double-click, retry va network reconnection idempotent boshqariladi.
10. Input validation amaldagi schema validation vositasi bilan bajariladi.
11. Stack trace, secret, server path, javob kaliti yoki boshqa user ma’lumotlari client error’da chiqmaydi.
12. Mavjud rate-limit va security standartlari ishlatilsin. Keraksiz custom security layer yozilmasin.
13. CSP/CORS/security headers, cookie/token strategiyasi audit ruxsatisiz susaytirilmaydi.
14. API’lar user ownership va access policy bo‘yicha integration test bilan tekshirilsin.

## 4.2. Tavsiya etilgan use-case’lar

Aniq API shakli mavjud project’ga mos tanlansin. Mantiqan quyidagi amallar bo‘lishi kerak:

- world/progress holatini olish;
- game session boshlash;
- session uchun prompt/round ma’lumotini olish;
- answer/interaction event yuborish;
- sessionni yakunlash;
- natija/history olish;
- zarur bo‘lsa abandon/resume flow.

Serverga uzatiladigan payload minimal va typed bo‘lsin. To‘g‘ri javobni, XP’ni yoki mastery’ni client aytib bermasin.

---

# 5. Umumiy Game Engine va typed contracts

## 5.1. Yagona session lifecycle

Har bir game quyidagi umumiy jarayonga moslashsin:

`ready → in_progress → completed`

Qo‘shimcha terminal/abnormal holatlar: `abandoned`, `expired`, `failed`. Noto‘g‘ri transition’lar server va domain layer’da rad etilsin.

## 5.2. Game mode registry

Mode’lar typed registry orqali aniqlansin. Masalan:

- `memory`
- `runner`
- `word-lab`
- `boss-battle`

Har bir mode o‘zining UI, prompt generator, input semantics va natija ko‘rinishiga ega bo‘lsin, lekin umumiy quyidagi xizmatlarni ishlatsin:

- start/session lifecycle;
- vocabulary adapter;
- answer validation;
- scoring/grade/XP;
- review event;
- progress saving;
- analytics/event logging, mavjud va privacy talablariga muvofiq bo‘lsa.

Yangi mode qo‘shish mavjud mode’larning asosiy kodini nusxalashni talab qilmasin.

## 5.3. State ajratilishi

- **UI state:** panel, modal, audio toggle, menu.
- **Local game state:** animatsiya, hozirgi prompt, vaqtinchalik tanlov/combo.
- **Server-authoritative state:** session, tekshirilgan attempt, XP, mastery, unlock va final natija.

Server-side ma’lumotlar local state’ga qarab doimiy yozib yuborilmasin. Network xatosida foydalanuvchiga tushunarli holat ko‘rsatilsin; retry xavfsiz bo‘lsin.

---

# 6. Scoring, Grade, XP va progression

Hisobotda deterministik XP hamda S/A/B/C grade tizimi borligi aytilgan. Ular bir joyda, aniq qoidalar bilan belgilanib, unit test bilan tasdiqlansin.

## 6.1. Scoring qoidalari

- Har bir game uchun score formula hujjatlashtirilsin.
- To‘g‘ri javob, noto‘g‘ri javob, timeout, qayta urinish va yakunlash qoidalari aniqlansin.
- Tezlik bonusidan foydalanilsa, faqat tezlikka ortiqcha ustunlik berilmasin; foydalanuvchi taxmin bilan bosib XP yig‘a olmasin.
- Grade chegaralari konfiguratsiya qilingan va test bilan qamrab olingan bo‘lsin.
- XP client emas, server hisoblasin.
- Bitta session uchun reward idempotent bo‘lsin.
- Bir xil natijani qayta yuborish total XP yoki history’ni buzmasin.

## 6.2. World progression

- Starter Island ochiq boshlang‘ich hudud bo‘lsin.
- Keyingi hududlar level, quest yoki mastery shartiga bog‘lanishi mumkin; shartlar yagona progress service’da bo‘lsin.
- HUD’dagi XP/level server qaytargan authoritative ma’lumot bilan sinxronlansin.
- Locked portal foydalanuvchiga qanday shart bajarilishi kerakligini tushuntirsin.
- Foydalanuvchi refresh qilganda saqlangan progress qayta yuklansin.
- O‘yin ichidagi kosmetik reward’lar keyinchalik qo‘shilishi mumkin; birinchi versiyada to‘lov/real pul mukofoti qo‘shilmasin.

---

# 7. Vocabulary Adapter va Smart Review (SM-2)

## 7.1. Vocabulary Adapter

Adapter mavjud Vocably vocabulary source’dan o‘yin uchun data view yaratadi. U faqat bitta mini-game uchun yozilmasin; barcha mode’lar undan foydalansin.

Majburiy xususiyatlar:

- source model va game-domain model orasidagi mapping bitta joyda bo‘lishi;
- user’ning ruxsatli deck/words tanlovini hurmat qilish;
- duplicate prompt’larni bir sessiyada cheklash;
- bir xil/juft ma’noli distractor’larni noto‘g‘ri ishlatmaslik;
- zarur maydon yo‘q bo‘lsa (audio/image/definition) tegishli rejim uchun fallback yoki aniq empty state;
- user darajasi va review due holatiga qarab so‘z tanlash;
- demo/static vocabulary production flow’da tasodifan qolib ketmasligi.

## 7.2. SM-2 algoritmi

Hisobotda SM-2 implemented deb aytilgan. Uni algoritm tavsifi bilan tekshir; faqat modul nomi mavjudligi yetarli emas.

- Javob sifati va grade mapping aniq bo‘lsin.
- Ease factor, interval, repetitions va next review due hisoblari SM-2 qoidalariga mos bo‘lsin.
- Xato javobdan keyin reset/lapse qoidalari to‘g‘ri ishlasin.
- Interval va ease factor uchun xavfsiz chegaralar bo‘lsin.
- Bitta attempt bir necha marta review’ga yozilmasin.
- Barcha mini-game’lar alohida review jadvali yuritmasin; bitta shared review service/adapter ishlatsin.
- Parallel answer requests review qiymatlarini buzmasin; kerak bo‘lsa transaction/optimistic concurrency ishlatilsin.
- Mavjud Vocably review engine bo‘lsa, ikkinchi scheduler yaratishdan ko‘ra adapter bilan uni kengaytirish afzal.

## 7.3. O‘rganish sifati

Game score va vocabulary mastery bir xil ko‘rsatkich emas. Foydalanuvchi bir marta variantni tasodifiy topsa, bu so‘zni to‘liq o‘zlashtirdi degani bo‘lmasin. Active recall, spelling, audio recognition va sentence context kabi turli mashqlar turli dalillarni to‘plashi mumkin; model sodda, tushuntiriladigan va test qilinadigan bo‘lsin.

---

# 8. 3D web runtime va Starter Island

## 8.1. Texnologik talab

Agar mavjud stack React/Next.js bo‘lsa, Three.js + React Three Fiber asosiy 3D renderer bo‘lishi mumkin. `@react-three/drei` kabi yordamchi kutubxonalar faqat real ehtiyoj bo‘lsa qo‘shilsin. Fizika engine’i (masalan, Rapier) faqat haqiqiy collision/rigid-body talab qilinsa tanlansin; keraksiz paket kiritilmasin.

## 8.2. Starter Island sahnasi

Birinchi playable area quyidagilarni o‘z ichiga olsin:

- o‘yinchi yurishi mumkin bo‘lgan terrain;
- yer qatlami, qoyalar, tabiiy balandliklar;
- sifatli daraxtlar, o‘tlar va boshqa o‘simliklar;
- suv, qirg‘oq yoki sharshara kabi kamida bitta muhit elementi;
- uzoqdagi tog‘lar/landshaft va atmosferik depth;
- yo‘llar, kichik inshootlar yoki xarita landmark’lari;
- interaktiv sandiq/portal/quest point;
- HUD va aniq quest objective;
- kamida bitta vocabulary vazifasiga olib boradigan interaction;
- start point, respawn/return point va chegaralar.

Orol faqat tekis plane, bir nechta box/cone va neon chiziqlardan iborat bo‘lib qolmasin. Prototip primitive’lari vaqtinchalik bo‘lsa, ular ro‘yxatga olinsin va muhim foreground asset’lari professional model bilan almashtirilsin.

## 8.3. Haqiqiy 3D model va materiallar

- Modellar imkon qadar GLB/glTF formatida.
- PBR materiallar (base color, roughness, normal, zarur bo‘lsa metallic/occlusion) izchil ishlatilsin.
- Terrain, tree, rocks, building, chest, portal va player model asset’lari alohida optimallashtirilsin.
- Asset’larning commercial use huquqi/litsenziyasi qayd etilsin.
- Yuqori resolution texture’lar zaruratga qarab cheklansin; bir xil materiallarni qayta ishlatish va instancing ko‘rib chiqilsin.
- Yoritish, shadow, tone mapping, fog/sky va post-processing o‘lchangan holda ishlatilsin.
- Neon/emissive material faqat muhim interaction, quest marker va ayrim effektlarga aksent bo‘lsin.
- Particle va postprocessing mobil performance’ni buzmasin.

## 8.4. Personaj

- Original yoki tegishli litsenziyaga ega rigged 3D character.
- Idle, walk, run, jump, landing va interaction animatsiyalari.
- Animation state machine input va velocity bilan sinxron.
- Character ground’ga mos tursin, havoda noto‘g‘ri siljimasin.
- Camera character’ni tabiiy kuzatsin, devor/terrain ichiga kirmasin.
- Harakatda foot sliding, T-pose, model scale xatosi, clipping yoki keskin teleport bo‘lmasin.
- Animation bo‘lmagan asset ishlatilsa, bu cheklov hujjatlashtirilsin; “professional animation” deb noto‘g‘ri da’vo qilinmasin.

## 8.5. Kamera va boshqaruv

Desktop:

- WASD/strelkalar — yurish;
- mouse movement/drag — kamera orbitasi yoki tanlangan third-person control;
- Space — sakrash;
- E — yaqin interaction;
- Escape/menu — pause/settings.

Mobil:

- virtual joystick;
- alohida jump va interact tugmalari;
- touch event’lar bir-biriga xalaqit bermasin;
- pointer/touch tugmani qo‘yib yuborganda harakat to‘xtasin;
- virtual joystick signali page → canvas → engine zanjiri orqali ishonchli uzatilsin;
- UI modal ochilganda movement input pause qilinsin.

Movement `deltaTime`’ga asoslangan bo‘lsin; FPS o‘zgarishi tezlikni o‘zgartirmasin. LERP/acceleration ishlatilsa, responsive control saqlansin va input kechikishi sezilmasin.

## 8.6. Collision va interaction

- Player island chetidan uchib ketolmasin; playable boundaries va respawn bo‘lsin.
- Grounding, obstacles, walls, doors, chest va game gates uchun collision/trigger logic bo‘lsin.
- Sandiq interaction distance va line-of-sight/priority qoidalari aniq bo‘lsin.
- E/tap faqat yaqin valid object’ga ishlasin.
- Collision event har frame serverga yuborilmasin; faqat meaningful gameplay events yuborilsin.
- Character va scene geometry o‘zaro clipping qilmasligi uchun kerakli collider’lar bo‘lsin.

---

# 9. Mini-game 1 — Memory Match

Bu birinchi to‘liq yakunlanadigan va umumiy engine’ni tekshiradigan mini-game bo‘lsin.

## 9.1. Game loop

1. User world’dan Memory/quest point’ni tanlaydi.
2. Server session yaratadi va vocabulary prompts tayyorlaydi.
3. UI/3D maydon kartochkalarni namoyish qiladi.
4. Foydalanuvchi English word ↔ translation, word ↔ definition yoki tegishli pair’larni moslashtiradi.
5. Match/attempt natijalari session qoidalari bilan tekshiriladi.
6. Session tugaganda natija, XP, grade va review update serverda hisoblanadi.
7. Summary va keyingi tavsiya ko‘rsatiladi.

## 9.2. Talablar

- Mavjud vocabulary’dan kelgan dinamik so‘zlar; hard-coded demo set production’da bo‘lmasin.
- Takror kartalar noto‘g‘ri yaratilmasin; sessiya ichida unique IDs bo‘lsin.
- Bir juftlikni ketma-ket qayta tanlash abuse hisoblanmasin; scoring qoidasi aniq bo‘lsin.
- Harakat animatsiyalari va feedback (match, mismatch, completion) aniq, lekin haddan tashqari sekin bo‘lmasin.
- Keyboard/touch/desktop va mobil input ishlasin.
- Audio/image yo‘q bo‘lsa broken UI ko‘rsatmasin.
- Empty state, loading, error, retry va exit state mavjud bo‘lsin.
- XP faqat server tasdiqlagan natija asosida berilsin.

---

# 10. Mini-game 2 — Word Runner

## 10.1. Gameplay

- Third-person personaj yo‘lda oldinga harakatlanadi.
- Prompt ko‘rsatiladi va ikki yoki undan ko‘p gate variantlari paydo bo‘ladi.
- O‘yinchi mos yo‘nalishni tanlaydi.
- Gate bilan to‘qnashuv/trigger faqat bir marta qayd qilinadi.
- Tanlangan gate session savoliga bog‘lanadi; server natijani tekshiradi.
- To‘g‘ri/noto‘g‘ri javobga mos feedback, score va keyingi prompt yuz beradi.
- Sessiya tugaganda server-authoritative summary chiqadi.

## 10.2. Texnik qoidalar

- Collision/gate trigger `debounce` yoki per-gate consumed state bilan bir marta ishlasin.
- O‘yinchi bir savol uchun ikki gate’ni bosib, ko‘p XP ololmasin.
- Serverga gate ID/choice ID kabi minimal tanlov yuborilsin, to‘g‘ri javob va score client’dan qabul qilinmasin.
- FPS pasayishi collision’ni o‘tkazib yubormasin.
- Reset/restart vaqtida oldingi gate listener’lari va timer’lar tozalansin.
- Joystick va klaviatura bilan yo‘nalish tanlovi ishlasin.
- Noto‘g‘ri tanlovdan keyingi qoidalar (damage/loss/continue) hujjatlashtirilsin.

---

# 11. Mini-game 3 — Word Lab

## 11.1. Rejimlar

- spelling: so‘z harflarini to‘g‘ri tartibga keltirish yoki yozish;
- listening: audio orqali so‘zni tanish, agar manbada audio mavjud bo‘lsa;
- definition/translation: ma’noga mos so‘zni topish;
- sentence context: gapdagi bo‘sh joyga to‘g‘ri so‘zni kiritish.

## 11.2. Talablar

- Keyboard va mobil input to‘g‘ri ishlasin.
- Case, apostrophe, whitespace va punctuation qoidalari inglizcha so‘zlar uchun aniq belgilansin.
- Server javobni authoritative tarzda tekshirsin.
- Audio autoplay qilinmasin; user playback’ni boshqarsin.
- Audio/definition/exemplar ma’lumot yo‘q bo‘lsa, faqat mavjud bo‘lmagan kontentga tayanadigan prompt yaratilmasin.
- So‘zlar qiyinligi va review statusiga mos tanlansin.
- Xatolar foydalanuvchini kamsitmaydigan, o‘rgatuvchi feedback bersin.

---

# 12. Mini-game 4 — Boss Battle

## 12.1. Gameplay loop

- Boss intro va aniq objective.
- To‘g‘ri vocabulary javobi — hujum imkoniyati yoki damage.
- Xato — zarar kamayishi, himoya yoki qayta urinish kabi hujjatlashtirilgan natija.
- Boss HP va player health UI’da ko‘rsatiladi, ammo haqiqiy progress server session qoidalaridan kelib chiqadi.
- Boss defeat/victory faqat server tasdiqlagan shartlar bajarilganda yakunlansin.
- Mukofot, XP, grade va review update yakunda bir marta berilsin.

## 12.2. Talablar

- TorusKnot yoki boshqa dekorativ geometriyani “interaktiv boss” deb hisoblash mumkin emas; boss animatsiyali, targetable entity bo‘lsin.
- Idle/attack/hurt/defeat animatsiyalari mavjud asset imkoniyatiga mos bo‘lsin.
- Attack cooldown, hit feedback va UI state machine aniq bo‘lsin.
- Client damage/HP qiymatini server tekshiruvisiz yakuniy natija deb qabul qilmasin.
- Boss’ni defeat’dan keyin qayta urib, mukofotni takror olish mumkin bo‘lmasin.
- Victory, defeat, pause, retry va exit holatlari sinovdan o‘tsin.

---

# 13. HUD, UI va world UX

## 13.1. HUD

- Vocably logotipi/brand, current world/location.
- XP/level va quest progress.
- Current objective va interaksiya hint’i.
- Settings, sound toggle, pause/resume va exit.
- Session result summary va qayta urinish.
- Desktop va mobile layout bir-biriga mos, lekin qurilma turiga moslashtirilgan bo‘lsin.

## 13.2. UI visual style

- Asosiy UI Vocably design tokens va fonts’ga mos.
- 3D olamda readable contrast bo‘lsin; juda ko‘p blur/glow matnni o‘qishni qiyinlashtirmasin.
- Panel va CTA’lar 3D muhit ustida to‘g‘ri joylashsin; mobil ekranda gameplay’ni ortiqcha yopmasin.
- `prefers-reduced-motion` yoki shunga teng sozlama ko‘rib chiqilsin.
- Rangning o‘zi to‘g‘ri/xato signalining yagona vositasi bo‘lmasin; matn/icon ham ishlatilsin.
- Mavjud locale’lar saqlansin; UI matnlari qattiq kodlanib qolmasin.

---

# 14. Audio va feedback

Hisobotda `SoundManager` orqali SFX va BGM ulangan deb aytilgan. Uni tekshirib, quyidagilarni ta’minla:

- ambient environment sound;
- UI click/hover kerakli joylarda;
- correct/wrong answer feedback;
- chest/open/reward effect;
- Runner gate collision feedback;
- Boss attack/hit/victory sound;
- background music faqat user policy/brauzer ruxsatidan keyin ishga tushsin;
- global sound on/off va alohida music/SFX volume imkoniyati, agar scope ko‘tarsa;
- audio resource’lar cleanup qilinsin va sahnadan chiqilganda memory leak bo‘lmasin;
- litsenziyasi tasdiqlanmagan audio ishlatilmasin.

---

# 15. Asset pipeline va vizual sifat mezonlari

## 15.1. Birinchi sifatli vertikal slice

Avval faqat bitta Starter Island’ni sifatli yakunla:

- start area;
- player character;
- real terrain/landscape;
- daraxt va rocks;
- bitta building/landmark;
- bitta treasure chest/quest;
- bitta ishlaydigan vocabulary task;
- ambient sound va asosiy animation;
- ishlaydigan desktop/mobile controls.

Faqat shu slice ishlagandan keyin ko‘p orol/biome ishlab chiqilsin.

## 15.2. Art quality review

Agent quyidagilarni alohida tekshiradi:

- primitive placeholder qolganmi;
- model’lar scene scale’iga mosmi;
- materiallar plastik yoki haddan tashqari emissive ko‘rinmayaptimi;
- texture stretching/aliasing bormi;
- daraxt/o‘simlik takrorlanishi sun’iy ko‘rinmayaptimi;
- lighting/shadow juda qorong‘i yoki yuvilib ketganmi;
- terrain cheti ochiq/ko‘rinib qolganmi;
- fog/sky horizon’ni tabiiy yashiryaptimi;
- camera character va objective’ni ko‘rsata oladimi;
- UI sahna bilan kurashmayaptimi;
- barcha asosiy asset’larning litsenziyasi qayd qilinganmi.

## 15.3. Performance budget

Talablarni real device’da o‘lchab hujjatlashtir:

- o‘rta sinf desktop’da 60 FPS maqsad;
- zamonaviy telefonlarda kamida o‘ynaladigan, barqaror 30 FPS maqsad;
- renderer pixel ratio device capability bo‘yicha cheklansin;
- `draw calls`, triangles, texture memory, JS bundle va loading time o‘lchansin;
- static objects uchun instancing/batching ko‘rib chiqilsin;
- shadows, particles va postprocessing uchun quality presets bo‘lsin;
- window/tab hidden bo‘lganda animation loop/updates kamaytirilsin;
- GLTF/audio loader’lari cleanup/caching qoidalariga ega bo‘lsin;
- renderer va event listener’lar React unmount’da tozalansin.

Aniq raqamlar faqat profiling’dan keyin hisobotga kiritilsin; o‘lchanmagan natija “60 FPS kafolatlangan” deb yozilmasin.

---

# 16. Error handling, recovery va edge cases

Quyidagi holatlar uchun UI va test bo‘lsin:

- vocabulary bo‘sh;
- session yaratib bo‘lmaydi;
- session muddati tugagan;
- user login qilmagan;
- user boshqa user session’iga murojaat qilgan;
- duplicate submit;
- network uzilib-qaytishi;
- server action/API xatosi;
- Prisma/database xatosi;
- asset yuklanmagan yoki noto‘g‘ri format;
- WebGL mavjud emas yoki context lost;
- audio bloklangan yoki mavjud emas;
- player world boundary’dan chiqishga urinadi;
- mode restart qilinadi yoki foydalanuvchi o‘rtada chiqadi;
- komponent unmount bo‘ladi;
- tab background’ga o‘tadi;
- user progressi boshqa qurilmadan yangilangan bo‘ladi.

Har bir holatda foydalanuvchiga aniq next action ko‘rsatilishi kerak. Stack trace yoki ichki texnik ma’lumotni client’da ko‘rsatma.

---

# 17. Testing va verifikatsiya

## 17.1. Unit tests

- scoring va S/A/B/C grade boundaries;
- XP formula va rounding;
- session state transitions;
- one-time reward/idempotency;
- prompt generation va duplicate handling;
- distractor selection;
- SM-2: first success, repeated success, wrong answer/lapse, interval cap/floor, invalid grade;
- world unlock rules;
- gate collision debounce;
- boss HP/victory rules;
- movement state/input mapping — imkon qadar logic layer’da.

## 17.2. Integration tests

- auth’li user session yarata oladi;
- auth’siz user protected action’ni bajara olmaydi;
- user A user B session/progress’ini o‘qiy yoki o‘zgartira olmaydi;
- client XP yoki correct flag’ni soxtalashtira olmaydi;
- session completion XP’ni faqat bir marta qo‘shadi;
- attempt review engine’ga bir marta uzatiladi;
- Prisma writes/transactionlar to‘g‘ri ishlaydi;
- vocabulary adapter mavjud schema’dan data oladi;
- DB yoki API xatosi mavjud Vocably learning oqimlarini buzmaydi.

## 17.3. E2E testlar

Asosiy flow:

1. test user login qiladi;
2. `/vocabulary-world` sahifasini ochadi;
3. scene yoki aniq fallback ko‘rinadi;
4. Starter Island’da yuradi va interaction point’ga boradi;
5. Memory Match’ni boshlaydi va bir nechta prompt’ga javob beradi;
6. summary/grade/XP ko‘rinadi;
7. progress sahifani refresh qilgandan keyin saqlangan bo‘ladi;
8. keyingi game mode’lar ochilib, boshlanish/yakunlanish flow’i tekshiriladi;
9. mobile viewport/touch simulyatsiyasida asosiy flow ishlaydi;
10. game’dan chiqib, mavjud Vocably bo‘limlariga qaytish mumkin.

## 17.4. Visual / browser QA

- desktop va mobil viewport screenshot’lari;
- game entry va loading;
- Starter Island wide view;
- player movement/camera;
- Memory Match UI;
- Runner gate interaction;
- Lab input;
- Boss health/attack/victory;
- error/fallback.

Skrinshotlar real browser renderidan olinishi kerak; concept art yoki AI-generated rasm production ekranining dalili emas.

## 17.5. Regression

Repository’da haqiqatan mavjud bo‘lgan login, vocabulary, flashcard/review, Reading, Listening, Writing, Speaking, mock test, admin yoki boshqa feature’lar tegishli regression testlardan o‘tsin. Mavjud testni o‘chirish yoki vaqtincha skip qilib green build ko‘rsatish taqiqlanadi; zarur bo‘lsa test o‘zgarishining sababi hujjatlashtirilsin.

---

# 18. Ish bosqichlari va qabul mezonlari

## Phase 0 — Audit va xavfsiz baseline

**Ishlar:** Git holati, actual stack, mavjud game kodlari, test/build baseline, security va data model tahlili.

**Natija:** audit report va risklar ro‘yxati.

**Qabul mezoni:** hech qanday o‘zgarishsiz oldingi holat hujjatlashtiriladi; `PASS/FAIL/NOT VERIFIED` dalilga asoslanadi.

## Phase 1 — Architecture adaptation

**Ishlar:** renderer/domain/server/data qatlamlarini ajratish, route/load boundary, session contracts, game registry, vocabulary adapter contract.

**Natija:** hujjatlashtirilgan architecture va typed interfaces.

**Qabul mezoni:** UI/3D qatlam server/database’ga to‘g‘ridan-to‘g‘ri bog‘lanmagan; mavjud auth/vocabulary bilan integratsiya yo‘li aniq.

## Phase 2 — Database + secure backend

**Ishlar:** mavjud Prisma schema’ni moslashtirish, xavfsiz migratsiyalar, auth, ownership, idempotent sessions, scoring APIs/actions.

**Natija:** session va reward server-authoritative bo‘ladi.

**Qabul mezoni:** auth/ownership/spoofing testlari o‘tadi; duplicate request XP’ni ikki marta bermaydi; migration xavfsiz.

## Phase 3 — Shared vocabulary, scoring va SRS

**Ishlar:** adapter, SM-2, grade/XP rules, progress/unlocks.

**Natija:** barcha mode’lar ishlatadigan yagona learning/progression layer.

**Qabul mezoni:** unit/integration testlar o‘tadi; yangi game alohida SRS/progress yaratmaydi.

## Phase 4 — 3D Foundation + Starter Island

**Ishlar:** dynamic import, canvas, scene lifecycle, terrain, player controller, camera, collision, joystick, HUD, audio foundation.

**Natija:** boshqariladigan va kamida bitta questga yetib borish mumkin bo‘lgan 3D island.

**Qabul mezoni:** desktop/mobile controls, cleanup, load/fallback va basic profiling o‘tadi.

## Phase 5 — Memory Match

**Ishlar:** to‘liq game loop, content selection, scoring, review, summary, XP.

**Qabul mezoni:** real vocabulary bilan session oxirigacha o‘ynaladi; natija saqlanadi va E2E test o‘tadi.

## Phase 6 — Word Runner

**Ishlar:** gate generation, player movement, collision/trigger, session-bound answer verification.

**Qabul mezoni:** har savolga faqat bitta javob qabul qilinadi; server scoring; double award yo‘q.

## Phase 7 — Word Lab

**Ishlar:** spelling, available audio, definition/translation va sentence tasks.

**Qabul mezoni:** data mavjudligiga mos prompt; keyboard/mobile input; server validation.

## Phase 8 — Boss Battle

**Ishlar:** boss state machine, attacks/HP feedback, prompt-answer-damage loop, victory/defeat/summary.

**Qabul mezoni:** boss to‘liq yengiladi/yoki defeat state ko‘rsatiladi; reward faqat server tasdiqlagach bir marta beriladi.

## Phase 9 — Visual Reality Upgrade

**Ishlar:** placeholder asset’larni sifatli licensed GLB/glTF bilan almashtirish, PBR materials, terrain, foliage, water, animation, lighting, natural ambience va world polish.

**Qabul mezoni:** art review’da primitive placeholder’lar inventarizatsiya qilingan; asosiy ko‘rinadigan asset’lar final yoki aniq qayd etilgan exception; real browser screenshot’lar mavjud; performance budget o‘lchangan.

## Phase 10 — Production hardening

**Ishlar:** full regression, accessibility, error recovery, performance, security, deployment/rollback review, final docs.

**Qabul mezoni:** test/build natijalari va `PRODUCTION_VERIFICATION_REPORT.md` dalillar bilan to‘ldirilgan; bajarilmagan ishlar ochiq sanab o‘tilgan.

**Muhim:** phase’lar amalda ketma-ket bajarilsin. Agar keyingi bosqichga o‘tishni to‘sadigan muammo bo‘lsa, u yashirilmasin. Production ma’lumotiga zarar yetkazadigan yoki qaytarib bo‘lmaydigan amal uchun oldindan aniq xavfsiz reja talab qilinadi.

---

# 19. Production Verification Report talablari

`docs/game/PRODUCTION_VERIFICATION_REPORT.md` quyidagi bo‘limlarga ega bo‘lsin:

| Yo‘nalish | Status variantlari | Kerakli dalil |
|---|---|---|
| Auth/ownership | PASS / FAIL / PARTIAL / NOT VERIFIED | test output, tegishli kod va endpoint |
| XP/Grade/idempotency | ... | unit + integration test |
| Vocabulary adapter | ... | source model mapping va test |
| SM-2 | ... | algoritm testlari va misol hisob |
| Memory Match | ... | E2E va browser evidence |
| Word Runner collision | ... | collision test va game flow |
| Word Lab | ... | keyboard/audio/input test |
| Boss Battle | ... | HP/victory/reward test |
| 3D assets/art quality | ... | real browser screenshots, asset inventory |
| Desktop controls | ... | manual/E2E evidence |
| Mobile controls | ... | touch/mobile viewport test |
| Performance | ... | FPS/bundle/asset metrics va device/browser |
| Accessibility | ... | keyboard, contrast, reduced motion checks |
| Database migrations | ... | Prisma validation, staging migration result |
| Regression | ... | mavjud test suites natijalari |
| Production readiness | PASS / FAIL / PARTIAL / NOT VERIFIED | yuqoridagi barcha dalillar va unresolved issues |

Report hech qachon faqat kodning mavjudligiga qarab “PASS” qo‘ymasligi kerak. Real backend/database yoki qurilmada sinab bo‘lmagan funksiya `NOT VERIFIED` bo‘lsin.

---

# 20. Hujjat va yakuniy deliverable’lar

Bajarish yakunida quyidagilar mavjud bo‘lsin:

- `docs/game/REPOSITORY_AUDIT.md` — real boshlang‘ich arxitektura va muammolar.
- `docs/game/GAME_ARCHITECTURE.md` — yakuniy modul chegaralari va data flow.
- `docs/game/IMPLEMENTATION_PLAN.md` — bajarilgan fazalar, bog‘liqliklar, qolgan ishlar.
- `docs/game/PRODUCTION_VERIFICATION_REPORT.md` — dalilga asoslangan tekshiruv natijalari.
- `docs/game/ASSET_INVENTORY.md` — asset, format, o‘lcham va litsenziya.
- Zarur bo‘lsa `docs/game/ADR-*.md` — stack va arxitektura qarorlari.
- Prisma migration’lari va testlar — faqat zarur va xavfsiz bo‘lsa.
- Yakuniy o‘zgargan fayllar ro‘yxati.
- Ishga tushirish, test, build va local verification buyruqlari.
- Qolgan risklar, production’da tekshirilmagan jihatlar va keyingi bosqich.

---

# 21. Definition of Done — loyiha qachon haqiqatan tayyor?

Quyidagi shartlar bajarilmaguncha “100% production-ready” demaslik kerak:

- [ ] Mavjud codebase va bugungi o‘zgarishlar to‘liq audit qilingan.
- [ ] Arxitektura, auth va vocabulary source haqiqiy kod bilan mos.
- [ ] Dublikat models/auth/review engine yaratilmagan yoki qaror asoslangan.
- [ ] Prisma schema/migrations xavfsiz va valid.
- [ ] Server-side ownership va anti-spoofing testlari o‘tgan.
- [ ] XP, grade va session completion idempotent.
- [ ] Shared vocabulary adapter va SRS testlardan o‘tgan.
- [ ] Memory Match, Runner, Lab va Boss Battle o‘ynaladigan va to‘liq flow’ga ega.
- [ ] Starter Island’da haqiqiy 3D movement, camera, interaction va collision mavjud.
- [ ] Mobil joystick real input bilan ishlaydi, pointer/touch stuck state yo‘q.
- [ ] Player animation/asset holati vizual auditdan o‘tgan.
- [ ] Placeholder va licensed asset’lar aniq qayd qilingan.
- [ ] Desktop/mobile browser screenshot’lari real runtime’dan olingan.
- [ ] Build, lint, typecheck, unit/integration/E2E regression natijalari qayd etilgan.
- [ ] Performance va accessibility kamida baseline darajada tekshirilgan.
- [ ] Existing Vocably routes va learning flows regression’dan o‘tgan.
- [ ] Production verification report’da har bir PASS dalil bilan tasdiqlangan.
- [ ] Qolgan muammolar va test qilinmagan joylar yashirilmagan.

---

# 22. Coding agent uchun bevosita bajariladigan yakuniy prompt

**Vazifa:** Ushbu TZ’ni to‘liq bajar. Vocably.uz repository ichida Vocabulary World arxitekturasini audit qil, zarur qismlarni qayta moslashtir, server/backend/data qatlamini xavfsiz holatga keltir, shared vocabulary/scoring/SRS engine’ni to‘g‘rilab, 3D Starter Island va barcha to‘rtta mini-game’ni ishlaydigan holatga yetkaz, so‘ng production verification’ni dalillar bilan bajar.

**Bajarish tartibi:**

1. Git working tree va baseline’ni tekshir; user o‘zgarishlarini saqla.
2. Actual stack, existing vocabulary source, auth, Prisma model va routing’ni tekshir; taxminni fakt sifatida yozma.
3. Audit va implementation plan’ni yoz.
4. Mavjud modellarni qayta ishlat; duplicate Word/Progress/Auth/SRS tizimi yaratma.
5. Typed game contracts, secure session API/actions, ownership va idempotent XP yarat yoki tekisla.
6. Vocabulary adapter, SM-2, score/grade/progression engine’ni unit/integration test bilan qamrab ol.
7. 3D route va scene lifecycle’ni existing Next.js/client boundary’ga mos holda qur.
8. Starter Island, character, camera, movement, collision, joystick, HUD va audio’ni yakunla.
9. Memory Match → Word Runner → Word Lab → Boss Battle tartibida game loop’larni common engine’ga ulab chiq.
10. Cyber/neon effektlarni kerakli UI/gameplay aksentlarida ishlat; muhitning asosiy ko‘rinishi original, yuqori sifatli stylized-realistic 3D bo‘lsin. Placeholder geometriyalar qolsa, ochiq qayd et.
11. Har phase’dan so‘ng mos testlarni ishga tushir va xatolarni tuzat.
12. Real browser’da desktop/mobile flow’larini tekshir, screenshots va performance o‘lchovlarini qayd et.
13. Hujjatlarni yangila va yakuniy verification report tayyorla.
14. Bajarilmagan yoki environment sababli tekshirilmagan ishni PASS deb belgilama. Haqiqiy repository’ga kirish, test server yoki credential yetishmasa, aniq blocker sifatida qayd et.
15. Destructive migration, production DB o‘zgarishi yoki force push bajarma. Har qanday xavfli qadam uchun xavfsiz migration/rollback rejasi bo‘lsin. Git commit’lar loyiha workflow’iga muvofiq tashkil qilinsin; push faqat branch/repo siyosati va ishni yakunlash talablari ruxsat etsa, force push’siz bajarilsin.

**Yakuniy javob formati:**

- Nima real o‘zgartirildi;
- asosiy o‘zgargan fayllar;
- database migration’lar;
- security fix’lar;
- 3D/gameplay funksiyalari;
- test/build natijalari (buyruq va natija bilan);
- real browser screenshot/performance dalillari;
- PASS/FAIL/PARTIAL/NOT VERIFIED jadvali;
- qolgan muammolar va aniq keyingi qadam.

**Hech qachon faqat shu prompt yoki hisobot yozilganligi uchun ish tugadi deb hisoblama. “Done” — kod implementatsiya qilingani, tekshiruvlar o‘tgani va natijalar dalillar bilan qayd etilganini anglatadi.**

---

# 23. Bugungi ishlar bo‘yicha qayta tekshirilishi kerak bo‘lgan checklist

Quyidagi ro‘yxat foydalanuvchi yuborgan oldingi hisobotlarda bajarilgani aytilgan ishlarni bir joyga jamlaydi. Bu ro‘yxat **tasdiqlangan faktlar emas**, har biri repository/test orqali qayta tekshiriladigan talablar:

- [ ] Next.js/Prisma/PostgreSQL/Tailwind va R3F stack versiyalari tasdiqlandi.
- [ ] Vocably design system va fonts qayta ishlatildi.
- [ ] 3D canvas lazy/dynamic load qilinadi.
- [ ] Word/UserWordProgress/GameSession/WorldProgress uchun dublikat bo‘lmagan, mos schema mavjud.
- [ ] Game types/contracts va vocabulary adapter ishlaydi.
- [ ] `/vocabulary-world` route real environment’da ochiladi.
- [ ] Starter Island faqat placeholder primitive’lardan iborat emas yoki qolgan placeholder’lar hujjatlashtirilgan.
- [ ] Auth tekshiruvi barcha private game action’larda mavjud.
- [ ] Session ownership serverda tekshiriladi.
- [ ] XP spoofing, replay va duplicate reward testlari o‘tgan.
- [ ] Game session start/answer/finish server-side flow ishlaydi.
- [ ] Grade va XP formula deterministik va unit test bilan tasdiqlangan.
- [ ] SM-2 algorithm test qilingan va mavjud review tizimi bilan ziddiyatga kirmaydi.
- [ ] Joystick page → canvas → engine zanjiri real mobile input bilan ishlaydi.
- [ ] LERP/smooth movement frame-rate independent va responsive.
- [ ] Word Runner collision/gates bir prompt uchun bitta natija beradi.
- [ ] Boss Battle HP, hit, victory/defeat va reward qoidalari to‘liq ishlaydi.
- [ ] Memory Match, Word Lab va barcha mode’lar to‘liq start-to-finish flow’ga ega.
- [ ] SoundManager SFX/BGM va toggle/cleanup bilan ishlaydi.
- [ ] Cyber-neon shader/materiallar muhitning real 3D sifatiga xalaqit bermaydi.
- [ ] Professional 3D asset’lar, licencing va performance inventarizatsiyasi tayyor.
- [ ] Desktop/mobile runtime screenshots va metrics bor.
- [ ] `PRODUCTION_VERIFICATION_REPORT.md` dalil bilan yangilangan.
- [ ] Git state va commit history toza; uncommitted user changes saqlangan.

**Yakuniy maqsad:** Vocably World’ni shunchaki “kodlari mavjud” holatidan real brauzerda ishlaydigan, server tomonidan xavfsiz boshqariladigan, vocabulary o‘rganish tizimiga integratsiyalangan, vizual jihatdan ishonarli 3D sarguzasht o‘yiniga aylantirish.
