// Vocably Reading 59 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-59',
  title: 'Reading 59: Fjords',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'fjord', title: 'Fjords: Valleys Drowned by the Sea', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r59-endings', type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, <strong>A-G</strong>, below.',
            bank: bank([
              'spread out and lost much of their power to erode.',
              'believed that movements of the Earth\'s crust had created fjords.',
              'may have cut the valleys that later directed the flow of the glaciers.',
              'proposed that fjords had been formed by glaciers.',
              'measured the depth of Sognefjorden for the first time.',
              'showed that thresholds are made of sand and gravel.',
              'carved the deepest basins where tributaries met.',
            ]),
            questions: [
              q(1, 'Jens Esmark', 'D', 'Paragraph B: "In the 19th century, Jens Esmark introduced the theory that fjords are or have been created by glaciers".', 'B'),
              q(2, 'John Walter Gregory', 'B', 'Paragraph B: "John Walter Gregory argued that fjords are of tectonic origin and that glaciers had a negligible role in their formation."', 'B'),
              q(3, 'Rivers that existed before the ice age', 'C', 'Paragraph B: "Preglacial, Tertiary rivers presumably eroded the surface and created valleys that later guided the glacial flow and erosion of the bedrock."', 'B'),
              q(4, 'Close to the coast, the glaciers of western Norway', 'A', 'Paragraph C: "the typical West Norwegian glacier spread out (presumably through sounds and low valleys) and lost their concentration and reduced the glaciers\' power to erode".', 'C'),
            ],
          },
          {
            id: 'r59-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'Norway\'s coastline would be far shorter if its fjords were left out of the measurement.', 'TRUE', 'Paragraph A: "Norway\'s coastline is estimated to be 29,000 km (18,000 mi) long with its nearly 1,200 fjords, but only 2,500 km (1,600 mi) long when excluding the fjords".', 'A'),
              q(6, 'Gregory\'s ideas were accepted by the researchers who came after him.', 'FALSE', 'Paragraph B: "Gregory\'s views were rejected by subsequent research and publications."', 'B'),
              q(7, 'The direction of Sognefjord follows the fold pattern of the surrounding rock.', 'FALSE', 'Paragraph B: "there is no clear relation between the direction of Sognefjord and the fold pattern".', 'B'),
              q(8, 'The waterfalls that fall from hanging valleys are a major tourist attraction.', 'NOT GIVEN', 'Paragraph D says "Often, waterfalls form at or near the outlet of the upper valley" and that they "are also used as freshwater resources", but there is no mention of tourism.', 'D'),
              q(9, 'The deep water of Bolstadfjorden contains very little oxygen.', 'TRUE', 'Paragraph E: "The deeper, salt layers of Bolstadfjorden are deprived of oxygen and the seabed is covered with organic material."', 'E'),
            ],
          },
          {
            id: 'r59-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'How deep is the threshold at the mouth of Bolstadfjorden?', ['1.5 m', '1.5 metres', '1.5'], 'Paragraph C: "Bolstadfjorden is 160 m (520 ft) deep with a threshold of only 1.5 m (4 ft 11 in)".', 'C'),
              q(11, 'What is the name of the deepest basin in Hardangerfjord?', ['Samlafjorden'], 'Paragraph C: "The deepest basin Samlafjorden between Jonaneset (Jondal) and Ålvik".', 'C'),
              q(12, 'Which river supplies Bolstadfjorden with large amounts of fresh water?', ['Vosso', 'Vosso river', 'the Vosso river'], 'Paragraph E: "strong inflow of freshwater from Vosso river creates a brackish surface that blocks circulation of the deep fjord".', 'E'),
              q(13, 'Which fjord is named as one that freezes over and has no oxygen beneath its surface?', ['Drammensfjorden'], 'Paragraph F: "the fjord freezes over such that there is no oxygen below the surface. Drammensfjorden is one example."', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
