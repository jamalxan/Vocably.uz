// Vocably Listening 40 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart, table } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-40',
  title: 'Listening 40: Expressing Your Opinion',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'how-to-express-your-opinions-in-english',
        contextText: 'You will hear a language programme about phrases for giving opinions, agreeing and disagreeing in English.',
        questionGroups: [
          {
            id: 'l40-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Type of phrase', 'Example from the programme'],
              [
                ['everyday', '"In my opinion, {{q1}} has the best street food."'],
                ['stronger', 'add an adverb or an {{q2}}, e.g. "In my honest opinion…"'],
                ['formal', '"In my view, cruise ships should be {{q3}}."'],
                ['reason given', 'they produce massive amounts of {{q4}}'],
              ],
              'Phrases for giving an opinion',
            ),
            questions: [
              q(1, null, 'Bangkok', 'The speaker says "In my opinion, Bangkok has the best street food."'),
              q(2, null, 'adjective', 'The speaker says "You can do it by adding an adverb or adjective."'),
              q(3, null, 'banned', 'The speaker says "In my view, cruise ships should be banned."'),
              q(4, null, 'waste', 'The speaker says "They produce massive amounts of waste".'),
            ],
          },
          {
            id: 'l40-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What does the speaker say about choosing between "In my view" and "I think"?', ['"In my view" must only be used in writing.', 'There is no fixed rule – it is often a personal choice.', '"I think" is never used in formal situations.', 'Both are too direct for a business meeting.'], 'B', 'The speaker says "there is no rule for where or when you can use them" and it is often a matter of personal choice.'),
              mc(6, 'What grammar point does the speaker make about agreeing?', ['"Agree" is a verb, so do not say "I am agree".', '"Agree" should always be followed by "with".', 'You should not use "agree" in the present tense.', '"Agree" is more formal than "think".'], 'A', 'The speaker says "agree is a verb in English" and warns not to say "I am agree".'),
              mc(7, 'When can direct phrases like "I disagree" be a problem?', ['when talking to close friends', 'when discussing lighter subjects', 'in professional situations or serious discussions', 'when writing on a personal blog'], 'C', 'The speaker says that in discussions of more serious subjects "or in professional situations, these phrases can be too direct".'),
            ],
          },
          {
            id: 'l40-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'One polite way to disagree is to show that you ______ the other person\'s opinion before giving your own.', 'respect', 'The speaker says you can "tell the person you respect their opinion before sharing your own".'),
              q(9, 'In the example exchange, one speaker believes it is not the right time to leave ______.', 'Los Angeles', 'The speaker says "now is not the right time to leave Los Angeles".'),
              q(10, 'The speaker advises learners to choose a few phrases that feel ______ to them.', ['natural', 'most natural'], 'The speaker says "choose only a few phrases that feel most natural to you".'),
            ],
          },
        ],
      }),
    ],
  },
};
