// Vocably Reading 52 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-52',
  title: 'Reading 52: The Statues of Easter Island',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'moai', title: 'The Moai of Rapa Nui', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r52-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'More than half of the moai remain at the quarry where they were carved.', 'FALSE', 'Paragraph A: "Nearly half are still at Rano Raraku, the main moai quarry, but hundreds were transported from there".', 'A'),
              q(2, 'When Europeans first reached the island, the statues were still upright.', 'TRUE', 'Paragraph B: "The statues still gazed inland across their clan lands when Europeans first visited the island in 1722".', 'B'),
              q(3, 'The tallest moai that was ever erected was also the heaviest.', 'FALSE', 'Paragraph C: "The heaviest moai erected was a shorter but squatter moai at Ahu Tongariki".', 'C'),
              q(4, 'The statues were carved by a specialised group of craftsmen.', 'NOT GIVEN', 'Paragraph D explains the technique ("The human figures would be outlined in the rock wall first, then chipped away until only the image was left") but says nothing about who did the carving.', 'D'),
              q(5, 'Being buried protected some of the carvings on the statues from wearing away.', 'TRUE', 'Paragraph E: "observed to have markings that had been protected from erosion by their burial".', 'E'),
            ],
          },
          {
            id: 'r52-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to the writer, one reason people wrongly think the moai are only heads is that', [
                'many statues were deliberately carved without bodies.',
                'the best-known pictures show statues buried up to their shoulders.',
                'the heads were made separately from the bodies.',
                'early visitors to the island described only the heads.',
              ], 'B', 'Paragraph E: "many of the images for the island showing upright moai are of the statues on the slopes of Rano Raraku (many of which are buried to their shoulders)".', 'E'),
              mc(7, 'What did the builders do when the carving of a statue was complete?', [
                'They painted it with red pigment.',
                'They fitted it with eyes made of stone.',
                'They polished it with a piece of pumice.',
                'They moved it straight to the coast.',
              ], 'C', 'Paragraph G: "At the end of carving, the builders would rub the statue with pumice."', 'G'),
              mc(8, 'The great majority of moai were carved from', [
                'basalt.',
                'red scoria.',
                'trachyte.',
                'volcanic tuff.',
              ], 'D', 'Paragraph G: "All but 53 of the more than 900 moai known to date were carved from tuff (a compressed volcanic ash) from Rano Raraku".', 'G'),
              mc(9, 'The discovery made by Sergio Rapu Haoa and his team in 1979 showed that', [
                'every moai had once been given eyes.',
                'the eye sockets had been made to hold eyes of coral.',
                'the statues had originally been painted.',
                'the pupils of the eyes were made from white coral.',
              ], 'B', 'Paragraph I: "the hemispherical or deep elliptical eye sockets were designed to hold coral eyes with either black obsidian or red scoria pupils".', 'I'),
            ],
          },
          {
            id: 'r52-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(['Statue', 'Status', 'Height', 'Weight'], [
              ['Paro', 'tallest ever erected', 'almost 10 m', '{{q10}} tonnes'],
              ['statue at {{q11}}', 'heaviest ever erected', 'shorter than Paro', '86 tonnes'],
              ['unfinished sculpture', 'never completed', 'about {{q12}} m', '145–165 tonnes'],
              ['typical moai', '—', 'about 4 m', 'around {{q13}} tonnes'],
            ], 'The size of the moai'),
            questions: [
              q(10, null, '82', 'Paragraph C: "The tallest moai erected, called Paro, was almost 10 metres (33 ft) high and weighed 82 tonnes".', 'C'),
              q(11, null, 'Ahu Tongariki', 'Paragraph C: "The heaviest moai erected was a shorter but squatter moai at Ahu Tongariki, weighing 86 tonnes".', 'C'),
              q(12, null, '21', 'Paragraph C: "One unfinished sculpture, if completed, would be approximately 21 m (69 ft) tall".', 'C'),
              q(13, null, '12.5', 'Paragraph F: "These massive creations usually weigh around 12.5 tonnes (13.8 tons) each."', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
