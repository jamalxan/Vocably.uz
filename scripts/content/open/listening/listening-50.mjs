// Vocably Listening 50 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-50',
  title: 'Listening 50: Gender Equality in the Classroom',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'promoting-gender-equality-with-teaching-strategies',
        contextText: 'You will hear a talk giving teachers advice on creating a classroom that is fair to male and female students.',
        questionGroups: [
          {
            id: 'l50-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'According to UNESCO, a good education is important for', ['finding a partner.', 'escaping poverty.', 'learning languages.', 'protecting the environment.'], 'B', 'The speaker says "access to a good education is important for getting out of poverty".'),
              mc(2, 'The speaker says that creating equal opportunities begins with', ['government policy.', 'the parents at home.', 'the teacher in the classroom.', 'the school textbooks.'], 'C', 'The speaker says "Creating more equal educational opportunities for students begins in the classroom and with the teacher."'),
              mc(3, 'Why does the speaker recommend making class rules together with students?', ['Students learn the rules more quickly.', 'The teacher can refer to rules the whole class agreed on.', 'It saves the teacher time.', 'Parents prefer it.'], 'B', 'The speaker says "This permits the teacher to point to the rules as something that the whole class has agreed on."'),
            ],
          },
          {
            id: 'l50-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Organising the classroom</strong></p><ul><li>if some students are not taking part, change the {{q4}} plan</li><li>teachers interact most with the students sitting {{q5}} to them</li><li>do not give some students easier questions; hold the same {{q6}} of everyone</li><li>shy students may prefer activities in small groups of three to {{q7}} students</li></ul>',
            questions: [
              q(4, null, 'seating', 'The speaker says "try to change your class seating plan".'),
              q(5, null, 'closest', 'The speaker says "Teachers tend to interact the most with students sitting closest to them."'),
              q(6, null, 'expectations', 'The speaker says "Teachers should hold the same expectations of all students."'),
              q(7, null, ['four', '4'], 'The speaker says "try doing some activities in small groups of three to four students".'),
            ],
          },
          {
            id: 'l50-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'When calling on students who need time to think, wait at least four to five ______.', 'seconds', 'The speaker says "make sure to give students at least four to five seconds".'),
              q(9, 'Instead of saying <em>guys</em> to a class, a teacher could say ______.', ['everybody', 'everyone'], 'The speaker says "Teachers should use gender neutral pronouns whenever possible" and gives the example of saying everybody or everyone instead of guys.'),
              q(10, 'Students sitting far from the teacher tend to ______ less.', 'participate', 'The speaker says "students sitting further from the teacher tend to participate less".'),
            ],
          },
        ],
      }),
    ],
  },
};
