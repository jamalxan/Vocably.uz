// Vocably Reading 62 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-62',
  title: 'Reading 62: Microplastics',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'microplastics', title: 'Microplastics: Tiny Particles, Big Problem', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r62-head', type: 'matching_headings',
            instructionHtml: 'The passage has eleven paragraphs, A-K. Choose the correct heading for paragraphs B, F, H, I and J from the list of headings below.',
            bank: bank([
              'A prediction about the future weight of plastic in the sea',
              'Two categories of microplastic and where each comes from',
              'Health risks to people who eat contaminated fish',
              'The origin of a scientific term',
              'Particles made on purpose and their industrial uses',
              'Methods for removing microplastics from the ocean',
              'How large pieces of plastic break into ever smaller ones',
              'Everyday products that shed plastic as they are used',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'ii', 'Paragraph B: "Two classifications of microplastics are currently recognized", primary and secondary, with examples of each.', 'B'),
              q(2, 'Paragraph F', 'iv', 'Paragraph F: the term "has been widely attributed to a 2004 paper by Professor Richard Thompson" but was used earlier.', 'F'),
              q(3, 'Paragraph H', 'v', 'Paragraph H: "Primary microplastics are small pieces of plastic that are purposefully manufactured", used in cosmetics and "air-blasting technology".', 'H'),
              q(4, 'Paragraph I', 'vii', 'Paragraph I: "This process of breaking down large plastic material into much smaller pieces is known as fragmentation."', 'I'),
              q(5, 'Paragraph J', 'viii', 'Paragraph J: "Microplastic fibers enter the environment as a by-product during wear and tear and from the washing of synthetic clothing", and tyres "erode into tiny plastic and rubber particles as they are used".', 'J'),
            ],
          },
          {
            id: 'r62-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'It is expected that by the middle of this century the sea will hold more microplastic than fish, measured by weight.', 'TRUE', 'Paragraph C: "by 2050, the weight of microplastics in the sea will exceed that of the fish".', 'C'),
              q(7, 'Microplastics have been found to make soil ecosystems healthier.', 'FALSE', 'Paragraph D: "microplastics have been demonstrated to lower the viability of soil ecosystems".', 'D'),
              q(8, 'Nanoplastics can be detected with an ordinary microscope.', 'NOT GIVEN', 'Paragraph E only states that "Nanoplastics cannot be seen by the human eye"; nothing is said about microscopes.', 'E'),
              q(9, 'The word microplastics was invented in 2004.', 'FALSE', 'Paragraph F: "there are examples of the term being used in relation to marine pollution dating back to the early 1990s".', 'F'),
              q(10, 'A Norwegian report argued that material from clothing and tyres should be counted as primary microplastics.', 'TRUE', 'Paragraph K: the review "stated it would be beneficial to classify these sources as primary".', 'K'),
            ],
          },
          {
            id: 'r62-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Primary and secondary microplastics</strong></p><p>Primary microplastics are produced deliberately. Apart from their use in cosmetics, they have occasionally been reported as carriers for {{q11}} in medicine. In facial scrubs they have taken the place of natural materials such as oatmeal and {{q12}}. In air-blasting, they are fired at engines and boat hulls to strip off {{q13}} and paint, and with repeated use they can become contaminated with heavy metals such as cadmium and lead. Secondary microplastics, by contrast, form when sunlight and other forces wear down larger debris; the irregular shapes of most particles suggest that {{q14}} is a major source.</p>',
            questions: [
              q(11, null, 'drugs', 'Paragraph H: "their use in medicine as vectors for drugs was reported".', 'H'),
              q(12, null, 'pumice', 'Paragraph H: "natural ingredients, including ground almond shells, oatmeal, and pumice".', 'H'),
              q(13, null, 'rust', 'Paragraph H: "at machinery, engines, and boat hulls to remove rust and paint".', 'H'),
              q(14, null, 'fragmentation', 'Paragraph I: "The prevalence of microplastics with uneven shapes suggests that fragmentation is a key source."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
