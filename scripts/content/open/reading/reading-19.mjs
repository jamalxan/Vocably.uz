// Vocably Reading 19 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-19',
  title: 'Reading 19: The Bayeux Tapestry',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'bayeux-tapestry', title: 'The Bayeux Tapestry', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r19-people', type: 'matching_features', bankReusable: true,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-E</strong>. <em>NB You may use any letter more than once.</em>',
            bank: bank([
              'Bishop Odo of Bayeux',
              'Queen Matilda',
              'Scolland',
              'Lanfranc',
              'Howard B. Clarke',
            ]),
            questions: [
              q(1, 'is shown in the tapestry on several occasions', 'A', 'Paragraph C: "Bishop Odo of Bayeux, William\'s half-brother who appears four times".', 'C'),
              q(2, 'was traditionally believed in France to have had the tapestry made', 'B', 'Paragraph G: "French legend maintained the tapestry was commissioned and created by Queen Matilda, the powerful wife of William the Conqueror, and her ladies-in-waiting."', 'G'),
              q(3, 'governed England while the king was abroad', 'A', 'Paragraph G: Odo "also became Earl of Kent and, when William was absent in Normandy, regent of England".', 'G'),
              q(4, 'had earlier been in charge of a famous centre of manuscript illumination', 'C', 'Paragraph I: Scolland is proposed as designer "because of his previous position as head of the scriptorium at Mont-Saint-Michel (famed for its illumination)".', 'I'),
              q(5, 'held a senior church post in Canterbury in the 1070s and 1080s', 'D', 'Paragraph I: "Christine Grainge has argued that the designer may have been Lanfranc, Archbishop of Canterbury 1070–1089."', 'I'),
            ],
          },
          {
            id: 'r19-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The earliest surviving written mention of the tapestry dates from the eleventh century.', 'FALSE', 'Paragraph A: "the earliest known written reference to it was in 1476".', 'A'),
              q(7, 'The tapestry was made using several different kinds of stitch.', 'TRUE', 'Paragraph B: "It was worked in wool thread on a coarse linen ground using four different stitches and ten natural dye colours."', 'B'),
              q(8, 'Part of the tapestry was destroyed during the French Revolution.', 'FALSE', 'Paragraph E: the tapestry was kept in the cathedral treasury, "narrowly escaping destruction during the French Revolution".', 'E'),
              q(9, 'The 2026 exhibition in London attracted record numbers of visitors.', 'NOT GIVEN', 'Paragraph F says the tapestry went "on loan to the British Museum in London while the Bayeux museum underwent renovation", but gives no information about visitor numbers.', 'F'),
            ],
          },
          {
            id: 'r19-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Where was the tapestry made?</strong></p><p>Most scholars now believe that the tapestry was commissioned by Odo and produced in England, probably in or close to {{q10}}. Its style resembles the {{q11}} created in the monasteries of that city, the Latin text shows traces of Anglo-Saxon, and the plant-based {{q12}} used are found in cloth traditionally woven in England. The stitching itself was most likely done by {{q13}}, since English needlework was admired throughout Europe at the time.</p>',
            questions: [
              q(10, null, 'Canterbury', 'Paragraph H: "most contemporary scholars arguing that it was probably made in or around Canterbury".', 'H'),
              q(11, null, 'illuminated manuscripts', 'Paragraph H: "it is similar to illuminated manuscripts made in monastic libraries there or owned by them".', 'H'),
              q(12, null, ['dyes', 'vegetable dyes'], 'Paragraph H: "the vegetable dyes can be found in cloth traditionally woven there".', 'H'),
              q(13, null, ['women', 'women needleworkers', 'needleworkers'], 'Paragraph I: "The actual physical work of stitching was most probably undertaken by women needleworkers."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
