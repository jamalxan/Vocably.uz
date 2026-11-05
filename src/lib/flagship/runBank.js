// Public word bank for guest Vocably Run rounds (no account, no DB). IELTS-frequent words, B1–C1.
// The server also uses this list to validate "save my missed words" after sign-up, so only words
// from here can be claimed into a deck.
export const RUN_BANK = [
  // B1
  { word: 'improve', cefr: 'B1', uz: 'yaxshilamoq', definition: 'to make something better' },
  { word: 'reliable', cefr: 'B1', uz: 'ishonchli', definition: 'able to be trusted' },
  { word: 'decrease', cefr: 'B1', uz: 'kamaymoq', definition: 'to become smaller in amount' },
  { word: 'achieve', cefr: 'B1', uz: 'erishmoq', definition: 'to succeed in reaching a goal' },
  { word: 'suggest', cefr: 'B1', uz: 'taklif qilmoq', definition: 'to offer an idea for others to consider' },
  { word: 'environment', cefr: 'B1', uz: 'atrof-muhit', definition: 'the natural world around us' },
  { word: 'opportunity', cefr: 'B1', uz: 'imkoniyat', definition: 'a chance to do something' },
  { word: 'crowded', cefr: 'B1', uz: 'gavjum', definition: 'full of people' },
  { word: 'income', cefr: 'B1', uz: 'daromad', definition: 'money you receive for work' },
  { word: 'benefit', cefr: 'B1', uz: 'foyda', definition: 'a good effect or advantage' },
  { word: 'pollution', cefr: 'B1', uz: 'ifloslanish', definition: 'harmful substances in air, water or land' },
  { word: 'research', cefr: 'B1', uz: 'tadqiqot', definition: 'careful study to discover new facts' },
  { word: 'healthy', cefr: 'B1', uz: 'sog‘lom', definition: 'in good physical condition' },
  { word: 'expensive', cefr: 'B1', uz: 'qimmat', definition: 'costing a lot of money' },
  { word: 'population', cefr: 'B1', uz: 'aholi', definition: 'all the people living in an area' },
  { word: 'traffic', cefr: 'B1', uz: 'transport harakati', definition: 'vehicles moving on roads' },
  { word: 'attend', cefr: 'B1', uz: 'qatnashmoq', definition: 'to go to an event or place regularly' },
  { word: 'career', cefr: 'B1', uz: 'kasbiy yo‘l', definition: 'the jobs you do during your working life' },
  { word: 'disadvantage', cefr: 'B1', uz: 'kamchilik', definition: 'something that makes a situation worse' },
  { word: 'government', cefr: 'B1', uz: 'hukumat', definition: 'the group of people who rule a country' },
  // B2
  { word: 'reluctant', cefr: 'B2', uz: 'istamay', definition: 'not willing to do something' },
  { word: 'consequence', cefr: 'B2', uz: 'oqibat', definition: 'a result of an action' },
  { word: 'obtain', cefr: 'B2', uz: 'qo‘lga kiritmoq', definition: 'to get something, often with effort' },
  { word: 'adequate', cefr: 'B2', uz: 'yetarli', definition: 'enough for a purpose' },
  { word: 'sustain', cefr: 'B2', uz: 'saqlab turmoq', definition: 'to keep something going for a long time' },
  { word: 'significant', cefr: 'B2', uz: 'muhim', definition: 'large or important enough to notice' },
  { word: 'decline', cefr: 'B2', uz: 'pasaymoq', definition: 'to become less or worse' },
  { word: 'efficient', cefr: 'B2', uz: 'samarali', definition: 'working well without wasting time or energy' },
  { word: 'resilient', cefr: 'B2', uz: 'bardoshli', definition: 'able to recover quickly from difficulties' },
  { word: 'urban', cefr: 'B2', uz: 'shaharga oid', definition: 'relating to towns and cities' },
  { word: 'rural', cefr: 'B2', uz: 'qishloqqa oid', definition: 'relating to the countryside' },
  { word: 'contribute', cefr: 'B2', uz: 'hissa qo‘shmoq', definition: 'to give help to a shared result' },
  { word: 'evidence', cefr: 'B2', uz: 'dalil', definition: 'facts that show something is true' },
  { word: 'impact', cefr: 'B2', uz: 'ta’sir', definition: 'a strong effect on something' },
  { word: 'priority', cefr: 'B2', uz: 'ustuvorlik', definition: 'something more important than other things' },
  { word: 'approach', cefr: 'B2', uz: 'yondashuv', definition: 'a way of dealing with something' },
  { word: 'household', cefr: 'B2', uz: 'xonadon', definition: 'all the people living in one home' },
  { word: 'facility', cefr: 'B2', uz: 'inshoot', definition: 'a building or place for a particular activity' },
  { word: 'emphasise', cefr: 'B2', uz: 'ta’kidlamoq', definition: 'to show that something is important' },
  { word: 'fluctuate', cefr: 'B2', uz: 'o‘zgarib turmoq', definition: 'to rise and fall often' },
  // C1
  { word: 'meticulous', cefr: 'C1', uz: 'sinchkov', definition: 'very careful about small details' },
  { word: 'mitigate', cefr: 'C1', uz: 'yumshatmoq', definition: 'to make something less harmful' },
  { word: 'ubiquitous', cefr: 'C1', uz: 'hamma joyda uchraydigan', definition: 'seeming to be everywhere' },
  { word: 'scrutinize', cefr: 'C1', uz: 'sinchiklab tekshirmoq', definition: 'to examine very carefully' },
  { word: 'pragmatic', cefr: 'C1', uz: 'amaliy', definition: 'dealing with things in a realistic way' },
  { word: 'exacerbate', cefr: 'C1', uz: 'yomonlashtirmoq', definition: 'to make a bad situation worse' },
  { word: 'ambiguous', cefr: 'C1', uz: 'noaniq', definition: 'having more than one possible meaning' },
  { word: 'feasible', cefr: 'C1', uz: 'amalga oshirsa bo‘ladigan', definition: 'possible to do' },
  { word: 'detrimental', cefr: 'C1', uz: 'zararli', definition: 'causing harm' },
  { word: 'inevitable', cefr: 'C1', uz: 'muqarrar', definition: 'certain to happen' },
  { word: 'deteriorate', cefr: 'C1', uz: 'yomonlashmoq', definition: 'to become worse over time' },
  { word: 'unprecedented', cefr: 'C1', uz: 'misli ko‘rilmagan', definition: 'never having happened before' },
  { word: 'advocate', cefr: 'C1', uz: 'qo‘llab-quvvatlamoq', definition: 'to publicly support an idea' },
  { word: 'compelling', cefr: 'C1', uz: 'ishonarli', definition: 'very convincing' },
  { word: 'alleviate', cefr: 'C1', uz: 'yengillashtirmoq', definition: 'to make pain or a problem less severe' },
  { word: 'conventional', cefr: 'C1', uz: 'an’anaviy', definition: 'following accepted customs' },
  { word: 'substantial', cefr: 'C1', uz: 'katta miqdordagi', definition: 'large in amount or importance' },
  { word: 'prevalent', cefr: 'C1', uz: 'keng tarqalgan', definition: 'common in a place or time' },
  { word: 'undermine', cefr: 'C1', uz: 'zaiflashtirmoq', definition: 'to gradually weaken something' },
  { word: 'versatile', cefr: 'C1', uz: 'ko‘p qirrali', definition: 'able to do many different things' },
];

const BY_WORD = new Map(RUN_BANK.map((w) => [w.word, w]));

export function bankEntry(word) {
  return BY_WORD.get(String(word || '').trim().toLowerCase()) || null;
}

/** Deck that receives a guest's missed words after sign-up. */
export const RUN_DECK_NAME = 'Vocably Run: xatolar';
