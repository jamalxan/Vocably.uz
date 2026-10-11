// SpeakUp kitobidan (egasining ruxsati bilan; scripts/content/speakup/speakup.json —
// parse_speakup.py chiqishi) 60 ta "faqat Speaking" ExamTest yasaydi va yuklaydi.
//   Set 1-30:  Part 2 = asosiy cue card (30-59), Part 3 = mos muhokama mavzusi (60-89) savollari
//   Set 31-60: Part 2 = shu mavzuning mashq kartasi, Part 3 = mavzuning mashq savollari
//   Part 1: kitobdagi 58 guruh (29 mavzu x [asosiy, mashq]) dan ikkitadan — haqiqiy IELTS'dagi
//   kabi 2 ta mavzu; har guruh taxminan ikki to'plamda uchraydi.
// Har savolga namuna javob + iboralar (modelAnswers) biriktiriladi; foydalanuvchi javob
// yozib olgandan keyin ko'rsatiladi (src/features/exam/speaking/ModelAnswer.tsx).
//   node --env-file=.env --import tsx scripts/load-speakup.mts [--dry]
import dns from 'node:dns';
import fs from 'node:fs';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dry = process.argv.includes('--dry');
const data = JSON.parse(fs.readFileSync('scripts/content/speakup/speakup.json', 'utf8'));
const { validateTest } = await import('@/lib/exam/contentValidator');

type Vocab = { phrase: string; meaning?: string; uz?: string };
type QA = { question: string; answer: string; vocab?: Vocab[] };

const bare = (p: string) => p.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\.\.\./g, '').replace(/\s+/g, ' ').trim().toLowerCase();
// Mashq javoblarida lug'at yo'q — shu mavzudagi asosiy javoblar lug'atidan javobda ishlatilganlarini olamiz.
function vocabFor(answer: string, pool: Vocab[]): Vocab[] {
  const a = answer.toLowerCase();
  const seen = new Set<string>();
  return pool.filter((v) => {
    const k = bare(v.phrase);
    if (!k || seen.has(k) || !a.includes(k)) return false;
    seen.add(k);
    return true;
  });
}
const withVocab = (items: QA[], pool: Vocab[]) => items.map((q) => ({ question: q.question, model: { answer: q.answer, vocab: q.vocab?.length ? q.vocab : vocabFor(q.answer, pool) } }));

// Part 1 guruhlari
const p1Groups = data.part1.flatMap((t: any) => {
  const pool = t.questions.flatMap((q: QA) => q.vocab || []);
  return [
    { name: t.name, items: withVocab(t.questions, pool) },
    { name: t.name, items: withVocab(t.practice, pool) },
  ];
});
// Guruhlarni aralashtirish: asosiy va mashq guruhlari navbatma-navbat (bir to'plamda bir mavzuning ikki guruhi tushmasin).
const order = [...p1Groups.filter((_: any, i: number) => i % 2 === 0), ...p1Groups.filter((_: any, i: number) => i % 2 === 1)];
const part3ByNo = new Map(data.part3.map((t: any) => [t.no, t]));

const sets: any[] = [];
data.part2.forEach((card: any, i: number) => {
  const p3 = part3ByNo.get(card.no + 30) as any;
  if (!p3) throw new Error(`Part 3 mavzusi topilmadi: ${card.no + 30}`);
  const p3pool = p3.questions.flatMap((q: QA) => q.vocab || []);
  const cardPool = [...card.vocab, ...p3pool];
  for (const variant of ['main', 'practice'] as const) {
    const k = sets.length; // 0..59
    const g1 = order[k % order.length];
    const g2 = order[(k + 29) % order.length];
    const part1 = [...g1.items, ...g2.items];
    const part3 = withVocab(variant === 'main' ? p3.questions : p3.practice, p3pool);
    const pc = variant === 'main' ? card : card.practice;
    const bullets = (pc.bullets || []).filter(Boolean);
    sets.push({
      n: variant === 'main' ? i + 1 : i + 31,
      name: card.name,
      speaking: {
        durationSec: 900,
        part1Questions: part1.map((x: any) => x.question),
        part2CueCard: { topic: pc.topic, bulletPoints: bullets, prepSec: 60, speakSec: 120 },
        part3Questions: part3.map((x: any) => x.question),
        modelAnswers: {
          part1: part1.map((x: any) => x.model),
          part2: { answer: pc.answer, vocab: variant === 'main' ? card.vocab : vocabFor(pc.answer, cardPool) },
          part3: part3.map((x: any) => x.model),
        },
      },
    });
  }
});
sets.sort((a, b) => a.n - b.n);

const errors: string[] = [];
for (const s of sets) {
  const sp = s.speaking;
  if (sp.part1Questions.length < 6) errors.push(`${s.n}: Part 1 savollari kam (${sp.part1Questions.length})`);
  if (sp.part3Questions.length < 3) errors.push(`${s.n}: Part 3 savollari kam`);
  if (!sp.part2CueCard.topic.startsWith('Describe') || sp.part2CueCard.bulletPoints.length < 3) errors.push(`${s.n}: cue card noto'g'ri`);
  const m = sp.modelAnswers;
  if (m.part1.length !== sp.part1Questions.length || m.part3.length !== sp.part3Questions.length) errors.push(`${s.n}: namuna javoblar soni mos emas`);
  for (const a of [...m.part1, m.part2, ...m.part3]) if (!a?.answer || a.answer.length < 60) errors.push(`${s.n}: bo'sh/qisqa namuna javob`);
  for (const q of [...sp.part1Questions, ...sp.part3Questions]) if (!q.endsWith('?')) errors.push(`${s.n}: savol "?" bilan tugamaydi: ${q}`);
  const doc: any = { slug: `speakup-speaking-${String(s.n).padStart(2, '0')}`, title: `SpeakUp Speaking ${s.n} — ${s.name}`, module: 'academic', sections: { speaking: sp }, rights: { sourceType: 'licensed', licence: 'x', publishScope: 'public' } };
  for (const i of validateTest(doc).filter((x: any) => x.severity === 'error')) errors.push(`${s.n}: ${i.path} ${i.message}`);
}
const allQ = sets.flatMap((s) => [...s.speaking.part1Questions, s.speaking.part2CueCard.topic, ...s.speaking.part3Questions]);
console.log(`${sets.length} ta to'plam; jami ${allQ.length} savol (${new Set(allQ).size} noyob); xatolar: ${errors.length}`);
errors.slice(0, 20).forEach((e) => console.log('  ✗', e));
if (errors.length) process.exit(1);
if (dry) {
  const s = sets[0].speaking;
  console.log('Namuna:', sets[0].name, '| P1:', s.part1Questions.slice(0, 2), '| P2:', s.part2CueCard.topic, '| P3:', s.part3Questions[0]);
  process.exit(0);
}

const { connectToDatabase } = await import('@/lib/db');
const mongoose = (await import('mongoose')).default;
await connectToDatabase();
const db = mongoose.connection.db!;
const admin = await db.collection('users').findOne({ role: 'admin' }, { projection: { _id: 1 } });
let created = 0, updated = 0;
for (const s of sets) {
  const slug = `speakup-speaking-${String(s.n).padStart(2, '0')}`;
  const prev = await db.collection('examtests').findOne({ slug }, { projection: { _id: 1, createdAt: 1 } });
  await db.collection('examtests').replaceOne(
    { slug },
    {
      slug,
      title: `SpeakUp Speaking ${s.n} — ${s.name}`,
      module: 'academic',
      difficulty: 'medium',
      sections: { speaking: s.speaking },
      bandTable: null,
      isPublished: true,
      isMockEligible: false,
      rights: {
        sourceType: 'licensed', publisher: 'SpeakUp',
        licence: "Used with the owner's permission (SpeakUp - IELTS Speaking Parts 1-3)",
        licenceNote: 'Questions, Band 8+ model answers and Uzbek glossaries from the SpeakUp book; permission confirmed by the platform owner 2026-10-09.',
        rightsVerifiedBy: admin?._id || null, rightsVerifiedAt: new Date(), publishScope: 'public',
      },
      createdBy: admin?._id, createdAt: prev?.createdAt || new Date(), updatedAt: new Date(),
    },
    { upsert: true },
  );
  if (prev) updated++; else created++;
}
console.log(`Yuklandi: ${created} yangi, ${updated} yangilandi.`);
await mongoose.disconnect();
process.exit(0);
