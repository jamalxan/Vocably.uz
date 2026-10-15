// Vocably Reading 66 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-66',
  title: 'Reading 66: The Suez Canal',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'suez-canal', title: 'The Suez Canal', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r66-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Building the canal took a decade.', 'TRUE', 'Paragraph B: "Construction of the canal lasted from 1859 to 1869".', 'B'),
              q(2, 'Ships have to pass through a series of locks on their way along the canal.', 'FALSE', 'Paragraph C: the canal "contained, according to Alois Negrelli\'s plans, no locks, with seawater flowing freely through it".', 'C'),
              q(3, 'Water movement in the southern section of the canal is affected by the tide.', 'TRUE', 'Paragraph C: "South of the lakes, the current changes with the tide at Suez."', 'C'),
              q(4, 'The 2014 expansion project was financed mainly by foreign investors.', 'FALSE', 'Paragraph E: it "was funded with interest-bearing investment certificates issued exclusively to Egyptian entities and individuals".', 'E'),
              q(5, 'The side channel opened in 2016 was built by a foreign construction company.', 'NOT GIVEN', 'Paragraph F says "The Suez Canal Authority officially opened the new side channel in 2016" but does not say who built it.', 'F'),
            ],
          },
          {
            id: 'r66-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The modern canal</strong></p><ul><li>length: {{q6}} km</li><li>joins the Mediterranean to the {{q7}}</li><li>cuts the voyage from the Arabian Sea to London by about {{q8}} km</li><li>runs from {{q9}} in the north to Port Tewfik in the south</li><li>2021: average of {{q10}} ships per day</li></ul>',
            questions: [
              q(6, null, '193.3', 'Paragraph A: "The 193.3-kilometre-long (120.1-mile) canal is a key trade route between Europe and Asia."', 'A'),
              q(7, null, 'Red Sea', 'Paragraph A: "connecting the Mediterranean Sea to the Red Sea through the Isthmus of Suez".', 'A'),
              q(8, null, ['8,900', '8900'], 'Paragraph B: "reducing the journey distance from the Arabian Sea to London by approximately 8,900 km".', 'B'),
              q(9, null, 'Port Said', 'Paragraph B: "The canal extends from the northern terminus of Port Said to the southern terminus of Port Tewfik".', 'B'),
              q(10, null, '56', 'Paragraph B: "In 2021, more than 20,600 vessels traversed the canal (an average of 56 per day)."', 'B'),
            ],
          },
          {
            id: 'r66-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(11, 'Before 2016, why could ships not dock at the East Container Terminal while a convoy was passing?', ['The water at the terminal was too shallow.', 'The terminal was situated on the canal itself.', 'Convoys had legal priority over all other traffic.', 'The terminal was closed to large vessels.'], 'B', 'Paragraph F: "As the East Container Terminal is located on the Canal itself, before the construction of the new side channel, it was not possible to berth or unberth vessels at the terminal while a convoy was running."', 'F'),
              mc(12, 'Which ruler is credited with completing the only fully working canal in ancient times?', ['Senusret II', 'Necho II', 'Darius I', 'Ramesses II'], 'C', 'Paragraph G: "the only fully functional canal was engineered and completed by Darius I (522–486 BCE)".', 'G'),
              mc(13, 'According to paragraph J, why did the ancient kings stop digging their canal?', ['They ran out of money.', 'Sand kept filling in the channel.', 'The region was invaded by enemies.', 'They feared sea water would spoil the river.'], 'D', 'Paragraph J: "he found that the sea was higher than the land" and they stopped "lest the sea should mix with the river water and spoil it".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
