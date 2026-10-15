// Vocably Listening 39 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-39',
  title: 'Listening 39: Managing Large Language Classes',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'education-tips-managin-large-language-classes',
        contextText: 'You will hear an education programme about how teachers can manage large language classes.',
        questionGroups: [
          {
            id: 'l39-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Which person does each statement refer to? Choose the correct letter, <strong>A-D</strong>.',
            bank: bank(['Penny Ur', 'Natalie Hess', 'Darpak Sabankili', 'Kwan Warapatsu']),
            questions: [
              q(1, 'A class is too big when the teacher cannot help students make the progress they should.', 'A', 'The speaker says Penny Ur considers a class too large "if the teacher is unable to help the students make the progress they should be making".'),
              q(2, 'Large classes give opportunities for interactive activities.', 'B', 'The speaker says Natalie Hess "says that large classes offer a chance for interactive activities".'),
              q(3, 'The agreed class rules are displayed on the classroom wall.', 'C', 'The speaker says Darpak "puts the list of rules on a wall in the classroom for everyone to see".'),
            ],
          },
          {
            id: 'l39-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Organising a large class</strong></p><p>Organisation is extremely important with large groups. Teachers should begin every class with an {{q4}} for the day, and they need a way of getting attention when the class becomes noisy – for example a quiet signal such as raising your {{q5}}. Since students lose interest when activities go on too long, teachers should plan many activities at different levels of {{q6}}. When students work in groups, each one should be given a role, such as note-taker, {{q7}}, leader or presenter.</p>',
            questions: [
              q(4, null, 'agenda', 'The speaker says "Start each class with an agenda for the day."'),
              q(5, null, 'hand', 'The speaker mentions a quiet signal "such as raising your hand".'),
              q(6, null, 'difficulty', 'The speaker says teachers should "plan to have many different activities, with different levels of difficulty".'),
              q(7, null, 'timekeeper', 'The speaker says "These roles may include note-taker, timekeeper, leader, or presenter."'),
            ],
          },
          {
            id: 'l39-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(8, 'In a "jigsaw" activity, what does each member of the group do?', ['reads the whole story and summarises it', 'works on one part of the task and shares it with the group', 'corrects the work of another student', 'takes notes for the whole group'], 'B', 'The speaker says "each member of a group works on a certain part of an assignment" and then shares it with the group.'),
              mc(9, 'How can teachers reduce the time they spend correcting work?', ['by marking only some of the assignments', 'by having students exchange papers and correct each other\'s work', 'by giving every group the same grade', 'by asking students to correct their work at home'], 'B', 'The speaker says one effective tool is "to have students exchange papers and correct each other\'s work".'),
              mc(10, 'What does Kwan Warapatsu do before pair and group activities?', ['She trains students with very simple tasks.', 'She explains why working together is useful.', 'She puts students of the same level together.', 'She gives the class a short test.'], 'B', 'The speaker says she spends time discussing with her students "why it is good for them to work together in class".'),
            ],
          },
        ],
      }),
    ],
  },
};
