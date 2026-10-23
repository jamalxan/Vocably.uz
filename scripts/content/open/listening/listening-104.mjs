// Vocably Listening 104 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-104',
  title: 'Listening 104: Let Sleeping Dogs Lie',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'sometimes-it-is-better-to-let-sleeping-dogs-lie',
        contextText: 'You will hear a talk about English expressions for choosing not to act on a problem.',
        questionGroups: [
          {
            id: 'l104-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Leaving a problem alone</strong></p><p>Some difficult situations are best given time and {{q1}}. To let sleeping dogs lie means to do {{q2}} about a situation, because acting can sometimes make things {{q3}}. A similar expression is to let nature take its {{q4}}: we do not interfere, but sit back and let events {{q5}}.</p>',
            questions: [
              q(1, null, 'space', 'The speaker says "it can be a good idea to give a problem or a difficult situation time and space".'),
              q(2, null, 'nothing', 'The speaker says "To let sleeping dogs lie means to do nothing in a situation."'),
              q(3, null, 'worse', 'The speaker says "Sometimes taking action can make things worse."'),
              q(4, null, 'course', 'The speaker says "When we let nature take its course we do not interfere."'),
              q(5, null, 'unfold', 'The speaker says "We sit back and let events unfold."'),
            ],
          },
          {
            id: 'l104-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'When do people usually "turn a blind eye"?', ['when they cannot see a problem clearly', 'when they choose to ignore something bad another person has done', 'when they punish someone for bad behaviour', 'when they want to help a friend'], 'B', 'The speaker says "This is when you choose to ignore something. Usually it is something bad that someone else has done."'),
              mc(7, 'Which example does the speaker give of turning a blind eye with bad results?', ['parents ignoring homework', 'police ignoring crime', 'teachers ignoring bullying', 'friends ignoring a bad habit'], 'C', 'The speaker says "when teachers turn a blind eye to bullying in the classroom, really bad things can happen".'),
            ],
          },
          {
            id: 'l104-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'What did Jess fail to receive at work?', ['promotion', 'a promotion'], 'The first friend says "Well, he didn\'t get a promotion."'),
              q(9, 'Where did the first friend tell Jess\'s boss that she had made a mistake?', ['work gathering', 'gathering'], 'The first friend says "at a work gathering recently, I told his boss that she made a mistake".'),
              q(10, 'Instead of phoning, what does the first friend think about sending to the boss?', ['card', 'a card'], 'The first friend says "I won\'t call. Maybe I\'ll send her a card."'),
            ],
          },
        ],
      }),
    ],
  },
};
