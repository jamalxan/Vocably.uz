// Vocably Listening 105 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-105',
  title: 'Listening 105: In the Hot Seat',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'in-the-hot-seat-is-not-where-you-want-to-be',
        contextText: 'You will hear a talk about the English expression "in the hot seat".',
        questionGroups: [
          {
            id: 'l105-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>When you are "in the hot seat"</strong></p><ul><li>you have to defend yourself or share {{q1}}</li><li>e.g. being questioned by the police or a {{q2}}</li><li>a hard job {{q3}} or school exam can feel the same</li><li>parents\' questions can feel like an {{q4}}</li><li>teachers may question students accused of {{q5}} on a test</li></ul>',
            questions: [
              q(1, null, 'information', 'The speaker says "It can be a situation where you need to defend yourself or share information."'),
              q(2, null, 'detective', 'The speaker says "If you are questioned by the police or a detective, you are definitely in the hot seat."'),
              q(3, null, 'interview', 'The speaker says "A difficult job interview or school exam can also make you feel like you\'re in the hot seat."'),
              q(4, null, 'interrogation', 'The speaker says "These questions could feel like an interrogation."'),
              q(5, null, 'cheating', 'The speaker says "If students are accused of doing something like cheating on a test or damaging school property, a teacher might put them in the hot seat to get information."'),
            ],
          },
          {
            id: 'l105-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does the speaker see Mr. Dishonest doing at the restaurant?', ['eating alone', 'arguing with his wife', 'holding hands with another woman', 'leaving without paying'], 'C', 'The speaker says "When I see Mr. Dishonest at a restaurant holding hands with another woman, I could put him in the hot seat".'),
              mc(7, 'Why did Alice end up in the hot seat with her boss?', ['She forgot to organise the party.', 'She gave everyone the wrong date.', 'She spent too much money.', 'She did not attend the party.'], 'B', 'The speaker says "But she told everyone the wrong date. So, when no one showed up, she found herself in the hot seat with her boss."'),
              mc(8, 'What does the speaker say about "in the hot seat" and "on the hot seat"?', ['Only "in" is correct.', 'Only "on" is correct.', 'Both are correct, but "in" sounds more natural.', 'Both are old-fashioned.'], 'C', 'The speaker says "Both are correct. But in the hot seat sounds more natural."'),
            ],
          },
          {
            id: 'l105-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'According to some word experts, the use of what for executions may have given us the idiom?', ['electric chairs', 'electric chair'], 'The speaker says "Some word experts say that it may have come from the use of electric chairs for executions."'),
              q(10, 'Which card game do other experts think the idiom comes from?', 'poker', 'The speaker says "Other experts say the idiom may come from the card game poker."'),
            ],
          },
        ],
      }),
    ],
  },
};
