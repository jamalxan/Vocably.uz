// Vocably Reading 111 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-111',
  title: 'Reading 111: Rainwater Harvesting',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'rainwater-harvesting', title: 'Catching the Rain', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r111-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Write the correct letter, A-J.</em>',
            questions: [
              q(1, 'a judgement that another method offered better value for money than rainwater harvesting', 'H', 'Paragraph H: "it was deemed that rainwater harvesting was a less efficient use of financial resources to increase sustainability than the park\'s blackwater recycling program".', 'H'),
              q(2, 'a reference to an ancient civilisation whose water systems influenced modern designs', 'B', 'Paragraph B: "Civilizations such as the Romans developed extensive water collection systems, including aqueducts and rooftop channels, which laid the groundwork for many of the modern gutter-based systems still in use today."', 'B'),
              q(3, 'a way of speeding up the movement of water into the ground using a technique borrowed from mining', 'J', 'Paragraph J: percolation "can be enhanced artificially manyfold by loosening the subsoil strata by using ANFO explosives as used in open cast mining".', 'J'),
              q(4, 'how infrastructure built for one purpose can also serve another without losing its original function', 'I', 'Paragraph I: "optimized real-time control lets this infrastructure double as a source of rainwater harvesting without compromising the existing detention capacity".', 'I'),
              q(5, 'details of how much a large harvesting system cost to install', 'G', 'Paragraph G: "The cost of the system was 1.5 million dm (US$63,000) in 1993."', 'G'),
            ],
          },
          {
            id: 'r111-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Rainwater harvesting systems can only be built for individual households.', 'FALSE', 'Paragraph B: "Installations can be designed for different scales, including households, neighbourhoods, and communities".', 'B'),
              q(7, 'In parts of Australia, harvested rainwater is used for drinking.', 'TRUE', 'Paragraph C: "areas in Australia use harvested rainwater for cooking and drinking".', 'C'),
              q(8, 'Research in India found that rainwater harvesting was most useful for large farms.', 'FALSE', 'Paragraph C: studies "found it most beneficial for small-scale irrigation, which provides income from produce sales, and for groundwater recharge".', 'C'),
              q(9, 'The missions to the Caribbean were paid for by the United Nations.', 'NOT GIVEN', 'Paragraph E says that "Missions to five Caribbean countries have shown that the capture and storage of rainwater runoff for later use" reduces the risk of losing a harvest, but gives no information about who funded them.', 'E'),
            ],
          },
          {
            id: 'r111-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Two large-scale examples</strong></p><ul><li><strong>Frankfurt Airport</strong> (the biggest system in Germany)<ul><li>saves roughly {{q10}} cubic metres of water every year</li><li>collects water from the roofs of the new terminal, which cover {{q11}} square metres</li><li>water mainly used for flushing toilets, watering plants and cleaning the {{q12}} system</li></ul></li><li><strong>The Velodrome, London Olympic Park</strong><ul><li>expected to cut the park\'s demand for drinking water by {{q13}}</li></ul></li></ul>',
            questions: [
              q(10, null, ['1 million', 'one million'], 'Paragraph G: "saving approximately 1 million cubic meters of water per year".', 'G'),
              q(11, null, ['26,800', '26800'], 'Paragraph G: "the roofs of the new terminal which has an area of 26,800 square meters".', 'G'),
              q(12, null, 'air conditioning', 'Paragraph G: "The water is mainly used for toilet flushing, watering plants and cleaning the air conditioning system."', 'G'),
              q(13, null, ['73%', '73 percent'], 'Paragraph H: "A 73% decrease in potable water demand by the park was estimated."', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
