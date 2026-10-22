// Vocably Reading 116 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 0, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-116',
  title: 'Reading 116: Sand Dunes',
  difficulty: 'easy',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'dune', title: 'The Shifting World of Sand Dunes', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r116-types', type: 'matching_features', bankReusable: true,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of landforms below. Match each statement with the correct landform, <strong>A-E</strong>. <em>You may use any letter more than once.</em>',
            bank: bank(['barchan dunes', 'seif dunes', 'transverse dunes', 'draas', 'parabolic dunes']),
            questions: [
              q(1, 'can be several kilometres long and may have smaller dunes on top of them', 'D', 'Paragraph D: "A draa is a very large aeolian landform, with a length of several kilometres and a height of tens to hundreds of meters, and which may have superimposed dunes."', 'D'),
              q(2, 'take their name from a weapon', 'B', 'Paragraph J: "They are called seif dunes after the Arabic word for" sword.', 'J'),
              q(3, 'lie at right angles to the direction of the wind', 'C', 'Paragraph I: transverse dunes are "so called because they lie transverse, or across, the wind direction, with the wind blowing perpendicular to the ridge crest".', 'I'),
              q(4, 'are crescent-shaped and created by wind coming steadily from one direction', 'A', 'Paragraph G: "Barchan dunes are crescent-shaped mounds" and "These dunes form under winds that blow consistently from one direction".', 'G'),
              q(5, 'are produced by winds from two directions', 'B', 'Paragraph K: "Seif dunes are associated with bidirectional winds."', 'K'),
            ],
          },
          {
            id: 'r116-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Dunes occur only in desert regions.', 'FALSE', 'Paragraph B: "sand deposits are not restricted to deserts, and dunes are also found along sea shores, along streams in semiarid climates, in areas of glacial outwash".', 'B'),
              q(7, 'People sometimes build dunes to protect the coast.', 'TRUE', 'Paragraph C: "Artificial dunes are sometimes constructed to protect coastal areas."', 'C'),
              q(8, 'The residents of Eucla were unhappy about their town being moved.', 'NOT GIVEN', 'Paragraph C says only that "the town of Eucla, Western Australia, had to be relocated in the 1890s because of dune drift" and gives no information about what the residents thought.', 'C'),
              q(9, 'Ripples are generally taller than dunes.', 'FALSE', 'Paragraph D: "Dunes are generally defined as greater than 7 cm tall and may have ripples, while ripples are deposits that are less than 3 cm tall."', 'D'),
            ],
          },
          {
            id: 'r116-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: table(
              ['Term', 'Meaning'],
              [
                ['dune field', 'a large dune {{q10}}'],
                ['erg (sand sea)', 'a broad, flat area covered with wind-blown sand, with little or no {{q11}}'],
                ['dune slack', 'the {{q12}} or trough between dunes'],
                ['saltation', 'the way sand {{q13}} up the stoss side of a dune'],
              ],
              'Dune terminology',
            ),
            questions: [
              q(10, null, 'complex', 'Paragraph A: "A large dune complex is called a dune field".', 'A'),
              q(11, null, 'vegetation', 'Paragraph A: "broad, flat regions covered with wind-swept sand or dunes, with little or no vegetation, are called ergs or sand seas".', 'A'),
              q(12, null, 'valley', 'Paragraph A: "The valley or trough between dunes is called a dune slack."', 'A'),
              q(13, null, 'bounces', 'Paragraph E: "Sand is pushed (creep) or bounces (saltation) up the stoss side, and slides down the lee side."', 'E'),
            ],
          },
        ],
      }),
    ],
  },
};
