// Vocably Listening 70 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-70',
  title: 'Listening 70: Abraham Lincoln and the Civil War',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-presidents-abraham-lincoln',
        contextText: 'You will hear a talk about the early life of Abraham Lincoln and the start of the American Civil War.',
        questionGroups: [
          {
            id: 'l70-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Abraham Lincoln: early life</strong></p><ul><li>born in the state of {{q1}}; family lived in a log cabin</li><li>rarely went to school – taught himself by reading {{q2}}</li><li>became a {{q3}} in Illinois</li><li>his clients called him "Honest {{q4}}"</li><li>married Mary Todd in {{q5}}; four sons</li></ul>',
            questions: [
              q(1, null, 'Kentucky', 'The speaker says "Abraham Lincoln was born in the frontier state of Kentucky."'),
              q(2, null, 'books', 'The speaker says "Instead, he taught himself by reading books."'),
              q(3, null, 'lawyer', 'The speaker says "Eventually, he became a lawyer in the state of Illinois."'),
              q(4, null, 'Abe', 'The speaker says "The people he defended in court called him" Honest Abe.'),
              q(5, null, '1842', 'The speaker says "He had married a Southern belle named Mary Todd in 1842."'),
            ],
          },
          {
            id: 'l70-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Why was Lincoln unpopular as a congressman?', ['He opposed the war with Mexico.', 'He supported slavery.', 'He rarely attended Congress.', 'He wanted higher taxes.'], 'A', 'The speaker says "Voters did not like his opposition to the country\'s war with Mexico."'),
              mc(7, 'What did Lincoln promise to do if he became president?', ['end slavery everywhere immediately', 'stop slavery spreading to new western territories', 'let each Southern state leave the Union', 'free the slaves in the South'], 'B', 'The speaker says "he would not expand slavery to new territories in the country\'s west".'),
              mc(8, 'What happened at Fort Sumter?', ['Union ships attacked the Confederate coast.', 'Confederate soldiers attacked and the fort surrendered.', 'Many soldiers were killed on both sides.', 'The Confederate soldiers surrendered to the Union.'], 'B', 'The speaker says "As expected, Confederate soldiers attacked. A day and a half later, the fort\'s Union soldiers surrendered."'),
              mc(9, 'Why did Lincoln not ask Congress for an official declaration of war?', ['He expected the fighting to end within weeks.', 'Congress refused to meet.', 'He did not want to treat the Confederacy as a separate nation.', 'The state militias had already attacked.'], 'C', 'The speaker says "he did not want to recognize the Confederacy as a separate nation".'),
            ],
          },
          {
            id: 'l70-multi', type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 10,
                promptHtml: 'Which TWO groups does the speaker say were among the soldiers in the Civil War?',
                options: [
                  { key: 'A', text: 'African-American men' },
                  { key: 'B', text: 'women from the North' },
                  { key: 'C', text: 'Native-American men' },
                  { key: 'D', text: 'British volunteers' },
                  { key: 'E', text: 'Mexican soldiers' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: 'The speaker says "Among the soldiers were African-American and Native-American men."',
              },
            ],
          },
        ],
      }),
    ],
  },
};
