// Vocably Listening 42 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-42',
  title: 'Listening 42: Pronunciation with Everyday Objects',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'improve-your-english-by-using-common-objects',
        contextText: 'You will hear an education report about using everyday objects to improve English pronunciation.',
        questionGroups: [
          {
            id: 'l42-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What happens when you say the word "this"?', ['Air moves freely through your throat.', 'Your voice box moves.', 'Your lips close.', 'Your tongue stays behind your teeth.'], 'B', 'The speaker says that when you say "this", "your voice box moves".'),
              mc(2, 'According to Tamara Jones, why do some learners find "th" sounds difficult?', ['The sounds do not exist in writing.', 'In many languages sticking your tongue out is impolite.', 'The sounds are too quiet to hear.', 'Learners confuse them with "s" sounds.'], 'B', 'Jones says "in many languages, it\'s not polite to stick your tongue out of your mouth when you are speaking".'),
              mc(3, 'What do Jones\'s students practise with a lollipop?', ['holding their breath', 'pushing their tongue far enough forward to taste the candy', 'keeping their mouth closed', 'speaking without moving their lips'], 'B', 'Jones says students practise "sticking their tongue out between their teeth far enough so that they can taste the candy".'),
            ],
          },
          {
            id: 'l42-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The "-er" sound and vowel sounds</strong></p><ul><li>English speakers often use "-er" when making {{q4}}</li><li>practice: put a pencil in the mouth {{q5}} and bite down on it</li><li>the tongue should not {{q6}} the pencil when saying "-er"</li><li>English dialects have between 13 and {{q7}} vowel sounds</li></ul>',
            questions: [
              q(4, null, 'comparisons', 'The speaker says English speakers often use the sound "when they make comparisons".'),
              q(5, null, 'lengthwise', 'Jones says the trick is "to put a pencil in their mouth lengthwise".'),
              q(6, null, 'touch', 'Jones says "their tongue should not touch the pencil".'),
              q(7, null, '15', 'The speaker says "English dialects can include between 13 and 15 vowel sounds."'),
            ],
          },
          {
            id: 'l42-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Languages such as Japanese and Spanish have only ______ vowel sounds.', ['five', '5'], 'The speaker says Japanese and Spanish "have only five vowel sounds".'),
              q(9, 'Jones suggests looking in a ______ while saying the words "pin" and "green".', 'mirror', 'The speaker says "Look in a mirror, she says, while you say the words".'),
              q(10, 'To say "ee", you pull the sides of your mouth as if you were ______.', 'smiling', 'Jones says "you are pulling the sides of your mouth, almost like you\'re smiling".'),
            ],
          },
        ],
      }),
    ],
  },
};
