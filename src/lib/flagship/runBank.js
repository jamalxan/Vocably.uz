// Public word bank for guest Vocably Run rounds (no account, no DB). IELTS-frequent words, B1–C1.
// `uz` / `ru` — translations; the round uses the learner's translation language (UI ru -> ru, otherwise uz).
// The server also uses this list to validate "save my missed words" after sign-up, so only words
// from here can be claimed into a deck.
export const RUN_BANK = [
  // B1
  { word: 'improve', cefr: 'B1', uz: 'yaxshilamoq', ru: 'улучшать', definition: 'to make something better' },
  { word: 'reliable', cefr: 'B1', uz: 'ishonchli', ru: 'надёжный', definition: 'able to be trusted' },
  { word: 'decrease', cefr: 'B1', uz: 'kamaymoq', ru: 'уменьшаться', definition: 'to become smaller in amount' },
  { word: 'achieve', cefr: 'B1', uz: 'erishmoq', ru: 'достигать', definition: 'to succeed in reaching a goal' },
  { word: 'suggest', cefr: 'B1', uz: 'taklif qilmoq', ru: 'предлагать', definition: 'to offer an idea for others to consider' },
  { word: 'environment', cefr: 'B1', uz: 'atrof-muhit', ru: 'окружающая среда', definition: 'the natural world around us' },
  { word: 'opportunity', cefr: 'B1', uz: 'imkoniyat', ru: 'возможность', definition: 'a chance to do something' },
  { word: 'crowded', cefr: 'B1', uz: 'gavjum', ru: 'переполненный', definition: 'full of people' },
  { word: 'income', cefr: 'B1', uz: 'daromad', ru: 'доход', definition: 'money you receive for work' },
  { word: 'benefit', cefr: 'B1', uz: 'foyda', ru: 'польза', definition: 'a good effect or advantage' },
  { word: 'pollution', cefr: 'B1', uz: 'ifloslanish', ru: 'загрязнение', definition: 'harmful substances in air, water or land' },
  { word: 'research', cefr: 'B1', uz: 'tadqiqot', ru: 'исследование', definition: 'careful study to discover new facts' },
  { word: 'healthy', cefr: 'B1', uz: 'sog‘lom', ru: 'здоровый', definition: 'in good physical condition' },
  { word: 'expensive', cefr: 'B1', uz: 'qimmat', ru: 'дорогой', definition: 'costing a lot of money' },
  { word: 'population', cefr: 'B1', uz: 'aholi', ru: 'население', definition: 'all the people living in an area' },
  { word: 'traffic', cefr: 'B1', uz: 'transport harakati', ru: 'дорожное движение', definition: 'vehicles moving on roads' },
  { word: 'attend', cefr: 'B1', uz: 'qatnashmoq', ru: 'посещать', definition: 'to go to an event or place regularly' },
  { word: 'career', cefr: 'B1', uz: 'kasbiy yo‘l', ru: 'карьера', definition: 'the jobs you do during your working life' },
  { word: 'disadvantage', cefr: 'B1', uz: 'kamchilik', ru: 'недостаток', definition: 'something that makes a situation worse' },
  { word: 'government', cefr: 'B1', uz: 'hukumat', ru: 'правительство', definition: 'the group of people who rule a country' },
  // B2
  { word: 'reluctant', cefr: 'B2', uz: 'istamay', ru: 'неохотный', definition: 'not willing to do something' },
  { word: 'consequence', cefr: 'B2', uz: 'oqibat', ru: 'последствие', definition: 'a result of an action' },
  { word: 'obtain', cefr: 'B2', uz: 'qo‘lga kiritmoq', ru: 'получать', definition: 'to get something, often with effort' },
  { word: 'adequate', cefr: 'B2', uz: 'yetarli', ru: 'достаточный', definition: 'enough for a purpose' },
  { word: 'sustain', cefr: 'B2', uz: 'saqlab turmoq', ru: 'поддерживать', definition: 'to keep something going for a long time' },
  { word: 'significant', cefr: 'B2', uz: 'muhim', ru: 'значительный', definition: 'large or important enough to notice' },
  { word: 'decline', cefr: 'B2', uz: 'pasaymoq', ru: 'снижаться', definition: 'to become less or worse' },
  { word: 'efficient', cefr: 'B2', uz: 'samarali', ru: 'эффективный', definition: 'working well without wasting time or energy' },
  { word: 'resilient', cefr: 'B2', uz: 'bardoshli', ru: 'устойчивый', definition: 'able to recover quickly from difficulties' },
  { word: 'urban', cefr: 'B2', uz: 'shaharga oid', ru: 'городской', definition: 'relating to towns and cities' },
  { word: 'rural', cefr: 'B2', uz: 'qishloqqa oid', ru: 'сельский', definition: 'relating to the countryside' },
  { word: 'contribute', cefr: 'B2', uz: 'hissa qo‘shmoq', ru: 'вносить вклад', definition: 'to give help to a shared result' },
  { word: 'evidence', cefr: 'B2', uz: 'dalil', ru: 'доказательство', definition: 'facts that show something is true' },
  { word: 'impact', cefr: 'B2', uz: 'ta’sir', ru: 'влияние', definition: 'a strong effect on something' },
  { word: 'priority', cefr: 'B2', uz: 'ustuvorlik', ru: 'приоритет', definition: 'something more important than other things' },
  { word: 'approach', cefr: 'B2', uz: 'yondashuv', ru: 'подход', definition: 'a way of dealing with something' },
  { word: 'household', cefr: 'B2', uz: 'xonadon', ru: 'домохозяйство', definition: 'all the people living in one home' },
  { word: 'facility', cefr: 'B2', uz: 'inshoot', ru: 'учреждение', definition: 'a building or place for a particular activity' },
  { word: 'emphasise', cefr: 'B2', uz: 'ta’kidlamoq', ru: 'подчёркивать', definition: 'to show that something is important' },
  { word: 'fluctuate', cefr: 'B2', uz: 'o‘zgarib turmoq', ru: 'колебаться', definition: 'to rise and fall often' },
  // C1
  { word: 'meticulous', cefr: 'C1', uz: 'sinchkov', ru: 'скрупулёзный', definition: 'very careful about small details' },
  { word: 'mitigate', cefr: 'C1', uz: 'yumshatmoq', ru: 'смягчать', definition: 'to make something less harmful' },
  { word: 'ubiquitous', cefr: 'C1', uz: 'hamma joyda uchraydigan', ru: 'вездесущий', definition: 'seeming to be everywhere' },
  { word: 'scrutinize', cefr: 'C1', uz: 'sinchiklab tekshirmoq', ru: 'тщательно изучать', definition: 'to examine very carefully' },
  { word: 'pragmatic', cefr: 'C1', uz: 'amaliy', ru: 'прагматичный', definition: 'dealing with things in a realistic way' },
  { word: 'exacerbate', cefr: 'C1', uz: 'yomonlashtirmoq', ru: 'усугублять', definition: 'to make a bad situation worse' },
  { word: 'ambiguous', cefr: 'C1', uz: 'noaniq', ru: 'двусмысленный', definition: 'having more than one possible meaning' },
  { word: 'feasible', cefr: 'C1', uz: 'amalga oshirsa bo‘ladigan', ru: 'осуществимый', definition: 'possible to do' },
  { word: 'detrimental', cefr: 'C1', uz: 'zararli', ru: 'вредный', definition: 'causing harm' },
  { word: 'inevitable', cefr: 'C1', uz: 'muqarrar', ru: 'неизбежный', definition: 'certain to happen' },
  { word: 'deteriorate', cefr: 'C1', uz: 'yomonlashmoq', ru: 'ухудшаться', definition: 'to become worse over time' },
  { word: 'unprecedented', cefr: 'C1', uz: 'misli ko‘rilmagan', ru: 'беспрецедентный', definition: 'never having happened before' },
  { word: 'advocate', cefr: 'C1', uz: 'qo‘llab-quvvatlamoq', ru: 'выступать за', definition: 'to publicly support an idea' },
  { word: 'compelling', cefr: 'C1', uz: 'ishonarli', ru: 'убедительный', definition: 'very convincing' },
  { word: 'alleviate', cefr: 'C1', uz: 'yengillashtirmoq', ru: 'облегчать', definition: 'to make pain or a problem less severe' },
  { word: 'conventional', cefr: 'C1', uz: 'an’anaviy', ru: 'традиционный', definition: 'following accepted customs' },
  { word: 'substantial', cefr: 'C1', uz: 'katta miqdordagi', ru: 'существенный', definition: 'large in amount or importance' },
  { word: 'prevalent', cefr: 'C1', uz: 'keng tarqalgan', ru: 'распространённый', definition: 'common in a place or time' },
  { word: 'undermine', cefr: 'C1', uz: 'zaiflashtirmoq', ru: 'подрывать', definition: 'to gradually weaken something' },
  { word: 'versatile', cefr: 'C1', uz: 'ko‘p qirrali', ru: 'разносторонний', definition: 'able to do many different things' },
];

const BY_WORD = new Map(RUN_BANK.map((w) => [w.word, w]));

export function bankEntry(word) {
  return BY_WORD.get(String(word || '').trim().toLowerCase()) || null;
}

/** The bank word's translation in the learner's language ('uz' | 'ru'), or ''. */
export function bankMeaning(word, lang = 'uz') {
  const e = bankEntry(word);
  if (!e) return '';
  return (lang === 'ru' && e.ru) || e.uz || '';
}

/** Deck that receives a guest's missed words after sign-up. */
export const RUN_DECK_NAME = 'Vocably Run: xatolar';
