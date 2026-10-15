// Vocably Listening 30 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-30',
  title: 'Listening 30: Words of the Year 2024',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'for-words-of-the-year-brat-brain-rot-polarization',
        contextText: 'You will hear a report about the words that dictionary publishers selected as their word of the year for 2024.',
        questionGroups: [
          {
            id: 'l30-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'Merriam-Webster says polarization is an idea that both sides of the political ______ agree on.', 'spectrum', 'The speaker says polarization "happens to be one idea that both sides of the political spectrum agree on".'),
              q(2, 'Supporters of Donald Trump accused Kamala Harris of ______.', 'pandering', 'The speaker says "Trump\'s supporters accused Harris of pandering".'),
              q(3, 'Oxford says the use of "brain rot" rose by ______ percent in a year.', '230', 'The speaker says usage of brain rot "increased by 230 percent".'),
              q(4, 'The phrase probably first appeared in writing in a book by Henry David Thoreau published in ______.', '1854', 'The speaker says "The phrase likely first appeared in written form in Henry David Thoreau\'s 1854 book Walden".'),
            ],
          },
          {
            id: 'l30-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What does Casper Grathwohl find fascinating about "brain rot"?', ['It was first used by a famous writer.', 'It has been adopted by the young people who make online content.', 'It is used more by older people than by the young.', 'It has replaced an older medical term.'], 'B', 'The speaker quotes him: "I find it fascinating that the term brain rot has been adopted by Gen Z and Gen Alpha".'),
              mc(6, 'Where did the recent use of the word "brat" begin?', ['in a political speech', 'as the title of an album', 'in a TikTok video', 'in a dictionary definition'], 'B', 'The speaker says "The most recent usage of brat started as the title of an album by pop singer Charli XCX."'),
              mc(7, 'Traditionally, what did "brat" describe?', ['a confident and independent adult', 'an immature person or badly behaved child', 'a popular singer', 'a fashionable way of life'], 'B', 'The speaker says "Traditionally, brat describes an immature person or an unruly child."'),
            ],
          },
          {
            id: 'l30-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Which online dictionary chose "demure" as its word of the year?', 'Dictionary.com', 'The speaker says "The online Dictionary.com selected demure as its word of the year for 2024."'),
              q(9, 'On which platform did Jools Lebron post her videos?', 'TikTok', 'The speaker says "The sharp rise is credited to several videos on TikTok by Jools Lebron."'),
              q(10, 'In which century was "demure" used for people who avoided attention?', ['14th', 'fourteenth', '14'], 'The speaker says "In the 14th century, demure was used to describe people who avoid bringing attention to themselves."'),
            ],
          },
        ],
      }),
    ],
  },
};
