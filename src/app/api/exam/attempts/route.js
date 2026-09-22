import { connectToDatabase } from '@/lib/db';
import { ExamTest, ExamAttempt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOrCreateTestVersion } from '@/lib/exam/attemptServer';
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
 * tasodifiy tanlangan bo'lishidan qat'i nazar BIR XIL yo'l bilan ishlaydi. */
async function createMockAttemptForTest(userId, test) {
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

    const { testId, mode = 'section', section, abandonExisting } = await req.json().catch(() => ({}));
    if (!['section', 'mock', 'practice'].includes(mode)) {
      return NextResponse.json({ error: "mode faqat 'section', 'mock' yoki 'practice' bo'lishi mumkin" }, { status: 400 });
    }
    if ((mode === 'section' || mode === 'practice') && !testId) {
      return NextResponse.json({ error: 'testId shart' }, { status: 400 });
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

        const [randomTest] = await ExamTest.aggregate([
          {
            $match: {
              isPublished: true,
              'sections.listening': { $exists: true },
              'sections.reading': { $exists: true },
              'sections.writing': { $exists: true },
            },
          },
          { $sample: { size: 1 } },
        ]);
        if (!randomTest) return NextResponse.json({ error: "Hozircha mock uchun test yo'q." }, { status: 404 });

        const { attempt, error } = await createMockAttemptForTest(userId, randomTest);
        if (error) return NextResponse.json({ error }, { status: 400 });
        return NextResponse.json({ attemptId: String(attempt._id) });
      }

      const test = await ExamTest.findById(testId).lean();
      if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

      const existing = await ExamAttempt.findOne({ userId, testId, mode: 'mock', status: 'in_progress' });
      if (existing) return NextResponse.json({ attemptId: String(existing._id) });

      const { attempt, error } = await createMockAttemptForTest(userId, test);
      if (error) return NextResponse.json({ error }, { status: 400 });
      return NextResponse.json({ attemptId: String(attempt._id) });
    }

    const test = await ExamTest.findById(testId).lean();
    if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: "Noto'g'ri bo'lim" }, { status: 400 });
    }
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
      testId,
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
      testId,
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
