// Vocably Listening 18 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-18',
  title: 'Listening 18: New Words in the Dictionary',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'new-words-added-to-dictionary',
        contextText: 'You will hear a programme about new words that have been added to an American dictionary.',
        questionGroups: [
          {
            id: 'l18-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>New dictionary words</strong></p><ul><li>the VOA Learning English Word Book contains {{q1}} words</li><li>Merriam-Webster added {{q2}} new words in October 2021</li><li>shortened words have become common because of messaging, {{q3}} and tweeting online</li><li>FTW is used to express {{q4}} or support on social media</li></ul>',
            questions: [
              q(1, null, ['1,500', '1500'], 'The speaker says "learning all 1,500 words in the VOA Learning English Word Book".'),
              q(2, null, '455', 'The speaker says Merriam-Webster "has added 455 new words to its dictionary".'),
              q(3, null, 'texting', 'The speaker says "the quick and informal nature of messaging, texting and tweeting online has increased during the pandemic".'),
              q(4, null, 'approval', 'The speaker says "It is often used to express approval or support on social media."'),
            ],
          },
          {
            id: 'l18-words', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Which new word matches each description? Choose the correct letter, <strong>A-G</strong>.',
            bank: bank(['bit rot', 'zero-day', 'whataboutism', 'vote-a-rama', 'fluffernutter', 'horchata', 'dad bod']),
            questions: [
              q(5, 'a weakness in computer systems that criminals find', 'B', 'The speaker says "zero-day is a term to describe weakness in computer systems that cybercriminals discover".'),
              q(6, 'an unusually large number of debates and votes held in a single day', 'D', 'The speaker says "vote-a-rama describes the unusually large number of debates and votes that happen in one day".'),
              q(7, 'a sandwich made with peanut butter and marshmallow', 'E', 'The speaker says "This is a sandwich made with peanut butter and marshmallow".'),
              q(8, 'the body of an average father', 'G', 'The speaker says the publisher "describes a dad bod as the body of an average father".'),
            ],
          },
          {
            id: 'l18-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'How many of the new words has the programme had time to describe?', ['16', '455', '520', '1,500'], 'A', 'The speaker says "we have only had time to tell you about 16 of the 455 new words".'),
              mc(10, 'What happened last January?', ['The publisher added 520 new words.', 'The Word Book was published.', 'The pandemic was declared over.', 'The dictionary removed old words.'], 'A', 'The speaker says "Last January, the dictionary publisher added 520 new words."'),
            ],
          },
        ],
      }),
    ],
  },
};
