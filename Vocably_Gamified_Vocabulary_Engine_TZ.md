# VOCABLY.UZ — GAMIFIED VOCABULARY & LEARNING ENGINE
## Mukammal texnik topshiriq (TZ) — Production Ready

**Loyiha:** Vocably.uz  
**Modul:** Gamified Vocabulary & Learning Engine  
**Maqsad:** Vocabulary'ni Vocably platformasining markaziy learning engine'iga aylantirish va uni SRS, active recall, game mechanics, AI, IELTS 4 skill, analytics va personalized learning bilan yagona ekotizimga birlashtirish.

---

# 1. Loyiha maqsadi

Vocably.uz'ga oddiy flashcard tizimi emas, balki foydalanuvchini so'zlarni **tushunish → eslab qolish → qayta chaqirish → kontekstda ishlatish → gapirish/yozish → uzoq muddat saqlash** bosqichlaridan o'tkazadigan learning engine qurilsin.

Yangi tizim quyidagi ochiq manbali loyihalarning foydali konsepsiyalarini o'rganadi:

- **Vocamon / WordSoul** — progression, quest, achievement, game mechanics
- **WordDrop** — spelling, listening, real-time vocabulary game
- **LexiLearn** — SRS, adaptive review, vocabulary practice
- **WordForge** — IELTS/TOEFL vocabulary, AI exercises, gamification
- **ISTS IELTS Study** — IELTS workflow, mistakes, analytics, AI learning concepts

> **MUHIM:** repositorylardan kodni ko'r-ko'rona ko'chirish taqiqlanadi. Har bir repo avval license, dependency, architecture, security va compatibility bo'yicha tekshiriladi. Faqat qonuniy va texnik jihatdan mos qismlar mustaqil ravishda Vocably architecture'iga integratsiya qilinadi.

---

# 2. Asosiy prinsip

## 2.1. Games alohida modul emas

Games vocabulary engine'ga ulanadigan learning interface bo'ladi.

```text
                VOCABULARY ENGINE
                       |
       +---------------+---------------+
       |               |               |
      SRS            GAMES            AI
       |               |               |
       +---------------+---------------+
                       |
                 GAMIFICATION
                       |
          +------------+------------+
          |            |            |
       Reading      Listening    Writing
                                     |
                                  Speaking
                                     |
                                    Mock
                                     |
                                 Analytics
                                     |
                           Personalized Plan
```

## 2.2. Learning loop

```text
DISCOVER
   ↓
UNDERSTAND
   ↓
RECOGNIZE
   ↓
RECALL
   ↓
LISTEN
   ↓
SPELL
   ↓
USE IN CONTEXT
   ↓
WRITE
   ↓
SPEAK
   ↓
SRS REVIEW
   ↓
MASTER
```

---

# 3. Foydalanuvchi uchun asosiy natija

Foydalanuvchi yangi so'zni faqat tarjimasini ko'rib chiqmaydi. Tizim uni bir nechta formatda qayta uchrashtiradi.

Misol:

```text
Word: significant

1. Definition
2. Uzbek translation
3. IPA + audio
4. Example sentence
5. Multiple choice
6. Listen & choose
7. Listen & type
8. Fill in the blank
9. Synonym / antonym
10. Sentence builder
11. Reading context
12. Writing usage
13. Speaking usage
14. SRS review
15. Mastery
```

---

# 4. Vocabulary data model

Har bir `VocabularyWord` kamida quyidagi ma'lumotlarni saqlashi kerak.

## 4.1. Asosiy maydonlar

```text
id
lemma
word
normalized_word
part_of_speech
cefr_level
ielts_relevance
translation_uz
translation_ru
short_definition
detailed_definition
ipa_uk
ipa_us
audio_uk
audio_us
image_url
```

## 4.2. Til bo'yicha ma'lumotlar

```text
examples
synonyms
antonyms
collocations
word_family
common_mistakes
usage_notes
register
frequency_score
topic_tags
```

## 4.3. Quality metadata

```text
source
source_type
content_version
verified_by_admin
ai_generated
ai_review_status
published_at
updated_at
```

AI yaratgan kontent `verified_by_admin=true` bo'lmaguncha production learning pool'ga tushmasin.

---

# 5. User Vocabulary model

Har bir user uchun alohida learning state saqlansin.

```text
user_id
vocabulary_word_id
status
mastery_score
confidence_score
success_rate
failure_count
review_count
streak_count
last_seen_at
last_reviewed_at
next_review_at
current_interval
previous_interval
response_time_avg
listening_accuracy
spelling_accuracy
context_accuracy
writing_usage_score
speaking_usage_score
srs_state
created_at
updated_at
```

---

# 6. Vocabulary mastery

Mastery faqat quiz score asosida hisoblanmasin.

## 6.1. Holatlar

```text
0–20    NEW
21–40   LEARNING
41–60   FAMILIAR
61–80   STRONG
81–95   ADVANCED
96–100  MASTERED
```

## 6.2. Mastery inputlari

```text
Recall accuracy
Listening accuracy
Spelling accuracy
Context usage
Response speed
Repeated success
SRS retention
Writing usage
Speaking usage
```

Mastery modeli keyinchalik versioned bo'lsin, masalan `mastery_algorithm_v1`, `mastery_algorithm_v2`. Algoritm o'zgarsa eski natijalarni yo'qotmasdan migratsiya/taqqoslash imkoni saqlansin.

---

# 7. SRS — Spaced Repetition System

SRS modul butun Vocabulary engine'ning yuragi bo'ladi.

## 7.1. Talab

Oddiy fixed interval emas, foydalanuvchi natijasiga moslashuvchi review scheduling ishlasin.

Boshlang'ich interval misoli:

```text
10 min
1 day
3 days
7 days
14 days
30 days
60 days
120 days
```

Bu qiymatlar hard-coded qilinmasin; configuration orqali boshqarilsin.

## 7.2. Natijaga qarab o'zgarish

Agar user xato qilsa:

```text
mastery ↓
interval ↓
priority ↑
review frequency ↑
difficulty ↓ yoki context simplification
```

Agar ketma-ket to'g'ri javob bersa:

```text
mastery ↑
interval ↑
priority normal
next difficulty ↑
```

## 7.3. Bir so'z — turli recall formatlar

```text
Day 1 → Meaning
Day 2 → Multiple Choice
Day 4 → Listening
Day 7 → Fill Gap
Day 14 → Context
Day 30 → Writing
Day 60 → Speaking
```

Bitta formatni ko'p takrorlash sun'iy mastery ko'rsatkichini bermasligi kerak.

## 7.4. Review states

```text
New
Learning
Due
Overdue
Again
Hard
Good
Easy
Mastered
Suspended
```

## 7.5. Priority score

Due review queue quyidagilar asosida tartiblansin:

```text
overdue duration
failure count
mastery weakness
importance / IELTS relevance
recent mistakes
retention risk
user goal
```

---

# 8. Active Recall Engine

Foydalanuvchi ma'noni ko'rib tanlash bilangina cheklanmasin.

Exercise progression:

```text
Recognition
   ↓
Guided recall
   ↓
Free recall
   ↓
Context recall
   ↓
Production
```

Masalan:

```text
Easy   → choose word
Medium → choose meaning
Hard   → fill gap without options
Expert → produce sentence / spoken response
```

---

# 9. Game Center

Vocably'ga `Vocabulary Games` alohida bo'lim sifatida qo'shilsin.

## 9.1. Word Match

Word ↔ Translation / Definition

Natija:

```text
Score
Accuracy
Combo
XP
Weak words
```

## 9.2. Memory Cards

Yopiq kartalar orqali word ↔ meaning matching.

## 9.3. Multiple Choice

CEFR va user performance asosida adaptive difficulty.

## 9.4. Listen & Choose

Audio → correct word.

## 9.5. Listen & Type

Audio → exact spelling.

## 9.6. Word Drop

Vaqtli real-time spelling game.

## 9.7. Fill in the Blank

Avval options bilan, keyinchalik options'siz.

## 9.8. Sentence Builder

Aralashtirilgan words → grammatically correct sentence.

## 9.9. Definition Challenge

Definition → word.

## 9.10. Synonym / Antonym Challenge

Academic/IELTS vocabulary uchun.

## 9.11. Image → Word

Rasm → vocabulary.

## 9.12. Word → Image

Word → correct image.

## 9.13. Speed Challenge

Vaqtga qarshi savollar.

## 9.14. Vocabulary Boss

Haftalik comprehensive challenge:

```text
10 meaning
10 listening
10 spelling
10 context
10 synonym/antonym
```

---

# 10. Game difficulty

Har bir game quyidagi difficulty modeliga ega bo'lsin:

```text
Easy
Medium
Hard
Expert
```

Difficulty quyidagilarga qarab o'zgaradi:

```text
user accuracy
response time
streak
mastery
question complexity
CEFR
```

---

# 11. Game session modeli

Har bir o'yin session sifatida yozilsin.

```text
GameSession
- id
- user_id
- game_id
- started_at
- completed_at
- difficulty
- question_count
- correct_count
- wrong_count
- score
- xp_earned
- avg_response_ms
- metadata
```

Har bir javob:

```text
GameAnswer
- session_id
- question_id
- answer
- is_correct
- response_ms
- attempt_number
- created_at
```

---

# 12. Gamification

## 12.1. XP

Misol:

```text
New word              +10
Correct answer         +5
Game complete         +30
Daily quest           +100
Weekly challenge      +500
Word mastered          +50
```

XP value'lari admin/config orqali boshqarilsin.

## 12.2. XP security

Frontend XP summasini serverga yubormasin.

Noto'g'ri:

```http
POST /xp
{ "amount": 100000 }
```

To'g'ri:

```text
Game complete
    ↓
Backend validates session
    ↓
Backend calculates XP
    ↓
XP transaction created
```

---

# 13. XP Transaction Ledger

XP oddiy counter emas, transaction history bilan saqlansin.

```text
XPTransaction
- id
- user_id
- amount
- source_type
- source_id
- idempotency_key
- created_at
- metadata
```

Bir event ikki marta XP bermasligi uchun `idempotency_key` ishlatilsin.

---

# 14. Level system

```text
Level 1  Beginner
Level 2  Explorer
Level 3  Learner
Level 4  Builder
Level 5  Achiever
...
Level 20 Master
```

Level formula hard-coded emas, config orqali boshqarilsin.

---

# 15. Streak system

```text
1 day
7 days
30 days
100 days
365 days
```

Streak quyidagi holatlarni ham hisobga olsin:

- timezone
- daily reset time
- missed day
- streak freeze mavjud bo'lsa
- duplicate activity

Streak server-side hisoblanadi.

---

# 16. Quests

## Daily

```text
Learn 10 words
Review 20 words
Complete 2 games
Use 3 words in sentences
```

## Weekly

```text
Master 50 words
Get 90% average accuracy
Complete 10 games
Finish one Vocabulary Boss
```

Quest reward:

```text
XP
coins (agar currency bo'lsa)
badge
unlockable content
```

---

# 17. Achievements

```text
First Word
100 Words
500 Words
1,000 Words
7 Day Streak
30 Day Streak
Vocabulary Master
Listening Master
Spelling Master
IELTS Vocabulary Expert
```

Achievement event-based bo'lsin va bir xil badge qayta berilmasin.

---

# 18. Leaderboard

Leaderboard variantlari:

```text
Global
Weekly
Monthly
Friends / cohort (agar mavjud bo'lsa)
```

Server-side ranking.

Privacy uchun public username/display name ishlatilsin.

User o'zining rank'ini ko'rsin, lekin maxfiy account ma'lumotlari chiqmasin.

---

# 19. Daily Learning Plan

Dashboard foydalanuvchiga har kuni individual plan chiqarsin.

Misol:

```text
TODAY

10 new words
18 review words
2 games
1 listening activity
1 writing activity
1 speaking activity
```

Plan quyidagilarga moslashadi:

```text
user level
learning goal
available time
weakness profile
SRS due queue
recent mistakes
IELTS target context
```

---

# 20. Weak Words Engine

Alohida `Weak Words` view bo'lsin.

```text
abandon        42%
significant    51%
maintain       58%
```

Weakness faqat score emas:

```text
low recall
high failure count
slow response
poor listening
poor spelling
poor context usage
```

bo'yicha ham aniqlansin.

---

# 21. Personalized Learning Engine

Tizim userning zaif tomonini aniqlasin.

Misol:

```text
Listening     weak
Spelling      strong
Context       medium
```

Keyingi session:

```text
Listening exercises ↑
Spelling exercises ↓
Context exercises →
```

Bu personalization rule-based MVP'dan boshlansin, keyinchalik ML/AI layer qo'shilishi mumkin.

---

# 22. Vocabulary → Reading integratsiyasi

Reading passage'dagi vocabulary interactive bo'lsin.

Word bosilganda:

```text
Definition
Translation
Pronunciation
Example
Add to Vocabulary
Review
```

Agar word user's weak list'da bo'lsa, visual signal berilishi mumkin.

---

# 23. Vocabulary → Listening integratsiyasi

Listening transcript / answer materialida vocabulary bilan bog'lanish.

Mashqlar:

```text
Audio → word recognition
Audio → spelling
Audio → meaning
```

Listening natijasi vocabulary mastery'ga signal sifatida yozilsin.

---

# 24. Vocabulary → Writing integratsiyasi

Writing assessment userning vocabulary usage'ini alohida tahlil qilsin:

```text
Vocabulary range
Word choice
Accuracy
Collocations
Paraphrasing
Repetition
Incorrect usage
```

AI foydalanuvchining o'rniga essay yozib bermasin; feedback va learning support vazifasida ishlasin.

---

# 25. Vocabulary → Speaking integratsiyasi

Speaking assessmentda:

```text
Vocabulary range
Vocabulary accuracy
Word choice
Collocations
Paraphrasing
```

kabi ko'rsatkichlar kuzatilsin.

O'rganilgan vocabulary'ni active speaking'da ishlatish mastery'ni oshiruvchi signal sifatida qayd etilishi mumkin.

---

# 26. Vocabulary → Mock integratsiyasi

Mock test natijasidan keyin vocabulary weaknesses avtomatik ajratilsin.

Misol:

```text
Mock result
    ↓
Error analysis
    ↓
Vocabulary weakness detection
    ↓
Review queue
    ↓
Games
    ↓
SRS
```

Userga personal recommendation:

```text
15 Academic Words
2 Listening Games
1 Reading exercise
1 Writing challenge
1 Speaking challenge
```

---

# 27. AI Vocabulary Engine

AI quyidagi funksiyalarni bajara olsin.

## 27.1. Word explanation

```text
Simple definition
Uzbek translation
Examples
Synonym
Antonym
Collocations
Word family
Usage note
```

## 27.2. AI exercise generation

```text
Multiple Choice
Fill Gap
Sentence Completion
Synonym
Antonym
Context
Translation
Listening prompt
```

## 27.3. AI mini story

Userning o'rgangan words'idan natural story yaratish.

## 27.4. AI personal coach

Misol:

> Bugun 18 ta so'zingiz review uchun tayyor. Kecha `significant` va `maintain` so'zlarida xato qilgansiz. Avval shu so'zlardan boshlaymiz.

AI real learning data asosida ishlasin.

---

# 28. AI Safety & Cost Control

AI endpointlarda:

- rate limit
- daily/monthly quota
- token budget
- prompt versioning
- fallback
- timeout
- retry policy
- error logging

bo'lsin.

AI output production'ga to'g'ridan-to'g'ri publish qilinmasin.

---

# 29. AI Content Factory — Admin

Admin quyidagilarni yuklay olsin:

```text
PDF
DOCX
TXT
book/material
```

Pipeline:

```text
Upload
 ↓
Extract
 ↓
Chunk
 ↓
Analyze
 ↓
Vocabulary detection
 ↓
CEFR/topic detection
 ↓
Exercise generation
 ↓
Answer generation
 ↓
Explanation generation
 ↓
Human Review
 ↓
Approve / Edit / Reject
 ↓
Publish
```

AI-generated content status:

```text
DRAFT
AI_GENERATED
UNDER_REVIEW
APPROVED
REJECTED
PUBLISHED
ARCHIVED
```

---

# 30. Admin Vocabulary Management

Admin:

```text
Create
Edit
Delete
Bulk import
CSV import
Export
Tag
Assign CEFR
Assign IELTS relevance
Upload audio
Upload image
Review AI content
Publish / unpublish
```

Bulk operationlar audit log bilan yozilsin.

---

# 31. Admin Game Management

Admin:

```text
Game type
Question set
Difficulty
Time limit
XP
Attempts
Lives
Reward
Availability
```

ni boshqara olsin.

Game content versioned bo'lsin, eski completed sessions keyinchalik buzilmasin.

---

# 32. Content Versioning

Vocabulary va game materiallari uchun:

```text
content_version
published_version
archived_version
```

saqlansin.

Oldingi session tarixidagi savollar o'zgartirilsa, analytics buzilmasligi kerak.

---

# 33. Analytics — User

User dashboard:

```text
Words learned
Words mastered
Words due
Weak words
Accuracy
Retention
Average response time
XP
Level
Streak
Games played
Game accuracy
IELTS vocabulary progress
```

Trend:

```text
7 days
30 days
90 days
```

---

# 34. Analytics — Admin

Admin ko'rsin:

```text
Most difficult words
Most failed words
Most successful games
Most abandoned games
Average accuracy
Average response time
Vocabulary retention
DAU/WAU
Game completion rate
Quest completion rate
Streak retention
AI generation usage
```

---

# 35. Event Tracking

Quyidagi eventlar analytics orqali yozilsin:

```text
vocabulary_viewed
vocabulary_started
vocabulary_mastered
review_started
review_completed
review_answered
game_started
game_answered
game_completed
quest_completed
achievement_unlocked
streak_extended
ai_exercise_generated
word_added_from_reading
word_added_from_listening
writing_word_used
speaking_word_used
```

Event schema versioned bo'lsin.

---

# 36. Data privacy

Learning data personal profile ma'lumotlaridan alohida access control bilan himoyalansin.

AI providerlarga yuboriladigan ma'lumot minimum necessary principle asosida bo'lsin.

Keraksiz personal data promptga yuborilmasin.

Admin analytics anonymized/aggregated ko'rinishda ishlashi afzal.

---

# 37. Performance

Majburiy:

- pagination
- lazy loading
- caching
- audio caching
- batch question loading
- database indexing
- background jobs for AI
- queue-based heavy processing
- unnecessary API requestlarni kamaytirish
- prefetching faqat kerak bo'lganda

Har bir game uchun har bir savolga alohida API request yuborishdan qochilsin.

---

# 38. Offline / connection recovery

Minimum talab:

- active session recovery
- unsent answer queue
- duplicate submission prevention
- reconnect sync

To'liq offline mode alohida phase sifatida qilinishi mumkin.

---

# 39. Anti-cheat / integrity

Gamification security server-side bo'lsin.

Tekshirilsin:

```text
Impossible response time
Duplicate requests
Replay attacks
Score manipulation
XP injection
Leaderboard abuse
Bot-like behavior
```

Shubhali session flag qilinishi mumkin.

---

# 40. Accessibility

Games quyidagilarni qo'llasin:

- keyboard navigation
- focus states
- readable contrast
- semantic buttons
- screen-reader compatible labels
- reduced motion preference
- audio controls

Timer yoki animation accessibility'ni buzmasin.

---

# 41. UI/UX

Yangi modul Vocably'ning mavjud visual identity'siga mos bo'lsin.

Talablar:

- premium modern UI
- responsive desktop/tablet/mobile
- consistent typography
- consistent spacing
- consistent buttons/cards
- clear progress visualization
- subtle motion
- success/error feedback
- no excessive animation

Gamification foydalanuvchini chalg'itmasin.

---

# 42. Game result screen

```text
🎉 COMPLETE

Score: 840
Accuracy: 92%
Correct: 23/25
Time: 01:42
XP: +180

Words improved: 8
Weak words: 2
🔥 Streak: 12 days

[Review mistakes]
[Play again]
[Continue]
```

---

# 43. Error review

Har bir mistake:

```text
Your answer
Correct answer
Why it is correct
Example
Retry
Add to weak words
```

Mistake SRS engine'ga signal bo'lsin.

---

# 44. Vocabulary Dashboard

Hero:

```text
Your Vocabulary Journey

1,247 words
623 mastered
🔥 12 day streak
⭐ 18,420 XP
```

Key cards:

```text
Today's Review
Weak Words
New Words
Games
Progress
```

Primary CTA:

```text
START TODAY'S PLAN
```

---

# 45. Personal Vocabulary

Filter:

```text
All
New
Learning
Weak
Mastered
IELTS
Academic
Business
Topic
```

Sort:

```text
Recently added
Most difficult
Most mistakes
Due today
```

---

# 46. CEFR path

```text
A1 → A2 → B1 → B2 → C1 → C2
```

IELTS target path alohida:

```text
4.0 → 5.0 → 5.5 → 6.0 → 6.5 → 7.0 → 7.5 → 8.0+
```

Vocabulary level va IELTS band bir xil narsa sifatida ko'rsatilmasin; ular alohida indikator bo'lsin.

---

# 47. Recommended lesson logic

Har kun uchun recommendation engine:

```text
1. Overdue review
2. High-risk weak words
3. New words
4. Game reinforcement
5. Context practice
6. Skill integration
```

User vaqtini tanlashi mumkin:

```text
5 min
10 min
20 min
30 min
45+ min
```

Shunga qarab daily plan qisqaradi yoki kengayadi.

---

# 48. Monetization integration

Mavjud Free / Standard / Premium modelga moslashtirilsin.

## Free

- limited daily new words
- basic SRS
- basic games
- basic progress

## Standard

- increased daily vocabulary
- full core games
- advanced SRS
- IELTS vocabulary
- detailed analytics

## Premium

- unlimited vocabulary
- advanced AI exercises
- AI coach
- adaptive learning
- advanced speaking/writing vocabulary support
- premium challenges
- advanced analytics

Feature gating frontend emas, backend'da ham enforce qilinsin.

---

# 49. Database entitylar

Taxminiy model:

```text
VocabularyWord
UserVocabulary
VocabularyReview
VocabularyMistake
VocabularyMastery

Game
GameQuestion
GameSession
GameAnswer

XPTransaction
UserLevel
Achievement
UserAchievement

Quest
UserQuest

Streak
LeaderboardSnapshot

AIContentJob
AIContentReview
ContentVersion
```

Aniq model nomlari mavjud Vocably ORM va naming convention'iga moslashtiriladi.

---

# 50. API qatlam

Taxminiy endpointlar:

```http
GET  /api/vocabulary
GET  /api/vocabulary/:id
GET  /api/vocabulary/due
GET  /api/vocabulary/weak
POST /api/vocabulary/:id/review
POST /api/vocabulary/:id/learn

GET  /api/games
GET  /api/games/:id
POST /api/games/:id/start
POST /api/games/:id/answer
POST /api/games/:id/complete

GET  /api/gamification/profile
GET  /api/gamification/achievements
GET  /api/gamification/quests
GET  /api/gamification/leaderboard

GET  /api/progress/vocabulary
GET  /api/progress/analytics
```

Aniq endpoint naming mavjud backend convention'iga moslashtirilsin.

---

# 51. Idempotency

Quyidagi actionlar idempotent bo'lishi kerak:

- game answer submission
- game completion
- quest completion
- achievement unlock
- XP transaction
- streak extension

Bir request bir necha marta yuborilsa duplicate reward bo'lmasin.

---

# 52. Background jobs

Quyidagilar asynchronous ishlashi kerak:

```text
AI generation
PDF processing
bulk vocabulary extraction
large analytics aggregation
audio processing
content indexing
```

User-facing requestni ortiqcha bloklamasin.

---

# 53. Search

Vocabulary search:

```text
exact word
partial word
translation
topic
CEFR
IELTS
part of speech
```

Search normalized bo'lsin va typo tolerance imkoniyati keyingi phase'da qo'shilishi mumkin.

---

# 54. Audio requirements

Vocabulary audio:

```text
UK
US
```

Player:

```text
Play
Pause
Replay
Speed 0.75x / 1x / 1.25x
```

Audio fail bo'lsa fallback ko'rsatilishi kerak.

---

# 55. Notifications

Misollar:

```text
🔔 18 words are ready for review.
🔥 Keep your 12-day streak.
🎯 Weekly Vocabulary Challenge is waiting.
```

Notification frequency user settings bilan boshqarilsin.

Spam bo'lmasin.

---

# 56. Repository evaluation protocol

Har bir public repo quyidagi tartibda baholansin:

```text
1. License
2. Repository activity
3. Architecture
4. Security
5. Dependencies
6. Data model
7. Core algorithms
8. UX mechanics
9. Performance
10. Compatibility with Vocably
11. Reusable concepts
12. Code that must be rewritten
13. Code that must not be used
```

Natija jadvali:

| Repo | Olinadigan konsept | Qayta yoziladi | Kerak emas | Risk |
|---|---|---|---|---|
| Vocamon | Game progression, quests | Game engine | Auth/core app | License/security tekshiruvi |
| WordDrop | Spelling/listening game | Real-time game | Unrelated app code | Dependency review |
| LexiLearn | SRS/review UX | SRS integration | Unrelated pages | Algorithm validation |
| WordForge | IELTS vocabulary/AI concepts | AI content flow | Unrelated infrastructure | AI cost/quality |
| ISTS | IELTS/analytics concepts | Integration | Duplicate platform features | Architecture overlap |

---

# 57. Kodni ko'chirish strategiyasi

## Reuse

- umumiy algorithm g'oyalari
- UX patterns
- data structure ideas
- game mechanics
- SRS concepts

## Rewrite

- authentication
- API layer
- database integration
- frontend state
- permission system
- analytics events
- billing gates
- AI service layer

## Do not copy

- unrelated app shell
- external auth flow
- third-party secrets/config
- proprietary assets
- unknown-license components
- duplicate existing Vocably functionality

---

# 58. Testing strategy

## Unit tests

- SRS calculation
- mastery score
- difficulty calculation
- XP calculation
- level calculation
- streak logic
- quest logic
- achievement logic
- leaderboard ranking

## Integration tests

```text
Game → Result → XP → Mastery → SRS → Analytics
```

## E2E

```text
Login
→ Vocabulary
→ Start game
→ Answer
→ Finish
→ XP update
→ Mastery update
→ Review queue
→ Progress dashboard
```

## Load/performance

- concurrent game sessions
- concurrent review submissions
- leaderboard load
- AI queue throughput
- vocabulary search load

---

# 59. Acceptance Criteria

## Core vocabulary

- [ ] User vocabulary state saved correctly
- [ ] SRS due queue works
- [ ] Weak words detected
- [ ] Mastery updates correctly
- [ ] Review history preserved

## Games

- [ ] All P0 games work on desktop/mobile
- [ ] Game state survives refresh/reconnect where applicable
- [ ] Answers validated server-side
- [ ] Duplicate submissions are rejected safely

## Gamification

- [ ] XP is server-calculated
- [ ] XP transactions are idempotent
- [ ] Level updates correctly
- [ ] Streak updates correctly
- [ ] Achievements unlock once
- [ ] Leaderboard cannot be manipulated from frontend

## AI

- [ ] AI content is reviewable by admin
- [ ] AI endpoints have rate limits
- [ ] AI failures have fallback/error state
- [ ] AI-generated content has source/version/status

## IELTS integration

- [ ] Reading can send vocabulary signals
- [ ] Listening can send vocabulary signals
- [ ] Writing can analyze vocabulary usage
- [ ] Speaking can analyze vocabulary usage
- [ ] Mock can generate vocabulary recommendations

## Performance

- [ ] No per-question excessive API requests
- [ ] Heavy jobs run asynchronously
- [ ] Main dashboard remains responsive

---

# 60. Definition of Done

Feature production-ready hisoblanishi uchun:

1. UI ishlashi.
2. Backend validation ishlashi.
3. Database state to'g'ri saqlanishi.
4. Analytics eventlari yozilishi.
5. Error states mavjud bo'lishi.
6. Security tekshiruvdan o'tishi.
7. Mobile responsive bo'lishi.
8. Accessibility basic talablarini bajarishi.
9. Unit/integration/E2E testlari mavjud bo'lishi.
10. Existing Vocably funksiyalariga regression bermasligi.
11. Monitoring/logging mavjud bo'lishi.
12. Feature flag orqali xavfsiz rollout qilish imkoniyati bo'lishi.

---

# 61. Feature Flag va Rollout

Yangi engine birdan barcha userlarga yoqilmasin.

Bosqich:

```text
Development
 ↓
Internal testing
 ↓
5% users
 ↓
25% users
 ↓
50% users
 ↓
100% users
```

Muammo bo'lsa feature flag orqali rollback qilinsin.

---

# 62. Monitoring

Production'da kuzatilsin:

```text
Game error rate
API latency
Review completion rate
AI error rate
AI cost/user
Duplicate submissions
XP anomalies
Leaderboard anomalies
SRS queue size
Database slow queries
```

Critical errors alert berishi kerak.

---

# 63. Migration strategy

Existing Vocably userlari uchun:

```text
existing user
 ↓
new vocabulary profile
 ↓
initial onboarding
 ↓
diagnostic vocabulary test
 ↓
initial mastery estimate
 ↓
personalized review queue
```

Eski progress yo'qolmasin.

---

# 64. Vocabulary onboarding

Yangi userga qisqa diagnostic test:

```text
20–50 questions
```

Tizim taxminiy boshlang'ich vocabulary levelni belgilaydi.

Keyin:

```text
Recommended starter pack
Daily target
Initial review queue
Suggested games
```

Onboardingni o'tkazib yuborish mumkin.

---

# 65. Anti-frustration UX

Gamification foydalanuvchini jazolamasin.

Masalan:

- ketma-ket xatolar uchun normal tushuntirish
- streak yo'qotilganda agressiv message yo'q
- timer accessibility bilan mos
- xatodan keyin qayta urinib ko'rish
- score pasaysa learning opportunity sifatida ko'rsatish

---

# 66. Product quality rules

Yangi feature qo'shilganda doim quyidagi savollar tekshirilsin:

```text
Bu feature vocabulary retentionni yaxshilaydimi?
Bu userni active recallga majbur qiladimi?
Bu mavjud UXni murakkablashtirmaydimi?
Bu AI'siz ham foydali bo'ladimi?
Bu feature IELTS bilan bog'lanadimi?
Bu feature o'lchanadimi?
```

Faqat "chiroyli" bo'lgani uchun game qo'shilmasin.

---

# 67. Prioritetlar

## P0 — Core

```text
Vocabulary database
User vocabulary
Mastery
SRS
Due review
Weak words
Active recall
Word Match
Multiple Choice
Fill Gap
Listen & Choose
Listen & Type
XP
Streak
Progress
```

## P1 — Growth

```text
Word Drop
Memory
Sentence Builder
Speed Challenge
Daily Quest
Achievements
Leaderboard
Adaptive difficulty
Personalized daily plan
```

## P2 — Advanced

```text
Vocabulary Boss
AI Story
AI Coach
Advanced adaptive engine
Advanced analytics
Content Factory
Advanced cross-skill recommendations
```

---

# 68. Tavsiya qilinadigan yakuniy learning ecosystem

```text
                  VOCABLY
                     |
              LEARNING ENGINE
                     |
              VOCABULARY CORE
                     |
        +------------+------------+
        |            |            |
       SRS         GAMES          AI
        |            |            |
        +------------+------------+
                     |
                GAMIFICATION
                     |
        +------------+------------+
        |            |            |
      READING     LISTENING     WRITING
                                   |
                                SPEAKING
                                   |
                                  MOCK
                                   |
                              ANALYTICS
                                   |
                       PERSONALIZED PLAN
                                   |
                              NEXT REVIEW
```

---

# 69. Yakuniy mahsulot qanday ko'rinishi kerak

User login qilganda:

```text
Good morning 👋

🔥 12 day streak
⭐ 18,420 XP

TODAY'S PLAN

📚 10 new words
🧠 18 review words
🎮 2 games
🎧 1 listening
✍️ 1 writing
🗣️ 1 speaking

[ START TODAY'S PLAN ]
```

Vocabulary:

```text
1,247 words
623 mastered
412 learning
212 weak
```

Games:

```text
Word Match
Word Drop
Memory
Listening
Spelling
Sentence Builder
Speed Challenge
Vocabulary Boss
```

Learning cycle:

```text
Word
 ↓
Game
 ↓
SRS
 ↓
Reading
 ↓
Listening
 ↓
Writing
 ↓
Speaking
 ↓
Mock
 ↓
Weakness analysis
 ↓
Personalized review
```

---

# 70. Yakuniy texnik xulosa

Vocably uchun maqsad **"yana bir vocabulary section"** yaratish emas.

Maqsad:

> **Vocabulary'ni Vocably.uz'ning central learning intelligence qatlamiga aylantirish.**

Yangi arxitekturada:

```text
Vocabulary
    ↓
SRS
    ↓
Active Recall
    ↓
Games
    ↓
Gamification
    ↓
AI personalization
    ↓
Reading / Listening
    ↓
Writing / Speaking
    ↓
IELTS Mock
    ↓
Analytics
    ↓
Personalized next action
```

Natijada user bitta so'zni bir marta ko'rib chiqmaydi; u so'zni turli formatlarda qayta-qayta **recall qiladi, eshitadi, yozadi, kontekstda ko'radi va real communication'da ishlatadi**.

Bu tizim Vocably'ning mavjud IELTS platformasini saqlagan holda, vocabulary'ni alohida feature emas, **platformaning learning engine'i** darajasiga olib chiqishi kerak.

---

# 71. Developer uchun majburiy final checklist

- [ ] Mavjud Vocably architecture tekshirildi
- [ ] Mavjud auth buzilmadi
- [ ] Existing IELTS modules regression testdan o'tdi
- [ ] Database migration reversible
- [ ] API naming convention saqlandi
- [ ] SRS unit-tested
- [ ] Game engine server-side validated
- [ ] XP transaction ledger mavjud
- [ ] Idempotency mavjud
- [ ] AI content review workflow mavjud
- [ ] AI rate limit mavjud
- [ ] Analytics events mavjud
- [ ] Feature flag mavjud
- [ ] Monitoring mavjud
- [ ] Mobile responsive
- [ ] Accessibility basic talablar bajarildi
- [ ] License compliance tekshirildi
- [ ] Security review bajarildi
- [ ] Performance profiling bajarildi
- [ ] Production rollout bosqichma-bosqich amalga oshiriladi

---

## 72. Ishni boshlashdan oldingi engineering rule

**Hech qaysi GitHub repository kodi to'g'ridan-to'g'ri production'ga copy qilinmasin.**

Avval:

```text
Audit repo
 ↓
Check license
 ↓
Extract useful concepts
 ↓
Compare with Vocably architecture
 ↓
Design integration
 ↓
Implement natively
 ↓
Test
 ↓
Feature flag
 ↓
Staged rollout
```

Shu tartib Vocably.uz'ni mavjud platformani buzmasdan, uzoq muddatli va scalable vocabulary-learning ecosystem'ga aylantirish uchun asosiy texnik yo'l bo'lsin.
