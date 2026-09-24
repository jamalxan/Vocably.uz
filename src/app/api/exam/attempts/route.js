import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { ExamTest, ExamAttempt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOrCreateTestVersion } from '@/lib/exam/attemptServer';
import { normalizeMockKind } from '@/lib/exam/mockKind';
import { composeMock, composedTitle, MOCK_SECTION_KEYS } from '@/lib/exam/mockComposer';
import { isSectionMockEligible } from '@/lib/exam/contentValidator';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

const VALID_SECTIONS = ['listening', 'reading', 'writing', 'speaking'];
// TZ §9.1 — Mock'da bo'limlar shu ketma-ketlikda (attemptServer.ts'dagi bilan
// bir xil — Speaking Faza 3'dan tashqarida).
const MOCK_SECTION_ORDER = ['listening', 'reading', 'writing'];
// "Practice mode" (TZ, Listening bo'limi) — amalda vaqtsiz, lekin
// `ExamAttempt.endsAt` schema darajasida majburiy (Date, required) —
// shuning uchun juda uzoq, real vaqt bosimi bermaydigan muddat beriladi.
const PRACTICE_ATTEMPT_DURATION_SEC = 24 * 3600;

function mockSectionsFor(test) {
  return MOCK_SECTION_ORDER.filter((key) => test.sections?.[key]);
}

/** Bitta test hujjatidan mock attempt yaratadi — testId aniq berilgan yoki
 * tasodifiy tanlangan bo'lishidan qat'i nazar BIR XIL yo'l bilan ishlaydi.
 * `mockKind` — AUDIT Sprint 2/§52.1 (Practice/Exam/Secure) — chaqiruvchi
 * tomonidan ALLAQACHON normallashtirilgan/tasdiqlangan bo'lishi kerak. */
async function createMockAttemptForTest(userId, test, mockKind) {
  const sections = mockSectionsFor(test);
  if (sections.length === 0) {
    return { error: "Testda listening/reading/writing bo'limlaridan birontasi yo'q" };
  }

  const firstSection = sections[0];
  const now = new Date();
  // P0-05 — test kontenti shu paytda muzlatiladi (ExamTestVersion); admin
  // keyinroq shu testni tahrirlasa, bu urinish hamon shu snapshotdan ishlaydi.
  const testVersionId = await getOrCreateTestVersion(test);
  const attempt = await ExamAttempt.create({
    userId,
    testId: test._id,
    testVersionId,
    mode: 'mock',
    mockKind,
    sections,
    currentSection: firstSection,
    status: 'in_progress',
    startedAt: now,
    sectionStartedAt: now,
    endsAt: new Date(now.getTime() + test.sections[firstSection].durationSec * 1000),
    answers: {},
    flagged: [],
    lastQuestion: 0,
  });
  return { attempt };
}

/** Nashr qilingan testlardan HAR BO'LIM uchun alohida "manba hovuzi"
 * yig'adi. Shart — bo'limning O'ZI mock shakliga mos bo'lishi
 * (`isSectionMockEligible`: Reading 3 passage/40 savol, Listening 4 part x
 * 10 savol + audio, Writing 2 task) — ya'ni butun test mock-eligible
 * bo'lishi SHART EMAS: faqat Reading'i bor mini test ham endi mockka
 * Reading manbasi bo'la oladi. Aynan shu narsa "manbalar aralashsin"
 * talabini haqiqiy qiladi. */
async function buildMockPools() {
  const tests = await ExamTest.find({
    isPublished: true,
    $or: MOCK_SECTION_KEYS.map((key) => ({ [`sections.${key}`]: { $exists: true } })),
  })
    .select('title module sections availability')
    .lean();

  // Modul (academic/general) bo'yicha ajratamiz — Academic Reading bilan
  // General Writing'ni aralashtirib yuborish imtihon shaklini buzardi.
  const byModule = new Map();
  for (const test of tests) {
    // `module` nomi ataylab ISHLATILMAYDI (Next.js lint qoidasi: modul
    // darajasidagi `module` o'zgaruvchisiga yozish bundler'ni chalg'itadi).
    const moduleKey = test.module || 'academic';
    if (!byModule.has(moduleKey)) byModule.set(moduleKey, { listening: [], reading: [], writing: [] });
    const pools = byModule.get(moduleKey);
    for (const key of MOCK_SECTION_KEYS) {
      const content = test.sections?.[key];
      if (!content) continue;
      // `availability.practice*` — admin bo'limni ataylab yopgan bo'lsa
      // (masalan sifati past deb) mockka ham tushmasin.
      const availabilityKey = `practice${key[0].toUpperCase()}${key.slice(1)}`;
      if (test.availability && test.availability[availabilityKey] === false) continue;
      if (!isSectionMockEligible(key, content)) continue;
      pools[key].push({ testId: String(test._id), title: test.title, module: moduleKey, content });
    }
  }

  return byModule;
}

/** To'liq (uchala bo'lim ham bor) hovuzga ega modullardan bittasini
 * tasodifiy tanlab, aralash mock yig'adi. Hech bir modulda to'liq to'plam
 * bo'lmasa `null` — chaqiruvchi 404 qaytaradi (yolg'on "yarim mock"
 * yaratilmaydi). */
async function composeRandomMock(avoidTestIds) {
  const byModule = await buildMockPools();
  const viable = Array.from(byModule.entries()).filter(([, pools]) => MOCK_SECTION_KEYS.every((k) => pools[k].length > 0));
  if (viable.length === 0) return null;

  const [moduleKey, pools] = viable[Math.floor(Math.random() * viable.length)];
  const composed = composeMock(pools, { avoidTestIds });
  if (!composed) return null;

  // `createMockAttemptForTest` uchun "test"ga o'xshash obyekt: `_id`
  // manba testlardan birininki (attempt real hujjatga bog'langan bo'lib
  // qolishi uchun), kontent esa aralashma. `getOrCreateTestVersion` shu
  // kontentni hash bo'yicha muzlatadi — bir xil kombinatsiya uchun
  // takroriy versiya yaratilmaydi.
  return {
    _id: composed.parentTestId,
    slug: `mixed-${composed.composedFrom.map((c) => c.testId.slice(-4)).join('-')}`,
    title: composedTitle(composed),
    module: moduleKey,
    difficulty: 'medium',
    sections: composed.sections,
    bandTable: null,
    isPublished: true,
    createdAt: new Date(),
  };
}

/** Bitta bo'lim uchun tasodifiy nashr qilingan test — Writing/Speaking
 * sahifalari endi ro'yxat ko'rsatmaydi ("writing va speaking o'zi random
 * tushsin" talabi). `avoidTestIds` bilan ketma-ket bir xil topshiriq
 * tushib qolmaydi. */
async function pickRandomTestForSection(section, avoidTestIds) {
  const match = { isPublished: true, [`sections.${section}`]: { $exists: true } };
  const availabilityKey = `availability.practice${section[0].toUpperCase()}${section.slice(1)}`;
  match[availabilityKey] = { $ne: false };

  const fresh = await ExamTest.aggregate([
    { $match: { ...match, _id: { $nin: (avoidTestIds || []).map((id) => new mongoose.Types.ObjectId(id)) } } },
    { $sample: { size: 1 } },
  ]);
  if (fresh[0]) return fresh[0];

  const any = await ExamTest.aggregate([{ $match: match }, { $sample: { size: 1 } }]);
  return any[0] || null;
}

// TZ-vocably-v2.md §4 (IELTS CD Exam Engine v1.0) — "POST /attempts — Yangi
// urinish. Body: {testId, mode, sections}. Javob: {attemptId}".
//
// `mode: 'section'` — bitta bo'lim, haqiqiy vaqt bosimi bilan (real bo'lim
// muddatida). `mode: 'mock'` — testda mavjud bo'lgan listening/reading/writing
// bo'limlarining BARCHASI, TZ §9.1 tartibida, bitta attempt ichida ketma-ket
// (§19 Faza 3 item 15). `mode: 'practice'` — bitta bo'lim, lekin TZ "Practice
// mode" bo'limidagi kabi (hozircha faqat Listening'da UI qurilgan — replay/
// tezlik erkin, AudioEngine.tsx#mode='practice'), amalda cheksizga yaqin
// muddat bilan (pastda). Barcha holatlarda allaqachon davom etayotgan mos
// urinish bo'lsa (sahifa yangilansa) O'SHANI qaytaramiz — yangisini
// yaratmaymiz, aks holda taymer va javoblar yo'qolib, chalkash holatga tushadi.
//
// `mode: 'mock'` uchun `testId` IXTIYORIY (foydalanuvchi so'rovidan — "mockda
// tanlash bo'lmasin, to'liq avto"): berilmasa, server nashr etilgan va
// listening+reading+writing'ning barchasiga ega testlardan BITTASINI tasodifiy
// tanlaydi (`$sample`) — foydalanuvchi qaysi test ekanini oldindan bilmaydi va
// tanlay olmaydi, faqat "Boshlash"ni bosadi. Agar shu foydalanuvchida allaqachon
// davom etayotgan mock bo'lsa (qaysi testda bo'lishidan qat'i nazar) — O'SHA
// davom ettiriladi, qayta tasodifiy tanlanmaydi.
export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { testId, mode = 'section', section, abandonExisting, mockKind: mockKindInput } = await req.json().catch(() => ({}));
    if (!['section', 'mock', 'practice'].includes(mode)) {
      return NextResponse.json({ error: "mode faqat 'section', 'mock' yoki 'practice' bo'lishi mumkin" }, { status: 400 });
    }
    // `testId` endi `section`/`practice` uchun ham IXTIYORIY — 2026-09-24
    // so'rovi: "Writing va Speaking o'zi random tushsin". Berilmasa server
    // shu bo'limi bor nashr qilingan testlardan bittasini tasodifiy
    // tanlaydi (Reading/Listening sahifalari esa avvalgidek ro'yxat
    // ko'rsatadi va aniq `testId` yuboradi).
    if ((mode === 'section' || mode === 'practice') && !testId && !VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: "testId yoki to'g'ri 'section' kerak" }, { status: 400 });
    }
    // AUDIT Sprint 2/§52.1 — `mockKind` faqat `mode:'mock'`ga tegishli, lekin
    // validatsiya barcha yo'llardan oldin, bitta joyda (noto'g'ri qiymat
    // boshqa `mode`larda ham jim yutilmasligi kerak).
    const mockKind = normalizeMockKind(mockKindInput);
    if (mockKind === null) {
      return NextResponse.json({ error: "mockKind faqat 'practice', 'exam' yoki 'secure' bo'lishi mumkin" }, { status: 400 });
    }

    await connectToDatabase();

    if (mode === 'mock') {
      if (!testId) {
        const existing = await ExamAttempt.findOne({ userId, mode: 'mock', status: 'in_progress' });
        // VOCABLY-TZ.md §1.1/"Attempt boshqaruvi" auditi — ILGARI mavjud
        // in-progress mock HAR DOIM jimgina davom ettirilardi: foydalanuvchi
        // "Imtihonni boshlash"ni bosganda kutilmaganda to'g'ridan-to'g'ri
        // Reading'ga (yoki qaysi bo'limda to'xtagan bo'lsa) tushib qolardi,
        // xuddi Listening "o'tkazib yuborilgandek" ko'rinardi — aslida
        // to'g'ri davom etayotgan edi, faqat buni frontend oldindan
        // bilmasdi. Endi frontend `GET /attempts/active-mock` orqali oldindan
        // so'raydi va foydalanuvchiga aniq tanlov beradi: "Davom ettirish"
        // (shu yo'l, o'zgarishsiz) yoki `abandonExisting:true` bilan eskisini
        // bekor qilib, chinakam yangi tasodifiy test bilan boshlash.
        if (existing && !abandonExisting) return NextResponse.json({ attemptId: String(existing._id) });
        if (existing && abandonExisting) {
          existing.status = 'abandoned';
          await existing.save();
        }

        // 2026-09-24 (foydalanuvchi so'rovi) — mock endi BITTA testdan emas,
        // HAR BO'LIM uchun alohida tanlangan manbadan yig'iladi: "full mockda
        // reading/listening/writing manbalaridan random, aralashgan holatda
        // tushsin, har doim har xil". Yig'ish mantig'i sof modulda
        // (`mockComposer.ts`, test bilan), bu yerda faqat DB so'rovi va
        // natijani attempt'ga aylantirish.
        //
        // Yaratilgan aralashma `ExamTest` sifatida SAQLANMAYDI — u
        // `ExamTestVersion` snapshotiga (P0-05 mexanizmi, `getOrCreateTestVersion`)
        // muzlatiladi va attempt o'sha snapshotdan ishlaydi. Shu tufayli
        // test katalogi har bir mock uchun yangi hujjat bilan to'lib
        // ketmaydi, lekin urinish kontenti baribir o'zgarmas bo'ladi.
        const recentMocks = await ExamAttempt.find({ userId, mode: 'mock' })
          .select('testId')
          .sort({ startedAt: -1 })
          .limit(5)
          .lean();

        const composed = await composeRandomMock(recentMocks.map((a) => String(a.testId)));
        if (!composed) return NextResponse.json({ error: "Hozircha mock uchun test yo'q." }, { status: 404 });

        const { attempt, error } = await createMockAttemptForTest(userId, composed, mockKind);
        if (error) return NextResponse.json({ error }, { status: 400 });
        return NextResponse.json({ attemptId: String(attempt._id) });
      }

      const test = await ExamTest.findById(testId).lean();
      if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });
      // AUDIT EX-06/N-06 (Sprint 1) — explicit testId path must respect the
      // same gate as the random-selection path above.
      if (!test.isMockEligible) {
        return NextResponse.json({ error: 'Bu test to‘liq Mock imtihon uchun mos emas (mini practice test).' }, { status: 400 });
      }

      const existing = await ExamAttempt.findOne({ userId, testId, mode: 'mock', status: 'in_progress' });
      if (existing) return NextResponse.json({ attemptId: String(existing._id) });

      const { attempt, error } = await createMockAttemptForTest(userId, test, mockKind);
      if (error) return NextResponse.json({ error }, { status: 400 });
      return NextResponse.json({ attemptId: String(attempt._id) });
    }

    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: "Noto'g'ri bo'lim" }, { status: 400 });
    }

    // `testId` berilmagan — tasodifiy tanlaymiz (Writing/Speaking yo'li).
    // Ketma-ket bir xil topshiriq tushmasligi uchun shu foydalanuvchining
    // oxirgi urinishlari chetlab o'tiladi.
    let test;
    if (testId) {
      test = await ExamTest.findById(testId).lean();
    } else {
      const recent = await ExamAttempt.find({ userId, currentSection: section })
        .select('testId')
        .sort({ startedAt: -1 })
        .limit(3)
        .lean();
      test = await pickRandomTestForSection(section, recent.map((a) => String(a.testId)));
      if (!test) return NextResponse.json({ error: `Hozircha ${section} uchun test yo'q.` }, { status: 404 });
    }
    if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    const resolvedTestId = String(test._id);
    const sectionContent = test.sections?.[section];
    if (!sectionContent) return NextResponse.json({ error: `Testda ${section} bo'limi yo'q` }, { status: 400 });

    // `mode` shu yerda 'section' yoki 'practice' bo'lishi mumkin — ikkalasi
    // ham bir bo'limli urinish, faqat muddati farq qiladi (pastda). Mavjud
    // urinishni qidirishda ham `mode`ning O'ZI ishlatiladi, aks holda
    // practice va section urinishlari bir-birini "davom ettirgandek" ko'rinib
    // qolardi (masalan practice ochilganda eskirmagan section urinish topilib,
    // vaqtsiz bo'lishi kerak bo'lgan sessiya haqiqiy taymerga ega bo'lib qolardi).
    const existing = await ExamAttempt.findOne({
      userId,
      testId: resolvedTestId,
      currentSection: section,
      mode,
      status: 'in_progress',
    });
    // VOCABLY-TZ.md §2.4/§5 item 12 — "Attempt boshqaruvini bir xil qil":
    // mock bilan bir xil naqsh — odatda mavjud tugallanmagan urinish
    // davom ettiriladi, lekin TestPicker'dagi "Yangi boshlash" tugmasi
    // `abandonExisting:true` yuborib, eskisini bekor qilib chinakam yangi
    // urinish boshlaydi (masalan eskisi juda uzoq turib qolgan bo'lsa).
    if (existing && !abandonExisting) return NextResponse.json({ attemptId: String(existing._id) });
    if (existing && abandonExisting) {
      existing.status = 'abandoned';
      await existing.save();
    }

    const now = new Date();
    const testVersionId = await getOrCreateTestVersion(test);
    const durationSec = mode === 'practice' ? PRACTICE_ATTEMPT_DURATION_SEC : sectionContent.durationSec;
    const attempt = await ExamAttempt.create({
      userId,
      testId: resolvedTestId,
      testVersionId,
      mode,
      sections: [section],
      currentSection: section,
      status: 'in_progress',
      startedAt: now,
      sectionStartedAt: now,
      endsAt: new Date(now.getTime() + durationSec * 1000),
      answers: {},
      flagged: [],
      lastQuestion: 0,
    });

    return NextResponse.json({ attemptId: String(attempt._id) });
  } catch (err) {
    return serverError(err, 'exam/attempts:create');
  }
}
