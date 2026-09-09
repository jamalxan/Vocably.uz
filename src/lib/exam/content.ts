// Vakolatli imtihon kontenti. github.com/jamalxan/Everest-Mock backend/content.py'dan
// portlangan (bitta "full-8" mock, so'zma-so'z). To'g'ri javoblar FAQAT shu serverda —
// `publicMock()` ularni olib tashlab qaytaradi, clientga hech qachon yuborilmaydi.
//
// DIQQAT — audio fayl YO'Q: `audioUrl: "/audio/full-8/listening.mp3"` Everest-Mock'ning
// o'z CDN'iga ishora qiladi, bu yerda hali yuklanmagan (kontent-ta'minot masalasi,
// dvigatel mantig'iga aloqasi yo'q — /public/audio/full-8/listening.mp3'ga haqiqiy audio
// fayl qo'yilganda ishlay boshlaydi). TZ §11'dagi asosiy talab — dvigatel (taymer/
// autosave/play-once/submit) to'g'ri ishlashi — shu to'liq bajarilgan.
//
// Kelgusida ko'proq mock qo'shish uchun: shu MOCKS obyektiga yangi kalit qo'shish
// kifoya — qolgan hamma narsa (getMock/answerKey/publicMock/dvigatel) generic.

export const SECTION_DURATIONS: Record<string, number> = {
  listening: 30 * 60,
  reading: 60 * 60,
  writing: 60 * 60,
  speaking: 14 * 60,
};

export const SECTION_ORDER = ['listening', 'reading', 'writing', 'speaking'] as const;

type Question = {
  id: string;
  type: 'mcq' | 'gap' | 'tfng' | 'matching';
  text: string;
  options?: string[];
  correct?: number | string;
};

type Mock = {
  id: string;
  title: string;
  type: string;
  exam_type: string;
  sections: {
    listening: { audioLabel: string; audioUrl: string; questions: Question[] };
    reading: { passageTitle: string; passage: string; questions: Question[] };
    writing: { task1: string; task2: string };
    speaking: { parts: { id: string; label: string; question: string }[] };
  };
};

export const MOCKS: Record<string, Mock> = {
  'full-8': {
    id: 'full-8',
    title: 'Full Mock #8',
    type: 'Academic',
    exam_type: 'ielts_academic',
    sections: {
      listening: {
        audioLabel: 'Section 1 — A conversation about a community center membership',
        audioUrl: '/audio/full-8/listening.mp3',
        questions: [
          { id: 'l1', type: 'mcq', text: 'The community center is open until ______ on weekdays.', options: ['8 pm', '9 pm', '10 pm', '11 pm'], correct: 1 },
          { id: 'l2', type: 'mcq', text: 'The annual membership fee for adults is ______.', options: ['$40', '$50', '$60', '$75'], correct: 2 },
          { id: 'l3', type: 'mcq', text: 'The swimming pool is closed on ______.', options: ['Monday', 'Wednesday', 'Friday', 'Sunday'], correct: 0 },
          { id: 'l4', type: 'mcq', text: 'Members can borrow up to ______ items from the library.', options: ['three', 'four', 'five', 'six'], correct: 2 },
        ],
      },
      reading: {
        passageTitle: 'The Architecture of Termite Mounds',
        passage:
          'Termite mounds are among the most remarkable structures built by any non-human species. Despite being constructed by insects only a few millimetres long, these towers can reach heights of several metres and remain standing for decades. The internal architecture of a mound is a sophisticated ventilation system. As the colony metabolises, it generates heat and carbon dioxide, which must be removed to keep conditions stable for the millions of termites within.\n\nScientists once believed that mounds worked like chimneys, with warm air rising and escaping through a hole at the top. However, more recent research has shown that many mounds are in fact closed at the top. Instead, the structure relies on daily temperature swings between day and night. During the day, the outer walls heat up, driving air upward through the outer channels; at night the process reverses. This oscillating flow gradually flushes stale air out and draws fresh air in, without any single permanent opening.\n\nEngineers have begun to study these structures for inspiration. Buildings modelled on termite ventilation can maintain comfortable internal temperatures while using a fraction of the energy required by conventional air conditioning. The principle is elegantly simple: rather than fighting the external climate, the design works with the natural rhythm of heating and cooling.',
        questions: [
          { id: 'r1', type: 'mcq', text: "What is the main function of a termite mound's internal architecture?", options: ['Storing food', 'Ventilation and temperature control', 'Protection from predators', 'Water collection'], correct: 1 },
          { id: 'r2', type: 'mcq', text: 'What did scientists originally believe about how mounds worked?', options: ['They worked like chimneys', 'They were solid throughout', 'They stored cold air underground', 'They had no airflow'], correct: 0 },
          { id: 'r3', type: 'mcq', text: 'According to recent research, many mounds are:', options: ['open at the top', 'closed at the top', 'open at the base', 'made of metal'], correct: 1 },
          { id: 'r4', type: 'mcq', text: 'What drives the airflow in many mounds?', options: ['Wind only', 'A fan system', 'Daily temperature swings', 'Rainfall'], correct: 2 },
          { id: 'r5', type: 'mcq', text: 'Why are engineers interested in termite mounds?', options: ['For decoration', 'For energy-efficient ventilation ideas', 'To study insects', 'To build taller towers'], correct: 1 },
        ],
      },
      writing: {
        task1: 'The chart below shows the number of students who took the IELTS mock exam at EVEREST centers over six months. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
        task2: 'Some people believe that practising under exam conditions is the best way to prepare for a test, while others think that relaxed, untimed study is more effective. Discuss both views and give your own opinion. Write at least 250 words.',
      },
      speaking: {
        parts: [
          { id: 's1', label: 'Part 1 — Introduction', question: "Let's talk about your hometown. Where are you from, and what do you like most about it?" },
          { id: 's2', label: 'Part 2 — Cue card', question: 'Describe a goal you worked hard to achieve. You should say: what it was, how you prepared, what difficulties you faced, and how you felt when you achieved it.' },
          { id: 's3', label: 'Part 3 — Discussion', question: 'Do you think setting ambitious goals is always a good idea? Why or why not?' },
        ],
      },
    },
  },
};

export function getMock(mockId: string): Mock | undefined {
  return MOCKS[mockId];
}

/** {questionId: to'g'ri qiymat} — avtomatik baholanadigan bo'lim uchun, bo'lmasa {}. */
export function answerKey(mockId: string, section: string): Record<string, number | string> {
  const mock = MOCKS[mockId];
  const sec = (mock?.sections as any)?.[section];
  const key: Record<string, number | string> = {};
  for (const q of sec?.questions || []) {
    if (q.correct !== undefined) key[q.id] = q.correct;
  }
  return key;
}

/** get_mock() bilan bir xil kontent, lekin har bir `correct` javob olib tashlangan,
 * ustiga server-mustahkam bo'lim davomiyliklari qo'shilgan. */
export function publicMock(mockId: string) {
  const mock = MOCKS[mockId];
  if (!mock) return null;
  const pub = structuredClone(mock) as any;
  for (const sec of Object.values(pub.sections) as any[]) {
    for (const q of sec.questions || []) delete q.correct;
  }
  pub.durations = SECTION_DURATIONS;
  pub.order = SECTION_ORDER;
  return pub;
}

/** Berilgan savol ID'si qaysi bo'limga tegishli ekanini topadi — /answer'da
 * bo'lim vaqti tugaganini tekshirish uchun. */
export function sectionOfQuestion(mockId: string, questionId: string): string | null {
  const mock = MOCKS[mockId];
  if (!mock) return null;
  for (const [key, sec] of Object.entries(mock.sections)) {
    for (const q of (sec as any).questions || []) {
      if (q.id === questionId) return key;
    }
  }
  return null;
}
