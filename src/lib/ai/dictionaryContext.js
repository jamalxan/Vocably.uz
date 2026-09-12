// TZ-vocably-v2.md §D2.4 — AI'ga lug'at konteksti (system prompt). Har suhbatda AI
// foydalanuvchining lug'ati va o'quv holati haqida KOMPAKT JSON biladi — butun lug'at
// emas (token tejash), faqat: streak, jami/bugungi takrorlash soni, eng ko'p xato
// qilingan so'zlar, so'nggi mock bali. Bu D2.1 Word Picker orqali aniq tanlangan
// so'zlarga QO'SHIMCHA — u yerda foydalanuvchi ANIQ qaysi so'z(lar) haqida gapirayotgani
// ko'rsatiladi, bu yerda esa AI "fonda" foydalanuvchini tanigandek javob beradi
// (masalan "bugun 12 ta so'zni takrorlash vaqti keldi" kabi tabiiy eslatmalar).
const MAX_MISTAKEN_WORDS = 20;

function isDue(word, now) {
  const next = word?.stats?.nextReview;
  return next ? new Date(next).getTime() <= now : true;
}

export async function buildDictionaryContext(user) {
  const now = Date.now();
  let wordsTotal = 0;
  let dueTodayCount = 0;
  const mistaken = [];

  for (const cat of user.categories || []) {
    for (const w of cat.words || []) {
      wordsTotal++;
      if (isDue(w, now)) dueTodayCount++;
      const wrong = w.stats?.wrong || 0;
      if (wrong > 0) mistaken.push({ word: w.word, wrong });
    }
  }

  mistaken.sort((a, b) => b.wrong - a.wrong);

  let lastMockBand = null;
  try {
    // TZ §20 migratsiyasi — eski `ExamSession`(Everest-Mock dvigateli) o'rniga
    // yangi exam engine'ning `ExamAttempt`si (mode:'mock', status:'graded').
    const { ExamAttempt } = await import('@/lib/models');
    const last = await ExamAttempt.findOne({ userId: user._id, mode: 'mock', status: 'graded' })
      .sort({ submittedAt: -1 })
      .select('result submittedAt')
      .lean();
    if (last?.result?.overall != null) lastMockBand = last.result.overall;
  } catch {
    // ExamAttempt topilmasa yoki xato bo'lsa — jimgina o'tkazib yuboramiz, bu ixtiyoriy maydon
  }

  return {
    wordsTotal,
    dueTodayCount,
    reviewStreak: user.reviewStreak || 0,
    mostMistakenWords: mistaken.slice(0, MAX_MISTAKEN_WORDS).map((m) => m.word),
    lastMockBand,
  };
}

/** `context` — buildDictionaryContext() natijasi. Foydalanuvchida hali lug'at
 * bo'sh bo'lsa, bo'sh maydonlarni jo'natib token isrof qilmaymiz. */
export function formatDictionaryContextForPrompt(context) {
  if (!context || context.wordsTotal === 0) return '';
  const compact = {
    jami_soz: context.wordsTotal,
    bugungi_takrorlash: context.dueTodayCount,
    streak_kun: context.reviewStreak,
  };
  if (context.mostMistakenWords.length > 0) compact.kop_xato_qilingan_sozlar = context.mostMistakenWords;
  if (context.lastMockBand != null) compact.songgi_mock_bali = context.lastMockBand;
  return JSON.stringify(compact);
}
