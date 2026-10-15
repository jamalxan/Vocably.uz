// Vocably Listening 26 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-26',
  title: 'Listening 26: Virtual Fences for Cattle',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'virtual-fences-for-cows-show-benefits',
        contextText: 'You will hear a report about a technology that controls where cattle can go without a physical fence.',
        questionGroups: [
          {
            id: 'l26-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flowchart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>How virtual fencing works</strong></p><p>1. Radio signals come from mobile phone towers or from movable base {{q1}}.</p><p>2. Each animal wears a {{q2}} containing a receiver and a GPS device.</p><p>3. Near the fence line, the animal hears a warning {{q3}}.</p><p>4. If it goes closer, it receives a small electric {{q4}}.</p><p>5. Ranchers can move the boundaries using a phone app or a {{q5}}.</p>',
            questions: [
              q(1, null, 'stations', 'The speaker says "The signals can also come from base stations that can be moved using a small truck."'),
              q(2, null, 'collar', 'The speaker says "Each animal wears a collar around its neck."'),
              q(3, null, 'sound', 'The speaker says "When an animal gets close to a virtual fence, its collar makes a warning sound."'),
              q(4, null, 'shock', 'The speaker says "If the animal moves even closer to the fence, it receives a shock."'),
              q(5, null, 'computer', 'The speaker says "Ranchers can change the virtual fence boundaries quickly by using a phone App or computer."'),
            ],
          },
          {
            id: 'l26-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What happened to the virtual fence system when Hurricane Ian hit Florida?', ['The collars stopped working.', 'The cell towers kept working.', 'Most of the cattle escaped.', 'The base stations were destroyed.'], 'B', 'The speaker says "But the cell towers for the virtual fence system kept working."'),
              mc(7, 'According to William Burnidge, how do virtual fences help plants?', ['They keep animals away from all rivers.', 'They stop animals eating too much in one place.', 'They allow fields to be burned more often.', 'They let workers plant new vegetation.'], 'B', 'The speaker says "the systems prevent animals from eating too much vegetation within one area".'),
              mc(8, 'In the Oregon study, how much of the plant life in the burned area did cows with collars eat?', ['nearly 70 percent', 'about half', 'less than three percent', 'none at all'], 'C', 'The speaker says cows with collars "ate less than three percent of the plants available to them".'),
            ],
          },
          {
            id: 'l26-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'How much can a collar for one animal cost each year?', ['50', '$50', 'around $50'], 'The speaker says "A collar for just one animal can cost around $50 each year or more."'),
              q(10, 'In which country did Burnidge see many workers looking after livestock?', 'Kenya', 'The speaker says "When Burnidge visited Kenya, he saw many workers who closely follow and take care of livestock."'),
            ],
          },
        ],
      }),
    ],
  },
};
