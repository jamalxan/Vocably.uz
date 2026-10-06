# VOCABLY.UZ — TO‘LIQ AUDIT, IELTS PRODUCT REBUILD VA DEVELOPMENT ROADMAP

**Sana:** 20.09.2026  
**Loyiha:** Vocably.uz  
**Audit manbasi:** foydalanuvchi yuborgan `vocably.zip` arxivi + repo ichidagi mavjud audit/TZ hujjatlari + rasmiy IELTS manbalari.  
**Audit turi:** source-level full audit (frontend + backend + DB + exam engine + AI content + admin + security + performance + product/UX).  
**Maqsad:** Vocably’ni oddiy IELTS mashq saytidan professional, computer-first IELTS preparation platformasiga olib chiqish.

---

## 0. MUHIM XULOSA

Vocably’ning hozirgi texnik bazasi yomon emas. Aksincha, unda quyidagi kuchli poydevorlar mavjud:

- Next.js App Router + React + MongoDB/Mongoose.
- Reading / Listening / Writing / Speaking / Mock uchun alohida exam engine.
- Server-authoritative timer.
- Javob kalitlarini exam client’ga chiqarib yubormaslik uchun sanitizatsiya.
- Writing AI grader.
- Speaking audio upload + transcription.
- Vocabulary uchun SRS/SM-2 asosidagi review engine va ko‘p mashq rejimlari.
- Admin panel va AI content studio skeleton’i.
- R2 asosidagi kontent fayl saqlash modeli.
- AI router, idempotency va fallback arxitekturasi uchun poydevor.
- Security auditlarda ko‘plab muhim masalalar allaqachon tuzatilgan.

Lekin hozirgi holatda men Vocably’ni **“IELTS uchun professional, ishlab chiqarishga tayyor, to‘liq avtomatlashtirilgan platforma”** deb hisoblamayman. Asosiy sabablar:

1. **IELTS content validation yetarlicha qat’iy emas.** Ayrim asosiy format talablar warning bo‘lib qolgan, publish’ni bloklamaydi.
2. **AI kontent import haqiqiy end-to-end pipeline emas.** PDF/audio → classify → parse → assemble → QA → publish orchestrator/worker hali real ulangan emas.
3. **Admin AI workflow ortiqcha texnik.** Admin taskKey/model/fallback/temperature kabi narsalarni ko‘rishga majbur bo‘lyapti; oddiy “faylni yuborish → AI o‘zi joylashtirsin” UX kerak.
4. **AI Reading import hozir faqat oz sonli question type’larni qabul qiladi.** Qolgan IELTS task turlarini yaqin turga almashtirish yoki tashlab yuborish — professional kontent pipeline uchun noto‘g‘ri.
5. **Speaking baholash rasmiy IELTS mezonining 4-mezoni — Pronunciation’ni real baholamaydi.** Hozirgi grader matn asosida 3 kriteriy beradi va pronunciation band hisobiga kirmaydi.
6. **General Training Reading scoring past xom ballarda to‘liq emas.** Hozir jadvalda 15 dan past natijalar 4.0 ga clamp qilinadi.
7. **Overall band barcha bo‘limlar to‘liq bo‘lmasa ham hisoblanmoqda.** Bu “partial average”ni rasmiy overall bandga o‘xshatib ko‘rsatishi mumkin.
8. **ExamAttempt live ExamTest’ga bog‘langan.** Immutable test version/snapshot yo‘q; published test o‘zgarsa eski attempt review natijasi bilan mismatch xavfi bor.
9. **Exam autosave/heartbeat har safar butun Mongo hujjatini save qiladi.** Uzoq muddatda write amplification va scale muammosi berishi mumkin.
10. **Teacher roli hali yo‘q.** User role faqat `user/admin`.
11. **Subscription/entitlement/billing qatlami yo‘q.** `/narxlar` hali placeholder.
12. **Vocabulary data user hujjatiga ichki massiv sifatida bog‘langan.** Kichik scale uchun qulay, Teacher/Classroom/analytics uchun uzoq muddatda cheklov.
13. **Professional UX polish yetishmaydi:** native `alert()`, ayrim inglizcha UI satrlari, xato/retry holatlari, ayrim accessibility masalalari.
14. **Copyright/licensing nazorati juda muhim.** Repo ichida Cambridge Practice Test PDF mavjud; professional platformada rights provenance birinchi darajadagi metadata bo‘lishi kerak.

### Tavsiya etiladigan yakuniy maqsad

Vocably’ni quyidagi 5 qatlamga ajratish kerak:

**Assessment Engine → Learning/Curriculum Engine → AI Content Studio → Teacher/Classroom → Entitlement/Billing**

Shunda sayt nafaqat mock ishlatadi, balki foydalanuvchi uchun **diagnostika → individual reja → daily practice → vocabulary → writing → speaking → mock → xatolar tahlili → qayta mashq** yopiq siklini beradi.

---

# 1. AUDIT METODOLOGIYASI

Tekshiruv quyidagilarni qamrab oldi:

- `src/app/**` — sahifalar va route’lar.
- `src/components/**` va `src/features/**` — exam UI, admin UI, vocabulary UI.
- `src/lib/**` — scoring, validation, SRS, AI, auth, DB access.
- `src/lib/models.js` — MongoDB/Mongoose modellar.
- `docs/**` — mavjud TZ, audit va AI pipeline hujjatlari.
- `package.json` — stack va dependency baseline.
- public audio/PDF asset strukturasining mavjudligi.
- old audit va current source o‘rtasidagi farqlar.
- rasmiy IELTS format/scoring manbalari.

### Reproducibility natijasi

Arxivdagi node_modules qayta tiklangach:

- `npm run lint` → **PASS**
- `npm run type-check` → **PASS**
- `npm run test` → **MUHITDA START BO‘LMADI**: arxivdagi optional native `rolldown` binding yetishmaydi.
- `npm run build` → **MUHITDA TO‘LIQ RUN BO‘LMADI**: Next SWC native package uchun internetdan download talab qilindi, sandbox’da registry tarmog‘i mavjud emas.

Repo ichidagi oldingi audit hujjati 17.09.2026 sanasida lint/type-check/test/build toza o‘tganini qayd etadi. Ushbu yangi arxiv auditida build/test’ni aynan shu sandbox sharoitida qayta tasdiqlashning iloji bo‘lmadi; bu **kod xatosi deb emas, dependency/runtime muammosi deb** qayd etilsin.

---

# 2. RASMIY IELTS FORMATIGA MOSLIK — NIMA QURILISHI KERAK

Vocably computer-first bo‘lishi ayniqsa muhim: IELTS 2026-yil o‘rtalaridan boshlab global miqyosda paper-based testni to‘xtatishini, testlar computer’da o‘tkazilishini e’lon qilgan; ayrim bozorlarda Writing on Paper varianti alohida bo‘lishi mumkin. Shu sabab Vocably’ning asosiy mock UI’si **kompyuter imtihon tajribasiga** maksimal yaqin qurilishi kerak.

### Rasmiy asosiy format

**Listening:** 4 parts, 40 questions, taxminan 30 daqiqa; audio bir marta eshittiriladi; turli aksentlar ishlatiladi.  
Manba: IELTS official Listening format.

**Academic Reading:** 60 daqiqa, 3 section, 40 savol, umumiy matn uzunligi 2150–2750 so‘z; bir nechta question types mavjud.  
Manba: IELTS official Academic Reading format.

**Academic Writing:** 60 daqiqa, 2 task; Task 1 kamida 150 so‘z / taxminan 20 daqiqa; Task 2 kamida 250 so‘z / taxminan 40 daqiqa; Task 2 Writing score’da ikki baravar og‘irlikka ega.  
Manba: IELTS official Academic Writing format.

**General Training Writing:** Task 1 — letter, Task 2 — essay; 150/250 so‘z va 20/40 daqiqa.  
Manba: IELTS official General Training Writing format.

**Speaking:** 11–14 daqiqa, 3 parts; Part 2’da 1 daqiqa prep va 2 daqiqagacha long turn. Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy va Pronunciation teng baholanadi.  
Manba: IELTS official Speaking/scoring format.

**Overall band:** Listening + Reading + Writing + Speaking natijalarining 4 ta komponenti o‘rtachasi olinadi va nearest half band bo‘yicha yaxlitlanadi.  
Manba: IELTS official scoring.

---

# 3. ENG MUHIM TOPILMALAR — P0/P1/P2

## P0 — publish yoki score noto‘g‘ri bo‘lishi mumkin bo‘lgan muammolar

### P0-01 — AI Reading import barcha IELTS task turlarini qabul qilmaydi

**Fayl:** `src/lib/exam/aiImportSchema.ts`

Hozirgi AI schema faqat:

- true/false/not given
- yes/no/not given
- short answer
- matching information
- multiple choice single

turlarini qabul qiladi.

Prompt esa boshqa turlarni “yaqin turga almashtirish yoki tashlab ketish”ni buyuradi.

Bu professional IELTS platformada **qabul qilinmaydigan xatti-harakat**. Masalan matching headings, summary/table/flow-chart, matching sentence endings, diagram label kabi task’lar real IELTS ekotizimining bir qismi.

### Tuzatish

AI schema to‘liq exam DSL’ni qamrashi kerak. AI quyidagilarni ajrata olishi shart:

- `multiple_choice_single`
- `multiple_choice_multi`
- `sentence_completion`
- `short_answer`
- `note_completion`
- `table_completion`
- `flowchart_completion`
- `summary_completion`
- `summary_completion_bank`
- `matching_features`
- `matching_sentence_endings`
- `diagram_label`
- `true_false_notgiven`
- `yes_no_notgiven`
- `matching_headings`
- `matching_information`
- `form_completion`
- `map_label`
- `plan_label`

AI hech qachon “eng yaqin type”ga o‘zboshimchalik bilan almashtirmasligi kerak. Noaniq bo‘lsa → `needs_review`.

---

## P0-02 — Speaking pronunciation scoring mavjud emas

**Fayl:** `src/lib/exam/speakingGrader.ts`

Hozirgi grader:

- Fluency & Coherence
- Lexical Resource
- Grammatical Range & Accuracy

ni score qiladi.

`pronunciationNote` mavjud, lekin pronunciation band hisobiga kirmaydi va audio akustik xususiyatlar real tahlil qilinmaydi.

Bu IELTS formatiga to‘liq mos emas.

### Tuzatish

Speaking grading 2 qatlam bo‘lishi kerak:

**Layer A — speech/audio analysis**
- pronunciation score
- intelligibility
- phoneme-level/confidence signals
- speech rate
- hesitation
- pause distribution
- repeated words
- filled pauses
- self-correction
- duration

**Layer B — language/rubric AI**
- Fluency & Coherence
- Lexical Resource
- Grammar

Yakuniy Speaking score 4 kriteriy asosida olinadi.

AI natijasi doim **“estimated band”** sifatida ko‘rsatilishi kerak; rasmiy examiner natijasi deb ko‘rsatilmasin.

---

## P0-03 — General Training Reading scoring 15 dan past raw score’larda noto‘g‘ri

**Fayl:** `src/lib/exam/scoring.ts`

Hozirgi `GENERAL_TRAINING_READING_TABLE` faqat 15–40 oralig‘ini to‘liq qoplaydi va 15 dan past raw score’larni 4.0 ga clamp qiladi.

Bu real natijani noto‘g‘ri ko‘rsatishi mumkin.

### Tuzatish

- Official scoring’ni “test version dependent” sifatida modelga kiritish.
- Har bir test uchun `bandTable` optional override bo‘lishi mumkin.
- Agar mapping noma’lum bo‘lsa, tizim “estimated conversion” deb ko‘rsatishi yoki natijani raw score bilan cheklashi kerak.
- 4.0 ga avtomatik clamp qilish **o‘chirilsin**.

---

## P0-04 — Overall band partial score sifatida chiqishi mumkin

**Fayl:** `src/lib/exam/scoring.ts`

`overallBand()` mavjud bo‘lgan section bandlarni o‘rtacha qiladi.

Shu sabab Writing/Speaking hali yo‘q bo‘lsa ham overall chiqishi mumkin.

### Tuzatish

Ikki xil qiymat ajratilsin:

- `sectionAveragePreview` — faqat practice uchun.
- `officialStyleOverall` — faqat 4 komponent to‘liq bo‘lganda.

Full mock natijasida 4 ta score bo‘lmasa overall band **“pending”** bo‘lsin.

---

## P0-05 — Immutable ExamTestVersion yo‘q

**Fayllar:**
- `src/lib/models.js`
- `src/lib/exam/attemptServer.ts`
- `src/app/api/exam/attempts/[id]/route.js`

`ExamAttempt` faqat `testId` saqlaydi va review paytida current `ExamTest`ga murojaat qiladi.

### Kelajakdagi xavf

Admin published testni o‘zgartiradi → eski user attempt review qilinadi → savol matni, answer key, task yoki audio boshqa versiyaga o‘tib ketishi mumkin.

### Tuzatish

Yangi model:

`ExamTestVersion`

Minimal maydonlar:

```text
versionId
parentTestId
versionNumber
snapshot
contentHash
createdBy
createdAt
publishedAt
status
```

Attempt:

```text
attempt.testVersionId
```

Review har doim immutable snapshot’dan ishlaydi.

---

# 4. CONTENT VALIDATOR — HOZIRGI HOLAT VA REBUILD

**Fayl:** `src/lib/exam/contentValidator.ts`

Validator mavjudligi yaxshi, lekin blocking rules yetarli emas.

## Hozirgi muhim kamchiliklar

### Reading

Hozir passage 650–1000 so‘z warning bilan tekshiriladi.

Bu internal heuristic bo‘lishi mumkin, lekin official IELTS Academic Reading uchun asosiy format mezoni **3 section va jami 2150–2750 so‘z**. Validator aynan shu global strukturani blocking rule sifatida tekshirishi kerak.

### Listening

25–35 daqiqa warning ishlatilgan. Official saytda “approximately 30 minutes” deyiladi; qat’iy 25–35 “official rule” sifatida ko‘rsatilmasin.

### Yetishmayotgan blocking rules

Reading:

- exactly 3 passages (full academic test uchun)
- exactly 40 questions
- global q numbering 1–40
- total text length 2150–2750 words (Academic)
- General Training total length uchun alohida rule
- question type / module compatibility
- matching headings: headings > paragraph count
- matching information: paragraph bank validity
- matching features: bank va reuse semantics
- matching sentence endings: endings > beginnings
- multiple choice option count
- multi-select `selectCount`
- accepted answer non-empty
- word limit semantics
- no duplicate answer keys where impossible
- image existence + imageAlt
- hotspot coordinate validation

Listening:

- exactly 4 parts
- exactly 40 questions
- 10 questions per part
- audio asset exists
- duration metadata valid
- transcript exists for practice/review mode
- no duplicate part order
- allowed question types only
- part context exists
- answer count aligned to question count
- mock mode `onceOnly=true`

Writing:

- exactly 2 tasks
- order 1/2
- Academic Task 1 must have valid visual information
- General Training Task 1 must be letter-style task
- min words 150/250
- no sample answer leaked into exam client
- image access/alt

Speaking:

- 3 parts
- Part 1 reasonable question set
- Part 2 exactly one cue card
- prep 60 sec default unless content is intentionally customized
- speak 120 sec default
- Part 3 question set
- duration 11–14 min target

### Yangi validator arxitekturasi

`validateStructure()`  
`validateIELTSFormat()`  
`validateAnswerKeys()`  
`validateMedia()`  
`validateAccessibility()`  
`validateDifficulty()`  
`validateLanguage()`  
`validateDuplication()`  
`validateCopyright()`  
`validateAIQuality()`

Har biri alohida modul bo‘lsin.

Publish faqat:

```text
blockingErrors = 0
rightsApproved = true
requiredMediaResolved = true
answerKeyIntegrity = 100%
aiQaScore >= threshold
```

bo‘lsa ishlasin.

---

# 5. MOCK — QANDAY QURISH KERAK

## Asosiy prinsip

Mock — “oddiy random test page” emas.

U alohida **Exam Simulation Engine** bo‘lishi kerak.

### Full Mock IA

1. Pre-check / device check
2. Candidate intro
3. Instructions
4. Listening
5. Section transition
6. Reading
7. Section transition
8. Writing
9. Submit
10. L/R automatic score
11. Writing AI grading queue
12. Speaking’ni alohida Speaking Mock sifatida topshirish
13. Final 4-skill report

### Speaking masalasi

Real IELTS Speaking alohida 11–14 daqiqalik uch qismli speaking interview sifatida o‘tkaziladi. Shuning uchun Vocably’da uni L/R/W bilan bitta 2.5–3 soatlik timerga qo‘shishdan ko‘ra:

**“Full Mock” = L/R/W exam simulation**  
**“Speaking Mock” = shu test package’ning alohida 11–14 min simulation’i**

qilish aniqroq.

Biroq user uchun final dashboard’da ikkalasi birgalikda “Full IELTS readiness score” ko‘rinishida jamlanishi mumkin.

## Mock UI’da bo‘lishi kerak

### Listening

- top timer
- section/part indicator
- audio progress
- volume
- question navigator
- answered state
- flagged state
- visible instruction block
- computer-first layout
- audio bir marta play qilinadigan mock mode
- test tugaganda transition

### Reading

- chap panel: passage
- o‘ng panel: questions
- scroll split
- highlight
- note
- font size
- zoom
- question navigator
- flag
- answered count
- progress
- remaining time
- section indicator
- “Finish Section”

### Writing

- prompt chap/yuqori qismda
- response editor
- word count
- Task 1 / Task 2 switch
- timer
- task progress
- note area practice’da
- full-screen writing mode
- paste/copy behavior logging faqat analytics uchun
- mock mode’da no hints

### Result

Bitta “score” emas, quyidagilar:

```text
Overall Band
Listening
Reading
Writing
Speaking

Strengths
Weaknesses
Most common errors
Question type performance
Time management
Vocabulary weaknesses
7-day action plan
```

---

# 6. READING — QO‘SHILISHI KERAK BO‘LGAN FUNKSIYALAR

## Exam mode

- official computer-like split layout
- paragraph labels A/B/C…
- persistent question navigator
- highlight
- notes
- flag
- answered state
- task type label
- jump-to-question
- automatic scroll restore
- font controls
- keyboard shortcuts
- responsive mobile fallback

## Practice mode

Exam mode’dan tashqari:

- explanation
- evidence paragraph
- keyword/paraphrase map
- “why this answer”
- distractor analysis
- timer optional
- skill drill
- task-type drill
- passage-level drill
- band target

## Diagnostic analysis

Har xatoni quyidagi taxonomy bilan saqlash:

```text
skimming
scanning
paraphrase
vocabulary
inference
specific detail
main idea
writer opinion
matching logic
careless error
word-limit error
```

Shunda AI “Siz Reading’da yomon” demaydi; masalan “Matching Headings’da main idea aniqlash zaif” deydi.

---

# 7. LISTENING — PROFESSIONAL REBUILD

Official Listening 4 parts / 40 questions / approximately 30 minutes / audio once only. Turli aksentlar ham ishlatiladi.

## Part design

### Part 1

- everyday conversation
- 2 speakers
- form completion / basic factual detail

### Part 2

- single speaker
- public/social information
- map/plan/summary

### Part 3

- educational conversation
- multiple speakers
- matching / MC / discussion

### Part 4

- academic monologue
- note/summary/table/sentence completion

## Practice mode

- replay allowed
- 0.75x / 1x / 1.25x speed (practice only)
- transcript after submit
- transcript with highlighted evidence
- dictation mode
- spelling drills
- numbers/dates/names
- distractor analysis
- accent exposure

## Mock mode

- replay disabled
- recording once only
- no transcript
- server-authoritative part state
- auto transition

---

# 8. WRITING — PROFESSIONAL LEARNING SYSTEM

## Academic Task 1

Task library:

- line graph
- bar chart
- pie chart
- table
- process
- map
- mixed charts

## General Training Task 1

Task library:

- formal letter
- semi-formal letter
- informal letter

## Task 2

Task classifier:

- opinion
- discussion
- advantages/disadvantages
- problem/solution
- two-part question

## Editor

- exact word count
- task timer
- paragraph detection
- spelling hints practice mode
- grammar hint practice mode
- band-criteria checklist
- structure assistant
- save drafts
- compare attempts

## AI feedback

Har submissiondan keyin:

- estimated band
- 4 criterion score
- criterion explanation
- sentence-level corrections
- vocabulary upgrades
- grammar patterns
- coherence problems
- task coverage map
- off-topic detection
- missing overview (Task 1)
- weak thesis / unclear position (Task 2)
- repetition detector
- unsupported claims
- paragraph quality

### Muhim

AI “Band 7.5 bo‘ladi” deb faqat model taxminiga tayanmasin.

Output metadata:

```text
graderModel
graderVersion
rubricVersion
confidence
estimatedBand
```

saqlansin.

---

# 9. SPEAKING — ENG KATTA REBUILD

## UI

Part 1:

- examiner prompt
- recording indicator
- timer
- answer complete

Part 2:

- cue card
- 1-minute prep countdown
- note-taking area
- 2-minute speaking timer
- end chime

Part 3:

- examiner-style follow-up
- answer recording

## Audio analytics

Saqlash:

```text
speechRateWpm
pauseCount
longPauseCount
fillerCount
selfCorrectionCount
repetitionRate
pronunciationScore
intelligibilityScore
```

## Learning feedback

Masalan:

```text
Fluency: 6.0
Lexical: 6.5
Grammar: 5.5
Pronunciation: 6.0
Estimated Speaking: 6.0
```

Keyin:

- eng ko‘p takrorlangan 5 so‘z
- 5 ta grammatik xato
- 5 ta pronunciation drill
- 3 ta natural phrase
- 3 ta better answer sample
- next speaking task

---

# 10. VOCABULARY — HOZIRGI KUCHLI QISMNI IELTSGA ULASH

Vocably’da ko‘p vocabulary mode’lar mavjud; bu yaxshi poydevor.

Lekin vocabulary’ni mustaqil “lug‘at o‘yini”dan IELTS curriculum’ning bir qismiga aylantirish kerak.

## Yangi vocabulary layers

### 1. Core SRS

SM-2/review engine qoladi.

### 2. IELTS vocabulary taxonomy

```text
Academic
Education
Environment
Health
Technology
Science
Society
Government
Economy
Work
Culture
Transport
Media
Globalisation
```

### 3. Band target

```text
Band 5
Band 6
Band 6.5
Band 7
Band 7.5+
```

Bu “rasmiy IELTS word list” degan claim emas; ichki curriculum taxonomy bo‘lsin.

### 4. Skill mapping

Har so‘z:

- Reading
- Listening
- Writing
- Speaking

uchun alohida usage context bilan berilsin.

### 5. Error-driven vocabulary

IELTS savolida xato qilindi → shu xato bilan bog‘liq vocabulary avtomatik SRSga qo‘shiladi.

### 6. Writing vocabulary

- synonym choice
- academic collocation
- word form
- register
- noun/verb/adjective family
- sentence transformation

### 7. Speaking vocabulary

- natural phrases
- fillers
- discourse markers
- topic vocabulary
- paraphrase

### 8. Listening vocabulary

- spelling
- numbers
- names
- dates
- fast speech recognition

---

# 11. IELTS PREPARATION CURRICULUM — SAYTDA NIMA YETISHMAYDI

Vocably faqat “test topshirish” emas, “tayyorgarlik” bo‘lishi kerak.

## Onboarding

User ro‘yxatdan o‘tganda:

```text
Target country / institution (optional)
Target band
Exam type: Academic / General Training
Exam date
Current level
Daily study time
```

keyin:

**10–20 daqiqalik diagnostic**.

Diagnostic natijasida:

```text
Current estimated level
Target gap
Best skill
Weakest skill
Recommended daily plan
```

## Dashboard

```text
Target Band: 7.0
Current Estimate: 6.0
Days Left: 43

Today:
[20 min Reading]
[15 min Listening]
[10 min Vocabulary]
[1 Writing Task]
[8 min Speaking]
```

## Adaptive plan

Har hafta:

- weak skill ko‘proq task oladi.
- easy tasks kamayadi.
- repeated mistakes qayta chiqadi.
- vocabulary due list bilan bog‘lanadi.

---

# 12. AI CONTENT STUDIO — USER SO‘RAGAN ASOSIY MODEL

Bu butun mahsulotning eng muhim rebuild qismidir.

## Maqsad

Admin **AI tizimini boshqarmaydi**.

Admin faqat kontent manbasini beradi.

### Ideal workflow

```text
1. Admin PDF / DOCX / audio / image / ZIP yuboradi.

2. AI avtomatik fayllarni tahlil qiladi.

3. AI quyidagilarni aniqlaydi:
   - book
   - test
   - module
   - section
   - part
   - passage
   - question group
   - question number
   - answer key
   - audio
   - transcript
   - image
   - writing task
   - speaking task

4. AI barcha qismlarni birlashtiradi.

5. AI exact exam schema'ga normalize qiladi.

6. Structural validator ishlaydi.

7. AI QA ishlaydi.

8. Low-confidence itemlar review queue'ga tushadi.

9. Rights/license tekshiriladi.

10. Ready bo‘lsa publish candidate yaratiladi.
```

## Admin ko‘rishi kerak bo‘lgan UI

Faqat:

### Upload

`Faylni tashlang` drag-and-drop.

### AI status

```text
✓ Fayllar qabul qilindi
✓ 3 ta test aniqlandi
✓ Reading: 120/120 savol
✓ Listening: 120/120 savol
✓ Writing: 6 task
✓ Speaking: 6 task
✓ 28 audio bog‘landi
✓ 8 rasm bog‘landi
✓ Answer key tekshirildi
⚠ 3 ta noaniq item
```

### Exception review

Faqat muammolarni ko‘rsatadi.

Admin kerak bo‘lsa:

`AI tavsiyasi → ko‘rish → qabul qilish`

### Expert settings

`model / fallback / temperature / cost` faqat advanced mode’da.

Oddiy admin bularni ko‘rmaydi.

---

# 13. AI PIPELINE TEXNIK ARXITEKTURASI

## Kerak bo‘ladigan komponentlar

```text
Web/Admin
   ↓
Upload API
   ↓
ContentBook + ContentAsset
   ↓
Job Queue
   ↓
Orchestrator
   ↓
Workers
   ├─ extract
   ├─ OCR
   ├─ segment
   ├─ classify
   ├─ split sections
   ├─ parse reading
   ├─ parse listening
   ├─ parse writing
   ├─ parse speaking
   ├─ parse answer key
   ├─ extract images
   ├─ process audio
   ├─ align media
   ├─ assemble
   ├─ validate
   ├─ AI QA
   ├─ self-heal
   └─ publish candidate
```

## Worker

Current codedagi kommentlar bilan ko‘rsatilganidek, PDF extraction/ffmpeg/Poppler/uzoq AI chaqiruvlarini Vercel request’iga tiqish noto‘g‘ri.

Shuning uchun real worker alohida process/container bo‘lsin.

### Tavsiya

```text
Next.js
    |
    | enqueue
    ↓
Redis / managed queue
    |
    ↓
Content Worker
    |
    +--> R2
    +--> MongoDB
    +--> AI Provider
```

## Idempotency

Har stage:

```text
taskKey
inputHash
modelId
promptVersion
contentVersion
```

kombinatsiyasidan deterministic idempotency key olsin.

---

# 14. AI’NING QAROR QABUL QILISHI

AI quyidagilarni avtomatik hal qilishi mumkin:

- qaysi section
- qaysi part
- qaysi task type
- qaysi question group
- qaysi audio qaysi part
- qaysi image qaysi question group
- answer key alignment
- duplicate detection
- OCR cleanup
- formatting cleanup
- typo cleanup
- question numbering recovery
- missing media detection
- mock candidate set composition

AI quyidagilarni **hech qachon o‘zi hal qilmasin**:

- copyrighted contentni public qilish
- license scope o‘zgartirish
- billing/payment qarori
- user deletion
- teacher/student permission escalation
- score override’ni examiner sifatida tasdiqlash

---

# 15. SELF-HEAL + QA

AI pipeline bir xatoda odamni bezovta qilmasin.

## Misol

AI:

`Question 18 answer key mismatch`

### Self-heal

1. source page’ni qayta ko‘radi.
2. answer key’ni qayta parse qiladi.
3. question’ni qayta align qiladi.
4. validator’ni qayta ishlatadi.
5. QA qayta ishlaydi.

2 marta muvaffaqiyatsiz bo‘lsa → human review.

## Confidence

Har item:

```text
confidence
sourceEvidence
pageNumber
bbox
reason
```

bilan saqlansin.

Confidence thresholdlar initial sifatida:

```text
>= 0.93 → auto-accept candidate
0.80–0.929 → second AI review
< 0.80 → human review
```

Bu raqamlar **boshlang‘ich policy**, ishlab chiqarish statistikasi bilan keyin kalibratsiya qilinadi.

---

# 16. AUDIO PIPELINE

## Hozirgi muammo

Listening audio statik/public asset ko‘rinishida bor. New content ingestion esa audio processing worker’ga tayanadi, lekin real worker ulanmagan.

## Yangi tizim

Master:

`WAV`

Delivery derivatives:

- WebM/Opus
- AAC/M4A (kerak bo‘lsa)
- fallback

Metadata:

```text
duration
sampleRate
channels
bitrate
language
accent
part
speakerCount
transcript
```

### Audio matching

Filename + transcript + duration + source page context asosida matching.

Noaniq bo‘lsa manual exception.

### CDN

Audio URL’lar immutable version bilan CDN’dan berilsin.

---

# 17. COPYRIGHT / CONTENT RIGHTS — MAJBURIY

Repo ichida Cambridge Practice Test PDF mavjud.

Bu materiallar copyright bilan himoyalangan bo‘lishi mumkin. Vocably’da quyidagi model bo‘lishi shart:

```text
sourceType
publisher
licence
licenceNote
rightsVerifiedBy
rightsVerifiedAt
publishScope
```

## Publish gate

```text
third_party_copyright + public
= BLOCK
```

Bu qoida AI policy’dan ustun bo‘lishi shart.

### Content source turlari

- `own`
- `licensed`
- `public_domain`
- `third_party_copyright`
- `ai_generated_original`

AI-generated original content uchun ham plagiarism/duplication scan bo‘lsin.

---

# 18. TEACHER ROLE — TO‘LIQ MODEL

Hozir User role faqat:

```text
user
admin
```

Teacher qo‘shish kerak.

## Role model

```text
student
teacher
admin
```

Keyinchalik:

```text
superadmin
content_editor
support
```

qo‘shish mumkin.

## Teacher funksiyalari

### Teacher Dashboard

```text
Students: 42
Active: 31
Average band: 5.9
Target 7+: 12
Weakest skill: Writing
```

### Classroom

- class yaratish
- invite link
- student qo‘shish
- student olib tashlash
- role-based access

### Assignments

Teacher:

- Reading task
- Listening task
- Writing task
- Speaking task
- Vocabulary set
- Mock

ni deadline bilan beradi.

### Student Analytics

Har student bo‘yicha:

- L/R/W/S band
- question type weakness
- vocabulary mastery
- streak
- completion
- time spent
- recent attempts
- AI feedback
- teacher feedback

### Teacher feedback

Writing:

- AI feedback
- teacher comment
- band override (audit bilan)

Speaking:

- AI feedback
- teacher comment
- pronunciation notes

### Teacher AI Copilot

Misollar:

`7.0 target, 18 students, Writing Task 2 average 5.5 — individual homework yarat.`

AI:

- task generatsiya qiladi
- vocabulary beradi
- weak skill bo‘yicha mashq tayyorlaydi
- teacher approval’dan keyin assignment qiladi

---

# 19. MULTI-TENANCY — TEACHER UCHUN MUHIM

Teacher qo‘shilishi bilan oddiy `teacherId` yetarli bo‘lmasligi mumkin.

Kelajak uchun:

```text
Organization
  ├─ Teachers
  ├─ Students
  ├─ Classes
  └─ Content
```

Minimal model:

```text
Organization
Classroom
ClassMembership
Assignment
AssignmentSubmission
TeacherNote
TeacherFeedback
```

Permission rule:

Teacher faqat o‘z class/student ma’lumotini ko‘radi.

Admin hamma narsani ko‘radi.

---

# 20. FREE / STANDARD / PREMIUM

User aytgan model bo‘yicha **3 student tarif** ma’qul:

## 1) FREE

Maqsad — yangi userni mahsulotga olib kirish.

Ichida:

- basic vocabulary SRS
- kunlik limited practice
- Reading basic practice
- Listening basic practice
- Writing limited AI feedback
- Speaking limited AI practice
- mini diagnostic
- limited mock
- basic progress

## 2) STANDARD

Asosiy pullik tarif.

Ichida:

- to‘liq Reading practice
- to‘liq Listening practice
- Writing AI grader
- Speaking AI assessment
- full mocks
- adaptive daily plan
- advanced mistake analysis
- full vocabulary curriculum
- more AI usage
- detailed progress history
- no advertising / cleaner UX (agar monetization strategiyasi shunga mos bo‘lsa)

## 3) PREMIUM

Eng yuqori individual tayyorgarlik darajasi.

Ichida:

- yuqori/unlimited-ishlatish limitlari
- advanced Speaking pronunciation analysis
- deep Writing diagnostics
- adaptive mock sets
- personalized AI tutor
- target-band curriculum
- advanced analytics
- priority AI processing
- personalized study reports

### Muhim arxitektura

Feature lock UI’da emas, serverda bo‘lsin.

```text
EntitlementService
UsageMeter
PlanPolicy
Subscription
```

### Metering

```text
mock_count
writing_grades
speaking_minutes
ai_tokens
ai_jobs
vocab_new_words
```

Exact narx va quota keyin biznes qarori bo‘ladi; kod avval policy-based bo‘lsin.

---

# 21. BILLING

Hozir `/narxlar` placeholder.

Pullik tarifga o‘tishdan oldin quyidagilar qurilsin:

- Plan model
- Subscription model
- Entitlement middleware
- Usage counters
- payment provider adapter
- webhook handler
- invoice/receipt state
- renew/cancel/pause
- failed payment state
- grace period
- feature access tests

Payment provider konkret tanlovi alohida biznes/market qarori bo‘lsin; billing core provider-agnostic qurilishi mumkin.

---

# 22. VOCABULARY DATA MODEL REBUILD

Hozir vocabulary user document ichidagi categories/words massivi bilan ishlaydi.

Kichik scale uchun yaxshi, ammo Teacher/Classroom/analytics uchun keyin bottleneck bo‘ladi.

### Kelajak modeli

```text
VocabularyItem
VocabularyDefinition
VocabularyExample
VocabularyAudio
VocabularyCategory
UserVocabularyState
VocabularyReviewEvent
```

`UserVocabularyState`:

```text
userId
wordId
srsState
ease
intervalDays
dueAt
reps
lapses
mastery
skillTags
source
```

Shunda bitta umumiy word item’ni minglab userlar ishlata oladi.

---

# 23. PERFORMANCE — SAYTNI TEZLASHTIRISH REJASI

## P0

### 1. Audio delivery

WAV master faylni clientga bevosita berish o‘rniga optimized derivative + CDN.

### 2. Exam data loading

Bitta attempt uchun hamma section payloadini birdan yuborish shart bo‘lmasa, section-based fetch/prefetch.

### 3. Autosave

Hozir:

`attempt.save()`

Har batchda butun document saqlanadi.

Yangi model:

```text
PATCH only dirty answer
$set answers.q17
```

va client debouncing.

### 4. Heartbeat

Har 15 sec doim Mongo write qilmasin.

Faqat zarur metadata o‘zgarganda yoki heartbeat intervalini alohida lean store’da saqlash.

### 5. Event log

Arbitrary `type`ni enum bilan whitelist qilish.

### 6. Mongo indexes

Kamida:

```text
ExamAttempt: userId + mode + status
ExamAttempt: userId + createdAt
ExamAttempt: testId + createdAt
ReviewItem: bookId + status + severity
IngestJob: status + createdAt
Subscription: userId + status
Assignment: classId + status + dueAt
```

### 7. Cache

Published test metadata / public content uchun Next cache + tag revalidation.

### 8. Client bundles

Mock sahifasidagi og‘ir chart/exam UI bo‘laklarini `dynamic()` bilan yanada aniq ajratish.

### 9. No giant data in AppContext

Vocabulary, chat va exam state umumiy global context’da ortiqcha yuk bo‘lmasin.

## Internal performance targets

- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- Exam first interactive < 2s target
- audio start < 1.5s target on good connection

---

# 24. SECURITY / DATA INTEGRITY

## Hozir yaxshi bo‘lganlari

- owned-attempt check
- server-side sanitization
- server errors umumlashtirilgan
- chat media upload validation
- rate limit qatlamlari
- admin route’larda requireAdminUser
- security headers borligi oldingi auditda qayd etilgan

## Keyingi muhim ishlar

### 1. Teacher RBAC/ABAC

Teacher hech qachon boshqa teacher studentlarini ko‘rmasin.

### 2. AI prompt injection defense

PDF ichidagi matnni “instruction” emas, **untrusted source** deb yuborish.

Prompt format:

```text
SYSTEM RULES
SOURCE DOCUMENT
----
[untrusted content]
----
OUTPUT SCHEMA
```

### 3. Upload verification

Declared MIME emas, magic bytes tekshirilsin.

### 4. Audio privacy

Speaking audio retention policy:

- how long
- delete option
- admin access
- teacher access

### 5. AI audit

Har grader/import:

```text
model
promptVersion
schemaVersion
inputHash
cost
latency
confidence
```

### 6. PII

Student speaking audio/transcript va writing essaylar privacy-sensitive content sifatida access-control ostida bo‘lsin.

---

# 25. UX / PROFESSIONALISM — HOZIR TOZALANISHI KERAK

## 1. Native alert()

Repo bo‘yicha native `alert()/confirm()` ishlatilgan joylar mavjud.

Replace:

- Toast
- Confirm modal
- Inline validation

## 2. Language consistency

Exam UI’da inglizcha `Submitting`, `Previous question`, `Next question`, `Loading` kabi satrlar mavjud bo‘lishi mumkin.

Localization layer orqali markazlashtirish.

## 3. Error states

Har API uchun:

```text
loading
success
error
retry
empty
```

bo‘lishi kerak.

## 4. Empty states

“0 ta test” — professional explanatory empty state.

## 5. Skeletons

Oddiy spinner o‘rniga content skeleton.

## 6. Keyboard navigation

Exam’da professional keyboard UX:

- Tab
- Shift+Tab
- Enter
- Arrow navigation
- number shortcuts optional

## 7. Accessibility

- focus trap
- aria-live timer warnings
- button labels
- keyboard completion
- high contrast
- screen-reader structure

---

# 26. ADMIN PANEL — YANGI IA

Hozirgi menu ko‘p texnik tushunchaga bo‘lingan. Professional IA:

```text
ADMIN

Dashboard

Content Studio
  ├─ Upload
  ├─ Processing
  ├─ Review
  ├─ Published
  └─ Media

Exams
  ├─ Tests
  ├─ Mocks
  └─ Questions

Students
Teachers
Classes
Assignments

AI
  ├─ Activity
  ├─ Usage
  └─ Settings (Expert)

Billing
Analytics
Audit Log
Settings
```

---

# 27. CONTENT STUDIO — SINGLE-SCREEN UX

## Bosh ekran

### “Yangi kontent qo‘shish”

```text
[ PDF / ZIP / AUDIO / IMAGE shu yerga tashlang ]

AI kontentni avtomatik aniqlaydi va mos IELTS bo‘limlariga joylaydi.

[Autopilot yoqilgan]
```

Keyin AI:

```text
Detected:
3 tests
9 Reading passages
12 Listening parts
6 Writing tasks
6 Speaking sets
```

Admin faqat exception ko‘radi.

---

# 28. MOCK AUTO-GENERATION

Har yangi published testdan keyin AI:

- single-section practice
- mixed mock
- weak-skill variants

uchun candidate setlar generatsiya qiladi.

### Mock scheduler

Masalan:

```text
har 6 soatda
```

inventory audit.

AI tekshiradi:

```text
Academic Reading: 37 sets
Listening Part 4: 11 sets
Writing Task 1 process: 2 sets
Speaking Part 2: 5 sets
```

va kontent gap’ni topadi.

---

# 29. TEACHER + AI BIRGA ISHLASHI

Teacher “AI kontent tayyorla” deb faqat prompt yozmaydi.

Teacher:

```text
Class 10-B
Target 6.5
Students weakest: Reading matching headings
```

AI:

- 10 matching headings task
- 20 vocabulary words
- 1 mini reading
- 1 homework
- deadline suggestion

yaratadi.

Teacher **Publish/Assign** tugmasi bilan tasdiqlaydi.

---

# 30. LEARNING LOOP — VOCABLY’NING ASOSIY FARQI

Platforma quyidagi loop’ga o'tishi kerak:

```text
Diagnostic
   ↓
Weakness detection
   ↓
Micro lesson
   ↓
Practice
   ↓
Error analysis
   ↓
Vocabulary reinforcement
   ↓
Retry similar task
   ↓
Section test
   ↓
Mock
   ↓
New weakness map
   ↓
Next plan
```

Bu mahsulotning eng katta learning value’sini beradi.

---

# 31. TAVSIYA QILINADIGAN YANGI SAHIFALAR

## Student

```text
/app
/app/diagnostic
/app/study-plan
/app/oqish
/app/tinglash
/app/yozish
/app/gapirish
/app/mock
/app/natijalar
/app/xatolar
/app/lugat
/app/lugat/ielts
/app/pronunciation
/app/grammar
/app/lessons
```

## Teacher

```text
/teacher
/teacher/classes
/teacher/classes/[id]
/teacher/students/[id]
/teacher/assignments
/teacher/content
/teacher/analytics
/teacher/ai
```

## Admin

```text
/admin/content
/admin/content/upload
/admin/content/processing
/admin/content/review
/admin/content/media
/admin/exams
/admin/exams/[id]
/admin/mocks
/admin/teachers
/admin/classes
/admin/billing
/admin/ai/activity
```

---

# 32. BACKEND YANGI MODELLAR

Minimal:

```text
ExamTestVersion
QuestionBankItem
ContentSource
ContentAsset
ContentJob
ContentReview
Organization
Classroom
ClassMembership
Assignment
AssignmentSubmission
TeacherFeedback
Plan
Subscription
Entitlement
UsageLedger
StudyPlan
DiagnosticAttempt
SkillMastery
VocabularyItem
UserVocabularyState
SpeechAnalysis
WritingGrade
```

Mavjud `ContentBook`, `ContentAsset`, `IngestJob`, `ReviewItem`, `AgentAction` modellari saqlanib, keyingi versiya modeli sifatida evolyutsiya qilinishi mumkin.

---

# 33. EXAM QUESTION BANK ARXITEKTURASI

Bitta question faqat bitta testga tegishli bo‘lib qolmasin.

```text
QuestionBankItem
   ├─ source
   ├─ module
   ├─ skill
   ├─ taskType
   ├─ difficulty
   ├─ bandTarget
   ├─ sourceEvidence
   ├─ answerKey
   ├─ explanation
   └─ mediaRefs
```

Test yaratish:

```text
QuestionBank
    ↓
Exam Assembly
    ↓
ExamTestVersion
```

Shunda AI random mock yaratishi osonlashadi.

---

# 34. DIFFICULTY ENGINE

Hozir Flesch-Kincaid kabi oddiy matn metrikasi juda cheklangan.

Yangi difficulty score:

```text
Lexical difficulty
Sentence complexity
Information density
Paraphrase distance
Distractor similarity
Question ambiguity
Skill load
Observed user accuracy
```

### Keyin real empirical calibration

Har test:

```text
facility index
item discrimination
average response time
error rate
```

saqlaydi.

AI-created item’lar real user data orqali qayta kalibratsiya qilinadi.

---

# 35. CONTENT QA — 2 MUSTAHKAM QATLAM

## Layer 1 — deterministic

Kod tekshiradi:

- structure
- numbering
- answer count
- media
- word limit
- JSON schema
- permissions

## Layer 2 — AI QA

AI tekshiradi:

- semantic validity
- ambiguity
- answer evidence
- distractor quality
- IELTS style
- language naturalness
- difficulty
- duplication
- task fidelity

Publish — faqat ikkalasi ham pass.

---

# 36. TESTING — YANGI QA MATRIX

## Unit

- scoring
- SRS
- validators
- question normalization
- answer checking
- entitlements

## Integration

- upload → asset
- ingest → job
- job → test
- test → version
- attempt → result
- teacher → class
- assignment → submission
- subscription → entitlement

## E2E

Playwright bilan:

1. Register/login
2. Onboarding
3. Diagnostic
4. Reading
5. Listening
6. Writing
7. Speaking
8. Mock
9. Results
10. Vocabulary review
11. Teacher assignment
12. Admin content upload
13. AI review
14. Billing

## Performance

- 1 user
- 100 concurrent users
- 500 concurrent users
- 1000 concurrent users

Alohida stress test.

---

# 37. E2E MOCK TEST CASES

Har release oldidan avtomatik:

### Listening

- audio once
- cannot restart in mock
- part transition
- 40 questions
- unanswered allowed
- expired auto transition

### Reading

- 3 passages
- 40 q
- highlight persists
- timer persists
- refresh resume

### Writing

- autosave
- word count
- Task 1/2
- submit
- AI grade queued
- result update

### Speaking

- mic permission
- recording
- stop
- upload
- transcript
- 4-criterion scoring

### Result

- L/R raw score
- bands
- W/S estimated
- overall only when valid

---

# 38. CURRENT SOURCE-LEVEL BUG/RISK REGISTER

| ID | Holat | Muammo | Asosiy fayl | Prioritet |
|---|---|---|---|---|
| EX-01 | Ochiq | AI import question types cheklangan | `src/lib/exam/aiImportSchema.ts` | P0 |
| EX-02 | Ochiq | Speaking pronunciation score yo‘q | `src/lib/exam/speakingGrader.ts` | P0 |
| EX-03 | Ochiq | GT Reading <15 raw 4.0 clamp | `src/lib/exam/scoring.ts` | P0 |
| EX-04 | Ochiq | Partial overall band | `src/lib/exam/scoring.ts` | P0 |
| EX-05 | Ochiq | Immutable test version yo‘q | `src/lib/models.js` / `attemptServer.ts` | P0 |
| EX-06 | Ochiq | Validator full IELTS structure’ni block qilmaydi | `contentValidator.ts` | P1 |
| AI-01 | Ochiq | Real worker/orchestrator ulanmagan | `ingest/route.js`, AI docs | P0 |
| AI-02 | Ochiq | Admin AI workflow texnik va tarqoq | `admin/content/ai/*` | P1 |
| AI-03 | Ochiq | Self-heal/scheduler konsept bor, executor yo‘q | `contentAgent/*` + docs | P1 |
| AI-04 | Ochiq | Answer-key/media alignment engine incomplete | content pipeline | P1 |
| EDU-01 | Ochiq | Diagnostic → study plan loop to‘liq emas | product layer | P1 |
| EDU-02 | Ochiq | IELTS vocabulary skill linkage yetarli emas | vocabulary | P1 |
| EDU-03 | Ochiq | Error-driven curriculum yo‘q | product layer | P1 |
| TCH-01 | Ochiq | Teacher role yo‘q | `User.role` | P1 |
| TCH-02 | Ochiq | Classroom/assignment modeli yo‘q | DB | P1 |
| BILL-01 | Ochiq | Subscription/entitlement yo‘q | product/backend | P1 |
| BILL-02 | Ochiq | `/narxlar` placeholder | `src/app/narxlar/page.jsx` | P2 |
| PERF-01 | Ochiq | Attempt autosave whole-document save | `answers/route.js` | P1 |
| PERF-02 | Ochiq | Heartbeat whole-document save | `heartbeat/route.js` | P1 |
| PERF-03 | Ochiq | Audio optimization/CDN policy | media layer | P1 |
| PERF-04 | Ochiq | Exam bundle/load optimization | exam UI | P2 |
| DATA-01 | Ochiq | Vocabulary embedded user document | `models.js` / words API | P2 |
| UX-01 | Ochiq | Native alert/confirm | many files | P2 |
| UX-02 | Ochiq | Language inconsistency | exam/admin | P2 |
| UX-03 | Ochiq | Error/retry/empty state standardization | app-wide | P2 |
| A11Y-01 | Ochiq | ConfirmModal focus trap | `ConfirmModal` | P2 |
| SEC-01 | Hardening | Teacher isolation/RBAC | new role layer | P1 |
| SEC-02 | Hardening | AI prompt injection from source files | AI worker | P1 |
| LEGAL-01 | Hardening | content rights provenance | content models | P0/P1 |

---

# 39. BOSQICHMA-BOSQICH ROADMAP

## PHASE 0 — Stabilization

### Maqsad
Hozirgi sistemani buzmasdan foundationni muzlatish.

Ishlar:

- ExamTestVersion
- validator rewrite
- scoring fixes
- overall band fix
- API input schema validation
- autosave patch model
- tests

**Natija:** existing feature’lar stabil.

---

## PHASE 1 — IELTS Engine v2

- Reading complete task suite
- Listening exact 4-part engine
- Writing complete Academic + GT
- Speaking 4-criteria system
- full mock UI
- result dashboard

**Natija:** official-formatga maksimal yaqin exam experience.

---

## PHASE 2 — AI Content Studio v2

- unified upload
- worker
- orchestrator
- classifier
- parse
- media alignment
- answer key alignment
- deterministic validator
- AI QA
- self-heal
- review queue
- publish candidate

**Natija:** admin fayl yuboradi, AI qolganini qiladi.

---

## PHASE 3 — Learning Engine

- diagnostic
- target band
- study plan
- adaptive practice
- error taxonomy
- vocabulary linkage
- daily missions

**Natija:** “test sayt” → “IELTS learning platform”.

---

## PHASE 4 — Teacher

- teacher role
- class
- assignments
- analytics
- feedback
- teacher AI copilot

**Natija:** B2B/B2B2C product foundation.

---

## PHASE 5 — Monetization

- Free/Standard/Premium
- entitlement
- usage metering
- payment adapter
- billing webhooks
- upgrade/downgrade/cancel

**Natija:** pullik tarif production-ready.

---

## PHASE 6 — Data/AI optimization

- question bank
- empirical difficulty
- adaptive mock generation
- content gap scanner
- analytics-driven recommendations

**Natija:** AI content va adaptive learning bir tizimga aylanadi.

---

# 40. DEVELOPER UCHUN ANIQ TOPSHIRIQ RO‘YXATI

Quyidagi ro‘yxatni development backlog sifatida ishlatish mumkin.

## P0 — birinchi

- [ ] ExamTestVersion modeli.
- [ ] Attempt’ni exact versionga bind qilish.
- [ ] Partial overall bandni o‘chirish.
- [ ] GT scoring clampni olib tashlash.
- [ ] Speaking pronunciation score architecture.
- [ ] Full AI import schema.
- [ ] Full validator rewrite.
- [ ] Copyright publish gate.
- [ ] Worker queue.
- [ ] Orchestrator.
- [ ] Source file classifier.
- [ ] Answer-key alignment.
- [ ] Audio linking.
- [ ] Test assembly.
- [ ] AI QA.

## P1 — keyingi

- [ ] Mock UI v2.
- [ ] Reading practice modes.
- [ ] Listening practice modes.
- [ ] Writing curriculum.
- [ ] Speaking analytics.
- [ ] Diagnostic.
- [ ] Study plan.
- [ ] Error taxonomy.
- [ ] IELTS vocabulary curriculum.
- [ ] Teacher role.
- [ ] Classroom.
- [ ] Assignment.
- [ ] Teacher analytics.
- [ ] Entitlement service.
- [ ] Subscription model.
- [ ] Autosave patching.
- [ ] Mongo indexes.
- [ ] Audio CDN delivery.

## P2 — polish

- [ ] Native alert/confirm replacement.
- [ ] Full localization.
- [ ] Skeletons.
- [ ] Better empty states.
- [ ] Accessibility hardening.
- [ ] SEO/content polish.
- [ ] Advanced analytics.

---

# 41. DEFINITION OF DONE — “MUKAMMAL” DEB HISOBLASH UCHUN

Vocably IELTS module “done” hisoblanmaydi, agar quyidagilardan biri yo‘q bo‘lsa:

### Exam

- [ ] Academic Reading 3 passage / 40 q
- [ ] GT Reading 3 section / 40 q
- [ ] Listening 4 part / 40 q
- [ ] Writing 2 task
- [ ] Speaking 3 part / 11–14 min target
- [ ] full mock
- [ ] immutable test version
- [ ] server timer
- [ ] refresh recovery
- [ ] result integrity

### Content

- [ ] complete question-type coverage
- [ ] answer key integrity
- [ ] audio integrity
- [ ] image integrity
- [ ] source evidence
- [ ] rights/license metadata
- [ ] deterministic validator
- [ ] AI QA
- [ ] human exception queue

### Learning

- [ ] diagnostic
- [ ] target band
- [ ] daily plan
- [ ] adaptive practice
- [ ] vocabulary SRS
- [ ] error-to-practice loop

### AI

- [ ] upload-and-go
- [ ] automatic routing
- [ ] automatic assembly
- [ ] self-heal
- [ ] confidence
- [ ] review
- [ ] audit log
- [ ] cost cap

### Teacher

- [ ] role
- [ ] classes
- [ ] assignments
- [ ] analytics
- [ ] feedback

### Business

- [ ] Free
- [ ] Standard
- [ ] Premium
- [ ] entitlement
- [ ] usage meter
- [ ] billing

### Quality

- [ ] Unit
- [ ] Integration
- [ ] E2E
- [ ] performance
- [ ] accessibility
- [ ] security

---

# 42. ENG TO‘G‘RI PRODUCT STRATEGIYASI

Vocably’ni “hamma narsani birdan qo‘shamiz” shaklida tartibsiz kengaytirmaslik kerak.

Eng to‘g‘ri ketma-ketlik:

**1. Exam engine to‘g‘rilanadi.**  
**2. Content AI pipeline ishga tushadi.**  
**3. Learning loop quriladi.**  
**4. Teacher qatlamini qo‘shiladi.**  
**5. Free/Standard/Premium monetization qilinadi.**

Agar billingni engine va content quality’dan oldin qursak, foydalanuvchiga “pullik, lekin hali to‘liq emas” tajribasini berib qo‘yamiz.

---

# 43. ENG MUHIM 10 TA NATIJA

1. **Vocably’ning exam core’ini qayta tashlab yuborish kerak emas** — mavjud engine yaxshi poydevor.
2. **Validator va content fidelity eng katta texnik ustuvorlik.**
3. **AI importni oddiy chat emas, pipeline agent qilish kerak.**
4. **Admin AI’da model/temperature emas, natija va exception ko‘rsatilishi kerak.**
5. **Speaking pronunciation alohida real audio analysis talab qiladi.**
6. **Mock’da computer-first IELTS experience asosiy mahsulot bo‘lishi kerak.**
7. **Vocabulary IELTS skills bilan birlashtirilishi kerak.**
8. **Teacher role shunchaki `role='teacher'` emas — classroom + assignment + permission tizimi bilan kelishi kerak.**
9. **Free/Standard/Premium UI’dan oldin entitlement/backend qurilishi kerak.**
10. **Content rights va immutable versioning keyinchalik paydo bo‘ladigan eng qimmat muammolarni oldindan yopadi.**

---

# 44. RASMIY IELTS REFERENCE BASIS

Quyidagi rasmiy IELTS materiallari format qarorlarining asosidir:

- IELTS Academic Reading test format — 60 min, 3 sections, 2150–2750 words, 40 questions va to‘liq question-type ro‘yxati.
- IELTS Academic Listening test format — 4 parts, 40 questions, approximately 30 minutes, once-only recording, varied accents.
- IELTS Academic Writing test format — 2 tasks, Task 1 150 words / ~20 min, Task 2 250 words / ~40 min, four criteria, Task 2 twice weighted.
- IELTS General Training Reading test format — 3 sections, 2150–2375 words, 40 questions.
- IELTS General Training Writing test format — Task 1 letter, Task 2 essay.
- IELTS Scoring in Detail — four component overall average, L/R raw-to-band conversion varies by version, Writing 4 criteria, Speaking 4 criteria.
- IELTS 2026 test delivery update — mid-2026 onwards computer-first/global paper test withdrawal, with selected-market Writing on Paper option.

---

# 45. YAKUNIY TEXNIK HUKM

**Hozirgi Vocably — ishlaydigan foundation + hali tugallanmagan product platforma.**

Eng katta xato hozir mavjud kodni “yana bir nechta page qo‘shib” kengaytirish bo‘ladi. To‘g‘ri yo‘l — mavjud poydevorni saqlab, 5 ta core systemni mustahkamlash:

```text
A. Immutable Exam Engine
B. AI Content Ingestion + QA
C. Adaptive IELTS Learning Engine
D. Teacher/Classroom Platform
E. Entitlement/Billing
```

Shundan keyin Vocably:

```text
Test ishlatadigan sayt
```
dan

```text
IELTSga tayyorlaydigan to‘liq platforma
```
ga aylanadi.

**Muhim: bu hujjat “g‘oya ro‘yxati” emas. U yuqoridagi P0/P1/P2 backlog, architecture va acceptance criteria asosida development master-plan sifatida ishlatilishi mumkin.**

---

# 46. 2026-09-20 — FOYDALANUVCHI BILAN YAKUNIY KELISHILGAN PRODUCT QARORLARI

Ushbu bo‘lim audit yozilgandan keyingi muhokamada aniq kelishilgan qo‘shimcha talablarni bir joyga jamlaydi. Bu bo‘lim yuqoridagi P0/P1/P2 backlog bilan birga ishlatiladi va oldingi texnik rejaning ustiga qo‘shiladi.

## 46.1. Tariflar — 3 ta paket

Vocably’da faqat quyidagi uchta asosiy student tarifi bo‘ladi:

1. **FREE** — platformani sinab ko‘rish va IELTS tayyorgarligini boshlash uchun.
2. **STANDARD** — to‘liq IELTS tayyorgarligining asosiy pullik paketi.
3. **PREMIUM** — shaxsiy AI IELTS Tutor darajasidagi adaptive tayyorgarlik.

Tariflar faqat “savollar soni” bilan emas, foydalanuvchiga beriladigan funksional qiymat bilan farqlanadi.

### FREE

- Reading practice — cheklangan foydalanish.
- Listening practice — cheklangan foydalanish.
- Writing AI check — cheklangan oylik limit.
- Speaking AI practice — cheklangan oylik limit.
- Basic Vocabulary.
- Mini tests.
- Cheklangan Mini Mock.
- Basic progress tracking.
- Asosiy IELTS materiallari.
- AI-generated advanced practice mavjud emas yoki juda cheklangan.
- Deep analytics yo‘q.
- Adaptive personal plan yo‘q.

### STANDARD

FREE’dagi funksiyalarning barchasi +:

- To‘liq Reading practice.
- To‘liq Listening practice.
- Academic Writing Task 1 va Task 2.
- Writing AI feedback va band estimation.
- Task Response / Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy bo‘yicha tahlil.
- Speaking Part 1/2/3 practice.
- Speaking AI feedback.
- Pronunciation analysis.
- To‘liq Mock testlar.
- 4 skill bo‘yicha advanced analytics.
- Weakness analysis.
- Personal study plan.
- Mistake notebook / xatolar banki.
- Vocabulary repetition va review tizimi.
- Reklamasiz foydalanish.
- Yuqoriroq AI limitlari.

### PREMIUM

STANDARD’dagi barcha imkoniyatlar +:

- **AI IELTS Tutor**.
- Foydalanuvchining zaif tomonlarini avtomatik aniqlash.
- Har kunlik adaptive study plan.
- Xatolarga asoslangan avtomatik yangi mashqlar.
- Advanced Writing AI.
- Essay paragraph-by-paragraph analysis.
- Advanced Speaking conversation practice.
- Speaking pronunciation + fluency + grammar + vocabulary + coherence analysis.
- Individual Writing topics.
- Individual Speaking topics.
- Individual Reading/Listening practice generation.
- Full Mock’dan keyin deep performance analysis.
- Target band bilan progress taqqoslash.
- IELTS Readiness / preparedness report.
- Adaptive vocabulary engine.
- Spaced repetition va smart revision.
- Advanced analytics.
- Juda yuqori yoki biznes modelga qarab “fair use” AI limit.

### 46.2. Tariflar uchun dastlabki launch narx taklifi

Narxlar biznesning final tasdiqlangan narxi emas, balki hozirgi suhbatda kelishilgan **boshlang‘ich pricing proposal** sifatida saqlanadi:

- **FREE:** 0 so‘m.
- **STANDARD:** taxminan **69 000 so‘m / oy**.
- **PREMIUM:** taxminan **129 000 so‘m / oy**.

Yillik rejalar uchun dastlabki taklif:

- **STANDARD:** taxminan **599 000 so‘m / yil**.
- **PREMIUM:** taxminan **999 000 so‘m / yil**.

Muhim: narxlar real AI/API xarajati, conversion, retention, support xarajati va foydalanuvchi xatti-harakatlari asosida launchdan keyin qayta optimallashtiriladi. UI/backend’da narxlarni hard-code qilmaslik va entitlement’larni alohida configuration sifatida saqlash kerak.

---

# 47. VOCABULARY — VOCABLY’NING ENG KUCHLI MAHSULOT USTUNI

Vocabulary alohida “flashcard page” bo‘lib qolmasligi kerak. Maqsad — Vocably’ning foydalanuvchini qayta-qayta olib keladigan va IELTS natijasiga bevosita bog‘langan eng kuchli feature’laridan biriga aylantirish.

## 47.1. Asosiy o‘rganish sikli

```text
DISCOVER → UNDERSTAND → RECALL → USE → REVIEW → MASTER
```

### DISCOVER

So‘z foydalanuvchiga quyidagilardan avtomatik kelishi mumkin:

- Vocabulary lesson.
- Reading’da uchragan so‘z.
- Listening’da uchragan so‘z.
- Writing’dagi xato yoki juda oddiy takroriy so‘z.
- Speaking transkriptidagi takroriy/basic word.
- Mock natijasidagi weak vocabulary.
- Teacher tavsiya qilgan word list.

### UNDERSTAND

Har bir so‘z uchun:

- Definition.
- Uzbek/Russian translation konfiguratsiyasi.
- IELTS kontekstidagi misol.
- Collocations.
- Synonyms.
- Antonyms zarur bo‘lsa.
- Word family.
- Part of speech.
- Pronunciation.
- Audio.
- Common mistakes.
- Formal/informal usage.
- Academic usage.

### RECALL

Active Recall asosidagi mashqlar:

- Translation recall.
- Definition → word.
- Word → definition.
- Multiple choice.
- Fill in the blank.
- Context completion.
- First-letter hint.
- Spelling recovery.
- Listening recognition.
- Pronunciation recognition.

### USE

Foydalanuvchi so‘zni real ishlatishi kerak:

- Sentence building.
- Writing sentence.
- Mini paragraph.
- Speaking answer.
- IELTS Part 2/3 answer.
- Synonym replacement.
- Collocation completion.

AI ishlatilgan so‘zni tekshiradi va noto‘g‘ri usage bo‘lsa feedback beradi.

## 47.2. Spaced Repetition

Vocabulary engine foydalanuvchining natijasiga qarab review intervalini o‘zi belgilashi kerak.

Masalan:

```text
New
→ Learning
→ Familiar
→ Weak
→ Review
→ Mastered
```

Faqat “to‘g‘ri/noto‘g‘ri” emas, balki:

- response time,
- confidence,
- repeated errors,
- context usage

ham hisobga olinishi kerak.

## 47.3. IELTS bilan to‘liq integratsiya

Eng muhim talab:

```text
Reading xatosi
        ↓
Vocabulary candidate
        ↓
Recall exercise
        ↓
Speaking/Writing usage
        ↓
Spaced repetition
```

Xuddi shunday Listening, Writing va Speaking natijalari ham vocabulary engine’ga signal beradi.

### 47.4. Premium — Personal AI Vocabulary Coach

Premium foydalanuvchi uchun AI:

- qaysi so‘zlar yodlanmayotganini aniqlaydi;
- qaysi sinonimlar noto‘g‘ri ishlatilayotganini topadi;
- qaysi collocation’larda muammo borligini aniqlaydi;
- foydalanuvchining band target’iga qarab vocabulary plan tuzadi;
- avtomatik review session yaratadi;
- real IELTS uslubidagi yangi mashqlar generatsiya qiladi.

---

# 48. SPEAKING — PROFESSIONAL IELTS-LIKE BAHOLASH TIZIMI

Speaking bahosi “AI 6.5” kabi izohsiz bitta raqam bo‘lmasligi kerak.

IELTS’ning to‘rtta asosiy speaking mezoni alohida ko‘rsatiladi:

1. **Fluency & Coherence**
2. **Lexical Resource**
3. **Grammatical Range & Accuracy**
4. **Pronunciation**

AI har bir kriteriy uchun alohida band estimate va dalillar beradi.

## 48.1. Tavsiya qilinadigan flow

```text
Part 1
→ Part 2 (Cue Card + preparation)
→ Part 3
→ Audio recording
→ ASR transcript
→ Acoustic/prosody analysis
→ Criterion analysis
→ Overall estimate
→ Feedback
→ Next practice
```

## 48.2. Pronunciation alohida real analysis bo‘lishi kerak

Faqat transcript orqali pronunciation baholab bo‘lmaydi. Audio asosida imkon qadar:

- intelligibility;
- word stress;
- sentence stress;
- rhythm;
- chunking;
- hesitation patterns;
- mispronunciation candidates;
- repeated pronunciation issues

tahlil qilinadi.

Model foydalanuvchini “native accent”ga majburlamasligi kerak. Maqsad — tushunarlilik va IELTS kriteriylariga mos kommunikativ ijro.

## 48.3. “Nega bu ball?” funksiyasi

Har bir band estimate bilan:

- transcript evidence;
- sample utterance;
- detected issue;
- improvement suggestion;
- next exercise

ko‘rsatiladi.

AI bahosi **official IELTS score emas**, balki practice estimate ekanligi UI’da ochiq ko‘rsatiladi.

## 48.4. Speaking’dan keyingi adaptive loop

```text
Pronunciation weak
→ pronunciation drills

Low lexical diversity
→ vocabulary exercises

Long pauses
→ fluency drills

Grammar errors
→ targeted grammar practice
```

Shunday qilib Speaking faqat “test” emas, diagnostika + mashq generatoriga aylanadi.

---

# 49. WRITING — PROFESSIONAL IELTS-LIKE BAHOLASH TIZIMI

Writing ham faqat grammar checker bo‘lmasligi kerak.

## 49.1. Assessment criteria

Academic Writing uchun:

- **Task Achievement / Task Response**
- **Coherence & Cohesion**
- **Lexical Resource**
- **Grammatical Range & Accuracy**

Task turiga mos criterion qo‘llanadi.

## 49.2. Writing AI output

Essay yuborilgandan keyin:

```text
Estimated band
+ Criterion scores
+ Overall explanation
+ Strengths
+ Critical problems
+ Sentence-level corrections
+ Better alternatives
+ Vocabulary analysis
+ Grammar patterns
+ Structure analysis
+ Next practice tasks
```

## 49.3. “Why did I get this band?”

AI band estimate’ni dalilsiz bermaydi. Masalan:

- task’ning qaysi qismi yetarlicha rivojlantirilmagan;
- paragraph progression qayerda buzilgan;
- repeated vocabulary qayerda;
- grammar error pattern qaysi;
- qaysi sentence bandga salbiy ta’sir qilayotganini

ko‘rsatadi.

## 49.4. Writing → Vocabulary loop

Writing’da:

- juda oddiy yoki takroriy so‘zlar;
- noto‘g‘ri collocation;
- noto‘g‘ri synonym;
- noto‘g‘ri word family

aniqlansa, ular avtomatik vocabulary review’ga tushadi.

---

# 50. ADMIN AI CONTENT STUDIO — BOOK/PDF/AUDIO → TEST FACTORY

Admin uchun AI texnik konfiguratsiya oynasi emas, **AI Content Factory** bo‘lishi kerak.

## 50.1. Boshlang‘ich workflow — HUMAN IN THE LOOP

Dastlab AI’ga 100% ishonilmaydi.

```text
Admin upload
   ↓
AI understands source
   ↓
AI extracts content
   ↓
AI classifies skill/task
   ↓
AI builds draft
   ↓
Validator
   ↓
AI QA
   ↓
ADMIN REVIEW
   ↓
Approve / Edit / Reject
   ↓
Publish
```

Bu boshlanish bosqichining asosiy xavfsiz modeli.

## 50.2. Admin yuklashi mumkin bo‘lgan materiallar

- PDF.
- DOC/DOCX.
- EPUB yoki qo‘llab-quvvatlanadigan book formatlari.
- Images.
- Audio.
- ZIP/package.
- Alohida reading/listening/writing/speaking materiallari.

## 50.3. AI o‘zi aniqlashi kerak

Admin “bu Reading” deb field tanlamasligi kerak.

AI source’ni tahlil qilib:

- Reading;
- Listening;
- Writing;
- Speaking;
- Vocabulary;
- Mock package;

ni aniqlaydi.

Keyin:

```text
Skill
→ Test type
→ Section/Part
→ Passage/Prompt
→ Question type
→ Options
→ Correct answer
→ Explanation
→ Audio
→ Image
→ Vocabulary
```

ni o‘zi bog‘laydi.

## 50.4. Reading task types

AI har bir savolni mavjud supported schema’ga moslaydi va yangi task type bo‘lsa, “unsupported / needs review” holatiga tushiradi.

AI hech qachon noma’lum formatni yashirincha boshqa savol turiga aylantirmasligi kerak.

## 50.5. Listening

AI audio bilan savollarni bog‘laydi:

- audio file;
- section/part;
- question range;
- transcript;
- answer key;
- optional explanation.

Kelajakda audio segmentlar ham avtomatik belgilanadi.

## 50.6. Writing va Speaking

Writing uchun:

- prompt;
- task type;
- word target;
- instructions;
- image/chart/map/table;
- rubric metadata.

Speaking uchun:

- Part 1 questions;
- Part 2 cue card;
- preparation time;
- Part 3 questions;
- examiner instructions;
- timing.

## 50.7. AI QA

Publish’dan oldin quyidagilar tekshiriladi:

- answer key mavjudmi;
- answer key ambiguous emasmi;
- question passage bilan mosmi;
- question count to‘g‘rimi;
- duplicate savollar bormi;
- media missing emasmi;
- audio o‘qiladimi;
- word count / instruction mosmi;
- task type bilan content mosmi;
- IELTS schema talablariga mosmi.

AI confidence past joylarni admin’ga alohida chiqaradi.

## 50.8. Admin UI

Admin texnik AI parametrlarini ko‘rmasligi kerak.

Asosiy UI:

```text
Upload material
↓
Processing 72%
↓
Detected: IELTS Academic Reading
↓
42 questions found
↓
39 high confidence
3 need review
↓
Review
↓
Approve
↓
Publish
```

Har bir savolda:

- **Approve**
- **Edit**
- **Reject**

bo‘ladi.

## 50.9. Human approval’dan keyingi AI evolution

Boshlanishda:

**AI creates → Human approves.**

Yetarli kontent, feedback va audit data yig‘ilgach:

**AI creates → AI QA → Human reviews exceptions.**

Lekin high-risk content’da human approval doim saqlanishi mumkin.

---

# 51. CONTENT VERSIONING VA AUDIT

AI yoki admin testni o‘zgartirganda eski attempt’lar buzilmasligi shart.

Har bir published test uchun:

```text
ExamTest
ExamTestVersion v1
ExamTestVersion v2
Attempt → exact version snapshot
```

saqlanadi.

AI content import ham:

- source file;
- source checksum;
- generated version;
- AI processing metadata;
- validator result;
- reviewer;
- approval time;
- publication time

bilan audit qilinadi.

---

# 52. IELTS CDI MOCK — REAL EXAM MUHITIGA YAQIN SIMULATOR

Mock shunchaki savollar to‘plami emas. U foydalanuvchiga real IELTS computer-delivered test tajribasiga yaqin muhit berishi kerak.

Bu product **official IELTS exam emas** va buni official test sifatida ko‘rsatmasligi kerak; maqsad — format, vaqt bosimi va interface tajribasini imkon qadar yaqin simulyatsiya qilish.

## 52.1. Mock rejimlari

### Practice Mock

- erkin navigation;
- pause/review mumkin;
- o‘quvchi o‘rganish uchun.

### Exam Simulation

- qat’iy timer;
- realistik section flow;
- minimal yordam;
- section qoidalari qat’iy.

### Secure Mock

- Exam Simulation + kuchli anti-cheating telemetry;
- monitoring;
- suspicious-event logging;
- integrity report.

## 52.2. CDI atmosfera

Mock UI’da:

- clear server-synced timer;
- exam-style question navigation;
- section/part progress;
- answer state;
- instructions screen;
- fixed exam chrome;
- keyboard interaction;
- accessible controls;
- distraction-free fullscreen exam environment

bo‘lishi kerak.

## 52.3. Timer

Timer client JS’ga ishonib qolmasligi kerak.

```text
Server exam start time
+ authoritative end time
→ client countdown
→ periodic synchronization
```

Tab refresh yoki internet uzilishida timer noto‘g‘ri davom etmasligi kerak.

## 52.4. Internet uzilishi

Internet vaqtincha uzilsa:

- javoblar local queue’da saqlanadi;
- reconnect bo‘lganda serverga sync qilinadi;
- conflict resolution deterministic bo‘ladi;
- user javoblari yo‘qolmaydi;
- attempt event log saqlanadi.

## 52.5. Section locking

Exam Simulation’da section tugagach, rasmiy oqimga mos ravishda qaytish cheklanadi.

Navigation policy test turiga qarab server-side enforce qilinadi.

## 52.6. Anti-cheating / integrity

Secure Mock’da quyidagilarni bosqichma-bosqich joriy qilish kerak:

- tab visibility events;
- window blur/focus events;
- fullscreen exit events;
- copy/cut/paste attempt logging;
- devtools-related heuristic signals faqat signal sifatida;
- multiple-session detection;
- suspicious IP/device/session changes;
- answer timing anomaly;
- impossible navigation patterns;
- repeated refresh/reconnect events;
- optional camera/mic proctoring — faqat aniq consent va privacy policy bilan;
- event timeline.

Muhim: anti-cheating signal **avtomatik ravishda “cheat qilgan” hukmini chiqarmasligi** kerak. Tizim “suspicious event” sifatida qayd etadi.

## 52.7. Mock yakuniy natijasi

Natijada:

- Listening estimated band;
- Reading estimated band;
- Writing estimated band;
- Speaking estimated band;
- Overall estimated band;
- skill-by-skill weaknesses;
- question-type weaknesses;
- vocabulary weaknesses;
- recommended next practice;
- readiness trend

chiqariladi.

Overall estimate faqat kerakli component’lar mavjud bo‘lganda chiqariladi va barcha 4 skill uchun scoring qoidalari server-side standardlashtiriladi.

---

# 53. TEACHER ROLE — USTOZLAR UCHUN QATLAM

Teacher oddiy role flag bo‘lmasligi kerak. Alohida classroom/workflow kerak.

Teacher quyidagilarni qila oladi:

- class yaratish;
- student qo‘shish;
- assignment yaratish;
- Reading/Listening/Writing/Speaking task berish;
- Mock belgilash;
- deadline qo‘yish;
- student natijasini ko‘rish;
- Writing’ni qo‘lda tekshirish;
- Speaking recording’ni ko‘rish;
- teacher feedback berish;
- AI feedback’ni ko‘rib chiqish va o‘zgartirish;
- vocabulary list berish;
- student progress’ni ko‘rish;
- class analytics.

### Teacher + AI

Ideal workflow:

```text
Teacher creates assignment
→ AI helps generate/customize task
→ Teacher reviews
→ Students complete
→ AI evaluates
→ Teacher reviews exceptions
→ Teacher gives final feedback
```

Teacher AI’ni o‘rnini bosmaydi; AI ustozning ishini tezlashtiradi.

---

# 54. VOCABLY’NING YAGONA LEARNING LOOPI

Barcha yangi tizimlar bir-biridan ajralgan page bo‘lib qolmasligi kerak.

Yakuniy product loop:

```text
LEARN
  ↓
PRACTICE
  ↓
MOCK
  ↓
ANALYSE
  ↓
WEAKNESS DETECTION
  ↓
VOCABULARY / GRAMMAR / PRONUNCIATION DRILLS
  ↓
TARGETED PRACTICE
  ↓
RE-MOCK
```

Reading, Listening, Writing, Speaking, Vocabulary, Mock va Teacher shu loop’da bir-biriga signal beradi.

---

# 55. YANGI TALABLARNI IMPLEMENTATSIYA USTUVORLIGI

## P0 — darhol

1. Speaking’ning 4-criterion scoring modelini to‘g‘rilash.
2. Writing’ning 4-criterion AI assessmentini to‘liq modelga kiritish.
3. Mock timer + immutable attempt/versioning.
4. AI content ingestion uchun human-review workflow.
5. Full IELTS task-type schema va blocking validator.
6. Vocabulary core + spaced repetition.
7. Reading/Listening/Writing/Speaking/MOCK’ni unified learning analytics bilan bog‘lash.

## P1 — keyingi asosiy bosqich

1. AI Content Factory.
2. Audio/transcript alignment.
3. Advanced vocabulary engine.
4. Speaking audio analysis.
5. Writing deep feedback.
6. CDI-like Exam Simulation.
7. Secure Mock telemetry.
8. Teacher classroom/assignment.
9. Entitlement system.
10. Free/Standard/Premium billing.

## P2 — keyingi scaling

1. Adaptive AI Tutor.
2. AI exception-only content publishing.
3. Advanced proctoring options.
4. School/organization plans.
5. Teacher dashboard expansion.
6. Advanced readiness prediction/diagnostics — faqat tarixiy performance asosida, “official prediction” sifatida emas.

---

# 56. YAKUNIY PRODUCT QARORI

Vocably’ning yo‘nalishi quyidagicha belgilanadi:

**1. IELTS Exam Platform** — Reading, Listening, Writing, Speaking va CDI-style Mock.

**2. IELTS Learning Platform** — Learn, Practice, Mistake Review, Vocabulary, Analytics.

**3. AI Content Factory** — book/PDF/audio → AI draft → QA → human approval → publish.

**4. AI IELTS Tutor** — Premium uchun adaptive personal learning.

**5. Teacher Platform** — classroom, assignment, feedback va analytics.

**6. Monetization** — Free / Standard / Premium entitlement orqali boshqariladi.

Eng muhim arxitektura prinsip:

> **AI hamma ishni avtomatik bajarishga intiladi, lekin boshlang‘ich bosqichda yakuniy content qarorini inson tasdiqlaydi. Data va QA sifati oshgani sari AI avtomatlashtirish darajasi bosqichma-bosqich oshiriladi.**

Shuningdek:

> **Vocabulary Vocably’ning alohida yordamchi funksiyasi emas, balki Reading, Listening, Writing, Speaking va Mock natijalarini birlashtiruvchi markaziy learning engine bo‘lishi kerak.**

Va:

> **Mock oddiy quiz emas — foydalanuvchini real IELTS CDI tajribasiga tayyorlaydigan exam simulation bo‘lishi kerak.**

---

# 57. FINAL DEFINITION OF DONE — YANGI KELISHUVLAR UCHUN

Mazkur qo‘shimcha talablar “Done” hisoblanishi uchun:

- 3 ta tarif backend entitlement bilan ishlaydi;
- pricing UI va backend bir xil source-of-truth’dan foydalanadi;
- Vocabulary’da spaced repetition + active recall mavjud;
- Vocabulary Reading/Listening/Writing/Speaking/Mock xatolari bilan bog‘langan;
- Speaking 4 kriteriy bo‘yicha explainable practice estimate beradi;
- Writing 4 kriteriy bo‘yicha explainable practice estimate beradi;
- AI “why this band” feedback beradi;
- Admin book/PDF/audio/image yuklab, AI draft oladi;
- AI skill/task/media/answer key’ni avtomatik bog‘laydi;
- AI barcha noma’lum task typelarni noto‘g‘ri mapping qilmasdan review queue’ga yuboradi;
- admin approve/edit/reject qila oladi;
- har bir content version immutable audit bilan saqlanadi;
- CDI-style Mock server-authoritative timer bilan ishlaydi;
- reconnect/offline-safe answer persistence mavjud;
- Secure Mock suspicious events’ni qayd qiladi;
- anti-cheating tizimi “signal” va “hukm”ni ajratadi;
- Teacher classroom/assignment/feedback oqimi mavjud;
- barcha modullar yagona analytics + adaptive learning loop’ga ulanadi.
